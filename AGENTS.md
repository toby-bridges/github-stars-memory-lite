# Agent Working Notes

When working on this repository, treat `docs/hermes-skill-best-practices.md` as the local source of truth for Hermes skill authoring.

Before editing any Hermes skill file, install instructions, token behavior, or script layout:

1. Read `docs/hermes-skill-best-practices.md`.
2. Check the current local files.
3. Only consult online Hermes docs if the local standard is missing, stale for the risk involved, or the user asks for upstream verification.

Do not use Codex skill-creator guidance as authority for Hermes skill design. If upstream Hermes docs are checked and differ from the local standard, update `docs/hermes-skill-best-practices.md` in the same change.

Security defaults:

- Prefer environment variables for secrets.
- Do not persist GitHub tokens unless explicitly requested.
- Do not print tokens.
- Keep the Lite skill dependency-free unless the user approves a heavier scope.
