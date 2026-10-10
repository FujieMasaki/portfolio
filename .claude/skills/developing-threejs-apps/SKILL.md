---
name: developing-threejs-apps
description: Audits Three.js / React Three Fiber code for quality, safety, and performance — dispose and memory leaks, texture management, color space, tone mapping, renderer settings, and Three.js version differences. Use for reviews, debugging leaks or color issues, and pre-ship checks; for ordinary R3F implementation, use the r3f-* skills instead.
---

# Three.js Development Skill

## Before Writing Code (Required)

1. **Detect repo setup** - Do not guess:
   - Framework: vanilla / React (R3F) / Vue / Svelte / Next.js
   - Bundler: Vite / Webpack / Next / custom
   - Three.js revision: check `node_modules/three/package.json`
   - Import style: `three/addons/...` or `three/examples/jsm/...`

2. **Run repo audit** (recommended):
   ```bash
   node scripts/three-doctor.mjs
   ```

3. **Identify lifecycle ownership**:
   - Where is the render loop?
   - What triggers mount/unmount?
   - Are there route transitions or XR loops?

## Core Rules

### Lifecycle Contract

Every Three.js integration MUST have:
- **Init**: renderer, scene, camera → attach to canvas
- **Resize**: renderer + camera + composer + DPR cap
- **Loop**: `requestAnimationFrame` or `setAnimationLoop` (XR)
- **Teardown**: stop loop, remove listeners, dispose ALL GPU resources

Target API: `createThreeApp(canvas) → { resize(), update(dt), render(), dispose() }`

### Color and Postprocessing

- Direct rendering → renderer output settings apply
- EffectComposer (WebGL) → OutputPass handles tone mapping; passes needing sRGB (e.g., FXAA) go AFTER OutputPass
- WebGL and WebGPU postprocessing stacks differ — do not mix

### Assets

- Prefer glTF/GLB
- Enable DRACO/KTX2/meshopt only if already used or required
- Color textures → sRGB; data textures (normal, roughness) → linear

### Safety

- No network commands without explicit request
- No dependency changes without verification plan
- Match existing repo patterns

## What NOT to Do

- Rewrite architecture or switch frameworks unless requested
- Add dependencies when Three.js built-ins suffice
- Global style/formatting changes — keep diffs minimal

## Quick Reference

### Copy/Paste Patterns
→ [examples.md](examples.md)

### Step-by-Step Guides
→ [playbooks.md](playbooks.md)

### Pre-Ship Checklist
→ [quality-gates.md](quality-gates.md)

## Deep Reference (Load on Demand)

**Fundamentals:**
- [Workflow and repo discovery](reference/workflow.md)
- [Render loop and lifecycle](reference/rendering-loop-and-lifecycle.md)
- [Framework integration (R3F, Vue, etc.)](reference/integration-patterns.md)

**Rendering:**
- [Color management](reference/color-management.md)
- [Postprocessing WebGL](reference/postprocessing-webgl.md)
- [Postprocessing WebGPU](reference/postprocessing-webgpu.md)
- [Lighting and shadows](reference/lighting-and-shadows.md)
- [Transparency and ordering](reference/transparency-and-ordering.md)

**Assets:**
- [glTF, textures, environment](reference/assets-and-gltf.md)
- [Asset pipeline optimization](reference/asset-pipeline-optimization.md)

**Performance:**
- [Performance and memory](reference/performance-and-memory.md)
- [Instancing and batching](reference/instancing-and-batching.md)
- [Stutter and precompilation](reference/stutter-and-precompile.md)
- [Observability and profiling](reference/observability-and-profiling.md)

**Shaders:**
- [GLSL and onBeforeCompile](reference/shaders-glsl.md)
- [Node materials / TSL](reference/shaders-nodes-tsl.md)

**Other:**
- [Interaction and picking](reference/interaction-and-picking.md)
- [Scene graph and precision](reference/scene-graph-and-precision.md)
- [Deployment and SSR](reference/deployment-and-ssr.md)
- [Testing and regressions](reference/testing-and-regressions.md)
- [Versioning and migrations](reference/versioning-and-migrations.md)
- [WebGPU adoption](reference/webgpu-adoption.md)
- [Debugging and tooling](reference/debugging-and-tooling.md)

## Scripts

Run without loading source — prefer execution over reading:
- `scripts/three-doctor.mjs` — repo pattern audit
- `scripts/asset-audit.mjs` — asset size report
