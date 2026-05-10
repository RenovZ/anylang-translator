const INVISIBLE_TRANSLATION_CHARACTERS_REGEX = /[\u200B-\u200D\uFEFF]/g;

class TextPreparation {
  prepareTranslationText(value: string | null | undefined): string {
    return value?.replace(INVISIBLE_TRANSLATION_CHARACTERS_REGEX, '').trim() ?? '';
  }
}

export default new TextPreparation();
