import process from 'node:process';
import { githubRequest, loadConfig, parseArgs, parseBoolean, saveConfig } from './common.mjs';

const args = parseArgs(process.argv.slice(2));
const token = args.token || process.env.GITHUB_STARS_MEMORY_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
const shouldSave = parseBoolean(args.save, false);

if (!token) {
  console.error('Usage: GITHUB_STARS_MEMORY_GITHUB_TOKEN="ghp_..." node scripts/set-token.mjs');
  console.error('The token is validated but not saved unless you pass --save true.');
  process.exit(1);
}

try {
  if (args['skip-validate'] !== 'true') {
    await githubRequest('/user', { ...args, token });
  }

  if (shouldSave) {
    const config = await loadConfig(args);
    await saveConfig({
      ...config,
      github_token: token,
      github_token_saved_at: new Date().toISOString(),
    }, args);
  }

  console.log('# GitHub Token Check');
  console.log('');
  console.log('- status: ok');
  console.log(`- saved_to_disk: ${shouldSave ? 'true' : 'false'}`);
  console.log('- next: node scripts/sync-stars.mjs');
} catch (error) {
  console.error(`Token check failed: ${error.message}`);
  process.exitCode = 1;
}
