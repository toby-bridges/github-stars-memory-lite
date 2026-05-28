# Hermes Quickstart Checklist

Use this on the machine that already has Hermes installed.

## 1. Install Skill

```bash
hermes skills inspect toby-bridges/github-stars-memory-lite/skills/github-stars-memory-lite
hermes skills install toby-bridges/github-stars-memory-lite/skills/github-stars-memory-lite
```

## 2. Optional Local Clone

Clone only if you want to edit the skill locally:

```bash
git clone https://github.com/toby-bridges/github-stars-memory-lite.git
cd github-stars-memory-lite
```

For a local checkout, add `/absolute/path/to/github-stars-memory-lite/skills` to `skills.external_dirs` in `~/.hermes/config.yaml`, then restart Hermes or reset the current session.

## 3. Smoke Test

```bash
node scripts/unit-test.mjs
node scripts/smoke-test.mjs
```

Run this inside a local clone. It does not call GitHub. It verifies argument parsing, local JSON workflow, sync, annotation, and release digest behavior with fixture data.

## 4. Set Token Environment

```bash
export GITHUB_STARS_MEMORY_GITHUB_TOKEN="ghp_..."
node skills/github-stars-memory-lite/scripts/set-token.mjs
node skills/github-stars-memory-lite/scripts/token-status.mjs
```

`set-token.mjs` validates the token but does not save it by default.

```bash
node skills/github-stars-memory-lite/scripts/set-token.mjs --save true
```

Use `--save true` only when you intentionally want a local copy in `config.json`.

## 5. Dogfood Loop

```bash
node skills/github-stars-memory-lite/scripts/health.mjs
node skills/github-stars-memory-lite/scripts/token-status.mjs
node skills/github-stars-memory-lite/scripts/sync-stars.mjs
node skills/github-stars-memory-lite/scripts/find.mjs --query "macos automation"
node skills/github-stars-memory-lite/scripts/annotate.mjs --repo "owner/name" --note "why this matters" --status "want-to-try" --tags "automation,macos" --subscribe true
node skills/github-stars-memory-lite/scripts/refresh-releases.mjs --subscribed-only true
node skills/github-stars-memory-lite/scripts/digest.mjs --days 14 --limit 10
```

## Success Check

- `health` shows token and store status
- `token-status` shows token source without printing the token
- `smoke-test` passes before real GitHub API calls
- `sync-stars` pulls your starred repositories
- `find` returns a repo you actually wanted
- `annotate` writes your private note/status/tags
- `refresh-releases` fetches releases for subscribed repos
- `digest` shows recent releases after refresh
