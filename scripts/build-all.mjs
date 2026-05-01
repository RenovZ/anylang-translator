import { execSync } from 'child_process';

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

console.log('Building for all browsers...\n');

for (const browser of browsers) {
  try {
    console.log(`\n📦 Building for ${browser}...`);
    execSync(`npx wxt build -b ${browser}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${browser} build completed`);
  } catch (error) {
    console.error(`❌ ${browser} build failed:`, error.message);
    // Continue with other browsers even if one fails
  }
}

console.log('\n🎉 All builds completed!');
console.log('Check .output/ directory for build artifacts');
