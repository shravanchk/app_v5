import React from 'react';
import Link from 'next/link';
import {
  Landmark, RefreshCcw, Car, PiggyBank, Wallet, CreditCard, BadgeDollarSign, TrendingUp, Banknote, Table2, Hourglass,
} from 'lucide-react';
import { CalcLayout } from '../calculator/CalcLayout';

const T = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
};

const cards = [
  { title: 'US Paycheck Calculator', description: 'Take-home pay for 2026 after federal tax, Social Security, Medicare, and state tax — all 50 states + D.C.', icon: BadgeDollarSign, path: '/us-paycheck-calculator', tint: T.emerald, tags: ['2026 tax year', 'All 50 states', 'Take-home pay'] },
  { title: 'Salary After Taxes', description: 'How much you keep from $30k–$250k salaries in 2026, with state-by-state take-home tables for every level.', icon: Table2, path: '/after-taxes', tint: T.sky, tags: ['$30k–$250k', '50-state tables', '2026 tax year'] },
  { title: 'US Mortgage Calculator', description: 'Estimate your monthly payment with principal, interest, property tax, insurance, HOA, and PMI.', icon: Landmark, path: '/us-mortgage-calculator', tint: T.brand, tags: ['PITI + PMI', 'Affordability ratio', 'Interest estimate'] },
  { title: 'US Refinance Break-even Calculator', description: 'Compare your current mortgage against a refinance offer and estimate the break-even point.', icon: RefreshCcw, path: '/us-refinance-calculator', tint: T.violet, tags: ['Break-even', 'Cost recovery', 'Savings estimate'] },
  { title: 'US Auto Loan Calculator', description: 'Calculate the monthly car payment using sales tax, trade-in value, fees, APR, and term.', icon: Car, path: '/us-auto-loan-calculator', tint: T.sky, tags: ['Car financing', 'APR impact', 'Total cost'] },
  { title: 'US 401(k) Calculator', description: 'Project your retirement balance with salary growth, contribution rate, and employer match.', icon: PiggyBank, path: '/us-401k-calculator', tint: T.emerald, tags: ['Retirement planning', 'Employer match', 'Projection table'] },
  { title: 'US Retirement Readiness Workflow', description: 'Compare the nest egg your lifestyle needs with where your savings are headed, and get a monthly plan.', icon: Hourglass, path: '/us-retirement-readiness-workflow', tint: T.emerald, tags: ['Readiness score', 'Inflation-aware', 'Monthly plan'] },
  { title: 'US Savings & CD Calculator', description: 'Estimate savings APY growth and CD maturity value across your deposit timeline.', icon: Wallet, path: '/us-savings-cd-calculator', tint: T.amber, tags: ['APY growth', 'CD maturity', 'Interest estimate'] },
  { title: 'US Credit Card Payoff Calculator', description: 'Compare minimum payment and fixed payment plans to clear card debt faster.', icon: CreditCard, path: '/us-credit-card-payoff-calculator', tint: T.rose, tags: ['Debt payoff', 'APR impact', 'Interest saved'] },
  { title: 'Compound Interest Calculator', description: 'Project savings growth with monthly contributions and daily to annual compounding.', icon: TrendingUp, path: '/compound-interest-calculator', tint: T.violet, tags: ['Growth chart', 'Contributions', 'Rule of 72'] },
  { title: 'US Inflation Calculator', description: 'See what dollars from any year since 1913 are worth today, using official BLS CPI data.', icon: Banknote, path: '/inflation-calculator', tint: T.amber, tags: ['CPI 1913–2025', 'Buying power', 'Annual rate'] },
];

const USCalculatorsHub = () => {
  return (
    <CalcLayout eyebrow="United States" title="US Calculators Hub" subtitle="High-intent US tools for home and vehicle financing, retirement, savings, and debt payoff decisions — all free.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, description, icon: Icon, path, tint, tags }) => (
          <Link
            key={path}
            href={path}
            className="group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70"
          >
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}>
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <h2 className="mt-4 font-display text-base font-semibold text-ink group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{title}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft dark:bg-slate-700 dark:text-slate-300">{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </CalcLayout>
  );
};

export default USCalculatorsHub;
