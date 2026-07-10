import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Home, ArrowLeftRight, PiggyBank, Briefcase, ShieldCheck, Car, Clock, Landmark } from 'lucide-react';
import { CalcLayout } from '../components/calculator/CalcLayout';
import Card from '../components/ui/Card';

const FLOWS = [
  { icon: Home, title: 'Home Loan Readiness', desc: 'Check eligibility, EMI affordability and plan your loan.', href: '/home-loan-readiness-workflow', time: '3 min', tint: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30' },
  { icon: ArrowLeftRight, title: 'Buy vs Rent', desc: 'Compare the total cost of buying versus renting for your city.', href: '/rent-vs-buy-workflow', time: '4 min', tint: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
  { icon: PiggyBank, title: 'Prepay Loan or Invest', desc: 'See whether prepaying or investing builds more wealth.', href: '/prepay-vs-invest-workflow', time: '3 min', tint: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30' },
  { icon: Landmark, title: 'FD vs SIP Benefit', desc: 'Compare fixed deposit and SIP on post-tax maturity value.', href: '/fd-vs-sip-workflow', time: '3 min', tint: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
  { icon: Briefcase, title: 'Job Offer Decision', desc: 'Compare offers on salary, growth and lifestyle factors.', href: '/job-offer-workflow', time: '5 min', tint: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  { icon: ShieldCheck, title: 'Emergency Fund Readiness', desc: 'Find out if your safety net covers a real shock.', href: '/emergency-fund-readiness-workflow', time: '3 min', tint: 'text-sky-600 bg-sky-50 dark:bg-sky-900/30' },
  { icon: Car, title: 'Car Ownership Cost', desc: 'Look beyond the sticker price to the true running cost.', href: '/car-ownership-cost-workflow', time: '4 min', tint: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' },
];

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Upaman guided financial workflows',
  itemListElement: FLOWS.map((f, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: f.title,
    url: `https://upaman.com${f.href}`
  }))
};

export default function WorkflowsIndex() {
  return (
    <>
      <Head>
        <title>Guided Financial Workflows | Step-by-Step Money Decisions | Upaman</title>
        <meta name="description" content="Interactive, step-by-step workflows for life's bigger money decisions — home loans, buy vs rent, prepay vs invest, job offers, emergency funds, and car ownership cost." />
        <link rel="canonical" href="https://upaman.com/workflows" />
        <meta property="og:title" content="Guided Financial Workflows | Upaman" />
        <meta property="og:description" content="Step-by-step workflows for life's bigger money decisions." />
        <meta property="og:url" content="https://upaman.com/workflows" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Guided workflows"
        title="Make the right financial decision"
        subtitle="Interactive, step-by-step workflows that turn life's bigger money decisions into a clear, guided answer."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FLOWS.map(({ icon: Icon, title, desc, href, time, tint }) => (
            <Link key={href} href={href} className="group">
              <Card className="flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-card">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5" /> {time}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink dark:text-white">{title}</h2>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-brand-700 dark:text-brand-300">
                  Start workflow <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </CalcLayout>
    </>
  );
}