# Transparency and Ordering

Transparency issues are common in real-time rendering and are often misunderstood.
This reference focuses on how Three.js typically behaves and how to debug common artifacts.

---

## How transparency usually works

- Opaque objects are generally rendered first.
- Transparent objects are sorted and rendered later (typically back-to-front) because blending depends on draw order.

As a result:
- transparency is not "physically correct" by default
- overlapping transparent meshes can produce surprising artifacts

## Key material flags

### `material.transparent`

- Enables blending and places the object in the transparent render list.
- Often increases overdraw and can reduce depth-based optimizations.

Use it when you need true alpha blending.

### `material.alphaTest`

- Discards pixels below a threshold and keeps the object in the opaque pipeline in many cases.
- Best for cutout materials (foliage, fences, UI sprites).

If you only need cutouts, prefer `alphaTest` over full transparency.

### `depthWrite` and `depthTest`

Common patterns:

- True transparency: `transparent = true`, `depthWrite = false`, `depthTest = true`
- Cutout: `alphaTest > 0`, `depthWrite = true`, `depthTest = true`

Be careful:
- If `depthWrite` is true on a blended object, it can "punch holes" into other transparent objects behind it.

## Sorting and draw order

### Transparent sorting is not perfect

Sorting can be wrong when:
- geometry is large and spans near and far depths
- two transparent objects overlap in complex ways
- many objects share the same depth

Tools:
- `object.renderOrder` can force ordering for specific objects
- `material.depthWrite` can be tuned for specific cases

Avoid setting `renderOrder` everywhere. Use it only for known problematic layers (for example, UI planes).

## Double-sided materials

`DoubleSide` doubles fragment work and can amplify transparency artifacts.
Prefer single-sided geometry when possible.

## Premultiplied alpha

Some pipelines use premultiplied alpha textures.
If you see dark fringes or halos around sprites or transparent edges:

- confirm whether textures are premultiplied
- confirm renderer and material blending settings match the asset authoring

Treat this as a repo-specific decision. Do not change blending globally without verifying many scenes.

## Debugging approach

1. Replace the material with a known baseline:
   - `MeshBasicMaterial({ color: "magenta", wireframe: false })`
2. Disable postprocessing.
3. Toggle flags one at a time:
   - `transparent`, `alphaTest`, `depthWrite`, `side`
4. Use a simple scene layout to reproduce the artifact.

## Practical fixes (common)

- Cutouts: use `alphaTest` instead of full transparency.
- UI overlays: set `renderOrder` on the UI group and keep depthWrite off.
- Massive glass surfaces: split geometry so that sorting is more meaningful.
- Heavy overdraw: reduce transparent layers, reduce resolution, or simplify passes.
