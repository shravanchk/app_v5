import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Plus, Trash2, Download, RotateCcw, Check, AlertTriangle, CalendarClock, Sparkles } from 'lucide-react';
import { CalcLayout } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import ResultActions from '../ResultActions';
import { NumberField, SelectField, NumericInput, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { cn } from '../ui/cn';
import { useShareableState, collectSharedValues, encodeRows, decodeRows, toOption } from '../../utils/shareableState';
import {
  DEFAULT_CATEGORIES, COUNTRIES, COUNTRY_CODES, computePlan, normalizePercents, formatMoney, toCSV, sanitizePlan
} from '../../utils/weddingBudget';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';
import { FaqList, linkCls, h2Cls } from '../tools/dates/DateKit';
import { trackEvent } from '../../utils/analytics';

const URL = 'https://upaman.com/wedding-budget-planner';
const STORAGE_KEY = 'upaman:wedding-budget-planner:v1';

const CAT_FIELDS = ['id', 'name', 'pct'];
const EXP_FIELDS = ['categoryId', 'name', 'vendor', 'estimate', 'actual', 'paid', 'dueDate'];
const SHARE_DEFAULTS = { b: '33000', g: '115', c: 'US', cat: encodeRows(DEFAULT_CATEGORIES, CAT_FIELDS), x: '' };

const COUNTRY_OPTIONS = COUNTRY_CODES.map((code) => ({ value: code, label: `${COUNTRIES[code].label} (${COUNTRIES[code].currency})` }));

// One hue per category, in the order they are listed, for the donut and bars.
const PALETTE = ['#1d4e89', '#326cae', '#0f766e', '#14b8a6', '#7c3aed', '#a78bfa', '#d97706', '#f59e0b', '#be185d', '#f472b6', '#475569', '#94a3b8', '#cbd5e1', '#0ea5e9', '#22c55e'];

const STATUS = {
  ok: { label: 'On track', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', bar: 'bg-emerald-500' },
  tight: { label: 'Nearly spent', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', bar: 'bg-amber-500' },
  over: { label: 'Over slice', cls: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', bar: 'bg-rose-500' },
  empty: { label: 'Nothing yet', cls: 'bg-slate-100 text-ink-muted dark:bg-slate-700 dark:text-slate-400', bar: 'bg-slate-300' }
};

const FAQ = [
  { question: 'How much should I budget for a wedding?', answer: 'Start from what you can pay without borrowing: savings earmarked for the wedding plus what you can set aside each month until the date, plus any family contributions that are actually promised. The typical US wedding runs around $33,000 for about 115 guests, and UK weddings around £20,000 for 80, but the median is well below those averages. A budget you can fund is a better anchor than a national average.' },
  { question: 'What is a typical wedding budget breakdown?', answer: 'Venue and catering take the largest share, usually 40 to 45% once food and drink are included. Photography and video run 10 to 12%, attire and beauty 8%, flowers and decor 8%, music 7%, and a planner around 5%. Rings, stationery, cake, transport, the ceremony and favours each take 2 to 3%. Keeping a 5% contingency is the single most useful line, because almost every wedding picks up costs that were not on the first list.' },
  { question: 'What is the difference between estimate, actual and paid?', answer: 'The estimate is the quote or your own guess before anything is signed. The actual is the contract price or final invoice once you know it. Paid is what has left your account so far, including deposits. The tracker uses the actual when there is one and the estimate otherwise, and compares that committed figure against the category slice.' },
  { question: 'How is cost per guest calculated?', answer: 'Total budget divided by the guest count. It is the fastest lever on a wedding budget: catering, bar, rentals, invitations, favours and cake all scale with headcount, so cutting ten guests from a 100-person wedding typically saves 7 to 9% of the total, not just the plates.' },
  { question: 'Is my data saved anywhere?', answer: 'The plan is saved in your browser only, on this device, and nothing is sent to a server. The share link carries the plan in the URL so a partner or parent can open the same numbers on their own device. Clearing your browser data or using Clear plan removes it.' },
  { question: 'What costs do couples forget?', answer: 'Service charges and gratuities on catering, which can add 20 to 25% to the venue bill. Alterations, which are quoted separately from the dress. Overtime for photographers, DJs and the venue itself. Postage, marriage licence fees, vendor meals, hotel room blocks, and the rehearsal dinner and day-after brunch. Put a line in the contingency slice for each one you expect.' }
];

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Eases a displayed number from its previous value to the new one. The first
// render shows the target directly, so static HTML and reduced-motion users
// never see a count-up.
function useCountUp(target, duration = 700) {
  const [display, setDisplay] = useState(target);
  const current = useRef(target);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current || reducedMotion()) {
      mounted.current = true;
      current.current = target;
      setDisplay(target);
      return undefined;
    }
    const from = current.current;
    if (from === target) return undefined;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const value = from + (target - from) * eased;
      current.current = value;
      setDisplay(value);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

// Headline figure with a count-up and a soft ring flash when it changes.
function StatTile({ label, value, country, tone = 'default', sub, emphasis }) {
  const shown = useCountUp(value);
  const [flash, setFlash] = useState(0);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlash((n) => n + 1);
    }
  }, [value]);
  const toneCls = tone === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : tone === 'negative' ? 'text-rose-600 dark:text-rose-400' : 'text-ink dark:text-white';
  return (
    <div className={cn('relative overflow-hidden rounded-xl border p-4', emphasis ? 'border-brand-200 bg-brand-50/60 dark:border-brand-800/60 dark:bg-brand-900/20' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60')}>
      {flash > 0 && <span key={flash} aria-hidden className="pointer-events-none absolute inset-0 rounded-xl animate-pulse-ring" />}
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400">{label}</p>
      <p className={cn('mt-1 font-display text-xl font-bold tracking-tight tabular-nums sm:text-2xl', toneCls)}>{formatMoney(shown, country)}</p>
      {sub ? <p className="mt-0.5 text-xs text-ink-muted dark:text-slate-500">{sub}</p> : null}
    </div>
  );
}

// Allocation donut. Segment lengths are CSS-transitioned so a percentage edit
// visibly redistributes the ring instead of snapping.
function Donut({ categories, pctTotal }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = categories.map((c, i) => {
    const len = (Math.max(0, Math.min(100, Number(c.pct) || 0)) / 100) * circ;
    const seg = { key: c.id, len, offset, color: PALETTE[i % PALETTE.length], name: c.name, pct: c.pct };
    offset += len;
    return seg;
  });
  return (
    <svg viewBox="0 0 100 100" className="h-40 w-40 shrink-0 -rotate-90" role="img" aria-label={`Budget split: ${pctTotal}% allocated`}>
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="12" className="stroke-slate-100 dark:stroke-slate-700" />
      {segments.map((s) => (
        <circle
          key={s.key}
          cx="50" cy="50" r={r} fill="none" strokeWidth="12" stroke={s.color} strokeLinecap="butt"
          strokeDasharray={`${s.len} ${circ - s.len}`}
          strokeDashoffset={-s.offset}
          style={{ transition: 'stroke-dasharray 0.7s ease-out, stroke-dashoffset 0.7s ease-out' }}
        >
          <title>{`${s.name}: ${s.pct}%`}</title>
        </circle>
      ))}
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="rotate-90 fill-ink font-display text-[13px] font-bold dark:fill-white" style={{ transformOrigin: '50px 50px' }}>
        {Math.round(pctTotal)}%
      </text>
    </svg>
  );
}

function Bar({ ratio, status, delayMs = 0 }) {
  const width = `${Math.min(100, Math.max(0, (Number.isFinite(ratio) ? ratio : 1) * 100))}%`;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
      <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', STATUS[status].bar)} style={{ width, transitionDelay: `${delayMs}ms` }} />
    </div>
  );
}

const cellCls =
  'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-ink outline-none transition focus:border-brand-400 ' +
  'focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
const smallBtn = 'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-brand-300';

const newId = () => `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const WeddingBudgetPlanner = () => {
  const [budget, setBudget] = useState(SHARE_DEFAULTS.b);
  const [guests, setGuests] = useState(SHARE_DEFAULTS.g);
  const [country, setCountry] = useState('US');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [expenses, setExpenses] = useState([]);
  const [tab, setTab] = useState('plan');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  const [draft, setDraft] = useState({ categoryId: 'venue', name: '', vendor: '', estimate: '', actual: '', paid: '', dueDate: '' });
  const hydrated = useRef(false);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(''), 2400);
  };

  const applyPlan = (plan) => {
    setBudget(plan.budget || SHARE_DEFAULTS.b);
    setGuests(plan.guests || SHARE_DEFAULTS.g);
    setCountry(plan.country);
    setCategories(plan.categories);
    setExpenses(plan.expenses);
  };

  // A shared link wins over the device's saved plan; otherwise restore the
  // saved plan. Declared before the share hook so its restore runs first.
  useEffect(() => {
    const shared = collectSharedValues(window.location.search, SHARE_DEFAULTS);
    if (!Object.keys(shared).length) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const plan = sanitizePlan(JSON.parse(raw));
          applyPlan(plan);
          if (plan.expenses.length) showToast('Restored your saved plan');
        }
      } catch (error) {
        // Corrupt or blocked storage: start fresh.
      }
    }
    hydrated.current = true;
    // Mount-only by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const encodedCats = useMemo(() => encodeRows(categories, CAT_FIELDS), [categories]);
  const encodedExp = useMemo(() => encodeRows(expenses, EXP_FIELDS), [expenses]);

  useShareableState({
    values: { b: budget, g: guests, c: country, cat: encodedCats, x: encodedExp },
    defaults: SHARE_DEFAULTS,
    onRestore: (shared) => {
      const plan = sanitizePlan({
        budget: shared.b, guests: shared.g,
        country: toOption(shared.c, COUNTRY_CODES, 'US'),
        categories: 'cat' in shared ? decodeRows(shared.cat, CAT_FIELDS, 20) : DEFAULT_CATEGORIES,
        expenses: 'x' in shared ? decodeRows(shared.x, EXP_FIELDS, 200).map((e) => ({ ...e, id: newId() })) : []
      });
      applyPlan({ ...plan, budget: plan.budget || SHARE_DEFAULTS.b, guests: plan.guests || SHARE_DEFAULTS.g });
      showToast('Opened a shared plan');
    }
  });

  // Autosave to this device, debounced, once the initial restore has settled.
  useEffect(() => {
    if (!hydrated.current) return undefined;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ budget, guests, country, categories, expenses }));
        setSavedAt(Date.now());
      } catch (error) {
        // Private mode or quota: the page still works for the session.
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [budget, guests, country, categories, expenses]);

  const computed = useMemo(() => computePlan({ budget, guests, categories, expenses }), [budget, guests, categories, expenses]);
  const money = (v, opts) => formatMoney(v, country, opts);
  const info = COUNTRIES[country];

  const setPct = (id, raw) => setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, pct: raw === '' ? '' : Math.min(100, Math.max(0, Number(raw) || 0)) } : c)));
  const renameCategory = (id, name) => setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: name.slice(0, 40) } : c)));
  const removeCategory = (id) => {
    if (expenses.some((e) => e.categoryId === id) && !window.confirm('This category has expenses. Delete them too?')) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setExpenses((prev) => prev.filter((e) => e.categoryId !== id));
  };
  const addCategory = () => {
    if (categories.length >= 20) return;
    const id = `c${Date.now().toString(36)}`;
    setCategories((prev) => [...prev, { id, name: 'New category', pct: 0 }]);
  };

  const addExpense = () => {
    if (!draft.name.trim() && !draft.estimate) {
      showToast('Give the item a name or an estimate');
      return;
    }
    const item = sanitizePlan({ categories, expenses: [{ ...draft, id: newId(), name: draft.name.trim() || 'Untitled item' }] }).expenses[0];
    if (!item) return;
    setExpenses((prev) => [item, ...prev]);
    setDraft((d) => ({ ...d, name: '', vendor: '', estimate: '', actual: '', paid: '', dueDate: '' }));
    trackEvent('wedding_planner', { action: 'add_expense' });
  };
  const updateExpense = (id, key, value) => setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, [key]: value } : e)));
  const removeExpense = (id) => setExpenses((prev) => prev.filter((e) => e.id !== id));
  const markPaid = (id) => setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, paid: Number(e.actual) > 0 ? e.actual : e.estimate } : e)));

  const useTypical = () => {
    setBudget(String(info.typicalBudget));
    setGuests(String(info.typicalGuests));
    showToast(`Typical ${info.label} wedding loaded`);
  };

  const exportCSV = () => {
    const blob = new Blob([toCSV({ categories, expenses }, computed)], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'upaman-wedding-budget.csv';
    a.click();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    trackEvent('wedding_planner', { action: 'export_csv' });
    showToast('CSV downloaded');
  };

  const clearPlan = () => {
    if (!window.confirm('Clear the whole plan on this device? This cannot be undone.')) return;
    setCategories(DEFAULT_CATEGORIES);
    setExpenses([]);
    setBudget(SHARE_DEFAULTS.b);
    setGuests(SHARE_DEFAULTS.g);
    setCountry('US');
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) { /* ignore */ }
    showToast('Plan cleared');
  };

  const visibleExpenses = filter === 'all' ? expenses : expenses.filter((e) => e.categoryId === filter);
  const catName = (id) => (categories.find((c) => c.id === id) || {}).name || id;
  const in30 = useMemo(() => {
    const limit = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    return computed.upcoming.filter((e) => e.dueDate <= limit).reduce((s, e) => s + e.outstanding, 0);
  }, [computed.upcoming]);

  const summaryLines = [
    `Total budget: ${money(computed.budget)} for ${guests || 0} guests (${money(computed.perGuest)} per guest)`,
    `Committed so far: ${money(computed.committed)} (${Math.round(computed.usedRatio * 100)}% of budget), paid ${money(computed.paid)}, still to pay ${money(computed.due)}`,
    ...computed.categories.filter((c) => c.allocated > 0 || c.committed > 0).map((c) => `${c.name}: ${c.pct}% = ${money(c.allocated)}${c.committed ? `, committed ${money(c.committed)}` : ''}`)
  ];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Wedding Budget Planner & Expense Tracker',
    url: URL,
    description: 'Free wedding budget planner: split your budget across venue, catering, photography and more, then track quotes, contracts, deposits and due dates. Saves on your device, shareable by link.',
    applicationCategory: 'FinanceApplication',
    priceCurrency: 'USD',
    featureList: ['Budget breakdown by percentage', 'Cost per guest', 'Expense tracker with estimate, actual and paid', 'Payment due dates and overdue alerts', 'US, UK, EU, Canada, Australia and India currencies', 'Saves on device', 'Shareable link', 'CSV export']
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'US Calculators', item: 'https://upaman.com/us-calculators' },
    { name: 'Wedding Budget Planner', item: URL }
  ]);

  return (
    <>
      <Head>
        <title>Wedding Budget Planner & Expense Tracker | Free, Saves on Device | Upaman</title>
        <meta name="description" content="Plan a wedding budget by category, see cost per guest, and track every quote, contract, deposit and due date. Free wedding expense tracker with budget breakdown percentages, shareable link and CSV export." />
        <meta name="keywords" content="wedding budget planner, wedding budget calculator, wedding expense tracker, wedding budget breakdown, wedding cost calculator, wedding budget spreadsheet, cost per guest wedding" />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="Wedding Budget Planner & Expense Tracker | Upaman" />
        <meta property="og:description" content="Split your wedding budget by category, then track quotes, deposits and due dates. Free, private, shareable." />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Wedding Budget Planner | Upaman" />
        <meta name="twitter:description" content="Budget breakdown, cost per guest, and an expense tracker with due dates." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(FAQ)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Personal Finance · Life events"
        title="Wedding Budget Planner & Expense Tracker"
        subtitle="Set a total, split it across categories, then log every quote, contract and deposit as it happens. Your plan stays on this device and can be shared by link with a partner or parent."
      >
        {/* Setup */}
        <Card className="p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SelectField id="wb-country" label="Country & currency" value={country} onChange={(v) => setCountry(toOption(v, COUNTRY_CODES, 'US'))} options={COUNTRY_OPTIONS} />
            <NumberField id="wb-budget" label="Total wedding budget" prefix={info.currency} value={budget} onChange={setBudget} step={500} />
            <NumberField id="wb-guests" label="Guest count" value={guests} onChange={setGuests} step={5} suffix="guests" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={useTypical} className={smallBtn}><Sparkles className="h-3.5 w-3.5" />Use a typical {info.label} wedding</button>
            <button type="button" onClick={exportCSV} className={smallBtn}><Download className="h-3.5 w-3.5" />Export CSV</button>
            <button type="button" onClick={clearPlan} className={cn(smallBtn, 'hover:border-rose-300 hover:text-rose-600')}><RotateCcw className="h-3.5 w-3.5" />Clear plan</button>
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-ink-muted dark:text-slate-500" aria-live="polite">
              {savedAt ? (<><Check key={savedAt} className="h-3.5 w-3.5 animate-fade-up text-emerald-500" />Saved on this device</>) : 'Autosaves on this device'}
            </span>
          </div>
        </Card>

        {/* Headline numbers */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Total budget" value={computed.budget} country={country} emphasis sub={computed.perGuest ? `${money(computed.perGuest)} per guest` : 'Enter a guest count'} />
          <StatTile label="Committed" value={computed.committed} country={country} tone={computed.overBudget ? 'negative' : 'default'} sub={`${Math.round(computed.usedRatio * 100)}% of budget · ${computed.itemCount} item${computed.itemCount === 1 ? '' : 's'}`} />
          <StatTile label="Paid so far" value={computed.paid} country={country} tone="positive" sub={computed.committed ? `${Math.round(computed.paidRatio * 100)}% of commitments` : 'Nothing paid yet'} />
          <StatTile label="Still to pay" value={computed.due} country={country} sub={in30 ? `${money(in30)} due in 30 days` : 'No payments due in 30 days'} />
        </div>

        {/* Budget health bar */}
        <Card className="mt-3 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-muted dark:text-slate-400">
            <span>Budget used</span>
            <span className={cn('tabular-nums', computed.overBudget && 'text-rose-600 dark:text-rose-400')}>
              {computed.overBudget ? `Over by ${money(-computed.remaining)}` : `${money(computed.remaining)} unassigned`}
            </span>
          </div>
          <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="absolute inset-y-0 left-0 rounded-full bg-brand-500 transition-[width] duration-700 ease-out" style={{ width: `${Math.min(100, computed.usedRatio * 100)}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-[width] duration-700 ease-out" style={{ width: `${Math.min(100, (computed.paid / (computed.budget || 1)) * 100)}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted dark:text-slate-500">
            <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />Paid</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brand-500" />Committed (quotes + contracts)</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />Budget</span>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Tabs
            tabs={[{ id: 'plan', label: 'Budget split' }, { id: 'track', label: `Expenses${expenses.length ? ` (${expenses.length})` : ''}` }, { id: 'timeline', label: `Payments due${computed.upcoming.length ? ` (${computed.upcoming.length})` : ''}` }]}
            active={tab}
            onChange={setTab}
          />
          {Math.abs(computed.unallocatedPct) >= 0.1 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              Split adds up to {computed.pctTotal}%
              <button type="button" onClick={() => setCategories(normalizePercents(categories))} className="underline underline-offset-2">Rebalance to 100%</button>
            </span>
          )}
        </div>

        {tab === 'plan' && (
          <div key="plan" className="mt-4 grid animate-fade-up grid-cols-1 gap-5 lg:grid-cols-5">
            <Card className="p-4 sm:p-5 lg:col-span-3">
              <div className="hidden grid-cols-[1fr_4.5rem_6.5rem_7rem_2rem] items-end gap-2 text-xs font-medium text-ink-muted dark:text-slate-400 sm:grid">
                <span>Category</span><span>Share</span><span className="text-right">Allocated</span><span className="text-right">Committed</span><span />
              </div>
              <ul className="mt-2 space-y-3">
                {computed.categories.map((c, i) => (
                  <li key={c.id} className="animate-slide-in" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                    <div className="grid grid-cols-[1fr_4.5rem_2rem] items-center gap-2 sm:grid-cols-[1fr_4.5rem_6.5rem_7rem_2rem]">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                        <input aria-label="Category name" value={c.name} onChange={(e) => renameCategory(c.id, e.target.value)} className={cn(cellCls, 'border-transparent bg-transparent px-1 font-medium shadow-none hover:border-slate-200 dark:bg-transparent')} />
                      </div>
                      <div className="relative">
                        <NumericInput aria-label={`${c.name} share of budget`} value={c.pct} min={0} max={100} step={0.5} onChange={(v) => setPct(c.id, v)} className={cn(cellCls, 'pr-6 text-right tabular-nums')} />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-ink-muted">%</span>
                      </div>
                      <span className="hidden text-right text-sm tabular-nums text-ink dark:text-white sm:block">{money(c.allocated)}</span>
                      <span className={cn('hidden text-right text-sm tabular-nums sm:block', c.status === 'over' ? 'text-rose-600 dark:text-rose-400' : 'text-ink-soft dark:text-slate-300')}>{c.committed ? money(c.committed) : '—'}</span>
                      <button type="button" aria-label={`Remove ${c.name}`} onClick={() => removeCategory(c.id)} className="justify-self-end rounded-md p-1 text-ink-muted transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 pl-[1.125rem]">
                      <Bar ratio={c.usedRatio} status={c.status} delayMs={i * 25} />
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', STATUS[c.status].cls)}>{STATUS[c.status].label}</span>
                    </div>
                    <p className="mt-1 pl-[1.125rem] text-xs text-ink-muted dark:text-slate-500 sm:hidden">
                      {money(c.allocated)} allocated{c.committed ? ` · ${money(c.committed)} committed` : ''}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={addCategory} className={smallBtn}><Plus className="h-3.5 w-3.5" />Add category</button>
                <button type="button" onClick={() => setCategories(DEFAULT_CATEGORIES)} className={smallBtn}><RotateCcw className="h-3.5 w-3.5" />Reset to typical split</button>
              </div>
            </Card>

            <div className="space-y-4 lg:col-span-2">
              <Card className="flex items-center gap-5 p-5">
                <Donut categories={categories} pctTotal={computed.pctTotal} />
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-ink dark:text-white">Where the money goes</p>
                  <ul className="mt-2 space-y-1 text-ink-soft dark:text-slate-300">
                    {computed.categories.slice(0, 5).map((c, i) => (
                      <li key={c.id} className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                        <span className="truncate">{c.name}</span>
                        <span className="ml-auto shrink-0 tabular-nums text-ink-muted">{money(c.allocated)}</span>
                      </li>
                    ))}
                  </ul>
                  {computed.categories.length > 5 && <p className="mt-1 text-xs text-ink-muted">+ {computed.categories.length - 5} more</p>}
                </div>
              </Card>
              <Card className="p-5 text-sm text-ink-soft dark:text-slate-300">
                <p className="font-semibold text-ink dark:text-white">Per-guest view</p>
                <ul className="mt-2 space-y-1.5">
                  <li className="flex justify-between"><span>Whole budget per guest</span><span className="tabular-nums">{computed.perGuest ? money(computed.perGuest) : '—'}</span></li>
                  <li className="flex justify-between"><span>Venue & catering per guest</span><span className="tabular-nums">{computed.perGuest && computed.categories[0] ? money(computed.categories[0].allocated / (Number(guests) || 1)) : '—'}</span></li>
                  <li className="flex justify-between"><span>Saved by inviting 10 fewer</span><span className="tabular-nums text-emerald-600 dark:text-emerald-400">{computed.perGuest ? `≈ ${money(computed.perGuest * 10 * 0.8)}` : '—'}</span></li>
                </ul>
                <p className="mt-2 text-xs text-ink-muted dark:text-slate-500">Roughly 80% of the per-guest figure scales with headcount; the venue hire, attire and photography do not.</p>
              </Card>
              <ResultActions title="Wedding budget plan" summaryLines={summaryLines} fileName="upaman-wedding-budget.txt" />
            </div>
          </div>
        )}

        {tab === 'track' && (
          <div key="track" className="mt-4 animate-fade-up space-y-4">
            <Card className="p-4 sm:p-5">
              <p className="text-sm font-semibold text-ink dark:text-white">Add an expense</p>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-[1.4fr_1.2fr_1fr_1fr_1fr_1fr_1fr_auto]">
                <input aria-label="Item" placeholder="Item (e.g. Venue hire)" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addExpense()} className={cn(cellCls, 'col-span-2 md:col-span-1')} />
                <select aria-label="Category" value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })} className={cellCls}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input aria-label="Vendor" placeholder="Vendor" value={draft.vendor} onChange={(e) => setDraft({ ...draft, vendor: e.target.value })} className={cellCls} />
                <NumericInput aria-label="Estimate" placeholder="Estimate" value={draft.estimate} onChange={(v) => setDraft({ ...draft, estimate: v })} className={cellCls} />
                <NumericInput aria-label="Actual" placeholder="Actual" value={draft.actual} onChange={(v) => setDraft({ ...draft, actual: v })} className={cellCls} />
                <NumericInput aria-label="Paid" placeholder="Paid" value={draft.paid} onChange={(v) => setDraft({ ...draft, paid: v })} className={cellCls} />
                <input aria-label="Due date" type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} className={cellCls} />
                <button type="button" onClick={addExpense} className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98] md:col-span-1"><Plus className="h-4 w-4" />Add</button>
              </div>
              <p className="mt-2 text-xs text-ink-muted dark:text-slate-500">Estimate is the quote; fill in Actual once a contract is signed. Paid includes deposits.</p>
            </Card>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="wb-filter" className="text-xs font-medium text-ink-muted dark:text-slate-400">Show</label>
              <select id="wb-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className={cn(cellCls, 'w-auto')}>
                <option value="all">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {filter !== 'all' && (() => {
                const c = computed.categories.find((x) => x.id === filter);
                return c ? <span className="text-xs text-ink-muted dark:text-slate-400">{money(c.committed)} of {money(c.allocated)} · <span className={cn('font-medium', c.status === 'over' ? 'text-rose-600' : 'text-emerald-600')}>{STATUS[c.status].label}</span></span> : null;
              })()}
            </div>

            {visibleExpenses.length === 0 ? (
              <Card className="p-8 text-center text-sm text-ink-muted dark:text-slate-400">
                <CalendarClock className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                No expenses yet. Add your first quote above, even a rough one, and the budget bars will start to fill.
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="hidden grid-cols-[1.4fr_1.2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 border-b border-slate-100 px-4 py-2 text-xs font-medium text-ink-muted dark:border-slate-700 dark:text-slate-400 md:grid">
                  <span>Item</span><span>Category</span><span>Vendor</span><span>Estimate</span><span>Actual</span><span>Paid</span><span>Due</span><span className="w-[4.5rem]" />
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                  {visibleExpenses.map((e, i) => {
                    const committed = Number(e.actual) > 0 ? Number(e.actual) : Number(e.estimate) || 0;
                    const settled = committed > 0 && Number(e.paid) >= committed;
                    return (
                      <li key={e.id} className={cn('animate-slide-in px-4 py-3 transition-colors', settled && 'bg-emerald-50/40 dark:bg-emerald-900/10')} style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-[1.4fr_1.2fr_1fr_1fr_1fr_1fr_1fr_auto] md:items-center">
                          <input aria-label="Item" value={e.name} onChange={(ev) => updateExpense(e.id, 'name', ev.target.value)} className={cn(cellCls, 'col-span-2 font-medium md:col-span-1')} />
                          <select aria-label="Category" value={e.categoryId} onChange={(ev) => updateExpense(e.id, 'categoryId', ev.target.value)} className={cellCls}>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <input aria-label="Vendor" placeholder="Vendor" value={e.vendor} onChange={(ev) => updateExpense(e.id, 'vendor', ev.target.value)} className={cellCls} />
                          <label className="text-xs text-ink-muted md:hidden">Estimate<NumericInput aria-label="Estimate" value={e.estimate} onChange={(v) => updateExpense(e.id, 'estimate', v)} className={cellCls} /></label>
                          <NumericInput aria-label="Estimate" value={e.estimate} onChange={(v) => updateExpense(e.id, 'estimate', v)} className={cn(cellCls, 'hidden md:block')} />
                          <label className="text-xs text-ink-muted md:hidden">Actual<NumericInput aria-label="Actual" value={e.actual} onChange={(v) => updateExpense(e.id, 'actual', v)} className={cellCls} /></label>
                          <NumericInput aria-label="Actual" value={e.actual} onChange={(v) => updateExpense(e.id, 'actual', v)} className={cn(cellCls, 'hidden md:block')} />
                          <label className="text-xs text-ink-muted md:hidden">Paid<NumericInput aria-label="Paid" value={e.paid} onChange={(v) => updateExpense(e.id, 'paid', v)} className={cellCls} /></label>
                          <NumericInput aria-label="Paid" value={e.paid} onChange={(v) => updateExpense(e.id, 'paid', v)} className={cn(cellCls, 'hidden md:block')} />
                          <label className="text-xs text-ink-muted md:hidden">Due<input aria-label="Due date" type="date" value={e.dueDate} onChange={(ev) => updateExpense(e.id, 'dueDate', ev.target.value)} className={cellCls} /></label>
                          <input aria-label="Due date" type="date" value={e.dueDate} onChange={(ev) => updateExpense(e.id, 'dueDate', ev.target.value)} className={cn(cellCls, 'hidden md:block')} />
                          <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1 md:w-[4.5rem]">
                            {!settled && committed > 0 && (
                              <button type="button" title="Mark fully paid" aria-label="Mark fully paid" onClick={() => markPaid(e.id)} className="rounded-md p-1.5 text-ink-muted transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30"><Check className="h-4 w-4" /></button>
                            )}
                            {settled && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Paid</span>}
                            <button type="button" aria-label="Delete expense" onClick={() => removeExpense(e.id)} className="rounded-md p-1.5 text-ink-muted transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
          </div>
        )}

        {tab === 'timeline' && (
          <div key="timeline" className="mt-4 animate-fade-up">
            {computed.upcoming.length === 0 ? (
              <Card className="p-8 text-center text-sm text-ink-muted dark:text-slate-400">
                <CalendarClock className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                Nothing outstanding with a due date. Add due dates to expenses in the Expenses tab and they line up here, soonest first.
              </Card>
            ) : (
              <Card className="p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-ink dark:text-white">Payment schedule</p>
                  <p className="text-xs text-ink-muted dark:text-slate-400">{money(in30)} due in the next 30 days · {money(computed.due)} outstanding in total</p>
                </div>
                <ol className="mt-4 space-y-0">
                  {computed.upcoming.map((e, i) => (
                    <li key={e.id} className="relative flex animate-slide-in gap-4 pb-5 pl-6 last:pb-0" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                      <span className={cn('absolute left-0 top-1.5 h-3 w-3 rounded-full ring-4 ring-white dark:ring-slate-800', e.overdue ? 'bg-rose-500' : 'bg-brand-500')} />
                      {i < computed.upcoming.length - 1 && <span className="absolute left-[5px] top-4 h-full w-0.5 bg-slate-200 dark:bg-slate-700" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink dark:text-white">{e.name}<span className="ml-2 text-xs font-normal text-ink-muted">{catName(e.categoryId)}{e.vendor ? ` · ${e.vendor}` : ''}</span></p>
                        <p className={cn('text-xs', e.overdue ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-ink-muted dark:text-slate-400')}>
                          {e.overdue ? 'Overdue · ' : 'Due '}{new Date(`${e.dueDate}T00:00:00`).toLocaleDateString(info.locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums text-ink dark:text-white">{money(e.outstanding)}</p>
                        <button type="button" onClick={() => markPaid(e.id)} className="text-xs font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">Mark paid</button>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            )}
          </div>
        )}

        <HowToSection
          name="How to plan a wedding budget"
          description="Set a total, split it, then track real quotes against the plan."
          steps={[
            { name: 'Set the total and guest count', text: 'Enter what you can actually fund and how many guests you expect. Pick your country so figures show in the right currency. The per-guest cost updates immediately.' },
            { name: 'Adjust the split', text: 'The default percentages follow a typical breakdown. Drag any category up or down, rename one, or add your own. The ring and the rebalance button keep the split at 100%.' },
            { name: 'Log quotes and contracts', text: 'Add each quote as an expense with its category. When you sign, fill in the actual price. Record deposits in Paid and add the balance due date.' },
            { name: 'Watch the bars and the schedule', text: 'Each category bar fills as you commit money and turns amber at 90% and red when over. The Payments due tab lines up every outstanding balance by date.' }
          ]}
        />

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className={h2Cls}>A typical wedding budget breakdown</h2>
            <p>
              Venue and catering dominate every wedding budget, and once food, drink, service charge and rentals are in
              they usually land between 40 and 45% of the total. The table shows the default split this planner uses and
              what each slice comes to at your current budget of <strong className="text-ink dark:text-white">{money(computed.budget)}</strong>.
              Treat it as a starting point. A couple who care most about photographs will happily run that line at 15% and
              trim flowers, and a backyard wedding moves most of the venue slice into catering and rentals.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full max-w-xl border-collapse text-sm">
                <thead>
                  <tr>
                    {['Category', 'Share', 'At your budget'].map((h) => <th key={h} className="border-b border-slate-200 px-2 py-1.5 text-left font-semibold text-ink dark:border-slate-700 dark:text-white">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {DEFAULT_CATEGORIES.map((c) => (
                    <tr key={c.id}>
                      <td className="border-b border-slate-100 px-2 py-1.5 dark:border-slate-800">{c.name}</td>
                      <td className="border-b border-slate-100 px-2 py-1.5 tabular-nums dark:border-slate-800">{c.pct}%</td>
                      <td className="border-b border-slate-100 px-2 py-1.5 tabular-nums dark:border-slate-800">{money((computed.budget * c.pct) / 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>How much does a wedding cost by country?</h2>
            <p>
              Averages are pulled up by a small number of very large weddings, so most couples spend less than the figures
              below. They are still a useful sanity check on cost per guest, which is the number that travels best between
              countries and between a 60-person and a 200-person wedding. Pick a country above to load its typical figures.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full max-w-xl border-collapse text-sm">
                <thead>
                  <tr>
                    {['Country', 'Typical budget', 'Typical guests', 'Per guest'].map((h) => <th key={h} className="border-b border-slate-200 px-2 py-1.5 text-left font-semibold text-ink dark:border-slate-700 dark:text-white">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {COUNTRY_CODES.map((code) => {
                    const c = COUNTRIES[code];
                    return (
                      <tr key={code} className={cn(code === country && 'bg-brand-50/60 dark:bg-brand-900/20')}>
                        <td className="border-b border-slate-100 px-2 py-1.5 dark:border-slate-800">{c.label}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 tabular-nums dark:border-slate-800">{formatMoney(c.typicalBudget, code)}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 tabular-nums dark:border-slate-800">{c.typicalGuests}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 tabular-nums dark:border-slate-800">{formatMoney(c.typicalBudget / c.typicalGuests, code)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-muted dark:text-slate-500">Rounded typical figures for planning, not survey results. Costs in large cities run well above these.</p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Where wedding budgets go wrong</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-ink dark:text-white">Quotes that exclude the extras.</strong> Catering quotes often leave out service charge, gratuity, tax, cake-cutting and corkage. Ask for the all-in per-head figure and enter that as the estimate.</li>
              <li><strong className="text-ink dark:text-white">No contingency line.</strong> The 5% buffer is not slack, it is where alterations, overtime, vendor meals and the extra ten guests end up. Spend it last.</li>
              <li><strong className="text-ink dark:text-white">Guest list creep.</strong> Every added guest costs roughly 80% of your per-guest figure. Fix the number before booking the venue, because the venue fixes the number for you afterwards.</li>
              <li><strong className="text-ink dark:text-white">Deposits forgotten.</strong> Deposits are paid months apart and easy to lose track of. Record each one in Paid the day it goes out so the Still to pay figure is always true.</li>
              <li><strong className="text-ink dark:text-white">Paying with credit.</strong> A wedding on a card at 22% APR costs a quarter more within a year. If the budget does not fit, the <Link href="/debt-payoff-calculator" className={linkCls}>debt payoff calculator</Link> shows what carrying it would cost, and the <Link href="/compound-interest-calculator" className={linkCls}>compound interest calculator</Link> shows how fast monthly saving reaches the target instead.</li>
            </ul>
          </section>
        </article>

        <FaqList title="Wedding budget FAQ" items={FAQ} />

        <p className="mt-8 text-sm text-ink-muted dark:text-slate-400">
          Planning the money after the wedding too? See take-home pay for two incomes with the{' '}
          <Link href="/us-paycheck-calculator" className={linkCls}>US paycheck calculator</Link>, or work out whether to buy
          with the <Link href="/us-mortgage-calculator" className={linkCls}>mortgage calculator</Link>.
        </p>
      </CalcLayout>

      {toast && (
        <div role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="animate-fade-up rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-lift dark:bg-white dark:text-ink">{toast}</div>
        </div>
      )}
    </>
  );
};

export default WeddingBudgetPlanner;
