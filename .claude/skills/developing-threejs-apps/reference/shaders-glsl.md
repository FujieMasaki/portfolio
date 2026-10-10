# GLSL Shaders (WebGL)

Use this guide when implementing `ShaderMaterial`, `RawShaderMaterial`, or extending built-in materials with `onBeforeCompile`.

---

## Choose the lightest tool that works

1. **Built-in materials**: simplest and most compatible.
2. **`onBeforeCompile`**: small modifications while keeping built-in pipelines.
3. **`ShaderMaterial`**: full control, but you own more complexity.
4. **`RawShaderMaterial`**: no automatic chunks, most fragile.

## Avoid accidental shader recompiles

Changing these often triggers recompiles:

- defines
- shader source strings
- material type or fog/lights toggles

Prefer updating uniforms over changing defines at runtime.

## `onBeforeCompile` patterns

- Add uniforms via `shader.uniforms`.
- Modify shader strings with targeted replacements (avoid large rewrites).
- Provide `customProgramCacheKey` for stable caching when needed.

## Output transform (common pitfall)

If you write a full-screen shader or output a final color in a fragment shader, you may need to apply:

- tone mapping (if used in the pipeline)
- output color space transform (sRGB encoding)

Whether you do this in the material or in a postprocessing output pass depends on the repo’s architecture.
Avoid doing it twice.

## Debugging shader issues

- Look for console logs like “Shader Error”.
- Reduce to a minimal shader and reintroduce logic incrementally.
- Confirm vertex attributes exist and match your shader expectations.

## Coordinate systems and depth

If you implement custom depth logic or screen-space effects:

- confirm camera near/far and depth buffer format
- confirm any depth textures are created correctly
- validate in multiple browsers if possible

## Keep a baseline

For complicated shader work, keep a toggle to fall back to a known-good built-in material during development.
