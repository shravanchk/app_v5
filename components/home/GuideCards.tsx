import React from 'react';
import Link from 'next/link';
import { Landmark, Wallet, Home, TrendingUp, LucideIcon } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

type Guide = {
  title: string; href: string; category: string; minutes: number; updated: string;
  icon: LucideIcon; from: string; to: string;
};

const GUIDES: Guide[] = [
  { title: 'Tax on ₹12 Lakh Salary: why you pay ₹0', href: '/guides/tax-on-12-lakh-salary-fy-2026-27', category: 'Taxation', minutes: 6, updated: 'Jun 28, 2026', icon: Landmark, from: '#6d28d9', to: '#2563eb' },
  { title: 'Old vs New Regime: where is the breakeven?', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27', category: 'Taxation', minutes: 7, updated: 'Jun 28, 2026', icon: TrendingUp, from: '#2563eb', to: '#0ea5e9' },
  { title: 'How much EMI is safe for your income?', href: '/guides/how-much-emi-is-safe', category: 'Loans', minutes: 5, updated: 'Mar 14, 2026', icon: Home, from: '#0891b2', to: '#10b981' },
  { title: 'CTC to in-hand salary, explained', href: '/guides/ctc-to-in-hand-salary', category: 'Salary', minutes: 6, updated: 'Jun 28, 2026', icon: Wallet, from: '#d97706', to: '#e11d48' },
];

function Thumb({ icon: Icon, category, from, to }: { icon: LucideIcon; category: string; from: string; to: string }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5), transparent 45%)' }} />
      <Icon className="absolute right-4 top-4 h-9 w-9 text-white/85" strokeWidth={1.6} />
      <span className="absolute bottom-3 left-4 text-xs font-bold uppercase tracking-[0.12em] text-white/90">{category}</span>
    </div>
  );
}

export default function GuideCards() {
  return (
    <section id="guides" className="border-y border-slate-200/60 bg-slate-50 py-14 dark:border-slate-800/60 dark:bg-slate-800/30 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Insights & guides"
          title="Guides to improve your finances"
          subtitle="Plain-English explainers with real worked examples — no jargon."
          action={{ label: 'All guides', href: '/guides' }}
        />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70"
            >
              <Thumb icon={g.icon} category={g.category} from={g.from} to={g.to} />
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-base font-semibold leading-snug text-ink group-hover:text-brand-700 dark:text-white">{g.title}</h3>
                <p className="mt-auto pt-3 text-xs text-ink-muted dark:text-slate-400">{g.updated} · {g.minutes} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
