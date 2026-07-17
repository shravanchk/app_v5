import Head from 'next/head';
import Container from '../../../components/ui/Container';
const { calculateUKTax } = require('../../../utils/taxCalculations');
const { UK_SALARY_LEVELS } = require('../../../utils/salaryLevels');
const { UK_HOURLY_RATES } = require('../../../utils/hourlyRates');

const gbp = (n) => `£${Math.round(n).toLocaleString('en-GB')}`;

export async function getStaticPaths() {
  return {
    paths: UK_HOURLY_RATES.map((r) => ({ params: { rate: String(r) } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const rate = Number(params.rate);
  const idx = UK_HOURLY_RATES.indexOf(rate);

  // 37.5 hours is the most common UK full-time week; 40 shown alongside.
  const annual = rate * 37.5 * 52;
  const annual40 = rate * 40 * 52;

  const tax = calculateUKTax({ grossIncome: annual });
  const plus = calculateUKTax({ grossIncome: annual + 1950 }); // +£1/hour at 37.5×52
  const keepPerPoundRaise = Math.round(plus.netIncome - tax.netIncome);

  const nearestLevel = UK_SALARY_LEVELS.reduce((best, l) => (Math.abs(l - annual) < Math.abs(best - annual) ? l : best), UK_SALARY_LEVELS[0]);

  const hoursRows = [16, 20, 25, 30, 37.5, 40].map((h) => ({
    hours: h,
    weekly: rate * h,
    monthly: Math.round((rate * h * 52) / 12),
    annual: rate * h * 52
  }));

  return {
    props: {
      rate,
      annual,
      annual40,
      monthly: Math.round(annual / 12),
      weekly: rate * 37.5,
      daily: rate * 7.5,
      net: {
        annual: Math.round(tax.netIncome),
        monthly: Math.round(tax.monthlyNet),
        hourly: Number((tax.netIncome / (37.5 * 52)).toFixed(2)),
        incomeTax: Math.round(tax.incomeTax),
        ni: Math.round(tax.nationalInsurance),
        effectiveRate: Number(tax.effectiveRate.toFixed(1))
      },
      keepPerPoundRaise,
      nearestLevel,
      hoursRows,
      prev: idx > 0 ? UK_HOURLY_RATES[idx - 1] : null,
      next: idx < UK_HOURLY_RATES.length - 1 ? UK_HOURLY_RATES[idx + 1] : null
    }
  };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

export default function UkHourlyRatePage({ rate, annual, annual40, monthly, weekly, daily, net, keepPerPoundRaise, nearestLevel, hoursRows, prev, next }) {
  const canonical = `https://upaman.com/uk/hourly/${rate}`;
  const title = `£${rate} an Hour Is How Much a Year? | ${gbp(annual)} Before Tax | Upaman`;
  const desc = `£${rate}/hour is ${gbp(annual)} a year on a 37.5-hour UK week (${gbp(annual40)} at 40 hours) — about ${gbp(monthly)} a month. After tax and NI that is roughly ${gbp(net.annual)} (2026-27). Part-time and take-home breakdowns.`;

  const faqItems = [
    {
      q: `£${rate} an hour is how much a year?`,
      a: `On the most common UK full-time week of 37.5 hours, £${rate} per hour is ${gbp(annual)} a year (52 weeks). On a 40-hour week it is ${gbp(annual40)}. Paid holiday is included in these figures because UK employees are paid for leave weeks.`
    },
    {
      q: `£${rate} an hour is how much a month?`,
      a: `About ${gbp(monthly)} per month before deductions (${gbp(annual)} ÷ 12) at 37.5 hours a week, or ${gbp(weekly)} per week and roughly ${gbp(daily)} per 7.5-hour day.`
    },
    {
      q: `How much is £${rate} an hour after tax?`,
      a: `In 2026-27, on ${gbp(annual)} a year (England/Wales/NI, standard tax code, no student loan or pension), deductions are about ${gbp(net.incomeTax)} income tax and ${gbp(net.ni)} National Insurance, leaving roughly ${gbp(net.annual)} a year — ${gbp(net.monthly)} a month, an effective rate of ${net.effectiveRate}%, and a true take-home of about £${net.hourly.toFixed(2)} per hour worked.`
    },
    {
      q: `What does a £1/hour rise from £${rate} actually add?`,
      a: `One more pound per hour is £1,950 more per year at 37.5 hours. After income tax and National Insurance you keep roughly ${gbp(keepPerPoundRaise)} of it (2026-27, standard assumptions). Only the new pounds are taxed at your marginal rate — a rise never increases the tax on pay you already earn.`
    },
    {
      q: `Is overtime paid extra in the UK?`,
      a: `Unlike the US, the UK has no statutory overtime premium — overtime pay is whatever your contract says, and some salaried roles pay none. The only legal floor is that average pay must not fall below the National Minimum Wage; check your contract for the actual overtime rate.`
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
      { '@type': 'ListItem', position: 2, name: 'UK Hourly to Salary', item: 'https://upaman.com/uk/hourly' },
      { '@type': 'ListItem', position: 3, name: `£${rate} an hour`, item: canonical }
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
              <a href="/" className={linkCls}>Home</a> &rsaquo; <a href="/uk/hourly" className={linkCls}>UK hourly to salary</a> &rsaquo; £{rate}/hour
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              £{rate} an Hour Is How Much a Year?
            </h1>

            <div className="mt-5 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-5 dark:border-brand-800/60 dark:from-brand-900/30 dark:to-emerald-900/20">
              <div className="text-sm text-ink-muted dark:text-slate-400">£{rate}/hour on a 37.5-hour week, before tax</div>
              <div className="mt-1 font-display text-3xl font-bold text-ink dark:text-white">{gbp(annual)} / year</div>
              <div className="mt-1.5 text-sm text-ink-soft dark:text-slate-300">
                ≈ <strong>{gbp(monthly)}</strong>/month · <strong>{gbp(weekly)}</strong>/week · <strong>{gbp(annual40)}</strong>/year on a 40-hour week
              </div>
            </div>

            <p className="mt-4">
              The UK&rsquo;s most common full-time week is <strong>37.5 hours</strong> (9-to-5 with a lunch break), which
              makes the conversion <strong>hourly rate × 1,950</strong>. A true 40-hour contract earns{' '}
              <strong>{gbp(annual40)}</strong> instead. Unlike hourly work in some countries, UK employees are paid for
              their statutory holiday weeks, so the 52-week figure is the right one for comparing against salaried offers.
            </p>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">Part-time: £{rate}/hour at fewer hours</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-[0.95rem]">
                <tbody>
                  <tr>
                    <th className={thCls}>Hours / week</th>
                    <th className={thCls}>Per week</th>
                    <th className={thCls}>Per month</th>
                    <th className={thCls}>Per year</th>
                  </tr>
                  {hoursRows.map((r) => (
                    <tr key={r.hours}>
                      <td className={`${tdCls} font-semibold`}>{r.hours}</td>
                      <td className={tdCls}>{gbp(r.weekly)}</td>
                      <td className={tdCls}>{gbp(r.monthly)}</td>
                      <td className={`${tdCls} font-semibold text-emerald-700 dark:text-emerald-400`}>{gbp(r.annual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">After tax: what £{rate}/hour actually pays</h2>
            <p className="mt-3">
              On {gbp(annual)} a year in 2026-27 (England, Wales or Northern Ireland, standard 1257L code, no student
              loan or pension), deductions are about <strong>{gbp(net.incomeTax)}</strong> income tax and{' '}
              <strong>{gbp(net.ni)}</strong> employee National Insurance. That leaves roughly{' '}
              <strong>{gbp(net.annual)}</strong> a year — <strong>{gbp(net.monthly)}</strong> a month, an effective
              deduction rate of {net.effectiveRate}%, and a true take-home of about{' '}
              <strong>£{net.hourly.toFixed(2)} per hour worked</strong>. Scotland&rsquo;s bands differ. See the full
              breakdown at <a href={`/uk/take-home/${nearestLevel}`} className={linkCls}>{gbp(nearestLevel)} take-home</a>,
              or add your student loan plan and pension with the{' '}
              <a href="/uk-income-tax-calculator" className={linkCls}>UK Income Tax Calculator</a>.
            </p>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">Rises and overtime at £{rate}/hour</h2>
            <p className="mt-3">
              A <strong>£1/hour rise is £1,950 a year</strong> at 37.5 hours, of which you keep roughly{' '}
              <strong>{gbp(keepPerPoundRaise)}</strong> after tax and NI — only the new pounds are taxed at your marginal
              rate, so a rise never makes existing pay worse. On overtime, the UK has <strong>no statutory
              premium</strong> — time-and-a-half is contract, not law — so the number that matters is in your employment
              contract, with the National Minimum Wage as the only legal floor (current rates on{' '}
              <a href="https://www.gov.uk/national-minimum-wage-rates" target="_blank" rel="noopener noreferrer" className={linkCls}>GOV.UK</a>).
            </p>

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">Keep going:</strong> convert any rate with the{' '}
              <a href="/uk/hourly" className={linkCls}>UK hourly to salary converter</a>, get your exact take-home with
              the <a href="/uk-income-tax-calculator" className={linkCls}>UK Income Tax Calculator</a>, or decode every
              payslip line with <a href="/guides/how-to-read-your-uk-payslip" className={linkCls}>how to read your UK payslip</a>.
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
              {prev ? <a href={`/uk/hourly/${prev}`} className={linkCls}>← £{prev}/hour</a> : <span />}
              {next ? <a href={`/uk/hourly/${next}`} className={linkCls}>£{next}/hour →</a> : <span />}
            </p>

            <p className="mt-6 text-sm text-ink-muted dark:text-slate-500">
              Gross figures are exact arithmetic on the stated hours. Take-home estimates use 2026-27 rates for
              England/Wales/NI with the standard Personal Allowance and no student loan, pension, or benefits in kind;
              Scottish rates differ. Not tax advice.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
