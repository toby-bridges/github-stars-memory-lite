import process from 'node:process';
import { githubRequest, loadConfig, parseArgs, saveConfig } from './common.mjs';

const args = parseArgs(process.argv.slice(2));
const token = args.token || process.env.GITHUB_STARS_MEMORY_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';

if (!token) {
  console.error('Usage: node scripts/set-token.mjs --token "ghp_..."');
  process.exit(1);
}

try {
  if (args['skip-validate'] !== 'true') {
    await githubRequest('/user', { ...args, token });
  }

  const config = await loadConfig(args);
  await saveConfig({
    ...config,
    github_token: token,
    github_token_saved_at: new Date().toISOString(),
  }, args);

  console.log('# GitHub Token Saved');
  console.log('');
  console.log('- status: ok');
  console.log('- next: node scripts/sync-stars.mjs');
} catch (error) {
  console.error(`Saving token failed: ${error.message}`);
  process.exitCode = 1;
}
