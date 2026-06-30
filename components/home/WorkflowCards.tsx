import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeftRight, PiggyBank, Briefcase, ShieldCheck, Car, Clock, LucideIcon } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

type Flow = { icon: LucideIcon; title: string; desc: string; href: string; time: string; tint: string };

const FLOWS: Flow[] = [
  { icon: Home, title: 'Home Loan Readiness', desc: 'Check eligibility, EMI affordability and plan your loan.', href: '/home-loan-readiness-workflow', time: '3 min', tint: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30' },
  { icon: ArrowLeftRight, title: 'Buy vs Rent', desc: 'Compare total cost of buying versus renting for your city.', href: '/rent-vs-buy-workflow', time: '4 min', tint: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
  { icon: PiggyBank, title: 'Prepay Loan or Invest', desc: 'See whether prepaying or investing builds more wealth.', href: '/prepay-vs-invest-workflow', time: '3 min', tint: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30' },
  { icon: Briefcase, title: 'Job Offer Decision', desc: 'Compare offers on salary, growth and lifestyle factors.', href: '/job-offer-workflow', time: '5 min', tint: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  { icon: ShieldCheck, title: 'Emergency Fund Readiness', desc: 'Find out if your safety net covers a real shock.', href: '/emergency-fund-readiness-workflow', time: '3 min', tint: 'text-sky-600 bg-sky-50 dark:bg-sky-900/30' },
  { icon: Car, title: 'Car Ownership Cost', desc: 'Look beyond the sticker price to the true running cost.', href: '/car-ownership-cost-workflow', time: '4 min', tint: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' },
];

export default function WorkflowCards() {
  return (
    <section id="workflows" className="border-y border-slate-200/60 bg-slate-50 py-14 dark:border-slate-800/60 dark:bg-slate-800/30 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Guided workflows"
          title="Make the right financial decision"
          subtitle="Interactive, step-by-step workflows for life’s bigger money decisions."
          action={{ label: 'All workflows', href: '/workflows' }}
        />
        {/* Horizontal scroll on mobile, grid on larger screens */}
        <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {FLOWS.map(({ icon: Icon, title, desc, href, time, tint }) => (
            <Link
              key={title}
              href={href}
              className="group flex w-72 shrink-0 snap-start flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-card sm:w-auto dark:border-slate-700/70 dark:bg-slate-800/70"
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5" /> {time}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink dark:text-white">{title}</h3>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-brand-700 dark:text-brand-300">
                Start workflow <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
