import React from 'react';
import { BadgeCheck, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';

const items = [
  { icon: BadgeCheck, title: '100% Free', sub: 'No sign-up required' },
  { icon: ShieldCheck, title: 'Privacy First', sub: 'Your data stays with you' },
  { icon: UserCheck, title: 'Expert Reviewed', sub: 'Accurate & reliable' },
  { icon: RefreshCw, title: 'Regularly Updated', sub: 'Always up to date' },
];

export default function TrustIndicators() {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
      {items.map(({ icon: Icon, title, sub }) => (
        <li key={title} className="flex items-start gap-2.5">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink dark:text-slate-100">{title}</span>
            <span className="block text-xs text-ink-muted dark:text-slate-400">{sub}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
