export type YesNo = "yes" | "no";

export interface RuntimeMessage {
  action: string;
  [key: string]: unknown;
}

export interface StorageLike {
  get<T>(name: string): T;
  set<T>(name: string, value: T): void;
  onChanged(callback: (name: string, value: unknown) => void): void;
  onReady(callback?: () => void): Promise<void>;
}

export interface LanguageLike {
  fixTLanguageCode(langCode: string): string | null;
  fixUILanguageCode(langCode: string): string;
  codeToLanguage(langCode: string): string;
  isRtlLanguage(langCode: string): boolean;
  getAlternativeService(
    targetLanguage: string,
    serviceName: string,
    forPageTranslation: boolean
  ): string;
}
