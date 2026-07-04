import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  DollarSign,
  Percent,
  CalendarClock,
  TrendingUp,
  Wallet,
  Receipt,
  MapPin,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const inr0 = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n));

const usd0 = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n));

// ---------- finance helpers (static homepage visuals only) ----------
function emiBreakup(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  const m = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = m * n;
  return { monthly: m, total, interest: total - principal };
}

function sipBreakup(monthly: number, annualRate: number, years: number) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  const corpus = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthly * n;
  return { corpus, invested, gains: corpus - invested };
}

// Mirrors utils/quickCalculations computeCompoundGrowth (monthly compounding,
// contributions at month-end) so the hero matches the calculator's defaults.
function compoundBreakup(principal: number, monthly: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  let balance = principal;
  const yearly: number[] = [principal];
  for (let m = 1; m <= years * 12; m++) {
    balance = balance * (1 + r) + monthly;
    if (m % 12 === 0) yearly.push(balance);
  }
  const invested = principal + monthly * years * 12;
  return { balance, invested, interest: balance - invested, yearly };
}

// Mirrors utils/usPaycheckCalculations computePaycheck (2026 single-filer
// standard deduction + brackets, FICA) for a no-state-tax example (Texas).
function paycheckBreakup(gross: number) {
  const taxable = Math.max(0, gross - 16100);
  const brackets: [number, number][] = [
    [12400, 0.1],
    [50400, 0.12],
    [105700, 0.22],
    [201775, 0.24],
  ];
  let federal = 0;
  let lower = 0;
  for (const [upTo, rate] of brackets) {
    if (taxable <= lower) break;
    federal += (Math.min(taxable, upTo) - lower) * rate;
    lower = upTo;
  }
  const socialSecurity = Math.min(gross, 184500) * 0.062;
  const medicare = gross * 0.0145;
  const fica = socialSecurity + medicare;
  const net = gross - federal - fica;
  return { federal, fica, net, monthly: net / 12 };
}

// India new-regime estimate (FY 2025-26) with standard deduction + 4% cess.
function newRegimeTax(gross: number) {
  const taxable = Math.max(0, gross - 75000);
  const slabs = [
    [400000, 0],
    [800000, 0.05],
    [1200000, 0.1],
    [1600000, 0.15],
    [2000000, 0.2],
    [2400000, 0.25],
    [Infinity, 0.3],
  ] as const;
  let tax = 0;
  let lower = 0;
  for (const [upTo, rate] of slabs) {
    if (taxable <= lower) break;
    tax += (Math.min(taxable, upTo) - lower) * rate;
    lower = upTo;
  }
  const total = tax * 1.04;
  return { tax: total, takeHome: gross - total };
}

// ---------- card configs ----------
type Chip = { icon: React.ReactNode; label: string; value: string };
type Stat = { label: string; value: string };
type AreaChart = { kind: 'area'; points: number[]; years: string[] };
type SplitChart = { kind: 'split'; parts: { label: string; value: number; color: string }[] };

type CardConfig = {
  id: string;
  title: string;
  href: string;
  valueLabel: string;
  value: string;
  chips: Chip[];
  chart: AreaChart | SplitChart;
  stats: Stat[];
};

const iconCls = 'h-4 w-4 text-brand-600 dark:text-brand-300';

const EMI = emiBreakup(5000000, 8.5, 20);
const SIP = sipBreakup(25000, 12, 15);
const TAX = newRegimeTax(1800000);
const COMPOUND = compoundBreakup(10000, 200, 7, 20);
const PAY = paycheckBreakup(85000);

