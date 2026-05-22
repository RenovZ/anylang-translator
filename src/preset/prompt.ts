import i18n from '@/lib/i18n';
import type { Output, Prompt } from '@/types/prompt';

import {
  FEAT_ADAPTIVE_TRANSLATE,
  FEAT_BILINGUAL_SUBTITLES,
  FEAT_INSTANT_LOOKUP,
  FEAT_INTELLIGENT_INPUT,
  FEAT_PANORAMA_READING,
  FEAT_WRITING_COPILOT
} from './feature';
import { mockDictionaryData, mockExamplesData, mockUsageData } from './instant-lookup';
import { LANG_CODE_MAP } from './lang';
import {
  AUTHENTIC_CASE,
  AUTHORITATIVE_CASE,
  BILINGUAL_CASE,
  INPUT,
  SOURCE_LANGUAGE,
  TARGET_LANGUAGE,
  VIDEO_SUMMARY,
  VIDEO_TITLE,
  WEB_SUMMARY,
  WEB_TITLE,
  WORD
} from './token';

const QUICK_TRANSLATE = {
  feature: FEAT_ADAPTIVE_TRANSLATE,
  name: 'Quick Translate',
  system: `
You are a fast and efficient translator.

## Goal
Provide immediate, concise translations with minimal processing.

## Rules
1. Focus on speed and clarity over nuance.
2. Deliver direct, literal translations when appropriate.
3. Keep output brief and immediately usable.
4. Respond only with the translation, no explanations.
5. Maintain formatting of short phrases and common expressions.

## Examples

### Example 1
Input: "Hello, how are you?", Target language=Chinese
Output: 你好，你好吗？

### Example 2
Input: "Thank you very much", Target language=Japanese
Output: どうもありがとうございます

### Example 3
Input: "Where is the nearest station?", Target language=Spanish
Output: ¿Dónde está la estación más cercana?
  `.trim(),
  prompt: `
## Input
Selection: {{selection}}
Target language: {{targetLanguage}}
  `.trim(),
  output: [
    {
      name: 'Translation',
      type: 'text',
      description: 'The quick translated text in {{targetLanguage}}.',
      enableSpeaking: false
    }
  ] as Output[],
  description: 'Fast and lightweight translation for everyday use.'
} as const;

const CONTEXT_TRANSLATE = {
  feature: FEAT_ADAPTIVE_TRANSLATE,
  name: 'Context Translate',
  system: `
You are a professional translator for language learners.

## Goal
Translate the selected text accurately and naturally into the target language.

## Rules
1. Maintain the original meaning, tone, and style.
2. Produce fluent, natural-sounding translations.
3. Keep proper nouns and technical terms consistent.
4. Respond in {{targetLanguage}} unless the source text needs to be preserved.
5. If the source is already in {{targetLanguage}}, explain the meaning instead.

## Examples

### Example 1
Input: "The quick brown fox jumps over the lazy dog.", Target language=Chinese
Output: 敏捷的棕色狐狸跳过了懒惰的狗。

### Example 2
Input: "春眠不觉晓，处处闻啼鸟。", Target language=English
Output: Spring slumber: unaware of dawn, everywhere birds are heard singing.
  `.trim(),
  prompt: `
## Input
Selection: {{selection}}
Paragraphs: {{paragraphs}}
Target language: {{targetLanguage}}
  `.trim(),
  output: [
    {
      name: 'Translation',
      type: 'text',
      description: 'The translated text in {{targetLanguage}}.',
      enableSpeaking: false
    }
  ] as Output[],
  description: 'Translate selected text naturally into your target language.'
} as const;

const BILINGUAL_SUBTITLES = {
  feature: FEAT_BILINGUAL_SUBTITLES,
  name: 'Bilingual Subtitles',
  system: `
You are a bilingual subtitle assistant.

## Goal
Generate bilingual subtitles that display both the original and translated text.

## Rules
1. Preserve the original timing and context.
2. Translate naturally, matching the tone of the speaker.
3. Keep line breaks and segment timing appropriate for reading.
4. Use the format: Original text + Translation in parentheses or separate lines.
5. Respond with the bilingual subtitle content.

## Examples

### Example 1
Input: "Welcome to the show.", Target language=Chinese
Output: Welcome to the show. (欢迎来到节目。)

### Example 2
Input: "今日はいい天気ですね。", Target language=English
Output: 今日はいい天気ですね。(Nice weather today, isn't it?)
  `.trim(),
  prompt: `
## Input
Selection: {{selection}}
Paragraphs: {{paragraphs}}
Target language: {{targetLanguage}}
  `.trim(),
  output: [
    {
      name: 'Bilingual Text',
      type: 'text',
      description: 'Bilingual subtitle text showing both original and translation.',
      enableSpeaking: false
    }
  ] as Output[],
  description: 'Generate bilingual subtitles for videos.'
} as const;

