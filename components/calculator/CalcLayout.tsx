import React from 'react';
import Container from '../ui/Container';
import { cn } from '../ui/cn';

type CalcLayoutProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Tax year or rate set the figures apply to, e.g. "FY 2026-27". */
  ratesFor?: string;
  /** When the figures were last checked against the source, e.g. "June 2026". */
  reviewedOn?: string;
  children: React.ReactNode;
};

// Page shell for a calculator in the new design system. Sits on the global
// slate-50 background provided by _app.js.
export function CalcLayout({ eyebrow, title, subtitle, ratesFor, reviewedOn, children }: CalcLayoutProps) {
  return (
    <section className="py-8 sm:py-12">
      <Container>
        <header className="max-w-2xl">
          {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-300">{eyebrow}</p> : null}
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">{title}</h1>
          {subtitle ? <p className="mt-2 text-base leading-relaxed text-ink-muted dark:text-slate-400">{subtitle}</p> : null}
          {/* Which year's numbers these are, stated on the page rather than left
              to the reader to infer from the title. */}
          {ratesFor ? (
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted dark:text-slate-400">
              <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                Rates for {ratesFor}
              </span>
              {reviewedOn ? <span>Last reviewed {reviewedOn}</span> : null}
              <a href="/methodology" className="underline underline-offset-2 hover:text-ink dark:hover:text-slate-200">
                How we calculate
              </a>
            </p>
          ) : null}
        </header>
        <div className="mt-7">{children}</div>
      </Container>
    </section>
  );
}

type ResultStatProps = { label: string; value: string; emphasis?: boolean; tone?: 'default' | 'positive' };

export function ResultStat({ label, value, emphasis, tone = 'default' }: ResultStatProps) {
  return (
    <div className={cn('animate-fade-up rounded-xl border p-4', emphasis ? 'border-brand-200 bg-brand-50/60 dark:border-brand-800/60 dark:bg-brand-900/20' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60')}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400">{label}</p>
      <p className={cn('mt-1 font-display text-xl font-bold tracking-tight', tone === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink dark:text-white')}>{value}</p>
    </div>
  );
}

export default CalcLayout;
