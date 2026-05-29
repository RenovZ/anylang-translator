#!/usr/bin/env node
/**
 * Download and update bundled open-source fonts for the extension.
 *
 * Supports three download sources:
 *   - github-latest : download from GitHub release via /latest/download/ (no API needed)
 *   - github-zip    : download a release ZIP and extract one file from it
 *   - direct        : download from a direct URL
 *
 * Optional: Install woff2 tools for TTF -> WOFF2 compression:
 *   macOS : brew install woff2
 *   Ubuntu: apt install woff2
 *
 * Usage:
 *   node scripts/update-fonts.mjs
 *
 * If GitHub API rate-limits you, set a token:
 *   GITHUB_TOKEN=ghp_xxx node scripts/update-fonts.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.join(ROOT, 'public', 'fonts');
const CSS_FILE = path.join(ROOT, 'src', 'assets', 'bundled-fonts.css');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function githubHeaders() {
  const headers = { 'User-Agent': 'anylang-font-updater' };
  if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  return headers;
}

fs.mkdirSync(FONTS_DIR, { recursive: true });

/** @type {Array<{family:string,label:string,fallback:string,weight:string,style:string,source:'github-latest'|'github-zip'|'direct',repo?:string,assetPattern?:RegExp,zipInnerPath?:string,url?:string,filename?:string}>} */
const FONTS = [
  {
    family: 'LXGW WenKai',
    label: '霞鹜文楷',
    fallback: 'STKaiti, KaiTi, serif',
    weight: 'normal',
    style: 'normal',
    source: 'github-latest',
    repo: 'lxgw/LxgwWenKai',
    filename: 'LXGWWenKai-Regular.ttf'
  },
  {
    family: 'Smiley Sans',
    label: '得意黑',
    fallback: 'Microsoft YaHei, sans-serif',
    weight: 'normal',
    style: 'normal',
    source: 'github-zip',
    repo: 'atelier-anchor/smiley-sans',
    assetPattern: /\.zip$/i,
    zipInnerPath: 'SmileySans-Oblique.ttf'
  },
  {
    family: 'ZCOOL KuaiLe',
    label: '站酷快乐体',
    fallback: 'Yuanti SC, sans-serif',
    weight: 'normal',
    style: 'normal',
    source: 'direct',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf',
    filename: 'ZCOOLKuaiLe-Regular.ttf'
  },
  {
    family: 'Ma Shan Zheng',
    label: '马善政毛笔楷书',
    fallback: 'STKaiti, KaiTi, serif',
    weight: 'normal',
    style: 'normal',
    source: 'direct',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/MaShanZheng-Regular.ttf',
    filename: 'MaShanZheng-Regular.ttf'
  }
];

async function fetchJson(url) {
  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function tryConvertWoff2(ttfPath) {
  const woff2Path = ttfPath.replace(/\.ttf$/i, '.woff2');
  try {
    execSync(`woff2_compress "${ttfPath}"`, { stdio: 'ignore' });
    if (fs.existsSync(woff2Path)) {
      fs.unlinkSync(ttfPath);
      return woff2Path;
    }
  } catch {
    // woff2_compress not available or failed
  }
  return null;
}

async function processFont(font) {
  console.log(`\n📦 ${font.label}`);

  let finalPath;

  if (font.source === 'github-latest') {
    const url = `https://github.com/${font.repo}/releases/latest/download/${font.filename}`;
    const dest = path.join(FONTS_DIR, font.filename);
    console.log(`   ⬇️  ${font.filename}`);
    await downloadFile(url, dest);
    finalPath = tryConvertWoff2(dest) || dest;
  } else if (font.source === 'github-zip') {
    const release = await fetchJson(`https://api.github.com/repos/${font.repo}/releases/latest`);
    const asset = release.assets?.find((a) => font.assetPattern.test(a.name));
    if (!asset) {
      const names = release.assets?.map((a) => a.name).join(', ') || 'none';
      throw new Error(`No matching zip in ${font.repo} (available: ${names})`);
    }
    const zipPath = path.join(FONTS_DIR, asset.name);
    console.log(`   ⬇️  ${asset.name}`);
    await downloadFile(asset.browser_download_url, zipPath);

    const extractedName = path.basename(font.zipInnerPath);
    const extractedPath = path.join(FONTS_DIR, extractedName);
    console.log(`   📂 Extracting ${font.zipInnerPath}...`);
    execSync(`unzip -o -j "${zipPath}" "${font.zipInnerPath}" -d "${FONTS_DIR}"`, {
      stdio: 'ignore'
    });
    fs.unlinkSync(zipPath);

    if (!fs.existsSync(extractedPath)) {
      throw new Error(`Extraction failed: ${font.zipInnerPath} not found in ${asset.name}`);
    }
    finalPath = tryConvertWoff2(extractedPath) || extractedPath;
  } else {
    const dest = path.join(FONTS_DIR, font.filename);
    console.log(`   ⬇️  ${font.filename}`);
    await downloadFile(font.url, dest);
    finalPath = tryConvertWoff2(dest) || dest;
  }

  const finalName = path.basename(finalPath);
  console.log(`   ✅ public/fonts/${finalName}`);

  return {
    ...font,
    filename: finalName,
    format: finalName.endsWith('.woff2') ? 'woff2' : 'truetype'
  };
}

function generateCSS(results) {
  const lines = [
    '/* Auto-generated by scripts/update-fonts.mjs */',
    '/* Do NOT edit manually. Run: node scripts/update-fonts.mjs */',
    ''
  ];

  for (const r of results) {
    lines.push(`@font-face {`);
    lines.push(`  font-family: '${r.family}';`);
    lines.push(`  src: url('/fonts/${r.filename}') format('${r.format}');`);
    lines.push(`  font-weight: ${r.weight};`);
    lines.push(`  font-style: ${r.style};`);
    lines.push(`  font-display: swap;`);
    lines.push(`}`);
    lines.push('');
  }

  fs.writeFileSync(CSS_FILE, lines.join('\n'));
  console.log(`\n📝 ${path.relative(ROOT, CSS_FILE)}`);
}

async function main() {
  console.log('🚀 Updating bundled fonts...');
  const results = [];
  for (const font of FONTS) {
    try {
      results.push(await processFont(font));
    } catch (err) {
      console.error(`   ❌ ${err.message}`);
      process.exitCode = 1;
    }
  }

  if (results.length) {
    generateCSS(results);
  }

  console.log('\n📋 Next steps:');
  console.log('   1. Verify src/preset/translate.ts fontFamilyOptions match the fonts above');
  console.log('   2. Run pnpm run build to bundle fonts into the extension');
  console.log('');
  console.log('💡 Optional: Install woff2 tools to compress TTF fonts (~60% smaller):');
  console.log('   macOS : brew install woff2');
  console.log('   Ubuntu: apt install woff2');
  console.log('');
  console.log('🔑 If GitHub API rate-limits you, set a token:');
  console.log('   GITHUB_TOKEN=ghp_xxx node scripts/update-fonts.mjs');
}

main();
