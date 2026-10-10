# Asset Pipeline Optimization (optional tools)

This reference is about build-time optimization of 3D assets.
It is optional because not every repository can adopt pipeline tooling.

---

## First: measure what is big

Run:

```bash
node skills/developing-threejs-apps/scripts/asset-audit.mjs
```

Prioritize the largest assets first. In many real projects, a few textures dominate both download and VRAM use.

## Common wins (highest leverage)

### 1) Texture resolution and count

- Reduce 4k textures unless the camera gets very close.
- Pack grayscale maps into channels (Roughness, Metalness, AO).
- Prefer GPU-compressed textures (KTX2) when supported.

### 2) Mesh optimization

- Remove invisible meshes and unused animation clips.
- Simplify high-poly meshes or add LODs.

### 3) Compression

- Geometry: DRACO or meshopt (trade CPU decode for download size).
- Textures: KTX2 (trade transcoding for bandwidth and VRAM wins).

## Optional tooling (ask before adding)

Only do this if the user explicitly wants pipeline changes and the repo can accept new dev dependencies.

- `gltf-transform` can optimize glTFs (prune, dedupe, meshopt, texture transforms).
- KTX2 creation typically uses external tools (for example `toktx`), which may not be installed.

Do not assume these tools exist. Document installation steps and provide a rollback plan.

## Integration pattern (recommended)

- Keep raw source assets in a `source-assets/` folder (not served).
- Output optimized runtime assets into `public/assets/` (or the repo’s existing convention).
- Keep optimization commands in npm scripts so they are reproducible.

Example scripts (illustrative):

```json
{
  "scripts": {
    "assets:audit": "node skills/developing-threejs-apps/scripts/asset-audit.mjs",
    "assets:optimize": "echo \"Add your glTF and texture pipeline here\""
  }
}
```

## Verification plan

After any pipeline change:

- verify visuals: materials, normal maps, transparency, animations
- verify performance: load time, memory, frame time
- verify fallback: devices without GPU texture compression support should still load assets (if applicable)

## Common pitfalls

- Treating data textures as sRGB (breaks shading)
- Shipping both PNG and KTX2 and accidentally loading both
- Forgetting to host DRACO decoders or KTX2 transcoders in the correct public path
