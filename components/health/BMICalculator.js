import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import EEATPanel from '../calculator/EEATPanel';
import { NumberField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { BandScale, HealthDisclaimer, toneText, RelatedHealthLinks } from '../health/HealthKit';
import {
  calculateBMI, bmiCategory, BMI_BANDS, healthyWeightRangeKg,
  kgFromLb, lbFromKg, cmFromFtIn
} from '../../utils/healthCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'What is a healthy BMI?', answer: 'For most adults, a BMI between 18.5 and 24.9 is considered a healthy weight by the WHO and CDC. Below 18.5 is underweight, 25–29.9 is overweight, and 30 or above falls in the obesity range.' },
  { question: 'How is BMI calculated?', answer: 'BMI = weight in kilograms divided by height in metres squared (kg/m²). In US units the equivalent formula is 703 × weight in pounds ÷ height in inches squared.' },
  { question: 'Is BMI accurate for everyone?', answer: 'BMI is a useful screening tool but not a diagnosis. It does not distinguish muscle from fat, so very muscular people can read as overweight, and it may underestimate body fat in older adults. Athletes, pregnant women, and children should use other measures.' },
  { question: 'What should I do if my BMI is outside the healthy range?', answer: 'Treat it as a prompt to look deeper, not a verdict. Pair BMI with waist circumference and body-fat percentage, and discuss the full picture with a healthcare professional before changing diet or exercise.' },
  { question: 'Why does BMI divide by height squared?', answer: 'The formula dates to the statistician Adolphe Quetelet in the 1830s, who found weight scales roughly with height squared across adult populations. It is an empirical fit, not a law of physiology — one reason BMI reads slightly high for very tall people and slightly low for very short people.' },
  { question: 'Are the BMI cut-offs different for Asian populations?', answer: 'The WHO notes that health risks associated with weight begin at lower BMI values in many Asian populations, and suggests action points of 23 (increased risk) and 27.5 (high risk) instead of 25 and 30. If this applies to you, read the standard categories conservatively.' },
  { question: 'Is BMI useful while building muscle?', answer: 'Not on its own. Resistance training can raise BMI while body fat falls, which BMI reads as movement toward "overweight". Track waist measurement and body-fat percentage alongside weight during a recomposition phase — direction matters more than the single number.' }
];

