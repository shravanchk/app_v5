// US paycheck / take-home pay engine.
// Federal figures are tax-year 2026 (Rev. Proc. 2025-32 + SSA 2026 announcements).
// State figures are the latest published flat rates / brackets (2025-26 legislation,
// Tax Foundation data) and are planning estimates — local/city taxes are excluded
// except where noted (Maryland includes an average county rate).

// ------------------------------------------------------------ Federal (2026)
export const FILING_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married filing jointly' },
  { value: 'hoh', label: 'Head of household' }
];

export const FEDERAL_2026 = {
  standardDeduction: { single: 16100, married: 32200, hoh: 24150 },
  brackets: {
    single: [
      { min: 0, max: 12400, rate: 10 },
      { min: 12400, max: 50400, rate: 12 },
      { min: 50400, max: 105700, rate: 22 },
      { min: 105700, max: 201775, rate: 24 },
      { min: 201775, max: 256225, rate: 32 },
      { min: 256225, max: 640600, rate: 35 },
      { min: 640600, max: Infinity, rate: 37 }
    ],
    married: [
      { min: 0, max: 24800, rate: 10 },
      { min: 24800, max: 100800, rate: 12 },
      { min: 100800, max: 211400, rate: 22 },
      { min: 211400, max: 403550, rate: 24 },
      { min: 403550, max: 512450, rate: 32 },
      { min: 512450, max: 768700, rate: 35 },
      { min: 768700, max: Infinity, rate: 37 }
    ],
    hoh: [
      { min: 0, max: 17700, rate: 10 },
      { min: 17700, max: 67450, rate: 12 },
      { min: 67450, max: 105700, rate: 22 },
      { min: 105700, max: 201775, rate: 24 },
      { min: 201775, max: 256225, rate: 32 },
      { min: 256225, max: 640600, rate: 35 },
      { min: 640600, max: Infinity, rate: 37 }
    ]
  }
};

// FICA 2026: Social Security 6.2% up to the wage base; Medicare 1.45% on all
// wages plus 0.9% additional above the threshold (not doubled for married).
export const FICA_2026 = {
  ssRate: 6.2,
  ssWageBase: 184500,
  medicareRate: 1.45,
  additionalMedicareRate: 0.9,
  additionalThreshold: { single: 200000, married: 250000, hoh: 200000 }
};

const taxFromBrackets = (taxable, brackets) => {
  let tax = 0;
  for (const b of brackets) {
    if (taxable > b.min) tax += (Math.min(taxable, b.max) - b.min) * (b.rate / 100);
  }
  return tax;
};

