import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(workspaceRoot, 'src');
const outputFile = path.join(workspaceRoot, 'public/_locales/en/messages.json');
const includeExtensions = new Set(['.ts', '.js', '.svelte']);
const validKeyPattern = /^[A-Za-z0-9_]+$/;

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

    if (!validKeyPattern.test(key)) {
      throw new Error(
        `Invalid i18n key "${key}". Chrome extension message keys only allow ASCII letters, numbers, and underscores.`
      );
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

function assertNoConflictingDefinitions(messagesByKey, nextMessage) {
  const existing = messagesByKey.get(nextMessage.key);

  if (!existing) {
    return;
  }

  const sameMessage = existing.message === nextMessage.value.message;
  const sameDescription = existing.description === nextMessage.value.description;

  if (!sameMessage || !sameDescription) {
    throw new Error(
      `Conflicting i18n definitions for key "${nextMessage.key}". Keep one defaultValue/description per key.`
    );
  }
}

async function main() {
  const files = await walk(sourceRoot);
  const extracted = new Map();

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const message of extractMessages(content)) {
      assertNoConflictingDefinitions(extracted, message);
      extracted.set(message.key, message.value);
    }
  }

  const sorted = Object.fromEntries(
    Array.from(extracted.entries()).sort(([a], [b]) => a.localeCompare(b))
  );

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
