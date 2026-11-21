import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import mr from '../i18n/mr.json';
import { formatNumber } from './money.js';

export const LANGUAGES = ['en', 'hi', 'mr'];
export const LANG_STORAGE_KEY = 'tutorkhata.lang';

const DICTS = { en, hi, mr };
const I18nContext = createContext(null);
const warnedKeys = new Set();

function readInitialLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch {
    // Storage unavailable; use the default language.
  }
  return 'en';
}

function interpolate(str, params, lang) {
  return str.replace(/\{\{\s*(\w+)\s*\}\}/g, (token, name) => {
    const value = params[name];
    if (value === undefined) return token;
    if (typeof value === 'number') return formatNumber(value, lang);
    return String(value);
  });
}

function warnMissing(key, lang) {
  const id = `${lang}:${key}`;
  if (warnedKeys.has(id)) return;
  warnedKeys.add(id);
  console.warn(`[i18n] missing key "${key}" for language "${lang}"`);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readInitialLang);

  const setLang = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return;
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Storage unavailable; the choice still applies for this session.
    }
  }, []);

  const t = useCallback(
    (key, params = {}) => {
      const dict = DICTS[lang] ?? en;
      const hasCount = typeof params.count === 'number';
      const candidates = hasCount
        ? [key + (params.count === 1 ? '_one' : '_other'), key]
        : [key];

      // Prefer the active language; warn if it lacks every candidate for this key.
      for (const candidate of candidates) {
        const found = dict[candidate];
        if (typeof found === 'string') return interpolate(found, params, lang);
      }
      warnMissing(key, lang);

      // Fall back to English so the screen still shows text.
      for (const candidate of candidates) {
        const found = en[candidate];
        if (typeof found === 'string') return interpolate(found, params, lang);
      }
      warnMissing(key, 'en');
      return key;
    },
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('app.pageTitle');
  }, [lang, t]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (ctx === null) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return ctx;
}
