import React from 'react';
import { HeartPulse } from 'lucide-react';
import { cn } from '../ui/cn';

// Small animated, dark-aware visuals shared by the health calculators.
// All motion is CSS transitions (respond to result changes) or motion-safe
// keyframes, so reduced-motion users get static-but-correct visuals.

export type Tone = 'sky' | 'teal' | 'emerald' | 'amber' | 'rose';

const toneBg: Record<Tone, string> = {
  sky: 'bg-sky-400',
  teal: 'bg-teal-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400'
};

export const toneText: Record<Tone, string> = {
  sky: 'text-sky-600 dark:text-sky-400',
  teal: 'text-teal-600 dark:text-teal-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  rose: 'text-rose-600 dark:text-rose-400'
};

// ---------------------------------------------------------------- BandScale
// Colour-banded scale (BMI, body fat) with a marker that slides to the value.
type Band = { label: string; min: number; max: number; tone: Tone };

export function BandScale({
  bands,
  value,
  format = (v: number) => v.toFixed(1)
}: {
  bands: Band[];
  value: number | null;
  format?: (v: number) => string;
}) {
  const min = bands[0].min;
  const max = bands[bands.length - 1].max;
  const clamped = value === null ? null : Math.min(Math.max(value, min), max);
  const pct = clamped === null ? 0 : ((clamped - min) / (max - min)) * 100;

  return (
    <div>
      <div className="relative pt-7">
        {value !== null ? (
          <div
            className="absolute top-0 -translate-x-1/2 transition-[left] duration-700 ease-out"
            style={{ left: `${pct}%` }}
          >
            <span className="rounded-md bg-ink px-1.5 py-0.5 font-display text-xs font-bold text-white dark:bg-white dark:text-ink">
              {format(value)}
            </span>
            <div className="mx-auto h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-ink dark:border-t-white" />
          </div>
        ) : null}
        <div className="flex h-3 overflow-hidden rounded-full">
          {bands.map((b) => (
            <div
              key={b.label}
              className={cn('h-full', toneBg[b.tone])}
              style={{ width: `${((b.max - b.min) / (max - min)) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {bands.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1.5 text-xs text-ink-muted dark:text-slate-400">
            <span className={cn('h-2 w-2 rounded-full', toneBg[b.tone])} />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- GoalBars
// Horizontal bars whose widths animate to their calorie targets.
export function GoalBars({
  items,
  format = (v: number) => Math.round(v).toLocaleString()
}: {
  items: { label: string; value: number; tone: Tone; emphasis?: boolean }[];
  format?: (v: number) => string;
}) {
  const max = Math.max(...items.map((i) => i.value)) * 1.1;
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className={cn('text-ink-soft dark:text-slate-300', item.emphasis && 'font-semibold text-ink dark:text-white')}>{item.label}</span>
            <span className={cn('font-display font-bold', toneText[item.tone])}>{format(item.value)} kcal</span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
            <div
              className={cn('h-full rounded-full transition-[width] duration-700 ease-out', toneBg[item.tone])}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- PulseBadge
// Gently pulsing heart for resting-energy (BMR) results.
export function PulseBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
      <span className="motion-safe:animate-gc-float inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300">
        <HeartPulse className="h-7 w-7" strokeWidth={1.8} />
      </span>
      <div>
        <p className="font-display text-2xl font-bold text-ink dark:text-white">{value}</p>
        <p className="text-sm text-ink-muted dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- CycleRing
// SVG ring of the menstrual cycle: period days, fertile window, ovulation day.
// Arcs animate via stroke-dasharray transitions when inputs change.
export function CycleRing({
  cycleLength,
  periodLength,
  ovulationDay
}: {
  cycleLength: number;
  periodLength: number;
  ovulationDay: number; // 1-based day of cycle
}) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const dayArc = C / cycleLength;
  const fertileStart = Math.max(ovulationDay - 5, 1);
  const fertileLen = Math.min(ovulationDay + 1, cycleLength) - fertileStart + 1;
  const rot = (day: number) => `rotate(${((day - 1) / cycleLength) * 360 - 90} 70 70)`;
  const ovAngle = (((ovulationDay - 0.5) / cycleLength) * 360 - 90) * (Math.PI / 180);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
      <svg viewBox="0 0 140 140" className="h-44 w-44 shrink-0" aria-hidden="true">
        {/* full cycle track */}
        <circle cx="70" cy="70" r={R} fill="none" strokeWidth="12" className="stroke-slate-100 dark:stroke-slate-700/60" />
        {/* fertile window */}
        <circle
          cx="70" cy="70" r={R} fill="none" strokeWidth="12" strokeLinecap="butt"
          className="stroke-emerald-400 transition-all duration-700 ease-out"
          strokeDasharray={`${dayArc * fertileLen} ${C - dayArc * fertileLen}`}
          transform={rot(fertileStart)}
        />
        {/* period days */}
        <circle
          cx="70" cy="70" r={R} fill="none" strokeWidth="12" strokeLinecap="butt"
          className="stroke-rose-400 transition-all duration-700 ease-out"
          strokeDasharray={`${dayArc * periodLength} ${C - dayArc * periodLength}`}
          transform={rot(1)}
        />
        {/* ovulation dot */}
        <circle
          cx={70 + R * Math.cos(ovAngle)} cy={70 + R * Math.sin(ovAngle)} r="7"
          className="fill-violet-500 stroke-white transition-all duration-700 ease-out dark:stroke-slate-900"
          strokeWidth="2.5"
        />
        <text x="70" y="66" textAnchor="middle" className="fill-ink font-display dark:fill-white" fontSize="17" fontWeight="800">{cycleLength}</text>
        <text x="70" y="82" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="9.5">day cycle</text>
      </svg>
      <div className="space-y-1.5 text-sm">
        <p className="flex items-center gap-2 text-ink-soft dark:text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Period · days 1–{periodLength}</p>
        <p className="flex items-center gap-2 text-ink-soft dark:text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Fertile window · days {fertileStart}–{fertileStart + fertileLen - 1}</p>
        <p className="flex items-center gap-2 text-ink-soft dark:text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" /> Ovulation · day {ovulationDay}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- TrimesterTrack
// 40-week pregnancy timeline with an animated "you are here" fill.
export function TrimesterTrack({ weeks, days }: { weeks: number; days: number }) {
  const progress = Math.min(Math.max((weeks + days / 7) / 40, 0), 1);
  const segments = [
    { label: '1st trimester', pct: 13 / 40, tone: 'sky' as Tone },
    { label: '2nd trimester', pct: 14 / 40, tone: 'teal' as Tone },
    { label: '3rd trimester', pct: 13 / 40, tone: 'emerald' as Tone }
  ];
  return (
    <div>
      <div className="relative pt-7">
        <div
          className="absolute top-0 -translate-x-1/2 transition-[left] duration-700 ease-out"
          style={{ left: `${progress * 100}%` }}
        >
          <span className="whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 font-display text-xs font-bold text-white dark:bg-white dark:text-ink">
            {weeks}w {days}d
          </span>
          <div className="mx-auto h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-ink dark:border-t-white" />
        </div>
        <div className="relative flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
          {segments.map((s) => (
            <div key={s.label} className={cn('h-full opacity-30', toneBg[s.tone])} style={{ width: `${s.pct * 100}%` }} />
          ))}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 transition-[width] duration-700 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-muted dark:text-slate-400">
        <span>Week 1</span><span>Week 13</span><span>Week 27</span><span>Week 40</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Related links
// Internal links between the health tools (topical cluster for SEO + discovery).
const HEALTH_TOOLS = [
  { label: 'BMI Calculator', href: '/bmi-calculator' },
  { label: 'Calorie Calculator (TDEE)', href: '/calorie-calculator' },
  { label: 'BMR Calculator', href: '/bmr-calculator' },
  { label: 'Body Fat Calculator', href: '/body-fat-calculator' },
  { label: 'Ideal Weight Calculator', href: '/ideal-weight-calculator' },
  { label: 'Macro Calculator', href: '/macro-calculator' },
  { label: 'Water Intake Calculator', href: '/water-intake-calculator' },
  { label: 'Period Calculator', href: '/period-calculator' },
  { label: 'Pregnancy Due Date Calculator', href: '/pregnancy-due-date-calculator' }
];

export function RelatedHealthLinks({ current }: { current: string }) {
  const others = HEALTH_TOOLS.filter((t) => t.href !== current);
  return (
    <nav className="mt-10" aria-label="Related health calculators">
      <h2 className="font-display text-xl font-bold text-ink dark:text-white">More health calculators</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {others.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:text-brand-300"
          >
            {t.label}
          </a>
        ))}
        <a
          href="/health-calculators"
          className="rounded-full border border-brand-200 bg-brand-50/60 px-3.5 py-1.5 text-sm font-semibold text-brand-700 transition hover:border-brand-300 dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-brand-300"
        >
          All health calculators →
        </a>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------- Disclaimer
export function HealthDisclaimer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-relaxed text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
      <strong className="font-semibold">Health disclaimer:</strong>{' '}
      {children || 'This calculator provides general estimates for education, not medical advice. Results vary by individual — consult a qualified healthcare professional before making health decisions.'}
    </div>
  );
}
