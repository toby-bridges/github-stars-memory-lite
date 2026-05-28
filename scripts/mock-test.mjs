import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'github-stars-memory-lite-mock-'));
const storePath = path.join(tempDir, 'store.json');
const configPath = path.join(tempDir, 'config.json');
const starredPath = path.join(rootDir, 'fixtures', 'starred-response.json');
const releasesPath = path.join(rootDir, 'fixtures', 'releases-response.json');
const scriptDir = path.join(rootDir, 'skills', 'github-stars-memory-lite', 'scripts');

function run(name, args) {
  const result = spawnSync('node', [
    path.join(scriptDir, name),
    '--data-dir',
    tempDir,
    ...args,
  ], {
    encoding: 'utf8',
    env: {
      ...process.env,
      GITHUB_STARS_MEMORY_GITHUB_TOKEN: '',
      GITHUB_TOKEN: '',
    },
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.stderr.write(result.stdout);
    throw new Error(`${name} failed`);
  }

  return result.stdout;
}

const tokenStatus = run('token-status.mjs', []);
assert.match(tokenStatus, /token_configured: false/);
assert.match(tokenStatus, /token_source: none/);

const syncPreview = run('sync-stars.mjs', [
  '--dry-run=true',
  '--mock-starred-file',
  starredPath,
]);
assert.match(syncPreview, /fetched: 2/);

const sync = run('sync-stars.mjs', ['--mock-starred-file', starredPath]);
assert.match(sync, /repositories: 2/);

const storeAfterSync = JSON.parse(await fsp.readFile(storePath, 'utf8'));
assert.equal(storeAfterSync.repositories.length, 2);
assert.equal(storeAfterSync.repositories[0].full_name, 'example/automation-kit');

const refresh = run('refresh-releases.mjs', [
  '--subscribed-only=false',
  '--mock-releases-file',
  releasesPath,
]);
assert.match(refresh, /releases fetched: 2/);

const storeAfterRefresh = JSON.parse(await fsp.readFile(storePath, 'utf8'));
assert.equal(storeAfterRefresh.releases.length, 2);
assert.equal(await fileExists(configPath), false);

const digest = run('digest.mjs', ['--days', '30', '--subscribed-only=false']);
assert.match(digest, /example\/automation-kit/);
assert.match(digest, /example\/agent-runtime/);

console.log('# Mock Test Complete');
console.log('');
console.log(`- data_dir: ${tempDir}`);
console.log('- token-free fixture path: ok');
console.log('- mock star sync: ok');
console.log('- mock release refresh: ok');
console.log('- no token config written: ok');
console.log('- digest from mock data: ok');

async function fileExists(filePath) {
  try {
    await fsp.access(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}
