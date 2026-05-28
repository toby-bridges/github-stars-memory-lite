import process from 'node:process';
import { formatDate, loadStore, parseArgs, positiveInteger, scoreRepository } from './common.mjs';

const args = parseArgs(process.argv.slice(2));
const query = args.query || args.q || '';
const limit = positiveInteger(args.limit, 10);

if (!query.trim()) {
  console.error('Usage: node scripts/find.mjs --query "macos automation"');
  process.exit(1);
}

try {
  const store = await loadStore(args);
  const results = store.repositories
    .map((repo) => ({ repo, score: scoreRepository(repo, query) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, limit));

  console.log(`# Results for "${query}"`);
  console.log('');

  if (results.length === 0) {
    console.log('No matching repositories were found.');
    process.exit(0);
  }

  for (const [index, item] of results.entries()) {
    const { repo, score } = item;
    const tags = Array.isArray(repo.custom_tags) && repo.custom_tags.length > 0
      ? repo.custom_tags.join(', ')
      : 'none';

    console.log(`${index + 1}. ${repo.full_name}`);
    console.log(`   score: ${score.toFixed(2)} | language: ${repo.language || 'unknown'} | stars: ${repo.stargazers_count || 0}`);
    console.log(`   starred: ${formatDate(repo.starred_at)} | status: ${repo.custom_category || 'none'} | subscribed: ${repo.subscribed_to_releases ? 'yes' : 'no'}`);
    console.log(`   why: ${repo.custom_description || repo.description || 'no note yet'}`);
    console.log(`   tags: ${tags}`);
    console.log(`   url: ${repo.html_url}`);
    console.log('');
  }
} catch (error) {
  console.error(`Find failed: ${error.message}`);
  process.exitCode = 1;
}
