# Instancing and Batching

This reference covers the main techniques for reducing draw calls and CPU overhead.

---

## When to use which technique

### Instancing

Use instancing when:
- the same geometry and material is repeated many times
- transforms vary per instance
- you want a large draw call reduction

Primary tool: `THREE.InstancedMesh`.

### Batching and merging

Use merging when:
- many static meshes can share a single geometry
- material is the same (or can be made the same)
- objects do not need independent transforms at runtime

Tools may include:
- `BufferGeometryUtils.mergeBufferGeometries` (addon utility)
- build-time mesh merging in a DCC tool or glTF pipeline

Prefer build-time merging when possible because runtime merging has CPU and memory costs.

## InstancedMesh practical guidance

### Stable ownership

- Create one InstancedMesh for a population.
- Update instance matrices in place.
- Avoid destroying and recreating the InstancedMesh every frame.

### Updating transforms

- Use a temporary Object3D to build matrices.
- Call `inst.setMatrixAt(i, tmp.matrix)` and then set `inst.instanceMatrix.needsUpdate = true`.

If you update every frame for many instances, consider:
- partial updates (only changed instances)
- keeping a typed array of transforms

### Per-instance color

If the repo’s Three.js revision supports it:
- `inst.setColorAt(i, color)` and set `inst.instanceColor.needsUpdate = true`

Otherwise:
- add a custom `InstancedBufferAttribute` and modify the shader via `onBeforeCompile`.

### Culling caveat

InstancedMesh uses a single bounding volume for all instances.
If you spread instances widely, the whole batch may remain visible and cost fill rate.

Fix options:
- spatially partition into multiple InstancedMesh clusters
- implement coarse culling at the cluster level

## Merging and batching caveats

- You can only merge geometries with compatible attributes.
- Merging often removes the ability to change transforms individually.
- Large merged meshes can worsen culling precision (big bounding volumes).

## Practical measurement

When optimizing, log:

- `renderer.info.render.calls` (goal: lower)
- `renderer.info.render.triangles` (goal: stable or lower)
- CPU frame time in devtools

Avoid micro-optimizations until you have verified the bottleneck category.
