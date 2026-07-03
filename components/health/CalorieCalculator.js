import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import EEATPanel from '../calculator/EEATPanel';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { GoalBars, HealthDisclaimer, RelatedHealthLinks } from '../health/HealthKit';
import {
  bmrMifflin, tdeeFromBmr, ACTIVITY_LEVELS, CALORIE_GOALS,
  kgFromLb, cmFromFtIn
} from '../../utils/healthCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'How many calories should I eat a day?', answer: 'It depends on your size, age, sex, and activity. This calculator estimates your maintenance calories (TDEE) with the Mifflin-St Jeor equation, then shows targets for losing or gaining weight at a safe pace of about 0.25–0.45 kg (0.5–1 lb) per week.' },
  { question: 'What is TDEE?', answer: 'Total Daily Energy Expenditure is the total calories you burn per day: your resting metabolism (BMR) multiplied by an activity factor from 1.2 (sedentary) to 1.9 (extra active). Eating at TDEE maintains your weight.' },
  { question: 'How big a calorie deficit is safe?', answer: 'A deficit of 250–500 kcal/day (about 0.25–0.45 kg or 0.5–1 lb per week) is a widely used, sustainable pace. Most adults should not eat below roughly 1,200 kcal (women) or 1,500 kcal (men) without medical supervision.' },
  { question: 'Why do my results differ from my fitness tracker?', answer: 'All estimates use population equations; trackers add sensor data with their own error margins. Treat any number as a starting point — track your intake and weight for 2–3 weeks and adjust by 100–200 kcal as needed.' }
];

const CalorieCalculator = () => {
  const [units, setUnits] = useState('imperial');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('8');
  const [lbs, setLbs] = useState('160');
  const [cm, setCm] = useState('173');
  const [kg, setKg] = useState('72');
  const [activity, setActivity] = useState('light');

  const { heightCm, weightKg } = useMemo(() => (
    units === 'imperial'
      ? { heightCm: cmFromFtIn(parseFloat(feet) || 0, parseFloat(inches) || 0), weightKg: kgFromLb(parseFloat(lbs) || 0) }
      : { heightCm: parseFloat(cm) || 0, weightKg: parseFloat(kg) || 0 }
  ), [units, feet, inches, lbs, cm, kg]);

  const ageN = parseFloat(age) || 0;
  const valid = heightCm > 0 && weightKg > 0 && ageN > 0;
  const bmr = valid ? bmrMifflin({ sex, weightKg, heightCm, age: ageN }) : null;
  const tdee = bmr ? tdeeFromBmr(bmr, activity) : null;

  const goalItems = tdee
    ? CALORIE_GOALS.map((g) => ({
        label: g.label,
        value: Math.max(tdee + g.delta, 0),
        tone: g.tone,
        emphasis: g.id === 'maintain'
      }))
    : [];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Calorie Calculator (TDEE)',
    url: 'https://upaman.com/calorie-calculator',
    description: 'Estimate your daily calorie needs with the Mifflin-St Jeor equation — maintenance (TDEE) plus targets for weight loss and gain.',
    applicationCategory: 'HealthApplication',
    priceCurrency: 'USD',
    featureList: ['Mifflin-St Jeor BMR', 'TDEE with 5 activity levels', 'Weight loss and gain calorie targets', 'US and metric units']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Health Calculators', item: 'https://upaman.com/health-calculators' },
    { name: 'Calorie Calculator', item: 'https://upaman.com/calorie-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>Calorie Calculator | Daily Calorie Needs & TDEE | Upaman</title>
        <meta name="description" content="Free calorie calculator: estimate your daily calorie needs (TDEE) with the Mifflin-St Jeor equation, plus calorie targets for losing or gaining weight at a safe pace." />
        <meta name="keywords" content="calorie calculator, TDEE calculator, daily calorie needs, maintenance calories, calories to lose weight, calorie deficit calculator" />
        <link rel="canonical" href="https://upaman.com/calorie-calculator" />
        <meta property="og:title" content="Calorie Calculator | Daily Calorie Needs & TDEE | Upaman" />
        <meta property="og:description" content="Estimate maintenance calories and safe weight-loss or gain targets." />
        <meta property="og:url" content="https://upaman.com/calorie-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Calorie Calculator (TDEE) | Upaman" />
        <meta name="twitter:description" content="Daily calorie needs with Mifflin-St Jeor plus loss/gain targets." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Health · Energy"
        title="Calorie Calculator"
        subtitle="Estimate the calories you burn per day (TDEE) and get daily targets for maintaining, losing, or gaining weight — using the Mifflin-St Jeor equation."
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
                <SelectField id="cal-sex" label="Sex" value={sex} onChange={setSex} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
                <NumberField id="cal-age" label="Age" suffix="yrs" value={age} onChange={setAge} min={15} max={90} />
              </div>
              {units === 'imperial' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField id="cal-ft" label="Height (feet)" value={feet} onChange={setFeet} min={1} max={8} />
                    <NumberField id="cal-in" label="Height (inches)" value={inches} onChange={setInches} min={0} max={11} />
                  </div>
                  <NumberField id="cal-lb" label="Weight" suffix="lb" value={lbs} onChange={setLbs} min={1} />
                </>
              ) : (
                <>
                  <NumberField id="cal-cm" label="Height" suffix="cm" value={cm} onChange={setCm} min={50} max={250} />
                  <NumberField id="cal-kg" label="Weight" suffix="kg" value={kg} onChange={setKg} min={1} />
                </>
              )}
              <SelectField
                id="cal-activity"
                label="Activity level"
                value={activity}
                onChange={setActivity}
                options={ACTIVITY_LEVELS.map((l) => ({ value: l.value, label: l.label }))}
              />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {tdee && bmr ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Maintenance (TDEE)" value={`${Math.round(tdee).toLocaleString()} kcal`} emphasis />
                  <ResultStat label="Resting metabolism (BMR)" value={`${Math.round(bmr).toLocaleString()} kcal`} />
                </div>
                <Card className="p-5">
                  <h3 className="mb-4 font-display text-base font-bold text-ink dark:text-white">Daily calorie targets by goal</h3>
                  <GoalBars items={goalItems} />
                  <p className="mt-4 text-xs leading-relaxed text-ink-muted dark:text-slate-500">
                    ±500 kcal/day ≈ 0.45 kg (1 lb) per week. Avoid prolonged intakes below ~1,200 kcal (women) / ~1,500 kcal (men) without medical supervision.
                  </p>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your details to estimate daily calorie needs.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the Calorie Calculator"
          description="Estimate maintenance calories and goal targets in four steps."
          steps={[
            { name: 'Enter your basics', text: 'Choose units, then enter your sex, age, height, and weight.' },
            { name: 'Pick an activity level', text: 'Be honest — most desk workers are sedentary or lightly active.' },
            { name: 'Read your TDEE', text: 'The maintenance number is what you burn on a typical day.' },
            { name: 'Choose a goal target', text: 'Use the animated goal bars to pick a safe deficit or surplus for losing or gaining weight.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Calorie Calculator FAQ</h2>
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
            scope="Mifflin-St Jeor estimate with standard activity multipliers; individual metabolism varies — adjust from real-world tracking."
            sources={[
              { label: 'Mifflin et al., 1990 (Am J Clin Nutr)', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
              { label: 'NIH — Body Weight Planner', url: 'https://www.niddk.nih.gov/bwp' }
            ]}
          />
        </div>

        <RelatedHealthLinks current="/calorie-calculator" />

        <HealthDisclaimer />
      </CalcLayout>
    </>
  );
};

export default CalorieCalculator;
