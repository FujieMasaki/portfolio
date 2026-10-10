# Lighting and Shadows

---

## PBR baseline (most glTF assets)

glTF assets typically use PBR materials. The fastest route to “correct looking” is:

- set an environment map (`scene.environment`) via PMREM
- use a small number of direct lights (often 0 to 2)

If an asset looks dark or flat, missing environment light is a common cause.

## Light types

- Directional: good for sun-like light, commonly used with shadows
- Hemisphere: simple ambient-like sky/ground fill
- Point/Spot: local lights, can be expensive if many cast shadows

## Shadow checklist

- enable: `renderer.shadowMap.enabled = true`
- mark casters: `mesh.castShadow = true`
- mark receivers: `mesh.receiveShadow = true`
- configure light shadow camera bounds and map size
- keep shadow map sizes conservative, especially on mobile

## Common shadow performance pitfalls

- Too many shadow-casting lights
- Large shadow map sizes (2048 or 4096) by default
- Every mesh casting shadows, including tiny props

## Exposure and tone mapping

Lighting intensity interacts with exposure and tone mapping.
Avoid “fixing” lighting by random exposure tweaks. Prefer:

- correct environment lighting
- intentional direct light intensities
- small exposure adjustments with visual validation

## Compatibility note

Different Three.js revisions and configurations may differ in “legacy” lighting behavior.
Match the repo’s existing lighting configuration and do not silently change it.
