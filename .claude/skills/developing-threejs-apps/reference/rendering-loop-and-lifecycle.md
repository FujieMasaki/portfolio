# Render Loop and Lifecycle

Most failure-prone part of Three.js integrations.

## Loop Options

### requestAnimationFrame (default)
- Use for most non-XR apps
- One loop per renderer/canvas
- Store RAF id, cancel on teardown
- Clamp dt to avoid large jumps after tab switch

### renderer.setAnimationLoop (XR/WebGPU)
- Use for WebXR or renderer-owned loop
- Set callback to start, `null` to stop
- **Do not run both RAF and setAnimationLoop simultaneously**

## Lifecycle API Shape

```ts
createThreeApp(canvas) → {
  resize(),   // renderer + camera + composer/targets
  update(dt), // simulation
  render(),   // draw
  dispose()   // stop loop, remove listeners, dispose GPU
}
```

Make `dispose()` idempotent.

## Resize Checklist

```ts
renderer.setSize(w, h, false);
camera.aspect = w / h;
camera.updateProjectionMatrix();
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
composer?.setSize(w, h);
// + any custom render targets
```

**Measure canvas/container**, not `window.innerWidth/Height` (unless truly fullscreen).

## DPR Strategy

| Scene Type | Recommended Cap |
|------------|-----------------|
| General | 2 |
| Heavy postprocessing | 1.5 or 1 |

Match repo's target devices.

## Teardown Checklist

In `dispose()`:
1. Stop loop (cancel RAF or `setAnimationLoop(null)`)
2. Remove event listeners and observers
3. Remove objects from scene
4. Dispose created resources:
   - geometries, materials, textures
   - render targets, composers
   - PMREM outputs
5. `renderer.dispose()` (if not reused)

## Context Loss

Do not call `forceContextLoss()` unless you know why. Prefer correct disposal and loop teardown.
