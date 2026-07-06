import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import EEATPanel from '../calculator/EEATPanel';
import { editorialProfiles } from '../../utils/editorialProfiles';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { HealthDisclaimer, RelatedHealthLinks } from '../health/HealthKit';
import {
  idealWeightsKg, healthyWeightRangeKg, lbFromKg, cmFromFtIn
} from '../../utils/healthCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'Which ideal weight formula should I trust?', answer: 'None is "correct" — all four are height-based estimates developed for clinical use (the Devine formula was designed for drug dosing, not aesthetics). Treat the spread across formulas, together with the healthy-BMI range, as a reasonable zone rather than a single target number.' },
  { question: 'Why is my ideal weight different from what I expect?', answer: 'These formulas only use height and sex. They ignore muscle mass, frame size, age, and body composition — a muscular person can be perfectly healthy well above every formula value. Body-fat percentage is a better lens for athletic builds.' },
  { question: 'What is the healthy BMI weight range?', answer: 'It is the weight span that keeps your body mass index between 18.5 and 24.9 — the WHO "normal weight" band for adults. It is a population screening range, not an individual prescription.' },
  { question: 'Do these formulas work for children or very short adults?', answer: 'No. They were derived for adults, and below 5 feet (152 cm) the per-inch adjustments stop being meaningful — this calculator falls back to the formula base value there. For children and teens, growth-chart percentiles are the right tool.' },
  { question: 'Why do the four formulas disagree?', answer: 'Each was fitted in a different era for a different purpose — Hamwi (1964) for quick clinical estimates, Devine (1974) for drug dosing, Robinson and Miller (1983) as statistical refinements. They all share the same structure (a base weight at 5 feet plus an amount per inch) but with different constants, so they fan out as height increases.' },
  { question: 'Why is the formula value below the middle of the healthy BMI range?', answer: 'The formulas were designed as clinical reference weights and tend to sit in the lower half of the BMI 18.5–24.9 band, especially for taller people. Being above a formula value but inside the BMI range is not "overweight" by any medical definition.' },
  { question: 'Should I diet down to my ideal weight number?', answer: 'Not on the strength of a height formula alone. If you are inside the healthy BMI range, composition (body-fat percentage, waist) says more than another kilogram either way; if you are outside it, pick a sustainable rate of change and a target zone rather than a single number.' }
];

