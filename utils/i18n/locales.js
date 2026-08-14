// Regional-language support for the India calculators.
//
// Deliberately client-side only: the site is a static export, every page is
// prerendered in English, and the language choice is applied after mount from
// localStorage. That keeps one URL per calculator — no /hi/* routes, no extra
// sitemap entries, no hreflang — so this ships without touching crawl budget.
// See the SEO notes in seo-audit/RUNBOOK.md before turning any of this into
// indexable localised routes.

export const DEFAULT_LOCALE = 'en';

export const STORAGE_KEY = 'upaman:locale';

// `native` is what the switcher shows — a language picker that names languages
// in English is useless to the reader who needs it.
export const LOCALES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code);

export const isSupportedLocale = (code) => LOCALE_CODES.includes(code);

export const getLocale = (code) => LOCALES.find((l) => l.code === code) || LOCALES[0];
