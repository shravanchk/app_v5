import React from 'react';
import Link from 'next/link';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

type Variant = 'tax' | 'regime' | 'emi' | 'salary';

type Guide = {
  title: string; href: string; category: string; minutes: number; updated: string;
  variant: Variant; from: string; to: string;
};

const GUIDES: Guide[] = [
  { title: 'Tax on ₹12 Lakh Salary: why you pay ₹0', href: '/guides/tax-on-12-lakh-salary-fy-2026-27', category: 'Taxation', minutes: 6, updated: 'Jun 28, 2026', variant: 'tax', from: '#6d28d9', to: '#2563eb' },
  { title: 'Old vs New Regime: where is the breakeven?', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27', category: 'Taxation', minutes: 7, updated: 'Jun 28, 2026', variant: 'regime', from: '#2563eb', to: '#0ea5e9' },
  { title: 'How much EMI is safe for your income?', href: '/guides/how-much-emi-is-safe', category: 'Loans', minutes: 5, updated: 'Mar 14, 2026', variant: 'emi', from: '#0891b2', to: '#10b981' },
  { title: 'CTC to in-hand salary, explained', href: '/guides/ctc-to-in-hand-salary', category: 'Salary', minutes: 6, updated: 'Jun 28, 2026', variant: 'salary', from: '#d97706', to: '#e11d48' },
];

const STROKE = 'rgba(255,255,255,0.78)';
const FILL_SOFT = 'rgba(255,255,255,0.16)';
const FILL_MID = 'rgba(255,255,255,0.30)';
const FONT = 'Manrope, "Source Sans 3", sans-serif';

function Scene({ variant }: { variant: Variant }) {
  const common = 'absolute inset-0 h-full w-full';
  if (variant === 'tax') {
    return (
      <svg viewBox="0 0 160 90" className={common} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <g fill={FILL_MID} stroke={STROKE} strokeWidth="1.2">
          <ellipse cx="62" cy="58" rx="23" ry="6.5" />
          <ellipse cx="62" cy="49" rx="23" ry="6.5" />
          <ellipse cx="62" cy="40" rx="23" ry="6.5" />
        </g>
        <text x="62" y="44" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily={FONT}>₹</text>
        <g className="motion-safe:animate-gc-float" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx="120" cy="32" r="18" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.4" />
          <text x="120" y="37" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily={FONT}>₹0</text>
        </g>
      </svg>
    );
  }
  if (variant === 'regime') {
    return (
      <svg viewBox="0 0 160 90" className={common} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <line x1="60" y1="72" x2="138" y2="72" stroke={STROKE} strokeWidth="1.2" />
        <rect x="72" y="32" width="20" height="40" rx="3" fill={FILL_MID} stroke={STROKE} strokeWidth="1.2"
          className="motion-safe:animate-gc-grow" style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }} />
        <rect x="108" y="46" width="20" height="26" rx="3" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.2"
          className="motion-safe:animate-gc-grow" style={{ transformBox: 'fill-box', transformOrigin: 'center bottom', animationDelay: '0.7s' }} />
        <text x="96" y="26" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily={FONT}>vs</text>
      </svg>
    );
  }
  if (variant === 'emi') {
    return (
      <svg viewBox="0 0 160 90" className={common} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <g stroke={STROKE} strokeWidth="1.3" fill={FILL_SOFT} className="motion-safe:animate-gc-float" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <path d="M86 26 L102 14 L118 26 Z" />
          <rect x="90" y="26" width="24" height="18" rx="1.5" />
        </g>
        <g>
          <rect x="60" y="62" width="24" height="9" rx="4.5" fill="rgba(16,185,129,0.9)" />
          <rect x="86" y="62" width="24" height="9" fill="rgba(245,158,11,0.85)" />
          <rect x="112" y="62" width="24" height="9" rx="4.5" fill="rgba(244,63,94,0.85)" />
        </g>
        <path d="M67 50 L77 50 L72 58 Z" fill="#fff" className="motion-safe:animate-gc-float"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: '0.5s' }} />
      </svg>
    );
  }
  // salary — CTC funnel with dropping coins
  return (
    <svg viewBox="0 0 160 90" className={common} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <path d="M52 30 L124 30 L98 56 L98 68 L78 68 L78 56 Z" fill={FILL_SOFT} stroke={STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      <g fill="#fff">
        <circle cx="88" cy="22" r="5" className="motion-safe:animate-gc-drop" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        <circle cx="88" cy="22" r="5" className="motion-safe:animate-gc-drop" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: '0.9s' }} />
        <circle cx="88" cy="22" r="5" className="motion-safe:animate-gc-drop" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: '1.8s' }} />
      </g>
    </svg>
  );
}

function Thumb({ variant, category, from, to }: { variant: Variant; category: string; from: string; to: string }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5), transparent 45%)' }} />
      <Scene variant={variant} />
      <span className="absolute bottom-3 left-4 z-10 text-xs font-bold uppercase tracking-[0.12em] text-white/90">{category}</span>
    </div>
  );
}

export default function GuideCards() {
  return (
    <section id="guides" className="border-y border-slate-200/60 bg-slate-50 py-14 dark:border-slate-800/60 dark:bg-slate-800/30 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Insights & guides"
          title="Guides to improve your finances"
          subtitle="Plain-English explainers with real worked examples — no jargon."
          action={{ label: 'All guides', href: '/guides' }}
        />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70"
            >
              <Thumb variant={g.variant} category={g.category} from={g.from} to={g.to} />
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-base font-semibold leading-snug text-ink group-hover:text-brand-700 dark:text-white">{g.title}</h3>
                <p className="mt-auto pt-3 text-xs text-ink-muted dark:text-slate-400">{g.updated} · {g.minutes} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}