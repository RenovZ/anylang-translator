import { writeFileSync } from 'fs';

import { data } from 'franc/data.js';
import { expressions } from 'franc/expressions.js';

import { DEFAULT_LANG_CODES } from '../src/preset/lang.ts';

import logger from './logger.mjs';

// Collect all franc codes that can be returned
const francCodes = new Set<string>();

// From data.js (trigram-based language detection)
for (const script in data) {
  for (const lang in data[script]) {
    francCodes.add(lang);
  }
}

// From expressions.js (script-based single-language detection)
for (const script in expressions) {
  // Skip generic script names that are already in data.js
  if (
    script !== 'Latin' &&
    script !== 'Arabic' &&
    script !== 'Cyrillic' &&
    script !== 'Devanagari' &&
    script !== 'Myanmar' &&
    script !== 'Ethiopic' &&
    script !== 'Hebrew'
  ) {
    francCodes.add(script);
  }
}

// Special: franc returns 'und' for undetermined
francCodes.add('und');

const projectCodes = new Set(DEFAULT_LANG_CODES);

// ISO 639-3 to ISO 639-1 mapping (commonly known mappings)
const ISO_639_3_TO_1: Record<string, string> = {
  afr: 'af',
  amh: 'am',
  ara: 'ar',
  ayr: 'ay',
  azj: 'az',
  bam: 'bm',
  bel: 'be',
  ben: 'bn',
  bod: 'bo',
  bos: 'bs',
  bul: 'bg',
  cat: 'ca',
  ces: 'cs',
  cmn: 'zh-CN',
  ckb: 'ckb',
  cnr: 'sr-Latn',
  cym: 'cy',
  dan: 'da',
  deu: 'de',
  ell: 'el',
  eng: 'en',
  epo: 'eo',
  est: 'et',
  eus: 'eu',
  fas: 'fa',
  fin: 'fi',
  fra: 'fr',
  glg: 'gl',
  hau: 'ha',
  heb: 'he',
  hin: 'hi',
  hrv: 'hr',
  hun: 'hu',
  hye: 'hy',
  ind: 'id',
  ita: 'it',
  jav: 'jv',
  jpn: 'ja',
  kat: 'ka',
  kaz: 'kk',
  khm: 'km',
  kin: 'rw',
  kir: 'ky',
  kor: 'ko',
  kur: 'ku',
  lao: 'lo',
  lav: 'lv',
  lin: 'ln',
  lit: 'lt',
  ltz: 'lb',
  lvs: 'lv',
  mal: 'ml',
  mar: 'mr',
  mkd: 'mk',
  mlt: 'mt',
  mon: 'mn',
  mri: 'mi',
  msa: 'ms',
  mya: 'my',
  nld: 'nl',
  nno: 'no',
  nob: 'no',
  npi: 'ne',
  pan: 'pa',
  pes: 'fa',
  pol: 'pl',
  por: 'pt',
  ron: 'ro',
  rus: 'ru',
  slk: 'sk',
  slv: 'sl',
  sna: 'sn',
  som: 'so',
  spa: 'es',
  sqi: 'sq',
  srp: 'sr',
  ssw: 'ss',
  sun: 'su',
  swe: 'sv',
  tam: 'ta',
  tat: 'tt',
  tel: 'te',
  tgk: 'tg',
  tgl: 'tl',
  tha: 'th',
  tir: 'ti',
  tuk: 'tk',
  tur: 'tr',
  uig: 'ug',
  ukr: 'uk',
  urd: 'ur',
  uzn: 'uz',
  vie: 'vi',
  xho: 'xh',
  ydd: 'yi',
  yor: 'yo',
  zlm: 'ms',
  zul: 'zu',
  zyb: 'zyb'
};

