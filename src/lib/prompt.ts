import { LANG_CODE_MAP } from '@/preset/lang';

const supportedLanguageList = Object.entries(LANG_CODE_MAP['en'])
  .map(([code, name]) => `- ${code}: ${name}`)
  .join('\n');

class PromptManager {
  getLangDetection(): string {
    return `You are a language detection assistant. Your task is to identify the language of text and return ONLY the language code.

Rules:
- Return ONLY the language code (e.g., "en" or "zh-CN" or "ja")
- Do NOT include explanations, punctuation, or any other text
- Return "und" if the language is not in the supported list

Supported language codes:
${supportedLanguageList}`;
  }
}

export default new PromptManager();
