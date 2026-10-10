# Stutter and Precompile (first-frame and first-interaction jank)

Many Three.js projects "work" but feel bad because of intermittent stalls:

- shader compilation stutter
- texture upload stalls
- heavy asset decode on the main thread

This reference is about reducing those stalls without changing visuals.

---

## Identify the stall

1. Use browser Performance profiling to capture a stutter.
2. Classify:
   - shader compile and program link
   - texture uploads / mipmap generation
   - asset decode (DRACO, images, JSON parsing)
   - garbage collection

Do not optimize blindly. Capture one trace.

## Common mitigation strategies

### A) Precompile shaders

WebGL revisions often expose a way to compile materials for a scene and camera.
If the repo already uses such a method, follow it.

If not:
- search in the repo and in `node_modules/three` for compile or precompile APIs
- add precompile only if it is verifiable and does not regress startup time badly

Typical pattern:
- load assets
- build the scene
- run a compile step once
- then start the interactive loop

### B) Warm up textures intentionally

Large textures can stall when first used.
Options:
- show a loading screen until textures are ready
- render a few warm-up frames offscreen or before enabling interaction

Avoid fake "sleep" delays. Tie warm-up to actual readiness.

### C) Defer non-critical work

- defer secondary effects (bloom, SSAO) until after first meaningful paint
- use `requestIdleCallback` when appropriate (repo-dependent)

### D) Reduce work on mobile

- cap DPR early (1 to 2 is common)
- reduce expensive postprocessing resolution
- avoid huge shadow maps

## Verification checklist

- [ ] First meaningful paint occurs quickly.
- [ ] The first interaction (camera move, hover) does not hitch.
- [ ] Startup time did not regress unacceptably.
- [ ] Any warm-up is implemented deterministically and can be skipped in dev.

## Common pitfalls

- Starting the render loop before assets are loaded, causing repeated partial compiles
- Triggering compilation on every resize due to new render targets
- Recreating materials or geometries after precompile, invalidating the cache
