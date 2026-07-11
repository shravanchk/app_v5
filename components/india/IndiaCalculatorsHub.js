import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Train, Calculator, TrendingUp, PiggyBank, Target, Wallet, Home, Car,
  Landmark, Repeat, Receipt, Percent, LineChart, ArrowLeftRight, ShieldCheck, CreditCard, Hourglass,
} from 'lucide-react';
import { CalcLayout } from '../calculator/CalcLayout';
import { calculateIndianIncomeTax } from '../../utils/taxCalculations';

// Engine-computed fact for the intro: with the FY 2026-27 rebate, taxable
// income of ₹12,00,000 pays zero tax under the new regime.
const TAX_AT_12L = calculateIndianIncomeTax(1200000, 'new').totalTax;

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

const cards = [
  { title: 'Loan & EMI Calculator', description: 'Calculate EMI, prepayment impact, and amortization for home, car, and personal loans.', icon: Calculator, path: '/loan-calculator', tint: T.brand, tags: ['EMI breakdown', 'Prepayment', 'Amortization'] },
  { title: 'Income Tax Calculator', description: 'Estimate income tax for FY 2026-27 with old/new regime comparison.', icon: Landmark, path: '/income-tax-calculator', tint: T.violet, tags: ['FY 2026-27', 'Old vs new', 'Tax estimate'] },
  { title: 'Tax Regime Comparison', description: 'Check which regime saves more tax using salary and deduction-aware inputs.', icon: Repeat, path: '/tax-regime-comparison', tint: T.violet, tags: ['Old vs new', 'Savings view', 'Decision support'] },
  { title: 'GST Calculator', description: 'Add/remove/reverse GST with CGST, SGST, and IGST split.', icon: Receipt, path: '/gst-calculator', tint: T.amber, tags: ['Inclusive/exclusive', 'CGST/SGST/IGST', 'Rate-wise'] },
  { title: 'GST 2.0 Price Calculator', description: 'Compare an item’s price before and after the Sept 2025 GST reform (5/18/40).', icon: Percent, path: '/gst-reform-calculator', tint: T.amber, tags: ['Old vs new GST', 'Price change', 'GST 2.0'] },
  { title: 'HRA Exemption Calculator', description: 'Find your tax-exempt House Rent Allowance using the least-of-three rule (old regime).', icon: Home, path: '/hra-calculator', tint: T.indigo, tags: ['Old regime', 'Metro/non-metro', 'Rent receipts'] },
  { title: 'Capital Gains Tax Calculator', description: 'LTCG/STCG on equity, mutual funds, and property for FY 2026-27.', icon: LineChart, path: '/capital-gains-calculator', tint: T.teal, tags: ['LTCG 12.5%', 'STCG 20%', '₹1.25L exemption'] },
  { title: 'Gratuity Calculator', description: 'Estimate gratuity using the 15/26 formula with the ₹20 lakh tax-free ceiling.', icon: Wallet, path: '/gratuity-calculator', tint: T.emerald, tags: ['Gratuity Act', '15/26 rule', 'Tax-free limit'] },
  { title: 'Tax on Salary (₹5L–₹50L)', description: 'New-regime income tax for every salary level with full slab breakdown.', icon: Target, path: '/tax-on-salary', tint: T.violet, tags: ['FY 2026-27', 'By salary', 'Take-home'] },
  { title: 'SIP Calculator', description: 'Estimate SIP corpus with expected returns and goal-based planning.', icon: TrendingUp, path: '/sip-calculator', tint: T.emerald, tags: ['Future value', 'Goal planning', 'Step-up'] },
  { title: 'PPF Calculator', description: 'Project PPF maturity with year-wise contribution and interest assumptions.', icon: PiggyBank, path: '/ppf-calculator', tint: T.rose, tags: ['15-year plan', 'Year-wise table', 'Maturity'] },
  { title: 'Salary Calculator', description: 'Convert CTC to in-hand salary with key deduction estimates.', icon: Wallet, path: '/salary-calculator', tint: T.sky, tags: ['CTC to net', 'Deduction view', 'Take-home'] },
  { title: 'IRCTC Booking Calculator', description: 'Get exact booking date/timing windows for regular and Tatkal booking.', icon: Train, path: '/irctc-calculator', tint: T.brand, tags: ['Booking date', 'Tatkal timing', 'Quick planning'] },
  { title: 'Buy vs Rent Calculator', description: 'Estimate break-even timeline for buying vs renting using EMI and rent growth.', icon: Home, path: '/buy-vs-rent-calculator', tint: T.indigo, tags: ['Break-even', 'EMI vs rent', 'Home decision'] },
  { title: 'Prepay vs Invest Workflow', description: 'Compare whether monthly surplus should prepay debt or be invested for growth.', icon: ArrowLeftRight, path: '/prepay-vs-invest-workflow', tint: T.violet, tags: ['Debt vs investing', 'Risk-adjusted', 'Surplus'] },
  { title: 'FD vs SIP Workflow', description: 'Compare fixed deposit and SIP on post-tax maturity with a horizon-aware verdict.', icon: Landmark, path: '/fd-vs-sip-workflow', tint: T.indigo, tags: ['Post-tax view', 'LTCG vs slab', 'Verdict'] },
  { title: 'Retirement Readiness Workflow', description: 'Find the corpus your lifestyle needs at 60 and whether your savings are on track to build it.', icon: Hourglass, path: '/retirement-readiness-workflow', tint: T.teal, tags: ['Corpus target', 'Readiness score', 'Monthly plan'] },
  { title: 'Emergency Fund Readiness', description: 'Find your target runway, current gap, and monthly plan to build a safer corpus.', icon: ShieldCheck, path: '/emergency-fund-readiness-workflow', tint: T.emerald, tags: ['Runway target', 'Gap to target', 'Milestones'] },
  { title: 'Rent vs Buy Decision', description: 'Compare renting versus buying with break-even year, affordability, and cash buffer.', icon: ArrowLeftRight, path: '/rent-vs-buy-workflow', tint: T.sky, tags: ['Break-even', 'Cash buffer', 'Housing'] },
  { title: 'Car Ownership Cost', description: 'Estimate fuel, toll, parking, EMI, and upkeep cost of running a car.', icon: Car, path: '/car-ownership-cost-workflow', tint: T.rose, tags: ['Fuel expense', 'Transport budget', 'Running cost'] },
  { title: 'Credit Card Trap Calculator', description: 'Compare minimum due vs fixed payment and estimate payoff time.', icon: CreditCard, path: '/credit-card-trap-calculator', tint: T.rose, tags: ['Debt payoff', 'Interest saved', 'Strategy'] },
];

