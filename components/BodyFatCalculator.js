import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import EEATPanel from './calculator/EEATPanel';
import { NumberField, SelectField, Tabs } from './ui/Field';
import Card from './ui/Card';
import { BandScale, HealthDisclaimer, toneText } from './health/HealthKit';
import {
  bodyFatNavy, bodyFatCategory, BODY_FAT_BANDS,
  kgFromLb, cmFromFtIn, cmFromIn
} from '../utils/healthCalculations';
import { buildFaqSchema } from '../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/schema';

const FAQ = [
  { question: 'How does the US Navy body fat method work?', answer: 'It estimates body-fat percentage from circumference measurements — neck and waist for men; neck, waist, and hips for women — combined with height in a validated regression formula (Hodgdon & Beckett, 1984). It is accurate to within roughly ±3-4% for most people.' },
  { question: 'How do I measure correctly?', answer: 'Use a flexible tape, snug but not compressing the skin. Waist: at the navel for men, at the narrowest point for women. Neck: just below the larynx, sloping slightly down to the front. Hips (women): at the widest point. Measure relaxed, after exhaling.' },
  { question: 'What is a healthy body fat percentage?', answer: 'ACE guidelines: for men, 6–13% is athletic, 14–17% fitness, 18–24% average, and 25%+ obese. For women (who carry more essential fat), 14–20% is athletic, 21–24% fitness, 25–31% average, and 32%+ obese.' },
  { question: 'Is this more accurate than BMI?', answer: 'It answers a different question. BMI classifies weight for height; the Navy method estimates actual fat percentage, so it distinguishes a muscular person from an over-fat one. For lab-grade accuracy you would need DEXA or hydrostatic weighing.' }
];

