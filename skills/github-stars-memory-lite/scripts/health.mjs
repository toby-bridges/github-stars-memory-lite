import process from 'node:process';
import {
  getConfigPath,
  getDataDir,
  getGitHubTokenSource,
  getStorePath,
  loadStore,
  parseArgs,
  storeExists,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

try {
  const tokenSource = await getGitHubTokenSource(args);
  const store = await loadStore(args);

  console.log('# GitHub Stars Memory Lite Health');
  console.log('');
  console.log(`- data_dir: ${getDataDir(args)}`);
  console.log(`- config: ${getConfigPath(args)}`);
  console.log(`- store: ${getStorePath(args)}`);
  console.log(`- store_exists: ${storeExists(args) ? 'true' : 'false'}`);
  console.log(`- token_configured: ${tokenSource.token ? 'true' : 'false'}`);
  console.log(`- token_source: ${tokenSource.source}`);
  console.log(`- token_saved_to_disk: ${tokenSource.persisted ? 'true' : 'false'}`);
  console.log(`- repositories: ${store.repositories.length}`);
  console.log(`- releases: ${store.releases.length}`);
  console.log(`- updated_at: ${store.updated_at || 'never'}`);
} catch (error) {
  console.error(`Health check failed: ${error.message}`);
  process.exitCode = 1;
}
