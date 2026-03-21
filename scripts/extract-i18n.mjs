import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(workspaceRoot, 'src');
const outputFile = path.join(workspaceRoot, 'src/locales/en/messages.json');
const includeExtensions = new Set(['.ts', '.js', '.svelte']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      if (includeExtensions.has(path.extname(entry.name))) {
        return [fullPath];
      }
      return [];
    })
  );

  return files.flat();
}

function extractField(body, fieldName) {
  const pattern = new RegExp(`${fieldName}\\s*:\\s*(["'])([\\s\\S]*?)\\1`);
  const match = body.match(pattern);
  return match?.[2]?.trim();
}

function extractMessages(content) {
  const matches = content.matchAll(/i18n\(\s*(["'`])([^"'`]+)\1\s*,\s*\{([\s\S]*?)\}\s*\)/g);
  const messages = [];

  for (const match of matches) {
    const key = match[2]?.trim();
    const body = match[3] ?? '';
    const defaultValue = extractField(body, 'defaultValue');
    const description = extractField(body, 'description');

    if (!key || !defaultValue) {
      continue;
    }

    messages.push({
      key,
      value: {
        message: defaultValue,
        ...(description ? { description } : {})
      }
    });
  }

  return messages;
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return {};
  }
}

async function main() {
  const files = await walk(sourceRoot);
  const extracted = new Map();

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const message of extractMessages(content)) {
      extracted.set(message.key, message.value);
    }
  }

  const existing = await readJsonIfExists(outputFile);
  const merged = { ...existing, ...Object.fromEntries(extracted) };
  const sorted = Object.fromEntries(Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)));

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');

  console.log(
    `Extracted ${extracted.size} i18n entries to ${path.relative(workspaceRoot, outputFile)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
