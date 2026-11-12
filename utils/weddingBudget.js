// Wedding budget engine: splits a total budget across categories by
// percentage, then measures real quotes and payments against that plan.
//
// Money is kept as plain numbers. Each expense has an estimate (the quote),
// an actual (the signed contract or final invoice, blank until known) and the
// amount paid so far. The "committed" figure is the actual when there is one,
// otherwise the estimate: it is the best current answer to "what will this
// cost?", and it is what the planner compares against each category's slice.

const DEFAULT_CATEGORIES = [
  { id: 'venue', name: 'Venue & catering', pct: 42 },
  { id: 'photo', name: 'Photography & video', pct: 12 },
  { id: 'attire', name: 'Attire & beauty', pct: 8 },
  { id: 'flowers', name: 'Flowers & decor', pct: 8 },
  { id: 'music', name: 'Music & entertainment', pct: 7 },
  { id: 'planner', name: 'Planner / coordinator', pct: 5 },
  { id: 'rings', name: 'Wedding rings', pct: 3 },
  { id: 'stationery', name: 'Invitations & stationery', pct: 2 },
  { id: 'cake', name: 'Cake & desserts', pct: 2 },
  { id: 'transport', name: 'Transport', pct: 2 },
  { id: 'ceremony', name: 'Officiant & ceremony', pct: 2 },
  { id: 'favors', name: 'Favors & gifts', pct: 2 },
  { id: 'buffer', name: 'Contingency buffer', pct: 5 }
];

// Rounded, typical figures used only to seed the form and the prose. They
// are not survey citations; the page says "typical" and lets the user override.
const COUNTRIES = {
  US: { label: 'United States', currency: 'USD', locale: 'en-US', typicalBudget: 33000, typicalGuests: 115 },
  UK: { label: 'United Kingdom', currency: 'GBP', locale: 'en-GB', typicalBudget: 20000, typicalGuests: 80 },
  IE: { label: 'Ireland', currency: 'EUR', locale: 'en-IE', typicalBudget: 30000, typicalGuests: 130 },
  DE: { label: 'Germany', currency: 'EUR', locale: 'de-DE', typicalBudget: 15000, typicalGuests: 70 },
  FR: { label: 'France', currency: 'EUR', locale: 'fr-FR', typicalBudget: 15000, typicalGuests: 80 },
  ES: { label: 'Spain', currency: 'EUR', locale: 'es-ES', typicalBudget: 20000, typicalGuests: 100 },
  NL: { label: 'Netherlands', currency: 'EUR', locale: 'nl-NL', typicalBudget: 17000, typicalGuests: 80 },
  CH: { label: 'Switzerland', currency: 'CHF', locale: 'de-CH', typicalBudget: 30000, typicalGuests: 80 },
  CA: { label: 'Canada', currency: 'CAD', locale: 'en-CA', typicalBudget: 30000, typicalGuests: 100 },
  AU: { label: 'Australia', currency: 'AUD', locale: 'en-AU', typicalBudget: 35000, typicalGuests: 90 },
  IN: { label: 'India', currency: 'INR', locale: 'en-IN', typicalBudget: 2500000, typicalGuests: 300 }
};

const COUNTRY_CODES = Object.keys(COUNTRIES);

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const round2 = (v) => Math.round(v * 100) / 100;

// Allocation for one category from the budget and its percentage.
const slice = (budget, pct) => round2((num(budget) * num(pct)) / 100);

// Best current answer to "what will this item cost?".
const committedOf = (expense) => (num(expense.actual) > 0 ? num(expense.actual) : num(expense.estimate));

const computeCategory = (category, budget, expenses) => {
  const own = expenses.filter((e) => e.categoryId === category.id);
  const allocated = slice(budget, category.pct);
  const estimated = round2(own.reduce((s, e) => s + num(e.estimate), 0));
  const committed = round2(own.reduce((s, e) => s + committedOf(e), 0));
  const paid = round2(own.reduce((s, e) => s + Math.min(num(e.paid), committedOf(e) || num(e.paid)), 0));
  const variance = round2(allocated - committed);
  // Share of the slice already committed; capped for the progress bar, the
  // raw figure says how far over it went.
  const usedRatio = allocated > 0 ? committed / allocated : committed > 0 ? Infinity : 0;
  return {
    ...category,
    allocated,
    estimated,
    committed,
    paid,
    due: round2(Math.max(0, committed - paid)),
    variance,
    usedRatio,
    itemCount: own.length,
    status: committed === 0 ? 'empty' : variance < 0 ? 'over' : usedRatio > 0.9 ? 'tight' : 'ok'
  };
};

