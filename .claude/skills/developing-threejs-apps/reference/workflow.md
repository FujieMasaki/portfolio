# Workflow: Repo-first Three.js Coding

---

## Goals

- Make correct, minimal, verifiable code changes in an existing repository.
- Match the repository’s conventions (framework, bundler, TypeScript, lint rules).
- Avoid Three.js regressions caused by lifecycle, color management, and disposal mistakes.

## Non-goals

- Avoid architecture rewrites unless explicitly requested.
- Avoid dependency upgrades as side effects.
- Avoid “drive-by” refactors unrelated to the user request.

## Repository discovery checklist

Before editing:

1. **Project metadata**
   - `package.json` scripts (dev/build/test/lint)
   - package manager and lockfile
   - `type: module` and TS configuration

2. **Locate Three.js usage**
   - search for `from "three"`
   - search for `WebGLRenderer` or `WebGPURenderer`
   - search for postprocessing (`EffectComposer`, “postprocessing” folder)
   - search for loader utilities (`GLTFLoader`, `LoadingManager`)

3. **Determine ownership boundaries**
   - who owns the render loop (framework, custom engine, single module)
   - where lifecycle boundaries exist (routes, components, scenes)
   - where assets live (public folder, CDN, import-based assets)

4. **Confirm Three.js revision**
   - prefer `node_modules/three/package.json`
   - otherwise inspect lockfile or dependency range

## Implementation loop

1. **Plan the smallest diff**
   - list the files you will touch
   - identify existing patterns you will follow

2. **Implement incrementally**
   - keep changes localized
   - avoid unrelated formatting or file moves
   - prefer composable helpers over hidden singletons

3. **Lifecycle and disposal**
   - if you create a loop, you must stop it
   - if you add a listener, you must remove it
   - if you create GPU resources, you must dispose them

4. **Validation**
   - run the repo’s scripts when possible
   - otherwise provide an exact manual validation plan

## Communication template (final response)

Include:

- **Files changed**: enumerate files
- **What changed**: 3 to 6 bullets, focused on behavior
- **How to run**: exact commands (dev/build/test) and expected result
- **Manual checks**: what to visually verify
- **Risks**: compatibility, performance, future follow-ups

## Common failure patterns

- “It works on my machine” due to implicit global state or timing
- Leaks due to missing `dispose()` calls on route changes
- Wrong color due to mixing postprocessing output transforms
- Draw-call explosions due to many materials or no instancing
