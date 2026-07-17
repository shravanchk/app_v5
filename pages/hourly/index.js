import { useState } from 'react';
import Head from 'next/head';
import Container from '../../components/ui/Container';
const { HOURLY_RATES } = require('../../utils/hourlyRates');

const usd = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';
const inputCls =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
const labelCls = 'block text-sm font-medium text-ink-soft dark:text-slate-300';

const faqItems = [
  {
    q: 'How do you convert an hourly wage to an annual salary?',
    a: 'Multiply the hourly rate by hours per week, then by weeks worked per year. The standard convention is 40 hours × 52 weeks = 2,080 hours, so salary = hourly rate × 2,080. Adjust the weeks down if some time off is unpaid.'
  },
  {
    q: 'How do you convert a salary to an hourly rate?',
    a: 'Divide the annual salary by hours worked per year. On the standard 2,080-hour year, a salary of $60,000 is $28.85 per hour. If you routinely work more than 40 hours unpaid, your true hourly rate is lower — divide by your real hours to see it.'
  },
  {
    q: 'Is 2,080 hours the right assumption?',
    a: 'It assumes 40 paid hours every week of the year, which matches salaried jobs with paid vacation. Hourly workers with unpaid time off should use 50 or even 48 weeks; the converter lets you set both hours and weeks.'
  },
  {
    q: 'Are these amounts before or after taxes?',
    a: 'Before taxes. Federal income tax, Social Security, Medicare, and state tax reduce take-home meaningfully — each per-rate page below includes a 2026 after-tax estimate, and the US Paycheck Calculator gives your exact number by state and filing status.'
  }
];

export default function HourlyIndexPage() {
  const [mode, setMode] = useState('toSalary');
  const [rate, setRate] = useState(25);
  const [salary, setSalary] = useState(60000);
  const [hours, setHours] = useState(40);
  const [weeks, setWeeks] = useState(52);

  const hoursPerYear = (Number(hours) || 0) * (Number(weeks) || 0);
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
      { '@type': 'ListItem', position: 2, name: 'Hourly to Salary', item: 'https://upaman.com/hourly' }
    ]
  };

  return (
    <>
      <Head>
        <title>Hourly to Salary Calculator | What Your Hourly Rate Earns per Year | Upaman</title>
        <meta name="description" content="Convert an hourly wage to an annual salary (and back) with adjustable hours per week and weeks per year — plus per-rate pages from $15 to $75 an hour with 2026 after-tax estimates." />
        <link rel="canonical" href="https://upaman.com/hourly" />
        <meta property="og:title" content="Hourly to Salary Calculator | Upaman" />
        <meta property="og:description" content="Convert hourly pay to yearly salary and back, then see what each rate really pays after 2026 taxes." />
        <meta property="og:url" content="https://upaman.com/hourly" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <section className="py-8 sm:py-12">
        <Container>
          <article className="mx-auto max-w-[820px] text-[1.02rem] leading-relaxed text-ink-soft dark:text-slate-300">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              Hourly to Salary Calculator
            </h1>
            <p className="mt-3">
              Convert an hourly wage into a yearly, monthly, and weekly salary — or a salary back into a true hourly
              rate. The default is the standard 2,080-hour year (40 hours × 52 weeks); change the hours or weeks to
              match your real schedule.
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

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {mode === 'toSalary' ? (
                  <div>
                    <label className={labelCls} htmlFor="hourly-rate">Hourly rate ($)</label>
                    <input id="hourly-rate" type="number" min="0" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} />
                  </div>
                ) : (
                  <div>
                    <label className={labelCls} htmlFor="annual-salary">Annual salary ($)</label>
                    <input id="annual-salary" type="number" min="0" step="1000" value={salary} onChange={(e) => setSalary(e.target.value)} className={inputCls} />
                  </div>
                )}
                <div>
                  <label className={labelCls} htmlFor="hours-week">Hours per week</label>
                  <input id="hours-week" type="number" min="1" max="80" value={hours} onChange={(e) => setHours(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="weeks-year">Paid weeks per year</label>
                  <input id="weeks-year" type="number" min="1" max="52" value={weeks} onChange={(e) => setWeeks(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-4 dark:border-brand-800/60 dark:from-brand-900/30 dark:to-emerald-900/20">
                {mode === 'toSalary' ? (
                  <>
                    <div className="text-sm text-ink-muted dark:text-slate-400">${Number(rate) || 0}/hour × {hours} h/week × {weeks} weeks, before taxes</div>
                    <div className="mt-1 font-display text-2xl font-bold text-ink dark:text-white">{usd(annual)} / year</div>
                    <div className="mt-1 text-sm text-ink-soft dark:text-slate-300">
                      ≈ <strong>{usd(annual / 12)}</strong>/month · <strong>{usd((Number(rate) || 0) * (Number(hours) || 0) * 2)}</strong> bi-weekly · <strong>{usd((Number(rate) || 0) * (Number(hours) || 0))}</strong>/week
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-ink-muted dark:text-slate-400">{usd(Number(salary) || 0)}/year ÷ ({hours} h/week × {weeks} weeks), before taxes</div>
                    <div className="mt-1 font-display text-2xl font-bold text-ink dark:text-white">${hourlyFromSalary.toFixed(2)} / hour</div>
                    <div className="mt-1 text-sm text-ink-soft dark:text-slate-300">
                      ≈ <strong>{usd((Number(salary) || 0) / 12)}</strong>/month · <strong>{usd((Number(salary) || 0) / 26)}</strong> bi-weekly
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm text-ink-muted dark:text-slate-500">
              These are gross figures. For take-home pay after 2026 federal, FICA, and state taxes, use the{' '}
              <a href="/us-paycheck-calculator" className={linkCls}>US Paycheck Calculator</a>.
            </p>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">What each rate earns per year</h2>
            <p className="mt-3">
              Every page below shows the full-time annual figure, part-time tables, overtime math, and a 2026 after-tax
              estimate for that rate:
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {HOURLY_RATES.map((r) => (
                <a key={r} href={`/hourly/${r}`} className="rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-center text-sm font-semibold text-brand-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-brand-300 dark:hover:bg-slate-800">
                  ${r}/hr
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
              <a href="/after-taxes" className={linkCls}>salary after taxes by state</a> ·{' '}
              <a href="/paycheck" className={linkCls}>take-home pay by state</a> ·{' '}
              <a href="/guides/how-to-read-your-paycheck" className={linkCls}>how to read your paycheck</a> ·{' '}
              <a href="/guides/50-30-20-rule" className={linkCls}>the 50/30/20 budget rule</a> ·{' '}
              <a href="/widgets" className={linkCls}>embed this converter on your site</a>
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}
