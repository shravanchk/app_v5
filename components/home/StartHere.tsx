import React from 'react';
import Link from 'next/link';
import { Home, TrendingUp, Landmark, Briefcase, PiggyBank, CreditCard, ArrowRight, LucideIcon } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

type Intent = { icon: LucideIcon; title: string; desc: string; href: string; tint: string };

const INTENTS: Intent[] = [
  { icon: Home, title: 'Buy a Home', desc: 'Check loan eligibility, EMI and affordability', href: '/home-loan-readiness-workflow', tint: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30' },
  { icon: TrendingUp, title: 'Start Investing', desc: 'Plan SIPs and project long-term growth', href: '/sip-calculator', tint: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
  { icon: Landmark, title: 'Save Tax', desc: 'Compare regimes and lower your tax bill', href: '/tax-regime-comparison', tint: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30' },
  { icon: Briefcase, title: 'Compare Job Offers', desc: 'Weigh salary, growth and take-home pay', href: '/job-offer-workflow', tint: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  { icon: PiggyBank, title: 'Plan Long-term Savings', desc: 'Build a PPF corpus with tax-free returns', href: '/ppf-calculator', tint: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' },
  { icon: CreditCard, title: 'Manage Loans', desc: 'Prepay smartly or invest the difference', href: '/prepay-vs-invest-workflow', tint: 'text-sky-600 bg-sky-50 dark:bg-sky-900/30' },
];

export default function StartHere() {
  return (
    <section id="start-here" className="py-14 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Start here"
          title="What do you want to do today?"
          subtitle="Pick a goal and we’ll guide you through the decision — step by step."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTENTS.map(({ icon: Icon, title, desc, href, tint }) => (
            <Link
              key={title}
              href={href}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70"
            >
              <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tint}`}>
                <Icon className="h-6 w-6" strokeWidth={1.9} />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-display text-lg font-semibold text-ink dark:text-white">
                  {title}
                  <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 text-brand-600" />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-muted dark:text-slate-400">{desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
