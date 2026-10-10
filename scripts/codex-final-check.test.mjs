import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  DISABLED_FEATURES,
  EXIT_TIMEOUT,
  TIMEOUT_MS,
  buildCodexArgs,
  findUnexpectedCodexFiles,
  runWithTimeout,
  validateArgs,
} from "./codex-final-check.mjs";

test("accepts a single origin base branch", () => {
  assert.deepEqual(validateArgs(["origin/main"]), { ok: true, base: "origin/main" });
  assert.deepEqual(validateArgs(["origin/release/1.2"]), { ok: true, base: "origin/release/1.2" });
});

test("rejects extra arguments so sandbox flags cannot be appended", () => {
  assert.equal(validateArgs(["origin/main", "--dangerously-bypass-approvals-and-sandbox"]).ok, false);
  assert.equal(validateArgs(["origin/main", "-s", "workspace-write"]).ok, false);
  assert.equal(validateArgs([]).ok, false);
});

test("rejects bases that are flags, local branches, or ranges", () => {
  for (const base of ["--add-dir=/", "main", "origin/main..HEAD", "origin/-x", "origin/main;ls", "origin/main\n"]) {
    assert.equal(validateArgs([base]).ok, false, base);
  }
});

test("always runs codex exec in the read-only sandbox", () => {
  const args = buildCodexArgs("origin/main", "/tmp/out.md");
  assert.deepEqual(args.slice(0, 3), ["exec", "--sandbox", "read-only"]);
  assert.ok(args.includes("--ignore-rules"), "execpolicy allow rules would run commands outside the sandbox");
  assert.ok(args.includes('approval_policy="never"'));
  assert.ok(args.includes("--ignore-user-config"), "user MCP servers and plugins run outside the sandbox");
  assert.ok(args.includes('web_search="disabled"'));
  for (const feature of [
    "apps",
    "browser_use",
    "browser_use_full_cdp_access",
    "computer_use",
    "hooks",
    "in_app_local_automation",
    "plugins",
    "remote_plugin",
    "skill_mcp_dependency_install",
  ]) {
    assert.ok(DISABLED_FEATURES.includes(feature), feature);
    assert.equal(args[args.indexOf(feature) - 1], "--disable", feature);
  }
  assert.ok(args.at(-1).includes("origin/main...HEAD"));
  assert.ok(!args.some((arg) => arg.startsWith("--dangerously")));
});

test("a timeout has its own exit code so the caller can retry it once", () => {
  assert.ok(TIMEOUT_MS > 0);
  assert.ok(![0, 1, 2].includes(EXIT_TIMEOUT));
});

test("refuses to run when codex config or instructions are added to the repository root", () => {
  const present = new Set(["/repo/AGENTS.override.md", "/repo/.agents", "/repo/personal-conventions.md"]);
  assert.deepEqual(findUnexpectedCodexFiles("/repo", (file) => present.has(file)), [
    "AGENTS.override.md",
    ".agents",
    "personal-conventions.md",
  ]);
  assert.deepEqual(findUnexpectedCodexFiles("/repo", () => false), []);
});

const isAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

test("passes the exit status through when codex finishes in time", async () => {
  const listeners = () => ["SIGTERM", "SIGINT", "SIGHUP"].map((signal) => process.listenerCount(signal));
  const before = listeners();
  const result = await runWithTimeout(process.execPath, ["-e", "process.exit(4)"], {
    stdio: "ignore",
    timeoutMs: 5000,
    exitOnSignal: true,
  });
  assert.equal(result.timedOut, false);
  assert.equal(result.status, 4);
  assert.deepEqual(listeners(), before, "signal handlers are removed so Ctrl-C works again afterwards");
});

test("a timeout kills the whole process group, even processes that ignore SIGTERM", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "codex-timeout-test-"));
  const pidFile = path.join(dir, "grandchild.pid");
  const grandchild = "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000);";
  const child = [
    'const { spawn } = require("node:child_process");',
    'process.on("SIGTERM", () => {});',
    `const g = spawn(process.execPath, ["-e", ${JSON.stringify(grandchild)}], { stdio: "ignore" });`,
    `require("node:fs").writeFileSync(${JSON.stringify(pidFile)}, String(g.pid));`,
    "setInterval(() => {}, 1000);",
  ].join("\n");
  try {
    const started = Date.now();
    const result = await runWithTimeout(process.execPath, ["-e", child], {
      stdio: "ignore",
      timeoutMs: 2000,
      graceMs: 200,
    });
    assert.equal(result.timedOut, true);
    assert.ok(Date.now() - started < 5000, "the grace period ends in SIGKILL instead of waiting");

    const grandchildPid = Number(readFileSync(pidFile, "utf8"));
    const deadline = Date.now() + 3000;
    while (isAlive(grandchildPid) && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert.equal(isAlive(grandchildPid), false, "processes codex started are killed with it");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

const waitFor = async (condition, ms = 5000) => {
  const deadline = Date.now() + ms;
  while (!condition() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return condition();
};

test("stopping the script also kills codex's process group instead of leaving it without a deadline", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "codex-signal-test-"));
  const pidFile = path.join(dir, "child.pid");
  const runner = path.join(dir, "runner.mjs");
  const moduleUrl = new URL("./codex-final-check.mjs", import.meta.url).href;
  const child = `require("node:fs").writeFileSync(${JSON.stringify(pidFile)}, String(process.pid)); setInterval(() => {}, 1000);`;
  writeFileSync(
    runner,
    `import { runWithTimeout } from ${JSON.stringify(moduleUrl)};\n` +
      `await runWithTimeout(process.execPath, ["-e", ${JSON.stringify(child)}], ` +
      `{ stdio: "ignore", timeoutMs: 60000, exitOnSignal: true });\n`,
  );
  try {
    const script = spawn(process.execPath, [runner], { stdio: "ignore" });
    const exited = new Promise((resolve) => script.on("close", (status) => resolve(status)));
    assert.ok(await waitFor(() => existsSync(pidFile)), "the child started");
    const childPid = Number(readFileSync(pidFile, "utf8"));

    script.kill("SIGTERM");
    assert.equal(await exited, 128 + 15);
    assert.equal(await waitFor(() => !isAlive(childPid), 3000), true, "codex is killed with the script");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a command that cannot start is reported as an error, not a timeout", async () => {
  const result = await runWithTimeout("codex-final-check-missing-command", [], { stdio: "ignore", timeoutMs: 5000 });
  assert.equal(result.timedOut, false);
  assert.equal(result.error?.code, "ENOENT");
});
