import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import EEATPanel from '../calculator/EEATPanel';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { HealthDisclaimer, RelatedHealthLinks, toneText } from '../health/HealthKit';
import { cn } from '../ui/cn';
import {
  bmrMifflin, tdeeFromBmr, ACTIVITY_LEVELS, CALORIE_GOALS,
  MACRO_PRESETS, macroGrams, kgFromLb, cmFromFtIn
} from '../../utils/healthCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'What are macros?', answer: 'Macronutrients are the three calorie-providing nutrient groups: protein and carbohydrate (4 kcal per gram each) and fat (9 kcal per gram). A macro plan splits your daily calorie target across the three.' },
  { question: 'Which macro split is best?', answer: 'For most goals, total calories and adequate protein matter far more than the exact carb/fat ratio. Pick the split you can sustain: balanced is the usual default; higher-protein splits help preserve muscle in a deficit.' },
  { question: 'How much protein do I need?', answer: 'The RDA is 0.8 g per kg of body weight for sedentary adults, but 1.2–2.2 g/kg is commonly recommended for active people or anyone dieting to retain lean mass. The high-protein preset lands in that territory for most bodies.' },
  { question: 'Are these calorie targets safe?', answer: 'The presets cap changes at ±500 kcal/day (about 1 lb per week), which is a conventional moderate pace. Very low-calorie diets should only be done under medical supervision.' }
];

const macroTones = { protein: 'emerald', carbs: 'amber', fat: 'sky' };

const MacroBar = ({ label, grams, pct, tone }) => (
  <div>
    <div className="flex items-baseline justify-between gap-2 text-sm">
      <span className="font-medium text-ink-soft dark:text-slate-300">{label} <span className="text-ink-muted dark:text-slate-500">({pct}%)</span></span>
      <span className={cn('font-display font-bold', toneText[tone])}>{Math.round(grams)} g</span>
    </div>
    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tone === 'emerald' ? 'bg-emerald-400' : tone === 'amber' ? 'bg-amber-400' : 'bg-sky-400')}
        style={{ width: `${pct}%` }}
      />
    </div>
  </div>
);

