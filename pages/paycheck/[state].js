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
      prev: idx > 0 ? { name: US_STATES[codesSorted[idx - 1]].name, slug: stateSlug(codesSorted[idx - 1]) } : null,
      next: idx < codesSorted.length - 1 ? { name: US_STATES[codesSorted[idx + 1]].name, slug: stateSlug(codesSorted[idx + 1]) } : null
    }
  };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

export default function StatePaycheckPage({ code, name, slug, type, taxSummary, rows, example, prev, next }) {
  const canonical = `https://upaman.com/paycheck/${slug}`;
  const title = `Take-Home Pay in ${name} 2026 | Salary After Taxes | Upaman`;
  const desc = `What is take-home pay in ${name}? A $75,000 salary leaves about ${usd(example.net)} after taxes in 2026 (${usd(example.monthly)}/month). See net pay for $40k–$150k salaries.`;

  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: `How much is $75,000 after taxes in ${name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `In 2026, a single filer earning $75,000 in ${name} takes home about ${usd(example.net)} per year (${usd(example.monthly)}/month, ${usd(example.biweekly)} bi-weekly) after federal income tax, Social Security, Medicare${type !== 'none' ? ', and state income tax' : ''} — an effective tax rate of ${example.effectiveRate}%.`
      }
    }]
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

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">Get your exact number:</strong> the{' '}
              <a href="/us-paycheck-calculator" className={linkCls}>US Paycheck Calculator</a> adds filing status,
              401(k) contributions, and weekly/bi-weekly views. Or compare{' '}
              <a href="/paycheck" className={linkCls}>take-home pay in every state</a> and{' '}
              <a href="/after-taxes" className={linkCls}>by salary level</a>.
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
