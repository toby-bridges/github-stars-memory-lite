import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {
  fixturesDir,
  makeTempDataDir,
  runSkillScript,
} from './test-helpers.mjs';

const tempDir = await makeTempDataDir('preserve');
const storePath = path.join(tempDir, 'store.json');
const starredPath = path.join(fixturesDir, 'starred-response.json');
const releasesPath = path.join(fixturesDir, 'releases-response.json');

await fsp.writeFile(storePath, `${JSON.stringify({
  version: 1,
  updated_at: '2026-05-01T00:00:00Z',
  repositories: [
    {
      id: 1,
      name: 'automation-kit',
      full_name: 'example/automation-kit',
      custom_description: 'Preserve my private research note',
      custom_tags: ['hermes', 'keep'],
      custom_category: 'using',
      subscribed_to_releases: true,
      last_edited: '2026-05-20T00:00:00Z',
    },
  ],
  releases: [
    {
      id: 101,
      tag_name: 'v0.4.0',
      name: 'Automation Kit v0.4.0',
      body: '',
      html_url: 'https://github.com/example/automation-kit/releases/tag/v0.4.0',
      published_at: '2026-05-20T00:00:00Z',
      prerelease: false,
      draft: false,
      is_read: true,
      assets: [],
      repository: {
        id: 1,
        full_name: 'example/automation-kit',
        name: 'automation-kit',
      },
    },
  ],
}, null, 2)}\n`);

const dataArgs = ['--data-dir', tempDir];
const sync = runSkillScript('sync-stars.mjs', [
  ...dataArgs,
  '--mock-starred-file',
  starredPath,
]);
assert.match(sync.stdout, /repositories: 2/);

const storeAfterSync = JSON.parse(await fsp.readFile(storePath, 'utf8'));
const preservedRepo = storeAfterSync.repositories.find((repo) => repo.id === 1);
assert.equal(preservedRepo.custom_description, 'Preserve my private research note');
assert.deepEqual(preservedRepo.custom_tags, ['hermes', 'keep']);
assert.equal(preservedRepo.custom_category, 'using');
assert.equal(preservedRepo.subscribed_to_releases, true);
assert.equal(preservedRepo.last_edited, '2026-05-20T00:00:00Z');

const newRepo = storeAfterSync.repositories.find((repo) => repo.id === 2);
assert.equal(newRepo.custom_description, '');
assert.deepEqual(newRepo.custom_tags, []);

const refresh = runSkillScript('refresh-releases.mjs', [
  ...dataArgs,
  '--subscribed-only=false',
  '--mock-releases-file',
  releasesPath,
]);
assert.match(refresh.stdout, /releases fetched: 2/);

const storeAfterRefresh = JSON.parse(await fsp.readFile(storePath, 'utf8'));
const preservedRelease = storeAfterRefresh.releases.find((release) => release.id === 101);
assert.equal(preservedRelease.is_read, true);

console.log('# Store Preservation Test Complete');
console.log('');
console.log(`- data_dir: ${tempDir}`);
console.log('- repository notes/tags/status: preserved');
console.log('- release subscriptions: preserved');
console.log('- release read state: preserved');
console.log('- new repositories: initialized cleanly');
