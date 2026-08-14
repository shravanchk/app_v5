import React from 'react';
import { Languages } from 'lucide-react';
import { localesForRegion } from '../../utils/i18n/locales';
import { useLanguage } from '../../utils/i18n/LanguageProvider';

/**
 * Language switcher for the India and Europe pages.
 *
 * Rendered by those components rather than the global Navbar on purpose —
 * offering Tamil on the US paycheck calculator would be noise. A <select> over
 * a row of buttons because six options in a row wraps badly on a phone, and the
 * native control gets the OS language keyboard and screen-reader handling free.
 *
 * The options come from the route's region, so India pages offer the Indian
 * languages and Europe pages the European ones.
 */
export function LanguageToggle({ className = '', note = true }) {
  const { region, locale, setLocale, t } = useLanguage();
  const options = localesForRegion(region);

  // A route with no region has nothing translated behind it; render nothing
  // rather than a control that would silently do nothing.
  if (options.length === 0) return null;

  return (
    <div className={className}>
      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-soft dark:border-slate-700 dark:bg-slate-800/70">
        <Languages className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" strokeWidth={1.8} aria-hidden="true" />
        <label htmlFor="upaman-locale" className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
          {t('switcher.label')}
        </label>
        <select
          id="upaman-locale"
          aria-label={t('switcher.ariaLabel')}
          // Without this the browser restores the control's previous value on a
          // back/forward or same-session navigation and fires change, which wrote
          // a language the reader never picked back into localStorage. The stored
          // preference — not browser form state — owns this value.
          autoComplete="off"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="cursor-pointer rounded-lg border-0 bg-transparent py-0.5 pr-6 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
        >
          {options.map(({ code, native }) => (
            // The option text is the language's own name, so a reader who cannot
            // read the current UI language can still find theirs.
            <option key={code} value={code} lang={code}>
              {native}
            </option>
          ))}
        </select>
      </div>
      {note && locale !== 'en' ? (
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-ink-muted dark:text-slate-400">{t('switcher.note')}</p>
      ) : null}
    </div>
  );
}

export default LanguageToggle;
