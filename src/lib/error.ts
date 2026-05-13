class ErrorManager {
  /**
   * Extract error message from API response
   * Handles various error formats: JSON string, { error: { message } }, { message }, plain text
   */
  async extractErrorMessage(response: Response): Promise<string> {
    const fallback = `${response.status} ${response.statusText}`;
    const text = await response.text();

    if (!text) return fallback;

    try {
      const json = JSON.parse(text);
      if (typeof json === 'string') return json;
      if (json.error?.message) return json.error.message;
      if (json.message) return json.message;
      return fallback;
    } catch {
      return text.slice(0, 100);
    }
  }

  private getNonEmptyString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  extractAISDKErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (typeof error === 'object' && error !== null) {
      const source = error as {
        message?: unknown;
        responseBody?: unknown;
        text?: unknown;
      };

      return (
        this.getNonEmptyString(source.message) ??
        this.getNonEmptyString(source.responseBody) ??
        this.getNonEmptyString(source.text) ??
        'Unexpected error occurred'
      );
    }

    return 'Unexpected error occurred';
  }
}

export default new ErrorManager();
