import { sha256 as jsSha256 } from 'js-sha256';

/**
 * Generate a SHA256 hash of multiple text parameters
 */
export function sha256(...texts: string[]): string {
  if (texts.length === 0) {
    throw new Error('At least one text parameter is required');
  }

  // prevent parameter boundary ambiguity, e.g. 'a|bc' and 'ab|c' are different
  const combined = texts.join('|');
  return jsSha256(combined);
}
