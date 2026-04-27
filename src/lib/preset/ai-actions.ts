import i18n from '@/lib/i18n';

import { type OutputSchema, type AIAction } from '../types';

export const exampleDictionaryAIAction: AIAction = {
  preset: true,
  type: 'dictionary',
  name: 'Dictionary',
  icon: 'tabler:book-2',
  systemPrompt: `
You are a dictionary assistant for language learners.

## Goal
Given a term and its surrounding paragraphs, produce a concise dictionary entry that matches the required output object.

## Rules
1. Focus on the meaning that best matches the provided paragraphs.
2. Normalize Term to its base/canonical form.
3. Keep Definition precise and learner-friendly.
4. Keep Paragraphs exactly as provided in the prompt.
5. Phonetic must use the standard notation for the term's language (e.g., IPA for English, pinyin for Mandarin, romaji for Japanese).
6. Part of Speech in English (noun, verb, adjective, etc.).
7. Difficulty must be a CEFR level (A1, A2, B1, B2, C1, or C2).
8. If a field is unknown, return an empty string instead of guessing.
9. Respond in {{targetLanguage}} for all textual fields unless source-form text is required for clarity.

## Examples

### Example 1
Input: Selection="blossoms", Paragraphs="The ephemeral beauty of cherry blossoms reminds us to cherish each moment.", Target language=Chinese

Output:
- Term: blossom
- Phonetic: /ˈblɒs.əm/
- Part of Speech: noun
- Paragraphs: The ephemeral beauty of cherry blossoms reminds us to cherish each moment.
- Definition: 花；花朵（尤指果树的花）
- Paragraphs Translation: 樱花短暂的美丽提醒我们珍惜每一刻。
- Difficulty: B2

### Example 2
Input: Selection="感動", Paragraphs="この映画はつまらないと思ったけど、最後は感動した。", Target language=English

Output:
- Term: 感動
- Phonetic: kandou
- Part of Speech: noun
- Paragraphs: この映画はつまらないと思ったけど、最後は感動した。
- Definition: Being deeply moved; emotional touch
- Paragraphs Translation: I thought this movie was boring, but the ending was moving.
- Difficulty: B1
  `.trim(),
  prompt: `
## Input
Selection: {{selection}}
Paragraphs: {{paragraphs}}
Target language: {{targetLanguage}}
  `.trim(),
  outputSchema: [
    {
      name: 'Term',
      type: 'text',
      description: 'The base/canonical form of the term being defined.',
      enableSpeaking: true
    },
    {
      name: 'Phonetic',
      type: 'text',
      description:
        "The phonetic representation of the term, using the standard notation for the term's language (e.g., IPA for English, pinyin for Mandarin, romaji for Japanese).",
      enableSpeaking: false
    },
    {
      name: 'Part of Speech',
      type: 'text',
      description: 'The part of speech of the term (noun, verb, adjective, etc.).',
      enableSpeaking: false
    },
    {
      name: 'Definition',
      type: 'text',
      description: 'A concise definition of the term that matches the surrounding paragraphs.',
      enableSpeaking: false
    },
    {
      name: 'Paragraphs',
      type: 'text',
      description: 'The original paragraphs surrounding the term.',
      enableSpeaking: true
    },
    {
      name: 'Paragraphs Translation',
      type: 'text',
      description: 'The translation of the paragraphs into the target language.',
      enableSpeaking: false
    },
    {
      name: 'Difficulty',
      type: 'text',
      description: 'The CEFR difficulty level of the term (A1, A2, B1, B2, C1, or C2).',
      enableSpeaking: false
    }
  ] as OutputSchema[],
  description: 'Look up words with definitions, phonetics, and paragraph translates.'
} as const;

export const exampleImprovWriting: AIAction = {
  preset: true,
  type: 'improveWriting',
  name: 'Improve Writing',
  icon: 'tabler:pencil-check',
  systemPrompt: `
You are a writing assistant for language learners.

## Goal
Given selected text and its surrounding paragraphs, analyze writing issues and produce an improved version.

## Language Policy (critical)
1. Detect the original language of Selection as {{originLanguage}}.
2. The "Error Analysis" field must be written in {{targetLanguage}}.
3. The "Improved Version" field must stay in {{originLanguage}}.
4. Never translate "Improved Version" into {{targetLanguage}} unless {{originLanguage}} is already {{targetLanguage}}.

## Writing Rules
1. Identify grammar, spelling, punctuation, and word choice errors.
2. Keep edits natural and preserve the author's intent and tone.
3. If there are no major errors, state that clearly in "Error Analysis" and return a lightly polished "Improved Version".
4. Keep "Improved Version" concise and directly usable.

## Examples
Example A:
- Selection: "He go to school yesterday, and he don't finish his homework."
- Detected {{originLanguage}}: English
- {{targetLanguage}}: Chinese
- Error Analysis (Chinese — {{targetLanguage}}): 存在主谓一致和时态错误：go 应改为 went，don't 应改为 didn't，finish 应改为 finish 的过去时语境搭配。
- Improved Version (English — {{originLanguage}}): He went to school yesterday, and he didn't finish his homework.

Example B:
- Selection: "昨日私は友達に会いて、一緒に映画を見るました。"
- Detected {{originLanguage}}: Japanese
- {{targetLanguage}}: English
- Error Analysis (English — {{targetLanguage}}): There are verb conjugation errors: "会いて" should be "会って" (te-form of 会う), and "見るました" should be "見ました" (past tense of 見る in masu-form).
- Improved Version (Japanese — {{originLanguage}}): 昨日私は友達に会って、一緒に映画を見ました。
  `.trim(),
  prompt: `
## Input
Selection: {{selection}}
Paragraphs: {{paragraphs}}
Target language: {{targetLanguage}}
  `.trim(),
  outputSchema: [
    {
      name: 'Error Analysis',
      type: 'text',
      description:
        'Explain grammar, spelling, punctuation, and word-choice issues in {{targetLanguage}}.',
      enableSpeaking: false
    },
    {
      name: 'Improved Version',
      type: 'text',
      description: 'Corrected and improved version of the selected text in its original language.',
      enableSpeaking: false
    }
  ] as OutputSchema[],
  description: 'Analyze writing errors and suggest improvements.'
} as const;

