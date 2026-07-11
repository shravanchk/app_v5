import React from 'react';
import Link from 'next/link';
import {
  Scale, Flame, HeartPulse, Ruler, CalendarHeart, Baby, Weight, UtensilsCrossed, Droplets,
} from 'lucide-react';
import { CalcLayout } from '../calculator/CalcLayout';

const T = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
};

const cards = [
  { title: 'BMI Calculator', description: 'Body mass index with WHO categories and the healthy weight range for your height.', icon: Scale, path: '/bmi-calculator', tint: T.brand, tags: ['WHO categories', 'Healthy range', 'US & metric'] },
  { title: 'Calorie Calculator (TDEE)', description: 'Daily calorie needs with Mifflin-St Jeor, plus safe targets for losing or gaining weight.', icon: Flame, path: '/calorie-calculator', tint: T.amber, tags: ['TDEE', 'Goal targets', '5 activity levels'] },
  { title: 'BMR Calculator', description: 'Your resting calorie burn with two research equations and daily burn by activity level.', icon: HeartPulse, path: '/bmr-calculator', tint: T.rose, tags: ['Mifflin-St Jeor', 'Harris-Benedict', 'Resting burn'] },
  { title: 'Body Fat Calculator', description: 'Body-fat percentage from tape measurements with the US Navy method — no calipers needed.', icon: Ruler, path: '/body-fat-calculator', tint: T.emerald, tags: ['US Navy method', 'ACE categories', 'Lean mass'] },
  { title: 'Ideal Weight Calculator', description: 'Your ideal body weight from the four standard formulas plus the healthy BMI range.', icon: Weight, path: '/ideal-weight-calculator', tint: T.violet, tags: ['4 formulas', 'Healthy BMI range', 'US & metric'] },
  { title: 'Macro Calculator', description: 'Daily protein, carb, and fat gram targets from your TDEE, goal, and preferred split.', icon: UtensilsCrossed, path: '/macro-calculator', tint: T.amber, tags: ['4 splits', 'Protein per kg', 'Goal-based'] },
  { title: 'Water Intake Calculator', description: 'How much water to drink per day from your weight, exercise, and climate.', icon: Droplets, path: '/water-intake-calculator', tint: T.sky, tags: ['Liters, oz & cups', 'Exercise adjusted', 'Climate aware'] },
  { title: 'Period Calculator', description: 'Predict your next three periods, fertile window, and ovulation day on a cycle wheel.', icon: CalendarHeart, path: '/period-calculator', tint: T.violet, tags: ['Next 3 cycles', 'Fertile window', 'Ovulation'] },
  { title: 'Pregnancy Due Date Calculator', description: "Estimate your due date with Naegele's rule, gestational age today, and trimester milestones.", icon: Baby, path: '/pregnancy-due-date-calculator', tint: T.sky, tags: ["Naegele's rule", 'Trimester tracker', 'Milestones'] },
];

const HealthCalculatorsHub = () => {
  return (
    <CalcLayout eyebrow="Health & Fitness" title="Health Calculators Hub" subtitle="Free health and fitness calculators — body metrics, daily energy needs, and cycle planning — with clear methods and animated visuals.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, description, icon: Icon, path, tint, tags }) => (
          <Link
            key={path}
            href={path}
            className="group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70"
          >
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}>
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <h2 className="mt-4 font-display text-base font-semibold text-ink group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{title}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft dark:bg-slate-700 dark:text-slate-300">{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">
          How these calculators work — and which one to start with
        </h2>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft dark:text-slate-300">
          Every tool here runs a published, named method rather than a proprietary score, and each results page states
          which one. The body-metric tools form a sequence: the{' '}
          <Link href="/bmi-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">BMI calculator</Link>{' '}
          places weight-for-height into the WHO bands (a screening measure — it cannot tell muscle from fat), the{' '}
          <Link href="/body-fat-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">body fat calculator</Link>{' '}
          refines that with the US Navy circumference method using only a tape measure, and the{' '}
          <Link href="/ideal-weight-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">ideal weight calculator</Link>{' '}
          shows the four standard reference formulas side by side so you can see how much they disagree.
        </p>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft dark:text-slate-300">
          The energy tools build on each other in the same way: the{' '}
          <Link href="/bmr-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">BMR calculator</Link>{' '}
          estimates resting burn with Mifflin-St Jeor (Harris-Benedict shown for comparison), the{' '}
          <Link href="/calorie-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">calorie calculator</Link>{' '}
          multiplies that by an activity level to get TDEE with safe deficit or surplus targets, and the{' '}
          <Link href="/macro-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">macro calculator</Link>{' '}
          splits the result into protein, carb, and fat grams. The{' '}
          <Link href="/period-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">period</Link>{' '}
          and{' '}
          <Link href="/pregnancy-due-date-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">due date</Link>{' '}
          calculators use calendar methods (cycle averaging and Naegele&apos;s rule) — useful for planning, but not a
          contraceptive method and not a substitute for an ultrasound date.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-400">
          All results are general education, not medical advice. Formulas fitted to population averages can be off for
          any individual — athletes, older adults, and people with medical conditions especially — so confirm decisions
          that affect your health with a professional.
        </p>
      </section>
    </CalcLayout>
  );
};

export default HealthCalculatorsHub;
