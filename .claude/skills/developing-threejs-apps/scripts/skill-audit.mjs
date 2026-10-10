#!/usr/bin/env node
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

async function exists(p) {
  try {
    await fsp.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function countLines(s) {
  // Keep behavior stable across platforms.
  return s.split(/\r?\n/).length;
}

function findMarkdownLinks(markdown) {
  // Very small parser: [text](path)
  const re = /\[[^\]]*\]\(([^)]+)\)/g;
  const out = [];
  let m;
  while ((m = re.exec(markdown)) !== null) out.push(m[1]);
  return out;
}

function isExternalLink(href) {
  return /^https?:\/\//.test(href) || href.startsWith("mailto:");
}

async function main() {
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const skillRoot = path.resolve(scriptDir, "..");

  const skillMdPath = path.join(skillRoot, "SKILL.md");
  if (!(await exists(skillMdPath))) {
    console.error("ERROR: SKILL.md not found at:", skillMdPath);
    process.exitCode = 1;
    return;
  }

  const skillMd = await fsp.readFile(skillMdPath, "utf8");
  const skillLines = countLines(skillMd);

  const errors = [];
  const warnings = [];

  if (skillLines > 500) {
    warnings.push(`SKILL.md is ${skillLines} lines. Best practice is under 500 lines.`);
  }

  // Validate that SKILL.md starts with frontmatter on line 1.
  if (!skillMd.startsWith("---\n") && !skillMd.startsWith("---\r\n")) {
    errors.push("SKILL.md does not start with YAML frontmatter delimiter '---' on line 1.");
  }

  // Validate links from SKILL.md exist (local files).
  const links = findMarkdownLinks(skillMd).filter((h) => !isExternalLink(h));
  for (const href of links) {
    // Skip anchors.
    const clean = href.split("#")[0].trim();
    if (!clean) continue;
    if (clean.startsWith("/")) continue; // repo-absolute is ambiguous, ignore
    const target = path.resolve(skillRoot, clean);
    if (!(await exists(target))) errors.push(`Missing file referenced from SKILL.md: ${clean}`);
  }

  // Best practice: avoid nested references. Warn if reference files link to other local markdown files.
  const refDir = path.join(skillRoot, "reference");
  if (await exists(refDir)) {
    const refFiles = (await fsp.readdir(refDir))
      .filter((f) => f.toLowerCase().endsWith(".md"))
      .map((f) => path.join(refDir, f));

    for (const file of refFiles) {
      const txt = await fsp.readFile(file, "utf8");
      const hrefs = findMarkdownLinks(txt)
        .map((h) => h.split("#")[0].trim())
        .filter((h) => h && !isExternalLink(h));

      for (const href of hrefs) {
        // If reference files link to other docs in the skill, that is a nested reference risk.
        if (href.endsWith(".md") && !href.startsWith("http")) {
          warnings.push(`Nested reference risk: ${path.relative(skillRoot, file)} links to ${href}. Prefer linking all reference files directly from SKILL.md.`);
        }
      }
    }
  }

  console.log("# Skill Audit Report");
  console.log("");
  console.log(`- Skill root: ${skillRoot}`);
  console.log(`- SKILL.md lines: ${skillLines}`);
  console.log("");

  if (errors.length) {
    console.log("## Errors");
    for (const e of errors) console.log(`- ${e}`);
    console.log("");
  }

  if (warnings.length) {
    console.log("## Warnings");
    for (const w of warnings) console.log(`- ${w}`);
    console.log("");
  }

  if (!errors.length && !warnings.length) {
    console.log("## Result");
    console.log("- OK");
  }

  if (errors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error("skill-audit failed:", err?.stack || err);
  process.exitCode = 1;
});