const IdealWeightCalculator = () => {
  const [units, setUnits] = useState('imperial');
  const [sex, setSex] = useState('male');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  const [cm, setCm] = useState('178');

  const heightCm = useMemo(() => (
    units === 'imperial' ? cmFromFtIn(parseFloat(feet) || 0, parseFloat(inches) || 0) : parseFloat(cm) || 0
  ), [units, feet, inches, cm]);

  const valid = heightCm >= 130 && heightCm <= 230;
  const formulas = valid ? idealWeightsKg({ sex, heightCm }) : null;
  const range = valid ? healthyWeightRangeKg(heightCm) : null;
  const avgKg = formulas ? formulas.reduce((s, f) => s + f.kg, 0) / formulas.length : null;

  const fmt = (kgVal) => (units === 'imperial'
    ? `${Math.round(lbFromKg(kgVal))} lb`
    : `${Math.round(kgVal)} kg`);

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Ideal Weight Calculator',
    url: 'https://upaman.com/ideal-weight-calculator',
    description: 'Ideal body weight from the Devine, Robinson, Miller, and Hamwi formulas, plus the healthy BMI weight range for your height.',
    applicationCategory: 'HealthApplication',
    priceCurrency: 'USD',
    featureList: ['Devine, Robinson, Miller, Hamwi formulas', 'Healthy BMI range', 'US and metric units']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Health Calculators', item: 'https://upaman.com/health-calculators' },
    { name: 'Ideal Weight Calculator', item: 'https://upaman.com/ideal-weight-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>Ideal Weight Calculator | Devine, Robinson, Miller, Hamwi | Upaman</title>
        <meta name="description" content="Free ideal weight calculator: your estimated ideal body weight from the four standard formulas (Devine, Robinson, Miller, Hamwi) plus the healthy BMI range for your height." />
        <meta name="keywords" content="ideal weight calculator, ideal body weight, healthy weight for height, Devine formula, IBW calculator" />
        <link rel="canonical" href="https://upaman.com/ideal-weight-calculator" />
        <meta property="og:title" content="Ideal Weight Calculator | Upaman" />
        <meta property="og:description" content="Ideal body weight from four research formulas plus the healthy BMI range." />
        <meta property="og:url" content="https://upaman.com/ideal-weight-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ideal Weight Calculator | Upaman" />
        <meta name="twitter:description" content="Devine, Robinson, Miller, and Hamwi formulas with a healthy BMI range." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Health · Weight"
        title="Ideal Weight Calculator"
        subtitle="See your estimated ideal body weight from the four standard formulas, alongside the healthy BMI range for your height — a zone, not a single magic number."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <Tabs
                tabs={[{ id: 'imperial', label: 'US units' }, { id: 'metric', label: 'Metric' }]}
                active={units}
                onChange={setUnits}
              />
              <SelectField id="iw-sex" label="Sex" value={sex} onChange={setSex} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
              {units === 'imperial' ? (
                <div className="grid grid-cols-2 gap-3">
                  <NumberField id="iw-ft" label="Height (feet)" value={feet} onChange={setFeet} min={4} max={7} />
                  <NumberField id="iw-in" label="Height (inches)" value={inches} onChange={setInches} min={0} max={11} />
                </div>
              ) : (
                <NumberField id="iw-cm" label="Height" suffix="cm" value={cm} onChange={setCm} min={130} max={230} />
              )}
              <p className="text-xs leading-relaxed text-ink-muted dark:text-slate-400">
                Formulas are defined for adults 5&nbsp;ft (152&nbsp;cm) and taller; below that the base value is shown.
              </p>
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {formulas && range ? (
              <>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <p className="text-sm text-ink-muted dark:text-slate-400">Healthy BMI range (18.5–24.9) for your height</p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink dark:text-white">
                    {fmt(range.min)} – {fmt(range.max)}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft dark:text-slate-300">
                    Formula average: <strong>{fmt(avgKg)}</strong>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {formulas.map((f) => (
                    <ResultStat key={f.id} label={f.label} value={fmt(f.kg)} emphasis={f.id === 'devine'} />
                  ))}
                </div>
                <Card className="p-5 text-sm leading-relaxed text-ink-muted dark:text-slate-400">
                  {formulas.map((f) => (
                    <p key={f.id} className="mt-1 first:mt-0"><strong className="text-ink dark:text-white">{f.label}:</strong> {f.note}</p>
                  ))}
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter a height between 4′3″ and 7′7″ (130–230 cm) to see your estimates.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the Ideal Weight Calculator"
          description="Get a realistic weight zone in three steps."
          steps={[
            { name: 'Enter sex and height', text: 'Choose US or metric units, then your sex and height.' },
            { name: 'Compare the four formulas', text: 'Devine, Robinson, Miller, and Hamwi each give a slightly different estimate — the spread is the point.' },
            { name: 'Anchor on the healthy range', text: 'Use the BMI 18.5–24.9 range as the evidence-based zone, and treat formula values as reference points inside or near it.' }
          ]}
        />

        <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Where &ldquo;ideal weight&rdquo; formulas actually come from</h2>
          <p className="mt-3">
            None of the four formulas on this page was invented to tell you what to weigh. Hamwi (1964) was a
            quick bedside rule for clinical nutrition; Devine (1974) was created to dose medications whose safe
            amounts scale with lean body size, and it remains embedded in pharmacology today; Robinson and Miller
            (both 1983) were statistical refinements once better population data existed. They share one
            structure — a base weight at 5 feet, plus a fixed amount per inch above it — which is why they agree
            reasonably well at average heights and fan out at the extremes. Understanding that lineage is the key
            to using them: they are clinical reference points, not aesthetic targets, and the spread between them
            is honest uncertainty, not a bug.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Reading the spread: a worked example</h3>
          <p className="mt-3">
            For a woman of 5&prime;6&Prime;, the four formulas land at roughly 129&ndash;135 lb
            (58.7&ndash;61.3 kg) — Hamwi lowest, Miller highest, Devine and Robinson nearly identical at 131 lb.
            The healthy-BMI range for the same height is far wider: about{' '}
            <strong className="text-ink dark:text-white">115&ndash;154 lb (52&ndash;70 kg)</strong>. That
            comparison is the single most useful thing on this page. The formulas cluster in the lower-middle of
            the evidence-based band, so someone at 150 lb and 5&prime;6&Prime; is 15&ndash;20 lb &ldquo;above
            ideal&rdquo; by formula yet comfortably inside the range population studies associate with good
            health. For a man of 5&prime;10&Prime; the same pattern holds: formulas from 155 to 165 lb, with
            Hamwi highest for men and Miller lowest — the ordering flips between sexes because each author fitted
            different per-inch increments.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">What height alone cannot see</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">Composition.</strong> A 5&prime;10&Prime; man at 180 lb
              could be 12% body fat or 28% — same formula verdict, opposite health picture. The{' '}
              <a href="/body-fat-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">body fat calculator</a>{' '}
              distinguishes the two with a tape measure.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Frame.</strong> Wrist and shoulder breadth vary enough
              that two healthy people of one height can differ by 10 kg of bone and muscle alone. Older clinical
              practice added ±10% for small or large frames — a crude but honest admission of the formulas&rsquo; limits.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Age.</strong> Some muscle loss with age is normal, and
              modest extra weight in older adults is not associated with the same risks as in the young. The
              formulas apply one number to a 25-year-old and a 75-year-old.
            </li>
          </ul>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Turning a zone into a plan</h3>
          <p className="mt-3">
            The practical reading order: start with the healthy-BMI range as the evidence-based zone (the{' '}
            <a href="/bmi-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">BMI calculator</a>{' '}
            shows where your current weight sits in it), use the formula cluster as a reference point within that
            zone, and let composition — not the scale — arbitrate the last few kilograms. If a change is
            warranted, the{' '}
            <a href="/calorie-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">calorie calculator</a>{' '}
            converts a target rate of loss or gain into a daily energy budget. A target zone of a few kilograms,
            approached at 0.25&ndash;0.45 kg a week, survives real life far better than a single magic number —
            and the difference between weighing 131 lb and 137 lb at 5&prime;6&Prime; is invisible to every
            health outcome that matters.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Ideal Weight Calculator FAQ</h2>
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
            author={editorialProfiles.researchTeam}
            reviewer="Health & Wellness Review Desk (Upaman)"
            reviewedOn="July 3, 2026"
            scope="Height-based population formulas (Devine 1974; Robinson 1983; Miller 1983; Hamwi 1964) and the WHO adult BMI range; none account for body composition or frame size."
            sources={[
              { label: 'Pai & Paloucek, 2000 — the Devine formula (Ann Pharmacother)', url: 'https://pubmed.ncbi.nlm.nih.gov/10981254/' },
              { label: 'WHO — BMI classification', url: 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight' }
            ]}
          />
        </div>

        <RelatedHealthLinks current="/ideal-weight-calculator" />

        <HealthDisclaimer />
      </CalcLayout>
    </>
  );
};

export default IdealWeightCalculator;
