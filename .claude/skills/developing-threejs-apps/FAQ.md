# FAQ

---

## The Skill does not trigger

- Ensure the directory name matches the `name` in `SKILL.md` (recommended; some upload tooling requires this).
- Ensure the file is named exactly `SKILL.md` (case-sensitive).
- Make the description specific: include trigger terms like "three.js", "glTF", "WebGL", "WebGPU", "EffectComposer".

---

## My repo uses `three/examples/jsm` but the docs show `three/addons`

Use the import style already used in the repository unless you are explicitly migrating imports.

---

## WebGPU and EffectComposer

EffectComposer is a WebGL-oriented pipeline.
If the repo uses WebGPURenderer, treat postprocessing as a separate implementation and do not run WebGL passes on the WebGPU path.

---

## Colors look washed out or too dark

Do not change color settings blindly.
First isolate whether the issue is:
- missing environment lighting for PBR
- wrong texture color spaces
- double-applied output transform in postprocessing

See:

- `reference/color-management.md`
- `reference/postprocessing-webgl.md`

---

## GPU memory keeps increasing

Common causes:
- render loop not stopped on unmount
- event listeners not removed
- textures and render targets not disposed

See:

- `reference/rendering-loop-and-lifecycle.md`
- `reference/performance-and-memory.md`
- Playbook: "Fix a GPU memory leak on route changes" in `playbooks.md`
