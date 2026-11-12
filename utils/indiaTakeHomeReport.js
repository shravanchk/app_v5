// Data behind the India take-home salary report: income tax on every salary
// from ₹5 lakh to ₹50 lakh under both regimes for FY 2026-27, computed from
// the same engine the income tax calculator runs.
//
// The range stops at ₹50 lakh because surcharge starts above ₹50 lakh of
// taxable income and the engine deliberately does not model it. Everything
// here is tax only: no EPF, professional tax or employer-specific deductions,
// so "take-home" means salary after income tax and cess.

const { calculateIndianIncomeTax } = require('./taxCalculations');

const TAX_YEAR = '2026-27';
const NEW_STD = 75000;
const OLD_STD = 50000;
const LAKH = 100000;

// A deliberately ordinary old-regime deduction bundle: Section 80C filled
// (₹1.5 lakh), a self-and-family health premium under 80D (₹25,000) and the
// extra NPS deduction under 80CCD(1B) (₹50,000). HRA and home-loan interest
// are left out because they vary too much to call "typical".
const TYPICAL_DEDUCTIONS = [
  { label: 'Section 80C', amount: 150000 },
  { label: 'Section 80D health insurance', amount: 25000 },
  { label: 'NPS under 80CCD(1B)', amount: 50000 }
];
const TYPICAL_DEDUCTION_TOTAL = TYPICAL_DEDUCTIONS.reduce((s, d) => s + d.amount, 0);

const SALARIES = Array.from({ length: 46 }, (_, i) => (i + 5) * LAKH);

const r0 = (v) => Math.round(v);
const pct = (num, den) => (den > 0 ? Math.round((num / den) * 10000) / 100 : 0);

const newRegimeTax = (gross) => calculateIndianIncomeTax(Math.max(0, gross - NEW_STD), 'new', 'below60', TAX_YEAR);
const oldRegimeTax = (gross, deductions = 0) =>
  calculateIndianIncomeTax(Math.max(0, gross - OLD_STD - deductions), 'old', 'below60', TAX_YEAR);

// Smallest deduction amount (beyond the old standard deduction) at which the
// old regime's tax falls to or below the new regime's. null when no amount
// of deductions makes the old regime win, or when new-regime tax is already 0.
const breakEvenDeductions = (gross) => {
  const target = newRegimeTax(gross).totalTax;
  if (target <= 0) return null;
  let lo = 0;
  let hi = gross;
  if (oldRegimeTax(gross, hi).totalTax > target) return null;
  while (hi - lo > 100) {
    const mid = (lo + hi) / 2;
    if (oldRegimeTax(gross, mid).totalTax <= target) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi / 1000) * 1000;
};

const buildRow = (gross) => {
  const n = newRegimeTax(gross);
  const o = oldRegimeTax(gross);
  const ot = oldRegimeTax(gross, TYPICAL_DEDUCTION_TOTAL);
  const newTax = r0(n.totalTax);
  const oldTax = r0(o.totalTax);
  const oldTaxTypical = r0(ot.totalTax);
  const nextLakhTax = r0(newRegimeTax(gross + LAKH).totalTax);
  return {
    gross,
    lakh: gross / LAKH,
    newTax,
    newEffectiveRate: pct(newTax, gross),
    newTakeHome: gross - newTax,
    newMonthly: r0((gross - newTax) / 12),
    newRebate: r0(n.rebate),
    newMarginalRelief: r0(n.marginalRelief),
    oldTax,
    oldEffectiveRate: pct(oldTax, gross),
    oldTaxTypical,
    oldTypicalEffectiveRate: pct(oldTaxTypical, gross),
    // Which regime leaves more in hand for someone with the typical bundle.
    betterRegime: oldTaxTypical < newTax ? 'old' : 'new',
    savingVsOldTypical: oldTaxTypical - newTax,
    breakEvenDeductions: breakEvenDeductions(gross),
    // Of the next ₹1 lakh earned, how much is kept after tax under the new regime.
    keepOfNextLakh: LAKH - (nextLakhTax - newTax)
  };
};

