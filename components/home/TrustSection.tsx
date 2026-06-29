import React from 'react';
import { LayoutGrid, BadgeIndianRupee, ShieldCheck, UserCheck, FunctionSquare, RefreshCw, LogIn, LucideIcon } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

type Trust = { icon: LucideIcon; title: string; sub: string };

const ITEMS: Trust[] = [
  { icon: LayoutGrid, title: '50+ Calculators', sub: 'Tax, loans, investing & more' },
  { icon: BadgeIndianRupee, title: '100% Free', sub: 'No paywalls, ever' },
  { icon: ShieldCheck, title: 'Privacy First', sub: 'Calculations stay in your browser' },
  { icon: UserCheck, title: 'Expert Reviewed', sub: 'Checked against official sources' },
  { icon: FunctionSquare, title: 'Transparent Formulas', sub: 'Every method is shown' },
  { icon: RefreshCw, title: 'Regularly Updated', sub: 'Current for FY 2026-27' },
  { icon: LogIn, title: 'No Login Required', sub: 'Start using instantly' },
];

export default function TrustSection() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <SectionHeading align="center" eyebrow="Why Upaman" title="Built to be trusted" subtitle="A calm, transparent place to make important money decisions." />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft dark:border-slate-700/70 dark:bg-slate-800/70">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink dark:text-slate-100">{title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted dark:text-slate-400">{sub}</span>
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
