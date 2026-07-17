import React from 'react';
import Link from 'next/link';
import {
  Landmark, RefreshCcw, Car, PiggyBank, Wallet, CreditCard, BadgeDollarSign, TrendingUp, Banknote, Table2, Hourglass, Scale,
} from 'lucide-react';
import { CalcLayout } from '../calculator/CalcLayout';
import { computePaycheck } from '../../utils/usPaycheckCalculations';

// Intro example computed from the paycheck engine at build time so the prose
// always matches the calculator's own output.
const usd = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
const EX_TX = computePaycheck({ grossAnnual: 75000, stateCode: 'TX' });
const EX_CA = computePaycheck({ grossAnnual: 75000, stateCode: 'CA' });

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
  { title: 'Hourly to Salary Converter', description: 'Turn any hourly rate into yearly, monthly, and weekly pay — with per-rate pages from $15 to $75 including 2026 after-tax estimates.', icon: Hourglass, path: '/hourly', tint: T.amber, tags: ['$15–$75/hour', 'Overtime math', 'After-tax view'] },
  { title: 'Debt Payoff Calculator', description: 'List every debt once and compare the snowball and avalanche methods — debt-free date, payoff order, and total interest side by side.', icon: CreditCard, path: '/debt-payoff-calculator', tint: T.rose, tags: ['Snowball vs avalanche', 'Debt-free date', 'Payoff order'] },
  { title: 'US Mortgage Calculator', description: 'Estimate your monthly payment with principal, interest, property tax, insurance, HOA, and PMI.', icon: Landmark, path: '/us-mortgage-calculator', tint: T.brand, tags: ['PITI + PMI', 'Affordability ratio', 'Interest estimate'] },
  { title: 'US Refinance Break-even Calculator', description: 'Compare your current mortgage against a refinance offer and estimate the break-even point.', icon: RefreshCcw, path: '/us-refinance-calculator', tint: T.violet, tags: ['Break-even', 'Cost recovery', 'Savings estimate'] },
  { title: 'US Auto Loan Calculator', description: 'Calculate the monthly car payment using sales tax, trade-in value, fees, APR, and term.', icon: Car, path: '/us-auto-loan-calculator', tint: T.sky, tags: ['Car financing', 'APR impact', 'Total cost'] },
  { title: 'US 401(k) Calculator', description: 'Project your retirement balance with salary growth, contribution rate, and employer match.', icon: PiggyBank, path: '/us-401k-calculator', tint: T.emerald, tags: ['Retirement planning', 'Employer match', 'Projection table'] },
  { title: 'US Retirement Readiness Workflow', description: 'Compare the nest egg your lifestyle needs with where your savings are headed, and get a monthly plan.', icon: Hourglass, path: '/us-retirement-readiness-workflow', tint: T.emerald, tags: ['Readiness score', 'Inflation-aware', 'Monthly plan'] },
  { title: 'Mortgage Payoff vs Invest Workflow', description: 'Extra principal payments or the market? Interest saved, months saved, and final portfolio on the same timeline.', icon: Scale, path: '/us-mortgage-payoff-vs-invest-workflow', tint: T.violet, tags: ['Risk-adjusted', 'Same-horizon', 'Verdict + plan'] },
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

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">
          What the US suite covers
        </h2>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft dark:text-slate-300">
          The US tools are organized around the money decisions where the rules actually change the answer. Paychecks
          are the clearest case: federal brackets, Social Security, and Medicare apply everywhere, but state income tax
          ranges from zero to a double-digit top rate. On a $75,000 salary, the{' '}
          <Link href="/us-paycheck-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">paycheck calculator</Link>{' '}
          estimates {usd(EX_TX.netAnnual)} take-home in Texas but {usd(EX_CA.netAnnual)} in California — a{' '}
          {usd(EX_TX.netAnnual - EX_CA.netAnnual)} annual gap from state tax alone. The{' '}
          <Link href="/after-taxes" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">salary-after-taxes tables</Link>{' '}
          extend that comparison to every level from $30k to $250k across all 50 states and D.C.
        </p>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft dark:text-slate-300">
          The housing tools split one decision into its stages: the{' '}
          <Link href="/us-mortgage-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">mortgage calculator</Link>{' '}
          estimates the full PITI payment including property tax, insurance, HOA, and PMI; the{' '}
          <Link href="/us-refinance-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">refinance calculator</Link>{' '}
          finds the break-even month where closing costs are recovered; and the{' '}
          <Link href="/us-mortgage-payoff-vs-invest-workflow" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">payoff-vs-invest workflow</Link>{' '}
          weighs extra principal against investing the same dollars on the same timeline. For long-term saving, the{' '}
          <Link href="/us-401k-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">401(k)</Link>,{' '}
          <Link href="/us-savings-cd-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">savings &amp; CD</Link>, and{' '}
          <Link href="/compound-interest-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">compound interest</Link>{' '}
          tools project growth, while the{' '}
          <Link href="/inflation-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">inflation calculator</Link>{' '}
          (official BLS CPI back to 1913) shows what that growth is worth in real buying power. On the debt side, the{' '}
          <Link href="/us-credit-card-payoff-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">credit card payoff calculator</Link>{' '}
          compares minimum payments against a fixed plan — usually the single largest interest saving available to a
          household. All figures on this page are computed from the same engines the calculators use, updated for the
          2026 tax year.
        </p>
      </section>
    </CalcLayout>
  );
};

export default USCalculatorsHub;
