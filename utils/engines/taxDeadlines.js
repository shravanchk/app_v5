// Indian income tax compliance calendar.
//
// Two different years run side by side here and conflating them is the single
// most common reader error, so every entry declares which one it belongs to:
//
//   AY 2026-27  — filing deadlines for income EARNED in FY 2025-26 (Apr 25–Mar 26)
//   FY 2026-27  — advance tax and investment deadlines for income being EARNED NOW
//
// Dates are wall-clock IST calendar dates. Statutory deadlines are dates, not
// instants, so they are stored as plain `YYYY-MM-DD` and compared date-to-date;
// no timezone maths belongs in this file.

const CATEGORY = {
  ITR: 'ITR filing',
  ADVANCE_TAX: 'Advance tax',
  INVESTMENT: 'Tax saving',
  DOCUMENT: 'Documents'
};

// Sorted by date. `who` keeps audit-only and business-only rows from reading as
// universal — most visitors are salaried and should be able to skip those fast.
const DEADLINES = [
  {
    id: 'form-16-fy2025-26',
    date: '2026-06-15',
    title: 'Form 16 issued by employers',
    category: CATEGORY.DOCUMENT,
    year: 'AY 2026-27',
    who: 'Salaried',
    detail:
      'Employers must issue Form 16 for FY 2025-26 by this date. If yours never arrived, chase payroll — you cannot reconcile your return properly without it.'
  },
  {
    id: 'advance-tax-q1-fy2026-27',
    date: '2026-06-15',
    title: 'Advance tax instalment 1 — 15% cumulative',
    category: CATEGORY.ADVANCE_TAX,
    year: 'FY 2026-27',
    who: 'Anyone with tax over ₹10,000 after TDS',
    detail:
      'First instalment for income being earned in FY 2026-27. Applies if your estimated tax liability for the year, after TDS, is ₹10,000 or more.'
  },
  {
    id: 'itr-due-fy2025-26',
    date: '2026-07-31',
    title: 'ITR due date — individuals (non-audit)',
    category: CATEGORY.ITR,
    year: 'AY 2026-27',
    who: 'Salaried and most individuals',
    detail:
      'The main filing deadline for FY 2025-26 income. Filing by this date is what keeps the old-regime option, loss carry-forward, and full Section 244A refund interest available.',
    guideHref: '/guides/how-to-file-itr'
  },
  {
    id: 'tax-audit-report-fy2025-26',
    date: '2026-09-30',
    title: 'Tax audit report (Section 44AB)',
    category: CATEGORY.ITR,
    year: 'AY 2026-27',
    who: 'Audit cases only',
    detail: 'Deadline for furnishing the audit report where accounts are subject to tax audit. Ignore this row if you are salaried.'
  },
  {
    id: 'advance-tax-q2-fy2026-27',
    date: '2026-09-15',
    title: 'Advance tax instalment 2 — 45% cumulative',
    category: CATEGORY.ADVANCE_TAX,
    year: 'FY 2026-27',
    who: 'Anyone with tax over ₹10,000 after TDS',
    detail:
      'Cumulative, not incremental: you should have paid 45% of the full year’s estimated liability by now, counting what you paid in June.'
  },
  {
    id: 'itr-audit-fy2025-26',
    date: '2026-10-31',
    title: 'ITR due date — audit cases',
    category: CATEGORY.ITR,
    year: 'AY 2026-27',
    who: 'Audit cases only',
    detail: 'Filing deadline where accounts require a tax audit under Section 44AB.'
  },
  {
    id: 'advance-tax-q3-fy2026-27',
    date: '2026-12-15',
    title: 'Advance tax instalment 3 — 75% cumulative',
    category: CATEGORY.ADVANCE_TAX,
    year: 'FY 2026-27',
    who: 'Anyone with tax over ₹10,000 after TDS',
    detail: 'Third instalment. Shortfalls from here on attract interest under Section 234C.'
  },
  {
    id: 'belated-return-ay2026-27',
    date: '2026-12-31',
    title: 'Belated return — last date',
    category: CATEGORY.ITR,
    year: 'AY 2026-27',
    who: 'Anyone who has not filed at all',
    detail:
      'Last date to file if you missed July 31 entirely, with a late fee up to ₹5,000 (₹1,000 if total income is ₹5 lakh or less). A belated return must use the new regime, and most losses cannot be carried forward.',
    guideHref: '/guides/how-to-file-itr'
  },
  {
    id: 'advance-tax-q4-fy2026-27',
    date: '2027-03-15',
    title: 'Advance tax instalment 4 — 100% cumulative',
    category: CATEGORY.ADVANCE_TAX,
    year: 'FY 2026-27',
    who: 'Anyone with tax over ₹10,000 after TDS',
    detail: 'Final instalment: the whole estimated liability for FY 2026-27 should be paid by this date.'
  },
  {
    id: 'tax-saving-investments-fy2026-27',
    date: '2027-03-31',
    title: 'Tax-saving investments — last date',
    category: CATEGORY.INVESTMENT,
    year: 'FY 2026-27',
    who: 'Old regime only',
    detail:
      'Last date for 80C, 80D, ELSS, PPF and similar investments to count against FY 2026-27 income. Only relevant if you are claiming the old regime — the new regime does not allow these deductions.'
  },
  {
    id: 'revised-return-ay2026-27',
    date: '2027-03-31',
    title: 'Revised return — last date',
    category: CATEGORY.ITR,
    year: 'AY 2026-27',
    who: 'Anyone who filed with a mistake',
    detail:
      'Last date to correct a filed return under Section 139(5), extended by Budget 2026 from the old December 31 cut-off to the end of the assessment year. Or completion of assessment, whichever is earlier.',
    guideHref: '/guides/how-to-file-revised-return'
  },
  {
    id: 'updated-return-ay2026-27',
    date: '2031-03-31',
    title: 'Updated return (ITR-U) — last date',
    category: CATEGORY.ITR,
    year: 'AY 2026-27',
    who: 'Last resort',
    detail:
      'Up to 48 months from the end of the assessment year to declare additional income once the revised and belated windows have closed, with additional tax of 25–70% depending on how late you are.'
  }
];

