import Head from 'next/head';
import Container from '../../components/ui/Container';
const { computePaycheck, US_STATES, FEDERAL_2026 } = require('../../utils/usPaycheckCalculations');
const { SALARY_LEVELS } = require('../../utils/salaryLevels');
const { HOURLY_RATES } = require('../../utils/hourlyRates');

const usd = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

export async function getStaticPaths() {
  return {
    paths: HOURLY_RATES.map((r) => ({ params: { rate: String(r) } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const rate = Number(params.rate);
  const idx = HOURLY_RATES.indexOf(rate);
  const annual = rate * 2080; // 40 h × 52 weeks

  // Federal-only take-home (identical in every no-state-tax state)
  const fed = computePaycheck({ grossAnnual: annual, stateCode: 'TX', filingStatus: 'single' });
  const bestNet = Math.round(fed.netAnnual);

  // Lowest-take-home state at this income, for the honest range
  let lowest = { name: '', net: Infinity };
  Object.keys(US_STATES).forEach((code) => {
    const r = computePaycheck({ grossAnnual: annual, stateCode: code, filingStatus: 'single' });
    if (r.netAnnual < lowest.net) lowest = { name: US_STATES[code].name, net: Math.round(r.netAnnual) };
  });

  // Marginal keep on the next hourly dollar (+$1/h = +$2,080/yr gross)
  const netPlusDollar = computePaycheck({ grossAnnual: annual + 2080, stateCode: 'TX', filingStatus: 'single' }).netAnnual;
  const keepPerDollarRaise = Math.round(netPlusDollar - fed.netAnnual);

  const fedTaxable = Math.max(0, annual - FEDERAL_2026.standardDeduction.single);
  const bracket = FEDERAL_2026.brackets.single.find((b) => fedTaxable >= b.min && fedTaxable < b.max);

  // Nearest /after-taxes salary level for the 50-state deep link
  const nearestLevel = SALARY_LEVELS.reduce((best, l) => (Math.abs(l - annual) < Math.abs(best - annual) ? l : best), SALARY_LEVELS[0]);

  // Part-time hours table
  const hoursRows = [20, 25, 30, 35, 40].map((h) => ({
    hours: h,
    weekly: rate * h,
    annual: rate * h * 52,
    monthly: Math.round((rate * h * 52) / 12)
  }));

  return {
    props: {
      rate,
      annual,
      monthly: Math.round(annual / 12),
      biweekly: rate * 80,
      weekly: rate * 40,
      daily: rate * 8,
      annual50: rate * 40 * 50,
      annual48: rate * 40 * 48,
      net: {
        annual: bestNet,
        monthly: Math.round(bestNet / 12),
        hourly: Number((bestNet / 2080).toFixed(2)),
        effectiveRate: Number(fed.effectiveRate.toFixed(1)),
        federalTax: Math.round(fed.federalTax),
        socialSecurity: Math.round(fed.socialSecurity),
        medicare: Math.round(fed.medicare)
      },
      lowest,
      bracketRate: bracket.rate,
      keepPerDollarRaise,
      overtime: { rate: Number((rate * 1.5).toFixed(2)), fiveHoursAnnual: Math.round(rate * 1.5 * 5 * 52) },
      nearestLevel,
      hoursRows,
      prev: idx > 0 ? HOURLY_RATES[idx - 1] : null,
      next: idx < HOURLY_RATES.length - 1 ? HOURLY_RATES[idx + 1] : null
    }
  };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

export default function HourlyRatePage({ rate, annual, monthly, biweekly, weekly, daily, annual50, annual48, net, lowest, bracketRate, keepPerDollarRaise, overtime, nearestLevel, hoursRows, prev, next }) {
  const canonical = `https://upaman.com/hourly/${rate}`;
  const title = `$${rate} an Hour Is How Much a Year? | ${usd(annual)} Before Taxes | Upaman`;
  const desc = `$${rate}/hour is ${usd(annual)} a year full-time (40 h × 52 weeks) — ${usd(monthly)} a month. After taxes a single filer keeps about ${usd(net.annual)} in no-tax states (2026). Part-time, overtime, and after-tax breakdowns.`;

  const faqItems = [
    {
      q: `$${rate} an hour is how much a year?`,
      a: `$${rate} per hour is ${usd(annual)} per year working full-time: 40 hours a week for 52 weeks (2,080 hours). With two weeks unpaid time off (50 weeks) it is ${usd(annual50)}, and at 48 paid weeks it is ${usd(annual48)}.`
    },
    {
      q: `$${rate} an hour is how much a month?`,
      a: `About ${usd(monthly)} per month before taxes (${usd(annual)} ÷ 12) at 40 hours a week. Per paycheck that is ${usd(biweekly)} bi-weekly or ${usd(weekly)} weekly, gross.`
    },
    {
      q: `How much is $${rate} an hour after taxes?`,
      a: `For a single filer with the standard deduction in 2026, ${usd(annual)} gross leaves about ${usd(net.annual)} a year (${usd(net.monthly)}/month, effectively $${net.hourly.toFixed(2)}/hour) in the nine no-income-tax states — federal income tax ${usd(net.federalTax)}, Social Security ${usd(net.socialSecurity)}, Medicare ${usd(net.medicare)}. In the highest-tax case in our table (${lowest.name}) take-home is about ${usd(lowest.net)}.`
    },
    {
      q: `What is time and a half for $${rate} an hour?`,
      a: `Time and a half on $${rate} is $${overtime.rate.toFixed(2)} per overtime hour. A steady 5 hours of overtime a week at that rate adds about ${usd(overtime.fiveHoursAnnual)} a year before taxes.`
    },
    {
      q: `What does a $1/hour raise from $${rate} actually add?`,
      a: `One more dollar per hour is $2,080 more per year gross at full-time hours. At this income level a single filer keeps roughly ${usd(keepPerDollarRaise)} of it after federal income tax and FICA (no-state-tax case) — the ${bracketRate}% marginal bracket applies only to the new dollars, never to the pay you already earn.`
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
      { '@type': 'ListItem', position: 2, name: 'Hourly to Salary', item: 'https://upaman.com/hourly' },
      { '@type': 'ListItem', position: 3, name: `$${rate} an hour`, item: canonical }
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
              <a href="/" className={linkCls}>Home</a> &rsaquo; <a href="/hourly" className={linkCls}>Hourly to salary</a> &rsaquo; ${rate}/hour
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              ${rate} an Hour Is How Much a Year?
            </h1>

            <div className="mt-5 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-5 dark:border-brand-800/60 dark:from-brand-900/30 dark:to-emerald-900/20">
              <div className="text-sm text-ink-muted dark:text-slate-400">${rate}/hour, full-time (40 h × 52 weeks), before taxes</div>
              <div className="mt-1 font-display text-3xl font-bold text-ink dark:text-white">{usd(annual)} / year</div>
              <div className="mt-1.5 text-sm text-ink-soft dark:text-slate-300">
                ≈ <strong>{usd(monthly)}</strong>/month · <strong>{usd(biweekly)}</strong> bi-weekly · <strong>{usd(weekly)}</strong>/week · <strong>{usd(daily)}</strong>/day
              </div>
            </div>

            <p className="mt-4">
              The standard conversion is <strong>hourly rate × 2,080</strong> — 40 hours a week for all 52 weeks. Real
              years are often shorter: with two weeks of unpaid time off, ${rate}/hour earns <strong>{usd(annual50)}</strong>,
              and at 48 paid weeks it is <strong>{usd(annual48)}</strong>. Salaried jobs with paid vacation keep the full{' '}
              {usd(annual)}, which is one hidden difference when comparing an hourly offer against a salary.
            </p>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">Part-time: ${rate}/hour at fewer hours</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-[0.95rem]">
                <tbody>
                  <tr>
                    <th className={thCls}>Hours / week</th>
                    <th className={thCls}>Per week</th>
                    <th className={thCls}>Per month</th>
                    <th className={thCls}>Per year (52 wks)</th>
                  </tr>
                  {hoursRows.map((r) => (
                    <tr key={r.hours}>
                      <td className={`${tdCls} font-semibold`}>{r.hours}</td>
                      <td className={tdCls}>{usd(r.weekly)}</td>
                      <td className={tdCls}>{usd(r.monthly)}</td>
                      <td className={`${tdCls} font-semibold text-emerald-700 dark:text-emerald-400`}>{usd(r.annual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">After taxes: what ${rate}/hour actually pays</h2>
            <p className="mt-3">
              On {usd(annual)} gross, a single filer taking the 2026 standard deduction pays{' '}
              <strong>{usd(net.federalTax)}</strong> federal income tax, <strong>{usd(net.socialSecurity)}</strong> Social
              Security, and <strong>{usd(net.medicare)}</strong> Medicare. In the nine states with no income tax that
              leaves <strong>{usd(net.annual)}</strong> a year — <strong>{usd(net.monthly)}</strong> a month, an effective
              rate of {net.effectiveRate}%, and a real hourly take-home of about <strong>${net.hourly.toFixed(2)}</strong>.
              State income tax lowers that further, down to roughly <strong>{usd(lowest.net)}</strong> in {lowest.name}.
              See the full state-by-state table at{' '}
              <a href={`/after-taxes/${nearestLevel}`} className={linkCls}>{usd(nearestLevel)} after taxes</a>, or get your
              exact number — filing status, 401(k), your state — from the{' '}
              <a href="/us-paycheck-calculator" className={linkCls}>US Paycheck Calculator</a>.
            </p>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">Overtime and raises at ${rate}/hour</h2>
            <p className="mt-3">
              Non-exempt hourly workers earn <strong>time and a half</strong> past 40 hours a week:{' '}
              <strong>${overtime.rate.toFixed(2)}/hour</strong> at this rate. A steady 5 overtime hours a week adds about{' '}
              <strong>{usd(overtime.fiveHoursAnnual)}</strong> a year before taxes — often more than a typical annual raise.
              Speaking of raises: <strong>+$1/hour is +$2,080 a year</strong> gross, of which a single filer at this level
              keeps roughly <strong>{usd(keepPerDollarRaise)}</strong> after federal tax and FICA. The {bracketRate}%
              bracket only applies to the new dollars — a raise never lowers the take-home on pay you already earn.
            </p>

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">Keep going:</strong> convert any rate with the{' '}
              <a href="/hourly" className={linkCls}>hourly to salary converter</a>, see take-home in your state with the{' '}
              <a href="/us-paycheck-calculator" className={linkCls}>US Paycheck Calculator</a>, or put {usd(monthly)} a
              month on a budget with the <a href="/guides/50-30-20-rule" className={linkCls}>50/30/20 rule</a>.
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
              {prev ? <a href={`/hourly/${prev}`} className={linkCls}>← ${prev}/hour</a> : <span />}
              {next ? <a href={`/hourly/${next}`} className={linkCls}>${next}/hour →</a> : <span />}
            </p>

            <p className="mt-6 text-sm text-ink-muted dark:text-slate-500">
              Gross figures are exact arithmetic; after-tax estimates use 2026 federal rules and the standard deduction
              for a single filer, exclude local/city taxes, and will differ from your actual withholding. Overtime rules
              vary for exempt roles. Not tax advice.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
