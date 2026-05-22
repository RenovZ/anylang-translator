import i18n from '@/lib/i18n';
import type { DictionaryData, ExamplesData, UsageData } from '@/types/instant-lookup';

import { AUTHENTIC_CASE, AUTHORITATIVE_CASE, BILINGUAL_CASE } from './token';

export const REGION_OPTIONS = [
  { value: 'UK', label: i18n('uk', { defaultValue: '英' }) },
  { value: 'US', label: i18n('us', { defaultValue: '美' }) }
] as const;

export const mockDictionaryData: DictionaryData = {
  word: 'select',
  pronunciations: [
    { region: 'UK', phonetic: '/sɪˈlekt/' },
    { region: 'US', phonetic: '/sɪˈlekt/' }
  ],
  definitions: [
    {
      pos: 'v.',
      meanings: ['选择，挑选；（在计算机屏幕上）选定；（进化）决定（特征，生物）是否继续存在']
    },
    {
      pos: 'adj.',
      meanings: ['精选的，优等的；高级的，奢华的']
    },
    {
      pos: '【名】',
      meanings: ['(Select)（美、印）塞阿克特（人名）']
    }
  ],
  wordForms: [
    { label: '第三人称单数', value: 'selects' },
    { label: '现在分词', value: 'selecting' },
    { label: '过去式', value: 'selected' },
    { label: '过去分词', value: 'selected' },
    { label: '比较级', value: 'more select' },
    { label: '最高级', value: 'most select' }
  ],
  examLabels: ['高中', 'CET4', 'CET6', '考研', 'IELTS', 'GMAT', '商务英语']
};

// prettier-ignore
export const DICTIONARY_EXAMPLE_TAB_MAP = {
  [BILINGUAL_CASE]: i18n('dictionary_example_bilingual_case', { defaultValue: 'Bilingual Case' }),
  [AUTHENTIC_CASE]: i18n('dictionary_example_authentic_case', { defaultValue: 'Authentic Case' }),
  [AUTHORITATIVE_CASE]: i18n('dictionary_example_authoritative_case', { defaultValue: 'Authoritative Case' })
} as const;

export const mockExamplesData: ExamplesData = [
  {
    name: '双语例句',
    examples: [
      {
        original: 'At the end of this chapter there is a select bibliography of useful books.',
        translation: '本章末尾附着有用书籍的精选书目。',
        source: '《柯林斯英汉双解大词典》'
      },
      {
        original:
          'Select the text you want to format by holding down the left button on your mouse.',
        translation: '按住鼠标左键选取你想要格式化的文本。',
        source: '《牛津词典》'
      }
    ]
  },
  {
    name: '原声例句',
    examples: [
      {
        original: 'Please select your preferred language.',
        translation: '请选择您喜欢的语言。'
      },
      {
        original: 'You can select multiple items at once.',
        translation: '您可以一次选择多个项目。'
      }
    ]
  },
  {
    name: '权威例句',
    examples: [
      {
        original: 'The committee will select the winner from among the finalists.',
        translation: '委员会将从入围者中选出获胜者。',
        source: '《剑桥词典》'
      },
      {
        original: 'Only a select few were invited to the meeting.',
        translation: '只有少数精选的人被邀请参加会议。',
        source: '《麦克米伦词典》'
      }
    ]
  }
];

export const DICTIONARY_USAGE_TAB_MAP = {
  phrases: i18n('dictionary_usage_phrases', { defaultValue: 'Phrases' }),
  synonyms: i18n('dictionary_usage_synonyms', { defaultValue: 'Synonyms' }),
  cognates: i18n('dictionary_usage_cognates', { defaultValue: 'Cognates' }),
  etymology: i18n('dictionary_usage_etymology', { defaultValue: 'Etymology' })
} as const;

export const mockUsageData: UsageData = {
  word: 'select',
  phrases: [
    { phrase: 'select all', meaning: '全选；选择所有；全部选择；选择全部' },
    { phrase: 'Mensa Select', meaning: '门萨首选' },
    {
      phrase: 'Mesh Select',
      meaning: '网格选择修改器；网格选择；修改器；选择网格'
    }
  ],
  synonyms: [
    {
      pos: 'vt.',
      meaning: '挑选；选拔',
      words: ['pack', 'choose from']
    },
    {
      pos: 'adj.',
      meaning: '精选的；挑选出来的；极好的',
      words: ['wonderful', 'excellent', 'famous', 'chosen', 'choice']
    },
    {
      pos: 'vi.',
      meaning: '挑选',
      words: ['choose from', 'pick on']
    }
  ],
  cognates: [
    {
      pos: 'adj.',
      words: [
        { word: 'selective', meaning: '选择性的' },
        { word: 'selected', meaning: '挑选出来的' }
      ]
    },
    {
      pos: 'adv.',
      words: [{ word: 'selectively', meaning: '有选择地' }]
    },
    {
      pos: 'n.',
      words: [
        { word: 'selection', meaning: '选择，挑选；选集；精选品' },
        { word: 'selector', meaning: '选择器；挑选者' },
        { word: 'selectivity', meaning: '选择性；分离性；选择度' }
      ]
    }
  ],
  etymology: [
    {
      title: 'select:选择，精选',
      content: '词根词缀: se-分离 +-lect-采集'
    },
    {
      title: 'select:选择',
      content: 'se-分开，-lect,拿，收集，词源同 collect,elect.即拿出来，分开，引申词义选择。'
    }
  ]
};