const BMICalculator = () => {
  const [units, setUnits] = useState('imperial');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('8');
  const [lbs, setLbs] = useState('160');
  const [cm, setCm] = useState('173');
  const [kg, setKg] = useState('72');

  const { heightCm, weightKg } = useMemo(() => (
    units === 'imperial'
      ? { heightCm: cmFromFtIn(parseFloat(feet) || 0, parseFloat(inches) || 0), weightKg: kgFromLb(parseFloat(lbs) || 0) }
      : { heightCm: parseFloat(cm) || 0, weightKg: parseFloat(kg) || 0 }
  ), [units, feet, inches, lbs, cm, kg]);

  const bmi = useMemo(() => calculateBMI(weightKg, heightCm), [weightKg, heightCm]);
  const category = bmi ? bmiCategory(bmi) : null;
  const range = heightCm ? healthyWeightRangeKg(heightCm) : null;

  const fmtWeight = (valueKg) =>
    units === 'imperial' ? `${Math.round(lbFromKg(valueKg))} lb` : `${valueKg.toFixed(1)} kg`;

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'BMI Calculator',
    url: 'https://upaman.com/bmi-calculator',
    description: 'Free BMI calculator for adults with metric and US units, WHO weight categories, and your healthy weight range.',
    applicationCategory: 'HealthApplication',
    priceCurrency: 'USD',
    featureList: ['BMI in metric or US units', 'WHO weight category', 'Healthy weight range for your height', 'Animated BMI scale']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Health Calculators', item: 'https://upaman.com/health-calculators' },
    { name: 'BMI Calculator', item: 'https://upaman.com/bmi-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>BMI Calculator | Body Mass Index for Adults (US & Metric) | Upaman</title>
        <meta name="description" content="Free BMI calculator: enter height and weight in US or metric units to get your body mass index, WHO weight category, and the healthy weight range for your height." />
        <meta name="keywords" content="BMI calculator, body mass index calculator, BMI chart, healthy weight calculator, calculate BMI, BMI for adults" />
        <link rel="canonical" href="https://upaman.com/bmi-calculator" />
        <meta property="og:title" content="BMI Calculator | Body Mass Index for Adults | Upaman" />
        <meta property="og:description" content="Calculate your BMI in US or metric units and see your WHO weight category and healthy weight range." />
        <meta property="og:url" content="https://upaman.com/bmi-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BMI Calculator | Upaman" />
        <meta name="twitter:description" content="Free BMI calculator with WHO categories and healthy weight range." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Health · Body"
        title="BMI Calculator"
        subtitle="Check your body mass index in US or metric units, see your WHO weight category, and find the healthy weight range for your height."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <Tabs
                tabs={[{ id: 'imperial', label: 'US units' }, { id: 'metric', label: 'Metric' }]}
                active={units}
                onChange={setUnits}
              />
              {units === 'imperial' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField id="bmi-ft" label="Height (feet)" value={feet} onChange={setFeet} min={1} max={8} />
                    <NumberField id="bmi-in" label="Height (inches)" value={inches} onChange={setInches} min={0} max={11} />
                  </div>
                  <NumberField id="bmi-lb" label="Weight" suffix="lb" value={lbs} onChange={setLbs} min={1} />
                </>
              ) : (
                <>
                  <NumberField id="bmi-cm" label="Height" suffix="cm" value={cm} onChange={setCm} min={50} max={250} />
                  <NumberField id="bmi-kg" label="Weight" suffix="kg" value={kg} onChange={setKg} min={1} />
                </>
              )}
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-sm dark:border-teal-800/60 dark:bg-teal-900/20">
                <p className="font-semibold text-teal-800 dark:text-teal-300">BMI = kg / m²</p>
                <p className="mt-0.5 text-teal-700 dark:text-teal-400">WHO adult categories. For ages 20+ — children and teens use age-specific percentiles.</p>
              </div>
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {bmi && category ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Your BMI" value={bmi.toFixed(1)} emphasis />
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400">Category</p>
                    <p className={`mt-1 font-display text-xl font-bold tracking-tight ${toneText[category.tone]}`}>{category.label}</p>
                  </div>
                </div>

                <Card className="p-5">
                  <h3 className="mb-5 font-display text-base font-bold text-ink dark:text-white">Where you sit on the BMI scale</h3>
                  <BandScale bands={BMI_BANDS} value={bmi} />
                </Card>

                {range ? (
                  <Card className="p-5">
                    <h3 className="font-display text-base font-bold text-ink dark:text-white">Healthy weight range for your height</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                      At your height, a BMI of 18.5–24.9 corresponds to roughly{' '}
                      <strong className="text-emerald-700 dark:text-emerald-400">{fmtWeight(range.min)} – {fmtWeight(range.max)}</strong>.
                      {bmi >= 25 && range ? <> Reaching the top of that range would mean a change of about <strong>{fmtWeight(weightKg - range.max)}</strong>.</> : null}
                      {bmi < 18.5 && range ? <> Reaching the bottom of that range would mean gaining about <strong>{fmtWeight(range.min - weightKg)}</strong>.</> : null}
                    </p>
                  </Card>
                ) : null}
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your height and weight to see your BMI.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the BMI Calculator"
          description="Get your body mass index and weight category in seconds."
          steps={[
            { name: 'Pick your units', text: 'Switch between US units (feet, inches, pounds) and metric (centimetres, kilograms).' },
            { name: 'Enter height and weight', text: 'Type your current height and weight — the BMI updates instantly.' },
            { name: 'Read your category', text: 'See your BMI value, WHO weight category, and where you sit on the animated scale.' },
            { name: 'Check your healthy range', text: 'Compare your weight against the healthy range calculated for your height.' }
          ]}
        />

        <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">What BMI is good at — and what it quietly ignores</h2>
          <p className="mt-3">
            BMI survives as a screening tool for one reason: it costs nothing and needs only a scale and a tape
            measure. Clinicians, researchers, and insurers use it to triage — to decide whose weight deserves a
            closer look — not to diagnose anyone. Used the same way at home, it is genuinely useful. Used as a
            verdict on body composition, it misleads in predictable directions, and knowing those directions is
            worth more than the number itself.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Reading a real result</h3>
          <p className="mt-3">
            Maya is 5&prime;7&Prime; and weighs 172 lb. The calculator returns a BMI of 26.9 — inside the
            overweight band — and a healthy range for her height of roughly 118–159 lb. Three observations turn
            that from a label into a plan:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">The distance matters more than the category.</strong>{' '}
              She is 13 lb above the top of the healthy range — a modest gap. At a sustainable loss rate of 0.5–1
              lb a week, that is a three-to-six-month project, not a life overhaul. Someone at the same height
              weighing 220 lb faces a different problem needing different support.
            </li>
            <li>
              <strong className="text-ink dark:text-white">The number says nothing about what the 13 lb is.</strong>{' '}
              If Maya lifts weights four days a week, 26.9 may be entirely benign muscle. Her waist measurement
              answers that faster than the scale: central fat is the kind most associated with metabolic risk,
              which is why screening guidance pairs BMI with waist circumference rather than using either alone.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Trend beats snapshot.</strong> Day-to-day weight moves
              a few pounds with water, salt, and sleep. A weekly average, measured at the same time of day, is the
              signal; any single reading is mostly noise.
            </li>
          </ul>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Where the formula comes from, and why it bends at the edges</h3>
          <p className="mt-3">
            The index is nearly two centuries old — Adolphe Quetelet observed in the 1830s that adult weight
            scales roughly with the square of height. That empirical fit works well across populations and poorly
            at individual extremes: very tall people read slightly heavy, very short people slightly light, and
            the formula is blind to composition by construction. Muscle, bone density, and fat all weigh the same
            to it. The categories also assume a body-fat-to-BMI relationship derived largely from European
            populations; the WHO&rsquo;s guidance for many Asian populations moves the risk thresholds down to 23
            and 27.5, and older adults often carry higher risk at a &ldquo;normal&rdquo; BMI because muscle loss
            masks fat gain. Children use age-and-sex percentile charts, never the adult bands.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Picking the right measure for the question</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-[0.9rem]">
              <tbody>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white">Measure</th>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white">Answers</th>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white">Blind spot</th>
                </tr>
                {[
                  ['BMI', 'Is my weight unusual for my height?', 'Composition — muscle vs fat'],
                  ['Waist circumference', 'Am I carrying fat where it does harm?', 'Total body fat elsewhere'],
                  ['Waist-to-height ratio', 'Quick risk check (keep waist under half your height)', 'Less standardized cut-offs'],
                  ['Body-fat %', 'What is my weight actually made of?', 'Harder to measure accurately at home']
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} className="border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            The measures are complements, not competitors. A practical home stack: BMI for the big picture, waist
            for fat placement (the <a href="/body-fat-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">body fat calculator</a>{' '}
            estimates composition from tape measurements alone), and a weekly weight average for trend. If the
            goal becomes changing the number rather than reading it, the{' '}
            <a href="/calorie-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">calorie calculator</a>{' '}
            translates a target rate of loss or gain into a daily energy budget, and the{' '}
            <a href="/ideal-weight-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">ideal weight calculator</a>{' '}
            shows how the four classical formulas frame a target for your height.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">When BMI is the wrong tool entirely</h3>
          <p className="mt-3">
            Skip the adult bands during pregnancy, for anyone under 18, and in serious strength athletes — all
            three break the population assumptions the categories rest on. And if BMI sits far outside the healthy
            range in either direction, the useful next step is a clinician, not a stricter diet app: rapid
            unexplained weight change in particular is a medical question before it is a fitness one.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">BMI Calculator FAQ</h2>
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
            scope="BMI formula and WHO adult categories as published; a screening estimate, not a medical assessment."
            sources={[
              { label: 'WHO — Body mass index', url: 'https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/body-mass-index' },
              { label: 'CDC — About Adult BMI', url: 'https://www.cdc.gov/bmi/adult-calculator/index.html' }
            ]}
          />
        </div>

        <RelatedHealthLinks current="/bmi-calculator" />

        <HealthDisclaimer />
      </CalcLayout>
    </>
  );
};

export default BMICalculator;