// Everything the page shows, from the raw plan.
const computePlan = ({ budget, guests, categories = DEFAULT_CATEGORIES, expenses = [] }) => {
  const total = num(budget);
  const rows = categories.map((c) => computeCategory(c, total, expenses));
  const pctTotal = round2(categories.reduce((s, c) => s + num(c.pct), 0));
  const allocated = round2(rows.reduce((s, r) => s + r.allocated, 0));
  const committed = round2(rows.reduce((s, r) => s + r.committed, 0));
  const paid = round2(rows.reduce((s, r) => s + r.paid, 0));
  const g = num(guests);

  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const upcoming = expenses
    .map((e) => ({ ...e, outstanding: round2(Math.max(0, committedOf(e) - num(e.paid))) }))
    .filter((e) => e.outstanding > 0 && /^\d{4}-\d{2}-\d{2}$/.test(e.dueDate || ''))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map((e) => ({ ...e, overdue: e.dueDate < todayISO }));

  return {
    budget: total,
    pctTotal,
    unallocatedPct: round2(100 - pctTotal),
    allocated,
    unallocated: round2(total - allocated),
    committed,
    paid,
    due: round2(Math.max(0, committed - paid)),
    remaining: round2(total - committed),
    overBudget: committed > total && total > 0,
    perGuest: g > 0 && total > 0 ? round2(total / g) : 0,
    committedPerGuest: g > 0 && committed > 0 ? round2(committed / g) : 0,
    paidRatio: committed > 0 ? Math.min(1, paid / committed) : 0,
    usedRatio: total > 0 ? committed / total : 0,
    categories: rows,
    upcoming,
    itemCount: expenses.length
  };
};

// Scales every percentage so the split sums to 100 again, keeping the
// user's proportions. The last category absorbs the rounding remainder.
const normalizePercents = (categories) => {
  const total = categories.reduce((s, c) => s + num(c.pct), 0);
  if (!total) return categories.map((c) => ({ ...c, pct: 0 }));
  let used = 0;
  return categories.map((c, i) => {
    if (i === categories.length - 1) return { ...c, pct: round2(100 - used) };
    const pct = Math.round((num(c.pct) / total) * 1000) / 10;
    used = round2(used + pct);
    return { ...c, pct };
  });
};

const formatMoney = (value, countryCode, opts = {}) => {
  const c = COUNTRIES[countryCode] || COUNTRIES.US;
  const digits = opts.cents ? 2 : 0;
  try {
    // de-CH groups thousands with an apostrophe, and Node's ICU emits U+0027
    // while browsers emit U+2019; pin one form so server and client HTML match.
    return new Intl.NumberFormat(c.locale, {
      style: 'currency',
      currency: c.currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(Number(value) || 0).replace(/[\u2019\u02BC]/g, "'");
  } catch (error) {
    return `${c.currency} ${Math.round(Number(value) || 0)}`;
  }
};

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// One row per expense plus a category subtotal block, for a spreadsheet.
const toCSV = (plan, computed) => {
  const byId = Object.fromEntries(plan.categories.map((c) => [c.id, c.name]));
  const lines = [['Category', 'Item', 'Vendor', 'Estimate', 'Actual', 'Paid', 'Outstanding', 'Due date']];
  plan.expenses.forEach((e) => {
    lines.push([
      byId[e.categoryId] || e.categoryId,
      e.name,
      e.vendor || '',
      num(e.estimate),
      num(e.actual) || '',
      num(e.paid),
      round2(Math.max(0, committedOf(e) - num(e.paid))),
      e.dueDate || ''
    ]);
  });
  lines.push([]);
  lines.push(['Category', 'Allocated', 'Committed', 'Paid', 'Outstanding', 'Variance']);
  computed.categories.forEach((c) => lines.push([c.name, c.allocated, c.committed, c.paid, c.due, c.variance]));
  lines.push([]);
  lines.push(['Total budget', computed.budget]);
  lines.push(['Committed', computed.committed]);
  lines.push(['Paid', computed.paid]);
  lines.push(['Outstanding', computed.due]);
  return lines.map((row) => row.map(csvCell).join(',')).join('\n');
};

// Keeps a plan read back from storage or a link well-formed, whatever it
// held: unknown categories are dropped, numbers coerced, lists bounded.
const sanitizePlan = (raw) => {
  const base = { budget: '', guests: '', country: 'US', categories: DEFAULT_CATEGORIES, expenses: [] };
  if (!raw || typeof raw !== 'object') return base;
  const country = COUNTRY_CODES.includes(raw.country) ? raw.country : 'US';
  const categories = Array.isArray(raw.categories) && raw.categories.length
    ? raw.categories.slice(0, 20).map((c, i) => ({
      id: String(c.id || `c${i}`).slice(0, 24),
      name: String(c.name || 'Category').slice(0, 40),
      pct: Math.min(100, num(c.pct))
    }))
    : DEFAULT_CATEGORIES;
  const ids = new Set(categories.map((c) => c.id));
  const expenses = Array.isArray(raw.expenses)
    ? raw.expenses.slice(0, 200).filter((e) => e && ids.has(e.categoryId)).map((e, i) => ({
      id: String(e.id || `e${i}-${Date.now()}`).slice(0, 32),
      categoryId: e.categoryId,
      name: String(e.name || '').slice(0, 60),
      vendor: String(e.vendor || '').slice(0, 60),
      estimate: num(e.estimate) || '',
      actual: num(e.actual) || '',
      paid: num(e.paid) || '',
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(e.dueDate || '') ? e.dueDate : ''
    }))
    : [];
  return {
    budget: num(raw.budget) ? String(num(raw.budget)) : '',
    guests: num(raw.guests) ? String(Math.round(num(raw.guests))) : '',
    country,
    categories,
    expenses
  };
};

module.exports = {
  DEFAULT_CATEGORIES,
  COUNTRIES,
  COUNTRY_CODES,
  slice,
  committedOf,
  computePlan,
  normalizePercents,
  formatMoney,
  toCSV,
  sanitizePlan
};
