import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Droplets } from 'lucide-react';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import EEATPanel from '../calculator/EEATPanel';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { HealthDisclaimer, RelatedHealthLinks } from '../health/HealthKit';
import { waterIntakeMl, WATER_CLIMATES, kgFromLb } from '../../utils/healthCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'How much water should I drink a day?', answer: 'A common dietetic rule of thumb is about 35 ml per kg of body weight from drinks, plus extra for exercise and heat. For reference, the US National Academies put adequate total water intake (including ~20% from food) at about 3.7 L/day for men and 2.7 L/day for women.' },
  { question: 'Do coffee and tea count toward my intake?', answer: 'Yes. Caffeinated drinks are mildly diuretic but still hydrate on balance, so they count toward daily fluid. Alcohol does not — it dehydrates.' },
  { question: 'Can I drink too much water?', answer: 'Yes — drinking far beyond thirst over a short period can dilute blood sodium (hyponatremia), which is dangerous. Spread intake through the day and let thirst and pale-yellow urine be your guide.' },
  { question: 'Why does exercise change the target?', answer: 'Sweat losses during exercise commonly run 0.5–2 L per hour. The calculator adds roughly 350 ml per 30 minutes of activity — weigh-ins before and after long sessions give a more personal number.' },
  { question: 'Is the "8 glasses a day" rule true?', answer: 'It has no clear scientific origin, but at 8 × 240 ml it lands near 1.9 L — a reasonable ballpark for a smaller adult and low for a larger or active one. A weight-based estimate personalizes what the folk rule approximates.' },
  { question: 'Does drinking more water help with weight loss or skin?', answer: 'Evidence is modest: water before meals can slightly reduce intake in some studies, and correcting genuine dehydration improves skin appearance and energy — but extra water beyond needs is simply excreted. Hydration fixes deficits; it is not a supplement.' },
  { question: 'How do I know if I am drinking enough?', answer: 'The two best everyday signals are thirst and urine colour — pale yellow suggests adequate hydration, dark amber suggests you are behind. Persistent headaches, fatigue, and constipation are also common mild-dehydration flags.' }
];

