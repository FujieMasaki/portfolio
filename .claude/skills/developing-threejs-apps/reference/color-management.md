# Color Management

## Mental Model

- Lighting/PBR shading happens in **linear** space
- Color textures: authored in sRGB → decode to linear for shading
- Output: encode to display color space (usually sRGB)

## Repo Detection

Check for:
- `THREE.ColorManagement.enabled`
- `renderer.outputColorSpace` (newer) or `renderer.outputEncoding` (legacy)
- `texture.colorSpace` (newer) or `texture.encoding` (legacy)

**Do not mix patterns** without understanding repo setup.

## Texture Rules

| Type | Color Space |
|------|-------------|
| baseColor/albedo, emissive | sRGB |
| normal, roughness, metalness, AO, height | linear (no transform) |

If normal map treated as sRGB → shading looks wrong.

## Tone Mapping

- **Direct rendering**: renderer tone mapping affects output
- **Postprocessing**: tone mapping in output pass only (single place)

## Symptom → Cause

| Symptom | Likely Cause |
|---------|--------------|
| Too dark | Missing env light for PBR, or double output transform |
| Washed out | Wrong output transform or texture color spaces |
| Neon/saturated | Double tone mapping or wrong exposure |

## Debug Steps

1. Disable postprocessing
2. Render known object with `MeshStandardMaterial` + simple HDRI
3. Compare before/after any color changes

**Always compare against repo baseline.** Repos may intentionally deviate for stylized rendering.
