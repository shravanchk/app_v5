// Reads the numbers off a Form 16 from its text layer, and works out both
// regimes from them. Pure functions only: the PDF is opened in the browser by
// utils/form16Pdf.mjs, which hands the page text here as positioned items.
//
// The rule throughout is that a field we cannot read stays null. A wrong
// number pre-filled into a tax comparison is worse than an empty box the user
// fills in, so nothing here falls back to a default or infers a value from a
// neighbouring row.
//
// Layout of Part B (the TRACES/CBDT format since FY 2018-19), for reference:
//   1. Gross salary: (a) 17(1) (b) 17(2) perquisites (c) 17(3) profits in lieu
//      (d) Total (e) salary from other employer(s)
//   2. Exemptions u/s 10: (a) 10(5) travel ... (e) 10(13A) HRA ... (h) total
//   4. Deductions u/s 16: (a) standard deduction (b) entertainment (c) tax on
//      employment (professional tax)
//   7. Other income reported: (a) house property (b) other sources
//  10. Chapter VI-A: 80C, 80CCC, 80CCD(1), their total, 80CCD(1B), 80CCD(2),
//      80D, 80E, 80CCH, 80G, 80TTA, any other — each row has a gross and a
//      deductible column; we take the deductible (the last amount on the row).
// Part A carries the employer's TAN, the assessment year and the quarterly
// TDS table, whose "Total (Rs.)" row is amount paid | tax deducted | deposited.

const { calculateIndianIncomeTax, INDIA_TAX_YEARS } = require('./taxCalculations');

/* ----------------------------------------------------------------------
   Text layer -> lines of cells
   ---------------------------------------------------------------------- */

// pdf.js gives text items with a transform [a, b, c, d, x, y]. Items whose
// baselines are within a few points sit on one visual line; within a line,
// items closer than about a character apart belong to one cell. Pages are kept
// in order and never merged, so a row cannot borrow an amount from the next page.
const linesFromItems = (pages) => {
  const lines = [];
  for (const items of pages) {
    const pieces = items
      .filter((it) => it && typeof it.str === 'string' && it.str.trim() !== '')
      .map((it) => ({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5],
        w: Number(it.width) || 0,
        h: Math.abs(it.transform[3]) || Number(it.height) || 10
      }))
      .sort((a, b) => b.y - a.y || a.x - b.x);

    const rows = [];
    for (const p of pieces) {
      const row = rows.find((r) => Math.abs(r.y - p.y) <= Math.max(2, p.h * 0.35));
      if (row) row.items.push(p);
      else rows.push({ y: p.y, items: [p] });
    }

    for (const row of rows.sort((a, b) => b.y - a.y)) {
      row.items.sort((a, b) => a.x - b.x);
      const cells = [];
      let cur = null;
      for (const it of row.items) {
        const gap = cur ? it.x - (cur.x + cur.w) : Infinity;
        // Within ~0.6 of the font size: same cell. A space in the source keeps
        // words apart. An amount never joins a text cell, even when a long
        // label runs right up to the amount column.
        const joins = cur && gap < it.h * 0.6 && !(parseAmount(it.str) !== null && !/[\d,.]$/.test(cur.str));
        if (joins) {
          cur.str += gap > it.h * 0.15 && !cur.str.endsWith(' ') && !it.str.startsWith(' ') ? ` ${it.str}` : it.str;
          cur.w = it.x + it.w - cur.x;
        } else {
          cur = { str: it.str, x: it.x, w: it.w };
          cells.push(cur);
        }
      }
      lines.push(cells.map((c) => c.str.replace(/\s+/g, ' ').trim()).filter(Boolean));
    }
  }
  return lines;
};

/* ----------------------------------------------------------------------
   Amounts
   ---------------------------------------------------------------------- */

