import { useCallback, useEffect, useState } from 'react';
import type { Language, LocaleDictionary, LocaleMeta } from '@/lib/i18n/types';
import enLocale from '@/lib/i18n/locales/en';

const STORAGE_KEY = 'cedars-alert-lang';
const RTL_LANGUAGES = new Set<Language>(['ar']);

const localeLoaders: Record<Language, () => Promise<{ default: LocaleDictionary }>> = {
  en: async () => ({ default: enLocale }),
  ar: () => import('@/lib/i18n/locales/ar'),
  fr: () => import('@/lib/i18n/locales/fr'),
  es: () => import('@/lib/i18n/locales/es'),
  de: () => import('@/lib/i18n/locales/de'),
  it: () => import('@/lib/i18n/locales/it'),
  pt: () => import('@/lib/i18n/locales/pt'),
  tr: () => import('@/lib/i18n/locales/tr'),
  ru: () => import('@/lib/i18n/locales/ru'),
};

const localeCache: Partial<Record<Language, LocaleDictionary>> = {
  en: enLocale,
};

export const SUPPORTED_LANGUAGES: LocaleMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', rtl: false },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', rtl: true },
  { code: 'fr', label: 'French', nativeLabel: 'Français', rtl: false },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', rtl: false },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', rtl: false },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', rtl: false },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', rtl: false },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', rtl: false },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', rtl: false },
];

function normalizeLanguage(value: string | null | undefined): Language | null {
  if (!value) return null;

  const normalized = value.toLowerCase().split(/[-_]/)[0];
  if (
    normalized === 'en' ||
    normalized === 'ar' ||
    normalized === 'fr' ||
    normalized === 'es' ||
    normalized === 'de' ||
    normalized === 'it' ||
    normalized === 'pt' ||
    normalized === 'tr' ||
    normalized === 'ru'
  ) {
    return normalized;
  }

  return null;
}

function getStoredLang(): Language | null {
  if (typeof window === 'undefined') return null;

  try {
    return normalizeLanguage(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function detectLanguage(): Language {
  const stored = getStoredLang();
  if (stored) return stored;

  if (typeof navigator !== 'undefined') {
    const fromLanguages = (navigator.languages || []).map(normalizeLanguage).find(Boolean);
    if (fromLanguages) return fromLanguages;

    const fromSingle = normalizeLanguage(navigator.language);
    if (fromSingle) return fromSingle;
  }

  return 'en';
}

let currentLang: Language = detectLanguage();
let currentDictionary: LocaleDictionary = enLocale;
let loadingLocale = false;
let localeRequestVersion = 0;

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function applyDocumentLanguage(lang: Language) {
  if (typeof document === 'undefined') return;

  const rtl = RTL_LANGUAGES.has(lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', rtl);
}

async function ensureLocale(lang: Language): Promise<LocaleDictionary> {
  const cached = localeCache[lang];
  if (cached) return cached;

  const module = await localeLoaders[lang]();
  localeCache[lang] = module.default;
  return module.default;
}

function persistLanguage(lang: Language) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore storage exceptions.
  }
}

export function isRtlLanguage(lang: Language): boolean {
  return RTL_LANGUAGES.has(lang);
}

export function getLanguage(): Language {
  return currentLang;
}

export function getSupportedLanguages(): LocaleMeta[] {
  return SUPPORTED_LANGUAGES;
}

export function t(key: string): string {
  return currentDictionary[key] ?? enLocale[key] ?? key;
}

export function setLanguage(lang: Language) {
  const nextLang = normalizeLanguage(lang) ?? 'en';
  const requestVersion = ++localeRequestVersion;

  currentLang = nextLang;
  persistLanguage(nextLang);
  applyDocumentLanguage(nextLang);

  const cached = localeCache[nextLang];
  if (cached) {
    currentDictionary = cached;
    loadingLocale = false;
    notifyListeners();
    return;
  }

  loadingLocale = true;
  notifyListeners();

  void ensureLocale(nextLang)
    .then(dictionary => {
      if (requestVersion !== localeRequestVersion) return;
      currentDictionary = dictionary;
    })
    .catch(() => {
      if (requestVersion !== localeRequestVersion) return;
      currentLang = 'en';
      currentDictionary = enLocale;
      persistLanguage('en');
      applyDocumentLanguage('en');
    })
    .finally(() => {
      if (requestVersion !== localeRequestVersion) return;
      loadingLocale = false;
      notifyListeners();
    });
}

export function useTranslation() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(value => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  return {
    t,
    lang: currentLang,
    changeLanguage,
    isLoadingLocale: loadingLocale,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

if (typeof document !== 'undefined') {
  applyDocumentLanguage(currentLang);
}

if (currentLang !== 'en') {
  void ensureLocale(currentLang)
    .then(dictionary => {
      currentDictionary = dictionary;
      notifyListeners();
    })
    .catch(() => {
      currentLang = 'en';
      currentDictionary = enLocale;
      applyDocumentLanguage('en');
      notifyListeners();
    });
}
