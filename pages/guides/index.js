import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CalcLayout } from '../../components/calculator/CalcLayout';
import Card from '../../components/ui/Card';

const GROUPS = [
  {
    heading: 'United States',
    guides: [
      { title: 'How to Read Your US Paycheck', desc: 'Every pay-stub line explained: 2026 brackets, FICA, and pre-tax deductions.', href: '/guides/how-to-read-your-paycheck' },
      { title: 'Traditional vs Roth 401(k)', desc: 'How each is taxed, 2026 limits, and a simple rule for choosing.', href: '/guides/traditional-vs-roth-401k' },
      { title: 'Salary After Taxes ($30k–$250k)', desc: 'Pick any salary for a 50-state take-home table.', href: '/after-taxes' },
    ]
  },
  {
    heading: 'India tax & salary',
    guides: [
      { title: 'India Income Tax Slabs FY 2026-27', desc: 'New and old regime slabs, rates, and how to compare them.', href: '/guides/india-income-tax-2026-27' },
      { title: 'Tax on ₹12 Lakh Salary FY 2026-27', desc: 'Why a ₹12 lakh salary is effectively tax-free under the new regime.', href: '/guides/tax-on-12-lakh-salary-fy-2026-27' },
      { title: 'Standard Deduction FY 2026-27', desc: 'What the ₹75,000 standard deduction saves you and who can claim it.', href: '/guides/standard-deduction-fy-2026-27' },
      { title: 'Old vs New Regime Breakeven', desc: 'How many deductions you need before the old regime wins.', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27' },
      { title: 'Marginal Relief, New Regime', desc: 'How marginal relief works just above the ₹12 lakh threshold.', href: '/guides/marginal-relief-new-regime-fy-2026-27' },
      { title: 'CTC to In-Hand Salary', desc: 'How your cost-to-company becomes monthly take-home pay.', href: '/guides/ctc-to-in-hand-salary' },
      { title: 'Tax on Salary by Income (₹5L–₹50L)', desc: 'Pick any salary for a full new-regime slab breakdown.', href: '/tax-on-salary' },
    ]
  },
  {
    heading: 'Loans, spending & decisions',
    guides: [
      { title: 'How Much EMI Is Actually Safe', desc: 'Set a safe EMI cap built around buffers, not lender maximums.', href: '/guides/how-much-emi-is-safe' },
      { title: 'How to Compare Job Offers', desc: 'A framework that goes beyond headline salary.', href: '/guides/how-to-compare-job-offers' },
      { title: 'Car Ownership Cost Guide', desc: 'The true running cost of a car beyond its sticker price.', href: '/guides/car-ownership-cost-guide' },
    ]
  },
  {
    heading: 'UK & Europe',
    guides: [
      { title: 'UK Tax Rates 2026-27', desc: 'Income tax bands, National Insurance, and student-loan thresholds.', href: '/guides/uk-tax-rates-2026-27' },
    ]
  }
];

const allGuides = GROUPS.flatMap((g) => g.guides);
const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Upaman financial guides',
  itemListElement: allGuides.map((g, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: g.title,
    url: `https://upaman.com${g.href}`
  }))
};

export default function GuidesIndex() {
  return (
    <>
      <Head>
        <title>Financial Guides | Tax, Salary, Loans & Money Decisions | Upaman</title>
        <meta name="description" content="Practical, plain-English guides on US paychecks and 401(k)s, UK tax, Indian income tax and CTC, EMI affordability, job offers, and car ownership cost — to use alongside Upaman's calculators." />
        <link rel="canonical" href="https://upaman.com/guides" />
        <meta property="og:title" content="Financial Guides | Upaman" />
        <meta property="og:description" content="Plain-English guides on tax, salary, loans, and money decisions." />
        <meta property="og:url" content="https://upaman.com/guides" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Guides"
        title="Financial guides"
        subtitle="Plain-English explainers that pair with our calculators — so you understand the number, not just see it."
      >
        <div className="space-y-10">
          {GROUPS.map((group) => (
            <section key={group.heading}>
              <h2 className="font-display text-lg font-bold text-ink dark:text-white">{group.heading}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.guides.map((g) => (
                  <Link key={g.href} href={g.href} className="group">
                    <Card className="flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-card">
                      <h3 className="font-display text-base font-semibold text-ink dark:text-white">{g.title}</h3>
                      <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{g.desc}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-brand-700 dark:text-brand-300">
                        Read guide <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </CalcLayout>
    </>
  );
}