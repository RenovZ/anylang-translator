import { z } from 'zod';

class UrlUtils {
  /**
   * Check if a URL's hostname matches a domain pattern.
   * Supports exact hostname match or subdomain wildcard (e.g. "example.com" matches "sub.example.com").
   *
   * @param url - The full URL to check
   * @param pattern - The domain pattern to match against (e.g. "example.com")
   * @returns true if the URL hostname matches the pattern
   */
  matchDomainPattern(url: string, pattern: string): boolean {
    if (!z.url().safeParse(url).success) {
      return false;
    }

    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const patternLower = pattern.toLowerCase().trim();

    if (hostname === patternLower) {
      return true;
    }

    // subdomain wildcard: "example.com" matches "sub.example.com"
    if (hostname.endsWith(`.${patternLower}`)) {
      return true;
    }

    return false;
  }
}

export default new UrlUtils();