const IndiaCalculatorsHub = () => {
  return (
    <>
      <Head>
        <title>India Calculators Hub | Tax, Loans, Investing &amp; Salary | Upaman</title>
        <meta name="description" content="All Upaman India calculators in one place — income tax, EMI, SIP, PPF, GST, capital gains, salary, and decision workflows. Free and updated for FY 2026-27." />
        <link rel="canonical" href="https://upaman.com/india-calculators" />
        <meta property="og:title" content="India Calculators Hub | Upaman" />
        <meta property="og:description" content="Tax, loan, investing, salary and decision tools for India — free and current for FY 2026-27." />
        <meta property="og:url" content="https://upaman.com/india-calculators" />
        <meta property="og:type" content="website" />
      </Head>

      <CalcLayout eyebrow="India" title="India Calculators Hub" subtitle="High-intent India tools for tax, borrowing, investing, salary, and decision workflows — all free and current for FY 2026-27.">
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
            Built for FY 2026-27 rules
          </h2>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft dark:text-slate-300">
            The India tools centre on the choice that decides everything else: old regime or new. Under the new
            regime&apos;s FY 2026-27 slabs, the Section 87A rebate wipes out tax on taxable income up to ₹12 lakh —
            the engine behind the{' '}
            <Link href="/income-tax-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">income tax calculator</Link>{' '}
            computes exactly ₹{TAX_AT_12L.toLocaleString('en-IN')} payable at that level, and with the ₹75,000
            standard deduction that covers salaries up to ₹12.75 lakh. The old regime can still win if you claim large
            deductions (80C, home-loan interest, HRA) — the{' '}
            <Link href="/tax-regime-comparison" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">regime comparison tool</Link>{' '}
            finds your break-even deduction amount, and the{' '}
            <Link href="/tax-on-salary" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">tax-on-salary pages</Link>{' '}
            give pre-computed answers for every salary from ₹5 lakh to ₹50 lakh, including the marginal-relief zone
            just above ₹12 lakh.
          </p>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft dark:text-slate-300">
            Around that core sit the tools for the other recurring decisions: converting a CTC offer into an in-hand
            figure (<Link href="/salary-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">salary calculator</Link>),
            sizing an EMI and testing prepayment against investing
            (<Link href="/loan-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">EMI calculator</Link>,{' '}
            <Link href="/prepay-vs-invest-workflow" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">prepay vs invest</Link>),
            projecting SIP and PPF growth side by side
            (<Link href="/fd-vs-sip-workflow" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">FD vs SIP</Link>{' '}
            compares them post-tax, where LTCG at 12.5% versus slab-rate FD interest changes the verdict), and GST
            both as invoice arithmetic and as the September 2025 rate-reform price check
            (<Link href="/gst-reform-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">GST 2.0 calculator</Link>).
            Every figure is computed from the same engines the calculators run on, so the numbers here always match
            what the tools return.
          </p>
        </section>
      </CalcLayout>
    </>
  );
};

export default IndiaCalculatorsHub;
