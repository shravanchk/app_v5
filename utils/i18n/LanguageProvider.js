import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DEFAULT_LOCALE } from './locales';
import { REGIONS, regionForRoute } from './regions';
import strings from './strings';

const NO_REGION = {
  region: null,
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  ready: false,
  t: (key, fallback) => fallback ?? key,
  tList: () => [],
};

const LanguageContext = createContext(NO_REGION);

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
  const router = useRouter();
  // Region comes from the route rather than a prop so the fourteen India and
  // Europe components do not each have to declare it.
  const region = REGIONS[regionForRoute(router.pathname)] || null;

  // Always starts English. Every page is prerendered in English by the static
  // export, so translating during the first render would be a hydration
  // mismatch; the stored choice is applied in the effect below instead.
  const [byRegion, setByRegion] = useState({});
  const [ready, setReady] = useState(false);

  const locale = (region && byRegion[region.key]) || DEFAULT_LOCALE;

  // Re-reads on region change: the India and Europe preferences live under
  // separate keys, so crossing between them restores the right one.
  useEffect(() => {
    if (!region) {
      setReady(true);
      return;
    }
    try {
      const stored = localStorage.getItem(region.storageKey);
      if (stored && region.locales.includes(stored)) {
        setByRegion((prev) => ({ ...prev, [region.key]: stored }));
      }
    } catch (e) {
      /* private mode / storage disabled — English stands */
    }
    setReady(true);
  }, [region]);

  const setLocale = useCallback(
    (next) => {
      if (!region || !region.locales.includes(next)) return;
      setByRegion((prev) => ({ ...prev, [region.key]: next }));
      try {
        localStorage.setItem(region.storageKey, next);
      } catch (e) {
        /* ignore */
      }
    },
    [region]
  );

  // `lang` on <html> is what screen readers switch pronunciation on, and it is
  // wrong to leave it at "en" once the visible text is Tamil.
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key, fallback) => {
      const tables = region ? strings[region.key] : null;
      if (!tables) return fallback ?? key;
      // Falls through locale -> English -> caller's fallback -> the key, so a
      // missing translation degrades to readable English rather than blanking
      // a label or printing a dotted path at the user.
      return (
        lookup(tables[locale], key) ??
        lookup(tables[DEFAULT_LOCALE], key) ??
        fallback ??
        key
      );
    },
    [region, locale]
  );

  // For repeated values like the hub's tag chips, where a locale may legitimately
  // want a different number of chips than English has.
  const tList = useCallback(
    (key) => {
      const tables = region ? strings[region.key] : null;
      if (!tables) return [];
      return lookupList(tables[locale], key) ?? lookupList(tables[DEFAULT_LOCALE], key) ?? [];
    },
    [region, locale]
  );

  const value = useMemo(
    () => ({ region, locale, setLocale, ready, t, tList }),
    [region, locale, setLocale, ready, t, tList]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);

/** Convenience for components that only need the translate function. */
export const useT = () => useContext(LanguageContext).t;

export default LanguageProvider;
