import process from 'node:process';
import {
  fetchReleases,
  loadStore,
  matchRepository,
  normalizeRelease,
  parseArgs,
  saveStore,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));
const selector = args.repo || '';
const subscribedOnly = args['subscribed-only'] !== 'false';
const maxRepos = Number.parseInt(args['max-repos'] || '100', 10);

try {
  const store = await loadStore(args);
  const existingReleasesById = new Map(store.releases.map((release) => [release.id, release]));
  let targets = store.repositories;

  if (selector) {
    targets = targets.filter((repo) => matchRepository(repo, selector));
  } else if (subscribedOnly) {
    targets = targets.filter((repo) => repo.subscribed_to_releases);
  }

  targets = targets.slice(0, Math.max(1, maxRepos));

  if (targets.length === 0) {
    console.log('# Release Refresh');
    console.log('');
    console.log('No repositories matched the refresh filter.');
    process.exit(0);
  }

  const refreshed = [];
  const failures = [];

  for (const repo of targets) {
    try {
      const releases = await fetchReleases(repo.full_name, args);
      refreshed.push(...releases.map((release) =>
        normalizeRelease(release, repo, existingReleasesById.get(release.id))
      ));
    } catch (error) {
      failures.push({ repository: repo.full_name, error: error.message });
    }
  }

  const untouched = store.releases.filter((release) =>
    !refreshed.some((candidate) => candidate.id === release.id)
  );

  if (args['dry-run'] === 'true') {
    console.log('# Release Refresh Preview');
    console.log('');
    console.log(`- repositories targeted: ${targets.length}`);
    console.log(`- releases fetched: ${refreshed.length}`);
    console.log(`- failures: ${failures.length}`);
    process.exit(0);
  }

  store.releases = [...refreshed, ...untouched]
    .sort((left, right) => new Date(right.published_at).getTime() - new Date(left.published_at).getTime());
  await saveStore(store, args);

  console.log('# Release Refresh Complete');
  console.log('');
  console.log(`- repositories targeted: ${targets.length}`);
  console.log(`- releases fetched: ${refreshed.length}`);
  console.log(`- failures: ${failures.length}`);

  if (failures.length > 0) {
    console.log('');
    console.log('Failed repositories:');
    for (const failure of failures.slice(0, 10)) {
      console.log(`- ${failure.repository}: ${failure.error}`);
    }
  }
} catch (error) {
  console.error(`Release refresh failed: ${error.message}`);
  process.exitCode = 1;
}
