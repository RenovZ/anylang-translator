export interface Pronunciation {
  region: '英' | '美';
  phonetic: string;
}

export interface Definition {
  pos: string;
  meanings: string[];
}

export interface WordForm {
  label: string;
  value: string;
}

export interface Example {
  original: string;
  translation: string;
  source?: string;
}

export interface ExampleCategory {
  name: string;
  examples: Example[];
}

export interface Phrase {
  phrase: string;
  meaning: string;
}

export interface SynonymGroup {
  pos: string;
  meaning: string;
  words: string[];
}

export interface CognateGroup {
  pos: string;
  words: { word: string; meaning: string }[];
}

export interface EtymologyItem {
  title: string;
  content: string;
}

export interface DictionaryEntry {
  word: string;
  pronunciations: Pronunciation[];
  definitions: Definition[];
  wordForms: WordForm[];
  examLabels: string[];
  exampleCategories: ExampleCategory[];
  phrases: Phrase[];
  synonyms: SynonymGroup[];
  cognates: CognateGroup[];
  etymology: EtymologyItem[];
}
