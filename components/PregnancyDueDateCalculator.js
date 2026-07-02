import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import EEATPanel from './calculator/EEATPanel';
import { NumberField, Tabs } from './ui/Field';
import Card from './ui/Card';
import { TrimesterTrack, HealthDisclaimer } from './health/HealthKit';
import { dueDateFromLMP, dueDateFromConception, gestationalAge, addDays } from '../utils/healthCalculations';
import { buildFaqSchema } from '../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/schema';

const controlCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[0.95rem] text-ink ' +
  'shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 ' +
  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

const FAQ = [
  { question: 'How is the due date calculated?', answer: "Naegele's rule: 280 days (40 weeks) from the first day of your last menstrual period, adjusted for your cycle length. From a known conception date it is 266 days (38 weeks). Only about 4-5% of babies arrive exactly on the due date — most are born within two weeks either side." },
  { question: 'How accurate is a due date from LMP?', answer: 'It is a solid planning estimate when cycles are regular. A first-trimester dating ultrasound is more accurate and your provider may adjust the date based on it — the scan takes precedence over calendar math.' },
  { question: 'When does each trimester start?', answer: 'First trimester: weeks 1–13. Second: weeks 14–27. Third: week 28 to birth. Counting starts from the first day of the last period, so "week 4" is usually around when a period is first missed.' },
  { question: 'What if my cycles are irregular?', answer: 'Calendar rules assume ovulation ~14 days before the next period, so irregular cycles reduce accuracy. If your cycles vary a lot, rely on the dating ultrasound rather than this estimate.' }
];

