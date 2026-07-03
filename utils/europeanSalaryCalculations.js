// European net-salary engine. Extracted verbatim from EuropeanSalaryCalculator
// so the same math can run at build time (EU hub comparison table) and in the
// interactive calculator. Rates are planning estimates for the 2026 tax year;
// see per-country notes below.

export const SALARY_SYSTEMS = {
  'UK': {
    country: 'United Kingdom',
    currency: '£',
    symbol: 'GBP',
    personalAllowance: 12570,
    // 2026-27 rates (matches /guides/uk-tax-rates-2026-27). Bands are on taxable
    // income after the (tapered) personal allowance; additional rate above
    // £125,140 of taxable income.
    taxBands: [
      { min: 0, max: 37700, rate: 20 },
      { min: 37700, max: 125140, rate: 40 },
      { min: 125140, max: Infinity, rate: 45 }
    ],
    // Employee class 1 NI: 8% between primary threshold and UEL, 2% above.
    niEmployee: [
      { min: 0, max: 12570, rate: 0 },
      { min: 12570, max: 50270, rate: 8 },
      { min: 50270, max: Infinity, rate: 2 }
    ],
    niEmployer: 13.8,
    flag: '🇬🇧'
  },
  'DE': {
    country: 'Germany',
    currency: '€',
    symbol: 'EUR',
    // 2026 Einkommensteuer zones (§32a EStG). Grundfreibetrag €12,348;
    // 42% top-of-progression starts at €69,878; 45% Reichensteuer above €277,825.
    taxBands: [
      { min: 0, max: 12348, rate: 0 },
      { min: 12348, max: 69878, rate: 14 },
      { min: 69878, max: 277825, rate: 42 },
      { min: 277825, max: Infinity, rate: 45 }
    ],
    // Employee shares, 2026. NOTE: health excludes the fund-specific average
    // additional contribution (~1.45% employee share of the 2.9% Zusatzbeitrag);
    // care base 1.7% excludes the +0.6% childless surcharge.
    socialSecurity: {
      pension: 9.3,
      unemployment: 1.3,
      health: 7.3,
      care: 1.7
    },
    solidarityTax: 5.5,
    flag: '🇩🇪'
  },
  'FR': {
    country: 'France',
    currency: '€',
    symbol: 'EUR',
    // 2026 barème de l'impôt sur le revenu (2026 Finance Act, thresholds +0.9%).
    taxBands: [
      { min: 0, max: 11600, rate: 0 },
      { min: 11600, max: 29579, rate: 11 },
      { min: 29579, max: 84577, rate: 30 },
      { min: 84577, max: 181917, rate: 41 },
      { min: 181917, max: Infinity, rate: 45 }
    ],
    socialSecurity: {
      generalSocial: 9.7,
      csg: 9.2,
      unemployment: 2.4
    },
    flag: '🇫🇷'
  },
  'NL': {
    country: 'Netherlands',
    currency: '€',
    symbol: 'EUR',
    // 2026 Box 1 brackets (three-band structure). Bracket 1 includes national
    // insurance (combined rate 35.70%; one source cites 35.75%).
    taxBands: [
      { min: 0, max: 38883, rate: 35.70 },
      { min: 38883, max: 78426, rate: 37.56 },
      { min: 78426, max: Infinity, rate: 49.50 }
    ],
    // 2026 maxima (flat approximation; both credits phase out with income).
    generalCredit: 3115,
    laborCredit: 5685,
    flag: '🇳🇱'
  },
  'CH': {
    country: 'Switzerland',
    currency: 'CHF',
    symbol: 'CHF',
    federalTax: [
      { min: 0, max: 14500, rate: 0 },
      { min: 14500, max: 31600, rate: 0.77 },
      { min: 31600, max: 41400, rate: 0.88 },
      { min: 41400, max: 55200, rate: 2.64 },
      { min: 55200, max: 72500, rate: 2.97 },
      { min: 72500, max: 78100, rate: 5.94 },
      { min: 78100, max: Infinity, rate: 11.5 }
    ],
    cantonalTax: 7.8, // Average rate
    ahv: 5.3, // Old age and survivors insurance
    flag: '🇨🇭'
  },
  'AT': {
    country: 'Austria',
    currency: '€',
    symbol: 'EUR',
    taxBands: [
      { min: 0, max: 11693, rate: 0 },
      { min: 11693, max: 19134, rate: 20 },
      { min: 19134, max: 32075, rate: 32.5 },
      { min: 32075, max: 63350, rate: 42 },
      { min: 63350, max: 1000000, rate: 48 },
      { min: 1000000, max: Infinity, rate: 55 }
    ],
    socialSecurity: 18.12,
    flag: '🇦🇹'
  },
  'BE': {
    country: 'Belgium',
    currency: '€',
    symbol: 'EUR',
    taxBands: [
      { min: 0, max: 15200, rate: 25 },
      { min: 15200, max: 26830, rate: 40 },
      { min: 26830, max: 46440, rate: 45 },
      { min: 46440, max: Infinity, rate: 50 }
    ],
    socialSecurity: 13.07,
    flag: '🇧🇪'
  },
  'SE': {
    country: 'Sweden',
    currency: 'SEK',
    symbol: 'SEK',
    municipalTax: 32.12, // Average
    stateTax: [
      { min: 0, max: 598500, rate: 0 },
      { min: 598500, max: Infinity, rate: 20 }
    ],
    socialSecurity: 7,
    flag: '🇸🇪'
  }
};

