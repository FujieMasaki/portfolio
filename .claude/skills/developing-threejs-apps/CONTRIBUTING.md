# Contributing

Thanks for improving this Skill.

---

## Design principles

- **Progressive disclosure**: keep `SKILL.md` short and navigational. Put depth in `reference/`.
- **Repo-first**: instructions should encourage reading the target repo, not assuming a template.
- **Verification-first**: changes should be measurable and testable.
- **Version-aware**: avoid hardcoding a single Three.js revision.

---

## Development workflow

1. Make changes in the relevant file:
   - high-level guidance: `SKILL.md`
   - snippets: `examples.md`
   - runbooks: `playbooks.md`
   - deeper docs: `reference/*.md`
   - scripts: `scripts/*.mjs`

2. Run the Skill maintainer audit:

```bash
node skills/developing-threejs-apps/scripts/skill-audit.mjs
```

3. Keep `SKILL.md` under 500 lines.

4. Update version and changelog:
   - bump `VERSION`
   - add an entry to `CHANGELOG.md`

---

## Style

- Write in clear, direct English.
- Prefer checklists and stepwise instructions over prose.
- Avoid assumptions about frameworks and build tools. Always instruct the agent to detect them.

---

## Submitting changes

- Provide a brief rationale and a test plan.
- If you add a new reference file, link it directly from `SKILL.md` (one level deep).
