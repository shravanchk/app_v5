import React from 'react';
import Link from 'next/link';
import { IndianRupee, Percent, CalendarClock } from 'lucide-react';

const inr0 = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n));

function emi(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  const m = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = m * n;
  return { monthly: m, total, interest: total - principal };
}

// Static example used purely as a product visual on the homepage hero.
const PRINCIPAL = 5000000;
const RATE = 8.5;
const TENURE = 20;

const chip = 'flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60';
const chipLabel = 'text-[0.7rem] font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400';
const chipValue = 'text-sm font-semibold text-ink dark:text-slate-100';

// Smooth upward curve for cumulative payment over the loan term.
const YEARS = ['2024', '2028', '2032', '2036', '2040'];
const POINTS = [18, 30, 45, 64, 88, 120, 150, 182]; // relative heights

function buildPath(values: number[], width: number, height: number, pad: number) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = (width - pad * 2) / (values.length - 1);
  return values.map((v, i) => {
    const x = pad + i * stepX;
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return { x, y };
  });
}

export default function DashboardPreview() {
  const { monthly, total, interest } = emi(PRINCIPAL, RATE, TENURE);
  const W = 460;
  const H = 150;
  const pts = buildPath(POINTS, W, H, 14);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - 14} L ${pts[0].x.toFixed(1)} ${H - 14} Z`;

  return (
    <div className="w-full rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card dark:border-slate-700/70 dark:bg-slate-800/80 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink dark:text-slate-100">Home Loan EMI Calculator</p>
          <p className="text-xs text-ink-muted dark:text-slate-400">Your monthly EMI</p>
        </div>
        <Link href="/loan-calculator" className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">
          View all calculators →
        </Link>
      </div>

      <div className="mt-3">
        <p className="font-display text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          {inr0(monthly)}
        </p>
        <p className="text-xs text-ink-muted dark:text-slate-400">Break-up of your EMI</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className={chip}>
          <IndianRupee className="h-4 w-4 text-brand-600" strokeWidth={2} />
          <div>
            <p className={chipLabel}>Loan</p>
            <p className={chipValue}>{inr0(PRINCIPAL)}</p>
          </div>
        </div>
        <div className={chip}>
          <Percent className="h-4 w-4 text-brand-600" strokeWidth={2} />
          <div>
            <p className={chipLabel}>Rate</p>
            <p className={chipValue}>{RATE}% p.a.</p>
          </div>
        </div>
        <div className={chip}>
          <CalendarClock className="h-4 w-4 text-brand-600" strokeWidth={2} />
          <div>
            <p className={chipLabel}>Tenure</p>
            <p className={chipValue}>{TENURE} yrs</p>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-b from-brand-50/50 to-white p-2 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[150px] w-full" role="img" aria-label="Projected cumulative loan payment over the tenure">
          <defs>
            <linearGradient id="emiArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#emiArea)" />
          <path d={line} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.filter((_, i) => i % 2 === 0).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
          ))}
        </svg>
        <div className="flex justify-between px-2 pb-1 text-[0.65rem] text-ink-muted dark:text-slate-500">
          {YEARS.map((y) => <span key={y}>{y}</span>)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
        <div>
          <p className={chipLabel}>Total payment</p>
          <p className={chipValue}>{inr0(total)}</p>
        </div>
        <div>
          <p className={chipLabel}>Total interest</p>
          <p className={chipValue}>{inr0(interest)}</p>
        </div>
        <div>
          <p className={chipLabel}>Principal</p>
          <p className={chipValue}>{inr0(PRINCIPAL)}</p>
        </div>
      </div>
    </div>
  );
}