const buildRows = () => SALARIES.map(buildRow);

// The figures the report leads with, derived from a finer scan so the
// thresholds are exact to ₹1,000 rather than to the nearest lakh.
const buildHeadlines = (rows = buildRows()) => {
  const step = 1000;
  let zeroTaxCeiling = 0;
  let reliefEnd = 0;
  let first10 = null;
  let first20 = null;
  let oldWinsFrom = null;
  for (let gross = 5 * LAKH; gross <= 50 * LAKH; gross += step) {
    const n = newRegimeTax(gross);
    const tax = n.totalTax;
    if (tax <= 0) zeroTaxCeiling = gross;
    if (n.marginalRelief > 0) reliefEnd = gross;
    const rate = tax / gross;
    if (first10 === null && rate >= 0.1) first10 = gross;
    if (first20 === null && rate >= 0.2) first20 = gross;
    if (oldWinsFrom === null && oldRegimeTax(gross, TYPICAL_DEDUCTION_TOTAL).totalTax < tax) oldWinsFrom = gross;
  }
  const at = (lakh) => rows.find((r) => r.lakh === lakh);
  const topRow = rows[rows.length - 1];
  return {
    zeroTaxCeiling,
    reliefStart: 12 * LAKH + NEW_STD,
    reliefEnd,
    first10PercentAt: first10,
    first20PercentAt: first20,
    oldRegimeWinsFrom: oldWinsFrom,
    typicalDeductionTotal: TYPICAL_DEDUCTION_TOTAL,
    // Tax at round salaries for the prose.
    at10: at(10),
    at15: at(15),
    at20: at(20),
    at30: at(30),
    at50: topRow,
    topMarginalKeep: topRow.keepOfNextLakh
  };
};

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const CSV_COLUMNS = [
  ['gross_salary_inr', (r) => r.gross],
  ['new_regime_tax_inr', (r) => r.newTax],
  ['new_regime_effective_rate_pct', (r) => r.newEffectiveRate],
  ['new_regime_monthly_take_home_inr', (r) => r.newMonthly],
  ['old_regime_tax_no_deductions_inr', (r) => r.oldTax],
  ['old_regime_tax_with_2_25_lakh_deductions_inr', (r) => r.oldTaxTypical],
  ['better_regime_with_typical_deductions', (r) => r.betterRegime],
  ['old_regime_break_even_deductions_inr', (r) => r.breakEvenDeductions ?? ''],
  ['kept_of_next_1_lakh_new_regime_inr', (r) => r.keepOfNextLakh]
];

const toCSV = (rows = buildRows()) => {
  const header = CSV_COLUMNS.map(([name]) => name).join(',');
  const body = rows.map((r) => CSV_COLUMNS.map(([, pick]) => csvCell(pick(r))).join(','));
  const notes = [
    '# India take-home salary report FY 2026-27 (AY 2027-28). Source: upaman.com/india-take-home-salary-report',
    '# Resident individual below 60. Tax includes 4% health and education cess. Standard deduction: new regime 75000, old regime 50000.',
    `# Typical old-regime deductions = ${TYPICAL_DEDUCTIONS.map((d) => `${d.label} ${d.amount}`).join(' + ')} = ${TYPICAL_DEDUCTION_TOTAL}.`,
    '# Excludes surcharge (applies above 50 lakh), EPF, professional tax and HRA. Free to reuse with attribution.'
  ];
  return [...notes, header, ...body].join('\n') + '\n';
};

module.exports = {
  TAX_YEAR,
  NEW_STD,
  OLD_STD,
  LAKH,
  SALARIES,
  TYPICAL_DEDUCTIONS,
  TYPICAL_DEDUCTION_TOTAL,
  newRegimeTax,
  oldRegimeTax,
  breakEvenDeductions,
  buildRow,
  buildRows,
  buildHeadlines,
  toCSV
};
