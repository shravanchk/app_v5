import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import EEATPanel from '../calculator/EEATPanel';
import { NumberField } from '../ui/Field';
import Card from '../ui/Card';
import { CycleRing, HealthDisclaimer, RelatedHealthLinks } from '../health/HealthKit';
import { predictCycles } from '../../utils/healthCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const controlCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[0.95rem] text-ink ' +
  'shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 ' +
  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

const FAQ = [
  { question: 'How is my next period predicted?', answer: 'The calculator adds your average cycle length to the first day of your last period. A 28-day cycle starting June 1 predicts the next period on June 29. Predictions are estimates — real cycles naturally vary by a few days.' },
  { question: 'When is the fertile window?', answer: 'Ovulation typically happens about 14 days before the next period starts. Because sperm can survive up to five days, the fertile window spans roughly the five days before ovulation through one day after it.' },
  { question: 'What counts as a normal cycle?', answer: 'Cycles of 21–35 days with periods lasting 2–7 days are generally considered normal for adults. Consistently irregular, very heavy, or very painful periods are worth discussing with a doctor or gynaecologist.' },
  { question: 'Can I use this as contraception?', answer: 'No. Calendar-based predictions are not a reliable contraceptive method — ovulation timing varies cycle to cycle. Use this tool for planning and awareness, not birth control.' }
];

const fmt = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const fmtShort = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const PeriodCalculator = () => {
  const [lastStart, setLastStart] = useState('');
  const [cycleLen, setCycleLen] = useState('28');
  const [periodLen, setPeriodLen] = useState('5');

  const cycleLength = Math.min(Math.max(parseInt(cycleLen, 10) || 0, 0), 60);
  const periodLength = Math.min(Math.max(parseInt(periodLen, 10) || 0, 0), 12);
  const valid = lastStart && cycleLength >= 21 && cycleLength <= 45 && periodLength >= 1 && periodLength <= 10;

  const cycles = useMemo(() => {
    if (!valid) return null;
    return predictCycles({
      lastPeriodStart: new Date(`${lastStart}T00:00:00`),
      cycleLength,
      periodLength,
      count: 3
    });
  }, [valid, lastStart, cycleLength, periodLength]);

  const ovulationDay = cycleLength - 14;

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Period Calculator',
    url: 'https://upaman.com/period-calculator',
    description: 'Predict your next three periods, fertile window, and ovulation day from your last period date and average cycle length.',
    applicationCategory: 'HealthApplication',
    priceCurrency: 'USD',
    featureList: ['Next 3 period predictions', 'Fertile window estimate', 'Ovulation day estimate', 'Animated cycle wheel']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Health Calculators', item: 'https://upaman.com/health-calculators' },
    { name: 'Period Calculator', item: 'https://upaman.com/period-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>Period Calculator | Next Period, Ovulation & Fertile Window | Upaman</title>
        <meta name="description" content="Free period calculator: predict your next three periods, estimated ovulation day, and fertile window from your last period date and average cycle length." />
        <meta name="keywords" content="period calculator, next period calculator, ovulation calculator, fertile window calculator, menstrual cycle calculator, period tracker" />
        <link rel="canonical" href="https://upaman.com/period-calculator" />
        <meta property="og:title" content="Period Calculator | Next Period & Ovulation | Upaman" />
        <meta property="og:description" content="Predict your next periods, ovulation day, and fertile window." />
        <meta property="og:url" content="https://upaman.com/period-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Period Calculator | Upaman" />
        <meta name="twitter:description" content="Next period, ovulation, and fertile window predictions." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Health · Cycle"
        title="Period Calculator"
        subtitle="Predict your next three periods, estimated ovulation day, and fertile window — from just your last period date and average cycle length."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="pd-start" className="mb-1.5 block text-sm font-medium text-ink-soft dark:text-slate-300">First day of your last period</label>
                <input id="pd-start" type="date" value={lastStart} onChange={(e) => setLastStart(e.target.value)} className={controlCls} />
              </div>
              <NumberField id="pd-cycle" label="Average cycle length" suffix="days" value={cycleLen} onChange={setCycleLen} min={21} max={45} hint="From day 1 of one period to day 1 of the next. Typical: 21–35 days." />
              <NumberField id="pd-period" label="Period length" suffix="days" value={periodLen} onChange={setPeriodLen} min={1} max={10} hint="How many days bleeding usually lasts. Typical: 2–7 days." />
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-sm dark:border-teal-800/60 dark:bg-teal-900/20">
                <p className="font-semibold text-teal-800 dark:text-teal-300">Estimates, not guarantees</p>
                <p className="mt-0.5 text-teal-700 dark:text-teal-400">Cycles naturally vary by a few days. Not a contraceptive method.</p>
              </div>
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {cycles ? (
              <>
                <Card className="p-5">
                  <h3 className="mb-4 font-display text-base font-bold text-ink dark:text-white">Your cycle at a glance</h3>
                  <CycleRing cycleLength={cycleLength} periodLength={periodLength} ovulationDay={ovulationDay} />
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Next period starts" value={fmtShort(cycles[0].periodStart)} emphasis />
                  <ResultStat label="Estimated ovulation" value={fmtShort(cycles[0].ovulation)} />
                </div>
                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Next 3 cycles</h3>
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                    {cycles.map((c, i) => (
                      <div key={i} className="py-3 text-sm">
                        <p className="font-semibold text-ink dark:text-white">{fmt(c.periodStart)}</p>
                        <p className="mt-1 text-ink-muted dark:text-slate-400">
                          Period: {fmtShort(c.periodStart)} – {fmtShort(c.periodEnd)} · Fertile window: {fmtShort(c.fertileStart)} – {fmtShort(c.fertileEnd)} · Ovulation ≈ {fmtShort(c.ovulation)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your last period start date (cycle length 21–45 days) to see predictions.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the Period Calculator"
          description="Predict upcoming periods and your fertile window."
          steps={[
            { name: 'Enter your last period date', text: 'Pick the first day of your most recent period.' },
            { name: 'Set your cycle length', text: 'Average days from the start of one period to the start of the next (28 if unsure).' },
            { name: 'Set your period length', text: 'How many days bleeding usually lasts.' },
            { name: 'Read the cycle wheel', text: 'See period days, fertile window, and ovulation on the wheel, plus dates for your next three cycles.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Period Calculator FAQ</h2>
          <div className="mt-4 grid gap-3">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <EEATPanel
            author="Upaman Research Team"
            reviewer="Health & Wellness Review Desk (Upaman)"
            reviewedOn="July 2, 2026"
            scope="Calendar-method estimates (ovulation ≈ 14 days before next period); real cycles vary — not a contraceptive or diagnostic tool."
            sources={[
              { label: 'ACOG — The Menstrual Cycle', url: 'https://www.acog.org/womens-health/faqs/your-menstrual-cycle' },
              { label: 'NHS — Periods and fertility', url: 'https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/' }
            ]}
          />
        </div>

        <RelatedHealthLinks current="/period-calculator" />

        <HealthDisclaimer>
          This calculator gives calendar-based estimates for planning and awareness. It is not a contraceptive method and not medical advice — consult a doctor about irregular cycles or fertility questions.
        </HealthDisclaimer>
      </CalcLayout>
    </>
  );
};

export default PeriodCalculator;
