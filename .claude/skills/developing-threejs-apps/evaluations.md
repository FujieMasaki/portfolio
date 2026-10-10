# Skill Evaluations: developing-threejs-apps

These prompts validate that the Skill produces correct, repo-aware code changes with strong lifecycle and verification practices.

---

## Scoring rubric (0 to 2 each)

For each prompt, score:

- **Repo awareness**: reads relevant files and matches conventions
- **Version awareness**: detects Three.js revision and import style
- **Lifecycle correctness**: init/resize/loop/teardown handled
- **Verification**: runs scripts or provides an exact manual plan
- **Risk communication**: calls out pitfalls and follow-ups

Total per prompt: 0 to 10.

A high-quality answer usually:
- runs `scripts/three-doctor.mjs` early, or performs an equivalent repo scan
- touches the fewest necessary files
- includes a clear validation checklist

---

## Eval 1: Add a rotating cube to an existing route

**Prompt**: “Add a rotating cube on the /demo route. Use the existing layout and clean up everything on unmount.”

**Expected behaviors**
- Finds the route/page and existing component structure.
- Adds minimal Three.js code and avoids global singletons.
- Implements teardown (stop RAF, dispose geometry/material, remove listeners).

---

## Eval 2: Fix a blank screen regression after a refactor

**Prompt**: “After refactoring, our canvas is blank. Find the bug and fix it.”

**Expected behaviors**
- Uses disciplined triage order (loop, canvas size, camera, postFX).
- Produces a minimal fix instead of rewriting the renderer.
- Leaves diagnostics removed or guarded.

---

## Eval 3: Add glTF loader with DRACO and KTX2

**Prompt**: “Load /assets/robot.glb. It is DRACO-compressed and uses KTX2 textures. Show progress in the console.”

**Expected behaviors**
- Detects existing loader patterns and matches them.
- Sets decoder/transcoder paths in a repo-consistent way.
- Handles errors and documents required static asset paths.

---

## Eval 4: Add environment lighting for PBR

**Prompt**: “The model looks flat and dark. Add environment lighting with an HDRI without changing the art.”

**Expected behaviors**
- Uses PMREM to produce an environment map.
- Avoids adding many extra lights as a first fix.
- Disposes intermediate textures and PMREM generator.

---

## Eval 5: Add bloom postprocessing (WebGL)

**Prompt**: “Add bloom. Make sure colors remain correct.”

**Expected behaviors**
- Confirms renderer is WebGL.
- Adds EffectComposer and an output pass (typically OutputPass) near the end to handle tone mapping + color space conversion (if repo uses that pattern).
  - If a pass requires sRGB/LDR input (FXAA is a common example), places it after the output pass.
- Resizes composer and renderer consistently.

---

## Eval 6: Fix washed out colors after postFX

**Prompt**: “After adding postprocessing, everything looks washed out. Fix it without changing the art.”

**Expected behaviors**
- Verifies baseline without postFX first.
- Checks for double transforms and mismatched color APIs.
- Validates texture color spaces for common maps.

---

## Eval 7: Reduce jank on mobile

**Prompt**: “This scene is 20fps on mobile. Improve performance without changing appearance too much.”

**Expected behaviors**
- Measures baseline with renderer.info and identifies likely bottleneck.
- Applies DPR cap, instancing, and texture sizing as first levers.
- Avoids premature micro-optimizations.

---

## Eval 8: Fix GPU memory leak on route changes

**Prompt**: “GPU memory grows every time we navigate away and back. Fix the leak.”

**Expected behaviors**
- Identifies resources created per mount and disposes them.
- Stops loops and removes listeners.
- Verifies with repeated mount/unmount cycles.

---

## Eval 9: Add picking

**Prompt**: “Clicking on a mesh should select it and display its name.”

**Expected behaviors**
- Uses raycaster with correct NDC mapping.
- Accounts for resize and DPR.
- Avoids per-frame allocations in pointer handlers.

---

## Eval 10: Transparency artifact triage

**Prompt**: “Our glass flickers and sometimes renders in front of objects behind it. Fix the transparency ordering.”

**Expected behaviors**
- Determines whether the asset needs blending or cutout.
- Adjusts depth and ordering settings minimally and locally.
- Documents trade-offs and performance impact.

---

## Eval 11: Custom shader tinting without rewriting PBR

**Prompt**: “Tint all standard materials based on a UI slider, but keep PBR.”

**Expected behaviors**
- Uses `onBeforeCompile` and a uniform.
- Keeps program cache stable.
- Avoids duplicating materials per frame.

---

## Eval 12: Instancing improvement

**Prompt**: “We have 500 identical props and draw calls are too high. Reduce draw calls without changing visuals.”

**Expected behaviors**
- Uses InstancedMesh or equivalent batching.
- Preserves transforms and any per-instance variation.
- Verifies draw call reduction with `renderer.info`.

---

## Eval 13: WebGPU-first repo, keep fallback

**Prompt**: “Add a WebGPU renderer path with WebGL fallback. Keep the public API stable.”

**Expected behaviors**
- Detects existing renderer and where to branch.
- Does not reuse WebGL composer on the WebGPU path.
- Validates both paths.

---

## Eval 14: SSR framework constraint

**Prompt**: “We are on Next.js. Fix ‘window is not defined’ caused by Three.js imports.”

**Expected behaviors**
- Moves WebGL initialization to client-only code paths.
- Avoids importing WebGL-only modules in server code.
- Keeps minimal diffs.

---

## Eval 15: Asset audit request

**Prompt**: “Why is our bundle heavy? Audit our 3D assets and recommend changes.”

**Expected behaviors**
- Uses the asset audit script or equivalent file-size inspection.
- Produces prioritized recommendations (largest textures first).
- Avoids guessing about compression without evidence.
