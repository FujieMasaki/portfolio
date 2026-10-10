# Quality Gates

Pre-ship checklist for Three.js changes.

## Build & Runtime
- [ ] `npm run build` succeeds (no new errors)
- [ ] `npm run dev` renders without console errors
- [ ] Tests pass (if present)

## Visual
- [ ] No blank screen on load
- [ ] Resize works (no stretched output)
- [ ] DPR intentional (no accidental 3x-4x on mobile)
- [ ] Transparency correct (if applicable)

## Color & Postprocessing
- [ ] Color management matches repo setup
- [ ] No double tone mapping/output transform
- [ ] Composer resized correctly
- [ ] Texture color spaces correct (color=sRGB, data=linear)
- [ ] WebGL/WebGPU postprocessing not mixed

## Performance
- [ ] Draw calls within expected range
- [ ] Repeated meshes use instancing/batching
- [ ] Shadow maps sized appropriately
- [ ] No accidental 4K textures
- [ ] New full-screen passes justified

## Stutter
- [ ] First paint not regressed
- [ ] First interaction smooth
- [ ] Warm-up logic deterministic

## Memory & Teardown
- [ ] Unmount stops render loop
- [ ] Event listeners removed
- [ ] GPU resources disposed (geometry, materials, textures, render targets)
- [ ] No memory growth on repeated mount/unmount

## Deployment
- [ ] SSR: renderer is client-only
- [ ] Asset paths work in production
- [ ] WebGPU fallback documented (if applicable)

## DX
- [ ] Error messages actionable
- [ ] New config documented
- [ ] Code follows repo conventions

---

**When in doubt:** Ship smaller, verified change over larger refactor.
