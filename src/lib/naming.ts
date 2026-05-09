/**
 * Naming utilities for generating unique names with numeric suffixes.
 *
 * Useful when adding providers, presets, or any named items where duplicates
 * need to be disambiguated by appending an incrementing number.
 *
 * @example
 * uniqueName('OpenAI', ['DeepSeek'])                    // 'OpenAI'
 * uniqueName('OpenAI', ['OpenAI'])                      // 'OpenAI 2'
 * uniqueName('OpenAI', ['OpenAI', 'OpenAI 3'])          // 'OpenAI 4'
 * uniqueName('GPT-4o', ['GPT-4o', 'GPT-4o 2'])         // 'GPT-4o 3'
 */

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

/**
 * Generate a unique name by appending a numeric suffix if the base name
 * is already taken. Scans existing names for the highest numeric suffix
 * and increments by one.
 *
 * - If `baseName` is not taken, returns it as-is.
 * - If `baseName` exists, returns `baseName` + next available number.
 * - The bare name (no suffix) is treated as suffix 1, so the first
 *   duplicate gets suffix 2.
 *
 * @param baseName       The desired name (e.g. "OpenAI").
 * @param existingNames  Names already in use.
 */
export function uniqueName(baseName: string, existingNames: Iterable<string>): string {
  const escaped = baseName.replace(REGEX_SPECIALS, '\\$&');
  // Match "BaseName" (no suffix, implicit 1) or "BaseName N" (explicit suffix)
  const pattern = new RegExp(`^${escaped}(?: (\\d+))?$`);

  let maxSuffix = 0;
  for (const name of existingNames) {
    const match = name.match(pattern);
    if (match) {
      // Bare name → suffix 1, "Name N" → suffix N
      maxSuffix = Math.max(maxSuffix, match[1] ? Number(match[1]) : 1);
    }
  }

  return maxSuffix > 0 ? `${baseName} ${maxSuffix + 1}` : baseName;
}
