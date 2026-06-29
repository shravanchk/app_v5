import React from 'react';
import Link from 'next/link';
import {
  Calculator, Landmark, TrendingUp, PiggyBank, Receipt, Wallet, LineChart, Home,
  Percent, Repeat, CreditCard, Ruler, Braces, LayoutGrid, LucideIcon,
} from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

type Calc = { icon: LucideIcon; label: string; href: string; tint: string };

// Per-icon colour tints (light + dark) for a friendlier, less monochrome grid.
const T = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const CALCS: Calc[] = [
  { icon: Calculator, label: 'EMI / Loan', href: '/loan-calculator', tint: T.brand },
  { icon: Landmark, label: 'Income Tax', href: '/income-tax-calculator', tint: T.violet },
  { icon: TrendingUp, label: 'SIP', href: '/sip-calculator', tint: T.emerald },
  { icon: PiggyBank, label: 'PPF', href: '/ppf-calculator', tint: T.rose },
  { icon: Receipt, label: 'GST', href: '/gst-calculator', tint: T.amber },
  { icon: Wallet, label: 'Salary', href: '/salary-calculator', tint: T.sky },
  { icon: LineChart, label: 'Capital Gains', href: '/capital-gains-calculator', tint: T.teal },
  { icon: Home, label: 'HRA Exemption', href: '/hra-calculator', tint: T.indigo },
  { icon: Wallet, label: 'Gratuity', href: '/gratuity-calculator', tint: T.emerald },
  { icon: Percent, label: 'GST 2.0 Price', href: '/gst-reform-calculator', tint: T.amber },
  { icon: Repeat, label: 'Tax Regime', href: '/tax-regime-comparison', tint: T.violet },
  { icon: CreditCard, label: 'Credit Card Trap', href: '/credit-card-trap-calculator', tint: T.rose },
  { icon: Ruler, label: 'Unit Converter', href: '/unit-converter', tint: T.sky },
  { icon: Braces, label: 'JSON Formatter', href: '/json-tools', tint: T.teal },
  { icon: LayoutGrid, label: 'All Calculators', href: '/india-calculators', tint: T.brand },
];

export default function CalculatorGrid() {
  return (
    <section id="calculators" className="py-14 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="All calculators"
          title="Powerful calculators for every need"
          subtitle="Accurate, transparent and free — updated for FY 2026-27."
          action={{ label: 'View all calculators', href: '/india-calculators' }}
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {CALCS.map(({ icon: Icon, label, href, tint }) => (
            <Link
              key={label}
              href={href}
              className="group flex h-full flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-200/70 bg-white px-3 py-6 text-center shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70"
            >
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-105 ${tint}`}>
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <span className="text-sm font-semibold text-ink dark:text-slate-100">{label}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
