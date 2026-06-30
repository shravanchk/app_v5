import React from 'react';
import { cn } from '../ui/cn';

// Shared, dark-aware building blocks for the multi-step decision workflows.
// Sits on top of the design-system primitives (Card, Field, Button, CalcLayout)
// so every workflow reads consistently and supports dark mode.

export type WorkflowTone = 'positive' | 'warning' | 'danger' | 'info' | 'neutral';

const toneBanner: Record<WorkflowTone, string> = {
  positive: 'border-l-emerald-500 bg-emerald-50/70 dark:bg-emerald-900/20',
  warning: 'border-l-amber-500 bg-amber-50/70 dark:bg-amber-900/20',
  danger: 'border-l-rose-500 bg-rose-50/70 dark:bg-rose-900/20',
  info: 'border-l-brand-500 bg-brand-50/70 dark:bg-brand-900/20',
  neutral: 'border-l-slate-400 bg-slate-50 dark:bg-slate-800/60',
};

const toneText: Record<WorkflowTone, string> = {
  positive: 'text-emerald-700 dark:text-emerald-300',
  warning: 'text-amber-700 dark:text-amber-300',
  danger: 'text-rose-700 dark:text-rose-300',
  info: 'text-brand-700 dark:text-brand-300',
  neutral: 'text-ink dark:text-white',
};

// Numbered step switcher (replaces the old pill buttons). Steps are 1-indexed.
export function WorkflowSteps({
  steps,
  active,
  onChange,
}: {
  steps: string[];
  active: number;
  onChange: (step: number) => void;
}) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/60"
      role="tablist"
    >
      {steps.map((label, idx) => {
        const step = idx + 1;
        const isActive = active === step;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(step)}
            className={cn(
              'rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
              isActive
                ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-ink-muted hover:text-ink dark:text-slate-400'
            )}
          >
            <span className="mr-1.5 font-bold">{step}.</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// The "How to use this step" guidance box. Pass an array of bullet strings.
export function HowToNote({
  title = 'How to use this step',
  items,
  children,
}: {
  title?: string;
  items?: React.ReactNode[];
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-brand-200/70 bg-brand-50/60 p-4 text-sm leading-relaxed text-brand-900 dark:border-brand-800/60 dark:bg-brand-900/15 dark:text-brand-100">
      <p className="font-semibold">{title}</p>
      {items ? (
        <ul className="mt-1.5 list-disc space-y-1 pl-5 marker:text-brand-400">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      ) : null}
      {children}
    </div>
  );
}

// Colored recommendation / status banner with a left accent border.
export function DecisionBanner({
  tone,
  label,
  reason,
  icon,
  children,
}: {
  tone: WorkflowTone;
  label: string;
  reason?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-xl border-l-4 p-4', toneBanner[tone])}>
      <p className={cn('flex items-center gap-2 font-display text-base font-bold', toneText[tone])}>
        {icon}
        {label}
      </p>
      {reason ? <p className="mt-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">{reason}</p> : null}
      {children}
    </div>
  );
}

// A neutral sub-panel (white in light, slate in dark) with an optional heading.
export function Panel({
  title,
  icon,
  children,
  className,
}: {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/60',
        className
      )}
    >
      {title ? (
        <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-ink dark:text-white">
          {icon}
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  );
}

// A simple key/value line used inside panels.
export function PanelRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="text-sm text-ink-soft dark:text-slate-300">
      {label}: <strong className="font-semibold text-ink dark:text-white">{value}</strong>
    </p>
  );
}

// A bulleted checklist used in the action-plan steps.
export function ActionList({ title, items }: { title?: string; items: React.ReactNode[] }) {
  return (
    <div>
      {title ? <p className="mb-1.5 font-semibold text-ink dark:text-white">{title}</p> : null}
      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-soft marker:text-slate-400 dark:text-slate-300">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
