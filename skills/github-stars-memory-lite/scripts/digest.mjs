import process from 'node:process';
import { formatDate, loadStore, parseArgs, withinLastDays } from './common.mjs';

const args = parseArgs(process.argv.slice(2));
const days = Number.parseInt(args.days || '14', 10);
const limit = Number.parseInt(args.limit || '10', 10);
const subscribedOnly = args['subscribed-only'] !== 'false';

try {
  const store = await loadStore(args);
  const subscribedRepoIds = new Set(
    store.repositories
      .filter((repo) => repo.subscribed_to_releases)
      .map((repo) => repo.id)
  );

  const releases = store.releases
    .filter((release) => withinLastDays(release.published_at, days))
    .filter((release) => subscribedOnly ? subscribedRepoIds.has(release.repository?.id) : true)
    .sort((left, right) => new Date(right.published_at).getTime() - new Date(left.published_at).getTime())
    .slice(0, Math.max(1, limit));

  console.log(`# Release Digest (${days} days)`);
  console.log('');

  if (releases.length === 0) {
    console.log('No matching releases were found.');
    if (subscribedOnly && subscribedRepoIds.size === 0) {
      console.log('');
      console.log('Tip: mark repositories with --subscribe true or run digest with --subscribed-only false.');
    }
    process.exit(0);
  }

  for (const [index, release] of releases.entries()) {
    const assetCount = Array.isArray(release.assets) ? release.assets.length : 0;
    console.log(`${index + 1}. ${release.repository?.full_name || 'unknown repo'} :: ${release.tag_name}`);
    console.log(`   published: ${formatDate(release.published_at)} | prerelease: ${release.prerelease ? 'yes' : 'no'} | assets: ${assetCount}`);
    console.log(`   title: ${release.name || release.tag_name}`);
    console.log(`   url: ${release.html_url || 'none'}`);
    console.log('');
  }
} catch (error) {
  console.error(`Digest failed: ${error.message}`);
  process.exitCode = 1;
}
