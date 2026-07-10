import Head from 'next/head';
import Container from '../../components/ui/Container';
const { computePaycheck, US_STATES, stateSlug, codeFromSlug } = require('../../utils/usPaycheckCalculations');

const SALARIES = [40000, 50000, 60000, 75000, 100000, 125000, 150000];

const usd = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

export async function getStaticPaths() {
  return {
    paths: Object.keys(US_STATES).map((code) => ({ params: { state: stateSlug(code) } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const code = codeFromSlug(params.state);
  const st = US_STATES[code];
  const codesSorted = Object.keys(US_STATES).sort((a, b) => US_STATES[a].name.localeCompare(US_STATES[b].name));
  const idx = codesSorted.indexOf(code);

  const rows = SALARIES.map((salary) => {
    const r = computePaycheck({ grossAnnual: salary, stateCode: code, filingStatus: 'single' });
    return {
      salary,
      net: Math.round(r.netAnnual),
      monthly: Math.round(r.netAnnual / 12),
      biweekly: Math.round(r.netAnnual / 26),
      stateTax: Math.round(r.stateTax),
      effectiveRate: Number(r.effectiveRate.toFixed(1))
    };
  });

  // headline example: $75k single
  const example = rows.find((r) => r.salary === 75000);

  // ---- cross-state comparison at $75k (computed from the same engine) ----
  const all75 = Object.keys(US_STATES)
    .map((c) => ({
      code: c,
      name: US_STATES[c].name,
      slug: stateSlug(c),
      net: computePaycheck({ grossAnnual: 75000, stateCode: c, filingStatus: 'single' }).netAnnual
    }))
    .sort((a, b) => b.net - a.net);
  const myNet75 = all75.find((s) => s.code === code).net;
  const rank = all75.filter((s) => s.net > myNet75 + 0.5).length + 1; // competition ranking, ties share a rank
  const bestNet = all75[0].net;
  const medianNet = all75[Math.floor(all75.length / 2)].net;
  const noTaxCount = Object.values(US_STATES).filter((s) => s.type === 'none').length;
  const gapVsBest = Math.round(bestNet - myNet75);
  const gapVsMedian = Math.round(myNet75 - medianNet);
  const higherNeighbor = [...all75].reverse().find((s) => s.net > myNet75 + 0.5) || null;
  const lowerNeighbor = all75.find((s) => s.net < myNet75 - 0.5) || null;
  const comparison = {
    rank,
    totalRanked: all75.length,
    gapVsBest,
    gapVsMedian,
    noTaxCount,
    higherNeighbor: higherNeighbor ? { name: higherNeighbor.name, slug: higherNeighbor.slug, gap: Math.round(higherNeighbor.net - myNet75) } : null,
    lowerNeighbor: lowerNeighbor ? { name: lowerNeighbor.name, slug: lowerNeighbor.slug, gap: Math.round(myNet75 - lowerNeighbor.net) } : null
  };

  // ---- marginal math: what an extra $1,000 keeps at $75k ----
  const net76 = computePaycheck({ grossAnnual: 76000, stateCode: code, filingStatus: 'single' }).netAnnual;
  const keepPer1000 = Math.round(net76 - myNet75);

  // ---- structure detail for prose (from the same US_STATES config the engine taxes with) ----
  const structure = { type: st.type };
  if (st.type === 'flat') {
    structure.rate = st.rate;
    structure.stdDeduction = st.stdDeduction || 0;
    structure.usesFederalDeduction = Boolean(st.usesFederalDeduction);
    structure.effState75 = Number(((example.stateTax / 75000) * 100).toFixed(2));
  } else if (st.type === 'brackets') {
    const taxable75 = Math.max(0, 75000 - (st.stdDeduction || 0));
    const bracket75 = st.brackets.find((b) => taxable75 >= b.min && taxable75 < b.max);
    structure.bracketCount = st.brackets.length;
    structure.bottomRate = st.brackets.find((b) => b.rate > 0)?.rate ?? 0;
    structure.topRate = st.brackets[st.brackets.length - 1].rate;
    structure.topThreshold = st.brackets[st.brackets.length - 1].min;
    structure.stdDeduction = st.stdDeduction || 0;
    structure.usesFederalDeduction = Boolean(st.usesFederalDeduction);
    structure.bracket75Rate = bracket75 ? bracket75.rate : structure.topRate;
    structure.localAvgRate = st.localAvgRate || null;
  }
  const row40 = rows.find((r) => r.salary === 40000);
  const row150 = rows.find((r) => r.salary === 150000);
  structure.effState40 = Number(((row40.stateTax / 40000) * 100).toFixed(2));
  structure.effState150 = Number(((row150.stateTax / 150000) * 100).toFixed(2));

  let taxSummary;
  if (st.type === 'none') {
    taxSummary = `${st.name} has no state income tax on wages, so your paycheck is reduced only by federal income tax, Social Security, and Medicare.`;
  } else if (st.type === 'flat') {
    taxSummary = `${st.name} levies a flat ${st.rate}% state income tax${st.stdDeduction ? ` after a standard deduction` : ''}.`;
  } else {
    const top = st.brackets[st.brackets.length - 1].rate;
    const bottom = st.brackets.find((b) => b.rate > 0)?.rate ?? 0;
    taxSummary = `${st.name} uses progressive brackets from ${bottom}% up to ${top}%${st.localAvgRate ? `, plus local county taxes (an average ${st.localAvgRate}% is included here)` : ''}.`;
  }
  if (st.localNote && !st.localAvgRate) taxSummary += ` Note: ${st.localNote}.`;

  return {
    props: {
      code,
      name: st.name,
      slug: params.state,
      type: st.type,
      taxSummary,
      rows,
      example,
      comparison,
      keepPer1000,
      structure,
      prev: idx > 0 ? { name: US_STATES[codesSorted[idx - 1]].name, slug: stateSlug(codesSorted[idx - 1]) } : null,
      next: idx < codesSorted.length - 1 ? { name: US_STATES[codesSorted[idx + 1]].name, slug: stateSlug(codesSorted[idx + 1]) } : null
    }
  };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

export default function StatePaycheckPage({ code, name, slug, type, taxSummary, rows, example, comparison, keepPer1000, structure, prev, next }) {
  const canonical = `https://upaman.com/paycheck/${slug}`;
  const title = `Take-Home Pay in ${name} 2026 | Salary After Taxes | Upaman`;
  const desc = `What is take-home pay in ${name}? A $75,000 salary leaves about ${usd(example.net)} after taxes in 2026 (${usd(example.monthly)}/month). See net pay for $40k–$150k salaries.`;

  const hundredK = rows.find((r) => r.salary === 100000);
  const faqItems = [
    {
      q: `How much is $75,000 after taxes in ${name}?`,
      a: `In 2026, a single filer earning $75,000 in ${name} takes home about ${usd(example.net)} per year (${usd(example.monthly)}/month, ${usd(example.biweekly)} bi-weekly) after federal income tax, Social Security, Medicare${type !== 'none' ? ', and state income tax' : ''} — an effective tax rate of ${example.effectiveRate}%.`
    },
    {
      q: `Does ${name} have a state income tax?`,
      a: taxSummary
    },
    {
      q: `What is $100,000 after taxes in ${name}?`,
      a: `A single filer earning $100,000 in ${name} takes home about ${usd(hundredK.net)} a year in 2026 — ${usd(hundredK.monthly)} a month, an effective tax rate of ${hundredK.effectiveRate}%${type !== 'none' ? ` including ${usd(hundredK.stateTax)} of state income tax` : ' (there is no state income tax to add)'}.`
    },
    {
      q: `How much of a $1,000 raise do I keep in ${name}?`,
      a: `At a $75,000 salary, a single filer in ${name} keeps about ${usd(keepPer1000)} of each additional $1,000 earned in 2026 — the rest goes to federal income tax${type !== 'none' ? ', state income tax,' : ''} and Medicare. Raises are taxed at your marginal rate, not your (lower) effective rate, which is why a raise always feels smaller than the offer letter.`
    },
    type === 'none'
      ? {
          q: `Is a $75,000 salary really worth more in ${name}?`,
          a: `In paycheck terms, yes: ${name} ties the other ${comparison.noTaxCount - 1} no-income-tax states for the highest take-home in the country, keeping about ${usd(comparison.gapVsMedian)} more per year at $75,000 than the median state. States without a wage income tax generally lean more on sales and property taxes instead, so the full cost-of-living picture depends on how you spend and whether you own a home — but none of those show up as paycheck deductions.`
        }
      : structure.type === 'flat'
        ? {
            q: `What does ${name}'s flat tax mean for my paycheck?`,
            a: `Every dollar of taxable wage income is taxed at the same ${structure.rate}% rate, so the state takes the same share of a raise whether you earn $40,000 or $150,000 — the table's effective state rate barely moves (${structure.effState40}% at $40k, ${structure.effState150}% at $150k). ${structure.stdDeduction ? `The ${usd(structure.stdDeduction)} standard deduction shields the first slice of income, which is why the effective state rate at $75,000 (${structure.effState75}%) sits below the headline rate.` : `With no standard deduction, the headline rate is effectively the real rate from the first dollar.`}`
          }
        : {
            q: `What state tax bracket is a $75,000 salary in ${name}?`,
            a: `After the state's ${structure.stdDeduction ? usd(structure.stdDeduction) : '$0'} standard deduction, a $75,000 single filer falls in ${name}'s ${structure.bracket75Rate}% bracket. That is the marginal rate — only income inside that bracket is taxed at it, so the average (effective) state rate is lower. ${name}'s top ${structure.topRate}% rate only applies to taxable income above ${usd(structure.topThreshold)}.`
          }
  ];
  if (structure.localAvgRate) {
    faqItems.push({
      q: `Are local taxes included in these ${name} numbers?`,
      a: `Yes — an average ${structure.localAvgRate}% local income tax is included on top of the state brackets, because nearly all wage earners in ${name} pay one. Your county's actual rate may be somewhat higher or lower, so treat these figures as a representative middle case.`
    });
  }
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upaman.com/' },
      { '@type': 'ListItem', position: 2, name: 'Paycheck by State', item: 'https://upaman.com/paycheck' },
      { '@type': 'ListItem', position: 3, name: name, item: canonical }
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
              <a href="/" className={linkCls}>Home</a> &rsaquo; <a href="/paycheck" className={linkCls}>Paycheck by state</a> &rsaquo; {name}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              Take-Home Pay in {name} (2026)
            </h1>

            <div className="mt-5 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-5 dark:border-brand-800/60 dark:from-brand-900/30 dark:to-emerald-900/20">
              <div className="text-sm text-ink-muted dark:text-slate-400">$75,000 salary in {name} (single, 2026)</div>
              <div className="mt-1 font-display text-3xl font-bold text-ink dark:text-white">{usd(example.net)} / year</div>
              <div className="mt-1.5 text-sm text-ink-soft dark:text-slate-300">
                ≈ <strong>{usd(example.monthly)}</strong>/month · <strong>{usd(example.biweekly)}</strong> bi-weekly · effective tax rate {example.effectiveRate}%
              </div>
            </div>

            <p className="mt-4">{taxSummary}</p>
            <p className="mt-4">
              The table below shows estimated 2026 take-home pay in {name} for a single filer taking the standard
              deduction, after federal income tax, Social Security (6.2%), Medicare (1.45%)
              {type !== 'none' ? ', and state income tax' : ''}. For your exact numbers — including filing status and
              401(k) — use the <a href="/us-paycheck-calculator" className={linkCls}>US Paycheck Calculator</a>.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-[0.95rem]">
                <tbody>
                  <tr>
                    <th className={thCls}>Gross salary</th>
                    <th className={thCls}>Take-home / year</th>
                    <th className={thCls}>Per month</th>
                    <th className={thCls}>Bi-weekly</th>
                    {type !== 'none' ? <th className={thCls}>State tax</th> : null}
                    <th className={thCls}>Effective rate</th>
                  </tr>
                  {rows.map((r) => (
                    <tr key={r.salary}>
                      <td className={`${tdCls} font-semibold`}>
                        <a href={`/after-taxes/${r.salary}`} className={linkCls}>{usd(r.salary)}</a>
                      </td>
                      <td className={`${tdCls} font-semibold text-emerald-700 dark:text-emerald-400`}>{usd(r.net)}</td>
                      <td className={tdCls}>{usd(r.monthly)}</td>
                      <td className={tdCls}>{usd(r.biweekly)}</td>
                      {type !== 'none' ? <td className={tdCls}>{usd(r.stateTax)}</td> : null}
                      <td className={tdCls}>{r.effectiveRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">How {name} taxes a paycheck</h2>
            {type === 'none' ? (
              <>
                <p className="mt-3">
                  {name} is one of {comparison.noTaxCount} states with no income tax on wages, which makes its paycheck
                  math unusually clean: the only deductions are federal income tax, Social Security, and Medicare. The
                  entire {example.effectiveRate}% effective rate at $75,000 is federal — the state line in your pay stub
                  simply does not exist. That also means every figure in the table above ties for the best in the
                  country; no state can beat it, only match it.
                </p>
                <p className="mt-3">
                  The advantage is easy to price. Compared with the median state, the same $75,000 salary keeps about{' '}
                  {usd(comparison.gapVsMedian)} more per year here — money that arrives in every paycheck rather than at
                  refund time. And because there is no state bracket system, a raise is taxed only by the federal
                  schedule: at $75,000, each extra $1,000 earned puts about {usd(keepPer1000)} in your pocket.
                </p>
                <p className="mt-3">
                  One honest caveat: no wage tax does not mean no taxes. States that skip the income tax generally lean
                  harder on sales and property taxes, which never appear in a paycheck but do appear in a budget. For
                  comparing job offers on take-home pay, though, {name} starts ahead.
                </p>
              </>
            ) : structure.type === 'flat' ? (
              <>
                <p className="mt-3">
                  {name} is a flat-tax state: wage income is taxed at {structure.rate}% regardless of how much you earn.
                  {structure.stdDeduction
                    ? ` A ${usd(structure.stdDeduction)} standard deduction${structure.usesFederalDeduction ? ' (matched to the federal one)' : ''} shields the first slice of income, so the effective state rate at $75,000 works out to ${structure.effState75}% — noticeably under the headline number.`
                    : ` There is no state standard deduction, so the headline rate is close to the real rate from the first dollar of wages.`}
                </p>
                <p className="mt-3">
                  The signature of a flat tax is visible in the table: the effective state rate barely moves between
                  $40,000 ({structure.effState40}%) and $150,000 ({structure.effState150}%), where a progressive state
                  would show a steady climb. All of the progressivity in your total tax bill comes from the federal
                  brackets. At $75,000, an extra $1,000 of salary keeps about {usd(keepPer1000)} after federal, state,
                  and Medicare take their marginal share.
                </p>
              </>
            ) : (
              <>
                <p className="mt-3">
                  {name} runs a progressive schedule with {structure.bracketCount} brackets, from{' '}
                  {structure.bottomRate}% at the bottom to {structure.topRate}% at the top.
                  {structure.stdDeduction
                    ? ` After the ${usd(structure.stdDeduction)} state standard deduction${structure.usesFederalDeduction ? ' (matched to the federal one)' : ''}, a`
                    : ' With no state standard deduction, a'}{' '}
                  $75,000 single filer lands in the {structure.bracket75Rate}% bracket — that is the rate on the{' '}
                  <em>next</em> dollar, not on all of them, which is why the state's average bite is smaller. The top{' '}
                  {structure.topRate}% rate only touches taxable income above {usd(structure.topThreshold)}.
                  {structure.localAvgRate
                    ? ` These figures also include an average ${structure.localAvgRate}% local income tax, which nearly all ${name} wage earners pay on top of the state schedule.`
                    : ''}
                </p>
                <p className="mt-3">
                  You can read the progressivity directly off the table: the effective state{structure.localAvgRate ? '-plus-local' : ''} rate climbs from{' '}
                  {structure.effState40}% at $40,000 to {structure.effState150}% at $150,000. That climb is the
                  practical difference between a progressive state and a flat-tax one, where the share would hold
                  steady. At $75,000, each additional $1,000 of salary keeps about {usd(keepPer1000)} once federal,
                  state, and Medicare marginal rates are applied.
                </p>
              </>
            )}

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">How {name} compares with other states</h2>
            <p className="mt-3">
              {comparison.rank === 1
                ? `On a $75,000 salary, ${name} shares the #1 take-home ranking among the 50 states and D.C. with the other no-income-tax states.`
                : `On a $75,000 salary, ${name} ranks #${comparison.rank} of ${comparison.totalRanked} among the states and D.C. for take-home pay, ${usd(comparison.gapVsBest)} a year behind the no-income-tax states${comparison.gapVsMedian >= 0 ? ` and ${usd(Math.abs(comparison.gapVsMedian))} ahead of the median state` : ` and ${usd(Math.abs(comparison.gapVsMedian))} behind the median state`}.`}
              {comparison.higherNeighbor && comparison.lowerNeighbor
                ? ` The nearest state above it is ${comparison.higherNeighbor.name} (${usd(comparison.higherNeighbor.gap)} more per year); just below sits ${comparison.lowerNeighbor.name}, ${usd(comparison.lowerNeighbor.gap)} behind.`
                : comparison.higherNeighbor
                  ? ` The nearest state above it is ${comparison.higherNeighbor.name} (${usd(comparison.higherNeighbor.gap)} more per year).`
                  : comparison.lowerNeighbor
                    ? ` The nearest state with an income tax, ${comparison.lowerNeighbor.name}, trails it by ${usd(comparison.lowerNeighbor.gap)} a year.`
                    : ''}{' '}
              Rankings compare state and average local income taxes only — cost of living, housing, and sales taxes move
              real affordability in ways a paycheck never shows.
            </p>
            {(comparison.higherNeighbor || comparison.lowerNeighbor) && (
              <p className="mt-3">
                Comparing a specific move? See{' '}
                {comparison.higherNeighbor && (
                  <a href={`/paycheck/${comparison.higherNeighbor.slug}`} className={linkCls}>take-home pay in {comparison.higherNeighbor.name}</a>
                )}
                {comparison.higherNeighbor && comparison.lowerNeighbor && ' or '}
                {comparison.lowerNeighbor && (
                  <a href={`/paycheck/${comparison.lowerNeighbor.slug}`} className={linkCls}>take-home pay in {comparison.lowerNeighbor.name}</a>
                )}
                , or line every state up at once on the <a href="/paycheck" className={linkCls}>state comparison index</a>.
              </p>
            )}

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">Get your exact number:</strong> the{' '}
              <a href="/us-paycheck-calculator" className={linkCls}>US Paycheck Calculator</a> adds filing status,
              401(k) contributions, and weekly/bi-weekly views. Or compare{' '}
              <a href="/paycheck" className={linkCls}>take-home pay in every state</a> and{' '}
              <a href="/after-taxes" className={linkCls}>by salary level</a>.
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
              {prev ? <a href={`/paycheck/${prev.slug}`} className={linkCls}>← {prev.name}</a> : <span />}
              {next ? <a href={`/paycheck/${next.slug}`} className={linkCls}>{next.name} →</a> : <span />}
            </p>

            <p className="mt-6 text-sm text-ink-muted dark:text-slate-500">
              Estimates for tax year 2026 using the standard deduction; state figures use the latest published rates and
              exclude local/city taxes unless noted. Actual withholding varies with your W-4 and benefits. Not tax advice.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
