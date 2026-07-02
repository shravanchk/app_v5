import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDown, Menu, X, Search, Sun, Moon, ArrowLeft } from 'lucide-react';
import { cn } from '../ui/cn';
import SearchModal from './SearchModal';

type NavLink = { label: string; href: string };

const CALCULATORS: NavLink[] = [
  { label: 'EMI / Loan Calculator', href: '/loan-calculator' },
  { label: 'Income Tax Calculator', href: '/income-tax-calculator' },
  { label: 'SIP Calculator', href: '/sip-calculator' },
  { label: 'PPF Calculator', href: '/ppf-calculator' },
  { label: 'GST Calculator', href: '/gst-calculator' },
  { label: 'Salary Calculator', href: '/salary-calculator' },
  { label: 'Capital Gains Calculator', href: '/capital-gains-calculator' },
  { label: 'HRA Exemption Calculator', href: '/hra-calculator' },
  { label: 'Gratuity Calculator', href: '/gratuity-calculator' },
];

const REGIONS: NavLink[] = [
  { label: 'India calculators', href: '/india-calculators' },
  { label: 'US calculators', href: '/us-calculators' },
  { label: 'UK & Europe calculators', href: '/eu-calculators' },
  { label: 'Health & fitness', href: '/health-calculators' },
  { label: 'Everyday tools', href: '/tools' },
];

const RESOURCES: NavLink[] = [
  { label: 'About Upaman', href: '/about' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Editorial Policy', href: '/editorial-policy' },
  { label: 'Review Process', href: '/review-process' },
  { label: 'Contact', href: '/contact' },
];

function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const isDark = typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark';
    setDark(isDark);
    document.body.classList.toggle('dark-theme', isDark);
  }, []);
  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.body.classList.toggle('dark-theme', next);
      try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (e) { /* ignore */ }
      return next;
    });
  };
  return [dark, toggle];
}

function Dropdown({ label, items, footerLabel, footerItems }: { label: string; items: NavLink[]; footerLabel?: string; footerItems?: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  const linkCls = 'block rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white';
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:text-brand-700 dark:text-slate-300 dark:hover:text-white"
      >
        {label}
        <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-card dark:border-slate-700 dark:bg-slate-800">
          {items.map((it) => (
            <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className={linkCls}>
              {it.label}
            </Link>
          ))}
          {footerItems && footerItems.length ? (
            <>
              <div className="my-1.5 border-t border-slate-100 dark:border-slate-700" />
              {footerLabel ? (
                <p className="px-3 pb-1 pt-1 text-xs font-bold uppercase tracking-wide text-ink-muted dark:text-slate-500">{footerLabel}</p>
              ) : null}
              {footerItems.map((it) => (
                <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className={linkCls}>
                  {it.label}
                </Link>
              ))}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const isHome = router.pathname === '/';
  const [dark, toggleDark] = useDarkMode();
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setDrawer(false); setSearch(false); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-700/70 dark:bg-slate-900/85">
      <nav className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 xl:px-16" aria-label="Primary">
        <div className="flex items-center gap-2">
        {!isHome && (
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-ink-soft hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/upaman-elephant-logo.svg" alt="" className="h-8 w-8" width={32} height={32} />
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold text-ink dark:text-white">Upaman</span>
            <span className="hidden text-[0.68rem] text-ink-muted dark:text-slate-400 sm:block">Make better financial decisions</span>
          </span>
        </Link>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <Dropdown label="Calculators" items={CALCULATORS} footerLabel="Browse by region" footerItems={REGIONS} />
          <Link href="/workflows" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:text-brand-700 dark:text-slate-300 dark:hover:text-white">Workflows</Link>
          <Link href="/guides" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:text-brand-700 dark:text-slate-300 dark:hover:text-white">Guides</Link>
          <Link href="/tools" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:text-brand-700 dark:text-slate-300 dark:hover:text-white">Tools</Link>
          <Dropdown label="Resources" items={RESOURCES} />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearch(true)}
            aria-label="Search"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-ink-muted hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            type="button"
            onClick={toggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-ink-soft hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-ink-soft hover:bg-slate-50 md:hidden dark:border-slate-700 dark:text-slate-300"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>
      </header>

      {drawer ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-card dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-ink dark:text-white">Menu</span>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="rounded-lg p-2 text-ink-soft hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-ink-muted">Calculators</p>
            <div className="mt-1">
              {CALCULATORS.map((it) => (
                <Link key={it.href} href={it.href} onClick={() => setDrawer(false)} className="block rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800">{it.label}</Link>
              ))}
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-muted">Browse by region</p>
            <div className="mt-1">
              {REGIONS.map((it) => (
                <Link key={it.href} href={it.href} onClick={() => setDrawer(false)} className="block rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800">{it.label}</Link>
              ))}
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-muted">Explore</p>
            <div className="mt-1">
              <Link href="/workflows" onClick={() => setDrawer(false)} className="block rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-brand-50 dark:text-slate-300 dark:hover:bg-slate-800">Workflows</Link>
              <Link href="/guides" onClick={() => setDrawer(false)} className="block rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-brand-50 dark:text-slate-300 dark:hover:bg-slate-800">Guides</Link>
              <Link href="/tools" onClick={() => setDrawer(false)} className="block rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-brand-50 dark:text-slate-300 dark:hover:bg-slate-800">Everyday Tools</Link>
              {RESOURCES.map((it) => (
                <Link key={it.href} href={it.href} onClick={() => setDrawer(false)} className="block rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-brand-50 dark:text-slate-300 dark:hover:bg-slate-800">{it.label}</Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {search ? <SearchModal onClose={() => setSearch(false)} /> : null}
    </>
  );
}
