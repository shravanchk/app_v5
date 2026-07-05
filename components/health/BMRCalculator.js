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
  { question: 'How can I increase my BMR?', answer: 'Building muscle raises resting burn slightly (muscle is more metabolically active than fat), and adequate protein and sleep help preserve it. Crash dieting can lower BMR through adaptive thermogenesis.' },
  { question: 'Why do the two equations give different numbers?', answer: 'They were fitted to different study populations six years apart. Mifflin-St Jeor (1990) tends to run a little lower and validates better against modern adults; the revised Harris-Benedict (1984) often reads 30–80 kcal higher. If the two agree within ~5%, either is a reasonable starting point.' },
  { question: 'How much does BMR fall with age?', answer: 'In the Mifflin-St Jeor equation, exactly 5 kcal per year — about 50 kcal per decade at the same height and weight. Much of the real-world decline is muscle loss rather than age itself, which is why resistance training blunts it.' },
  { question: 'Is BMR the same as the "calories burned" my watch shows?', answer: 'No. Watches report total daily burn (BMR plus movement), estimated from sensors with their own error. BMR is only the resting component — compare your watch number with the activity-scaled figures in the table, not with BMR itself.' }
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

        <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">What your BMR actually pays for</h2>
          <p className="mt-3">
            Basal metabolic rate is the electricity bill of being alive: the energy spent keeping your heart
            beating, lungs breathing, brain thinking, kidneys filtering, and cells rebuilding — before you take a
            single step. For most adults it is the largest slice of daily energy use, typically 60&ndash;70%.
            Exercise, for all the attention it gets, is usually a far smaller line item. That proportion is why
            two people of different sizes can eat the same diet with opposite results, and why &ldquo;fast&rdquo;
            and &ldquo;slow&rdquo; metabolisms are mostly just bigger and smaller bodies with more or less lean
            tissue.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Reading the two equations side by side</h3>
          <p className="mt-3">
            For a 40-year-old woman, 165 cm and 68 kg, the calculator returns a Mifflin-St Jeor BMR of about{' '}
            <strong className="text-ink dark:text-white">1,350 kcal</strong> and a revised Harris-Benedict value
            of about <strong className="text-ink dark:text-white">1,414 kcal</strong>. The 64-kcal gap is not an
            error — it is two research teams fitting curves to different groups of people, in 1990 and 1984
            respectively. Mifflin-St Jeor validates better against measured resting energy in modern adults,
            which is why it is the headline number here and the equation behind our{' '}
            <a href="/calorie-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">calorie calculator</a>.
            When the two equations agree within about 5%, as they do for most inputs, you can treat their average
            as a sensible working figure. When they diverge sharply — very high or very low body weights — both
            are extrapolating beyond their study data, and real measurement (indirect calorimetry) is the only
            way to know.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">What moves the number — and by how much</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">Weight: 10 kcal per kg.</strong> Each kilogram of body
              mass adds 10 kcal to resting burn in Mifflin-St Jeor. Losing 5 kg lowers BMR by ~50 kcal/day — one
              reason weight loss slows as it proceeds.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Height: 6.25 kcal per cm.</strong> Taller bodies have
              more surface area and more tissue to run.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Age: −5 kcal per year.</strong> Our example at 30 would
              read 1,400 kcal and at 50, 1,300 kcal — a steady 50 kcal per decade at the same size. Much of the
              real decline is muscle loss, not aging itself, which is why the trend is partly negotiable.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Sex: a 166-kcal constant.</strong> The equations offset
              men and women by a fixed amount, standing in for average differences in lean mass. A muscular woman
              and a sedentary man of the same size can easily swap places in reality.
            </li>
          </ul>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">The mistake the activity table prevents</h3>
          <p className="mt-3">
            The most common misuse of a BMR number is eating at it. BMR is a floor, not a target: even a bedridden
            day burns more than basal, because digestion alone adds roughly 10% on top of everything else. Eating
            at BMR therefore creates an uncontrolled, usually aggressive deficit — our example would be
            under-eating by 270 kcal even on fully sedentary days (1,620 vs 1,350), and by more than 740 kcal on
            moderately active ones. The table above scales your BMR through the standard activity factors
            (1.2&ndash;1.9) precisely so you can see the range your real days fall into. Pick the level that
            matches your week honestly and treat <em>that</em> number as maintenance; deficits and surpluses
            should be measured from it, not from BMR.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Can you change your BMR?</h3>
          <p className="mt-3">
            Modestly, and in both directions. Resistance training adds muscle, and each kilogram of muscle burns
            roughly 10&ndash;13 kcal a day at rest — small per kilo, meaningful over years. In the other
            direction, prolonged severe dieting triggers adaptive thermogenesis: the body lowers resting burn
            beyond what the lost weight alone predicts, which is one reason crash diets rebound. Protein intake
            and sleep both help preserve lean mass while losing weight. If your goal is a target weight rather
            than a target burn, the{' '}
            <a href="/bmi-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">BMI calculator</a>{' '}
            frames a healthy range for your height, and the{' '}
            <a href="/body-fat-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">body fat calculator</a>{' '}
            tracks whether the weight you keep is the kind that burns.
          </p>
        </div>

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
