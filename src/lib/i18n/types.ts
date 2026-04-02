export type Language = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'tr' | 'ru';

export type LocaleDictionary = Record<string, string>;

export interface LocaleMeta {
  code: Language;
  label: string;
  nativeLabel: string;
  rtl: boolean;
}
