# Versioning and Migrations (Three.js API drift)

Three.js evolves quickly. This Skill is intentionally "revision-aware".

---

## Golden rule

Match the repo’s installed Three.js revision and conventions. Do not apply “latest docs” blindly.

## Common drift patterns to recognize

### Addon import paths

You may see either:

- `three/addons/...` (newer docs style)
- `three/examples/jsm/...` (older but common in existing repos)

Use the style already present unless there is a concrete reason to change it.

### Color management naming

You may see either:

- `renderer.outputColorSpace` and `texture.colorSpace` (newer naming)
- `renderer.outputEncoding` and `texture.encoding` (legacy naming)

If the repo uses legacy naming, keep it consistent. If you migrate, migrate consistently and validate visuals.

### Lighting behavior toggles

Some repos have “legacy” lighting settings for backwards-compatible look.

Do not flip these switches as a side effect of other changes. If the user asks for “match old look”, preserve existing light configuration.

### WebGPU maturity

WebGPU features and APIs may differ by revision.
Treat WebGPU adoption as an explicit project decision with validation on supported browsers.

## How to handle uncertainty

If you are unsure which API is correct:

1. Inspect the repo for existing usage patterns.
2. Grep in `node_modules/three` for the symbol.
3. Prefer the pattern already used in the codebase.
4. Validate by running and checking visuals.

## “Old patterns” section (use only when required)

If you encounter old code, do not delete it automatically. Instead:
- keep it working
- isolate it behind a compatibility helper if needed
- document why it exists
