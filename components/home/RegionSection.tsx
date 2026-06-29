import React from 'react';
import Link from 'next/link';
import { IndianRupee, DollarSign, Euro, Wrench, ArrowRight, LucideIcon } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

type Region = { icon: LucideIcon; label: string; href: string; blurb: string; tint: string };

const REGIONS: Region[] = [
  { icon: IndianRupee, label: 'India', href: '/india-calculators', blurb: 'Tax, EMI, SIP, PPF, GST, salary and decision workflows for FY 2026-27.', tint: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300' },
  { icon: DollarSign, label: 'United States', href: '/us-calculators', blurb: 'Mortgage, refinance, auto loan, 401(k), savings/CD and credit-card payoff.', tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { icon: Euro, label: 'UK & Europe', href: '/eu-calculators', blurb: 'UK income tax, VAT, and net-salary tools for Germany, France and beyond.', tint: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300' },
  { icon: Wrench, label: 'Everyday Tools', href: '/tools', blurb: 'Age, scientific and statistics calculators, unit conversion and JSON.', tint: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' },
];

export default function RegionSection() {
  return (
    <section id="regions" className="py-14 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="By region"
          title="Calculators for where you are"
          subtitle="Pick your region for tools tuned to local taxes, rates and rules — plus a set of everyday utilities."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REGIONS.map(({ icon: Icon, label, href, blurb, tint }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70"
            >
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}>
                <Icon className="h-6 w-6" strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink dark:text-white">{label}</h3>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:gap-1.5 dark:text-brand-300">
                Explore <ArrowRight className="h-4 w-4 transition-all" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
