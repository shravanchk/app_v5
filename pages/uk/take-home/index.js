import Head from 'next/head';
import Container from '../../../components/ui/Container';
const { calculateUKTax } = require('../../../utils/taxCalculations');
const { UK_SALARY_LEVELS } = require('../../../utils/salaryLevels');

const gbp = (n) => `£${Math.round(n).toLocaleString('en-GB')}`;

export async function getStaticProps() {
  const rows = UK_SALARY_LEVELS.map((salary) => {
    const r = calculateUKTax({ grossIncome: salary });
    return {
      salary,
      net: Math.round(r.netIncome),
      monthly: Math.round(r.monthlyNet),
      keepPct: Math.round((r.netIncome / salary) * 100)
    };
  });
  return { props: { rows } };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

export default function UKTakeHomeIndex({ rows }) {
  const canonical = 'https://upaman.com/uk/take-home';
  const title = 'UK Salary After Tax 2026-27 — Take-Home Pay by Salary (£20k–£150k) | Upaman';
  const desc = 'Take-home pay for every common UK salary from £20,000 to £150,000 in 2026-27. Pick your salary for the full income tax and National Insurance breakdown, monthly and weekly pay.';

  const itemListSchema = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'UK salary after tax pages',
    itemListElement: rows.map((r, i) => ({
      '@type': 'ListItem', position: i + 1,
      name: `${gbp(r.salary)} after tax UK`,
      url: `https://upaman.com/uk/take-home/${r.salary}`
    }))
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upaman.com/' },
      { '@type': 'ListItem', position: 2, name: 'UK Take-Home Pay', item: canonical }
    ]
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <section className="py-8 sm:py-12">
        <Container>
          <article className="mx-auto max-w-[820px] text-[1.02rem] leading-relaxed text-ink-soft dark:text-slate-300">
            <p className="text-sm text-ink-muted dark:text-slate-500">
              <a href="/" className={linkCls}>Home</a> &rsaquo; UK take-home pay
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              UK Salary After Tax (2026-27)
            </h1>
            <p className="mt-3">
              What every common UK salary is actually worth after income tax and National Insurance in 2026-27,
              using England, Wales &amp; Northern Ireland rates and the standard personal allowance. Pick a salary
              for the full breakdown — monthly and weekly take-home, hourly rate, and the allowance taper above
              £100,000 — or use the{' '}
              <a href="/uk-income-tax-calculator" className={linkCls}>UK Income Tax Calculator</a> to add pension
              contributions, student loans, and Scottish rates.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse text-[0.95rem]">
                <tbody>
                  <tr>
                    <th className={thCls}>Gross salary</th>
                    <th className={thCls}>Take-home / year</th>
                    <th className={thCls}>Per month</th>
                    <th className={thCls}>You keep</th>
                  </tr>
                  {rows.map((r) => (
                    <tr key={r.salary}>
                      <td className={`${tdCls} font-semibold`}>
                        <a href={`/uk/take-home/${r.salary}`} className={linkCls}>{gbp(r.salary)}</a>
                      </td>
                      <td className={`${tdCls} font-semibold text-emerald-700 dark:text-emerald-400`}>{gbp(r.net)}</td>
                      <td className={tdCls}>{gbp(r.monthly)}</td>
                      <td className={tdCls}>{r.keepPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">More UK &amp; Europe tools:</strong> the{' '}
              <a href="/uk-income-tax-calculator" className={linkCls}>UK Income Tax Calculator</a>,{' '}
              <a href="/european-salary-calculator" className={linkCls}>European Salary Calculator</a> (compare 8
              countries), and the <a href="/guides/uk-tax-rates-2026-27" className={linkCls}>UK tax rates guide</a>.
            </div>

            <p className="mt-6 text-sm text-ink-muted dark:text-slate-500">
              Estimates assume the standard tax code with no pension or student loan deductions and exclude Scottish
              income tax bands. Not tax advice.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
