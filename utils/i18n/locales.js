// Regional-language support for the India and Europe calculators.
//
// Deliberately client-side only: the site is a static export, every page is
// prerendered in English, and the language choice is applied after mount from
// localStorage. That keeps one URL per calculator — no /de/* routes, no extra
// sitemap entries, no hreflang — so this ships without touching crawl budget.
//
// For the European languages that is a holding position, not the destination:
// German and French readers search in their own language, and an English page
// with a client-side toggle cannot rank for "brutto netto rechner". Promoting
// these to real localised routes is the point; it waits on the indexing
// experiment in seo-audit/RUNBOOK.md clearing first.

export const DEFAULT_LOCALE = 'en';

// `native` is what the switcher shows — a language picker that names languages
// in English is useless to the reader who needs it.
export const LOCALES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'de', native: 'Deutsch', english: 'German' },
  { code: 'fr', native: 'Français', english: 'French' },
  { code: 'es', native: 'Español', english: 'Spanish' },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code);

export const isSupportedLocale = (code) => LOCALE_CODES.includes(code);

export const getLocale = (code) => LOCALES.find((l) => l.code === code) || LOCALES[0];

/** The locale entries a given region offers, in registry order. */
export const localesForRegion = (region) =>
  LOCALES.filter((l) => region && region.locales.includes(l.code));