// "1,23,456.00", "123456", "Rs. 50,000", "-2,00,000.00", "(2,00,000.00)".
// Grouping must be valid Indian or Western grouping, so "17(1)" or "10" in
// a label never parses, and stray digits like "2025-26" are rejected.
const AMOUNT_RE = /^(?:₹|Rs\.?|INR)?\s*(\(?)\s*(-?)\s*((?:\d{1,3}(?:,\d{2})*,\d{3})|(?:\d{1,3}(?:,\d{3})+)|\d+)(\.\d{1,2})?\s*(\)?)$/i;

const parseAmount = (cell) => {
  const m = AMOUNT_RE.exec(String(cell).trim());
  if (!m) return null;
  const [, open, minus, digits, decimals = '', close] = m;
  if (Boolean(open) !== Boolean(close)) return null;
  const value = Number(digits.replace(/,/g, '') + decimals);
  if (!Number.isFinite(value)) return null;
  return open || minus ? -value : value;
};

/* ----------------------------------------------------------------------
   Lines -> numbered rows
   ---------------------------------------------------------------------- */

// "1.", "10.", "(a)", "a)", "(d)" — the row markers of Part B.
const MARKER_RE = /^(?:(\d{1,2})\s*\.|\(\s*([a-z]{1,2})\s*\)|([a-z])\))(?=\s|$)/i;