const fmt = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const fmtShort = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const PregnancyDueDateCalculator = () => {
  const [method, setMethod] = useState('lmp');
  const [dateStr, setDateStr] = useState('');
  const [cycleLen, setCycleLen] = useState('28');

  const cycleLength = parseInt(cycleLen, 10) || 28;

  const result = useMemo(() => {
    if (!dateStr) return null;
    const input = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(input.getTime()) || input > new Date()) return null;

    const dueDate = method === 'lmp' ? dueDateFromLMP(input, cycleLength) : dueDateFromConception(input);
    // Normalize to an equivalent LMP so gestational age works for both methods.
    const lmpEquivalent = method === 'lmp' ? input : addDays(dueDate, -280);
    const age = gestationalAge(lmpEquivalent);
    if (age.totalDays < 0 || age.totalDays > 320) return null;

    return {
      dueDate,
      age,
      trimester: age.weeks < 14 ? 1 : age.weeks < 28 ? 2 : 3,
      milestones: [
        { label: 'End of 1st trimester (week 13)', date: addDays(lmpEquivalent, 13 * 7) },
        { label: 'Anatomy scan window (~week 20)', date: addDays(lmpEquivalent, 20 * 7) },
        { label: '3rd trimester begins (week 28)', date: addDays(lmpEquivalent, 28 * 7) },
        { label: 'Full term begins (week 39)', date: addDays(lmpEquivalent, 39 * 7) }
      ]
    };
  }, [dateStr, method, cycleLength]);

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Pregnancy Due Date Calculator',
    url: 'https://upaman.com/pregnancy-due-date-calculator',
    description: "Estimate your due date with Naegele's rule from your last period or conception date, with gestational age, trimester tracker, and key milestones.",
    applicationCategory: 'HealthApplication',
    priceCurrency: 'USD',
    featureList: ["Naegele's rule with cycle adjustment", 'Conception-date method', 'Gestational age today', 'Trimester timeline and milestones']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Health Calculators', item: 'https://upaman.com/health-calculators' },
    { name: 'Pregnancy Due Date Calculator', item: 'https://upaman.com/pregnancy-due-date-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>Pregnancy Due Date Calculator | Naegele&apos;s Rule & Trimesters | Upaman</title>
        <meta name="description" content="Free due date calculator: estimate your baby's due date from your last period or conception date, see gestational age today, trimester progress, and key milestones." />
        <meta name="keywords" content="due date calculator, pregnancy calculator, pregnancy due date, gestational age calculator, trimester calculator, when is my baby due" />
        <link rel="canonical" href="https://upaman.com/pregnancy-due-date-calculator" />
        <meta property="og:title" content="Pregnancy Due Date Calculator | Upaman" />
        <meta property="og:description" content="Estimate your due date, gestational age, and trimester milestones." />
        <meta property="og:url" content="https://upaman.com/pregnancy-due-date-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pregnancy Due Date Calculator | Upaman" />
        <meta name="twitter:description" content="Due date, gestational age, and trimester milestones." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Health · Pregnancy"
        title="Pregnancy Due Date Calculator"
        subtitle="Estimate your due date from your last period or conception date, see how far along you are today, and track trimester milestones."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <Tabs
                tabs={[{ id: 'lmp', label: 'Last period' }, { id: 'conception', label: 'Conception date' }]}
                active={method}
                onChange={setMethod}
              />
              <div>
                <label htmlFor="dd-date" className="mb-1.5 block text-sm font-medium text-ink-soft dark:text-slate-300">
                  {method === 'lmp' ? 'First day of your last period' : 'Conception date'}
                </label>
                <input id="dd-date" type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={controlCls} />
              </div>
              {method === 'lmp' && (
                <NumberField id="dd-cycle" label="Average cycle length" suffix="days" value={cycleLen} onChange={setCycleLen} min={21} max={45} hint="Naegele's rule is adjusted by (cycle − 28) days." />
              )}
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-sm dark:border-teal-800/60 dark:bg-teal-900/20">
                <p className="font-semibold text-teal-800 dark:text-teal-300">Ultrasound wins</p>
                <p className="mt-0.5 text-teal-700 dark:text-teal-400">A first-trimester dating scan is more accurate — your provider&apos;s date takes precedence.</p>
              </div>
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {result ? (
              <>
                <Card className="border-brand-200 bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white dark:border-brand-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Estimated due date</p>
                  <p className="mt-1 font-display text-2xl font-bold leading-tight">{fmt(result.dueDate)}</p>
                  <p className="mt-1 text-sm text-white/85">40 weeks from the equivalent last period — most babies arrive within 2 weeks either side.</p>
                </Card>
                <Card className="p-5">
                  <h3 className="mb-6 font-display text-base font-bold text-ink dark:text-white">You are here</h3>
                  <TrimesterTrack weeks={result.age.weeks} days={result.age.days} />
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Gestational age today" value={`${result.age.weeks}w ${result.age.days}d`} emphasis />
                  <ResultStat label="Current trimester" value={`${result.trimester}${['st', 'nd', 'rd'][result.trimester - 1]}`} />
                </div>
                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Key milestones</h3>
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                    {result.milestones.map((mi) => (
                      <div key={mi.label} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-ink-soft dark:text-slate-300">{mi.label}</span>
                        <span className="font-semibold text-ink dark:text-white">{fmtShort(mi.date)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your {method === 'lmp' ? 'last period start date' : 'conception date'} to estimate the due date.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the Pregnancy Due Date Calculator"
          description="Estimate your due date and trimester progress."
          steps={[
            { name: 'Pick a method', text: 'Use the first day of your last period (most common) or a known conception date.' },
            { name: 'Enter the date', text: 'For the period method, also set your average cycle length for a more precise estimate.' },
            { name: 'Read your due date', text: "See the Naegele's-rule due date and how far along you are today on the trimester tracker." },
            { name: 'Note the milestones', text: 'Key dates — end of first trimester, anatomy scan window, third trimester, and full term.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Due Date Calculator FAQ</h2>
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
            scope="Naegele's rule with cycle adjustment (or conception + 266 days); a dating ultrasound is more accurate and takes precedence."
            sources={[
              { label: 'ACOG — Methods for Estimating the Due Date', url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date' },
              { label: 'NHS — Pregnancy week-by-week', url: 'https://www.nhs.uk/pregnancy/week-by-week/' }
            ]}
          />
        </div>

        <HealthDisclaimer>
          Due dates are planning estimates — only about 1 in 20 babies arrives on the exact date. Always follow your healthcare provider&apos;s dating and advice.
        </HealthDisclaimer>
      </CalcLayout>
    </>
  );
};

export default PregnancyDueDateCalculator;
