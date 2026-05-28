import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { makeTempDataDir, runSkillScript } from './test-helpers.mjs';

const tempDir = await makeTempDataDir('large-search');
const storePath = path.join(tempDir, 'store.json');
const targetRepo = {
  id: 4242,
  name: 'deep-vector-memory',
  full_name: 'example/deep-vector-memory',
  description: 'Vector memory database for local agent research.',
  html_url: 'https://github.com/example/deep-vector-memory',
  stargazers_count: 5000,
  language: 'TypeScript',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-05-20T00:00:00Z',
  pushed_at: '2026-05-20T00:00:00Z',
  starred_at: '2026-05-21T00:00:00Z',
  owner: { login: 'example', avatar_url: '' },
  topics: ['vector', 'memory', 'agents'],
  custom_description: 'Evaluate for Hermes GitHub stars memory retrieval.',
  custom_tags: ['hermes', 'search'],
  custom_category: 'want-to-try',
  subscribed_to_releases: true,
  last_edited: '2026-05-21T00:00:00Z',
};

const repositories = Array.from({ length: 5000 }, (_, index) => ({
  id: index + 1,
  name: `repo-${index + 1}`,
  full_name: `fixture/repo-${index + 1}`,
  description: 'Generic developer tooling fixture repository.',
  html_url: `https://github.com/fixture/repo-${index + 1}`,
  stargazers_count: index % 1000,
  language: index % 2 === 0 ? 'JavaScript' : 'Go',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  pushed_at: '2026-05-01T00:00:00Z',
  starred_at: '2026-05-01T00:00:00Z',
  owner: { login: 'fixture', avatar_url: '' },
  topics: ['tooling'],
  custom_description: '',
  custom_tags: [],
  custom_category: '',
  subscribed_to_releases: false,
  last_edited: '',
}));
repositories[4241] = targetRepo;

await fsp.writeFile(storePath, `${JSON.stringify({
  version: 1,
  repositories,
  releases: [],
  updated_at: '2026-05-21T00:00:00Z',
}, null, 2)}\n`);

const startedAt = Date.now();
const result = runSkillScript('find.mjs', [
  '--data-dir',
  tempDir,
  '--query',
  'vector memory',
  '--limit',
  '3',
]);
const durationMs = Date.now() - startedAt;

assert.match(result.stdout, /example\/deep-vector-memory/);
assert.ok(durationMs < 5000, `large fixture search was unexpectedly slow: ${durationMs}ms`);

console.log('# Large Fixture Search Test Complete');
console.log('');
console.log(`- data_dir: ${tempDir}`);
console.log(`- repositories: ${repositories.length}`);
console.log(`- duration_ms: ${durationMs}`);
console.log('- target repo retrieval: ok');
