import { spawnSync } from 'node:child_process';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const skillDir = path.join(rootDir, 'skills', 'github-stars-memory-lite');
export const scriptDir = path.join(skillDir, 'scripts');
export const fixturesDir = path.join(rootDir, 'fixtures');

export async function makeTempDataDir(prefix) {
  return fsp.mkdtemp(path.join(os.tmpdir(), `github-stars-memory-lite-${prefix}-`));
}

export function runSkillScript(name, args = [], options = {}) {
  const result = spawnSync('node', [
    path.join(scriptDir, name),
    ...args,
  ], {
    encoding: 'utf8',
    env: options.env || scrubGitHubTokenEnv(),
  });

  if (options.expectFailure) {
    if (result.status === 0) {
      throw new Error(`${name} succeeded but failure was expected`);
    }
    return result;
  }

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.stderr.write(result.stdout);
    throw new Error(`${name} failed`);
  }

  return result;
}

export function scrubGitHubTokenEnv(extra = {}) {
  return {
    ...process.env,
    ...extra,
    GITHUB_STARS_MEMORY_GITHUB_TOKEN: extra.GITHUB_STARS_MEMORY_GITHUB_TOKEN || '',
    GITHUB_TOKEN: extra.GITHUB_TOKEN || '',
  };
}

export async function fileExists(filePath) {
  try {
    await fsp.access(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}
