# Hermes Skill Best Practices

Project-local standard for maintaining `github-stars-memory-lite` as a Hermes skill.

Last verified: 2026-05-28

Primary sources:

- https://hermes-agent.nousresearch.com/docs/developer-guide/creating-skills
- https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- https://github.com/NousResearch/hermes-agent

## Lookup Rule

Before changing this project, read this file first.

Use online Hermes docs only when:

- this file does not cover the behavior being changed
- Hermes install, publishing, security, or frontmatter behavior appears to have changed
- the user explicitly asks to re-verify against upstream Hermes docs
- the local standard is older than the risk level of the change allows

When online verification changes the conclusion, update this file in the same commit.

## Skill or Tool

Use a Hermes skill when the capability can be expressed as instructions, scripts, shell commands, and existing Hermes tools.

Use a Hermes tool only when the capability needs precise runtime integration, complex auth flows, streaming/binary handling, or agent-core changes.

For this project, keep it a skill:

- Node scripts are enough.
- No backend is required.
- No npm install is required.
- GitHub token handling can stay in environment variables.

## Directory Shape

The installable skill lives at:

```text
skills/github-stars-memory-lite/
├── SKILL.md
├── references/
└── scripts/
```

Rules:

- `SKILL.md` is required.
- `scripts/` is for deterministic helper logic.
- `references/` is for deeper docs that the agent loads only when needed.
- Keep user-facing setup docs outside the installable skill directory unless the skill itself needs them at runtime.

## SKILL.md Frontmatter

Use standard Hermes-compatible YAML frontmatter:

```yaml
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
    help: Recommended token source.
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
```

Use `metadata.hermes.config` only for non-secret settings such as paths and preferences.

Use `required_environment_variables` for API keys, tokens, and other secrets.

Use `required_credential_files` only for credential files such as OAuth token JSON, client secrets, certificates, or service-account files.

## Secrets and Trust

Hermes treats declared `required_environment_variables` as secure setup values.

Project rules:

- Prefer `GITHUB_STARS_MEMORY_GITHUB_TOKEN`.
- Do not ask users to paste tokens into chat transcripts.
- Do not save tokens locally by default.
- Never print token values.
- Provide a token-source check that does not reveal the token.
- Store private annotations locally and make the data path visible to the user.

Current implementation:

- `set-token.mjs` validates a token but saves only with `--save true`.
- `token-status.mjs` reports source and persistence without printing the token.
- `health.mjs` reports whether a token is configured and whether it is saved to disk.

## Script Invocation

Inside `SKILL.md`, reference bundled scripts with:

```bash
node ${HERMES_SKILL_DIR}/scripts/script-name.mjs
```

Do not rely on the current working directory from inside `SKILL.md`.

Hermes substitutes `${HERMES_SKILL_DIR}` with the absolute skill directory when the skill is loaded.

Avoid inline shell snippets in `SKILL.md`. Hermes supports them only when explicitly enabled, and they run on the host, so they are not a good default for this project.

## Progressive Disclosure

Keep the most common workflow in `SKILL.md`.

Move deeper details to:

- `references/workflows.md` for command recipes
- `docs/hermes-quickstart-checklist.md` for human setup
- `docs/security-and-modules.md` for product/security boundaries
- this file for Hermes skill authoring rules

The goal is a small activation payload and deterministic scripts for anything that should not be improvised by the model.

## Install and Sharing

Recommended direct install:

```bash
hermes skills inspect toby-bridges/github-stars-memory-lite/skills/github-stars-memory-lite
hermes skills install toby-bridges/github-stars-memory-lite/skills/github-stars-memory-lite
```

For local development, use `skills.external_dirs` in `~/.hermes/config.yaml`:

```yaml
skills:
  external_dirs:
    - /absolute/path/to/github-stars-memory-lite/skills
```

Hermes also supports taps:

```bash
hermes skills tap add owner/repo
hermes skills install owner/repo/skill-name
```

Direct GitHub skill install works with:

```bash
hermes skills install owner/repo/skills/my-workflow
```

## Validation

Run these locally before committing changes:

```bash
node --check skills/github-stars-memory-lite/scripts/*.mjs scripts/*.mjs
node scripts/smoke-test.mjs
node scripts/mock-test.mjs
node scripts/unit-test.mjs
node scripts/hermes-packaging-test.mjs
node scripts/security-regression-test.mjs
node scripts/store-preservation-test.mjs
node scripts/failure-path-test.mjs
node scripts/live-github-dry-run-test.mjs
node scripts/large-fixture-search-test.mjs
```

On a machine with Hermes installed, validate the actual skill path:

```bash
hermes skills inspect toby-bridges/github-stars-memory-lite/skills/github-stars-memory-lite
hermes chat --toolsets skills -q "Use the github-stars-memory-lite skill and check local health"
```

If a change touches install behavior, also test a fresh `hermes skills install`.

## Maintenance Defaults

- Keep the Lite version dependency-free.
- Prefer environment variables over config files for secrets.
- Keep GitHub API logic separate from local storage.
- Keep local storage separate from search/ranking.
- Add tests for safety behavior before adding convenience behavior.
- If a feature would require a backend, treat it as a separate product track, not Lite scope creep.
