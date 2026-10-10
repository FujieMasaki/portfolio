# Scripts

These scripts are optional helpers intended to be:

- dependency-free (Node.js only)
- safe to run locally in a repository
- informative (report patterns and risks)

They are not required for the Skill to work.

---

## three-doctor.mjs

Repo pattern audit (framework hints, renderer usage, postFX symbols, color API drift).

Usage:

```bash
node skills/developing-threejs-apps/scripts/three-doctor.mjs
```

Or pass a repo root:

```bash
node skills/developing-threejs-apps/scripts/three-doctor.mjs /path/to/repo
```

---

## asset-audit.mjs

Reports largest 3D and texture assets by file size.

Usage:

```bash
node skills/developing-threejs-apps/scripts/asset-audit.mjs
```

Notes:

- It scans common folders (`public`, `assets`, `static`, `src/assets`) if present.
- It does not parse GLB binary contents. It uses file size heuristics.

---

## skill-audit.mjs (maintainers)

Validates the Skill structure:

- SKILL.md exists and has frontmatter on line 1
- SKILL.md is under 500 lines (warning if not)
- linked files from SKILL.md exist
- warns on nested reference links from `reference/*.md`

Usage:

```bash
node skills/developing-threejs-apps/scripts/skill-audit.mjs
```

---

## Exit codes

- 0: completed successfully
- 1: failed to run or validation errors
