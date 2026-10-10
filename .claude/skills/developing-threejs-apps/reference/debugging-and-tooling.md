# Debugging and Tooling

---

## Fast triage checklist (in order)

1. Confirm the render loop runs and is not crashing.
2. Render a diagnostic object with `MeshBasicMaterial` or `MeshNormalMaterial`.
3. Confirm canvas size and CSS layout.
4. Confirm camera position and frustum.
5. Disable postprocessing and render directly.
6. Reduce scene complexity until it works, then reintroduce.

## Useful in-app diagnostics

- `AxesHelper`, `GridHelper`
- `renderer.info` logs for calls/triangles/textures (throttled)
- temporary GUI toggles for:
  - disable postprocessing
  - switch materials to `MeshNormalMaterial`
  - freeze camera controls
  - cap DPR

For deeper measurement workflows, see `reference/observability-and-profiling.md`.

## Common console errors

- “Shader Error”: inspect material, defines, and attribute mismatches
- “Cannot read property of undefined”: often a lifecycle ordering bug (init called before canvas exists)
- WebGL context lost: usually indicates resource exhaustion or driver reset, reduce memory pressure first

## Debugging postprocessing

- Ensure you render through the composer, not directly.
- Confirm composer is resized.
- Add or remove passes one-by-one until the issue appears.

## Logging discipline

- Avoid per-frame logging.
- Prefer on-demand logs or throttled intervals.
- Remove noisy diagnostics before shipping unless they are behind a debug flag.
