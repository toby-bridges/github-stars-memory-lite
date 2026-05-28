import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {
  fixturesDir,
  makeTempDataDir,
  runSkillScript,
} from './test-helpers.mjs';

const tempDir = await makeTempDataDir('failure');
const storePath = path.join(tempDir, 'store.json');
const badJsonPath = path.join(tempDir, 'bad-starred.json');
const sampleStorePath = path.join(fixturesDir, 'sample-store.json');
const releasesPath = path.join(fixturesDir, 'releases-response.json');
const dataArgs = ['--data-dir', tempDir];

const missingToken = runSkillScript('sync-stars.mjs', dataArgs, { expectFailure: true });
assert.match(missingToken.stderr, /Sync failed: GitHub token is missing/);
assertNoStackTrace(missingToken);

await fsp.writeFile(badJsonPath, '{not-json\n');
const badFixture = runSkillScript('sync-stars.mjs', [
  ...dataArgs,
  '--mock-starred-file',
  badJsonPath,
], { expectFailure: true });
assert.match(badFixture.stderr, /Sync failed:/);
assertNoStackTrace(badFixture);

const missingQuery = runSkillScript('find.mjs', dataArgs, { expectFailure: true });
assert.match(missingQuery.stderr, /Usage: node scripts\/find\.mjs --query/);
assertNoStackTrace(missingQuery);

await fsp.copyFile(sampleStorePath, storePath);
const missingRepo = runSkillScript('annotate.mjs', [
  ...dataArgs,
  '--repo',
  'missing/repo',
  '--note',
  'nope',
], { expectFailure: true });
assert.match(missingRepo.stderr, /Annotate failed: Repository not found: missing\/repo/);
assertNoStackTrace(missingRepo);

const noRefreshTarget = runSkillScript('refresh-releases.mjs', [
  ...dataArgs,
  '--repo',
  'missing/repo',
  '--mock-releases-file',
  releasesPath,
]);
assert.match(noRefreshTarget.stdout, /No repositories matched the refresh filter\./);

const digest = runSkillScript('digest.mjs', [
  ...dataArgs,
  '--days',
  '1',
]);
assert.match(digest.stdout, /No matching releases were found\./);

console.log('# Failure Path CLI Test Complete');
console.log('');
console.log(`- data_dir: ${tempDir}`);
console.log('- missing token error: clear');
console.log('- bad fixture error: clear');
console.log('- missing query usage: clear');
console.log('- missing repo error: clear');
console.log('- empty refresh/digest paths: clear');
console.log('- stack traces hidden: ok');

function assertNoStackTrace(result) {
  const combined = `${result.stdout}\n${result.stderr}`;
  assert.equal(/\n\s+at\s+/.test(combined), false, 'unexpected stack trace in CLI output');
}
