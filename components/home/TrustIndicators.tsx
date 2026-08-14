import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CalendarCheck, PencilLine } from 'lucide-react';

// Three claims that are specific to this site and checkable, rather than the
// generic free/private/accurate/updated row every tool site runs. Each one
// points at the page that backs it up.
const items = [
  {
    icon: ShieldCheck,
    title: 'Runs in your browser',
    sub: 'no account, no server, nothing you type is sent',
    href: '/privacy-policy'
  },
  {
    icon: CalendarCheck,
    title: 'Rates dated FY 2026-27',
    sub: 'the tax year is stated on every page',
    href: '/methodology'
  },
  {
    icon: PencilLine,
    title: 'Mistakes get published',
    sub: 'named review desk, public corrections log',
    href: '/corrections-policy'
  }
];

export default function TrustIndicators() {
  // Stacked rather than a 3-up grid: in the half-width hero column each cell
  // was only ~120px, which broke every title across two lines.
  return (
    <ul className="space-y-2.5">
      {items.map(({ icon: Icon, title, sub, href }) => (
        <li key={title}>
          <Link href={href} className="group flex items-center gap-2.5">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="text-sm leading-snug">
              <span className="font-semibold text-ink underline-offset-2 group-hover:underline dark:text-slate-100">
                {title}
              </span>
              <span className="text-ink-muted dark:text-slate-400"> — {sub}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
