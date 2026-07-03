import Head from 'next/head';
import Container from '../../../components/ui/Container';
import { computeEuropeanSalary } from '../../../utils/europeanSalaryCalculations';
const { DE_SALARY_LEVELS } = require('../../../utils/salaryLevels');

const eur = (n) => `€${Math.round(n).toLocaleString('en-US')}`;

export async function getStaticProps() {
  const rows = DE_SALARY_LEVELS.map((salary) => {
    const r = computeEuropeanSalary('DE', salary);
    return {
      salary,
      net: Math.round(r.netAnnual),
      monthly: Math.round(r.netMonthly),
      keepPct: Math.round((r.netAnnual / salary) * 100)
    };
  });
  return { props: { rows } };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

export default function GermanyTakeHomeIndex({ rows }) {
  const canonical = 'https://upaman.com/germany/take-home';
  const title = 'Germany Salary After Tax 2026 — Brutto to Netto by Salary (€25k–€150k) | Upaman';
  const desc = 'Net salary for every common German gross salary from €25,000 to €150,000 in 2026. Pick your salary for the full brutto-to-netto breakdown: income tax, solidarity surcharge, and social insurance.';

  const itemListSchema = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Germany salary after tax pages',
    itemListElement: rows.map((r, i) => ({
      '@type': 'ListItem', position: i + 1,
      name: `${eur(r.salary)} after tax Germany`,
      url: `https://upaman.com/germany/take-home/${r.salary}`
    }))
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upaman.com/' },
      { '@type': 'ListItem', position: 2, name: 'Germany Take-Home Pay', item: canonical }
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
              <a href="/" className={linkCls}>Home</a> &rsaquo; Germany take-home pay
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              Germany Salary After Tax (2026)
            </h1>
            <p className="mt-3">
              What every common German gross salary is actually worth netto in 2026, using the official §32a EStG
              tariff, 2026 social-insurance rates and ceilings, and the solidarity-surcharge exemption. Figures
              assume a single employee in tax class I, childless, with statutory insurance and no church tax. Pick
              a salary for the full brutto-to-netto breakdown, or use the{' '}
              <a href="/germany-salary-calculator" className={linkCls}>Germany Salary Calculator</a> for your exact
              gross amount.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse text-[0.95rem]">
                <tbody>
                  <tr>
                    <th className={thCls}>Gross (Brutto)</th>
                    <th className={thCls}>Net / year (Netto)</th>
                    <th className={thCls}>Per month</th>
                    <th className={thCls}>You keep</th>
                  </tr>
                  {rows.map((r) => (
                    <tr key={r.salary}>
                      <td className={`${tdCls} font-semibold`}>
                        <a href={`/germany/take-home/${r.salary}`} className={linkCls}>{eur(r.salary)}</a>
                      </td>
                      <td className={`${tdCls} font-semibold text-emerald-700 dark:text-emerald-400`}>{eur(r.net)}</td>
                      <td className={tdCls}>{eur(r.monthly)}</td>
                      <td className={tdCls}>{r.keepPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">More UK &amp; Europe tools:</strong> the{' '}
              <a href="/germany-salary-calculator" className={linkCls}>Germany Salary Calculator</a>,{' '}
              <a href="/uk/take-home" className={linkCls}>UK take-home pay tables</a>, and the{' '}
              <a href="/european-salary-calculator" className={linkCls}>European Salary Calculator</a> covering 8
              countries.
            </div>

            <p className="mt-6 text-sm text-ink-muted dark:text-slate-500">
              Planning estimates. Actual payroll varies by health fund, federal state, church-tax status, tax
              class, and children. Not tax advice.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