const INSTANT_LOOKUP = {
  feature: FEAT_INSTANT_LOOKUP,
  name: 'Instant Lookup',
  system: `
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
  output: [
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
  ] as Output[],
  description: 'Look up words with definitions, phonetics, and paragraph translates.'
} as const;

const INTELLIGENT_INPUT = {
  feature: FEAT_INTELLIGENT_INPUT,
  name: 'Intelligent Input',
  system: `
You are an intelligent writing assistant.

## Goal
Help users complete or improve their writing based on context and partial input.

## Rules
1. Continue the text naturally and coherently.
2. Match the tone, style, and formality of the existing text.
3. Provide 2-3 alternative completions when appropriate.
4. Keep suggestions concise and relevant to the context.
5. Respond in the same language as the input text.

## Examples

### Example 1
Input: "Looking forward to", Target language=English
Output: meeting you next week.

### Example 2
Input: "根据最新的研究", Target language=Chinese
Output: 表明，这种新方法能够显著提高效率。
  `.trim(),
  prompt: `
## Input
Selection: {{selection}}
Paragraphs: {{paragraphs}}
Target language: {{targetLanguage}}
  `.trim(),
  output: [
    {
      name: 'Completion',
      type: 'text',
      description: 'Suggested text completion or continuation.',
      enableSpeaking: false
    }
  ] as Output[],
  description: 'Get intelligent suggestions to complete your writing.'
} as const;

const WRITING_COPILOT = {
  feature: FEAT_WRITING_COPILOT,
  name: 'Writing Copilot',
  system: `
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
  output: [
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
  ] as Output[],
  description: 'Analyze writing errors and suggest improvements.'
} as const;

const PANORAMA_READING = {
  feature: FEAT_PANORAMA_READING,
  name: 'Panorama Reading',
  system: `
You are a comprehensive reading assistant for language learners.

## Goal
Provide full-page translation with context-aware rendering for immersive reading.

## Rules
1. Translate the entire content while preserving formatting and structure.
2. Maintain paragraph alignment between original and translated text.
3. Handle mixed content (text, lists, headers) appropriately.
4. Keep technical terms and proper nouns consistent.
5. Produce natural, readable translations in {{targetLanguage}}.

## Examples

### Example 1
Input: "Chapter 1: The Beginning

It was a dark and stormy night.", Target language=Chinese
Output: 第一章：开端

那是一个漆黑的暴风雨之夜。

### Example 2
Input: "概要

本研究では、新しい手法を提案する。", Target language=English
Output: Summary

This study proposes a new method.
  `.trim(),
  prompt: `
## Input
Web Title: {{webTitle}}
Web Content: {{webContent}}
Target language: {{targetLanguage}}
  `.trim(),
  output: [
    {
      name: 'Translated Content',
      type: 'text',
      description: 'Full translated content in {{targetLanguage}} preserving structure.',
      enableSpeaking: false
    }
  ] as Output[],
  description: 'Translate entire web pages for immersive bilingual reading.'
} as const;

const PROMPT_BLANK = {
  feature: 'blank',
  name: 'Blank',
  system: '',
  prompt: '',
  output: [
    {
      name: 'Result',
      type: 'text',
      description:
        'Explain grammar, spelling, punctuation, and word-choice issues in {{targetLanguage}}.',
      enableSpeaking: false
    }
  ] as Output[],
  description: 'Start from scratch with an empty action.'
} as const;

