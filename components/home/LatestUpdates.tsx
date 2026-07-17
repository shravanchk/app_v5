import React from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import Container from '../ui/Container';

type Update = { date: string; text: string; href?: string };

// Most recent first, max ~6 shown. Add a new line when something real ships;
// dates must match the actual deploy. Older entries can simply be deleted.
const UPDATES: Update[] = [
  { date: '2026-07-17', text: 'New guide for filing season: How to File Your ITR (AY 2026-27) — form choice, regime choice, and AIS reconciliation', href: '/guides/how-to-file-itr' },
  { date: '2026-07-15', text: 'Nine new guides across the US, UK, and India — budgeting, home affordability, CD ladders, APR vs APY, retirement benchmarks, UK payslips, salary sacrifice, HRA exemption, and SIP vs lumpsum', href: '/guides' },
  { date: '2026-07-11', text: 'New IRCTC Cancellation Charges Calculator — implements the April 2026 72h/24h/8h refund rules with Tatkal and RAC/WL cases', href: '/irctc-cancellation-calculator' },
  { date: '2026-07-11', text: 'Category hub pages now explain how each region’s rules differ, with examples computed from the live engines', href: '/us-calculators' },
  { date: '2026-07-10', text: 'Three new decision workflows: FD vs SIP, Retirement Readiness (India & US), and US Mortgage Payoff vs Invest', href: '/workflows' },
  { date: '2026-07-10', text: 'Every calculator now includes an in-depth explainer, a worked example, and an FAQ' },
  { date: '2026-07-10', text: 'US state paycheck and take-home pages upgraded with per-state tax analysis and 51-state rankings', href: '/paycheck' },
  { date: '2026-07-07', text: 'Mobile layout fixes across calculators, plus a new feedback form', href: '/feedback' },
  { date: '2026-07-06', text: 'Blog launched with three data-driven posts on take-home pay and tax regimes', href: '/blog' },
];

const shown = UPDATES.slice(0, 6);

const dateLabel = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${iso}T00:00:00Z`));

export default function LatestUpdates() {
  return (
    <section aria-label="Latest site updates" className="pt-10 sm:pt-12">
      <Container>
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-5 dark:border-slate-700/70 dark:bg-slate-800/40">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft dark:text-slate-300">
            <History className="h-4 w-4 text-brand-600 dark:text-brand-300" strokeWidth={2} />
            Latest updates
          </h2>
          <ul className="mt-3 space-y-2">
            {shown.map(({ date, text, href }) => (
              <li key={`${date}-${text.slice(0, 24)}`} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-baseline sm:gap-3">
                <time dateTime={date} className="shrink-0 font-mono text-xs font-medium text-ink-muted dark:text-slate-500 sm:w-24">
                  {dateLabel(date)}
                </time>
                <span className="leading-relaxed text-ink-soft dark:text-slate-300">
                  {text}
                  {href && (
                    <>
                      {' '}
                      <Link href={href} className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">
                        See it →
                      </Link>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
