import Head from 'next/head';
import Container from '../../components/ui/Container';
const { computePaycheck } = require('../../utils/usPaycheckCalculations');
const { SALARY_LEVELS } = require('../../utils/salaryLevels');

const usd = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

export async function getStaticProps() {
  const levels = SALARY_LEVELS.map((salary) => {
    // Federal-only baseline: identical in every no-state-tax state
    const r = computePaycheck({ grossAnnual: salary, stateCode: 'TX', filingStatus: 'single' });
    return {
      salary,
      net: Math.round(r.netAnnual),
      monthly: Math.round(r.netAnnual / 12),
      takeHomeRate: Number(r.takeHomeRate.toFixed(0))
    };
  });
  return { props: { levels } };
}

export default function AfterTaxesIndex({ levels }) {
  const canonical = 'https://upaman.com/after-taxes';
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'US salary after taxes by income level',
    itemListElement: levels.map((l, i) => ({
      '@type': 'ListItem', position: i + 1, name: `${usd(l.salary)} after taxes`, url: `https://upaman.com/after-taxes/${l.salary}`
    }))
  };

  return (
    <>
      <Head>
        <title>Salary After Taxes 2026 | $30k–$250k Take-Home Pay | Upaman</title>
        <meta name="description" content="How much of your salary do you keep after taxes? 2026 US take-home pay for $30,000–$250,000 salaries, with state-by-state tables for every income level." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Salary After Taxes 2026 | Upaman" />
        <meta property="og:description" content="US take-home pay for $30k–$250k salaries, with 50-state tables for every level." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Salary After Taxes 2026 | Upaman" />
        <meta name="twitter:description" content="US take-home pay for $30k–$250k salaries." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      </Head>

      <section className="py-8 sm:py-12">
        <Container>
          <div className="mx-auto max-w-[980px]">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-300">United States · Salary</p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              Salary After Taxes (2026)
            </h1>
            <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-ink-soft dark:text-slate-300">
              Pick your salary to see 2026 take-home pay in every US state and D.C. The figure on each card is the
              annual take-home for a single filer in a <strong>no-state-tax state</strong> (Texas, Florida, Washington
              and six others) after federal income tax, Social Security, and Medicare — state pages show the full
              spread. For exact numbers use the{' '}
              <a href="/us-paycheck-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">US Paycheck Calculator</a>.
            </p>

            <div className="my-6 grid grid-cols-[repeat(auto-fill,minmax(215px,1fr))] gap-2.5">
              {levels.map((l) => (
                <a
                  key={l.salary}
                  href={`/after-taxes/${l.salary}`}
                  className="block rounded-xl border border-slate-200 bg-white px-3.5 py-3 no-underline transition hover:border-brand-300 hover:shadow-soft dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-brand-700"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink dark:text-white">{usd(l.salary)}</span>
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[0.68rem] font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">KEEPS {l.takeHomeRate}%</span>
                  </div>
                  <div className="mt-0.5 text-sm text-ink-muted dark:text-slate-400">{usd(l.net)}/yr · {usd(l.monthly)}/mo</div>
                </a>
              ))}
            </div>

            <p className="text-sm text-ink-muted dark:text-slate-500">
              Estimates for tax year 2026 (single filer, standard deduction); local/city taxes excluded unless noted.
              Also see <a href="/paycheck" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">take-home pay by state</a>. Not tax advice.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
