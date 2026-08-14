import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import DashboardPreview from './DashboardPreview';
import TrustIndicators from './TrustIndicators';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft, calm background wash */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900" />
      <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-900/20" />

      <Container className="relative py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="animate-fade-up">
            <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl dark:text-white">
              Financial calculators that show their working
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted dark:text-slate-400">
              Tax, salary, loans and investing for India, the US and the UK. Every result comes with the formula behind
              it, the rule it applies, and a straight answer on whether the number is good news.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button href="/india-calculators" size="lg">Browse calculators <span aria-hidden>→</span></Button>
              <Button href="/methodology" variant="secondary" size="lg">How we calculate</Button>
            </div>
            <div className="mt-8">
              <TrustIndicators />
            </div>
          </div>

          <div className="animate-fade-up">
            <div className="mx-auto w-full max-w-xl lg:ml-auto lg:mr-0">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
