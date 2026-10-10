# Node Materials and TSL (Three Shader Language)

Use this guide when the repo uses node-based materials or targets WebGPU.

---

## When to use nodes/TSL

- The repo already uses node materials and expects that style.
- You need portability across render backends.
- You want composable shader logic without large string manipulation.

## When not to use nodes/TSL

- The repo is WebGL-only and uses GLSL everywhere.
- The change is small and can be done with `onBeforeCompile`.
- The team is not prepared to maintain node-based shader graphs.

## Practical rules

- Match the existing material system in the repo.
- Keep node graphs small and focused.
- Prefer stable inputs and avoid per-frame graph rebuilding.
- Document any renderer constraints (WebGPU-only features).

## Debugging

- Reduce to a minimal node chain and verify output.
- Compare against a built-in material baseline.
- Validate that color management is consistent with the pipeline.

## Maintenance

Nodes/TSL may evolve quickly. Isolate node material code to avoid spreading it across unrelated modules.
