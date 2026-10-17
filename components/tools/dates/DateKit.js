import React, { useEffect } from 'react';
import Link from 'next/link';
import { localTodayISO } from '../../ui/Field';

export const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';
export const h2Cls = 'font-display text-xl font-bold text-ink dark:text-white';

export const REGION_OPTIONS = [
  { value: 'none', label: 'Weekends only (no holidays)' },
  { value: 'us', label: 'United States — federal holidays' },
  { value: 'uk', label: 'UK — England & Wales bank holidays' }
];

// Date inputs start empty so the static HTML never bakes in a build-day date.
// After mount, any field still empty (no shared link filled it) gets a date
// relative to the visitor's own today. Functional updates run after the share
// hook's restore, so a shared link always wins.
export function useTodayDefaults(setters) {
  useEffect(() => {
    const today = localTodayISO();
    setters.forEach(([setter, compute]) => setter((current) => current || compute(today)));
    // Mount-only by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function FaqList({ title, items }) {
  return (
    <div className="mt-10">
      <h2 className={h2Cls}>{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map(({ question, answer }) => (
          <details key={question} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
            <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{question}</summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

const TOOLS = [
  { href: '/days-between-dates', label: 'Days between dates', blurb: 'Count days, weeks and months between two dates' },
  { href: '/date-calculator', label: 'Date calculator', blurb: 'Add or subtract days, weeks, months or years' },
  { href: '/business-days-calculator', label: 'Business days calculator', blurb: 'Working days with US or UK holidays' },
  { href: '/week-number', label: 'Week number', blurb: 'What week is it, and every week of the year' },
  { href: '/age-calculator', label: 'Age calculator', blurb: 'Exact age in years, months and days' }
];

export function RelatedDateTools({ current }) {
  return (
    <div className="mt-10">
      <h2 className={h2Cls}>More date tools</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.filter((t) => t.href !== current).map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-xl border border-slate-200/70 bg-white p-4 transition hover:border-brand-300 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70"
          >
            <span className="font-semibold text-ink dark:text-white">{t.label}</span>
            <span className="mt-1 block text-sm text-ink-muted dark:text-slate-400">{t.blurb}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const plural = (n, word) => `${n.toLocaleString('en-US')} ${word}${Math.abs(n) === 1 ? '' : 's'}`;

export const ymdText = ({ years, months, days }) => {
  const parts = [];
  if (years) parts.push(plural(years, 'year'));
  if (months) parts.push(plural(months, 'month'));
  if (days || !parts.length) parts.push(plural(days, 'day'));
  return parts.join(', ');
};
