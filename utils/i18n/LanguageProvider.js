import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, STORAGE_KEY, isSupportedLocale } from './locales';
import strings from './strings';

const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  ready: false,
  t: (key, fallback) => fallback ?? key,
  tList: () => [],
});

// Dot-path lookup so callers write t('emi.loanAmount') against the nested
// dictionaries, which are far easier to read and diff than a flat map.
const resolve = (table, key) => {
  let node = table;
  for (const part of key.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[part];
  }
  return node;
};

const lookup = (table, key) => {
  const node = resolve(table, key);
  return typeof node === 'string' ? node : undefined;
};

const lookupList = (table, key) => {
  const node = resolve(table, key);
  return Array.isArray(node) ? node : undefined;
};

export function LanguageProvider({ children }) {
  // Always starts English. Every page is prerendered in English by the static
  // export, so translating during the first render would be a hydration
  // mismatch; the stored choice is applied in the effect below instead.
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isSupportedLocale(stored)) setLocaleState(stored);
    } catch (e) {
      /* private mode / storage disabled — English stands */
    }
    setReady(true);
  }, []);

  const setLocale = useCallback((next) => {
    if (!isSupportedLocale(next)) return;
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* ignore */
    }
  }, []);

  // `lang` on <html> is what screen readers switch pronunciation on, and it is
  // wrong to leave it at "en" once the visible text is Tamil.
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key, fallback) => {
      const table = strings[locale];
      // Falls through locale -> English -> caller's fallback -> the key, so a
      // missing translation degrades to readable English rather than blanking
      // a label or printing a dotted path at the user.
      return (
        (table && lookup(table, key)) ??
        lookup(strings[DEFAULT_LOCALE], key) ??
        fallback ??
        key
      );
    },
    [locale]
  );

  // For repeated values like the hub's tag chips, where a locale may legitimately
  // want a different number of chips than English has.
  const tList = useCallback(
    (key) => lookupList(strings[locale], key) ?? lookupList(strings[DEFAULT_LOCALE], key) ?? [],
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, ready, t, tList }),
    [locale, setLocale, ready, t, tList]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);

/** Convenience for components that only need the translate function. */
export const useT = () => useContext(LanguageContext).t;

export default LanguageProvider;