const CARDS: CardConfig[] = [
  {
    id: 'compound',
    title: 'Compound Interest Calculator',
    href: '/compound-interest-calculator',
    valueLabel: 'Balance after 20 years',
    value: usd0(COMPOUND.balance),
    chips: [
      { icon: <DollarSign className={iconCls} strokeWidth={2} />, label: 'Initial', value: usd0(10000) },
      { icon: <Wallet className={iconCls} strokeWidth={2} />, label: 'Monthly', value: usd0(200) },
      { icon: <TrendingUp className={iconCls} strokeWidth={2} />, label: 'Return', value: '7% p.a.' },
    ],
    chart: {
      kind: 'area',
      points: [0, 3, 6, 9, 12, 15, 18, 20].map((y) => COMPOUND.yearly[y]),
      years: ['2026', '2031', '2036', '2041', '2046'],
    },
    stats: [
      { label: 'Total invested', value: usd0(COMPOUND.invested) },
      { label: 'Interest earned', value: usd0(COMPOUND.interest) },
      { label: 'Growth', value: `${(COMPOUND.balance / COMPOUND.invested).toFixed(1)}×` },
    ],
  },
  {
    id: 'paycheck',
    title: 'US Paycheck Calculator',
    href: '/us-paycheck-calculator',
    valueLabel: 'Annual take-home pay (2026)',
    value: usd0(PAY.net),
    chips: [
      { icon: <DollarSign className={iconCls} strokeWidth={2} />, label: 'Salary', value: usd0(85000) },
      { icon: <MapPin className={iconCls} strokeWidth={2} />, label: 'State', value: 'Texas' },
      { icon: <UserRound className={iconCls} strokeWidth={2} />, label: 'Filing', value: 'Single' },
    ],
    chart: {
      kind: 'split',
      parts: [
        { label: 'Take-home', value: PAY.net, color: '#10b981' },
        { label: 'Federal tax', value: PAY.federal, color: '#f59e0b' },
        { label: 'FICA', value: PAY.fica, color: '#0ea5e9' },
      ],
    },
    stats: [
      { label: 'Federal income tax', value: usd0(PAY.federal) },
      { label: 'Social Security + Medicare', value: usd0(PAY.fica) },
      { label: 'Monthly take-home', value: usd0(PAY.monthly) },
    ],
  },
  {
    id: 'emi',
    title: 'Home Loan EMI Calculator',
    href: '/loan-calculator',
    valueLabel: 'Your monthly EMI',
    value: inr0(EMI.monthly),
    chips: [
      { icon: <IndianRupee className={iconCls} strokeWidth={2} />, label: 'Loan', value: inr0(5000000) },
      { icon: <Percent className={iconCls} strokeWidth={2} />, label: 'Rate', value: '8.5% p.a.' },
      { icon: <CalendarClock className={iconCls} strokeWidth={2} />, label: 'Tenure', value: '20 yrs' },
    ],
    chart: { kind: 'area', points: [18, 30, 45, 64, 88, 120, 150, 182], years: ['2024', '2029', '2034', '2039', '2044'] },
    stats: [
      { label: 'Total payment', value: inr0(EMI.total) },
      { label: 'Total interest', value: inr0(EMI.interest) },
      { label: 'Principal', value: inr0(5000000) },
    ],
  },
  {
    id: 'sip',
    title: 'SIP Calculator',
    href: '/sip-calculator',
    valueLabel: 'Projected corpus',
    value: inr0(SIP.corpus),
    chips: [
      { icon: <IndianRupee className={iconCls} strokeWidth={2} />, label: 'Monthly', value: inr0(25000) },
      { icon: <TrendingUp className={iconCls} strokeWidth={2} />, label: 'Return', value: '12% p.a.' },
      { icon: <CalendarClock className={iconCls} strokeWidth={2} />, label: 'Tenure', value: '15 yrs' },
    ],
    chart: { kind: 'area', points: [10, 16, 24, 36, 52, 76, 108, 150], years: ['2024', '2028', '2032', '2036', '2039'] },
    stats: [
      { label: 'Invested', value: inr0(SIP.invested) },
      { label: 'Est. returns', value: inr0(SIP.gains) },
      { label: 'Corpus', value: inr0(SIP.corpus) },
    ],
  },
  {
    id: 'tax',
    title: 'Income Tax Calculator',
    href: '/income-tax-calculator',
    valueLabel: 'Estimated monthly in-hand',
    value: inr0(TAX.takeHome / 12),
    chips: [
      { icon: <IndianRupee className={iconCls} strokeWidth={2} />, label: 'Income', value: inr0(1800000) },
      { icon: <Receipt className={iconCls} strokeWidth={2} />, label: 'Regime', value: 'New' },
      { icon: <Wallet className={iconCls} strokeWidth={2} />, label: 'Annual tax', value: inr0(TAX.tax) },
    ],
    chart: {
      kind: 'split',
      parts: [
        { label: 'Take-home', value: TAX.takeHome, color: '#10b981' },
        { label: 'Income tax', value: TAX.tax, color: '#f59e0b' },
      ],
    },
    stats: [
      { label: 'Gross income', value: inr0(1800000) },
      { label: 'Income tax', value: inr0(TAX.tax) },
      { label: 'Annual in-hand', value: inr0(TAX.takeHome) },
    ],
  },
];