export const exampleBlankAIAction: AIAction = {
  preset: true,
  type: 'blank',
  name: 'Blank',
  icon: 'tabler:sparkles',
  systemPrompt: '',
  prompt: '',
  outputSchema: [
    {
      name: 'Result',
      type: 'text',
      description:
        'Explain grammar, spelling, punctuation, and word-choice issues in {{targetLanguage}}.',
      enableSpeaking: false
    }
  ] as OutputSchema[],
  description: 'Start from scratch with an empty action.'
} as const;

export const promptPresets = [
  { value: 'general', label: i18n('prompt_preset_general', { defaultValue: 'General' }) },
  {
    value: 'smart_select',
    label: i18n('prompt_preset_smart_select', { defaultValue: 'Smart selection' })
  },
  {
    value: 'paraphrase_master',
    label: i18n('prompt_preset_paraphrase_master', { defaultValue: 'Paraphrase master' })
  },
  {
    value: 'paragraph_summary_expert',
    label: i18n('prompt_preset_paragraph_summary', {
      defaultValue: 'Paragraph summary expert'
    })
  },
  {
    value: 'english_simplify_master',
    label: i18n('prompt_preset_english_simplify', {
      defaultValue: 'English simplification master'
    })
  },
  {
    value: 'twitter_enhancer',
    label: i18n('prompt_preset_twitter_enhancer', {
      defaultValue: 'Twitter translation enhancer'
    })
  },
  {
    value: 'tech_translation_master',
    label: i18n('prompt_preset_tech_translation', { defaultValue: 'Tech translation master' })
  },
  {
    value: 'reddit_enhancer',
    label: i18n('prompt_preset_reddit_enhancer', {
      defaultValue: 'Reddit translation enhancer'
    })
  },
  {
    value: 'paper_translation_expert',
    label: i18n('prompt_preset_paper_translation', {
      defaultValue: 'Academic paper translator'
    })
  },
  {
    value: 'news_media_translator',
    label: i18n('prompt_preset_news_media', { defaultValue: 'News media translator' })
  },
  {
    value: 'music_expert',
    label: i18n('prompt_preset_music', { defaultValue: 'Music expert' })
  },
  {
    value: 'medical_translation_master',
    label: i18n('prompt_preset_medical', { defaultValue: 'Medical translation master' })
  },
  {
    value: 'legal_industry_translator',
    label: i18n('prompt_preset_legal', { defaultValue: 'Legal industry translator' })
  },
  {
    value: 'github_enhancer',
    label: i18n('prompt_preset_github_enhancer', {
      defaultValue: 'GitHub translation enhancer'
    })
  },
  {
    value: 'game_translator',
    label: i18n('prompt_preset_game', { defaultValue: 'Game translator' })
  },
  {
    value: 'ecommerce_translation_master',
    label: i18n('prompt_preset_ecommerce', { defaultValue: 'E-commerce translation master' })
  },
  {
    value: 'finance_translation_consultant',
    label: i18n('prompt_preset_finance', { defaultValue: 'Finance translation consultant' })
  },
  {
    value: 'novel_translator',
    label: i18n('prompt_preset_novel', { defaultValue: 'Novel translator' })
  },
  {
    value: 'ao3_translator',
    label: i18n('prompt_preset_ao3', { defaultValue: 'AO3 translator' })
  },
  {
    value: 'ebook_translator',
    label: i18n('prompt_preset_ebook', { defaultValue: 'E-book translator' })
  },
  { value: 'designer', label: i18n('prompt_preset_designer', { defaultValue: 'Designer' }) },
  {
    value: 'mixed_zh_en',
    label: i18n('prompt_preset_mixed_zh_en', { defaultValue: 'Mixed Chinese-English' })
  },
  {
    value: 'web3_translation_master',
    label: i18n('prompt_preset_web3', { defaultValue: 'Web3 translation master' })
  },
  {
    value: 'more_translation_experts',
    label: i18n('prompt_preset_more_experts', { defaultValue: 'More translation experts' })
  }
];

export const aiActionVariables = [
  {
    value: '{{selection}}',
    label: i18n('selection_tooltip', { defaultValue: 'Selected text content' })
  },
  {
    value: '{{paragraphs}}',
    label: i18n('paragraphs_tooltip', {
      defaultValue:
        'Intersecting paragraph text joined with blank lines, truncated to the first 2000 characters when sent to custom AI actions'
    })
  },
  {
    value: '{{targetLanguage}}',
    label: i18n('target_language_tooltip', { defaultValue: "User's target language" })
  },
  { value: '{{webTitle}}', label: i18n('web_title_tooltip', { defaultValue: 'Webpage title' }) },
  {
    value: '{{webContent}}',
    label: i18n('web_content_tooltip', {
      defaultValue:
        'Webpage content extracted from the current page, truncated to the first 2000 characters'
    })
  }
];
