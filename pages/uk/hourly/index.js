import { useState } from 'react';
import Head from 'next/head';
import Container from '../../../components/ui/Container';
const { UK_HOURLY_RATES } = require('../../../utils/hourlyRates');

const gbp = (n) => `£${Math.round(n).toLocaleString('en-GB')}`;
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';
const inputCls =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
const labelCls = 'block text-sm font-medium text-ink-soft dark:text-slate-300';

const faqItems = [
  {
    q: 'How do you convert a UK hourly wage to an annual salary?',
    a: 'Multiply the hourly rate by hours per week, then by 52. The most common UK full-time week is 37.5 hours, so salary = hourly rate × 1,950; a 40-hour contract uses × 2,080. UK employees are paid for statutory holiday, so all 52 weeks count.'
  },
  {
    q: 'Why 37.5 hours and not 40?',
    a: 'A standard UK 9-to-5 with an unpaid lunch break is 7.5 working hours a day — 37.5 a week. Plenty of contracts are 40 (or 35 in parts of the public sector), which is why the converter lets you set the exact hours.'
  },
  {
    q: 'Are these amounts before or after tax?',
    a: 'Before tax. Income tax and National Insurance reduce take-home meaningfully — each per-rate page below includes a 2026-27 estimate, and the UK Income Tax Calculator adds your student loan plan, pension, and Scottish bands.'
  },
  {
    q: 'Does the annual figure include overtime?',
    a: 'No — it assumes your contracted hours every week. The UK has no statutory overtime premium (overtime pay is set by contract), so add any regular contractual overtime separately at the rate your contract specifies.'
  }
];

export default function UkHourlyIndexPage() {
  const [mode, setMode] = useState('toSalary');
  const [rate, setRate] = useState(18);
  const [salary, setSalary] = useState(35000);
  const [hours, setHours] = useState(37.5);

  const hoursPerYear = (Number(hours) || 0) * 52;
  const annual = (Number(rate) || 0) * hoursPerYear;
  const hourlyFromSalary = hoursPerYear > 0 ? (Number(salary) || 0) / hoursPerYear : 0;

  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upaman.com/' },
      { '@type': 'ListItem', position: 2, name: 'UK Hourly to Salary', item: 'https://upaman.com/uk/hourly' }
    ]
  };

  return (
    <>
      <Head>
        <title>UK Hourly to Salary Calculator | £/Hour to Annual Pay | Upaman</title>
        <meta name="description" content="Convert a UK hourly wage to an annual salary (and back) on a 37.5- or 40-hour week — plus per-rate pages from £12 to £50 an hour with 2026-27 after-tax estimates." />
        <link rel="canonical" href="https://upaman.com/uk/hourly" />
        <meta property="og:title" content="UK Hourly to Salary Calculator | Upaman" />
        <meta property="og:description" content="Convert £/hour to yearly salary and back, then see the 2026-27 take-home for each rate." />
        <meta property="og:url" content="https://upaman.com/uk/hourly" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <section className="py-8 sm:py-12">
        <Container>
          <article className="mx-auto max-w-[820px] text-[1.02rem] leading-relaxed text-ink-soft dark:text-slate-300">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              UK Hourly to Salary Calculator
            </h1>
            <p className="mt-3">
              Convert an hourly rate into a yearly, monthly, and weekly UK salary — or a salary back into a true hourly
              rate. The default is the most common UK full-time week of 37.5 hours; set 40 (or your contracted hours)
              to match your job.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white p-5 dark:border-slate-700/70 dark:bg-slate-800/70">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('toSalary')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${mode === 'toSalary' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft dark:bg-slate-700 dark:text-slate-300'}`}
                >
                  Hourly → Salary
                </button>
                <button
                  type="button"
                  onClick={() => setMode('toHourly')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${mode === 'toHourly' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft dark:bg-slate-700 dark:text-slate-300'}`}
                >
                  Salary → Hourly
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {mode === 'toSalary' ? (
                  <div>
                    <label className={labelCls} htmlFor="uk-hourly-rate">Hourly rate (£)</label>
                    <input id="uk-hourly-rate" type="number" min="0" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} />
                  </div>
                ) : (
                  <div>
                    <label className={labelCls} htmlFor="uk-annual-salary">Annual salary (£)</label>
                    <input id="uk-annual-salary" type="number" min="0" step="1000" value={salary} onChange={(e) => setSalary(e.target.value)} className={inputCls} />
                  </div>
                )}
                <div>
                  <label className={labelCls} htmlFor="uk-hours-week">Hours per week</label>
                  <input id="uk-hours-week" type="number" min="1" max="80" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-4 dark:border-brand-800/60 dark:from-brand-900/30 dark:to-emerald-900/20">
                {mode === 'toSalary' ? (
                  <>
                    <div className="text-sm text-ink-muted dark:text-slate-400">£{Number(rate) || 0}/hour × {hours} h/week × 52 weeks, before tax</div>
                    <div className="mt-1 font-display text-2xl font-bold text-ink dark:text-white">{gbp(annual)} / year</div>
                    <div className="mt-1 text-sm text-ink-soft dark:text-slate-300">
                      ≈ <strong>{gbp(annual / 12)}</strong>/month · <strong>{gbp((Number(rate) || 0) * (Number(hours) || 0))}</strong>/week
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-ink-muted dark:text-slate-400">{gbp(Number(salary) || 0)}/year ÷ ({hours} h/week × 52 weeks), before tax</div>
                    <div className="mt-1 font-display text-2xl font-bold text-ink dark:text-white">£{hourlyFromSalary.toFixed(2)} / hour</div>
                    <div className="mt-1 text-sm text-ink-soft dark:text-slate-300">
                      ≈ <strong>{gbp((Number(salary) || 0) / 12)}</strong>/month
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm text-ink-muted dark:text-slate-500">
              These are gross figures. For take-home after 2026-27 income tax, National Insurance, student loan, and
              pension, use the <a href="/uk-income-tax-calculator" className={linkCls}>UK Income Tax Calculator</a>.
            </p>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">What each rate earns per year</h2>
            <p className="mt-3">
              Every page below shows the 37.5- and 40-hour annual figures, part-time tables, and a 2026-27 after-tax
              estimate for that rate:
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {UK_HOURLY_RATES.map((r) => (
                <a key={r} href={`/uk/hourly/${r}`} className="rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-center text-sm font-semibold text-brand-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-brand-300 dark:hover:bg-slate-800">
                  £{r}/hr
                </a>
              ))}
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

            <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">Related:</strong>{' '}
              <a href="/uk/take-home" className={linkCls}>UK take-home pay tables (£20k–£150k)</a> ·{' '}
              <a href="/guides/how-to-read-your-uk-payslip" className={linkCls}>how to read your UK payslip</a> ·{' '}
              <a href="/guides/uk-tax-rates-2026-27" className={linkCls}>UK tax rates 2026-27</a> ·{' '}
              <a href="/hourly" className={linkCls}>US version ($/hour)</a>
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}