// ------------------------------------------------------------ States
// type: 'none' | 'flat' | 'brackets'
// brackets are single-filer; progressive states double them for married filers
// (a common structure — treated as an estimate). stdDeduction is per single
// filer and doubled for married.
export const US_STATES = {
  AL: { name: 'Alabama', type: 'brackets', stdDeduction: 3000, brackets: [{ min: 0, max: 500, rate: 2 }, { min: 500, max: 3000, rate: 4 }, { min: 3000, max: Infinity, rate: 5 }] },
  AK: { name: 'Alaska', type: 'none' },
  AZ: { name: 'Arizona', type: 'flat', rate: 2.5, stdDeduction: 14600 },
  AR: { name: 'Arkansas', type: 'brackets', stdDeduction: 2340, brackets: [{ min: 0, max: 4500, rate: 2 }, { min: 4500, max: 8900, rate: 3 }, { min: 8900, max: Infinity, rate: 3.9 }] },
  CA: { name: 'California', type: 'brackets', stdDeduction: 5540, brackets: [{ min: 0, max: 10756, rate: 1 }, { min: 10756, max: 25499, rate: 2 }, { min: 25499, max: 40245, rate: 4 }, { min: 40245, max: 55866, rate: 6 }, { min: 55866, max: 70606, rate: 8 }, { min: 70606, max: 360659, rate: 9.3 }, { min: 360659, max: 432787, rate: 10.3 }, { min: 432787, max: 721314, rate: 11.3 }, { min: 721314, max: Infinity, rate: 12.3 }] },
  CO: { name: 'Colorado', type: 'flat', rate: 4.4, stdDeduction: 16100, usesFederalDeduction: true },
  CT: { name: 'Connecticut', type: 'brackets', stdDeduction: 0, brackets: [{ min: 0, max: 10000, rate: 2 }, { min: 10000, max: 50000, rate: 4.5 }, { min: 50000, max: 100000, rate: 5.5 }, { min: 100000, max: 200000, rate: 6 }, { min: 200000, max: 250000, rate: 6.5 }, { min: 250000, max: 500000, rate: 6.9 }, { min: 500000, max: Infinity, rate: 6.99 }] },
  DE: { name: 'Delaware', type: 'brackets', stdDeduction: 3250, brackets: [{ min: 0, max: 2000, rate: 0 }, { min: 2000, max: 5000, rate: 2.2 }, { min: 5000, max: 10000, rate: 3.9 }, { min: 10000, max: 20000, rate: 4.8 }, { min: 20000, max: 25000, rate: 5.2 }, { min: 25000, max: 60000, rate: 5.55 }, { min: 60000, max: Infinity, rate: 6.6 }] },
  DC: { name: 'Washington, D.C.', type: 'brackets', stdDeduction: 16100, usesFederalDeduction: true, brackets: [{ min: 0, max: 10000, rate: 4 }, { min: 10000, max: 40000, rate: 6 }, { min: 40000, max: 60000, rate: 6.5 }, { min: 60000, max: 250000, rate: 8.5 }, { min: 250000, max: 500000, rate: 9.25 }, { min: 500000, max: 1000000, rate: 9.75 }, { min: 1000000, max: Infinity, rate: 10.75 }] },
  FL: { name: 'Florida', type: 'none' },
  GA: { name: 'Georgia', type: 'flat', rate: 5.19, stdDeduction: 12000 },
  HI: { name: 'Hawaii', type: 'brackets', stdDeduction: 4400, brackets: [{ min: 0, max: 9600, rate: 1.4 }, { min: 9600, max: 14400, rate: 3.2 }, { min: 14400, max: 19200, rate: 5.5 }, { min: 19200, max: 24000, rate: 6.4 }, { min: 24000, max: 36000, rate: 6.8 }, { min: 36000, max: 48000, rate: 7.2 }, { min: 48000, max: 125000, rate: 7.6 }, { min: 125000, max: 175000, rate: 7.9 }, { min: 175000, max: 225000, rate: 8.25 }, { min: 225000, max: Infinity, rate: 9 }] },
  ID: { name: 'Idaho', type: 'flat', rate: 5.3, stdDeduction: 16100, usesFederalDeduction: true },
  IL: { name: 'Illinois', type: 'flat', rate: 4.95, stdDeduction: 0 },
  IN: { name: 'Indiana', type: 'flat', rate: 3.0, stdDeduction: 0 },
  IA: { name: 'Iowa', type: 'flat', rate: 3.8, stdDeduction: 0 },
  KS: { name: 'Kansas', type: 'brackets', stdDeduction: 3605, brackets: [{ min: 0, max: 23000, rate: 5.2 }, { min: 23000, max: Infinity, rate: 5.58 }] },
  KY: { name: 'Kentucky', type: 'flat', rate: 3.5, stdDeduction: 3270 },
  LA: { name: 'Louisiana', type: 'flat', rate: 3.0, stdDeduction: 12500 },
  ME: { name: 'Maine', type: 'brackets', stdDeduction: 15000, brackets: [{ min: 0, max: 26800, rate: 5.8 }, { min: 26800, max: 63450, rate: 6.75 }, { min: 63450, max: Infinity, rate: 7.15 }] },
  MD: { name: 'Maryland', type: 'brackets', stdDeduction: 2700, localAvgRate: 3.2, localNote: 'includes an average 3.2% county income tax', brackets: [{ min: 0, max: 1000, rate: 2 }, { min: 1000, max: 2000, rate: 3 }, { min: 2000, max: 3000, rate: 4 }, { min: 3000, max: 100000, rate: 4.75 }, { min: 100000, max: 125000, rate: 5 }, { min: 125000, max: 150000, rate: 5.25 }, { min: 150000, max: 250000, rate: 5.5 }, { min: 250000, max: Infinity, rate: 5.75 }] },
  MA: { name: 'Massachusetts', type: 'flat', rate: 5.0, stdDeduction: 0 },
  MI: { name: 'Michigan', type: 'flat', rate: 4.25, stdDeduction: 0 },
  MN: { name: 'Minnesota', type: 'brackets', stdDeduction: 14950, brackets: [{ min: 0, max: 32570, rate: 5.35 }, { min: 32570, max: 106990, rate: 6.8 }, { min: 106990, max: 198630, rate: 7.85 }, { min: 198630, max: Infinity, rate: 9.85 }] },
  MS: { name: 'Mississippi', type: 'flat', rate: 4.0, stdDeduction: 2300 },
  MO: { name: 'Missouri', type: 'brackets', stdDeduction: 16100, usesFederalDeduction: true, brackets: [{ min: 0, max: 1313, rate: 0 }, { min: 1313, max: 5252, rate: 2.5 }, { min: 5252, max: 9191, rate: 3.5 }, { min: 9191, max: Infinity, rate: 4.7 }] },
  MT: { name: 'Montana', type: 'brackets', stdDeduction: 16100, usesFederalDeduction: true, brackets: [{ min: 0, max: 21100, rate: 4.7 }, { min: 21100, max: Infinity, rate: 5.9 }] },
  NE: { name: 'Nebraska', type: 'brackets', stdDeduction: 8350, brackets: [{ min: 0, max: 4030, rate: 2.46 }, { min: 4030, max: 24120, rate: 3.51 }, { min: 24120, max: 38870, rate: 5.01 }, { min: 38870, max: Infinity, rate: 5.2 }] },
  NV: { name: 'Nevada', type: 'none' },
  NH: { name: 'New Hampshire', type: 'none' },
  NJ: { name: 'New Jersey', type: 'brackets', stdDeduction: 0, brackets: [{ min: 0, max: 20000, rate: 1.4 }, { min: 20000, max: 35000, rate: 1.75 }, { min: 35000, max: 40000, rate: 3.5 }, { min: 40000, max: 75000, rate: 5.525 }, { min: 75000, max: 500000, rate: 6.37 }, { min: 500000, max: 1000000, rate: 8.97 }, { min: 1000000, max: Infinity, rate: 10.75 }] },
  NM: { name: 'New Mexico', type: 'brackets', stdDeduction: 16100, usesFederalDeduction: true, brackets: [{ min: 0, max: 5500, rate: 1.5 }, { min: 5500, max: 16500, rate: 4.3 }, { min: 16500, max: 33500, rate: 4.7 }, { min: 33500, max: 66500, rate: 4.9 }, { min: 66500, max: Infinity, rate: 5.9 }] },
  NY: { name: 'New York', type: 'brackets', stdDeduction: 8000, localNote: 'New York City residents pay an additional ~3-3.9% city tax (not included)', brackets: [{ min: 0, max: 8500, rate: 4 }, { min: 8500, max: 11700, rate: 4.5 }, { min: 11700, max: 13900, rate: 5.25 }, { min: 13900, max: 80650, rate: 5.5 }, { min: 80650, max: 215400, rate: 6 }, { min: 215400, max: 1077550, rate: 6.85 }, { min: 1077550, max: Infinity, rate: 9.65 }] },
  NC: { name: 'North Carolina', type: 'flat', rate: 3.99, stdDeduction: 12750 },
  ND: { name: 'North Dakota', type: 'brackets', stdDeduction: 16100, usesFederalDeduction: true, brackets: [{ min: 0, max: 48475, rate: 0 }, { min: 48475, max: 244825, rate: 1.95 }, { min: 244825, max: Infinity, rate: 2.5 }] },
  OH: { name: 'Ohio', type: 'brackets', stdDeduction: 0, localNote: 'many Ohio municipalities levy a 1-2.5% local income tax (not included)', brackets: [{ min: 0, max: 26050, rate: 0 }, { min: 26050, max: 100000, rate: 2.75 }, { min: 100000, max: Infinity, rate: 3.125 }] },
  OK: { name: 'Oklahoma', type: 'brackets', stdDeduction: 6350, brackets: [{ min: 0, max: 1000, rate: 0.25 }, { min: 1000, max: 2500, rate: 0.75 }, { min: 2500, max: 3750, rate: 1.75 }, { min: 3750, max: 4900, rate: 2.75 }, { min: 4900, max: 7200, rate: 3.75 }, { min: 7200, max: Infinity, rate: 4.75 }] },
  OR: { name: 'Oregon', type: 'brackets', stdDeduction: 2800, brackets: [{ min: 0, max: 4400, rate: 4.75 }, { min: 4400, max: 11050, rate: 6.75 }, { min: 11050, max: 125000, rate: 8.75 }, { min: 125000, max: Infinity, rate: 9.9 }] },
  PA: { name: 'Pennsylvania', type: 'flat', rate: 3.07, stdDeduction: 0, localNote: 'most PA municipalities add a ~1% local earned-income tax (not included)' },
  RI: { name: 'Rhode Island', type: 'brackets', stdDeduction: 10900, brackets: [{ min: 0, max: 79900, rate: 3.75 }, { min: 79900, max: 181650, rate: 4.75 }, { min: 181650, max: Infinity, rate: 5.99 }] },
  SC: { name: 'South Carolina', type: 'brackets', stdDeduction: 16100, usesFederalDeduction: true, brackets: [{ min: 0, max: 3560, rate: 0 }, { min: 3560, max: 17830, rate: 3 }, { min: 17830, max: Infinity, rate: 6.2 }] },
  SD: { name: 'South Dakota', type: 'none' },
  TN: { name: 'Tennessee', type: 'none' },
  TX: { name: 'Texas', type: 'none' },
  UT: { name: 'Utah', type: 'flat', rate: 4.55, stdDeduction: 0 },
  VT: { name: 'Vermont', type: 'brackets', stdDeduction: 7400, brackets: [{ min: 0, max: 47900, rate: 3.35 }, { min: 47900, max: 116000, rate: 6.6 }, { min: 116000, max: 242000, rate: 7.6 }, { min: 242000, max: Infinity, rate: 8.75 }] },
  VA: { name: 'Virginia', type: 'brackets', stdDeduction: 8500, brackets: [{ min: 0, max: 3000, rate: 2 }, { min: 3000, max: 5000, rate: 3 }, { min: 5000, max: 17000, rate: 5 }, { min: 17000, max: Infinity, rate: 5.75 }] },
  WA: { name: 'Washington', type: 'none' },
  WV: { name: 'West Virginia', type: 'brackets', stdDeduction: 0, brackets: [{ min: 0, max: 10000, rate: 2.22 }, { min: 10000, max: 25000, rate: 2.96 }, { min: 25000, max: 40000, rate: 3.33 }, { min: 40000, max: 60000, rate: 4.44 }, { min: 60000, max: Infinity, rate: 4.82 }] },
  WI: { name: 'Wisconsin', type: 'brackets', stdDeduction: 13230, brackets: [{ min: 0, max: 14320, rate: 3.5 }, { min: 14320, max: 28640, rate: 4.4 }, { min: 28640, max: 315310, rate: 5.3 }, { min: 315310, max: Infinity, rate: 7.65 }] },
  WY: { name: 'Wyoming', type: 'none' }
};

