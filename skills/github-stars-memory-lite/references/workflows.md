# Workflows

## No Install Path

This skill does not require `npm install`.

It uses Node built-ins and stores data in:

```text
~/.github-stars-memory-lite/
```

Requires Node 18+.

## First Run

```bash
node scripts/smoke-test.mjs
node scripts/set-token.mjs --token "ghp_..."
node scripts/sync-stars.mjs
node scripts/find.mjs --query "agent framework"
```

## Commands

### Health

```bash
node scripts/health.mjs
```

### Save Token

```bash
node scripts/set-token.mjs --token "ghp_..."
```

### Sync Stars

```bash
node scripts/sync-stars.mjs
```

### Find

```bash
node scripts/find.mjs --query "macos automation"
```

### Annotate

```bash
node scripts/annotate.mjs --repo "owner/name" --note "Track for Hermes workflow ideas" --status "want-to-try" --tags "hermes,automation" --subscribe true
```

### Refresh Releases

```bash
node scripts/refresh-releases.mjs --subscribed-only true
node scripts/refresh-releases.mjs --repo "owner/name"
```

### Digest

```bash
node scripts/digest.mjs --days 14 --limit 10
```

## From Repository Root

If running from the repo root, prefix commands with `skills/github-stars-memory-lite/`:

```bash
node skills/github-stars-memory-lite/scripts/health.mjs
```
