import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

type Item = { label: string; href: string; group: string; k?: string };

// `k` holds hidden synonyms/keywords so searches like "date of birth" find the
// Age Calculator. Keep entries in sync when adding calculators.
const INDEX: Item[] = [
  // United States
  { label: 'US Paycheck Calculator', href: '/us-paycheck-calculator', group: 'US', k: 'salary after tax take home pay withholding federal fica w2 net income' },
  { label: 'Take-Home Pay by State', href: '/paycheck', group: 'US', k: 'state income tax salary after taxes california texas florida new york' },
  { label: 'Salary After Taxes ($30k–$250k)', href: '/after-taxes', group: 'US', k: 'take home pay 40000 50000 60000 70000 80000 100000 a year after tax' },
  { label: 'US Mortgage Calculator', href: '/us-mortgage-calculator', group: 'US', k: 'home loan house monthly payment amortization pmi property' },
  { label: 'US Refinance Calculator', href: '/us-refinance-calculator', group: 'US', k: 'mortgage refi break even rate' },
  { label: 'US Auto Loan Calculator', href: '/us-auto-loan-calculator', group: 'US', k: 'car loan vehicle financing monthly payment' },
  { label: 'US 401(k) Calculator', href: '/us-401k-calculator', group: 'US', k: 'retirement savings employer match contribution roth' },
  { label: 'US Savings & CD Calculator', href: '/us-savings-cd-calculator', group: 'US', k: 'certificate of deposit apy high yield interest' },
  { label: 'US Credit Card Payoff', href: '/us-credit-card-payoff-calculator', group: 'US', k: 'debt snowball avalanche minimum payment interest' },
  { label: 'Compound Interest Calculator', href: '/compound-interest-calculator', group: 'US', k: 'investment growth savings interest wealth future value' },
  { label: 'US Inflation Calculator', href: '/inflation-calculator', group: 'US', k: 'cpi purchasing power dollar value over time' },
  { label: 'US Calculators Hub', href: '/us-calculators', group: 'US', k: 'america american tools' },
  // UK & Europe
  { label: 'UK Income Tax Calculator', href: '/uk-income-tax-calculator', group: 'UK & Europe', k: 'paye national insurance ni hmrc take home salary after tax britain scottish' },
  { label: 'UK Take-Home by Salary', href: '/uk/take-home', group: 'UK & Europe', k: 'after tax 25000 30000 40000 50000 salary net pounds britain' },
  { label: 'Germany Take-Home by Salary', href: '/germany/take-home', group: 'UK & Europe', k: 'brutto netto after tax german salary lohn' },
  { label: 'Germany Salary Calculator', href: '/germany-salary-calculator', group: 'UK & Europe', k: 'brutto netto lohn gehalt german net' },
  { label: 'France Salary Calculator', href: '/france-salary-calculator', group: 'UK & Europe', k: 'salaire net brut french' },
  { label: 'Netherlands Salary Calculator', href: '/netherlands-salary-calculator', group: 'UK & Europe', k: 'dutch box 1 holland net salary' },
  { label: 'European Salary Calculator', href: '/european-salary-calculator', group: 'UK & Europe', k: 'net salary europe switzerland sweden austria belgium compare countries' },
  { label: 'European VAT Calculator', href: '/eu-vat-calculator', group: 'UK & Europe', k: 'value added tax reverse inclusive exclusive' },
  { label: 'UK & Europe Calculators Hub', href: '/eu-calculators', group: 'UK & Europe', k: 'european tools' },
  // India
  { label: 'EMI / Loan Calculator', href: '/loan-calculator', group: 'India', k: 'home loan car loan monthly installment interest prepayment' },
  { label: 'Income Tax Calculator (India)', href: '/income-tax-calculator', group: 'India', k: 'new regime old regime slab fy 2026-27 in hand' },
  { label: 'Tax Regime Comparison', href: '/tax-regime-comparison', group: 'India', k: 'old vs new regime which is better' },
  { label: 'Tax on Salary (₹5L–₹50L)', href: '/tax-on-salary', group: 'India', k: 'lakh income tax by salary' },
  { label: 'Salary Calculator (CTC to In-Hand)', href: '/salary-calculator', group: 'India', k: 'ctc take home monthly in hand breakup' },
  { label: 'SIP Calculator', href: '/sip-calculator', group: 'India', k: 'mutual fund systematic investment plan step up corpus' },
  { label: 'PPF Calculator', href: '/ppf-calculator', group: 'India', k: 'public provident fund maturity' },
  { label: 'GST Calculator', href: '/gst-calculator', group: 'India', k: 'goods services tax inclusive exclusive' },
  { label: 'GST 2.0 Price Calculator', href: '/gst-reform-calculator', group: 'India', k: 'gst reform new rates price change' },
  { label: 'HRA Exemption Calculator', href: '/hra-calculator', group: 'India', k: 'house rent allowance metro' },
  { label: 'Capital Gains Calculator', href: '/capital-gains-calculator', group: 'India', k: 'ltcg stcg stocks property indexation' },
  { label: 'Gratuity Calculator', href: '/gratuity-calculator', group: 'India', k: 'years of service payout' },
  { label: 'Credit Card Trap Calculator', href: '/credit-card-trap-calculator', group: 'India', k: 'minimum due interest debt revolving' },
  { label: 'IRCTC Fee Calculator', href: '/irctc-calculator', group: 'India', k: 'train ticket convenience fee tatkal railway booking' },
  { label: 'Buy vs Rent Calculator', href: '/buy-vs-rent-calculator', group: 'India', k: 'house property home decision' },
  { label: 'India Calculators Hub', href: '/india-calculators', group: 'India', k: 'indian tools rupee' },
  // Health
  { label: 'BMI Calculator', href: '/bmi-calculator', group: 'Health', k: 'body mass index healthy weight overweight obese' },
  { label: 'Calorie Calculator (TDEE)', href: '/calorie-calculator', group: 'Health', k: 'daily calories maintain lose gain weight deficit energy' },
  { label: 'BMR Calculator', href: '/bmr-calculator', group: 'Health', k: 'basal metabolic rate resting burn mifflin' },
  { label: 'Body Fat Calculator', href: '/body-fat-calculator', group: 'Health', k: 'navy method percentage lean mass tape measure' },
  { label: 'Ideal Weight Calculator', href: '/ideal-weight-calculator', group: 'Health', k: 'healthy weight for height devine formula' },
  { label: 'Macro Calculator', href: '/macro-calculator', group: 'Health', k: 'protein carbs fat grams diet split nutrition keto' },
  { label: 'Water Intake Calculator', href: '/water-intake-calculator', group: 'Health', k: 'hydration daily water drink liters ounces cups' },
  { label: 'Period Calculator', href: '/period-calculator', group: 'Health', k: 'menstrual cycle fertile window ovulation next period' },
  { label: 'Pregnancy Due Date Calculator', href: '/pregnancy-due-date-calculator', group: 'Health', k: 'naegele gestational age trimester lmp baby' },
  { label: 'Health Calculators Hub', href: '/health-calculators', group: 'Health', k: 'fitness body tools' },
  // Tools
  { label: 'Age Calculator', href: '/age-calculator', group: 'Tool', k: 'date of birth dob birthday how old am i years months days between dates' },
  { label: 'Percentage Calculator', href: '/percentage-calculator', group: 'Tool', k: 'percent change increase decrease discount of a number' },
  { label: 'Tip Calculator', href: '/tip-calculator', group: 'Tool', k: 'restaurant split bill service gratuity' },
  { label: 'Unit Converter', href: '/unit-converter', group: 'Tool', k: 'length weight temperature metric imperial km miles kg pounds' },
  { label: 'Scientific Calculator', href: '/scientific-calculator', group: 'Tool', k: 'trigonometry logarithm sin cos math' },
  { label: 'Statistics Calculator', href: '/statistics-calculator', group: 'Tool', k: 'mean median mode standard deviation variance' },
  { label: 'JSON Formatter', href: '/json-tools', group: 'Tool', k: 'validate beautify minify pretty print' },
  { label: 'Everyday Tools Hub', href: '/tools', group: 'Tool', k: 'utilities converters' },
  // Workflows
  { label: 'Home Loan Readiness', href: '/home-loan-readiness-workflow', group: 'Workflow', k: 'can i afford emi safe income check' },
  { label: 'Buy vs Rent Decision', href: '/rent-vs-buy-workflow', group: 'Workflow', k: 'house property should i buy or rent' },
  { label: 'Prepay Loan or Invest', href: '/prepay-vs-invest-workflow', group: 'Workflow', k: 'extra money emi prepayment sip decision' },
  { label: 'Job Offer Decision', href: '/job-offer-workflow', group: 'Workflow', k: 'compare offers salary hike switch company' },
  { label: 'Emergency Fund Readiness', href: '/emergency-fund-readiness-workflow', group: 'Workflow', k: 'savings buffer months expenses' },
  { label: 'Car Ownership Cost', href: '/car-ownership-cost-workflow', group: 'Workflow', k: 'total cost fuel insurance maintenance' },
  { label: 'All Workflows', href: '/workflows', group: 'Workflow', k: 'decision guides step by step' },
  // Guides
  { label: 'Read Your US Paycheck', href: '/guides/how-to-read-your-paycheck', group: 'Guide', k: 'deductions withholding fica explained stub' },
  { label: 'Traditional vs Roth 401(k)', href: '/guides/traditional-vs-roth-401k', group: 'Guide', k: 'retirement pre tax after tax which' },
  { label: 'UK Tax Rates 2026-27', href: '/guides/uk-tax-rates-2026-27', group: 'Guide', k: 'bands allowance national insurance scotland' },
  { label: 'FY 2026-27 Income Tax Slabs', href: '/guides/india-income-tax-2026-27', group: 'Guide', k: 'india new regime rates' },
  { label: 'Old vs New Regime Breakeven', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27', group: 'Guide', k: 'india deductions 80c comparison' },
  { label: 'CTC to In-Hand Salary', href: '/guides/ctc-to-in-hand-salary', group: 'Guide', k: 'india salary structure basic hra pf' },
  { label: 'All Guides', href: '/guides', group: 'Guide', k: 'articles explainers' },
];

// Multi-word search: every word must match the label, keywords, or group.
// Label matches rank above keyword-only matches.
function scoreItem(item: Item, tokens: string[]): number {
  const label = item.label.toLowerCase();
  const hay = `${label} ${item.k ?? ''} ${item.group.toLowerCase()}`;
  let score = 0;
  for (const t of tokens) {
    if (!hay.includes(t)) return 0;
    if (label.startsWith(t)) score += 3;
    else if (label.includes(t)) score += 2;
    else score += 1;
  }
  return score;
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return INDEX;
    const tokens = term.split(/\s+/);
    return INDEX
      .map((item, i) => ({ item, i, score: scoreItem(item, tokens) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map((r) => r.item);
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
