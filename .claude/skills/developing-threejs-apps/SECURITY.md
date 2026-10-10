# Security Notes (for Skill distribution)

This Skill is intended for developer work in local repositories. It includes optional scripts that can be executed by an agent.

---

## Threat model

If a coding agent can read files and run commands, it can:

- execute arbitrary code present in the repository
- read sensitive files in the workspace
- modify files and commit changes

This Skill is written to reduce accidental risk, but it cannot eliminate it.

---

## Rules for safe operation

1. **No network by default**
   - Do not run commands that fetch or execute remote code (for example `curl | sh`, `wget`, remote installers).
   - Do not add external CDNs for decoders or assets unless explicitly requested.

2. **No dependency drift without intent**
   - Do not add or upgrade dependencies unless the user request requires it.
   - Prefer using existing repo tooling and existing packages.

3. **Treat assets as untrusted inputs**
   - Model and texture files can be large and can trigger worst-case performance.
   - If the repo downloads assets at runtime, validate the origin and size budget.

4. **Be explicit about build and run steps**
   - Provide commands you ran (or a manual plan) and the expected outcomes.
   - Avoid "works on my machine" changes that rely on hidden environment state.

5. **Prefer minimal diffs**
   - Keep edits localized to the feature or bugfix scope.
   - Avoid unrelated formatting changes that hide real diffs.

---

## Script safety

The scripts in `scripts/` are:

- dependency-free (Node.js only)
- read-only scans (they do not modify files)

Review the scripts before enabling them in security-sensitive environments.

---

## Optional: tool restriction

Claude Code supports an `allowed-tools` frontmatter field in `SKILL.md`.
If you distribute this Skill to a restrictive environment, consider adding an allowlist such as:

- Read, Grep, Glob (read-only usage), or
- Read, Edit, Write, Grep, Glob (local editing without shell access)

Avoid allowing unrestricted shell access unless your environment already trusts it.

---

## Reporting issues

If you find a dangerous or misleading instruction in this Skill, open an issue or submit a patch with:

- the problematic text
- the risk scenario
- a safer alternative