const chip =
  'flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60';
const chipLabel = 'text-[0.7rem] font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400';
const chipValue = 'text-sm font-semibold text-ink dark:text-slate-100';

const W = 460;
const H = 150;

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

function AreaChartView({ points, years }: { points: number[]; years: string[] }) {
  const pts = buildPath(points, W, H, 14);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - 14} L ${pts[0].x.toFixed(1)} ${H - 14} Z`;
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[150px] w-full" role="img" aria-label="Projected value over time">
        <defs>
          <linearGradient id="previewArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#previewArea)" />
        <path d={line} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.filter((_, i) => i % 2 === 0).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
        ))}
      </svg>
      <div className="flex justify-between px-2 pb-1 text-[0.65rem] text-ink-muted dark:text-slate-500">
        {years.map((y) => <span key={y}>{y}</span>)}
      </div>
    </>
  );
}

function SplitChartView({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div className="flex h-[150px] flex-col justify-center gap-4 px-2">
      <div className="flex h-5 overflow-hidden rounded-full">
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, backgroundColor: p.color }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-ink-muted dark:text-slate-400">{p.label}</span>
            <span className="text-xs font-semibold text-ink dark:text-slate-100">
              {Math.round((p.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewCard({ card }: { card: CardConfig }) {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink dark:text-slate-100">{card.title}</p>
          <p className="text-xs text-ink-muted dark:text-slate-400">{card.valueLabel}</p>
        </div>
        <Link href={card.href} className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">
          Open calculator →
        </Link>
      </div>

      <div className="mt-3">
        <p className="font-display text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          {card.value}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {card.chips.map((c) => (
          <div key={c.label} className={chip}>
            {c.icon}
            <div>
              <p className={chipLabel}>{c.label}</p>
              <p className={chipValue}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-b from-brand-50/50 to-white p-2 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
        {card.chart.kind === 'area' ? (
          <AreaChartView points={card.chart.points} years={card.chart.years} />
        ) : (
          <SplitChartView parts={card.chart.parts} />
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
        {card.stats.map((s) => (
          <div key={s.label}>
            <p className={chipLabel}>{s.label}</p>
            <p className={chipValue}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = CARDS.length;

  useEffect(() => {
    if (paused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [paused, count]);

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Calculator examples"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="w-full rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card dark:border-slate-700/70 dark:bg-slate-800/80 sm:p-6">
        <PreviewCard key={CARDS[index].id} card={CARDS[index]} />
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous example"
          className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-ink-muted transition hover:text-brand-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {CARDS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${c.title}`}
              aria-current={i === index}
              className={
                i === index
                  ? 'h-2 w-6 rounded-full bg-brand-600 transition-all dark:bg-brand-400'
                  : 'h-2 w-2 rounded-full bg-slate-300 transition-all hover:bg-slate-400 dark:bg-slate-600'
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next example"
          className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-ink-muted transition hover:text-brand-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
