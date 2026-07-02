import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import EEATPanel from './calculator/EEATPanel';
import { NumberField, Tabs } from './ui/Field';
import Card from './ui/Card';
import { BandScale, HealthDisclaimer, toneText, RelatedHealthLinks } from './health/HealthKit';
import {
  calculateBMI, bmiCategory, BMI_BANDS, healthyWeightRangeKg,
  kgFromLb, lbFromKg, cmFromFtIn
} from '../utils/healthCalculations';
import { buildFaqSchema } from '../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/schema';

const FAQ = [
  { question: 'What is a healthy BMI?', answer: 'For most adults, a BMI between 18.5 and 24.9 is considered a healthy weight by the WHO and CDC. Below 18.5 is underweight, 25–29.9 is overweight, and 30 or above falls in the obesity range.' },
  { question: 'How is BMI calculated?', answer: 'BMI = weight in kilograms divided by height in metres squared (kg/m²). In US units the equivalent formula is 703 × weight in pounds ÷ height in inches squared.' },
  { question: 'Is BMI accurate for everyone?', answer: 'BMI is a useful screening tool but not a diagnosis. It does not distinguish muscle from fat, so very muscular people can read as overweight, and it may underestimate body fat in older adults. Athletes, pregnant women, and children should use other measures.' },
  { question: 'What should I do if my BMI is outside the healthy range?', answer: 'Treat it as a prompt to look deeper, not a verdict. Pair BMI with waist circumference and body-fat percentage, and discuss the full picture with a healthcare professional before changing diet or exercise.' }
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
