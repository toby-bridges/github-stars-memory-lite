import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileExists, skillDir } from './test-helpers.mjs';

const skillPath = path.join(skillDir, 'SKILL.md');
const skillMd = await fsp.readFile(skillPath, 'utf8');

assert.match(skillMd, /^---\n[\s\S]+?\n---\n/);
assert.match(skillMd, /^name:\s*github-stars-memory-lite$/m);
assert.match(skillMd, /^description:\s*.+$/m);
assert.match(skillMd, /^version:\s*\d+\.\d+\.\d+$/m);
assert.match(skillMd, /^required_environment_variables:/m);
assert.match(skillMd, /name:\s*GITHUB_STARS_MEMORY_GITHUB_TOKEN/);
assert.match(skillMd, /^metadata:\n\s+hermes:/m);
assert.match(skillMd, /category:\s*productivity/);
assert.doesNotMatch(skillMd, /!\`/);
assert.doesNotMatch(skillMd, /node scripts\//);

const scriptRefs = uniqueMatches(
  skillMd,
  /\$\{HERMES_SKILL_DIR\}\/scripts\/([A-Za-z0-9._-]+\.mjs)/g
);
assert.ok(scriptRefs.length >= 7, 'expected SKILL.md to reference bundled scripts');

for (const scriptName of scriptRefs) {
  assert.equal(
    await fileExists(path.join(skillDir, 'scripts', scriptName)),
    true,
    `missing referenced script: ${scriptName}`
  );
}

const referenceRefs = uniqueMatches(skillMd, /`(references\/[^`]+)`/g);
assert.ok(referenceRefs.length >= 1, 'expected SKILL.md to reference at least one reference file');

for (const referencePath of referenceRefs) {
  assert.equal(
    await fileExists(path.join(skillDir, referencePath)),
    true,
    `missing referenced file: ${referencePath}`
  );
}

console.log('# Hermes Packaging Test Complete');
console.log('');
console.log('- SKILL.md frontmatter: ok');
console.log('- required env var declaration: ok');
console.log(`- bundled script references: ${scriptRefs.length}`);
console.log(`- reference files: ${referenceRefs.length}`);
console.log('- no inline shell snippets: ok');

function uniqueMatches(text, pattern) {
  return [...new Set([...text.matchAll(pattern)].map((match) => match[1]))];
}
