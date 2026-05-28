import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  getGitHubTokenSource,
  matchRepository,
  normalizeStarredItem,
  parseArgs,
  parseBoolean,
  positiveInteger,
  scoreRepository,
} from '../skills/github-stars-memory-lite/scripts/common.mjs';

assert.deepEqual(parseArgs(['--query=macos automation', '--limit', '5', '--verbose']), {
  query: 'macos automation',
  limit: '5',
  verbose: 'true',
});

assert.equal(parseBoolean('true'), true);
assert.equal(parseBoolean('yes'), true);
assert.equal(parseBoolean('false', true), false);
assert.equal(parseBoolean(undefined, true), true);

assert.equal(positiveInteger('12', 5), 12);
assert.equal(positiveInteger('0', 5), 5);
assert.equal(positiveInteger('nope', 5), 5);

const tokenTempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'github-stars-memory-lite-unit-'));
const previousToken = process.env.GITHUB_STARS_MEMORY_GITHUB_TOKEN;
process.env.GITHUB_STARS_MEMORY_GITHUB_TOKEN = 'env-token';
try {
  const tokenSource = await getGitHubTokenSource({ 'data-dir': tokenTempDir });
  assert.equal(tokenSource.token, 'env-token');
  assert.equal(tokenSource.source, 'env:GITHUB_STARS_MEMORY_GITHUB_TOKEN');
  assert.equal(tokenSource.persisted, false);
} finally {
  if (previousToken === undefined) {
    delete process.env.GITHUB_STARS_MEMORY_GITHUB_TOKEN;
  } else {
    process.env.GITHUB_STARS_MEMORY_GITHUB_TOKEN = previousToken;
  }
}

const existing = {
  id: 1,
  custom_description: 'keep me',
  custom_tags: ['saved'],
  custom_category: 'research',
  subscribed_to_releases: true,
  last_edited: '2026-05-01T00:00:00Z',
};
const normalized = normalizeStarredItem({
  starred_at: '2026-05-20T00:00:00Z',
  repo: {
    id: 1,
    name: 'demo',
    full_name: 'example/demo',
    html_url: 'https://github.com/example/demo',
    owner: { login: 'example', avatar_url: '' },
  },
}, existing);

assert.equal(normalized.custom_description, 'keep me');
assert.deepEqual(normalized.custom_tags, ['saved']);
assert.equal(normalized.subscribed_to_releases, true);
assert.equal(matchRepository(normalized, 'example/demo'), true);
assert.equal(matchRepository(normalized, 'demo'), true);
assert.equal(matchRepository(normalized, '1'), true);

assert.ok(scoreRepository({
  name: 'automation-kit',
  full_name: 'example/automation-kit',
  description: 'macOS automation toolkit',
  stargazers_count: 1000,
  topics: ['macos'],
  custom_description: '',
  custom_tags: [],
}, 'macos automation') > 0);

console.log('# Unit Test Complete');
console.log('');
console.log('- parseArgs: ok');
console.log('- parseBoolean: ok');
console.log('- positiveInteger: ok');
console.log('- token source: ok');
console.log('- normalizeStarredItem: ok');
console.log('- scoreRepository: ok');