/** `YYYY-MM-DD` → a UTC-midnight Date, so date arithmetic never crosses a DST or timezone edge. */
const parseDate = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Today as a UTC-midnight Date in IST terms — the day it is for the reader, not for the server. */
const istToday = (now = new Date()) => {
  const ist = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()));
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole days from `today` to the deadline. Negative once the date has passed,
 * 0 on the day itself.
 */
const daysUntil = (iso, today = istToday()) => {
  const target = parseDate(iso);
  if (!target) return null;
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
};

/**
 * Urgency band for a deadline. Bands drive colour and ordering in the UI, so
 * they live here rather than in the component.
 */
const statusFor = (iso, today = istToday()) => {
  const days = daysUntil(iso, today);
  if (days === null) return null;
  if (days < 0) return { days, band: 'passed', label: 'Passed' };
  if (days === 0) return { days, band: 'today', label: 'Today' };
  if (days <= 14) return { days, band: 'urgent', label: `${days} day${days === 1 ? '' : 's'} left` };
  if (days <= 60) return { days, band: 'soon', label: `${days} days left` };
  return { days, band: 'upcoming', label: `${days} days left` };
};

/**
 * The calendar, annotated with live status and split into what still matters
 * versus what has already gone. Passed entries are kept — people arrive here
 * precisely to find out what a missed date costs them.
 */
const buildCalendar = (today = istToday()) => {
  const annotated = DEADLINES.map((d) => ({ ...d, status: statusFor(d.date, today) })).sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)
  );
  return {
    upcoming: annotated.filter((d) => d.status && d.status.band !== 'passed'),
    passed: annotated.filter((d) => d.status && d.status.band === 'passed'),
    all: annotated
  };
};

module.exports = {
  CATEGORY,
  DEADLINES,
  parseDate,
  istToday,
  daysUntil,
  statusFor,
  buildCalendar
};
