# Assets: glTF/GLB, Textures, and Environment Maps

---

## Preferred formats

- 3D models: glTF 2.0 (`.gltf` or `.glb`)
- Environment: HDR equirectangular (`.hdr`) or prefiltered env maps if the repo has them
- Textures: use compressed GPU formats when feasible (KTX2), otherwise PNG/JPG with appropriate sizes

## glTF loading checklist

1. Use `GLTFLoader`.
2. If the asset uses compression:
   - DRACO for geometry
   - KTX2 for textures
   - meshopt for mesh optimizations
3. Ensure decoder/transcoder paths resolve in the deployed environment.
4. Add error handling and surface meaningful messages.

## Scene integration

- Put the model under a dedicated `Group` so it can be scaled/positioned and disposed as one unit.
- For interactive apps, separate “pickable” meshes into their own group or layers.

## Framing the camera

For unknown assets:

- compute a bounding box in world space
- set camera position to fit the bounds
- set controls target to the bounds center (if controls exist)

## Texture color space rules (critical)

- baseColor/albedo/emissive: sRGB
- normal/roughness/metalness/AO: linear (no color transform)

## Environment lighting (PBR baseline)

Most glTF assets use PBR materials and look wrong without environment lighting.

- Set `scene.environment` to a PMREM-processed environment map.
- Keep direct lights simple at first (1 directional + ambient, or even none if HDRI is strong).

## Performance and size considerations

- Large textures dominate VRAM. Identify and reduce oversized textures first.
- Prefer fewer materials and texture sets for better batching.
- Consider LODs for large scenes.

## Caching

If assets are reused:

- cache loaded GLTF scenes or their processed outputs
- avoid loading the same URL multiple times
- ensure cached resources are still disposed when no longer used (reference counting or centralized ownership)
