import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_STORE = {
  version: 1,
  repositories: [],
  releases: [],
  updated_at: null,
};

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

export function getDataDir(args = {}) {
  return path.resolve(
    args['data-dir']
    || process.env.GITHUB_STARS_MEMORY_DATA_DIR
    || path.join(os.homedir(), '.github-stars-memory-lite')
  );
}

export async function ensureDataDir(args = {}) {
  const dataDir = getDataDir(args);
  await fsp.mkdir(dataDir, { recursive: true, mode: 0o700 });
  return dataDir;
}

export function getConfigPath(args = {}) {
  return path.join(getDataDir(args), 'config.json');
}

export function getStorePath(args = {}) {
  return path.join(getDataDir(args), 'store.json');
}

async function readJson(filePath, fallback) {
  try {
    const text = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(text);
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeJson(filePath, value, options = {}) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const tempPath = `${filePath}.tmp`;
  await fsp.writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, { mode: options.mode || 0o600 });
  await fsp.rename(tempPath, filePath);
  if (options.mode) await fsp.chmod(filePath, options.mode);
}

export async function loadConfig(args = {}) {
  await ensureDataDir(args);
  return readJson(getConfigPath(args), {});
}

export async function saveConfig(config, args = {}) {
  await writeJson(getConfigPath(args), config, { mode: 0o600 });
}

export async function loadStore(args = {}) {
  await ensureDataDir(args);
  const store = await readJson(getStorePath(args), DEFAULT_STORE);
  return {
    ...DEFAULT_STORE,
    ...store,
    repositories: Array.isArray(store.repositories) ? store.repositories : [],
    releases: Array.isArray(store.releases) ? store.releases : [],
  };
}

export async function saveStore(store, args = {}) {
  await writeJson(getStorePath(args), {
    ...store,
    version: 1,
    updated_at: new Date().toISOString(),
  });
}

export async function getGitHubToken(args = {}) {
  const config = await loadConfig(args);
  return (
    args.token
    || process.env.GITHUB_STARS_MEMORY_GITHUB_TOKEN
    || process.env.GITHUB_TOKEN
    || config.github_token
    || ''
  );
}

export async function githubRequest(apiPath, args = {}, options = {}) {
  const token = await getGitHubToken(args);
  if (!token) {
    throw new Error('GitHub token is missing. Run set-token.mjs or set GITHUB_STARS_MEMORY_GITHUB_TOKEN.');
  }

  const response = await fetch(`https://api.github.com${apiPath}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: options.accept || 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'github-stars-memory-lite',
      ...(options.headers || {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.message)
      || `${response.status} ${response.statusText}`;
    throw new Error(String(message));
  }

  return payload;
}

export function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchAllStarred(args = {}) {
  const perPage = Number.parseInt(args['per-page'] || '100', 10);
  const maxPages = Number.parseInt(args['max-pages'] || '100', 10);
  const results = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const batch = await githubRequest(
      `/user/starred?page=${page}&per_page=${perPage}&sort=updated`,
      args,
      { accept: 'application/vnd.github.star+json' }
    );

    if (!Array.isArray(batch) || batch.length === 0) break;
    results.push(...batch);
    if (batch.length < perPage) break;
  }

  return results;
}

export async function fetchReleases(fullName, args = {}) {
  const perPage = Number.parseInt(args['per-repo'] || '20', 10);
  const [owner, repo] = String(fullName || '').split('/');

  if (!owner || !repo) {
    throw new Error(`Invalid repository name: ${fullName}`);
  }

  const releases = await githubRequest(
    `/repos/${owner}/${repo}/releases?per_page=${perPage}`,
    args
  );

  return Array.isArray(releases) ? releases : [];
}

export function normalizeStarredItem(starredItem, existingRepo) {
  const repo = starredItem?.repo ?? starredItem;
  if (!repo || typeof repo !== 'object') {
    throw new Error('Unexpected starred repository payload');
  }

  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description || '',
    html_url: repo.html_url,
    stargazers_count: repo.stargazers_count || 0,
    language: repo.language || '',
    created_at: repo.created_at || '',
    updated_at: repo.updated_at || '',
    pushed_at: repo.pushed_at || '',
    starred_at: starredItem?.starred_at || existingRepo?.starred_at || '',
    owner: {
      login: repo.owner?.login || '',
      avatar_url: repo.owner?.avatar_url || '',
    },
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    custom_description: existingRepo?.custom_description || '',
    custom_tags: Array.isArray(existingRepo?.custom_tags) ? existingRepo.custom_tags : [],
    custom_category: existingRepo?.custom_category || '',
    subscribed_to_releases: Boolean(existingRepo?.subscribed_to_releases),
    last_edited: existingRepo?.last_edited || '',
  };
}

export function normalizeRelease(release, repo, existingRelease) {
  return {
    id: release.id,
    tag_name: release.tag_name || '',
    name: release.name || release.tag_name || '',
    body: release.body || '',
    html_url: release.html_url || '',
    published_at: release.published_at || '',
    prerelease: Boolean(release.prerelease),
    draft: Boolean(release.draft),
    is_read: Boolean(existingRelease?.is_read),
    assets: Array.isArray(release.assets)
      ? release.assets.map((asset) => ({
          id: asset.id,
          name: asset.name,
          size: asset.size,
          browser_download_url: asset.browser_download_url,
        }))
      : [],
    repository: {
      id: repo.id,
      full_name: repo.full_name,
      name: repo.name,
    },
  };
}

export function matchRepository(repo, selector) {
  return (
    String(repo.id) === String(selector)
    || repo.full_name === selector
    || repo.name === selector
  );
}

export function scoreRepository(repo, query) {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) return 0;

  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  const fields = {
    name: String(repo.name || '').toLowerCase(),
    fullName: String(repo.full_name || '').toLowerCase(),
    description: String(repo.description || '').toLowerCase(),
    language: String(repo.language || '').toLowerCase(),
    topics: Array.isArray(repo.topics) ? repo.topics.join(' ').toLowerCase() : '',
    note: String(repo.custom_description || '').toLowerCase(),
    tags: Array.isArray(repo.custom_tags) ? repo.custom_tags.join(' ').toLowerCase() : '',
    status: String(repo.custom_category || '').toLowerCase(),
  };

  const hasMatch = words.some((word) =>
    Object.values(fields).some((value) => value.includes(word))
  );
  if (!hasMatch) return 0;

  let score = 0;
  for (const word of words) {
    if (fields.name.includes(word)) score += 0.45;
    if (fields.fullName.includes(word)) score += 0.35;
    if (fields.description.includes(word)) score += 0.25;
    if (fields.note.includes(word)) score += 0.35;
    if (fields.tags.includes(word)) score += 0.3;
    if (fields.topics.includes(word)) score += 0.25;
    if (fields.language.includes(word)) score += 0.12;
    if (fields.status.includes(word)) score += 0.15;
  }

  if (fields.name === normalizedQuery) score += 0.5;
  if (fields.fullName.includes(normalizedQuery)) score += 0.25;
  score += Math.log10((repo.stargazers_count || 0) + 1) * 0.05;
  return score;
}

export function formatDate(isoString) {
  if (!isoString) return 'unknown';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'unknown';
  return date.toISOString().slice(0, 10);
}

export function withinLastDays(isoString, days) {
  if (!isoString) return false;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= Number(days) * 24 * 60 * 60 * 1000;
}

export function storeExists(args = {}) {
  return fs.existsSync(getStorePath(args));
}
