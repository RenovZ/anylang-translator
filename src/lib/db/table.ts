import { Entity } from 'dexie';

export class TranslationCache extends Entity {
  key!: string;
  translation!: string;
  createdAt!: Date;
}

export class BatchRequestRecord extends Entity {
  key!: string;
  createdAt!: Date;
  originalRequestCount!: number;
  provider!: string;
  model!: string;
}

export class ArticleSummaryCache extends Entity {
  key!: string; // Sha256Hex(textContentHash, JSON.stringify(providerConfig))
  summary!: string;
  createdAt!: Date;
}

export class AiSegmentationCache extends Entity {
  key!: string; // Sha256Hex(jsonContentHash, JSON.stringify(providerConfig))
  result!: string; // VTT format result
  createdAt!: Date;
}
