import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import EEATPanel from '../calculator/EEATPanel';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { PulseBadge, HealthDisclaimer, RelatedHealthLinks } from '../health/HealthKit';
import {
  bmrMifflin, bmrHarrisBenedict, ACTIVITY_LEVELS, tdeeFromBmr,
  kgFromLb, cmFromFtIn
} from '../../utils/healthCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'What is BMR?', answer: 'Basal Metabolic Rate is the energy your body burns at complete rest — powering your heart, brain, breathing, and cell repair. It typically accounts for 60–70% of the calories most people burn in a day.' },
  { question: 'Which BMR formula is most accurate?', answer: 'The Mifflin-St Jeor equation (1990) is generally the most accurate population formula for modern adults and is preferred by the Academy of Nutrition and Dietetics. We also show the revised Harris-Benedict value for comparison.' },
  { question: 'Can I eat at my BMR to lose weight?', answer: 'Eating exactly at BMR creates an aggressive deficit for most people, since real days always burn more than resting. A moderate deficit below your TDEE (maintenance) is more sustainable — see our calorie calculator.' },
  { question: 'How can I increase my BMR?', answer: 'Building muscle raises resting burn slightly (muscle is more metabolically active than fat), and adequate protein and sleep help preserve it. Crash dieting can lower BMR through adaptive thermogenesis.' }
];

const BMRCalculator = () => {
  const [units, setUnits] = useState('imperial');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
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

  const ageN = parseFloat(age) || 0;
  const valid = heightCm > 0 && weightKg > 0 && ageN > 0;
  const inputs = { sex, weightKg, heightCm, age: ageN };
  const mifflin = valid ? bmrMifflin(inputs) : null;
  const harris = valid ? bmrHarrisBenedict(inputs) : null;

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'BMR Calculator',
    url: 'https://upaman.com/bmr-calculator',
    description: 'Calculate your Basal Metabolic Rate with the Mifflin-St Jeor and revised Harris-Benedict equations, plus daily burn at each activity level.',
    applicationCategory: 'HealthApplication',
    priceCurrency: 'USD',
    featureList: ['Mifflin-St Jeor BMR', 'Revised Harris-Benedict comparison', 'Daily burn by activity level', 'US and metric units']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Health Calculators', item: 'https://upaman.com/health-calculators' },
    { name: 'BMR Calculator', item: 'https://upaman.com/bmr-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>BMR Calculator | Basal Metabolic Rate (Mifflin-St Jeor) | Upaman</title>
        <meta name="description" content="Free BMR calculator: your basal metabolic rate with the Mifflin-St Jeor equation, a revised Harris-Benedict comparison, and daily calorie burn at every activity level." />
        <meta name="keywords" content="BMR calculator, basal metabolic rate calculator, Mifflin St Jeor calculator, resting metabolic rate, calories burned at rest" />
        <link rel="canonical" href="https://upaman.com/bmr-calculator" />
        <meta property="og:title" content="BMR Calculator | Basal Metabolic Rate | Upaman" />
        <meta property="og:description" content="Calculate your resting calorie burn with two research equations." />
        <meta property="og:url" content="https://upaman.com/bmr-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BMR Calculator | Upaman" />
        <meta name="twitter:description" content="Basal metabolic rate with Mifflin-St Jeor and Harris-Benedict." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Health · Energy"
        title="BMR Calculator"
        subtitle="Find the calories your body burns at complete rest, compare the two standard research equations, and see your daily burn at each activity level."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <Tabs
                tabs={[{ id: 'imperial', label: 'US units' }, { id: 'metric', label: 'Metric' }]}
                active={units}
                onChange={setUnits}
              />
              <div className="grid grid-cols-2 gap-3">
                <SelectField id="bmr-sex" label="Sex" value={sex} onChange={setSex} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
                <NumberField id="bmr-age" label="Age" suffix="yrs" value={age} onChange={setAge} min={15} max={90} />
              </div>
              {units === 'imperial' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField id="bmr-ft" label="Height (feet)" value={feet} onChange={setFeet} min={1} max={8} />
                    <NumberField id="bmr-in" label="Height (inches)" value={inches} onChange={setInches} min={0} max={11} />
                  </div>
                  <NumberField id="bmr-lb" label="Weight" suffix="lb" value={lbs} onChange={setLbs} min={1} />
                </>
              ) : (
                <>
                  <NumberField id="bmr-cm" label="Height" suffix="cm" value={cm} onChange={setCm} min={50} max={250} />
                  <NumberField id="bmr-kg" label="Weight" suffix="kg" value={kg} onChange={setKg} min={1} />
                </>
              )}
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {mifflin && harris ? (
              <>
                <PulseBadge
                  value={`${Math.round(mifflin).toLocaleString()} kcal / day`}
                  label="Your resting burn (Mifflin-St Jeor) — the energy your body uses just to keep you alive."
                />
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Mifflin-St Jeor" value={`${Math.round(mifflin).toLocaleString()} kcal`} emphasis />
                  <ResultStat label="Revised Harris-Benedict" value={`${Math.round(harris).toLocaleString()} kcal`} />
                </div>
                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Daily burn by activity level</h3>
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                    {ACTIVITY_LEVELS.map((l) => (
                      <div key={l.value} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-ink-soft dark:text-slate-300">{l.label}</span>
                        <span className="font-semibold text-ink dark:text-white">{Math.round(tdeeFromBmr(mifflin, l.value)).toLocaleString()} kcal</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your details to calculate your resting metabolic rate.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the BMR Calculator"
          description="Estimate your resting calorie burn in three steps."
          steps={[
            { name: 'Enter your details', text: 'Choose units, then enter sex, age, height, and weight.' },
            { name: 'Compare the equations', text: 'Read your Mifflin-St Jeor BMR (headline) alongside the revised Harris-Benedict value.' },
            { name: 'Scale to your day', text: 'Use the activity table to see roughly what you burn on sedentary through very active days.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">BMR Calculator FAQ</h2>
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
            scope="Population equations (Mifflin-St Jeor 1990; Roza & Shizgal 1984); individual BMR varies with body composition and genetics."
            sources={[
              { label: 'Mifflin et al., 1990 (Am J Clin Nutr)', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
              { label: 'Roza & Shizgal, 1984 (Am J Clin Nutr)', url: 'https://pubmed.ncbi.nlm.nih.gov/6741850/' }
            ]}
          />
        </div>

        <RelatedHealthLinks current="/bmr-calculator" />

        <HealthDisclaimer />
      </CalcLayout>
    </>
  );
};

export default BMRCalculator;