const calculateUKSalary = (annual, system, results) => {
  // Personal allowance tapers £1 per £2 of income above £100,000 (zero at £125,140).
  const personalAllowance = annual > 100000
    ? Math.max(0, system.personalAllowance - Math.floor((annual - 100000) / 2))
    : system.personalAllowance;
  const taxableIncome = Math.max(0, annual - personalAllowance);
  let incomeTax = 0;
  let ni = 0;

  // Income Tax
  for (const band of system.taxBands) {
    if (taxableIncome > band.min) {
      const taxableAmount = Math.min(taxableIncome - band.min, band.max - band.min);
      incomeTax += taxableAmount * (band.rate / 100);
    }
  }

  // National Insurance
  for (const band of system.niEmployee) {
    if (annual > band.min) {
      const niAmount = Math.min(annual - band.min, band.max - band.min);
      ni += niAmount * (band.rate / 100);
    }
  }

  const totalDeductions = incomeTax + ni;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    incomeTax,
    nationalInsurance: ni,
    totalDeductions,
    personalAllowance,
    taxableIncome
  };

  results.netAnnual = netAnnual;
  results.netMonthly = netAnnual / 12;
  results.effectiveRate = (totalDeductions / annual) * 100;

  return results;
};

// Germany Tax Calculation
const calculateGermanySalary = (annual, system, results) => {
  let incomeTax = 0;
  let socialSec = 0;
  let solidarity = 0;

  // Income Tax
  for (const band of system.taxBands) {
    if (annual > band.min) {
      const taxableAmount = Math.min(annual - band.min, band.max - band.min);
      if (band.rate === 14) {
        // Progressive rate from 14% to 42%
        const rate = 14 + ((annual - band.min) / (band.max - band.min)) * 28;
        incomeTax += taxableAmount * (rate / 100);
      } else {
        incomeTax += taxableAmount * (band.rate / 100);
      }
    }
  }

  // Social Security (employee portion)
  const totalSocialRate = Object.values(system.socialSecurity).reduce((a, b) => a + b, 0);
  socialSec = annual * (totalSocialRate / 100);

  // Solidarity Tax (5.5% of income tax)
  solidarity = incomeTax * 0.055;

  const totalDeductions = incomeTax + socialSec + solidarity;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    incomeTax,
    socialSecurity: socialSec,
    solidarityTax: solidarity,
    totalDeductions
  };

  results.netAnnual = netAnnual;
  results.netMonthly = netAnnual / 12;
  results.effectiveRate = (totalDeductions / annual) * 100;

  return results;
};

// France Tax Calculation
const calculateFranceSalary = (annual, system, results) => {
  let incomeTax = 0;
  let socialSec = 0;

  // Income Tax
  for (const band of system.taxBands) {
    if (annual > band.min) {
      const taxableAmount = Math.min(annual - band.min, band.max - band.min);
      incomeTax += taxableAmount * (band.rate / 100);
    }
  }

  // Social Security
  const totalSocialRate = Object.values(system.socialSecurity).reduce((a, b) => a + b, 0);
  socialSec = annual * (totalSocialRate / 100);

  const totalDeductions = incomeTax + socialSec;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    incomeTax,
    socialSecurity: socialSec,
    totalDeductions
  };

  results.netAnnual = netAnnual;
  results.netMonthly = netAnnual / 12;
  results.effectiveRate = (totalDeductions / annual) * 100;

  return results;
};

// Netherlands Tax Calculation
const calculateNetherlandsSalary = (annual, system, results) => {
  let incomeTax = 0;

  // Income Tax
  for (const band of system.taxBands) {
    if (annual > band.min) {
      const taxableAmount = Math.min(annual - band.min, band.max - band.min);
      incomeTax += taxableAmount * (band.rate / 100);
    }
  }

  // Apply tax credits
  const taxCredits = system.generalCredit + system.laborCredit;
  const finalTax = Math.max(0, incomeTax - taxCredits);

  const netAnnual = annual - finalTax;

  results.breakdown = {
    grossTax: incomeTax,
    taxCredits,
    incomeTax: finalTax,
    totalDeductions: finalTax
  };

  results.netAnnual = netAnnual;
  results.netMonthly = netAnnual / 12;
  results.effectiveRate = (finalTax / annual) * 100;

  return results;
};

