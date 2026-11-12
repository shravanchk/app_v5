import React from 'react';
import Link from 'next/link';
import { BarChart3, ArrowRight } from 'lucide-react';
import Container from '../ui/Container';

// Points the India tax pages at the take-home salary report, the page that
// carries the downloadable dataset and the figures people quote.
export default function ReportCallout() {
  return (
    <Container className="pb-2">
      <Link
        href="/india-take-home-salary-report"
        className="group flex items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 transition hover:border-brand-300 hover:shadow-card dark:border-brand-800/60 dark:bg-brand-900/20"
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white"><BarChart3 className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-semibold text-ink group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">India Take-Home Salary Report FY 2026-27</span>
          <span className="block text-sm text-ink-muted dark:text-slate-400">Tax, effective rate and monthly take-home on every salary from ₹5 lakh to ₹50 lakh, both regimes, with a free CSV dataset.</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-brand-600 transition group-hover:translate-x-0.5 dark:text-brand-300" />
      </Link>
    </Container>
  );
}
