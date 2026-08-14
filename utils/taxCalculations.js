// The old regime raises the basic exemption with age: ₹3,00,000 from 60 and
// ₹5,00,000 from 80. The new regime has no equivalent relief, which is one
// reason the old regime can still win for older taxpayers.
const INDIA_OLD_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Number.POSITIVE_INFINITY, rate: 30 }
];

const INDIA_OLD_SLABS_SENIOR = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Number.POSITIVE_INFINITY, rate: 30 }
];

const INDIA_OLD_SLABS_SUPER_SENIOR = [
  { min: 0, max: 500000, rate: 0 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Number.POSITIVE_INFINITY, rate: 30 }
];

const INDIA_AGE_BANDS = [
  { value: 'below60', label: 'Below 60', exemption: 250000 },
  { value: 'senior', label: '60 to 79 (senior citizen)', exemption: 300000 },
  { value: 'superSenior', label: '80 and above (super senior)', exemption: 500000 }
];

const oldRegimeSlabsFor = (ageBand) => {
  if (ageBand === 'senior') return INDIA_OLD_SLABS_SENIOR;
  if (ageBand === 'superSenior') return INDIA_OLD_SLABS_SUPER_SENIOR;
  return INDIA_OLD_SLABS;
};

const INDIA_NEW_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 5 },
  { min: 800000, max: 1200000, rate: 10 },
  { min: 1200000, max: 1600000, rate: 15 },
  { min: 1600000, max: 2000000, rate: 20 },
  { min: 2000000, max: 2400000, rate: 25 },
  { min: 2400000, max: Number.POSITIVE_INFINITY, rate: 30 }
];

const calculateSlabTax = (income, slabs) => {
  let tax = 0;
  const breakdown = [];

  for (const slab of slabs) {
    if (income <= slab.min) continue;

    const taxableAmount = Math.min(income, slab.max) - slab.min;
    const slabTax = (taxableAmount * slab.rate) / 100;
    tax += slabTax;
    breakdown.push({ ...slab, taxableAmount, tax: slabTax });
  }

  return { tax, breakdown };
};

// `ageBand` only affects the old regime. It defaults to 'below60' so existing
// two-argument callers keep their previous behaviour.
// Every figure that a Budget can move, keyed by financial year. Budget 2026
// left the slabs, deductions and rebate untouched, so FY 2026-27 reuses the
// FY 2025-26 parameters rather than restating them — if a future Budget
// diverges, give that year its own object and nothing else has to change.
const INDIA_FY_2025_26 = {
  label: 'FY 2025-26 (AY 2026-27)',
  assessmentYear: '2026-27',
  newSlabs: INDIA_NEW_SLABS,
  newStandardDeduction: 75000,
  oldStandardDeduction: 50000,
  newRebateLimit: 1200000,
  newRebateCap: 60000,
  oldRebateLimit: 500000,
  oldRebateCap: 12500,
  cessRate: 0.04
};

const INDIA_TAX_YEARS = {
  '2025-26': INDIA_FY_2025_26,
  '2026-27': { ...INDIA_FY_2025_26, label: 'FY 2026-27 (AY 2027-28)', assessmentYear: '2027-28' }
};

const INDIA_DEFAULT_TAX_YEAR = '2026-27';

const yearParamsFor = (taxYear) => INDIA_TAX_YEARS[taxYear] || INDIA_TAX_YEARS[INDIA_DEFAULT_TAX_YEAR];

// `ageBand` only affects the old regime; `taxYear` selects the parameter set.
// Both are optional so existing two-argument callers keep their behaviour.
const calculateIndianIncomeTax = (taxableIncome, regime, ageBand = 'below60', taxYear = INDIA_DEFAULT_TAX_YEAR) => {
  const year = yearParamsFor(taxYear);
  const slabs = regime === 'old' ? oldRegimeSlabsFor(ageBand) : year.newSlabs;
  const { tax: slabTax, breakdown } = calculateSlabTax(Math.max(0, taxableIncome), slabs);
  let rebate = 0;
  let marginalRelief = 0;

  if (regime === 'old' && taxableIncome <= year.oldRebateLimit) {
    rebate = Math.min(slabTax, year.oldRebateCap);
  }

  if (regime === 'new') {
    if (taxableIncome <= year.newRebateLimit) {
      rebate = Math.min(slabTax, year.newRebateCap);
    } else {
      const excessIncome = taxableIncome - year.newRebateLimit;
      marginalRelief = Math.max(0, slabTax - excessIncome);
    }
  }

  const taxAfterRelief = Math.max(0, slabTax - rebate - marginalRelief);
  const cess = taxAfterRelief * year.cessRate;

  return {
    slabTax,
    rebate,
    marginalRelief,
    cess,
    totalTax: taxAfterRelief + cess,
    breakdown
  };
};

