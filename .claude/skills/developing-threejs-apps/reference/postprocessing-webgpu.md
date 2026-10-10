# Postprocessing (WebGPU and node-based pipelines)

WebGPU postprocessing is not a drop-in replacement for the WebGL EffectComposer stack.

---

## Key idea

- Treat WebGL postprocessing and WebGPU postprocessing as separate implementations.
- Do not attempt to reuse WebGL-only passes on WebGPU.

In mixed repos, postprocessing code often needs to be renderer-branch-specific.

## What to detect in a repository

Before implementing anything, search for:

- `WebGPURenderer`
- "postprocessing" folders
- any node or TSL material usage
- existing render target utilities

If the repo already has a WebGPU postprocessing approach, follow it.
If not, start with a parity-first renderer path and add effects later.

## Parity-first strategy (recommended)

1. Implement a stable WebGPU baseline:
   - same scene graph and assets
   - same camera controls
   - no postprocessing
2. Validate that the WebGPU output matches the WebGL baseline closely enough.
3. Add postprocessing in small steps, verifying each effect.

## Common integration hazards

- Running EffectComposer code in the WebGPU path
- Creating two render loops (one for WebGL, one for WebGPU) accidentally
- Treating WebGPU feature gaps as "bugs" without checking the Three.js revision

## Debugging

- If the WebGPU path is blank, fall back to the diagnostic cube baseline.
- Keep shaders simple early. Add complexity only after baseline stability.
- Confirm the renderer initialization is awaited if the repo requires it.

## What to document

When you ship WebGPU changes, document:

- browser support expectations
- fallback behavior (WebGL path)
- known visual differences between paths (if any)
- performance trade-offs (WebGPU is not automatically faster)
