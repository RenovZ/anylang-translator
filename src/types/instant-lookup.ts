import { REGION_OPTIONS } from '@/preset/instant-lookup';

type Region = (typeof REGION_OPTIONS)[number];

interface Pronunciation {
  region?: Region['value'];
  phonetic?: string;
}

interface Definition {
  pos: string;
  meanings: string[];
}

interface WordForm {
  label: string;
  value: string;
}

interface Example {
  original: string;
  translation: string;
  source?: string;
}

export interface ExampleCategory {
  name: string;
  examples: Example[];
}

interface Phrase {
  phrase: string;
  meaning: string;
}

interface SynonymGroup {
  pos: string;
  meaning: string;
  words: string[];
}

interface CognateGroup {
  pos: string;
  words: { word: string; meaning: string }[];
}

interface EtymologyItem {
  title: string;
  content: string;
}

export interface DictionaryData {
  word: string;
  pronunciations: Pronunciation[];
  definitions: Definition[];
  wordForms: WordForm[];
  examLabels: string[];
}

export type ExamplesData = ExampleCategory[];

export interface UsageData {
  word: string;
  phrases?: Phrase[];
  synonyms?: SynonymGroup[];
  cognates?: CognateGroup[];
  etymology?: EtymologyItem[];
}