const UK_TAX_YEAR = '2026-27';
const UK_PERSONAL_ALLOWANCE = 12570;

const UK_RUK_BANDS = [
  { max: 37700, rate: 0.20 },
  { max: 125140, rate: 0.40 },
  { max: Number.POSITIVE_INFINITY, rate: 0.45 }
];

const UK_SCOTLAND_BANDS = [
  { max: 16537, rate: 0.19 },
  { max: 29526, rate: 0.20 },
  { max: 43662, rate: 0.21 },
  { max: 75000, rate: 0.42 },
  { max: 125140, rate: 0.45 },
  { max: Number.POSITIVE_INFINITY, rate: 0.48 }
];

const UK_STUDENT_LOAN_RATES = {
  plan1: { threshold: 26900, rate: 0.09 },
  plan2: { threshold: 29385, rate: 0.09 },
  plan4: { threshold: 33795, rate: 0.09 },
  plan5: { threshold: 25000, rate: 0.09 },
  postgrad: { threshold: 21000, rate: 0.06 }
};

const calculatePersonalAllowance = (adjustedNetIncome) => {
  if (adjustedNetIncome <= 100000) return UK_PERSONAL_ALLOWANCE;
  return Math.max(0, UK_PERSONAL_ALLOWANCE - Math.floor((adjustedNetIncome - 100000) / 2));
};

const calculateBandTax = (taxableIncome, personalAllowance, bands, usesGrossLimits) => {
  let tax = 0;
  let lowerLimit = 0;

  for (const band of bands) {
    const upperLimit = usesGrossLimits
      ? Math.max(0, band.max - personalAllowance)
      : band.max;
    const taxableInBand = Math.max(0, Math.min(taxableIncome, upperLimit) - lowerLimit);
    tax += taxableInBand * band.rate;
    lowerLimit = upperLimit;
    if (taxableIncome <= upperLimit) break;
  }

  return tax;
};

const calculateUKTax = ({ grossIncome, pensionContribution = 0, region = 'england', studentLoan = 'none' }) => {
  const gross = Math.max(0, Number(grossIncome) || 0);
  const pension = Math.min(gross, Math.max(0, Number(pensionContribution) || 0));
  const adjustedNetIncome = Math.max(0, gross - pension);
  const personalAllowance = calculatePersonalAllowance(adjustedNetIncome);
  const taxableAfterAllowance = Math.max(0, adjustedNetIncome - personalAllowance);
  const incomeTax = region === 'scotland'
    ? calculateBandTax(taxableAfterAllowance, personalAllowance, UK_SCOTLAND_BANDS, true)
    : calculateBandTax(taxableAfterAllowance, personalAllowance, UK_RUK_BANDS, false);

  const niMainBand = Math.max(0, Math.min(gross, 50270) - 12570);
  const niUpperBand = Math.max(0, gross - 50270);
  const nationalInsurance = niMainBand * 0.08 + niUpperBand * 0.02;

  const loanRule = UK_STUDENT_LOAN_RATES[studentLoan];
  const studentLoanRepayment = loanRule
    ? Math.max(0, gross - loanRule.threshold) * loanRule.rate
    : 0;
  const totalDeductions = pension + incomeTax + nationalInsurance + studentLoanRepayment;
  const netIncome = Math.max(0, gross - totalDeductions);

  return {
    grossIncome: gross,
    pension,
    adjustedNetIncome,
    personalAllowance,
    taxableIncome: taxableAfterAllowance,
    incomeTax,
    nationalInsurance,
    studentLoanRepayment,
    totalTax: incomeTax + nationalInsurance + studentLoanRepayment,
    totalDeductions,
    netIncome,
    effectiveRate: gross > 0 ? ((incomeTax + nationalInsurance + studentLoanRepayment) / gross) * 100 : 0,
    monthlyNet: netIncome / 12,
    weeklyNet: netIncome / 52
  };
};

module.exports = {
  INDIA_OLD_SLABS,
  INDIA_OLD_SLABS_SENIOR,
  INDIA_OLD_SLABS_SUPER_SENIOR,
  INDIA_AGE_BANDS,
  INDIA_TAX_YEARS,
  INDIA_DEFAULT_TAX_YEAR,
  oldRegimeSlabsFor,
  yearParamsFor,
  INDIA_NEW_SLABS,
  UK_TAX_YEAR,
  UK_STUDENT_LOAN_RATES,
  calculateSlabTax,
  calculateIndianIncomeTax,
  calculateUKTax
};
