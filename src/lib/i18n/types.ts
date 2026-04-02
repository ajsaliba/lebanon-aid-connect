export type Language = 'en' | 'ar' | 'fr' | 'es' | 'de';

export type LocaleDictionary = Record<string, string>;

export interface LocaleMeta {
  code: Language;
  label: string;
  nativeLabel: string;
  rtl: boolean;
}
