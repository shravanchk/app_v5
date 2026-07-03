import Head from 'next/head';
import Container from '../../components/ui/Container';
const { computePaycheck, US_STATES, stateSlug } = require('../../utils/usPaycheckCalculations');
const { SALARY_LEVELS } = require('../../utils/salaryLevels');

const usd = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

export async function getStaticPaths() {
  return {
    paths: SALARY_LEVELS.map((s) => ({ params: { salary: String(s) } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const salary = Number(params.salary);
  const idx = SALARY_LEVELS.indexOf(salary);

  const rows = Object.keys(US_STATES)
    .sort((a, b) => US_STATES[a].name.localeCompare(US_STATES[b].name))
    .map((code) => {
      const r = computePaycheck({ grossAnnual: salary, stateCode: code, filingStatus: 'single' });
      return {
        code,
        name: US_STATES[code].name,
        slug: stateSlug(code),
        noTax: US_STATES[code].type === 'none',
        net: Math.round(r.netAnnual),
        monthly: Math.round(r.netAnnual / 12),
        stateTax: Math.round(r.stateTax),
        effectiveRate: Number(r.effectiveRate.toFixed(1))
      };
    });

  // Federal-only baseline (identical in every no-state-tax state)
  const base = rows.find((r) => r.noTax);
  const fed = computePaycheck({ grossAnnual: salary, stateCode: 'TX', filingStatus: 'single' });
  const lowest = rows.reduce((min, r) => (r.net < min.net ? r : min), rows[0]);

  return {
    props: {
      salary,
      rows,
      best: { net: base.net, monthly: base.monthly, biweekly: Math.round(base.net / 26), effectiveRate: base.effectiveRate },
      lowest: { name: lowest.name, net: lowest.net },
      federal: {
        incomeTax: Math.round(fed.federalTax),
        socialSecurity: Math.round(fed.socialSecurity),
        medicare: Math.round(fed.medicare)
      },
      hourly: Number((salary / 2080).toFixed(2)),
      prev: idx > 0 ? SALARY_LEVELS[idx - 1] : null,
      next: idx < SALARY_LEVELS.length - 1 ? SALARY_LEVELS[idx + 1] : null
    }
  };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

export default function SalaryAfterTaxesPage({ salary, rows, best, lowest, federal, hourly, prev, next }) {
  const canonical = `https://upaman.com/after-taxes/${salary}`;
  const title = `${usd(salary)} After Taxes 2026 | Take-Home Pay by State | Upaman`;
  const desc = `How much is ${usd(salary)} a year after taxes? In 2026 a single filer keeps ${usd(lowest.net)}–${usd(best.net)} depending on state (${usd(best.monthly)}/month in no-tax states). Full 50-state table.`;

  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How much is ${usd(salary)} a year after taxes?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `In 2026, a single filer earning ${usd(salary)} takes home between ${usd(lowest.net)} and ${usd(best.net)} per year depending on the state. In states with no income tax (Texas, Florida, Washington and six others) that is ${usd(best.net)} per year, or about ${usd(best.monthly)} per month, after federal income tax (${usd(federal.incomeTax)}), Social Security (${usd(federal.socialSecurity)}), and Medicare (${usd(federal.medicare)}).`
        }
      },
      {
        '@type': 'Question',
        name: `What is ${usd(salary)} a year per hour?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${usd(salary)} a year is $${hourly.toFixed(2)} per hour before taxes, based on a standard 2,080-hour work year (40 hours × 52 weeks).`
        }
      }
    ]
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upaman.com/' },
      { '@type': 'ListItem', position: 2, name: 'Salary After Taxes', item: 'https://upaman.com/after-taxes' },
      { '@type': 'ListItem', position: 3, name: `${usd(salary)} after taxes`, item: canonical }
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
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <section className="py-8 sm:py-12">
        <Container>
          <article className="mx-auto max-w-[820px] text-[1.02rem] leading-relaxed text-ink-soft dark:text-slate-300">
            <p className="text-sm text-ink-muted dark:text-slate-500">
              <a href="/" className={linkCls}>Home</a> &rsaquo; <a href="/after-taxes" className={linkCls}>Salary after taxes</a> &rsaquo; {usd(salary)}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              {usd(salary)} a Year After Taxes (2026)
            </h1>

            <div className="mt-5 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-5 dark:border-brand-800/60 dark:from-brand-900/30 dark:to-emerald-900/20">
              <div className="text-sm text-ink-muted dark:text-slate-400">{usd(salary)} salary in a no-state-tax state (single, 2026)</div>
              <div className="mt-1 font-display text-3xl font-bold text-ink dark:text-white">{usd(best.net)} / year</div>
              <div className="mt-1.5 text-sm text-ink-soft dark:text-slate-300">
                ≈ <strong>{usd(best.monthly)}</strong>/month · <strong>{usd(best.biweekly)}</strong> bi-weekly · effective tax rate {best.effectiveRate}%
              </div>
            </div>

            <p className="mt-4">
              A {usd(salary)} salary works out to <strong>${hourly.toFixed(2)}/hour</strong> before taxes (2,080-hour
              year). For a single filer taking the standard deduction, federal deductions in 2026 are{' '}
              <strong>{usd(federal.incomeTax)}</strong> federal income tax, <strong>{usd(federal.socialSecurity)}</strong>{' '}
              Social Security (6.2%), and <strong>{usd(federal.medicare)}</strong> Medicare. State income tax then takes
              your annual take-home from <strong>{usd(best.net)}</strong> in the nine no-tax states down to{' '}
              <strong>{usd(lowest.net)}</strong> in {lowest.name}.
            </p>
            <p className="mt-4">
              The table below shows estimated take-home pay for {usd(salary)} in every state and D.C. Click a state for
              its full salary table, or use the{' '}
              <a href="/us-paycheck-calculator" className={linkCls}>US Paycheck Calculator</a> to add filing status and
              401(k) contributions.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-[0.95rem]">
                <tbody>
                  <tr>
                    <th className={thCls}>State</th>
                    <th className={thCls}>Take-home / year</th>
                    <th className={thCls}>Per month</th>
                    <th className={thCls}>State tax</th>
                    <th className={thCls}>Effective rate</th>
                  </tr>
                  {rows.map((r) => (
                    <tr key={r.code}>
                      <td className={`${tdCls} font-semibold`}>
                        <a href={`/paycheck/${r.slug}`} className={linkCls}>{r.name}</a>
                      </td>
                      <td className={`${tdCls} font-semibold text-emerald-700 dark:text-emerald-400`}>{usd(r.net)}</td>
                      <td className={tdCls}>{usd(r.monthly)}</td>
                      <td className={tdCls}>{r.noTax ? '—' : usd(r.stateTax)}</td>
                      <td className={tdCls}>{r.effectiveRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">Get your exact number:</strong> the{' '}
              <a href="/us-paycheck-calculator" className={linkCls}>US Paycheck Calculator</a> adds filing status,
              401(k) contributions, and weekly/bi-weekly views. Or browse{' '}
              <a href="/after-taxes" className={linkCls}>other salary levels</a> and{' '}
              <a href="/paycheck" className={linkCls}>take-home pay by state</a>.
            </div>

            <p className="mt-6 flex justify-between text-[0.95rem]">
              {prev ? <a href={`/after-taxes/${prev}`} className={linkCls}>← {usd(prev)} after taxes</a> : <span />}
              {next ? <a href={`/after-taxes/${next}`} className={linkCls}>{usd(next)} after taxes →</a> : <span />}
            </p>

            <p className="mt-6 text-sm text-ink-muted dark:text-slate-500">
              Estimates for tax year 2026 using the standard deduction for a single filer; state figures use the latest
              published rates and exclude local/city taxes unless noted on the state page. Actual withholding varies
              with your W-4 and benefits. Not tax advice.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
