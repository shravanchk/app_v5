import Head from 'next/head';
import Container from '../../../components/ui/Container';
const { calculateUKTax } = require('../../../utils/taxCalculations');
const { UK_SALARY_LEVELS } = require('../../../utils/salaryLevels');

const gbp = (n) => `£${Math.round(n).toLocaleString('en-GB')}`;

export async function getStaticPaths() {
  return {
    paths: UK_SALARY_LEVELS.map((s) => ({ params: { salary: String(s) } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const salary = Number(params.salary);
  const idx = UK_SALARY_LEVELS.indexOf(salary);
  const r = calculateUKTax({ grossIncome: salary });

  // ---- marginal analysis, derived numerically from the same engine ----
  const plus = calculateUKTax({ grossIncome: salary + 1000 });
  const keepPer1000 = Math.round(plus.netIncome - r.netIncome);
  const marginalTaxPct = Math.round((plus.incomeTax - r.incomeTax) / 10);
  const marginalNiPct = Math.round((plus.nationalInsurance - r.nationalInsurance) / 10);
  const band =
    marginalTaxPct <= 0
      ? { label: 'within the personal allowance', note: 'no income tax on the next pound' }
      : marginalTaxPct <= 25
        ? { label: 'the basic-rate band', note: null }
        : marginalTaxPct <= 42
          ? { label: 'the higher-rate band', note: null }
          : marginalTaxPct >= 55
            ? { label: 'the allowance-taper zone', note: 'the tapering personal allowance pushes the true marginal rate to 60%' }
            : { label: 'the additional-rate band', note: null };

  const ladder = { prevLevel: null, nextLevel: null };
  if (idx > 0) {
    const p = UK_SALARY_LEVELS[idx - 1];
    ladder.prevLevel = { salary: p, netGain: Math.round(r.netIncome - calculateUKTax({ grossIncome: p }).netIncome), grossGain: salary - p };
  }
  if (idx < UK_SALARY_LEVELS.length - 1) {
    const n = UK_SALARY_LEVELS[idx + 1];
    ladder.nextLevel = { salary: n, netGain: Math.round(calculateUKTax({ grossIncome: n }).netIncome - r.netIncome), grossGain: n - salary };
  }

  return {
    props: {
      salary,
      net: Math.round(r.netIncome),
      monthly: Math.round(r.monthlyNet),
      weekly: Math.round(r.weeklyNet),
      incomeTax: Math.round(r.incomeTax),
      ni: Math.round(r.nationalInsurance),
      allowance: Math.round(r.personalAllowance),
      taxable: Math.round(r.taxableIncome),
      effectiveRate: Number(r.effectiveRate.toFixed(1)),
      hourly: Number((salary / 1950).toFixed(2)),
      plan2Loan: Math.round(Math.max(0, salary - 29385) * 0.09),
      analysis: { keepPer1000, marginalTaxPct, marginalNiPct, band, ladder },
      prev: idx > 0 ? UK_SALARY_LEVELS[idx - 1] : null,
      next: idx < UK_SALARY_LEVELS.length - 1 ? UK_SALARY_LEVELS[idx + 1] : null
    }
  };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

export default function UKTakeHomePage({ salary, net, monthly, weekly, incomeTax, ni, allowance, taxable, effectiveRate, hourly, plan2Loan, analysis, prev, next }) {
  const canonical = `https://upaman.com/uk/take-home/${salary}`;
  const title = `${gbp(salary)} After Tax UK 2026-27 | Take-Home Pay | Upaman`;
  const desc = `How much is ${gbp(salary)} after tax in the UK? In 2026-27 you take home ${gbp(net)} a year — ${gbp(monthly)} a month, ${gbp(weekly)} a week — after ${gbp(incomeTax)} income tax and ${gbp(ni)} National Insurance.`;

  const rows = [
    { label: 'Gross salary', annual: salary, monthly: salary / 12 },
    { label: 'Personal allowance', annual: allowance, monthly: null },
    { label: 'Taxable income', annual: taxable, monthly: null },
    { label: 'Income tax', annual: -incomeTax, monthly: -incomeTax / 12 },
    { label: 'National Insurance', annual: -ni, monthly: -ni / 12 },
    { label: 'Take-home pay', annual: net, monthly: net / 12, strong: true }
  ];

  const faqItems = [
    {
      q: `How much is ${gbp(salary)} after tax in the UK?`,
      a: `In the 2026-27 tax year, a ${gbp(salary)} salary in England, Wales, or Northern Ireland leaves ${gbp(net)} per year after ${gbp(incomeTax)} income tax and ${gbp(ni)} employee National Insurance — about ${gbp(monthly)} per month or ${gbp(weekly)} per week, an effective deduction rate of ${effectiveRate}%.`
    },
    {
      q: `What is ${gbp(salary)} per month after tax?`,
      a: `${gbp(salary)} a year works out to about ${gbp(monthly)} per month after tax and National Insurance in 2026-27, assuming a standard tax code with no pension or student loan deductions.`
    },
    {
      q: `What is ${gbp(salary)} per hour?`,
      a: `${gbp(salary)} a year is £${hourly.toFixed(2)} per hour before tax, based on a 37.5-hour week (1,950 working hours per year).`
    },
    {
      q: `What tax band is ${gbp(salary)} in?`,
      a: `At ${gbp(salary)}, the next pound earned falls in ${analysis.band.label}: the marginal deduction is ${analysis.marginalTaxPct}% income tax plus ${analysis.marginalNiPct}% National Insurance, so a £1,000 pay rise keeps about ${gbp(analysis.keepPer1000)}.${analysis.band.note ? ` Note: ${analysis.band.note}.` : ''} Bands apply per slice of income, so income below the band boundaries keeps its lower rates.`
    },
    {
      q: `How much of a pay rise do I keep at ${gbp(salary)}?`,
      a: `${analysis.ladder.nextLevel ? `Moving from ${gbp(salary)} to ${gbp(analysis.ladder.nextLevel.salary)} adds about ${gbp(analysis.ladder.nextLevel.netGain)} of annual take-home out of the ${gbp(analysis.ladder.nextLevel.grossGain)} gross increase.` : `At this level each extra £1,000 keeps about ${gbp(analysis.keepPer1000)}.`} Only the new pounds are taxed at the marginal rate — a rise never reduces the take-home on income you already earn, though salary-sacrifice pension contributions can be unusually valuable where the marginal rate is high.`
    }
  ];
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upaman.com/' },
      { '@type': 'ListItem', position: 2, name: 'UK Take-Home Pay', item: 'https://upaman.com/uk/take-home' },
      { '@type': 'ListItem', position: 3, name: `${gbp(salary)} after tax`, item: canonical }
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
              <a href="/" className={linkCls}>Home</a> &rsaquo; <a href="/uk/take-home" className={linkCls}>UK take-home pay</a> &rsaquo; {gbp(salary)}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              {gbp(salary)} After Tax UK (2026-27)
            </h1>

            <div className="mt-5 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-5 dark:border-brand-800/60 dark:from-brand-900/30 dark:to-emerald-900/20">
              <div className="text-sm text-ink-muted dark:text-slate-400">{gbp(salary)} salary in England, Wales &amp; Northern Ireland (2026-27)</div>
              <div className="mt-1 font-display text-3xl font-bold text-ink dark:text-white">{gbp(net)} / year</div>
              <div className="mt-1.5 text-sm text-ink-soft dark:text-slate-300">
                ≈ <strong>{gbp(monthly)}</strong>/month · <strong>{gbp(weekly)}</strong>/week · effective deduction rate {effectiveRate}%
              </div>
            </div>

            <p className="mt-4">
              A {gbp(salary)} salary works out to <strong>£{hourly.toFixed(2)}/hour</strong> before tax (37.5-hour
              week). With the standard tax code, your personal allowance is <strong>{gbp(allowance)}</strong>, leaving{' '}
              <strong>{gbp(taxable)}</strong> of taxable income. Deductions in 2026-27 are{' '}
              <strong>{gbp(incomeTax)}</strong> income tax and <strong>{gbp(ni)}</strong> employee National Insurance
              (8% between £12,570 and £50,270, then 2%), leaving <strong>{gbp(net)}</strong> in your pocket.
            </p>

            {salary > 100000 && (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-[0.95rem] dark:border-amber-800/50 dark:bg-amber-900/20">
                <strong className="text-ink dark:text-white">Allowance taper:</strong> above £100,000 the personal
                allowance shrinks by £1 for every £2 earned, so at {gbp(salary)} it is {allowance > 0 ? `only ${gbp(allowance)}` : 'fully gone'}.
                Income between £100,000 and £125,140 is effectively taxed at 60% — salary-sacrifice pension
                contributions in this band are unusually valuable.
              </p>
            )}

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-[0.95rem]">
                <tbody>
                  <tr>
                    <th className={thCls}>Item</th>
                    <th className={thCls}>Annual</th>
                    <th className={thCls}>Monthly</th>
                  </tr>
                  {rows.map((r) => (
                    <tr key={r.label}>
                      <td className={`${tdCls} ${r.strong ? 'font-semibold text-ink dark:text-white' : ''}`}>{r.label}</td>
                      <td className={`${tdCls} ${r.strong ? 'font-semibold text-emerald-700 dark:text-emerald-400' : r.annual < 0 ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                        {r.annual < 0 ? `−${gbp(-r.annual)}` : gbp(r.annual)}
                      </td>
                      <td className={`${tdCls} ${r.strong ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}`}>
                        {r.monthly === null ? '—' : r.monthly < 0 ? `−${gbp(-r.monthly)}` : gbp(r.monthly)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              These figures assume no pension contributions or student loan. A Plan 2 student loan would repay{' '}
              {plan2Loan > 0 ? <>another <strong>{gbp(plan2Loan)}</strong> per year (9% above £29,385)</> : <>nothing at this salary (the threshold is £29,385)</>},
              and Scotland uses different income tax bands. The{' '}
              <a href="/uk-income-tax-calculator" className={linkCls}>UK Income Tax Calculator</a> covers pensions,
              all student loan plans, and Scottish rates.
            </p>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">What happens to the next pound at {gbp(salary)}</h2>
            <p className="mt-3">
              The next pound earned at {gbp(salary)} sits in <strong>{analysis.band.label}</strong>: it loses{' '}
              {analysis.marginalTaxPct}% to income tax and {analysis.marginalNiPct}% to National Insurance, so a £1,000
              pay rise keeps about <strong>{gbp(analysis.keepPer1000)}</strong>.
              {analysis.band.note ? ` This is the stretch of UK income where ${analysis.band.note} — worth knowing before negotiating a rise that lands inside it.` : ''}{' '}
              Marginal is not average: the {effectiveRate}% effective rate in the headline box blends this top slice with
              the personal allowance and any lower bands underneath, which is why the two numbers differ.
            </p>
            {analysis.ladder.prevLevel || analysis.ladder.nextLevel ? (
              <p className="mt-3">
                {analysis.ladder.prevLevel
                  ? `Stepping up from ${gbp(analysis.ladder.prevLevel.salary)} to ${gbp(salary)} added ${gbp(analysis.ladder.prevLevel.netGain)} of annual take-home out of a ${gbp(analysis.ladder.prevLevel.grossGain)} gross rise. `
                  : ''}
                {analysis.ladder.nextLevel
                  ? `The next step, to ${gbp(analysis.ladder.nextLevel.salary)}, would keep about ${gbp(analysis.ladder.nextLevel.netGain)} of the ${gbp(analysis.ladder.nextLevel.grossGain)} increase. `
                  : ''}
                Crossing a band boundary never re-taxes the income below it — only the new slice pays the higher rate.
              </p>
            ) : null}

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">Get your exact number:</strong> use the{' '}
              <a href="/uk-income-tax-calculator" className={linkCls}>UK Income Tax Calculator</a> for pension and
              student loan options, browse <a href="/uk/take-home" className={linkCls}>other UK salary levels</a>,
              compare with <a href="/european-salary-calculator" className={linkCls}>other European countries</a>, or
              read the <a href="/guides/uk-tax-rates-2026-27" className={linkCls}>UK tax rates guide for 2026-27</a>.
            </div>

            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-ink dark:text-white">Frequently asked questions</h2>
              <div className="mt-4 grid gap-3">
                {faqItems.map(({ q, a }) => (
                  <details key={q} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                    <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{q}</summary>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted dark:text-slate-400">{a}</p>
                  </details>
                ))}
              </div>
            </div>

            <p className="mt-6 flex justify-between text-[0.95rem]">
              {prev ? <a href={`/uk/take-home/${prev}`} className={linkCls}>← {gbp(prev)} after tax</a> : <span />}
              {next ? <a href={`/uk/take-home/${next}`} className={linkCls}>{gbp(next)} after tax →</a> : <span />}
            </p>

            <p className="mt-6 text-sm text-ink-muted dark:text-slate-500">
              Estimates for the 2026-27 tax year using England, Wales &amp; Northern Ireland rates, the standard
              personal allowance (tapered above £100,000), and employee Class 1 National Insurance. Actual pay varies
              with your tax code, pension, and benefits. Not tax advice.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
