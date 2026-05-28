import process from 'node:process';
import { loadStore, matchRepository, parseArgs, parseBoolean, saveStore } from './common.mjs';

const args = parseArgs(process.argv.slice(2));
const selector = args.repo || args.id || '';

if (!selector) {
  console.error('Usage: node scripts/annotate.mjs --repo "owner/name" --note "..." --status "want-to-try" --tags "ai,agent"');
  process.exit(1);
}

try {
  const store = await loadStore(args);
  const index = store.repositories.findIndex((repo) => matchRepository(repo, selector));

  if (index === -1) {
    throw new Error(`Repository not found: ${selector}`);
  }

  const repo = store.repositories[index];
  const updated = {
    ...repo,
    ...(args.note !== undefined ? { custom_description: args.note } : {}),
    ...(args.status !== undefined ? { custom_category: args.status } : {}),
    ...(args.tags !== undefined
      ? {
          custom_tags: args.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        }
      : {}),
    ...(args.subscribe !== undefined ? { subscribed_to_releases: parseBoolean(args.subscribe) } : {}),
    last_edited: new Date().toISOString(),
  };

  store.repositories[index] = updated;
  await saveStore(store, args);

  console.log(`# Updated ${updated.full_name}`);
  console.log('');
  console.log(`- status: ${updated.custom_category || 'none'}`);
  console.log(`- why: ${updated.custom_description || 'none'}`);
  console.log(`- tags: ${updated.custom_tags.join(', ') || 'none'}`);
  console.log(`- subscribed_to_releases: ${updated.subscribed_to_releases ? 'true' : 'false'}`);
} catch (error) {
  console.error(`Annotate failed: ${error.message}`);
  process.exitCode = 1;
}