// Additional specific mappings for franc codes
const FRANC_SPECIFIC: Record<string, string> = {
  als: 'sq', // Tosk Albanian -> Albanian
  arb: 'ar', // Standard Arabic -> Arabic
  aii: 'ar', // Assyrian Neo-Aramaic (no specific code, map to Arabic)
  azj: 'az', // North Azerbaijani -> Azerbaijani
  bcl: 'bik', // Central Bikol -> Bikol
  bci: 'bci', // Baoulé (exists in project)
  bho: 'bho', // Bhojpuri (exists in project)
  cjk: 'cjk', // Chuukese (exists in project)
  dip: 'din', // Northeastern Dinka -> Dinka
  dyu: 'dyu', // Dyula (exists in project)
  ekk: 'et', // Standard Estonian -> Estonian
  emk: 'emj', // Eastern Maninkakan -> Maninkakan (project has emj)
  ewe: 'ee', // Ewe
  fuf: 'ff', // Pular -> Fula
  fuv: 'ff', // Nigerian Fulfulde -> Fula
  gaa: 'gaa', // Ga (exists in project)
  hat: 'ht', // Haitian -> Haitian Creole
  hms: 'hms', // Southern Qiandong Miao (exists in project)
  hnj: 'hmn', // Hmong Njua -> Hmong
  ibb: 'ibb', // Ibibio (exists in project)
  ilo: 'ilo', // Iloko (exists in project)
  kbd: 'kbd', // Kabardian (exists in project)
  kbp: 'kbp', // Kabiyè (exists in project)
  kde: 'kde', // Makonde (exists in project)
  khk: 'mn', // Halh Mongolian -> Mongolian
  kmb: 'kmb', // Kimbundu (exists in project)
  knc: 'kr', // Central Kanuri -> Kanuri
  kng: 'kg', // Koongo -> Kongo
  koi: 'kv', // Komi-Permyak -> Komi
  lin: 'ln', // Lingala
  lua: 'lua', // Luba-Kasai (exists in project)
  lug: 'lg', // Ganda -> Luganda
  lun: 'lua', // Lunda -> Luba-Kasai
  mad: 'mad', // Madurese (exists in project)
  mag: 'mag', // Magahi (exists in project)
  mai: 'mai', // Maithili (exists in project)
  men: 'men', // Mende (exists in project)
  min: 'min', // Minangkabau (exists in project)
  mos: 'mos', // Mossi (exists in project)
  ndo: 'ndo', // Ndonga (exists in project)
  nds: 'nds', // Low German (exists in project)
  nhn: 'nhe', // Central Nahuatl -> Eastern Huasteca Nahuatl
  nso: 'nso', // Northern Sotho (exists in project)
  nya: 'nya', // Nyanja (exists in project)
  nyn: 'nyn', // Nyankole (exists in project)
  pam: 'pam', // Kapampangan (exists in project)
  pbu: 'ps', // Northern Pashto -> Pashto
  plt: 'mg', // Plateau Malagasy -> Malagasy
  prs: 'prs', // Dari (exists in project)
  qug: 'qu', // Chimborazo Highland Quichua -> Quechua
  quy: 'qu', // Ayacucho Quechua -> Quechua
  quz: 'qu', // Cusco Quechua -> Quechua
  rmn: 'rom', // Balkan Romani -> Romany
  rup: 'rup', // Aromanian (exists in project)
  sag: 'sg', // Sango
  sat: 'sat', // Santali (exists in project)
  sco: 'sco', // Scots (exists in project)
  shn: 'shn', // Shan (exists in project)
  skr: 'skr', // Saraiki (exists in project)
  snk: 'snk', // Soninke (exists in project)
  src: 'scn', // Logudorese Sardinian -> Sicilian (closest match, project has scn)
  suk: 'suk', // Sukuma (exists in project)
  swh: 'sw', // Swahili (individual language) -> Swahili
  tat: 'tt', // Tatar
  tem: 'tem', // Timne (exists in project)
  tiv: 'tiv', // Tiv (exists in project)
  toi: 'to', // Tonga (Zambia) -> Tonga
  tpi: 'tpi', // Tok Pisin (exists in project)
  tsn: 'tn', // Tswana
  tso: 'ts', // Tsonga
  tzm: 'ber', // Central Atlas Tamazight -> Tamazight
  uzn: 'uz', // Northern Uzbek -> Uzbek
  vec: 'vec', // Venetian (exists in project)
  ven: 've', // Venda
  vmw: 'vmw', // Makhuwa (exists in project)
  war: 'war', // Waray (exists in project)
  wol: 'wo', // Wolof
  xho: 'xh', // Xhosa
  yao: 'yao', // Yao (exists in project)
  zyb: 'zyb' // Yongbei Zhuang (exists in project)
};

// Build the final mapping
const mapping: Record<string, string> = {};
const unmapped: string[] = [];

for (const francCode of [...francCodes].sort()) {
  let target: string | undefined;

  // Priority 1: Direct match in project
  if (projectCodes.has(francCode)) {
    target = francCode;
  }
  // Priority 2: Franc-specific mapping
  else if (FRANC_SPECIFIC[francCode]) {
    target = FRANC_SPECIFIC[francCode];
  }
  // Priority 3: ISO 639-3 to 1 mapping
  else if (ISO_639_3_TO_1[francCode]) {
    target = ISO_639_3_TO_1[francCode];
  }

  // Validate target exists in project
  if (target && projectCodes.has(target)) {
    mapping[francCode] = target;
  } else {
    unmapped.push(francCode);
  }
}

if (unmapped.length > 0) {
  logger.warn('Warning: Unmapped franc codes:', unmapped.join(', '));
}

// Generate the file content
const lines: string[] = [
  '// Auto-generated by scripts/generate-franc-map.ts',
  '// Do not edit manually — run the script to regenerate',
  '//',
  '// Maps franc ISO 639-3 codes to project LangCodes',
  '',
  'export const FRANC_TO_LANG_CODE: Record<string, string> = {'
];

for (const code of Object.keys(mapping).sort()) {
  const value = mapping[code];
  const padding = ' '.repeat(6 - code.length);
  lines.push(`    ${code}:${padding}'${value}',`);
}

lines.push('} as const;');
lines.push('');

writeFileSync('src/preset/franc-map.ts', lines.join('\n'));
logger.log(`Generated src/preset/franc-map.ts with ${Object.keys(mapping).length} mappings`);
if (unmapped.length > 0) {
  logger.warn(`  Warning: ${unmapped.length} unmapped codes`);
}
