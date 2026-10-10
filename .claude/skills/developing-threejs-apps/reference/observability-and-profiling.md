# Observability and Profiling

This reference is about measuring what is happening before changing code.

---

## Built-in metrics (low effort)

Log `renderer.info` periodically:

- `renderer.info.render.calls` (draw calls)
- `renderer.info.render.triangles` (triangles)
- `renderer.info.memory.textures` (texture count)
- `renderer.info.memory.geometries` (geometry count)

Do not log every frame in production. Use a debug toggle or throttle.

## Browser tooling (high leverage)

### Performance panel

Use the browser Performance panel to identify:
- long tasks on the main thread
- garbage collection pauses
- time spent in rendering and painting
- stalls that correlate with user interaction

### WebGL and GPU debugging tools

External tools can help diagnose:
- redundant state changes
- expensive passes
- too many draw calls
- large render targets

Examples include tools like Spector.js.
Treat these as optional developer tooling. Do not add them as runtime dependencies unless requested.

## Error surface area

### Shader compile and validation

If you see shader errors:
- isolate the material
- confirm the geometry provides the required attributes
- confirm defines and precision qualifiers

### Context lost events

If the WebGL context is lost:
- treat it as a memory pressure signal
- reduce texture sizes, shadow maps, and render target counts
- ensure resources are disposed on teardown

## Practical profiling workflow (recommended)

1. Capture a baseline:
   - FPS and frame time
   - renderer.info numbers
   - an asset size report if load time is a concern
2. Apply one change.
3. Re-measure.
4. Keep the best change and revert the rest.

This avoids "optimizations" that are not real improvements.