export const stateSlug = (code) =>
  US_STATES[code].name.toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, '-');

export const codeFromSlug = (slug) =>
  Object.keys(US_STATES).find((c) => stateSlug(c) === slug) || null;

const scaleBrackets = (brackets, factor) =>
  brackets.map((b) => ({ min: b.min * factor, max: b.max === Infinity ? Infinity : b.max * factor, rate: b.rate }));

export const stateTax = (grossForState, stateCode, filingStatus) => {
  const st = US_STATES[stateCode];
  if (!st || st.type === 'none') return 0;
  const dedFactor = filingStatus === 'married' ? 2 : 1;
  const deduction = (st.stdDeduction || 0) * dedFactor;
  const taxable = Math.max(0, grossForState - deduction);
  let tax = 0;
  if (st.type === 'flat') {
    tax = taxable * (st.rate / 100);
  } else {
    const brackets = filingStatus === 'married' ? scaleBrackets(st.brackets, 2) : st.brackets;
    tax = taxFromBrackets(taxable, brackets);
  }
  if (st.localAvgRate) tax += taxable * (st.localAvgRate / 100);
  return tax;
};

// ------------------------------------------------------------ Paycheck
export const PAY_FREQUENCIES = [
  { value: 'annual', label: 'Annual', periods: 1 },
  { value: 'monthly', label: 'Monthly', periods: 12 },
  { value: 'biweekly', label: 'Bi-weekly', periods: 26 },
  { value: 'weekly', label: 'Weekly', periods: 52 }
];