// Switzerland Tax Calculation
const calculateSwitzerlandSalary = (annual, system, results) => {
  let federalTax = 0;
  let cantonalTax = 0;
  let ahv = 0;

  // Federal Tax
  for (const band of system.federalTax) {
    if (annual > band.min) {
      const taxableAmount = Math.min(annual - band.min, band.max - band.min);
      federalTax += taxableAmount * (band.rate / 100);
    }
  }

  // Cantonal Tax (average)
  cantonalTax = annual * (system.cantonalTax / 100);

  // AHV (Old age insurance)
  ahv = annual * (system.ahv / 100);

  const totalDeductions = federalTax + cantonalTax + ahv;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    federalTax,
    cantonalTax,
    ahv,
    totalDeductions
  };

  results.netAnnual = netAnnual;
  results.netMonthly = netAnnual / 12;
  results.effectiveRate = (totalDeductions / annual) * 100;

  return results;
};

// Austria Tax Calculation
const calculateAustriaSalary = (annual, system, results) => {
  let incomeTax = 0;
  let socialSec = 0;

  // Income Tax
  for (const band of system.taxBands) {
    if (annual > band.min) {
      const taxableAmount = Math.min(annual - band.min, band.max - band.min);
      incomeTax += taxableAmount * (band.rate / 100);
    }
  }

  // Social Security
  socialSec = annual * (system.socialSecurity / 100);

  const totalDeductions = incomeTax + socialSec;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    incomeTax,
    socialSecurity: socialSec,
    totalDeductions
  };

  results.netAnnual = netAnnual;
  results.netMonthly = netAnnual / 12;
  results.effectiveRate = (totalDeductions / annual) * 100;

  return results;
};

// Belgium Tax Calculation
const calculateBelgiumSalary = (annual, system, results) => {
  let incomeTax = 0;
  let socialSec = 0;

  // Income Tax
  for (const band of system.taxBands) {
    if (annual > band.min) {
      const taxableAmount = Math.min(annual - band.min, band.max - band.min);
      incomeTax += taxableAmount * (band.rate / 100);
    }
  }

  // Social Security
  socialSec = annual * (system.socialSecurity / 100);

  const totalDeductions = incomeTax + socialSec;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    incomeTax,
    socialSecurity: socialSec,
    totalDeductions
  };

  results.netAnnual = netAnnual;
  results.netMonthly = netAnnual / 12;
  results.effectiveRate = (totalDeductions / annual) * 100;

  return results;
};

// Sweden Tax Calculation
const calculateSwedenSalary = (annual, system, results) => {
  let municipalTax = 0;
  let stateTax = 0;
  let socialFees = 0;

  // Municipal Tax
  municipalTax = annual * (system.municipalTax / 100);

  // State Tax
  for (const band of system.stateTax) {
    if (annual > band.min) {
      const taxableAmount = Math.min(annual - band.min, band.max - band.min);
      stateTax += taxableAmount * (band.rate / 100);
    }
  }

  // Social Security Fees
  socialFees = annual * (system.socialSecurity / 100);

  const totalDeductions = municipalTax + stateTax + socialFees;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    municipalTax,
    stateTax,
    socialSecurity: socialFees,
    totalDeductions
  };

  results.netAnnual = netAnnual;
  results.netMonthly = netAnnual / 12;
  results.effectiveRate = (totalDeductions / annual) * 100;

  return results;
};

const CALCULATORS = {
  UK: calculateUKSalary,
  DE: calculateGermanySalary,
  FR: calculateFranceSalary,
  NL: calculateNetherlandsSalary,
  CH: calculateSwitzerlandSalary,
  AT: calculateAustriaSalary,
  BE: calculateBelgiumSalary,
  SE: calculateSwedenSalary
};

// Gross annual salary in the country's own currency -> full result object.
export const computeEuropeanSalary = (countryCode, annual) => {
  const system = SALARY_SYSTEMS[countryCode];
  const calculate = CALCULATORS[countryCode];
  if (!system || !calculate || !annual || annual <= 0) return null;

  const results = {
    grossAnnual: annual,
    grossMonthly: annual / 12,
    currency: system.currency,
    country: system.country,
    flag: system.flag,
    breakdown: {}
  };
  return calculate(annual, system, results);
};