const WaterIntakeCalculator = () => {
  const [units, setUnits] = useState('imperial');
  const [lbs, setLbs] = useState('160');
  const [kg, setKg] = useState('72');
  const [exercise, setExercise] = useState('30');
  const [climate, setClimate] = useState('temperate');

  const weightKg = useMemo(() => (
    units === 'imperial' ? kgFromLb(parseFloat(lbs) || 0) : parseFloat(kg) || 0
  ), [units, lbs, kg]);

  const ml = waterIntakeMl({ weightKg, exerciseMinPerDay: parseFloat(exercise) || 0, climate });
  const liters = ml ? ml / 1000 : null;
  const oz = ml ? ml / 29.5735 : null;
  const cups = ml ? ml / 240 : null;

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Water Intake Calculator',
    url: 'https://upaman.com/water-intake-calculator',
    description: 'Estimate daily drinking-water needs from body weight, exercise, and climate, in liters, ounces, and cups.',
    applicationCategory: 'HealthApplication',
    priceCurrency: 'USD',
    featureList: ['Weight-based baseline', 'Exercise adjustment', 'Hot-climate adjustment', 'Liters, ounces, and cups']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Health Calculators', item: 'https://upaman.com/health-calculators' },
    { name: 'Water Intake Calculator', item: 'https://upaman.com/water-intake-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>Water Intake Calculator | How Much Water Per Day | Upaman</title>
        <meta name="description" content="Free water intake calculator: how much water to drink per day based on your body weight, daily exercise, and climate — in liters, ounces, and cups." />
        <meta name="keywords" content="water intake calculator, how much water should I drink, daily water intake, hydration calculator, water per day" />
        <link rel="canonical" href="https://upaman.com/water-intake-calculator" />
        <meta property="og:title" content="Water Intake Calculator | Upaman" />
        <meta property="og:description" content="Daily water needs from weight, exercise, and climate." />
        <meta property="og:url" content="https://upaman.com/water-intake-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Water Intake Calculator | Upaman" />
        <meta name="twitter:description" content="How much water to drink per day, personalized." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Health · Hydration"
        title="Water Intake Calculator"
        subtitle="A personalized daily drinking-water estimate from your body weight, exercise, and climate — with the result in liters, ounces, and cups."
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
                <NumberField id="wi-lb" label="Weight" suffix="lb" value={lbs} onChange={setLbs} min={1} />
              ) : (
                <NumberField id="wi-kg" label="Weight" suffix="kg" value={kg} onChange={setKg} min={1} />
              )}
              <NumberField id="wi-ex" label="Exercise per day" suffix="min" value={exercise} onChange={setExercise} min={0} max={300} />
              <SelectField id="wi-climate" label="Climate" value={climate} onChange={setClimate} options={WATER_CLIMATES.map((c) => ({ value: c.value, label: c.label }))} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {liters ? (
              <>
                <div className="flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50/60 p-5 dark:border-sky-900/60 dark:bg-sky-950/30">
                  <span className="motion-safe:animate-gc-float inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300">
                    <Droplets className="h-7 w-7" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-bold text-ink dark:text-white">{liters.toFixed(1)} liters / day</p>
                    <p className="text-sm text-ink-muted dark:text-slate-400">Estimated drinking water — food typically adds another ~20% of total water.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <ResultStat label="Fluid ounces" value={`${Math.round(oz)} oz`} />
                  <ResultStat label="Cups (240 ml)" value={`${Math.round(cups)} cups`} />
                  <ResultStat label="500 ml bottles" value={`${(liters * 2).toFixed(1)}`} />
                </div>
                <Card className="p-5 text-sm leading-relaxed text-ink-muted dark:text-slate-400">
                  <p>
                    <strong className="text-ink dark:text-white">Reference:</strong> the US National Academies put adequate{' '}
                    <em>total</em> daily water (drinks + food) at about 3.7 L for men and 2.7 L for women. Thirst and
                    pale-yellow urine are the best day-to-day signals; needs rise with heat, altitude, illness,
                    pregnancy, and breastfeeding.
                  </p>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your weight to estimate your daily water needs.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the Water Intake Calculator"
          description="Get a daily hydration target in three steps."
          steps={[
            { name: 'Enter your weight', text: 'The baseline is about 35 ml of drinking water per kg of body weight.' },
            { name: 'Add exercise and climate', text: 'Daily activity minutes add roughly 350 ml per 30 minutes; hot climates add ~500 ml.' },
            { name: 'Spread it through the day', text: 'Use the liters, ounces, or cups figure as a pacing guide — not something to drink in one sitting.' }
          ]}
        />

        <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">How the estimate is built — and how seriously to take it</h2>
          <p className="mt-3">
            Unlike calories, hydration has no precise personal equation, because the body defends its water
            balance aggressively on its own: kidneys can concentrate or dilute urine across a nearly tenfold
            range, and thirst is a genuinely reliable signal in healthy adults. What a calculator can do is give
            you a sensible pacing target. This one starts from a common dietetic rule — about{' '}
            <strong className="text-ink dark:text-white">35 ml of drinking water per kilogram of body weight</strong> —
            then adds roughly 350 ml per 30 minutes of exercise and a flat 500 ml for hot climates. A 70-kg
            person on a temperate desk day gets 2.5 L; add 45 minutes of training and a hot climate and it rises
            to about 3.5 L. Treat those as the centre of a comfortable range, not a compliance quota.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Why weight-based beats one-size rules</h3>
          <p className="mt-3">
            The famous &ldquo;8 glasses a day&rdquo; has never been traced to a study, and its arithmetic (about
            1.9 L) shows the problem with any flat rule: it is roughly right for a 55-kg adult and clearly light
            for a 95-kg one, whose estimate here runs above 3.3 L before any exercise. Bodies are mostly water —
            around 60% by weight — and both metabolic water turnover and sweat capacity scale with size. The
            official reference values take a different route to a similar place: the US National Academies put
            adequate <em>total</em> water at ~3.7 L/day for men and ~2.7 L for women, but that includes the
            ~20% of water arriving in food (fruit, vegetables, rice, curries, soups). Subtract the food share and
            the drinking-water portion lands close to what the 35 ml/kg rule produces for average weights — two
            independent methods agreeing is about as good as hydration science gets.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">What counts, what doesn&rsquo;t, and the myth about coffee</h3>
          <p className="mt-3">
            All non-alcoholic fluid counts: water, milk, tea, coffee, buttermilk, juice, even the water in a
            watermelon. The idea that caffeinated drinks dehydrate is a misreading of old research — caffeine is
            mildly diuretic, but the fluid in the cup more than covers the loss, and regular drinkers develop
            tolerance to the effect anyway. Alcohol is the genuine exception: it suppresses the hormone that
            tells kidneys to retain water, which is why a night of drinking ends in net loss. Sugary drinks
            hydrate too; their problem is the calorie payload, not the water. If a target from this page pushes
            you toward more plain water and less of those, that is the estimate doing double duty for the
            calorie budget in the{' '}
            <a href="/calorie-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">calorie calculator</a>.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Pacing, over-drinking, and when the rules change</h3>
          <p className="mt-3">
            Spread intake across the day — a glass with each meal and one between covers most of a sedentary
            target — and front-load around exercise rather than gulping afterwards. More is not better past the
            target: drinking litres beyond thirst in a short window can dilute blood sodium (hyponatremia), a
            genuine medical emergency seen in marathoners who over-hydrate, which is why endurance guidance now
            says &ldquo;drink to thirst&rdquo; during events. For sessions over an hour, weighing before and
            after gives your personal sweat rate — each missing kilogram is a litre to replace, ideally with
            electrolytes. And the healthy-adult assumptions break down in pregnancy and breastfeeding (needs
            rise), illness with fever or diarrhoea (rise sharply), and kidney or heart conditions (fluid may be
            medically restricted) — in those cases the number that matters comes from a clinician, not a
            calculator. For the bigger picture your weight itself feeds this estimate; the{' '}
            <a href="/bmi-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">BMI calculator</a>{' '}
            shows where that input sits for your height.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Water Intake Calculator FAQ</h2>
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
            scope="Rule-of-thumb estimate (35 ml/kg + exercise and climate adjustments) for healthy adults; medical conditions, medications, pregnancy, and endurance events change fluid needs."
            sources={[
              { label: 'National Academies — Dietary Reference Intakes for Water (2005)', url: 'https://nap.nationalacademies.org/catalog/10925/dietary-reference-intakes-for-water-potassium-sodium-chloride-and-sulfate' },
              { label: 'CDC — Water and Healthier Drinks', url: 'https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html' }
            ]}
          />
        </div>

        <RelatedHealthLinks current="/water-intake-calculator" />

        <HealthDisclaimer />
      </CalcLayout>
    </>
  );
};

export default WaterIntakeCalculator;
