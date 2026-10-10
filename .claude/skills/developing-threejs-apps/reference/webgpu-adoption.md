# WebGPU Adoption Strategy

WebGPU can improve capabilities, but adoption should be incremental and validated.

---

## Decision points

- Is WebGPU required for the product, or optional?
- Is there a WebGL fallback requirement?
- Which browsers and devices are in scope?

## Recommended approach

1. **Start with a renderer switch**
   - Prefer WebGPU when supported
   - Fallback to WebGL otherwise

2. **Keep the scene graph stable**
   - Scene, camera, loaders should be shared where possible
   - Avoid renderer-specific assumptions in shared code

3. **Treat postprocessing as renderer-specific**
   - Keep WebGL EffectComposer code on the WebGL path only
   - Implement WebGPU postprocessing separately

4. **Validate parity**
   - baseline scene renders correctly
   - color management and lighting match expectations
   - performance is not worse on target devices

## Operational advice

- Add a debug flag to force WebGL for troubleshooting.
- Document browser support and known limitations.
- Keep diffs minimal when introducing the first WebGPU path.

## Failure modes

- Visual mismatch due to different pipeline assumptions
- WebGL-only passes used on WebGPU
- Bundle size increases due to duplicated pipelines
