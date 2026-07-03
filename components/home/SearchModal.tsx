import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

type Item = { label: string; href: string; group: string };

const INDEX: Item[] = [
  { label: 'EMI / Loan Calculator', href: '/loan-calculator', group: 'Calculator' },
  { label: 'Income Tax Calculator', href: '/income-tax-calculator', group: 'Calculator' },
  { label: 'Tax Regime Comparison', href: '/tax-regime-comparison', group: 'Calculator' },
  { label: 'SIP Calculator', href: '/sip-calculator', group: 'Calculator' },
  { label: 'PPF Calculator', href: '/ppf-calculator', group: 'Calculator' },
  { label: 'GST Calculator', href: '/gst-calculator', group: 'Calculator' },
  { label: 'GST 2.0 Price Calculator', href: '/gst-reform-calculator', group: 'Calculator' },
  { label: 'Salary Calculator', href: '/salary-calculator', group: 'Calculator' },
  { label: 'Capital Gains Calculator', href: '/capital-gains-calculator', group: 'Calculator' },
  { label: 'HRA Exemption Calculator', href: '/hra-calculator', group: 'Calculator' },
  { label: 'Gratuity Calculator', href: '/gratuity-calculator', group: 'Calculator' },
  { label: 'Tax on Salary (₹5L–₹50L)', href: '/tax-on-salary', group: 'Calculator' },
  { label: 'Home Loan Readiness', href: '/home-loan-readiness-workflow', group: 'Workflow' },
  { label: 'Buy vs Rent', href: '/rent-vs-buy-workflow', group: 'Workflow' },
  { label: 'Prepay Loan or Invest', href: '/prepay-vs-invest-workflow', group: 'Workflow' },
  { label: 'Job Offer Decision', href: '/job-offer-workflow', group: 'Workflow' },
  { label: 'Emergency Fund Readiness', href: '/emergency-fund-readiness-workflow', group: 'Workflow' },
  { label: 'FY 2026-27 Income Tax Slabs', href: '/guides/india-income-tax-2026-27', group: 'Guide' },
  { label: 'Old vs New Regime Breakeven', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27', group: 'Guide' },
  { label: 'Unit Converter', href: '/unit-converter', group: 'Tool' },
  { label: 'JSON Formatter', href: '/json-tools', group: 'Tool' },
  { label: 'US Paycheck Calculator', href: '/us-paycheck-calculator', group: 'Calculator' },
  { label: 'Take-Home Pay by State', href: '/paycheck', group: 'Calculator' },
  { label: 'Compound Interest Calculator', href: '/compound-interest-calculator', group: 'Calculator' },
  { label: 'US Inflation Calculator', href: '/inflation-calculator', group: 'Calculator' },
  { label: 'Percentage Calculator', href: '/percentage-calculator', group: 'Tool' },
  { label: 'Tip Calculator', href: '/tip-calculator', group: 'Tool' },
  { label: 'BMI Calculator', href: '/bmi-calculator', group: 'Health' },
  { label: 'Calorie Calculator (TDEE)', href: '/calorie-calculator', group: 'Health' },
  { label: 'BMR Calculator', href: '/bmr-calculator', group: 'Health' },
  { label: 'Body Fat Calculator', href: '/body-fat-calculator', group: 'Health' },
  { label: 'Period Calculator', href: '/period-calculator', group: 'Health' },
  { label: 'Pregnancy Due Date Calculator', href: '/pregnancy-due-date-calculator', group: 'Health' },
  { label: 'Health Calculators Hub', href: '/health-calculators', group: 'Health' },
];

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return INDEX;
    return INDEX.filter((i) => i.label.toLowerCase().includes(term) || i.group.toLowerCase().includes(term));
  }, [q]);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 dark:border-slate-700">
          <Search className="h-5 w-5 text-ink-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search calculators, workflows, guides…"
            className="w-full bg-transparent py-3.5 text-[0.95rem] text-ink outline-none placeholder:text-ink-muted dark:text-slate-100"
            aria-label="Search query"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="-mr-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg text-ink-muted hover:bg-slate-100 hover:text-ink-soft dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-ink-muted">No matches. Try “tax”, “loan”, or “SIP”.</li>
          ) : (
            results.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>{it.label}</span>
                  <span className="text-xs text-ink-muted">{it.group}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
