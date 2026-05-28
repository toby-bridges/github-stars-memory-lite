import process from 'node:process';
import {
  fetchAllStarred,
  loadStore,
  normalizeStarredItem,
  parseArgs,
  saveStore,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

try {
  const store = await loadStore(args);
  const existingById = new Map(store.repositories.map((repo) => [repo.id, repo]));
  const starred = await fetchAllStarred(args);
  const repositories = starred.map((item) => {
    const repo = item?.repo ?? item;
    return normalizeStarredItem(item, existingById.get(repo.id));
  });

  const nextStore = {
    ...store,
    repositories,
  };

  if (args['dry-run'] === 'true') {
    console.log('# Sync Preview');
    console.log('');
    console.log(`- fetched: ${repositories.length}`);
    console.log(`- existing: ${store.repositories.length}`);
    process.exit(0);
  }

  await saveStore(nextStore, args);

  console.log('# Sync Complete');
  console.log('');
  console.log(`- repositories: ${repositories.length}`);
  console.log('- preserved: notes, tags, status, release subscriptions');
} catch (error) {
  console.error(`Sync failed: ${error.message}`);
  process.exitCode = 1;
}
