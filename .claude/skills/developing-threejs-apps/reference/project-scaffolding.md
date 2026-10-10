# Project Scaffolding Patterns

Use these patterns when you need to add new Three.js code to a repo that does not already have a clean integration boundary.

---

## Prefer "feature modules", not framework rewrites

Create a small module that exports a lifecycle object:

- `createThreeApp(canvas, options) -> { resize, update, render, dispose }`

Then bind it to the host framework (React/Vue/etc.) using existing lifecycle hooks.

## Suggested folder layout (example)

Adapt to the repo. Do not invent a new architecture if one already exists.

```
src/
  three/
    createThreeApp.ts
    loaders/
      loadGltf.ts
    utils/
      dispose.ts
      resize.ts
```

## Canvas ownership

Decide where the canvas lives:

- **Canvas owned by host**: framework component renders `<canvas>` and passes it to Three.js.
- **Canvas owned by Three.js**: module creates a canvas and appends to a container.

Prefer “host owns canvas” for apps with SSR, routing, or strict component lifecycles.

## Static assets and URLs

Different bundlers handle assets differently:

- Public/static directory: reference by URL path (`/assets/model.glb`)
- Imported assets: use bundler-specific URL import patterns

Do not assume one approach. Inspect existing asset usage in the repo.

## TypeScript recommendations

- Keep Three.js objects typed explicitly in exported APIs.
- Avoid leaking `any` from loader utilities.
- Prefer small structural types for app handles, not class inheritance.