const MacroCalculator = () => {
  const [units, setUnits] = useState('imperial');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('8');
  const [lbs, setLbs] = useState('160');
  const [cm, setCm] = useState('173');
  const [kg, setKg] = useState('72');
  const [activity, setActivity] = useState('light');
  const [goal, setGoal] = useState('maintain');
  const [preset, setPreset] = useState('balanced');

  const { heightCm, weightKg } = useMemo(() => (
    units === 'imperial'
      ? { heightCm: cmFromFtIn(parseFloat(feet) || 0, parseFloat(inches) || 0), weightKg: kgFromLb(parseFloat(lbs) || 0) }
      : { heightCm: parseFloat(cm) || 0, weightKg: parseFloat(kg) || 0 }
  ), [units, feet, inches, lbs, cm, kg]);

  const ageN = parseFloat(age) || 0;
  const valid = heightCm > 0 && weightKg > 0 && ageN > 0;

  const goalDef = CALORIE_GOALS.find((g) => g.id === goal) || CALORIE_GOALS[2];
  const presetDef = MACRO_PRESETS.find((p) => p.id === preset) || MACRO_PRESETS[0];

  const tdee = valid ? tdeeFromBmr(bmrMifflin({ sex, weightKg, heightCm, age: ageN }), activity) : null;
  const target = tdee ? Math.max(1200, tdee + goalDef.delta) : null;
  const grams = target ? macroGrams(target, presetDef) : null;
  const proteinPerKg = grams && weightKg ? grams.protein / weightKg : null;

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Macro Calculator',
    url: 'https://upaman.com/macro-calculator',
    description: 'Daily protein, carb, and fat targets from your TDEE (Mifflin-St Jeor), your goal, and a choice of four macro splits.',
    applicationCategory: 'HealthApplication',
    priceCurrency: 'USD',
    featureList: ['TDEE-based calorie target', 'Lose/maintain/gain goals', '4 macro splits', 'Protein per kg check', 'US and metric units']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Health Calculators', item: 'https://upaman.com/health-calculators' },
    { name: 'Macro Calculator', item: 'https://upaman.com/macro-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>Macro Calculator | Daily Protein, Carbs & Fat Targets | Upaman</title>
        <meta name="description" content="Free macro calculator: daily protein, carb, and fat gram targets built from your TDEE (Mifflin-St Jeor), your goal, and your preferred split — balanced, low-carb, high-protein, or keto-style." />
        <meta name="keywords" content="macro calculator, macronutrient calculator, protein carbs fat calculator, IIFYM calculator, macro split" />
        <link rel="canonical" href="https://upaman.com/macro-calculator" />
        <meta property="og:title" content="Macro Calculator | Upaman" />
        <meta property="og:description" content="Daily protein, carb, and fat targets from your TDEE and goal." />
        <meta property="og:url" content="https://upaman.com/macro-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Macro Calculator | Upaman" />
        <meta name="twitter:description" content="Protein, carb, and fat gram targets for your goal." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Health · Nutrition"
        title="Macro Calculator"
        subtitle="Turn your daily calorie needs into concrete protein, carb, and fat targets — pick a goal and a split, and get gram numbers you can actually plan meals around."
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
                <SelectField id="mc-sex" label="Sex" value={sex} onChange={setSex} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
                <NumberField id="mc-age" label="Age" suffix="yrs" value={age} onChange={setAge} min={15} max={90} />
              </div>
              {units === 'imperial' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField id="mc-ft" label="Height (feet)" value={feet} onChange={setFeet} min={1} max={8} />
                    <NumberField id="mc-in" label="Height (inches)" value={inches} onChange={setInches} min={0} max={11} />
                  </div>
                  <NumberField id="mc-lb" label="Weight" suffix="lb" value={lbs} onChange={setLbs} min={1} />
                </>
              ) : (
                <>
                  <NumberField id="mc-cm" label="Height" suffix="cm" value={cm} onChange={setCm} min={50} max={250} />
                  <NumberField id="mc-kg" label="Weight" suffix="kg" value={kg} onChange={setKg} min={1} />
                </>
              )}
              <SelectField id="mc-activity" label="Activity level" value={activity} onChange={setActivity} options={ACTIVITY_LEVELS.map((l) => ({ value: l.value, label: l.label }))} />
              <SelectField id="mc-goal" label="Goal" value={goal} onChange={setGoal} options={CALORIE_GOALS.map((g) => ({ value: g.id, label: g.label }))} />
              <SelectField id="mc-preset" label="Macro split" value={preset} onChange={setPreset} options={MACRO_PRESETS.map((p) => ({ value: p.id, label: `${p.label} (${p.protein}P / ${p.carbs}C / ${p.fat}F)` }))} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {grams ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Daily calorie target" value={`${Math.round(target).toLocaleString()} kcal`} emphasis />
                  <ResultStat label="Maintenance (TDEE)" value={`${Math.round(tdee).toLocaleString()} kcal`} />
                </div>
                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">
                    Daily macros — {presetDef.label.toLowerCase()} split
                  </h3>
                  <div className="mt-4 space-y-3">
                    <MacroBar label="Protein" grams={grams.protein} pct={presetDef.protein} tone={macroTones.protein} />
                    <MacroBar label="Carbohydrates" grams={grams.carbs} pct={presetDef.carbs} tone={macroTones.carbs} />
                    <MacroBar label="Fat" grams={grams.fat} pct={presetDef.fat} tone={macroTones.fat} />
                  </div>
                  <p className="mt-4 text-sm text-ink-muted dark:text-slate-400">
                    That is <strong className="text-ink dark:text-white">{proteinPerKg.toFixed(1)} g protein per kg</strong> of
                    body weight{proteinPerKg < 1.2 && goal.startsWith('lose') ? ' — consider the high-protein split while dieting to protect lean mass' : ''}.
                  </p>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your details to get calorie and macro targets.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the Macro Calculator"
          description="Get gram targets in three steps."
          steps={[
            { name: 'Enter your details', text: 'Units, sex, age, height, weight, and how active a typical week is.' },
            { name: 'Pick a goal and split', text: 'Choose lose/maintain/gain and one of the four macro splits.' },
            { name: 'Plan meals from grams', text: 'Use the protein, carb, and fat gram targets — and the g/kg protein check — to build your day.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Macro Calculator FAQ</h2>
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
            reviewedOn="July 3, 2026"
            scope="Calorie target from Mifflin-St Jeor TDEE with a ±500 kcal/day cap; macro splits are common templates (4/4/9 kcal per gram), not individualized prescriptions."
            sources={[
              { label: 'Mifflin et al., 1990 (Am J Clin Nutr)', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
              { label: 'Protein intake review — Phillips & Van Loon, 2011', url: 'https://pubmed.ncbi.nlm.nih.gov/22150425/' }
            ]}
          />
        </div>

        <RelatedHealthLinks current="/macro-calculator" />

        <HealthDisclaimer />
      </CalcLayout>
    </>
  );
};

export default MacroCalculator;
