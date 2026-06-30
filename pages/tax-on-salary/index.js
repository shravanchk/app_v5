import Head from 'next/head';
import Container from '../../components/ui/Container';
const { calculateIndianIncomeTax } = require('../../utils/taxCalculations');

const NEW_STD = 75000;
const MIN_LAKH = 5;
const MAX_LAKH = 50;
const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n));

export async function getStaticProps() {
  const rows = [];
  for (let l = MIN_LAKH; l <= MAX_LAKH; l += 1) {
    const taxable = Math.max(0, l * 100000 - NEW_STD);
    const tax = Math.round(calculateIndianIncomeTax(taxable, 'new').totalTax);
    rows.push({ lakh: l, tax });
  }
  return { props: { rows } };
}

export default function TaxOnSalaryIndex({ rows }) {
  const canonical = 'https://upaman.com/tax-on-salary';
  return (
    <>
      <Head>
        <title>Tax on Salary FY 2026-27 — Income Tax by Salary (₹5L–₹50L) | Upaman</title>
        <meta name="description" content="New-regime income tax for every salary from ₹5 lakh to ₹50 lakh in FY 2026-27. Pick your salary for a full slab breakdown, rebate, cess, and monthly take-home." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Tax on Salary FY 2026-27 by Income | Upaman" />
        <meta property="og:description" content="Income tax for every salary from ₹5 lakh to ₹50 lakh, new regime FY 2026-27." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
      </Head>

      <section className="py-8 sm:py-12">
        <Container>
          <div className="mx-auto max-w-[860px] text-[1.02rem] leading-relaxed text-ink-soft dark:text-slate-300">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              Income Tax on Salary — FY 2026-27
            </h1>
            <p className="mt-4">
              Select your salary to see the exact new-regime income tax for FY 2026-27, with a full slab-by-slab breakdown, the
              Section 87A rebate, marginal relief, 4% cess, and your monthly take-home. All figures use the ₹75,000 standard
              deduction. For a custom calculation with your own deductions, use the{' '}
              <a href="/income-tax-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">Income Tax Calculator</a>.
            </p>

            <div className="my-5 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
              {rows.map((r) => (
                <a
                  key={r.lakh}
                  href={`/tax-on-salary/${r.lakh}-lakh`}
                  className="block rounded-xl border border-slate-200 bg-white px-3.5 py-3 no-underline transition hover:border-brand-300 hover:shadow-soft dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-brand-700"
                >
                  <div className="font-semibold text-ink dark:text-white">₹{r.lakh} lakh salary</div>
                  <div className="mt-0.5 text-sm text-ink-muted dark:text-slate-400">Tax: {inr(r.tax)}</div>
                </a>
              ))}
            </div>

            <p className="text-[0.95rem]">
              Related guides:{' '}
              <a href="/guides/tax-on-12-lakh-salary-fy-2026-27" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">why ₹12 lakh is tax-free</a>,{' '}
              <a href="/guides/old-vs-new-regime-breakeven-fy-2026-27" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">old vs new breakeven</a>,{' '}
              <a href="/guides/standard-deduction-fy-2026-27" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">standard deduction</a>.
            </p>
            <p className="mt-3 text-sm text-ink-muted dark:text-slate-500">Reviewed June 28, 2026. Planning estimates, not tax advice.</p>
          </div>
        </Container>
      </section>
    </>
  );
}