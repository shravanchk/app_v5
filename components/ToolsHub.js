import React from 'react';
import Link from 'next/link';
import {
  CalendarDays, FlaskConical, BarChart3, Ruler, Braces, Percent, HandCoins,
} from 'lucide-react';
import { CalcLayout } from './calculator/CalcLayout';

const T = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
};

const cards = [
  { title: 'Percentage Calculator', description: 'Percent of a number, share of a whole, percent change, and increase/decrease — with formulas.', icon: Percent, path: '/percentage-calculator', tint: T.brand, tags: ['% of a number', '% change', 'Reverse %'] },
  { title: 'Tip Calculator', description: 'Tip, total, and per-person share with one-tap percents, bill splitting, and round-up.', icon: HandCoins, path: '/tip-calculator', tint: T.emerald, tags: ['Split the bill', '10–25% presets', 'US tipping guide'] },
  { title: 'Age Calculator', description: 'Find exact age in years, months, and days between any two dates.', icon: CalendarDays, path: '/age-calculator', tint: T.brand, tags: ['Years/months/days', 'Any two dates', 'Next birthday'] },
  { title: 'Scientific Calculator', description: 'Trigonometry, logarithms, powers, and constants for everyday and study use.', icon: FlaskConical, path: '/scientific-calculator', tint: T.violet, tags: ['Trig & log', 'Powers/roots', 'Constants'] },
  { title: 'Statistics Calculator', description: 'Compute mean, median, mode, variance, and standard deviation from a data set.', icon: BarChart3, path: '/statistics-calculator', tint: T.emerald, tags: ['Mean/median/mode', 'Variance', 'Std deviation'] },
  { title: 'Unit Converter', description: 'Convert length, weight, temperature, area, and more across common units.', icon: Ruler, path: '/unit-converter', tint: T.sky, tags: ['Length/weight', 'Temperature', 'Area & volume'] },
  { title: 'JSON Formatter', description: 'Format, validate, and minify JSON with clear error highlighting.', icon: Braces, path: '/json-tools', tint: T.amber, tags: ['Format', 'Validate', 'Minify'] },
];

const ToolsHub = () => {
  return (
    <CalcLayout eyebrow="Everyday Tools" title="Everyday Tools" subtitle="Handy region-agnostic utilities — age, scientific and statistics calculators, unit conversion, and JSON formatting. All free, no sign-up.">
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
    </CalcLayout>
  );
};

export default ToolsHub;
