import assert from 'node:assert/strict';
import { makeTempDataDir, runSkillScript } from './test-helpers.mjs';

const hasToken = Boolean(
  process.env.GITHUB_STARS_MEMORY_GITHUB_TOKEN
  || process.env.GITHUB_TOKEN
);

if (!hasToken) {
  console.log('# Live GitHub Dry-Run Test Skipped');
  console.log('');
  console.log('- reason: GITHUB_STARS_MEMORY_GITHUB_TOKEN or GITHUB_TOKEN is not set');
  console.log('- safety: no real GitHub API call was made');
  process.exit(0);
}

const tempDir = await makeTempDataDir('live');
const result = runSkillScript('sync-stars.mjs', [
  '--data-dir',
  tempDir,
  '--dry-run=true',
  '--max-pages=1',
  '--per-page=5',
], {
  env: process.env,
});

assert.match(result.stdout, /# Sync Preview/);
assert.match(result.stdout, /fetched: \d+/);

console.log('# Live GitHub Dry-Run Test Complete');
console.log('');
console.log(`- data_dir: ${tempDir}`);
console.log('- real GitHub API: reachable');
console.log('- mode: dry-run');
console.log('- store write: skipped');
