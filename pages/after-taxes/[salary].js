import Head from 'next/head';
import Container from '../../components/ui/Container';
const { computePaycheck, US_STATES, stateSlug, FEDERAL_2026, FICA_2026 } = require('../../utils/usPaycheckCalculations');
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

  // ---- level-specific analysis (all from the same engine/constants) ----
  const fedTaxable = Math.max(0, salary - FEDERAL_2026.standardDeduction.single);
  const bracket = FEDERAL_2026.brackets.single.find((b) => fedTaxable >= b.min && fedTaxable < b.max);
  const bracketTop = bracket.max === Infinity ? null : Math.round(bracket.max + FEDERAL_2026.standardDeduction.single);
  const netPlus1000 = computePaycheck({ grossAnnual: salary + 1000, stateCode: 'TX', filingStatus: 'single' }).netAnnual;
  const keepPer1000Fed = Math.round(netPlus1000 - base.net);
  const aboveSsCap = salary > FICA_2026.ssWageBase;
  const aboveAddlMedicare = salary > FICA_2026.additionalThreshold.single;
  const ladder = {
    prevLevel: null,
    nextLevel: null
  };
  if (idx > 0) {
    const p = SALARY_LEVELS[idx - 1];
    const pNet = computePaycheck({ grossAnnual: p, stateCode: 'TX', filingStatus: 'single' }).netAnnual;
    ladder.prevLevel = { salary: p, netGain: Math.round(base.net - pNet), grossGain: salary - p };
  }
  if (idx < SALARY_LEVELS.length - 1) {
    const n = SALARY_LEVELS[idx + 1];
    const nNet = computePaycheck({ grossAnnual: n, stateCode: 'TX', filingStatus: 'single' }).netAnnual;
    ladder.nextLevel = { salary: n, netGain: Math.round(nNet - base.net), grossGain: n - salary };
  }
  const analysis = {
    bracketRate: bracket.rate,
    bracketTop,
    keepPer1000Fed,
    aboveSsCap,
    ssWageBase: FICA_2026.ssWageBase,
    aboveAddlMedicare,
    addlMedicareThreshold: FICA_2026.additionalThreshold.single,
    spread: base.net - lowest.net,
    spreadPct: Number((((base.net - lowest.net) / salary) * 100).toFixed(1)),
    ladder
  };

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
      analysis,
      prev: idx > 0 ? SALARY_LEVELS[idx - 1] : null,
      next: idx < SALARY_LEVELS.length - 1 ? SALARY_LEVELS[idx + 1] : null
    }
  };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

