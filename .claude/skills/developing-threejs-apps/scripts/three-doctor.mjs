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

const CODE_EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);

function isCodeFile(p) {
  return CODE_EXTS.has(path.extname(p));
}

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
  for (let i = 0; i < 8; i++) {
    const pkg = path.join(dir, "package.json");
    if (await exists(pkg)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir);
}

async function readJson(p) {
  const txt = await fsp.readFile(p, "utf8");
  return JSON.parse(txt);
}

async function walk(dir, onFile) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (IGNORED_DIRS.has(ent.name)) continue;
      await walk(p, onFile);
    } else if (ent.isFile()) {
      if (isCodeFile(p)) await onFile(p);
    }
  }
}

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function uniq(arr) {
  return [...new Set(arr)];
}

async function main() {
  const argRoot = process.argv[2] || process.cwd();
  const repoRoot = await findRepoRoot(argRoot);

  const pkgPath = path.join(repoRoot, "package.json");
  let pkg = null;
  if (await exists(pkgPath)) {
    try {
      pkg = await readJson(pkgPath);
    } catch {}
  }

  const threePkgPath = path.join(repoRoot, "node_modules", "three", "package.json");
  let threeVersion = null;
  if (await exists(threePkgPath)) {
    try {
      const threePkg = await readJson(threePkgPath);
      threeVersion = threePkg.version || null;
    } catch {}
  } else if (pkg) {
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    if (deps.three) threeVersion = String(deps.three);
  }

  const deps = pkg ? { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) } : {};
  const hasR3F = Boolean(deps["@react-three/fiber"]);
  const hasDrei = Boolean(deps["@react-three/drei"]);
  const hasNext = Boolean(deps["next"]);
  const hasVite = Boolean(deps["vite"]);
  const hasReact = Boolean(deps["react"]);
  const hasSvelteKit = Boolean(deps["@sveltejs/kit"]);
  const hasVue = Boolean(deps["vue"]);

  const stats = {
    filesScanned: 0,
    importAddons: 0,
    importExamples: 0,
    newWebGLRenderer: 0,
    newWebGPURenderer: 0,
    usesEffectComposer: 0,
    usesOutputPass: 0,
    usesPMREMGenerator: 0,
    usesGLTFLoader: 0,
    usesDRACOLoader: 0,
    usesKTX2Loader: 0,
    usesMeshopt: 0,
    usesOutputEncoding: 0,
    usesOutputColorSpace: 0,
    usesTextureEncoding: 0,
    usesTextureColorSpace: 0,
    usesSetAnimationLoop: 0,
    usesRequestAnimationFrame: 0,
    usesResizeObserver: 0,
    usesSetPixelRatioDevicePixelRatio: 0,
    usesSetPixelRatioCap: 0,
  };

  const entryHits = [];

  const scanDirs = [
    "src",
    "app",
    "pages",
    "components",
    "public",
    "scripts",
    "lib",
  ]
    .map((d) => path.join(repoRoot, d))
    .filter((d) => fs.existsSync(d));

  const importAddonsRe = /three\/addons\//g;
  const importExamplesRe = /three\/examples\/jsm\//g;

  const newWebglRendererRe = /new\s+THREE\.WebGLRenderer\b|new\s+WebGLRenderer\b/g;
  const newWebgpuRendererRe = /new\s+WebGPURenderer\b/g;

  const effectComposerRe = /\bEffectComposer\b/g;
  const outputPassRe = /\bOutputPass\b/g;

  const pmremRe = /\bPMREMGenerator\b/g;
  const gltfLoaderRe = /\bGLTFLoader\b/g;
  const dracoLoaderRe = /\bDRACOLoader\b/g;
  const ktx2LoaderRe = /\bKTX2Loader\b/g;
  const meshoptRe = /\bmeshopt\b|\bMeshopt\b/g;

  const outputEncodingRe = /\boutputEncoding\b/g;
  const outputColorSpaceRe = /\boutputColorSpace\b/g;
  const textureEncodingRe = /\.encoding\b/g;
  const textureColorSpaceRe = /\.colorSpace\b/g;

  const setAnimationLoopRe = /\bsetAnimationLoop\b/g;
  const rafRe = /\brequestAnimationFrame\b/g;

  const resizeObserverRe = /\bResizeObserver\b/g;
  const setPixelRatioDeviceRe = /setPixelRatio\s*\(\s*(window\.)?devicePixelRatio\s*\)/g;
  const setPixelRatioCapRe = /setPixelRatio\s*\(\s*Math\.min\(\s*(window\.)?devicePixelRatio/g;

  async function scanFile(filePath) {
    const text = await fsp.readFile(filePath, "utf8");
    stats.filesScanned += 1;

    stats.importAddons += countMatches(text, importAddonsRe);
    stats.importExamples += countMatches(text, importExamplesRe);

    stats.newWebGLRenderer += countMatches(text, newWebglRendererRe);
    stats.newWebGPURenderer += countMatches(text, newWebgpuRendererRe);

    stats.usesEffectComposer += countMatches(text, effectComposerRe);
    stats.usesOutputPass += countMatches(text, outputPassRe);

    stats.usesPMREMGenerator += countMatches(text, pmremRe);
    stats.usesGLTFLoader += countMatches(text, gltfLoaderRe);
    stats.usesDRACOLoader += countMatches(text, dracoLoaderRe);
    stats.usesKTX2Loader += countMatches(text, ktx2LoaderRe);
    stats.usesMeshopt += countMatches(text, meshoptRe);

    stats.usesOutputEncoding += countMatches(text, outputEncodingRe);
    stats.usesOutputColorSpace += countMatches(text, outputColorSpaceRe);
    stats.usesTextureEncoding += countMatches(text, textureEncodingRe);
    stats.usesTextureColorSpace += countMatches(text, textureColorSpaceRe);

    stats.usesSetAnimationLoop += countMatches(text, setAnimationLoopRe);
    stats.usesRequestAnimationFrame += countMatches(text, rafRe);

    stats.usesResizeObserver += countMatches(text, resizeObserverRe);
    stats.usesSetPixelRatioDevicePixelRatio += countMatches(text, setPixelRatioDeviceRe);
    stats.usesSetPixelRatioCap += countMatches(text, setPixelRatioCapRe);

    // Heuristic: likely entry points.
    const rel = path.relative(repoRoot, filePath);
    if (/\b(main|index|app)\.(ts|tsx|js|jsx|mjs|cjs)$/.test(rel)) entryHits.push(rel);
  }

  for (const dir of scanDirs) {
    await walk(dir, scanFile);
  }

  const warnings = [];

  if (stats.importAddons > 0 && stats.importExamples > 0) {
    warnings.push("Mixed addon import styles detected: both `three/addons` and `three/examples/jsm`. Prefer one consistent style in a repo.");
  }

  if (stats.usesEffectComposer > 0 && stats.usesOutputPass === 0) {
    warnings.push("EffectComposer is referenced but OutputPass is not. Verify the repo’s output transform strategy to avoid incorrect colors or double transforms.");
  }

  if (stats.usesOutputPass > 0 && stats.usesEffectComposer === 0) {
    warnings.push("OutputPass is referenced but EffectComposer is not. Confirm this is intentional (some repos may have custom pipelines).");
  }

  if (stats.usesEffectComposer > 0 && stats.newWebGPURenderer > 0) {
    warnings.push("Both EffectComposer and WebGPURenderer are referenced. Ensure WebGL postprocessing code is not executed on the WebGPU path.");
  }

  if (stats.usesOutputEncoding > 0 && stats.usesOutputColorSpace > 0) {
    warnings.push("Both `outputEncoding` and `outputColorSpace` appear in the codebase. This can indicate partially migrated color management.");
  }

  if (stats.usesTextureEncoding > 0 && stats.usesTextureColorSpace > 0) {
    warnings.push("Both `texture.encoding` and `texture.colorSpace` appear. This can indicate partially migrated texture color management.");
  }

  if (stats.usesSetPixelRatioDevicePixelRatio > 0 && stats.usesSetPixelRatioCap === 0) {
    warnings.push("Found `renderer.setPixelRatio(devicePixelRatio)` without an obvious cap. Consider a DPR cap (commonly 1 to 2) for mobile and high DPI.");
  }

  if (stats.usesSetAnimationLoop > 0 && stats.usesRequestAnimationFrame > 0) {
    warnings.push("Both `setAnimationLoop` and `requestAnimationFrame` appear. Verify there is not more than one active render loop per canvas.");
  }

  if (hasR3F && stats.newWebGLRenderer > 0) {
    warnings.push("R3F dependency detected, but WebGLRenderer construction appears in code. This is fine in hybrid repos, but watch for duplicate render loops.");
  }

  if (hasNext && stats.newWebGLRenderer > 0) {
    warnings.push("Next.js detected. Ensure renderer construction happens only on the client (avoid SSR crashes).");
  }

  console.log("# Three.js Doctor Report");
  console.log("");
  console.log(`- Repo root: \`${repoRoot}\``);
  console.log(`- three version (best effort): \`${threeVersion ?? "unknown"}\``);
  console.log(`- Framework hints: react=${hasReact} r3f=${hasR3F} drei=${hasDrei} next=${hasNext} vite=${hasVite} sveltekit=${hasSvelteKit} vue=${hasVue}`);
  console.log("");
  console.log("## Scan summary");
  console.log("");
  console.log(`- Files scanned: ${stats.filesScanned}`);
  console.log(`- Import style: addons=${stats.importAddons} examples/jsm=${stats.importExamples}`);
  console.log(`- Renderer construction: new WebGLRenderer=${stats.newWebGLRenderer} new WebGPURenderer=${stats.newWebGPURenderer}`);
  console.log(`- PostFX symbols: EffectComposer=${stats.usesEffectComposer} OutputPass=${stats.usesOutputPass}`);
  console.log(`- Assets: GLTFLoader=${stats.usesGLTFLoader} DRACOLoader=${stats.usesDRACOLoader} KTX2Loader=${stats.usesKTX2Loader} meshopt=${stats.usesMeshopt}`);
  console.log(`- Environment: PMREMGenerator=${stats.usesPMREMGenerator}`);
  console.log(`- Color mgmt: outputEncoding=${stats.usesOutputEncoding} outputColorSpace=${stats.usesOutputColorSpace}`);
  console.log(`- Texture mgmt: .encoding=${stats.usesTextureEncoding} .colorSpace=${stats.usesTextureColorSpace}`);
  console.log(`- Loop APIs: setAnimationLoop=${stats.usesSetAnimationLoop} requestAnimationFrame=${stats.usesRequestAnimationFrame}`);
  console.log(`- Resize: ResizeObserver=${stats.usesResizeObserver}`);
  console.log("");

  if (warnings.length) {
    console.log("## Warnings");
    console.log("");
    for (const w of warnings) console.log(`- ${w}`);
    console.log("");
  } else {
    console.log("## Warnings");
    console.log("");
    console.log("- None detected by simple heuristics.");
    console.log("");
  }

  console.log("## Likely entry points (heuristic)");
  console.log("");
  const entries = uniq(entryHits).slice(0, 20);
  if (entries.length) {
    for (const e of entries) console.log(`- \`${e}\``);
  } else {
    console.log("- (No obvious entry point filenames found in scanned folders.)");
  }
  console.log("");

  console.log("## Suggested next steps");
  console.log("");
  console.log("- Confirm the active renderer path used at runtime (WebGL vs WebGPU).");
  console.log("- Confirm where the render loop is owned and ensure teardown is implemented.");
  console.log("- If visuals are wrong, isolate: direct render baseline, then re-enable postprocessing.");
  console.log("- If performance is the concern, log `renderer.info` and classify the bottleneck before optimizing.");
}

main().catch((err) => {
  console.error("three-doctor failed:", err?.stack || err);
  process.exitCode = 1;
});