const BodyFatCalculator = () => {
  const [units, setUnits] = useState('imperial');
  const [sex, setSex] = useState('male');
  // imperial inputs
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('8');
  const [neckIn, setNeckIn] = useState('15');
  const [waistIn, setWaistIn] = useState('34');
  const [hipIn, setHipIn] = useState('38');
  const [lbs, setLbs] = useState('160');
  // metric inputs
  const [cm, setCm] = useState('173');
  const [neckCmIn, setNeckCmIn] = useState('38');
  const [waistCmIn, setWaistCmIn] = useState('86');
  const [hipCmIn, setHipCmIn] = useState('97');
  const [kg, setKg] = useState('72');

  const m = useMemo(() => {
    if (units === 'imperial') {
      return {
        heightCm: cmFromFtIn(parseFloat(feet) || 0, parseFloat(inches) || 0),
        neckCm: cmFromIn(parseFloat(neckIn) || 0),
        waistCm: cmFromIn(parseFloat(waistIn) || 0),
        hipCm: cmFromIn(parseFloat(hipIn) || 0),
        weightKg: kgFromLb(parseFloat(lbs) || 0)
      };
    }
    return {
      heightCm: parseFloat(cm) || 0,
      neckCm: parseFloat(neckCmIn) || 0,
      waistCm: parseFloat(waistCmIn) || 0,
      hipCm: parseFloat(hipCmIn) || 0,
      weightKg: parseFloat(kg) || 0
    };
  }, [units, feet, inches, neckIn, waistIn, hipIn, lbs, cm, neckCmIn, waistCmIn, hipCmIn, kg]);

  const percent = useMemo(() => bodyFatNavy({ sex, ...m }), [sex, m]);
  const category = percent ? bodyFatCategory(percent, sex) : null;
  const bands = BODY_FAT_BANDS[sex];
  const fatMassKg = percent && m.weightKg ? (percent / 100) * m.weightKg : null;
  const leanMassKg = fatMassKg !== null ? m.weightKg - fatMassKg : null;
  const fmtMass = (valueKg) => (units === 'imperial' ? `${(valueKg * 2.2046226218).toFixed(1)} lb` : `${valueKg.toFixed(1)} kg`);

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Body Fat Calculator (US Navy Method)',
    url: 'https://upaman.com/body-fat-calculator',
    description: 'Estimate body-fat percentage from tape measurements with the validated US Navy circumference method, plus fat mass, lean mass, and ACE category.',
    applicationCategory: 'HealthApplication',
    priceCurrency: 'USD',
    featureList: ['US Navy circumference method', 'ACE body-fat categories', 'Fat mass and lean mass', 'US and metric units']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Health Calculators', item: 'https://upaman.com/health-calculators' },
    { name: 'Body Fat Calculator', item: 'https://upaman.com/body-fat-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>Body Fat Calculator | US Navy Method (Tape Measure) | Upaman</title>
        <meta name="description" content="Free body fat calculator using the US Navy circumference method: estimate body-fat percentage from neck, waist, and hip measurements, plus fat mass and lean mass." />
        <meta name="keywords" content="body fat calculator, body fat percentage calculator, navy method body fat, tape measure body fat, lean mass calculator" />
        <link rel="canonical" href="https://upaman.com/body-fat-calculator" />
        <meta property="og:title" content="Body Fat Calculator | US Navy Method | Upaman" />
        <meta property="og:description" content="Estimate body-fat percentage from tape measurements — no calipers needed." />
        <meta property="og:url" content="https://upaman.com/body-fat-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Body Fat Calculator | Upaman" />
        <meta name="twitter:description" content="US Navy method body-fat percentage with fat and lean mass." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Health · Body"
        title="Body Fat Calculator"
        subtitle="Estimate your body-fat percentage with the US Navy tape-measure method — no calipers or scales needed — plus your fat mass, lean mass, and ACE category."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <Tabs
                tabs={[{ id: 'imperial', label: 'US units' }, { id: 'metric', label: 'Metric' }]}
                active={units}
                onChange={setUnits}
              />
              <SelectField id="bf-sex" label="Sex" value={sex} onChange={setSex} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
              {units === 'imperial' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField id="bf-ft" label="Height (feet)" value={feet} onChange={setFeet} min={1} max={8} />
                    <NumberField id="bf-in" label="Height (inches)" value={inches} onChange={setInches} min={0} max={11} />
                  </div>
                  <NumberField id="bf-lb" label="Weight" suffix="lb" value={lbs} onChange={setLbs} min={1} hint="Used for fat-mass and lean-mass breakdown." />
                  <NumberField id="bf-neck" label="Neck circumference" suffix="in" value={neckIn} onChange={setNeckIn} min={5} step={0.25} hint="Just below the larynx." />
                  <NumberField id="bf-waist" label="Waist circumference" suffix="in" value={waistIn} onChange={setWaistIn} min={10} step={0.25} hint={sex === 'male' ? 'At the navel, relaxed.' : 'At the narrowest point.'} />
                  {sex === 'female' && (
                    <NumberField id="bf-hip" label="Hip circumference" suffix="in" value={hipIn} onChange={setHipIn} min={15} step={0.25} hint="At the widest point." />
                  )}
                </>
              ) : (
                <>
                  <NumberField id="bf-cm" label="Height" suffix="cm" value={cm} onChange={setCm} min={50} max={250} />
                  <NumberField id="bf-kg" label="Weight" suffix="kg" value={kg} onChange={setKg} min={1} hint="Used for fat-mass and lean-mass breakdown." />
                  <NumberField id="bf-neck-cm" label="Neck circumference" suffix="cm" value={neckCmIn} onChange={setNeckCmIn} min={15} step={0.5} hint="Just below the larynx." />
                  <NumberField id="bf-waist-cm" label="Waist circumference" suffix="cm" value={waistCmIn} onChange={setWaistCmIn} min={30} step={0.5} hint={sex === 'male' ? 'At the navel, relaxed.' : 'At the narrowest point.'} />
                  {sex === 'female' && (
                    <NumberField id="bf-hip-cm" label="Hip circumference" suffix="cm" value={hipCmIn} onChange={setHipCmIn} min={40} step={0.5} hint="At the widest point." />
                  )}
                </>
              )}
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {percent !== null && percent > 0 && category ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Body fat" value={`${percent.toFixed(1)}%`} emphasis />
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400">ACE category</p>
                    <p className={`mt-1 font-display text-xl font-bold tracking-tight ${toneText[category.tone]}`}>{category.label}</p>
                  </div>
                  {fatMassKg !== null && <ResultStat label="Fat mass" value={fmtMass(fatMassKg)} />}
                  {leanMassKg !== null && <ResultStat label="Lean mass" value={fmtMass(leanMassKg)} />}
                </div>
                <Card className="p-5">
                  <h3 className="mb-5 font-display text-base font-bold text-ink dark:text-white">
                    Where you sit ({sex === 'male' ? 'men' : 'women'}, ACE ranges)
                  </h3>
                  <BandScale bands={bands} value={percent} format={(v) => `${v.toFixed(1)}%`} />
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your measurements to estimate body-fat percentage. Waist must be larger than neck.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the Body Fat Calculator"
          description="Estimate body fat with just a tape measure."
          steps={[
            { name: 'Choose units and sex', text: 'The Navy formula differs for men and women (women add a hip measurement).' },
            { name: 'Measure your neck', text: 'Wrap the tape just below the larynx, sloping slightly down at the front.' },
            { name: 'Measure waist (and hips)', text: 'Men: at the navel. Women: narrowest waist point plus widest hip point. Keep the tape snug, not tight.' },
            { name: 'Read your result', text: 'See your body-fat percentage, ACE category on the animated scale, and your fat vs lean mass split.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Body Fat Calculator FAQ</h2>
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
            scope="US Navy circumference method (Hodgdon & Beckett, 1984) with ACE categories; ±3-4% typical error vs lab methods."
            sources={[
              { label: 'Hodgdon & Beckett, 1984 (Naval Health Research Center)', url: 'https://apps.dtic.mil/sti/citations/ADA143890' },
              { label: 'ACE — Percent Body Fat Norms', url: 'https://www.acefitness.org/resources/everyone/tools-calculators/percent-body-fat-calculator/' }
            ]}
          />
        </div>

        <HealthDisclaimer />
      </CalcLayout>
    </>
  );
};

export default BodyFatCalculator;
