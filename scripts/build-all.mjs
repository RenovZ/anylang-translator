import { execSync } from 'child_process';

import { logger } from './logger.mjs';

// All browsers supported by WXT
// prettier-ignore
const browsers = [
  'chrome',
  'firefox',
  'edge',
  'safari',
  'opera',
  'brave',
  'vivaldi'
];

logger.info('Building for all browsers...\n');

for (const browser of browsers) {
  try {
    logger.log(`\n📦 Building for ${browser}...`);
    execSync(`npx wxt build -b ${browser}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    logger.success(`✅ ${browser} build completed`);
  } catch (error) {
    logger.error(`❌ ${browser} build failed:`, error.message);
    // Continue with other browsers even if one fails
  }
}

logger.success('\n🎉 All builds completed!');
logger.info('Check .output/ directory for build artifacts');
