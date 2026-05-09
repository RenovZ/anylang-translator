import type { JSONValue } from 'ai';

export interface GenerateTextParams {
  model: string;
  system: string;
  prompt: string;
  temperature?: number;
  providerOptions?: Record<string, Record<string, JSONValue>>;
  maxRetries: number;
}

export interface GenerateTextResult {
  text: string;
}