const normalise = (s) => s
  .toLowerCase()
  .replace(/[‘’`]/g, "'")
  .replace(/\s+/g, ' ')
  // "80CCD (1B)" / "80 CCD(1B)" / "17 (1)" -> "80ccd(1b)" / "17(1)"
  .replace(/(\d)\s+([a-z]{1,4}\b)/g, '$1$2')
  .replace(/([0-9a-z])\s+\(/g, '$1(')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')')
  .trim();

// A row is a marker line plus the unmarked lines that follow it (wrapped
// label text, or an amount printed level with the middle of a wrapped label).
// Lines before the first marker, and lines too far past one, stand alone.
const MAX_CONTINUATION = 3;

const rowsFromLines = (lines) => {
  const rows = [];
  let current = null;
  let section = null;

  for (const cells of lines) {
    const text = cells.join(' ');
    const marker = MARKER_RE.exec(text.trim());
    if (marker) {
      if (marker[1]) section = Number(marker[1]);
      current = { section, marker: (marker[1] || marker[2] || marker[3]).toLowerCase(), cells: [...cells], extra: 0 };
      rows.push(current);
    } else if (current && current.extra < MAX_CONTINUATION) {
      current.cells.push(...cells);
      current.extra += 1;
    } else {
      current = null;
      rows.push({ section: null, marker: null, cells: [...cells], extra: 0 });
    }
  }

  return rows.map((r) => {
    const label = r.cells.filter((c) => parseAmount(c) === null).join(' ');
    return {
      section: r.section,
      marker: r.marker,
      text: normalise(label.replace(MARKER_RE, '')),
      amounts: r.cells.map(parseAmount).filter((v) => v !== null)
    };
  });
};

/* ----------------------------------------------------------------------
   Fields
   ---------------------------------------------------------------------- */

// Checked in order; the first field whose test passes claims the row, so the
// more specific rows ("total deduction under section 80C, 80CCC and 80CCD(1)")
// come before the general ones ("under section 80C").
const FIELD_RULES = [
  { key: 'salary171', test: (t) => /17\(1\)/.test(t) && !/total/.test(t) },
  { key: 'perquisites172', test: (t) => /17\(2\)|perquisite/.test(t) },
  { key: 'profits173', test: (t) => /17\(3\)|profits in lieu/.test(t) },
  { key: 'otherEmployerSalary', test: (t) => /other employer/.test(t) && /salary/.test(t) },
  { key: 'grossSalary', test: (t, r) => /^total$/.test(t) && r.inGross },

  { key: 'lta', test: (t) => /10\(5\)|travel concession/.test(t) && !/total/.test(t) },
  { key: 'hra', test: (t) => /10\(13a\)|house rent allowance/.test(t) },
  { key: 'totalExemptions', test: (t) => /total amount of exemption/.test(t) },

  { key: 'standardDeduction', test: (t) => /standard deduction/.test(t) },
  { key: 'professionalTax', test: (t) => /16\(iii\)|tax on employment|professional tax/.test(t) },

  { key: 'houseProperty', test: (t) => /house property/.test(t) },
  { key: 'otherSources', test: (t) => /other sources/.test(t) },

  // Row 10(d): the combined 80C + 80CCC + 80CCD(1) figure that the ₹1.5 lakh cap applies to.
  { key: 'section80C', test: (t) => /total deduction/.test(t) && /80c\b/.test(t) && /80ccc/.test(t) },
  { key: 'section80CCD1B', test: (t) => /80ccd\(1b\)/.test(t) },
  { key: 'section80CCD2', test: (t) => /80ccd\(2\)/.test(t) },
  { key: 'section80D', test: (t) => /80d\b/.test(t) && !/80dd/.test(t) },
  { key: 'section80E', test: (t) => /80e\b/.test(t) && !/80ee/.test(t) },
  { key: 'section80G', test: (t) => /80g\b/.test(t) && !/80gg/.test(t) },
  { key: 'section80TTA', test: (t) => /80tta\b/.test(t) },
  { key: 'otherChapterVIA', test: (t) => /total of amount deductible under any other provision/.test(t) },
  { key: 'totalChapterVIA', test: (t) => /aggregate of deductible amount/.test(t) },

  { key: 'taxableIncome', test: (t) => /^total taxable income/.test(t) },
  { key: 'taxOnIncome', test: (t) => /^tax on total income/.test(t) }
];

const FIELD_KEYS = [
  'salary171', 'perquisites172', 'profits173', 'grossSalary', 'otherEmployerSalary',
  'hra', 'lta', 'totalExemptions',
  'standardDeduction', 'professionalTax',
  'houseProperty', 'otherSources',
  'section80C', 'section80CCD1B', 'section80CCD2', 'section80D', 'section80E', 'section80G', 'section80TTA',
  'otherChapterVIA', 'totalChapterVIA',
  'taxableIncome', 'taxOnIncome',
  'tds'
];

const emptyFields = () => Object.fromEntries(FIELD_KEYS.map((k) => [k, null]));

const AY_RE = /\b(20\d{2})\s*-\s*(\d{2}|20\d{2})\b/;
const TAN_RE = /\b([A-Z]{4}\d{5}[A-Z])\b/;

const readAssessmentYear = (lines) => {
  const at = lines.findIndex((cells) => /assessment\s*year/i.test(cells.join(' ')));
  if (at === -1) return null;
  // The value sits on the label's line or in the table row under it.
  for (const cells of lines.slice(at, at + 4)) {
    const m = AY_RE.exec(cells.join(' '));
    if (!m) continue;
    const start = Number(m[1]);
    const end = Number(m[2].length === 2 ? `20${m[2]}` : m[2]);
    if (end === start + 1) return `${start}-${String(end).slice(2)}`;
  }
  return null;
};

const readTan = (lines) => {
  const text = lines.map((c) => c.join(' ')).join('\n');
  const at = text.search(/TAN\s+of\s+(the\s+)?deductor/i);
  // Prefer the first TAN after its label; a Form 16 only carries the deductor's.
  const m = TAN_RE.exec(at === -1 ? text : text.slice(at)) || TAN_RE.exec(text);
  return m ? m[1] : null;
};

// Part A: the quarterly summary's "Total (Rs.)" row has exactly three amounts —
// paid/credited, tax deducted, tax deposited. Anything else is a different table.
const readTds = (lines) => {
  for (const cells of lines) {
    if (!/^total\s*(\(rs\.?\)|rs\.?)?/i.test(cells[0] || '')) continue;
    const amounts = cells.map(parseAmount).filter((v) => v !== null);
    if (amounts.length === 3) return amounts[1];
  }
  return null;
};

const readRegimeOptOut = (lines) => {
  const text = lines.map((c) => c.join(' ')).join(' ');
  const m = /opting\s+out\s+of\s+taxation\s+u\/s\s*115bac[^?]*?\??\s*\(?\s*(yes|no)\b/i.exec(text);
  if (!m) return null;
  return m[1].toLowerCase() === 'yes' ? 'old' : 'new';
};

/**
 * Reads a Form 16 from its text lines (arrays of cells, from linesFromItems).
 * Every field is a number or null; null means "not on the form, or not
 * readable", never zero.
 */
const parseForm16 = (lines) => {
  const fields = emptyFields();
  const claimed = new Set();
  let inGross = false;

  for (const row of rowsFromLines(lines)) {
    const topLevel = row.marker && /^\d+$/.test(row.marker);
    // A top-level row like "2. Less: Allowances..." closes the gross-salary block.
    if (topLevel) inGross = /^gross salary/.test(row.text);
    const ctx = { inGross: inGross && !topLevel };
    const rule = FIELD_RULES.find((r) => !claimed.has(r.key) && r.test(row.text, ctx));
    if (!rule) continue;
    // A matching row claims its field even with no amount, so a look-alike
    // row further down can't fill it. The deductible column is the last.
    claimed.add(rule.key);
    if (row.amounts.length) fields[rule.key] = row.amounts[row.amounts.length - 1];
  }

  fields.tds = readTds(lines);

  const text = lines.map((c) => c.join(' ')).join(' ');
  return {
    fields,
    assessmentYear: readAssessmentYear(lines),
    tan: readTan(lines),
    employerRegime: readRegimeOptOut(lines),
    looksLikeForm16: /form\s*(no\.?\s*)?16\b/i.test(text) || /section\s*203/i.test(text),
    hasPartB: /part\s*b/i.test(text) && /gross salary/i.test(text)
  };
};

/* ----------------------------------------------------------------------
   Regime comparison, with the working
   ---------------------------------------------------------------------- */

// FY key for an assessment year: AY 2027-28 is FY 2026-27.
const taxYearForAssessmentYear = (ay) => {
  const m = AY_RE.exec(ay || '');
  if (!m) return null;
  const fy = `${Number(m[1]) - 1}-${String(Number(m[1])).slice(2)}`;
  return INDIA_TAX_YEARS[fy] ? fy : null;
};

const CAP_80C = 150000;
const CAP_80CCD1B = 50000;
// Self-occupied house property: interest loss set off against salary, old regime only.
const CAP_HOUSE_LOSS = 200000;
// 80D for self/family below 60; parents add up to ₹25,000 (₹50,000 if senior).
const LIMIT_80D_SELF = 25000;

const n = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
// Sections 288A/288B: income and tax are rounded to the nearest ₹10.
const round10 = (v) => Math.round(v / 10) * 10;

/** Gross salary: the form's total, else the sum of whichever 17(1)/(2)/(3) parts were read. */
const grossFrom = (f) => {
  if (typeof f.grossSalary === 'number') return { value: f.grossSalary, derived: false };
  const parts = [f.salary171, f.perquisites172, f.profits173].filter((v) => typeof v === 'number');
  if (!parts.length) return { value: null, derived: false };
  return { value: parts.reduce((a, b) => a + b, 0), derived: true };
};

const exemptionsFrom = (f) => {
  if (typeof f.totalExemptions === 'number') return f.totalExemptions;
  return n(f.hra) + n(f.lta);
};

const taxFor = (taxable, regime, ageBand, taxYear) => {
  const rounded = round10(Math.max(0, taxable));
  const r = calculateIndianIncomeTax(rounded, regime, ageBand, taxYear);
  return { ...r, taxable: rounded, totalTax: round10(r.totalTax) };
};

const oldTaxable = (f, gross, year, extra = 0) => {
  const salaryIncome = Math.max(0, gross + n(f.otherEmployerSalary) - exemptionsFrom(f)
    - Math.min(year.oldStandardDeduction, gross) - n(f.professionalTax));
  const house = Math.max(-CAP_HOUSE_LOSS, n(f.houseProperty));
  const gti = Math.max(0, salaryIncome + house + n(f.otherSources));
  const via = Math.min(CAP_80C, n(f.section80C)) + Math.min(CAP_80CCD1B, n(f.section80CCD1B))
    + n(f.section80CCD2) + n(f.section80D) + n(f.section80E) + n(f.section80G) + n(f.section80TTA)
    + n(f.otherChapterVIA);
  // `extra` is further deductions (negative: fewer), for the break-even search.
  return { salaryIncome, house, gti, via, taxable: Math.max(0, gti - via - extra) };
};

/**
 * Both regimes from the (user-checked) Form 16 figures, with each step as a
 * line for the page to print. Needs a gross salary; returns null without one.
 */
const compareRegimesFromForm16 = (f, { ageBand = 'below60', taxYear = '2026-27' } = {}) => {
  const year = INDIA_TAX_YEARS[taxYear];
  const { value: gross, derived: grossDerived } = grossFrom(f);
  if (!year || gross === null) return null;

  const exemptions = exemptionsFrom(f);
  const oldStd = Math.min(year.oldStandardDeduction, gross);
  const newStd = Math.min(year.newStandardDeduction, gross);
  const old = oldTaxable(f, gross, year);
  const oldTax = taxFor(old.taxable, 'old', ageBand, taxYear);

  // New regime (s.115BAC): no s.10 HRA/LTA exemptions, no professional tax,
  // no loss on a self-occupied house, and of Chapter VI-A only the
  // employer's NPS contribution (80CCD(2)) survives.
  const newSalaryIncome = Math.max(0, gross + n(f.otherEmployerSalary) - newStd);
  const newHouse = Math.max(0, n(f.houseProperty));
  const newGti = newSalaryIncome + newHouse + n(f.otherSources);
  const newVia = n(f.section80CCD2);
  const newTax = taxFor(Math.max(0, newGti - newVia), 'new', ageBand, taxYear);

  const oldLines = [
    { label: grossDerived ? 'Gross salary (17(1) + 17(2) + 17(3))' : 'Gross salary', value: gross },
    ...(n(f.otherEmployerSalary) ? [{ label: 'Salary from other employer(s)', value: n(f.otherEmployerSalary) }] : []),
    { label: 'Exemptions u/s 10 (HRA, LTA…)', value: -exemptions },
    { label: 'Standard deduction u/s 16(ia)', value: -oldStd },
    { label: 'Professional tax u/s 16(iii)', value: -n(f.professionalTax) },
    { label: 'Income from salary', value: old.salaryIncome, subtotal: true },
    ...(old.house ? [{ label: old.house < 0 ? 'House property loss (capped at ₹2,00,000)' : 'Income from house property', value: old.house }] : []),
    ...(n(f.otherSources) ? [{ label: 'Income from other sources', value: n(f.otherSources) }] : []),
    { label: 'Gross total income', value: old.gti, subtotal: true },
    { label: 'Chapter VI-A deductions', value: -old.via },
    { label: 'Taxable income (rounded to ₹10)', value: oldTax.taxable, subtotal: true }
  ];
  const newLines = [
    { label: grossDerived ? 'Gross salary (17(1) + 17(2) + 17(3))' : 'Gross salary', value: gross },
    ...(n(f.otherEmployerSalary) ? [{ label: 'Salary from other employer(s)', value: n(f.otherEmployerSalary) }] : []),
    { label: 'Exemptions u/s 10 — not allowed', value: 0 },
    { label: 'Standard deduction u/s 16(ia)', value: -newStd },
    { label: 'Professional tax — not allowed', value: 0 },
    { label: 'Income from salary', value: newSalaryIncome, subtotal: true },
    ...(newHouse ? [{ label: 'Income from house property', value: newHouse }] : []),
    ...(n(f.houseProperty) < 0 ? [{ label: 'House property loss — not allowed', value: 0 }] : []),
    ...(n(f.otherSources) ? [{ label: 'Income from other sources', value: n(f.otherSources) }] : []),
    { label: 'Gross total income', value: newGti, subtotal: true },
    { label: 'Employer NPS u/s 80CCD(2) (only VI-A deduction allowed)', value: -newVia },
    { label: 'Taxable income (rounded to ₹10)', value: newTax.taxable, subtotal: true }
  ];

  const taxLines = (t) => [
    ...t.breakdown.map((b) => ({
      label: `${b.rate}% on ₹${Math.round(b.taxableAmount).toLocaleString('en-IN')}`,
      value: b.tax,
      detail: true
    })),
    { label: 'Tax on slabs', value: t.slabTax, subtotal: true },
    ...(t.rebate ? [{ label: 'Rebate u/s 87A', value: -t.rebate }] : []),
    ...(t.marginalRelief ? [{ label: 'Marginal relief', value: -t.marginalRelief }] : []),
    { label: 'Health & education cess (4%)', value: t.cess },
    { label: 'Tax payable (rounded to ₹10)', value: t.totalTax, total: true }
  ];

  // Break-even: how much more the old regime would have to deduct to cost
  // the same as the new one. Negative means it already wins and could give
  // up that much in deductions and still tie. Rounded out to ₹100.
  const oldAt = (extra) => taxFor(oldTaxable(f, gross, year, extra).taxable, 'old', ageBand, taxYear).totalTax;
  const target = newTax.totalTax;
  const oldDeductions = exemptions + oldStd + n(f.professionalTax) + old.via;
  let breakEven;
  if (oldTax.totalTax > target) {
    let lo = 0;
    let hi = old.taxable; // at taxable 0 the old tax is 0, so this always ties or wins
    while (hi - lo > 50) {
      const mid = (lo + hi) / 2;
      if (oldAt(mid) <= target) hi = mid; else lo = mid;
    }
    breakEven = Math.ceil(hi / 100) * 100;
  } else if (oldAt(-oldDeductions) <= target) {
    breakEven = -oldDeductions;
  } else {
    let lo = 0;
    let hi = oldDeductions;
    while (hi - lo > 50) {
      const mid = (lo + hi) / 2;
      if (oldAt(-mid) <= target) lo = mid; else hi = mid;
    }
    breakEven = -Math.floor(lo / 100) * 100;
  }

  // Unused room in the deductions people can still make before March.
  const room = [
    { key: 'section80C', label: '80C (PF, PPF, ELSS, life cover, tuition, home-loan principal)', limit: CAP_80C, used: n(f.section80C) },
    { key: 'section80CCD1B', label: '80CCD(1B) — your own NPS contribution', limit: CAP_80CCD1B, used: n(f.section80CCD1B) },
    { key: 'section80D', label: '80D — health insurance for self, spouse, children', limit: LIMIT_80D_SELF, used: n(f.section80D) }
  ].map((r) => ({ ...r, room: Math.max(0, r.limit - r.used) }));
  const totalRoom = room.reduce((a, r) => a + r.room, 0);
  const oldIfFilled = oldAt(totalRoom);

  return {
    taxYear,
    gross,
    grossDerived,
    old: { lines: oldLines, taxLines: taxLines(oldTax), ...oldTax, deductions: oldDeductions },
    new: { lines: newLines, taxLines: taxLines(newTax), ...newTax },
    better: oldTax.totalTax < newTax.totalTax ? 'old' : 'new',
    saving: Math.abs(oldTax.totalTax - newTax.totalTax),
    breakEven,
    room,
    totalRoom,
    oldIfFilled,
    filledFlips: oldTax.totalTax >= newTax.totalTax && oldIfFilled < newTax.totalTax,
    surchargeWarning: Math.max(oldTax.taxable, newTax.taxable) > 5000000
  };
};

module.exports = {
  linesFromItems,
  parseAmount,
  rowsFromLines,
  parseForm16,
  compareRegimesFromForm16,
  taxYearForAssessmentYear,
  FIELD_KEYS
};
