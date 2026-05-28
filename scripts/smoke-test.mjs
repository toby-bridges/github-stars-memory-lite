import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'github-stars-memory-lite-'));
const storePath = path.join(tempDir, 'store.json');
const fixturePath = path.join(rootDir, 'fixtures', 'sample-store.json');
const starredPath = path.join(rootDir, 'fixtures', 'starred-response.json');
const releasesPath = path.join(rootDir, 'fixtures', 'releases-response.json');
const scriptDir = path.join(rootDir, 'skills', 'github-stars-memory-lite', 'scripts');

await fsp.copyFile(fixturePath, storePath);

function run(name, args) {
  const result = spawnSync('node', [
    path.join(scriptDir, name),
    '--data-dir',
    tempDir,
    ...args,
  ], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.stderr.write(result.stdout);
    throw new Error(`${name} failed`);
  }

  return result.stdout;
}

const health = run('health.mjs', []);
if (!health.includes('repositories: 2')) {
  throw new Error('health output did not include expected repository count');
}

const find = run('find.mjs', ['--query', 'macos automation']);
if (!find.includes('example/automation-kit')) {
  throw new Error('find output did not include example/automation-kit');
}

const annotate = run('annotate.mjs', [
  '--repo',
  'example/agent-runtime',
  '--note',
  'Smoke test note',
  '--status',
  'using',
  '--tags',
  'agent,smoke',
  '--subscribe',
  'true',
]);
if (!annotate.includes('subscribed_to_releases: true')) {
  throw new Error('annotate output did not confirm subscription');
}

const digest = run('digest.mjs', ['--days', '30', '--subscribed-only', 'false']);
if (!digest.includes('example/automation-kit')) {
  throw new Error('digest output did not include example/automation-kit');
}

const token = run('set-token.mjs', ['--token=fixture-token', '--skip-validate']);
if (!token.includes('status: ok')) {
  throw new Error('set-token output did not confirm success');
}

const sync = run('sync-stars.mjs', ['--mock-starred-file', starredPath]);
if (!sync.includes('repositories: 2')) {
  throw new Error('sync-stars output did not include expected repository count');
}

const refresh = run('refresh-releases.mjs', [
  '--subscribed-only=false',
  '--mock-releases-file',
  releasesPath,
]);
if (!refresh.includes('releases fetched: 2')) {
  throw new Error('refresh-releases output did not include expected release count');
}

console.log('# Smoke Test Complete');
console.log('');
console.log(`- data_dir: ${tempDir}`);
console.log('- health: ok');
console.log('- find: ok');
console.log('- annotate: ok');
console.log('- set-token: ok');
console.log('- sync-stars: ok');
console.log('- refresh-releases: ok');
console.log('- digest: ok');
