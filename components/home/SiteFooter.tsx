import React from 'react';
import Link from 'next/link';
import Container from '../ui/Container';

type Col = { heading: string; links: { label: string; href: string }[] };

const COLUMNS: Col[] = [
  {
    heading: 'Calculators',
    links: [
      { label: 'EMI / Loan', href: '/loan-calculator' },
      { label: 'Income Tax', href: '/income-tax-calculator' },
      { label: 'SIP', href: '/sip-calculator' },
      { label: 'PPF', href: '/ppf-calculator' },
      { label: 'GST', href: '/gst-calculator' },
      { label: 'Capital Gains', href: '/capital-gains-calculator' },
    ],
  },
  {
    heading: 'Workflows',
    links: [
      { label: 'Home Loan Readiness', href: '/home-loan-readiness-workflow' },
      { label: 'Buy vs Rent', href: '/rent-vs-buy-workflow' },
      { label: 'Prepay or Invest', href: '/prepay-vs-invest-workflow' },
      { label: 'Job Offer Decision', href: '/job-offer-workflow' },
      { label: 'Emergency Fund', href: '/emergency-fund-readiness-workflow' },
    ],
  },
  {
    heading: 'Guides',
    links: [
      { label: 'FY 2026-27 Tax Slabs', href: '/guides/india-income-tax-2026-27' },
      { label: 'Tax on ₹12 Lakh Salary', href: '/guides/tax-on-12-lakh-salary-fy-2026-27' },
      { label: 'Old vs New Regime', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27' },
      { label: 'How Much EMI Is Safe', href: '/guides/how-much-emi-is-safe' },
    ],
  },
  {
    heading: 'Regions',
    links: [
      { label: 'India Calculators', href: '/india-calculators' },
      { label: 'US Calculators', href: '/us-calculators' },
      { label: 'UK & Europe', href: '/eu-calculators' },
      { label: 'Health & Fitness', href: '/health-calculators' },
      { label: 'Everyday Tools', href: '/tools' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Methodology', href: '/methodology' },
      { label: 'Editorial Policy', href: '/editorial-policy' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/upaman-elephant-logo.svg" alt="" className="h-8 w-8" width={32} height={32} />
              <span className="font-display text-lg font-bold text-ink dark:text-white">Upaman</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted dark:text-slate-400">
              Free calculators, comparison tools and workflows to help you make better financial decisions.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-ink dark:text-slate-200">{col.heading}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ink-muted hover:text-brand-700 dark:text-slate-400 dark:hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-ink-muted dark:border-slate-800 dark:text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Upaman. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms-of-service" className="hover:text-brand-700 dark:hover:text-white">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-brand-700 dark:hover:text-white">Privacy</Link>
            <Link href="/cookie-policy" className="hover:text-brand-700 dark:hover:text-white">Cookies</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
