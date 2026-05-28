# GitHub Stars Memory Lite

A lightweight Hermes skill for turning GitHub stars into local memory.

This repo is intentionally small:

- no backend server
- no database
- no npm install
- no React app
- no Electron build

It stores data in local JSON under `~/.github-stars-memory-lite/` and talks to the GitHub API directly from Node scripts.

## Quickstart

```bash
hermes skills inspect toby-bridges/github-stars-memory-lite/skills/github-stars-memory-lite
hermes skills install toby-bridges/github-stars-memory-lite/skills/github-stars-memory-lite
export GITHUB_STARS_MEMORY_GITHUB_TOKEN="ghp_..."
node ~/.hermes/skills/github-stars-memory-lite/scripts/set-token.mjs
```

Requires Node 18+.

## Local Development Setup

Before changing the skill, read the local Hermes standard:

```bash
sed -n '1,220p' docs/hermes-skill-best-practices.md
```

Clone the repo when you want to dogfood unreleased changes:

```bash
git clone https://github.com/toby-bridges/github-stars-memory-lite.git
cd github-stars-memory-lite
node scripts/smoke-test.mjs
node scripts/mock-test.mjs
node scripts/unit-test.mjs
node scripts/hermes-packaging-test.mjs
node scripts/security-regression-test.mjs
node scripts/store-preservation-test.mjs
node scripts/failure-path-test.mjs
node scripts/live-github-dry-run-test.mjs
node scripts/large-fixture-search-test.mjs
export GITHUB_STARS_MEMORY_GITHUB_TOKEN="ghp_..."
node skills/github-stars-memory-lite/scripts/set-token.mjs
node skills/github-stars-memory-lite/scripts/sync-stars.mjs
node skills/github-stars-memory-lite/scripts/find.mjs --query "macos automation"
```

For a local Hermes checkout, add this repo's `skills/` directory to `~/.hermes/config.yaml`:

```yaml
skills:
  external_dirs:
    - /absolute/path/to/github-stars-memory-lite/skills
```

Restart Hermes or reset the current session.

## Commands

```bash
node scripts/smoke-test.mjs
node scripts/mock-test.mjs
node scripts/unit-test.mjs
node scripts/hermes-packaging-test.mjs
node scripts/security-regression-test.mjs
node scripts/store-preservation-test.mjs
node scripts/failure-path-test.mjs
node scripts/live-github-dry-run-test.mjs
node scripts/large-fixture-search-test.mjs
node skills/github-stars-memory-lite/scripts/health.mjs
node skills/github-stars-memory-lite/scripts/token-status.mjs
node skills/github-stars-memory-lite/scripts/set-token.mjs
node skills/github-stars-memory-lite/scripts/sync-stars.mjs
node skills/github-stars-memory-lite/scripts/find.mjs --query "agent framework"
node skills/github-stars-memory-lite/scripts/annotate.mjs --repo "owner/name" --note "why this matters" --status "want-to-try" --tags "agent,tooling"
node skills/github-stars-memory-lite/scripts/refresh-releases.mjs --subscribed-only false
node skills/github-stars-memory-lite/scripts/digest.mjs --days 14 --limit 10
```

## Data

Default data directory:

```text
~/.github-stars-memory-lite/
```

Files:

- `config.json`: local settings; GitHub token only if explicitly saved with `--save true`
- `store.json`: repositories, annotations, and releases

Override the data directory with:

```bash
export GITHUB_STARS_MEMORY_DATA_DIR="/path/to/data"
```

Use an environment variable for the GitHub token:

```bash
export GITHUB_STARS_MEMORY_GITHUB_TOKEN="ghp_..."
```

## Why This Exists

This project was extracted from a heavier GithubStarsManager-based workflow.

The goal is to keep the Hermes path fast and portable while preserving the core value:

- remember why a repo was starred
- find starred repos by intent
- track releases with low overhead

For the one-page setup checklist, see [docs/hermes-quickstart-checklist.md](docs/hermes-quickstart-checklist.md).

For Hermes skill authoring rules, see [docs/hermes-skill-best-practices.md](docs/hermes-skill-best-practices.md).

For security boundaries and future module extraction ideas, see [docs/security-and-modules.md](docs/security-and-modules.md).
