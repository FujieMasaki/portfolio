# Postprocessing (WebGL)

For WebGL renderer with EffectComposer pipeline.

## Setup

1. `new EffectComposer(renderer)`
2. Add `RenderPass(scene, camera)`
3. Add effect passes (bloom, SSAO, etc.)
4. Add `OutputPass()` (tone mapping + color space)
5. Replace `renderer.render()` with `composer.render()`

## Pass Ordering

```
RenderPass
↓
Linear-space effects (SSAO, SSR, DOF, bloom, color grading)
↓
OutputPass (tone mapping + color space)
↓
sRGB-input passes (FXAA) — must come AFTER OutputPass
```

## Resize

Update all sizes:
```ts
renderer.setSize(w, h, false);
composer.setSize(w, h);
camera.aspect = w / h;
camera.updateProjectionMatrix();
// + custom pass resolutions if any
```

## Common Pitfalls

- Composer created but never used (still calling `renderer.render`)
- Forgetting to resize composer
- Output transform applied twice (renderer + output pass)
- Heavy passes at high DPR → fill-rate bottleneck

## Debug Steps

1. Bypass composer, render directly
2. Add passes back one-by-one until issue appears
3. Confirm OutputPass present near end
4. Confirm sRGB passes (FXAA) come after OutputPass

## Performance

- Lower internal resolution for expensive passes
- Avoid multiple full-screen passes on mobile
- Disable postFX when tab hidden or budget exceeded
