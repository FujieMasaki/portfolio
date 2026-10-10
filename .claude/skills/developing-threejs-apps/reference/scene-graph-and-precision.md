# Scene Graph, Transforms, and Precision

This reference is about CPU-side costs (scene traversal, matrix updates) and numeric precision issues that show up in real projects.

---

## Mental model

- Three.js maintains a scene graph of `Object3D` instances.
- Each object has a local transform (position, rotation, scale) and a derived world transform (`matrixWorld`).
- The renderer traverses the graph each frame, updates matrices (if needed), and issues draw calls for visible renderables.

The most common advanced mistakes are:
- updating too much every frame (CPU cost and garbage)
- using world scales that break depth precision (visual artifacts)

## Matrix update costs

### When matrix updates happen

- By default, `matrixAutoUpdate` is true and transforms are recomputed each frame as needed.
- The renderer also needs up-to-date `matrixWorld` for culling and drawing.

If you have large static subtrees, you can reduce CPU work:

- set `object.matrixAutoUpdate = false` after you finalize transforms
- call `object.updateMatrix()` and `object.updateMatrixWorld(true)` once
- avoid changing `position/rotation/scale` each frame for static meshes

Guideline:
- Only use manual matrix management when you have measured a CPU bottleneck or have very large scenes.

### Traversal cost

Common high-cost patterns:
- calling `scene.traverse` every frame for operations that can be cached
- repeatedly searching for named nodes in the graph

Prefer:
- cache references to frequently used nodes
- build lookup maps once after loading a glTF

## Bounding volumes and culling

### Frustum culling depends on bounding volumes

- `Mesh.frustumCulled` defaults to true.
- `BufferGeometry` needs a correct bounding sphere or box for culling.

If meshes vanish unexpectedly:
- verify `geometry.boundingSphere` exists (compute once if needed)
- for skinned or morphed meshes, bounding volumes may need special handling

Avoid disabling culling globally. Use it as a targeted workaround.

## Depth precision and camera settings

Many "shimmering", "z-fighting", and shadow artifacts are not shader bugs. They are depth precision problems.

High-leverage fixes:

- reduce `camera.far` to the smallest value that still fits the scene
- increase `camera.near` if possible (near too small is harmful)
- keep world scales reasonable (avoid placing objects at 1e6 units)

Rule of thumb:
- A near plane that is extremely small (for example 0.001) combined with a huge far plane (for example 1e6) is a recipe for z-fighting.

## Large worlds (floating origin)

If the experience needs very large coordinates (open worlds, GIS-like scenes):

- keep the camera near the origin by shifting the world ("floating origin")
- store high precision positions in a separate data model
- convert to local coordinates for rendering each frame

This prevents float precision loss in transforms and shader math.

## Coordinate system assumptions

WebGL and WebGPU backends can differ in clip-space conventions. If you implement custom full-screen passes or custom projection math:

- confirm the target renderer path (WebGL vs WebGPU)
- avoid hardcoding clip-space assumptions unless you have verified them for the repo’s Three.js revision

## Practical checklist

When adding a new feature:

- [ ] Is a render loop already owned by the framework or engine?
- [ ] Are you accidentally creating or destroying objects per frame?
- [ ] Are camera near/far values sane for this scene scale?
- [ ] Are static objects marked as static (or at least not updated unnecessarily)?
- [ ] Do bounding volumes exist and are they correct?
