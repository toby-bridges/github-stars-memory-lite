# Security and Module Boundaries

This Lite skill is designed around a simple rule: secrets stay outside the code and outside the local store unless the user explicitly opts in.

## Current Security Posture

- GitHub token source order: `--token`, `GITHUB_STARS_MEMORY_GITHUB_TOKEN`, `GITHUB_TOKEN`, then legacy `config.json`.
- `set-token.mjs` validates a token but does not save it by default.
- `token-status.mjs` reports token source without printing the token.
- Data files are local JSON under `~/.github-stars-memory-lite/` by default.
- Local data directory is created with owner-only permissions.
- Offline tests use fixtures and scrub inherited GitHub token environment variables.

## Modules Worth Keeping Separate

- **Token Provider**: resolves token source, reports whether it is persisted, and never logs the token.
- **GitHub Client**: owns API headers, pagination, error messages, and future rate-limit handling.
- **Local Store**: owns JSON read/write, file permissions, migrations, and backup/export behavior.
- **Search Engine**: owns ranking and matching, so it can later move from keyword scoring to embeddings without touching sync.
- **Annotation Layer**: owns private notes, tags, status, and release subscriptions.
- **Release Tracker**: owns release refresh and digest generation.
- **Hermes Adapter**: owns `SKILL.md`, Hermes install docs, and agent-facing command recipes.

## Trust-Building Features To Add Later

- `doctor.mjs`: verify Node version, token source, data directory permissions, store readability, and GitHub reachability.
- `export.mjs`: export user annotations and stars as portable JSON or Markdown.
- `redact.mjs`: print a shareable debug report with tokens and private notes removed.
- `backup.mjs`: create timestamped local backups before migrations.
- `public-stars.mjs`: support public-star discovery without token for users who want a zero-secret first run.
- `rate-limit.mjs`: show GitHub API quota before long sync jobs.

## Product Principle

For a Hermes skill, user trust matters more than a rich backend. The first dogfood loop should make the user feel in control: visible token source, no surprise persistence, local files they can inspect, and commands that are easy to rerun.
