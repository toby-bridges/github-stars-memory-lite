import assert from 'node:assert/strict';
import {
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
console.log('- normalizeStarredItem: ok');
console.log('- scoreRepository: ok');
