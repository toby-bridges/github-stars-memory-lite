import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {
  fileExists,
  makeTempDataDir,
  runSkillScript,
} from './test-helpers.mjs';

const tempDir = await makeTempDataDir('security');
const configPath = path.join(tempDir, 'config.json');
const secret = 'fixture-secret-token-abc123';
const dataArgs = ['--data-dir', tempDir];

const defaultCheck = runSkillScript('set-token.mjs', [
  ...dataArgs,
  `--token=${secret}`,
  '--skip-validate',
]);
assertCleanOutput(defaultCheck);
assert.match(defaultCheck.stdout, /saved_to_disk: false/);
assert.equal(await fileExists(configPath), false);

const emptyStatus = runSkillScript('token-status.mjs', dataArgs);
assertCleanOutput(emptyStatus);
assert.match(emptyStatus.stdout, /token_source: none/);
assert.match(emptyStatus.stdout, /saved_to_disk: false/);

const savedCheck = runSkillScript('set-token.mjs', [
  ...dataArgs,
  `--token=${secret}`,
  '--skip-validate',
  '--save=true',
]);
assertCleanOutput(savedCheck);
assert.match(savedCheck.stdout, /saved_to_disk: true/);
assert.equal(await fileExists(configPath), true);

const savedConfig = JSON.parse(await fsp.readFile(configPath, 'utf8'));
assert.equal(savedConfig.github_token, secret);

const savedStatus = runSkillScript('token-status.mjs', dataArgs);
assertCleanOutput(savedStatus);
assert.match(savedStatus.stdout, /token_source: config:github_token/);
assert.match(savedStatus.stdout, /saved_to_disk: true/);

const health = runSkillScript('health.mjs', dataArgs);
assertCleanOutput(health);
assert.match(health.stdout, /token_saved_to_disk: true/);

console.log('# Security Regression Test Complete');
console.log('');
console.log(`- data_dir: ${tempDir}`);
console.log('- default token persistence: off');
console.log('- explicit token persistence: ok');
console.log('- token output redaction: ok');
console.log('- token status source reporting: ok');

function assertCleanOutput(result) {
  assert.equal(result.stdout.includes(secret), false, 'stdout leaked token');
  assert.equal(result.stderr.includes(secret), false, 'stderr leaked token');
}
