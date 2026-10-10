#!/usr/bin/env node
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".svelte-kit",
  ".turbo",
  ".cache",
  "coverage",
]);

const ASSET_EXTS = new Set([
  ".glb",
  ".gltf",
  ".bin",
  ".hdr",
  ".ktx2",
  ".basis",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".tga",
  ".exr",
]);

async function exists(p) {
  try {
    await fsp.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function findRepoRoot(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 6; i++) {
    const pkg = path.join(dir, "package.json");
    if (await exists(pkg)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir);
}

function isAssetFile(p) {
  return ASSET_EXTS.has(path.extname(p).toLowerCase());
}

async function walk(dir, out) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (IGNORED_DIRS.has(ent.name)) continue;
      await walk(p, out);
    } else if (ent.isFile()) {
      if (!isAssetFile(p)) continue;
      try {
        const st = await fsp.stat(p);
        out.push({ path: p, size: st.size, ext: path.extname(p).toLowerCase() });
      } catch {
        // ignore unreadable files
      }
    }
  }
}

function formatBytes(n) {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let x = n;
  while (x >= 1024 && i < units.length - 1) {
    x /= 1024;
    i++;
  }
  return `${x.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function groupKey(ext) {
  if (ext === ".glb" || ext === ".gltf" || ext === ".bin") return "3d-model";
  if (ext === ".hdr" || ext === ".exr") return "hdr";
  if (ext === ".ktx2" || ext === ".basis") return "gpu-compressed";
  return "image";
}

async function main() {
  const argRoot = process.argv[2] || process.cwd();
  const repoRoot = await findRepoRoot(argRoot);

  const candidates = [
    "public",
    "static",
    "assets",
    "src/assets",
    "src/public",
  ]
    .map((d) => path.join(repoRoot, d))
    .filter((d) => fs.existsSync(d));

  const files = [];
  for (const dir of candidates) {
    await walk(dir, files);
  }

  files.sort((a, b) => b.size - a.size);

  const topN = 30;
  const grouped = new Map();
  let total = 0;

  for (const f of files) {
    total += f.size;
    const k = groupKey(f.ext);
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k).push(f);
  }

  console.log("# Asset Audit Report");
  console.log("");
  console.log(`- Repo root: \`${repoRoot}\``);
  console.log(`- Scan roots: ${candidates.length ? candidates.map((d) => `\`${path.relative(repoRoot, d)}\``).join(", ") : "(none found)"}`);
  console.log(`- Asset files found: ${files.length}`);
  console.log(`- Total size (these files only): ${formatBytes(total)}`);
  console.log("");

  if (!files.length) {
    console.log("No assets found in the default scan roots. If your repo stores assets elsewhere, pass a repo root path or adjust scan roots in the script.");
    return;
  }

  console.log(`## Top ${Math.min(topN, files.length)} largest files`);
  console.log("");
  for (const f of files.slice(0, topN)) {
    console.log(`- ${formatBytes(f.size)}  \`${path.relative(repoRoot, f.path)}\``);
  }
  console.log("");

  console.log("## Group summary");
  console.log("");
  for (const [k, arr] of grouped.entries()) {
    const sum = arr.reduce((s, x) => s + x.size, 0);
    console.log(`- ${k}: ${arr.length} files, ${formatBytes(sum)}`);
  }
  console.log("");

  console.log("## Practical recommendations (heuristic)");
  console.log("");
  console.log("- Start with the largest textures. Reducing a few oversized images often saves more than mesh optimizations.");
  console.log("- Consider GPU-compressed textures (KTX2) when the platform and pipeline support it.");
  console.log("- Avoid shipping 4k textures unless they are truly needed at full resolution.");
  console.log("- If GLB files are large, review embedded textures and animation clips as they often dominate size.");
}

main().catch((err) => {
  console.error("asset-audit failed:", err?.stack || err);
  process.exitCode = 1;
});
