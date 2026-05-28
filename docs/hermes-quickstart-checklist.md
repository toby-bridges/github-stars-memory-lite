# Hermes Quickstart Checklist

Use this on the machine that already has Hermes installed.

## 1. Clone

```bash
git clone https://github.com/toby-bridges/github-stars-memory-lite.git
cd github-stars-memory-lite
```

## 2. Register Skill

Add to `~/.hermes/config.yaml`:

```yaml
skills:
  external_dirs:
    - /absolute/path/to/github-stars-memory-lite/skills
```

Restart Hermes or reset the current session.

## 3. Save Token

```bash
node skills/github-stars-memory-lite/scripts/set-token.mjs --token "ghp_..."
```

You can also use an environment variable:

```bash
export GITHUB_STARS_MEMORY_GITHUB_TOKEN="ghp_..."
```

## 4. Dogfood Loop

```bash
node skills/github-stars-memory-lite/scripts/health.mjs
node skills/github-stars-memory-lite/scripts/sync-stars.mjs
node skills/github-stars-memory-lite/scripts/find.mjs --query "macos automation"
node skills/github-stars-memory-lite/scripts/annotate.mjs --repo "owner/name" --note "why this matters" --status "want-to-try" --tags "automation,macos" --subscribe true
node skills/github-stars-memory-lite/scripts/refresh-releases.mjs --subscribed-only true
node skills/github-stars-memory-lite/scripts/digest.mjs --days 14 --limit 10
```

## Success Check

- `health` shows token and store status
- `sync-stars` pulls your starred repositories
- `find` returns a repo you actually wanted
- `annotate` writes your private note/status/tags
- `refresh-releases` fetches releases for subscribed repos
- `digest` shows recent releases after refresh
