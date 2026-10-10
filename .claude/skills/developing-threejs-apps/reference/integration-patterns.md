# Integration Patterns (Frameworks and R3F)

This document is for adapting Three.js changes to the host framework without breaking lifecycle guarantees.

---

## Vanilla Three.js inside a framework component

Pattern:

- Component renders a `<canvas>` or container.
- On mount, call `createThreeApp(canvas)`.
- On unmount, call `dispose()`.

Key rule: do not recreate GPU objects on every render. Create once, update via refs.

## React (non-R3F) pattern

- Use `useRef<HTMLCanvasElement>()` for the canvas.
- Use `useEffect` with an empty dependency array to initialize once.
- Store the app handle in a ref and dispose on cleanup.
- Use a `ResizeObserver` to call `app.resize()`.

Avoid:
- Creating `new THREE.Scene()` during render.
- Creating geometries/materials per render.

## React Three Fiber (R3F) pattern

R3F owns the renderer and render loop. Your code should be declarative:

- Keep expensive objects stable:
  - `useMemo` for geometries/materials
  - `useLoader` for assets
- Use `useFrame` for per-frame updates.
- Prefer Drei utilities if the repo already uses them.

Avoid:
- Calling `renderer.render()` manually.
- Creating or disposing GPU resources outside R3F lifecycle.

## Next.js and SSR constraints

Common failure: `window is not defined`.

Rules:

- Do not construct `WebGLRenderer` on the server.
- Move Three.js initialization into client-only modules:
  - dynamic import with `{ ssr: false }` for React components
  - or conditionally run code in `useEffect`

Asset URLs:
- Confirm where `public/` assets resolve.
- Confirm basePath or assetPrefix settings if used.

## Vue / Svelte / Angular

The same lifecycle rule applies:

- initialize once on mount
- dispose once on unmount
- keep stable object ownership in module scope or instance scope, not reactivity loops

If the framework has strict cleanup expectations, make teardown deterministic and idempotent.

## Routing

On route changes:

- stop loops
- dispose resources
- detach event listeners

If the app caches pages/routes, ensure you do not create duplicate render loops for the same canvas.
