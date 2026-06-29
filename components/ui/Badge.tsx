import React from 'react';
import { cn } from './cn';

type Tone = 'brand' | 'green' | 'amber' | 'violet' | 'slate';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
};

type BadgeProps = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
};

export default function Badge({ children, tone = 'brand', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