// grossAnnual: salary; retirementPct: pre-tax 401(k)/403(b) percent (reduces
// income taxes, NOT FICA). Returns annual amounts.
export const computePaycheck = ({ grossAnnual, stateCode, filingStatus = 'single', retirementPct = 0 }) => {
  if (!grossAnnual || grossAnnual <= 0) return null;

  const retirement = grossAnnual * (Math.min(Math.max(retirementPct, 0), 90) / 100);
  const incomeForTax = grossAnnual - retirement;

  // Federal income tax
  const fedTaxable = Math.max(0, incomeForTax - FEDERAL_2026.standardDeduction[filingStatus]);
  const federalTax = taxFromBrackets(fedTaxable, FEDERAL_2026.brackets[filingStatus]);

  // FICA (on gross wages, not reduced by 401k)
  const socialSecurity = Math.min(grossAnnual, FICA_2026.ssWageBase) * (FICA_2026.ssRate / 100);
  let medicare = grossAnnual * (FICA_2026.medicareRate / 100);
  const addlThreshold = FICA_2026.additionalThreshold[filingStatus];
  if (grossAnnual > addlThreshold) {
    medicare += (grossAnnual - addlThreshold) * (FICA_2026.additionalMedicareRate / 100);
  }

  // State income tax
  const stTax = stateTax(incomeForTax, stateCode, filingStatus);

  const totalTax = federalTax + socialSecurity + medicare + stTax;
  const netAnnual = grossAnnual - totalTax - retirement;

  return {
    grossAnnual,
    retirement,
    federalTax,
    socialSecurity,
    medicare,
    stateTax: stTax,
    totalTax,
    netAnnual,
    effectiveRate: (totalTax / grossAnnual) * 100,
    takeHomeRate: (netAnnual / grossAnnual) * 100
  };
};