export default function SalaryAfterTaxesPage({ salary, rows, best, lowest, federal, hourly, analysis, prev, next }) {
  const canonical = `https://upaman.com/after-taxes/${salary}`;
  const title = `${usd(salary)} After Taxes 2026 | Take-Home Pay by State | Upaman`;
  const desc = `How much is ${usd(salary)} a year after taxes? In 2026 a single filer keeps ${usd(lowest.net)}–${usd(best.net)} depending on state (${usd(best.monthly)}/month in no-tax states). Full 50-state table.`;

  const faqItems = [
    {
      q: `How much is ${usd(salary)} a year after taxes?`,
      a: `In 2026, a single filer earning ${usd(salary)} takes home between ${usd(lowest.net)} and ${usd(best.net)} per year depending on the state. In states with no income tax (Texas, Florida, Washington and six others) that is ${usd(best.net)} per year, or about ${usd(best.monthly)} per month, after federal income tax (${usd(federal.incomeTax)}), Social Security (${usd(federal.socialSecurity)}), and Medicare (${usd(federal.medicare)}).`
    },
    {
      q: `What is ${usd(salary)} a year per hour?`,
      a: `${usd(salary)} a year is $${hourly.toFixed(2)} per hour before taxes, based on a standard 2,080-hour work year (40 hours × 52 weeks).`
    },
    {
      q: `Which states have the highest and lowest take-home on ${usd(salary)}?`,
      a: `On a ${usd(salary)} salary the nine no-income-tax states (Texas, Florida, Washington and others) give the highest take-home at ${usd(best.net)} a year. ${lowest.name} is the lowest in this table at ${usd(lowest.net)} — a difference of ${usd(best.net - lowest.net)} a year purely from state income tax.`
    },
    {
      q: `What federal tax bracket is ${usd(salary)} in for 2026?`,
      a: `After the ${usd(FEDERAL_2026.standardDeduction.single)} standard deduction, a single filer earning ${usd(salary)} is in the ${analysis.bracketRate}% federal bracket. That is the marginal rate — only the top slice of income is taxed at it${analysis.bracketTop ? `, and it applies until gross salary passes roughly ${usd(analysis.bracketTop)}` : ''}. In a no-state-tax state, each extra $1,000 earned at this level keeps about ${usd(analysis.keepPer1000Fed)}.`
    },
    {
      q: `Does a raise from ${usd(salary)} get eaten by taxes?`,
      a: `${analysis.ladder.nextLevel ? `Partly, but far less than the "next bracket" myth suggests: moving from ${usd(salary)} to ${usd(analysis.ladder.nextLevel.salary)} adds ${usd(analysis.ladder.nextLevel.netGain)} of take-home out of the ${usd(analysis.ladder.nextLevel.grossGain)} gross increase (no-state-tax case). Only the new dollars are taxed at the higher marginal rate — the rest of your income keeps its lower rates.` : `Only the new dollars are taxed at your marginal rate — crossing into a higher bracket never reduces the take-home on income you already earn. At this level each extra $1,000 keeps about ${usd(analysis.keepPer1000Fed)} before state tax.`}`
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

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">What happens to the next dollar at {usd(salary)}</h2>
            <p className="mt-3">
              After the {usd(FEDERAL_2026.standardDeduction.single)} federal standard deduction, {usd(salary)} puts a single filer in the{' '}
              <strong>{analysis.bracketRate}% federal bracket</strong>
              {analysis.bracketTop
                ? ` — and stays there until gross pay passes roughly ${usd(analysis.bracketTop)}`
                : ' — the top of the schedule'}
              . Only the dollars inside that bracket are taxed at that rate, which is why the effective rate in the
              headline box is well below it. In practical terms: in a no-state-tax state, each additional $1,000 earned
              at this level keeps about <strong>{usd(analysis.keepPer1000Fed)}</strong>
              {analysis.aboveSsCap
                ? ` — and note that Social Security tax no longer applies, because ${usd(salary)} is past the ${usd(analysis.ssWageBase)} wage base, so raises here keep more than they did on the way up`
                : ''}
              {analysis.aboveAddlMedicare
                ? `${analysis.aboveSsCap ? ', though' : ' —'} the 0.9% additional Medicare tax applies above ${usd(analysis.addlMedicareThreshold)}`
                : ''}
              .
            </p>
            {analysis.ladder.prevLevel || analysis.ladder.nextLevel ? (
              <p className="mt-3">
                {analysis.ladder.prevLevel
                  ? `Stepping up from ${usd(analysis.ladder.prevLevel.salary)} to ${usd(salary)} added ${usd(analysis.ladder.prevLevel.netGain)} of annual take-home out of a ${usd(analysis.ladder.prevLevel.grossGain)} gross increase. `
                  : ''}
                {analysis.ladder.nextLevel
                  ? `The next step, ${usd(salary)} to ${usd(analysis.ladder.nextLevel.salary)}, would add about ${usd(analysis.ladder.nextLevel.netGain)} of the ${usd(analysis.ladder.nextLevel.grossGain)} raise (no-state-tax case). `
                  : ''}
                Crossing a bracket line never taxes your existing income more — only the new dollars — so a raise is
                always worth taking; it just spends smaller than it reads.
              </p>
            ) : null}
            <p className="mt-3">
              Where you live moves the outcome by up to <strong>{usd(analysis.spread)}</strong> a year at this salary —{' '}
              {analysis.spreadPct}% of gross, entirely from state and average local income taxes. That spread is wide
              enough to matter in a relocation decision but narrower than cost-of-living differences between the same
              states, which is why the table below is a starting point rather than a verdict.
            </p>

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">Get your exact number:</strong> the{' '}
              <a href="/us-paycheck-calculator" className={linkCls}>US Paycheck Calculator</a> adds filing status,
              401(k) contributions, and weekly/bi-weekly views. Or browse{' '}
              <a href="/after-taxes" className={linkCls}>other salary levels</a>,{' '}
              <a href="/paycheck" className={linkCls}>take-home pay by state</a>, or learn{' '}
              <a href="/guides/how-to-read-your-paycheck" className={linkCls}>how every paycheck deduction works</a>.
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
