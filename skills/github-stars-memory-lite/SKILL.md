---
name: github-stars-memory-lite
description: Recall GitHub stars with local JSON.
version: 0.2.0
author: toby-bridges
license: MIT
platforms:
  - macos
  - linux
required_environment_variables:
  - name: GITHUB_STARS_MEMORY_GITHUB_TOKEN
    prompt: GitHub personal access token
    help: Recommended token source. The skill does not save this token unless explicitly asked with --save true.
    required_for: syncing GitHub stars and releases
metadata:
  hermes:
    category: productivity
    tags:
      - github
      - stars
      - memory
      - releases
---

# GitHub Stars Memory Lite

## When to Use

Use this skill when the user wants to manage GitHub starred repositories through Hermes without running the full GithubStarsManager backend.

This skill is best for:

- syncing starred repositories into a local JSON store
- finding previously starred repositories by intent
- annotating repositories with private rationale, status, tags, and release subscription
- refreshing release data from GitHub
- producing a short release digest

## Procedure

1. Check local status:
   `node ${HERMES_SKILL_DIR}/scripts/health.mjs`

2. If no token is configured, ask the user to export `GITHUB_STARS_MEMORY_GITHUB_TOKEN`, then validate it:
   `node ${HERMES_SKILL_DIR}/scripts/set-token.mjs`

3. Sync starred repositories:
   `node ${HERMES_SKILL_DIR}/scripts/sync-stars.mjs`

4. Search by intent:
   `node ${HERMES_SKILL_DIR}/scripts/find.mjs --query "..." --limit 10`

5. Annotate a repository:
   `node ${HERMES_SKILL_DIR}/scripts/annotate.mjs --repo "owner/name" --note "..." --status "want-to-try" --tags "agent,tooling" --subscribe true`

6. Refresh releases before a digest:
   `node ${HERMES_SKILL_DIR}/scripts/refresh-releases.mjs --subscribed-only true`

7. Build a digest:
   `node ${HERMES_SKILL_DIR}/scripts/digest.mjs --days 14 --limit 10`

## Safety Checks

- Show token source without printing the token:
  `node ${HERMES_SKILL_DIR}/scripts/token-status.mjs`
- Do not ask the user to save a token unless they explicitly request local persistence.
- If persistence is requested, use:
  `node ${HERMES_SKILL_DIR}/scripts/set-token.mjs --save true`

## Output Style

Prefer concise markdown output:

- repository name and URL
- why/status/tags if present
- release tag and published date when discussing updates
- one line of next action when there is an obvious next step

## Pitfalls

- The local store is JSON, not SQLite. Keep outputs small and avoid writing huge blobs.
- Private repositories require a GitHub token with enough access.
- Prefer environment variables for secrets. Avoid pasting tokens into chat transcripts.
- `refresh-releases` defaults to subscribed repositories. Use `--subscribed-only false` for all synced stars.
- Do not overwrite notes, tags, or status unless the user asked for it.

## References

For local setup and examples, read:

- `references/workflows.md`
