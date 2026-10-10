# Developing Three.js Apps (Claude Code Skill)

A distribution-ready Claude Code Skill for implementing, debugging, and optimizing Three.js features in real repositories.

---

## What this Skill is for

- Adding or refactoring Three.js rendering code (WebGL and WebGPU)
- Integrating glTF assets (DRACO, KTX2, meshopt when needed)
- Postprocessing with correct color management (WebGL composer, WebGPU pipelines)
- Custom shaders (GLSL, `ShaderMaterial`, `onBeforeCompile`, nodes/TSL)
- Interaction (raycasting and picking), performance, memory and disposal

---

## What this Skill is not for

- Upgrading Three.js revisions as a side effect
- Rewriting the app architecture or switching frameworks
- Adding large dependencies when Three.js already provides the capability

---

## Install locations (Claude Code)

- **Personal**: `~/.claude/skills/developing-threejs-apps/`
- **Project**: `.claude/skills/developing-threejs-apps/` inside your repository
- **Plugin/distribution**: include this folder under `skills/`

A valid Skill directory must include a `SKILL.md` file with YAML frontmatter.

---

## How to use

1. Place this folder in one of the install locations above.
2. Restart Claude Code if it is already running (Skills are discovered at startup).
3. Ask for a Three.js-related change (rendering, glTF, postFX, shaders, performance, leaks).
4. When your request matches the Skill's description, Claude Code loads `SKILL.md` (and then any linked files) as needed.

---

## Contents

- `SKILL.md`: primary instructions (kept concise for fast loading)
- `examples.md`: copy/paste code patterns
- `playbooks.md`: step-by-step implementation recipes
- `quality-gates.md`: pre-ship checks for correctness and performance
- `evaluations.md`: prompts for testing this Skill
- `reference/`: detailed notes (loaded only when needed)
- `scripts/`: optional audit helpers (executed, not loaded)

---

## Security

This Skill is designed for local developer work, but any agent that can read files and run commands can be powerful.
Review `SECURITY.md` before deploying this Skill in sensitive environments.

---

## Versioning

This Skill is intentionally **Three.js revision-aware** and avoids hardcoding a single API snapshot.
It instructs the agent to detect the installed revision and match the repository’s conventions.

See:

- `reference/versioning-and-migrations.md`

---

## Contributing

See `CONTRIBUTING.md`.
