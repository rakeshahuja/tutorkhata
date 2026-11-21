import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import mr from '../i18n/mr.json';

export const LANGUAGES = ['en', 'hi', 'mr'];
export const LANG_STORAGE_KEY = 'tutorkhata.lang';

const DICTS = { en, hi, mr };
const I18nContext = createContext(null);

function readInitialLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch {
    // Storage unavailable; use the default language.
  }
  return 'en';
}

function interpolate(str, params) {
  return str.replace(/\{\{\s*(\w+)\s*\}\}/g, (token, name) =>
    params[name] !== undefined ? String(params[name]) : token
  );
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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

      for (const candidate of candidates) {
        const found = dict[candidate] ?? en[candidate];
        if (typeof found === 'string') return interpolate(found, params);
      }
      return key;
    },
    [lang]
  );

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
