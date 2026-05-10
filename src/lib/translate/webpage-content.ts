class WebpageContent {
  CONTENT_LIMIT = 2000;

  truncate(text: string): string {
    return text.slice(0, this.CONTENT_LIMIT);
  }
}

export default new WebpageContent();
