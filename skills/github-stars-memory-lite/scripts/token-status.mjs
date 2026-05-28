import process from 'node:process';
import {
  getConfigPath,
  getDataDir,
  getGitHubTokenSource,
  parseArgs,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

try {
  const tokenSource = await getGitHubTokenSource(args);

  console.log('# GitHub Token Status');
  console.log('');
  console.log(`- data_dir: ${getDataDir(args)}`);
  console.log(`- config: ${getConfigPath(args)}`);
  console.log(`- token_configured: ${tokenSource.token ? 'true' : 'false'}`);
  console.log(`- token_source: ${tokenSource.source}`);
  console.log(`- saved_to_disk: ${tokenSource.persisted ? 'true' : 'false'}`);
  if (tokenSource.saved_at) {
    console.log(`- saved_at: ${tokenSource.saved_at}`);
  }
} catch (error) {
  console.error(`Token status failed: ${error.message}`);
  process.exitCode = 1;
}