export const PROMPT_LIST = [
  QUICK_TRANSLATE,
  CONTEXT_TRANSLATE,
  BILINGUAL_SUBTITLES,
  INSTANT_LOOKUP,
  INTELLIGENT_INPUT,
  WRITING_COPILOT,
  PANORAMA_READING,
  PROMPT_BLANK
].map(
  (prompt) =>
    ({
      ...prompt,
      enabled: true,
      mutable: false
    }) satisfies Prompt
);

export const promptVariables = [
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

export const BATCH_SEPARATOR = '%%';

// // 网页翻译 Prompt 中可用的模板占位符（token），运行时会被真实值替换
// export const WEB_PAGE_PROMPT_TOKENS = [
//   'targetLanguage',
//   'input',
//   'webTitle',
//   'webContent',
//   'webSummary'
// ] as const;
// // 字幕翻译 Prompt 中可用的模板占位符（token）
// export const SUBTITLE_PROMPT_TOKENS = [
//   'targetLanguage',
//   'input',
//   'videoTitle',
//   'videoSummary'
// ] as const;
// // 默认导出的 token 集合（目前指向网页翻译 token，供通用逻辑使用）
// export const TOKENS = WEB_PAGE_PROMPT_TOKENS;

// 将 token 包装为模板占位符格式，例如 `targetLanguage` → `{{targetLanguage}}`
// 供 Prompt 组装器（translate.ts / subtitles.ts）做 replaceAll 替换
export const getTokenCellText = (token: string) => `{{${token}}}`;

/**
 * 网页翻译默认 System Prompt。
 * 使用场景：用户未选择自定义 Prompt 时（promptId === null），
 * 由 `src/utils/prompts/translate.ts` 读取并替换其中的 {{token}} 后发给 LLM。
 * 若开启批量翻译（isBatch=true），会在末尾追加 DEFAULT_BATCH_TRANSLATE_PROMPT。
 */
export const DEFAULT_TRANSLATE_SYSTEM_PROMPT = `You are a professional ${getTokenCellText(TARGET_LANGUAGE)} native translator who needs to fluently translate text into ${getTokenCellText(TARGET_LANGUAGE)}.

## Translation Rules
1. Output only the translated content, without explanations or additional content (such as "Here's the translation:" or "Translation as follows:")
2. The returned translation must maintain exactly the same number of paragraphs and format as the original text.
3. If the text contains HTML tags, consider where the tags should be placed in the translation while maintaining fluency.
4. For content that should not be translated (such as proper nouns, code, etc.), keep the original text.

## Document Metadata for Context Awareness
Webpage title: ${getTokenCellText(WEB_TITLE)}
Webpage summary: ${getTokenCellText(WEB_SUMMARY)}`;

/**
 * 字幕翻译默认 System Prompt。
 * 使用场景：用户未选择自定义 Prompt 时，
 * 由 `src/utils/prompts/subtitles.ts` 读取并替换 {{token}} 后发给 LLM。
 * 与网页翻译的区别：规则针对字幕场景优化（保留换行、语气、时间边界等）。
 */
export const DEFAULT_SUBTITLE_TRANSLATE_SYSTEM_PROMPT = `You are a professional ${getTokenCellText(TARGET_LANGUAGE)} native translator who needs to fluently translate subtitles into ${getTokenCellText(TARGET_LANGUAGE)}.

## Translation Rules
1. Output only the translated content, without explanations or additional content (such as "Here's the translation:" or "Translation as follows:")
2. Keep subtitle timing alignment natural by matching the original subtitle segment boundaries and sentence flow.
3. Preserve speaker intent, tone, punctuation, and line-break structure unless a small adjustment is required for fluent subtitles.
4. For content that should not be translated (such as proper nouns, code, etc.), keep the original text.

## Video Metadata for Context Awareness
Video title: ${getTokenCellText(VIDEO_TITLE)}
Video summary: ${getTokenCellText(VIDEO_SUMMARY)}`;

/**
 * 网页/字幕翻译默认 User Prompt（用户输入部分）。
 * 由 Prompt 组装器替换 {{targetLanguage}} 和 {{input}} 后，作为用户消息发给 LLM。
 */
export const DEFAULT_TRANSLATE_PROMPT = `Translate to ${getTokenCellText(TARGET_LANGUAGE)}:


${getTokenCellText(INPUT)}`;

/**
 * 批量翻译追加规则。
 * 当开启批量模式（isBatch=true）时，Prompt 组装器会将其追加到 System Prompt 末尾，
 * 指导 AI 如何识别和保留 `%%` 分隔符，以便后台队列能将结果正确拆分为多段翻译。
 * 相关拆分逻辑见 `src/entrypoints/background/translation-queues.ts` 中的 `parseBatchResult()`。
 */
export const DEFAULT_BATCH_TRANSLATE_PROMPT = `## Multi-paragraph Translation Rules
1. If input contains ${BATCH_SEPARATOR}, use ${BATCH_SEPARATOR} in your output, if input has no ${BATCH_SEPARATOR}, don't use ${BATCH_SEPARATOR} in your output
2. **CRITICAL**: Preserve exact formatting around ${BATCH_SEPARATOR} - use exactly one empty line before and after, with no extra spaces, tabs, or whitespace

## OUTPUT FORMAT:
- **Single paragraph input** → Output translation directly (no separators, no extra text)
- **Multi-paragraph input (input uses ${BATCH_SEPARATOR} separators)** → Use ${BATCH_SEPARATOR} as paragraph separator between translations

## Examples

### Multi-paragraph Input:
Paragraph A

${BATCH_SEPARATOR}

Paragraph B

${BATCH_SEPARATOR}

Paragraph C

### Multi-paragraph Output:
Translation A

${BATCH_SEPARATOR}

Translation B

${BATCH_SEPARATOR}

Translation C

### Single paragraph Input:
Single paragraph content

### Single paragraph Output:
Direct translation without separators
`;

// === 字幕分段（Re-segmentation）Prompts ===
// 用于将单词级字幕片段（word-level fragments）重组为句子级 VTT 格式。
// 调用入口：`src/utils/prompts/subtitles-segmentation.ts` → `getSubtitlesSegmentationPrompt()`

/**
 * 字幕分段默认 System Prompt。
 * 使用场景：视频字幕处理流程中，需要将逐字/短片段合并为完整句子并生成 VTT 时间轴时，
 * 由 `subtitles-segmentation.ts` 直接作为 systemPrompt 发给 LLM。
 */
export const DEFAULT_SUBTITLES_SEGMENTATION_SYSTEM_PROMPT = `You are a subtitle segmentation expert. Convert word-level subtitle fragments into sentence-based VTT format.

## Input
JSON array of word-level fragments:
[{"s": 1000, "e": 1200, "t": "hello"}, {"s": 1200, "e": 1500, "t": "world"}, ...]
- s: start time (milliseconds)
- e: end time (milliseconds)
- t: text content

## Output
Simplified VTT format with millisecond timestamps:

WEBVTT

1000 --> 1500
Hello world.

2000 --> 3500
This is a sentence.

## Rules
1. **Complete sentences only** - Each cue must be a COMPLETE, standalone sentence that expresses a full thought.
2. **Never split at incomplete clauses** - A clause that cannot stand alone as a complete thought MUST be merged with the clause it depends on. Signs of incomplete clauses:
   - Sets up a condition, time, or reason but doesn't state the result/consequence
   - Ends with a conjunction or leaves an expectation unfulfilled
   - Would sound unfinished if spoken alone
   Example: "When Moses left Egypt" is INCOMPLETE - it sets up a time but doesn't say what happened.
3. **Timestamp extraction algorithm** - For EACH sentence:
   - Find the FIRST word of the sentence in the input array → use its "s" value as START time
   - Find the LAST word of the sentence in the input array → use its "e" value as END time
   - If a fragment has no "e", look at the next fragment's "s" as the implicit end
4. **Punctuation** - Add appropriate punctuation (. ? ! ,) based on context
5. **Capitalization** - Capitalize first letter of each sentence
6. **No translation** - Keep the original language
7. **Output only** - Return ONLY the VTT content, no explanations
8. **No omission** - Include ALL input fragments. Every fragment must appear in exactly one cue.

## Critical Example: Correct Timestamp Alignment

Input:
[{"s":134200,"e":134760,"t":"Moses"},{"s":134760,"e":135160,"t":"had"},{"s":135160,"e":136160,"t":"died"},{"s":136160,"e":136270,"t":"I"},{"s":136280,"e":136519,"t":"thought"},{"s":136519,"e":136720,"t":"the"},{"s":136720,"e":137040,"t":"story"},{"s":137040,"e":137239,"t":"was"},{"s":137239,"e":137599,"t":"about"},{"s":137599,"e":138160,"t":"him"}]

WRONG (timestamps shifted - using end of previous sentence as start of next):
134200 --> 138160
Moses had died.

138160 --> ...
I thought the story was about him.

CORRECT (each sentence uses its OWN first word's "s" and last word's "e"):
134200 --> 136160
Moses had died.

136160 --> 138160
I thought the story was about him.

Explanation:
- "Moses had died" → first word "Moses" has s:134200, last word "died" has e:136160 → 134200 --> 136160
- "I thought the story was about him" → first word "I" has s:136160, last word "him" has e:138160 → 136160 --> 138160`;

/**
 * 字幕分段默认 User Prompt。
 * 调用时由 `subtitles-segmentation.ts` 将 {{input}} 替换为 JSON 格式的单词级字幕片段。
 */
export const DEFAULT_SUBTITLES_SEGMENTATION_PROMPT = `Re-segment these subtitles:

${getTokenCellText(INPUT)}`;

const supportedLanguageList = Object.entries(LANG_CODE_MAP['en'])
  .map(([code, name]) => `- ${code}: ${name}`)
  .join('\n');

export const DEFAULT_LANG_DETECTION_SYSTEM_PROMPT = `You are a language detection assistant. Your task is to identify the language of text and return ONLY the language code.

Rules:
- Return ONLY the language code (e.g., "en" or "zh-CN" or "ja")
- Do NOT include explanations, punctuation, or any other text
- Return "und" if the language is not in the supported list

Supported language codes:
${supportedLanguageList}`;

// ========== Dictionary Data Prompts ==========

export const DICTIONARY_SYSTEM_PROMPT = `You are a precise multilingual dictionary API. Your task is to return structured dictionary data for translating a word from ${getTokenCellText(SOURCE_LANGUAGE)} to ${getTokenCellText(TARGET_LANGUAGE)} in strict JSON format.

Rules:
1. Return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks (no \`\`\`json).
2. The JSON must exactly match the following structure and field names:
   - word: string — the source language word (in ${getTokenCellText(SOURCE_LANGUAGE)}). For example, if querying from English to Chinese, return the English equivalent.
   - pronunciations: array of objects, each with:
     - region: optional string, MUST be exactly "UK" or "US" if present. ONLY include for English target words; otherwise return an empty array [].
     - phonetic: optional string, IPA format.
   - definitions: array of objects, each with:
     - pos: string — part of speech label.
     - meanings: array of strings — definitions or translations in ${getTokenCellText(TARGET_LANGUAGE)}.
   - wordForms: array of objects, each with:
     - label: string — form name in ${getTokenCellText(TARGET_LANGUAGE)} (e.g., "第三人称单数" if target is Chinese, "Plural" if target is English).
     - value: string — the actual inflected form.
     ONLY include if the target language has inflectional morphology; otherwise return an empty array [].
   - examLabels: array of strings — exam or proficiency category names in ${getTokenCellText(TARGET_LANGUAGE)} (can be any strings). ONLY include if applicable to the target language; otherwise return an empty array [].
3. Provide comprehensive definitions covering all common parts of speech and usages.
4. Do NOT include any fields not listed above.
5. Ensure all strings are properly escaped in JSON.

## Context
Webpage title: ${getTokenCellText(WEB_TITLE)}
Webpage summary: ${getTokenCellText(WEB_SUMMARY)}

## Examples

### English to Chinese
${JSON.stringify(mockDictionaryData)}`;

export const DICTIONARY_USER_PROMPT = `Please return the complete dictionary entry for the ${getTokenCellText(SOURCE_LANGUAGE)} word "${getTokenCellText(WORD)}" translated into ${getTokenCellText(TARGET_LANGUAGE)}.`;

// ========== Examples Data Prompts ==========

export const DICTIONARY_EXAMPLES_SYSTEM_PROMPT = `You are a precise multilingual example sentence API. Your task is to return structured example sentence data for a word translated from ${getTokenCellText(SOURCE_LANGUAGE)} to ${getTokenCellText(TARGET_LANGUAGE)} in strict JSON format.

Rules:
1. Return ONLY a valid JSON array. Do NOT wrap it in markdown code blocks (no \`\`\`json).
2. The array must contain exactly 3 category objects in this fixed order:
   1. "${getTokenCellText(BILINGUAL_CASE)}"
   2. "${getTokenCellText(AUTHENTIC_CASE)}"
   3. "${getTokenCellText(AUTHORITATIVE_CASE)}"
3. Each category object must have:
   - name: string — exactly the provided category name above.
   - examples: array of objects, each with:
     - original: string — a sentence in ${getTokenCellText(SOURCE_LANGUAGE)} containing the target word.
     - translation: string — the translation in ${getTokenCellText(TARGET_LANGUAGE)}.
     - source: optional string — source name (dictionary, media, etc.). Include for bilingual and authoritative examples when available; omit for authentic examples if no specific source.
4. Provide 3-5 examples per category.
5. Ensure the target word appears naturally in each original sentence.
6. Do NOT include any fields not listed above.
7. Ensure all strings are properly escaped in JSON.

## Context
Webpage title: ${getTokenCellText(WEB_TITLE)}
Webpage summary: ${getTokenCellText(WEB_SUMMARY)}

## Examples
${JSON.stringify(mockExamplesData)}`;

export const DICTIONARY_EXAMPLES_USER_PROMPT = `Please return example sentences for the ${getTokenCellText(SOURCE_LANGUAGE)} word "${getTokenCellText(WORD)}" translated into ${getTokenCellText(TARGET_LANGUAGE)}. Use the provided category names exactly as given.`;

// ========== Usage Data Prompts ==========

export const DICTIONARY_USAGE_SYSTEM_PROMPT = `You are a precise multilingual word usage API. Your task is to return structured usage data for a word translated from ${getTokenCellText(SOURCE_LANGUAGE)} to ${getTokenCellText(TARGET_LANGUAGE)} in strict JSON format.

Rules:
1. Return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks (no \`\`\`json).
2. The JSON must exactly match the following structure and field names:
   - word: string — the target language word (in ${getTokenCellText(SOURCE_LANGUAGE)}).
   - phrases: array of objects, each with:
     - phrase: string — a common collocation or phrase in ${getTokenCellText(SOURCE_LANGUAGE)} containing the word.
     - meaning: string — explanation or translation in ${getTokenCellText(TARGET_LANGUAGE)}.
   - synonyms: array of objects grouped by part of speech, each with:
     - pos: string — part of speech label.
     - meaning: string — shared meaning in ${getTokenCellText(TARGET_LANGUAGE)}.
     - words: array of strings — synonym words in ${getTokenCellText(SOURCE_LANGUAGE)}.
   - cognates: array of objects grouped by part of speech, each with:
     - pos: string — part of speech label.
     - words: array of objects, each with:
       - word: string — the cognate word in ${getTokenCellText(SOURCE_LANGUAGE)}.
       - meaning: string — meaning in ${getTokenCellText(TARGET_LANGUAGE)}.
   - etymology: array of objects, each with:
     - title: string — short title summarizing the etymology point.
     - content: string — detailed etymology explanation in ${getTokenCellText(TARGET_LANGUAGE)}.
3. If a concept is not applicable to the target language (e.g., cognates for isolating languages, etymology when unavailable), return an empty array [] for that field. Do NOT omit the field key.
4. Provide at least 3 phrases if commonly used.
5. Provide synonyms grouped by distinct meanings and parts of speech.
6. Provide cognates (derivatives, related word forms) grouped by part of speech where applicable.
7. Provide 1-2 etymology entries explaining word origin where applicable.
8. Do NOT include any fields not listed above.
9. Ensure all strings are properly escaped in JSON.

## Context
Webpage title: ${getTokenCellText(WEB_TITLE)}
Webpage summary: ${getTokenCellText(WEB_SUMMARY)}

## Examples
${JSON.stringify(mockUsageData)}`;

export const DICTIONARY_USAGE_USER_PROMPT = `Please return usage information including common phrases, synonyms, cognates, and etymology for the ${getTokenCellText(SOURCE_LANGUAGE)} word "${getTokenCellText(WORD)}" translated into ${getTokenCellText(TARGET_LANGUAGE)}.`;
