// European net-salary engine. Extracted verbatim from EuropeanSalaryCalculator
// so the same math can run at build time (EU hub comparison table) and in the
// interactive calculator. Rates are planning estimates for the 2026 tax year;
// see per-country notes below.

const SALARY_SYSTEMS = {
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
    // Display metadata only — the exact 2026 §32a EStG tariff formulas live in
    // calculateGermanySalary. Grundfreibetrag €12,348; 42% zone from €69,879
    // of taxable income; 45% Reichensteuer above €277,825.
    taxBands: [
      { min: 0, max: 12348, rate: 0 },
      { min: 12348, max: 69878, rate: 14 },
      { min: 69878, max: 277825, rate: 42 },
      { min: 277825, max: Infinity, rate: 45 }
    ],
    // Employee shares, 2026: health 7.3% + half of the 2.9% average
    // Zusatzbeitrag = 8.75%; care 2.4% (childless rate, most states).
    // Contributions stop at the assessment ceilings below.
    socialSecurity: {
      pension: 9.3,
      unemployment: 1.3,
      health: 8.75,
      care: 2.4
    },
    ceilings: {
      pensionUnemployment: 101400,
      healthCare: 69750
    },
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
    // Employee contributions, private-sector non-cadre, 2026. The PASS (plafond
    // annuel de la sécurité sociale) splits the pension charges into a capped
    // tranche 1 and a tranche 2 above it. Employees have paid no unemployment
    // or health contribution since 2019 (outside Alsace-Moselle).
    pass: 48060,
    socialSecurity: {
      pensionCapped: 6.9,     // assurance vieillesse plafonnée, up to 1 PASS
      pensionUncapped: 0.4,   // assurance vieillesse déplafonnée, all salary
      agircT1: 4.01,          // AGIRC-ARRCO 3.15% + CEG 0.86%, up to 1 PASS
      agircT2: 9.72,          // AGIRC-ARRCO 8.64% + CEG 1.08%, 1-8 PASS
      cet: 0.14,              // CET, all salary up to 8 PASS, only once above 1 PASS
      csgDeductible: 6.8,     // CSG, on 98.25% of salary
      csgNonDeductible: 2.4,  // CSG, not deductible from taxable income
      crds: 0.5,              // CRDS, not deductible
      csgBase: 98.25
    },
    // 10% flat-rate professional-expenses allowance and the décote for a
    // single filer, both indexed alongside the 2026 barème.
    professionalExpenses: { rate: 10, min: 509, cap: 14556 },
    decote: { threshold: 1982, base: 897, rate: 45.25 },
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
    // 2026 Tarifstufen (BMF); thresholds indexed +1.733% for 2026. Applied to
    // taxable income after social security, not to gross.
    taxBands: [
      { min: 0, max: 13539, rate: 0 },
      { min: 13539, max: 21992, rate: 20 },
      { min: 21992, max: 36458, rate: 30 },
      { min: 36458, max: 70365, rate: 40 },
      { min: 70365, max: 104859, rate: 48 },
      { min: 104859, max: 1000000, rate: 50 },
      { min: 1000000, max: Infinity, rate: 55 }
    ],
    // Employee share, Angestellte outside Vienna: KV 3.87 + PV 10.25 + ALV 3.00
    // + Wohnbauförderung 0.50 + AK-Umlage 0.50. Vienna is 18.32% from 2026.
    socialSecurity: 18.12,
    // Sonderzahlungen escape the Wohnbauförderungsbeitrag and the AK-Umlage.
    socialSecuritySpecial: 17.12,
    // Höchstbeitragsgrundlage 2026: €6,930 a month for running pay, with a
    // separate €13,860 annual ceiling for the 13th/14th salary.
    ceilings: {
      monthly: 6930,
      special: 13860
    },
    // Austrian salaries are quoted as 14 payments: 12 monthly plus the 13th and
    // 14th (Urlaubs- and Weihnachtsgeld). This drives the monthly -> annual
    // conversion as well as the Sonderzahlungen split.
    paymentsPerYear: 14,
    // Verkehrsabsetzbetrag 2026: €496, rising to €853 below €15,069 of taxable
    // income and tapering back to €496 by €16,056.
    verkehrsabsetzbetrag: { base: 496, raised: 853, raisedTo: 15069, taperTo: 16056 },
    // Werbungskostenpauschale, already baked into the payroll tax tables.
    werbungskostenpauschale: 132,
    // Sonderzahlungen: first €620 free, 6% above that, and nothing at all if the
    // Jahressechstel stays under the €2,447 Freigrenze.
    special: { freibetrag: 620, freigrenze: 2447, rate: 6 },
    flag: '🇦🇹'
  },
  'BE': {
    country: 'Belgium',
    currency: '€',
    symbol: 'EUR',
    // Income year 2026 (assessment year 2027), indexed. These bands apply to
    // *net taxable* income — after employee social security and the flat-rate
    // professional expenses deduction — not to gross. See calculateBelgiumSalary.
    taxBands: [
      { min: 0, max: 16720, rate: 25 },
      { min: 16720, max: 29510, rate: 40 },
      { min: 29510, max: 51070, rate: 45 },
      { min: 51070, max: Infinity, rate: 50 }
    ],
    // Employee RSZ/ONSS contribution, private sector.
    socialSecurity: 13.07,
    // Flat-rate professional expenses: 30% of income after social security,
    // capped at €6,070 for income year 2026.
    professionalExpenses: { rate: 30, cap: 6070 },
    // The belastingvrije som / quotité exemptée is a tax *credit* at the first
    // band's 25%, not a zero-rate slice: €11,180 × 25% = €2,795 off the bill.
    taxFreeSum: 11180,
    // Aanvullende gemeentebelasting, charged on the federal tax due. Municipal
    // rates run 0–9%; 7% is the national average.
    communalSurcharge: 7,
    flag: '🇧🇪'
  },
  'SE': {
    country: 'Sweden',
    currency: 'SEK',
    symbol: 'SEK',
    // Prisbasbelopp 2026, the unit almost every Swedish threshold is expressed in.
    priceBaseAmount: 59200,
    // SCB average total municipal rate for 2026 (kommun + region). Range is
    // 28.93% in Österåker to 35.65% in Dorotea.
    municipalTax: 32.38,
    // Jobbskatteavdrag is computed on the municipal rate less the standard
    // 1.16 percentage points for begravningsavgift and church fee.
    jobCreditRate: 31.22,
    stateTax: [
      { min: 0, max: 643000, rate: 0 },
      { min: 643000, max: Infinity, rate: 20 }
    ],
    // Allmän pensionsavgift: 7% up to 8.07 inkomstbasbelopp, nothing below
    // 0.423 prisbasbelopp. Fully refunded by a matching skattereduktion.
    socialSecurity: 7,
    pension: { rate: 7, floor: 25042, ceiling: 673038 },
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

// Germany Tax Calculation — 2026 payroll approximation for a single employee:
// Steuerklasse I, childless, statutory insurance, no church tax.
const calculateGermanySalary = (annual, system, results) => {
  const s = system.socialSecurity;
  const pensionBase = Math.min(annual, system.ceilings.pensionUnemployment);
  const healthBase = Math.min(annual, system.ceilings.healthCare);
  const pension = pensionBase * (s.pension / 100);
  const unemployment = pensionBase * (s.unemployment / 100);
  const health = healthBase * (s.health / 100);
  const care = healthBase * (s.care / 100);
  const socialSec = pension + unemployment + health + care;

  // Taxable income (zvE): gross minus the employee lump sums (Werbungskosten
  // €1,230 + Sonderausgaben €36) and deductible insurance contributions
  // (pension in full, health at 96% for sick-pay entitlement, care in full).
  const zvE = Math.floor(Math.max(0, annual - 1230 - 36 - pension - health * 0.96 - care));

  // §32a EStG tariff, 2026 coefficients (gesetze-im-internet.de/estg/__32a.html)
  let incomeTax = 0;
  if (zvE > 277825) {
    incomeTax = 0.45 * zvE - 19470.38;
  } else if (zvE > 69878) {
    incomeTax = 0.42 * zvE - 11135.63;
  } else if (zvE > 17799) {
    const z = (zvE - 17799) / 10000;
    incomeTax = (173.10 * z + 2397) * z + 1034.87;
  } else if (zvE > 12348) {
    const y = (zvE - 12348) / 10000;
    incomeTax = (914.51 * y + 1400) * y;
  }
  incomeTax = Math.floor(incomeTax);

  // Solidarity surcharge: zero up to €20,350 of income tax (2026 Freigrenze),
  // then tapered at 11.9% of the excess until the full 5.5% applies.
  const solidarity = incomeTax > 20350
    ? Math.min(incomeTax * 0.055, (incomeTax - 20350) * 0.119)
    : 0;

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
//
// The old model applied the barème straight to gross and charged a flat 21.3%
// of social contributions including a 2.4% unemployment charge employees have
// not paid since 2019. That overstated deductions on €60,000 by about €5,000.
// Correct order: cotisations -> net imposable (gross less the deductible
// contributions) -> 10% professional-expenses allowance -> barème -> décote.
// Models a single person (one part); the quotient familial is not applied.
const calculateFranceSalary = (annual, system, results) => {
  const ss = system.socialSecurity;
  const pass = system.pass;
  const t1 = Math.min(annual, pass);
  const t2 = Math.max(0, Math.min(annual, 8 * pass) - pass);
  const csgBase = Math.min(annual, 4 * pass) * (ss.csgBase / 100) + Math.max(0, annual - 4 * pass);

  const deductible =
    t1 * (ss.pensionCapped + ss.agircT1) / 100 +
    annual * ss.pensionUncapped / 100 +
    t2 * ss.agircT2 / 100 +
    (annual > pass ? Math.min(annual, 8 * pass) * ss.cet / 100 : 0) +
    csgBase * ss.csgDeductible / 100;
  const nonDeductible = csgBase * (ss.csgNonDeductible + ss.crds) / 100;
  const socialSec = deductible + nonDeductible;

  const netImposable = annual - deductible;
  const allowance = Math.min(
    Math.max(netImposable * system.professionalExpenses.rate / 100, system.professionalExpenses.min),
    system.professionalExpenses.cap
  );
  const taxableIncome = Math.max(0, netImposable - allowance);

  let grossTax = 0;
  for (const band of system.taxBands) {
    if (taxableIncome > band.min) {
      const taxableAmount = Math.min(taxableIncome - band.min, band.max - band.min);
      grossTax += taxableAmount * (band.rate / 100);
    }
  }

  // The décote softens the entry into tax for modest earners: below the
  // threshold the bill is cut by base - 45.25% of itself.
  const decote = grossTax > 0 && grossTax < system.decote.threshold
    ? Math.min(grossTax, Math.max(0, system.decote.base - grossTax * system.decote.rate / 100))
    : 0;
  const incomeTax = Math.max(0, grossTax - decote);

  const totalDeductions = socialSec + incomeTax;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    socialSecurity: socialSec,
    taxableIncome,
    ...(decote > 0 ? { grossTax, taxCredits: decote } : {}),
    incomeTax,
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
//
// Austria pays 14 salaries, not 12, and that is the whole reason a flat "bands
// on gross" model overstates Austrian tax so badly. The 13th and 14th (Urlaubs-
// and Weihnachtsgeld) are Sonderzahlungen: they escape the progressive tariff
// entirely and are taxed at a flat 6% above a €620 Freibetrag, at a lower social
// security rate, under their own contribution ceiling. Two of every fourteen
// euros are therefore taxed at a fraction of the marginal rate.
//
// The other three corrections over the old model: social security stops at the
// Höchstbeitragsgrundlage instead of running on forever, it is deducted from the
// taxable base before the tariff applies, and the Verkehrsabsetzbetrag comes off
// the resulting bill.
//
// `annual` is Jahresbrutto — all 14 payments — which is how Austrian salaries are
// advertised. Models an Angestellte(r) outside Vienna (18.32% there from 2026),
// single, no children. Excluded: the Zuschlag zum Verkehrsabsetzbetrag and the
// Negativsteuer, both of which are granted at assessment rather than in payroll
// and only reach low earners, so those are modelled slightly pessimistically.
const calculateAustriaSalary = (annual, system, results) => {
  const perPayment = annual / system.paymentsPerYear;
  const runningPay = perPayment * 12;
  const specialPay = annual - runningPay;

  // Running pay: contributions are capped monthly, so the ceiling bites on the
  // month rather than on the year.
  const socialSecurityRunning =
    Math.min(perPayment, system.ceilings.monthly) * 12 * (system.socialSecurity / 100);
  // The 13th/14th have their own annual ceiling and their own lower rate.
  const socialSecuritySpecial =
    Math.min(specialPay, system.ceilings.special) * (system.socialSecuritySpecial / 100);
  const socialSec = socialSecurityRunning + socialSecuritySpecial;

  // Progressive tariff, on running pay only, after social security and the
  // standard Werbungskostenpauschale.
  const taxableIncome = Math.max(
    0,
    runningPay - socialSecurityRunning - system.werbungskostenpauschale
  );
  let grossTax = 0;
  for (const band of system.taxBands) {
    if (taxableIncome > band.min) {
      const taxableAmount = Math.min(taxableIncome - band.min, band.max - band.min);
      grossTax += taxableAmount * (band.rate / 100);
    }
  }

  // Verkehrsabsetzbetrag: raised below €15,069, tapering back to the base by €16,056.
  const vab = system.verkehrsabsetzbetrag;
  let verkehrsabsetzbetrag;
  if (taxableIncome <= vab.raisedTo) {
    verkehrsabsetzbetrag = vab.raised;
  } else if (taxableIncome >= vab.taperTo) {
    verkehrsabsetzbetrag = vab.base;
  } else {
    const progress = (taxableIncome - vab.raisedTo) / (vab.taperTo - vab.raisedTo);
    verkehrsabsetzbetrag = vab.raised - (vab.raised - vab.base) * progress;
  }
  const incomeTax = Math.max(0, grossTax - verkehrsabsetzbetrag);

  // Sonderzahlungen: flat 6% above the Freibetrag, and nothing at all below the
  // Freigrenze. A 14-payment salary puts the two extra months exactly at the
  // Jahressechstel, so all of it qualifies for the favourable rate.
  const specialTaxable = Math.max(0, specialPay - socialSecuritySpecial);
  const specialTax = specialTaxable <= system.special.freigrenze
    ? 0
    : Math.max(0, (specialTaxable - system.special.freibetrag) * (system.special.rate / 100));

  const totalDeductions = socialSec + incomeTax + specialTax;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    socialSecurity: socialSec,
    taxableIncome,
    grossTax,
    taxCredits: verkehrsabsetzbetrag,
    incomeTax,
    specialPaymentTax: specialTax,
    totalDeductions
  };

  results.netAnnual = netAnnual;
  results.netMonthly = netAnnual / 12;
  results.effectiveRate = (totalDeductions / annual) * 100;

  return results;
};

// Belgium Tax Calculation
//
// The order of operations is the whole game here, and applying the bands
// straight to gross (as this model used to) overstates the bill by thousands:
// employee social security comes off first, then the flat-rate professional
// expenses deduction, and only what survives both is taxed. The tax-free sum is
// a credit at 25% rather than a zero-rate band, and the communal surcharge is
// charged on the federal tax that remains after that credit.
//
// Models a single employee with no dependants taking the standard flat-rate
// expenses. Deliberately excluded: the werkbonus (a social-security rebate that
// only reaches low wages) and the bijzondere bijdrage sociale zekerheid (at most
// €731/year and mid-phase-out), so low salaries come out slightly pessimistic
// and high ones slightly optimistic, by well under €1,000 either way.
const calculateBelgiumSalary = (annual, system, results) => {
  const socialSec = annual * (system.socialSecurity / 100);
  const afterSocial = annual - socialSec;

  const professionalExpenses = Math.min(
    afterSocial * (system.professionalExpenses.rate / 100),
    system.professionalExpenses.cap
  );
  const taxableIncome = Math.max(0, afterSocial - professionalExpenses);

  let grossTax = 0;
  for (const band of system.taxBands) {
    if (taxableIncome > band.min) {
      const taxableAmount = Math.min(taxableIncome - band.min, band.max - band.min);
      grossTax += taxableAmount * (band.rate / 100);
    }
  }

  // The credit is worth 25% of the exempt slice, and cannot exceed the taxable
  // income actually present — a very low earner does not bank the difference.
  const taxCredits = Math.min(system.taxFreeSum, taxableIncome) * (system.taxBands[0].rate / 100);
  const incomeTax = Math.max(0, grossTax - taxCredits);
  const municipalTax = incomeTax * (system.communalSurcharge / 100);

  const totalDeductions = socialSec + incomeTax + municipalTax;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    socialSecurity: socialSec,
    taxableIncome,
    grossTax,
    taxCredits,
    incomeTax,
    municipalTax,
    totalDeductions
  };

  results.netAnnual = netAnnual;
  results.netMonthly = netAnnual / 12;
  results.effectiveRate = (totalDeductions / annual) * 100;

  return results;
};

// Sweden Tax Calculation
//
// The old model charged full municipal tax on gross and then took 7% on top,
// which double-counted in both directions: it ignored the grundavdrag and the
// jobbskatteavdrag (the two large reliefs that make Swedish take-home far less
// punishing than the ~32% headline rate), and it treated the allmän
// pensionsavgift as a cost when in fact a matching skattereduktion refunds
// 100% of it. On 400,000 kr that produced a 39.1% effective rate against a real
// figure near 20%.
//
// Formulas and thresholds follow Skatteverket's technical description for 2026
// (SKV 433, utgåva 36); this implementation reproduces its worked examples.
// Models an employee under 66, single, in a municipality at the national
// average rate. Excluded: church fee (only members pay it), the higher
// grundavdrag for over-66s, and regional variation of ±1.6 percentage points
// either side of the average.
const calculateSwedenSalary = (annual, system, results) => {
  const pbb = system.priceBaseAmount;

  // Grundavdrag rises, plateaus, then tapers to a floor. Capped at income and
  // rounded up to a whole hundred kronor.
  let grundavdrag;
  if (annual <= 0.99 * pbb) {
    grundavdrag = 0.423 * pbb;
  } else if (annual <= 2.72 * pbb) {
    grundavdrag = 0.423 * pbb + 0.2 * (annual - 0.99 * pbb);
  } else if (annual <= 3.11 * pbb) {
    grundavdrag = 0.77 * pbb;
  } else if (annual <= 7.88 * pbb) {
    grundavdrag = 0.77 * pbb - 0.1 * (annual - 3.11 * pbb);
  } else {
    grundavdrag = 0.293 * pbb;
  }
  grundavdrag = Math.ceil(Math.min(grundavdrag, annual) / 100) * 100;

  const taxableIncome = Math.max(0, annual - grundavdrag);

  const municipalTax = taxableIncome * (system.municipalTax / 100);
  let stateTax = 0;
  for (const band of system.stateTax) {
    if (taxableIncome > band.min) {
      const taxableAmount = Math.min(taxableIncome - band.min, band.max - band.min);
      stateTax += taxableAmount * (band.rate / 100);
    }
  }

  // Allmän pensionsavgift, rounded to a whole hundred with exact fifties going
  // down, then refunded in full by a skattereduktion that cannot exceed the tax
  // it offsets. For anyone with income tax to spare the two simply cancel.
  const pensionFee = annual < system.pension.floor
    ? 0
    : Math.ceil(
      (Math.min(annual, system.pension.ceiling) * (system.pension.rate / 100)) / 100 - 0.5
    ) * 100;
  const pensionCredit = Math.min(pensionFee, municipalTax + stateTax);

  // Jobbskatteavdrag: a four-band build-up on income, less the grundavdrag,
  // valued at the municipal rate. The phase-out for high earners was removed
  // for 2026, so the top band is a flat ceiling. Offsets municipal tax only.
  const workIncome = Math.floor(annual / 100) * 100;
  let creditBase;
  if (workIncome <= 0.91 * pbb) {
    creditBase = workIncome;
  } else if (workIncome <= 3.24 * pbb) {
    creditBase = 0.91 * pbb + 0.3874 * (workIncome - 0.91 * pbb);
  } else if (workIncome <= 8.08 * pbb) {
    creditBase = 1.813 * pbb + 0.251 * (workIncome - 3.24 * pbb);
  } else {
    creditBase = 3.027 * pbb;
  }
  const jobTaxCredit = Math.min(
    Math.max(0, Math.floor((creditBase - grundavdrag) * (system.jobCreditRate / 100))),
    municipalTax
  );

  const taxCredits = pensionCredit + jobTaxCredit;
  const totalDeductions = municipalTax + stateTax + pensionFee - taxCredits;
  const netAnnual = annual - totalDeductions;

  results.breakdown = {
    taxableIncome,
    municipalTax,
    stateTax,
    socialSecurity: pensionFee,
    taxCredits,
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
const computeEuropeanSalary = (countryCode, annual) => {
  const system = SALARY_SYSTEMS[countryCode];
  const calculate = CALCULATORS[countryCode];
  if (!system || !calculate || !annual || annual <= 0) return null;

  const paymentsPerYear = system.paymentsPerYear || 12;
  const results = {
    grossAnnual: annual,
    grossMonthly: annual / 12,
    currency: system.currency,
    country: system.country,
    flag: system.flag,
    paymentsPerYear,
    breakdown: {}
  };
  const computed = calculate(annual, system, results);

  // Where a country pays more than twelve times a year, the annual net divided
  // by twelve is an average nobody is ever handed. Carry the real per-payment
  // figure alongside it so the UI can show what lands in a regular month.
  computed.netPerPayment = computed.netAnnual / paymentsPerYear;
  return computed;
};

// CommonJS so the Node test runner can require this directly, matching
// utils/taxCalculations.js. Webpack resolves the named imports either way.
module.exports = {
  SALARY_SYSTEMS,
  computeEuropeanSalary
};
