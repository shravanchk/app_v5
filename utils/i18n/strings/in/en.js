// English source dictionary. Every other locale mirrors this shape; anything
// missing elsewhere falls back to the string here (see LanguageProvider).
//
// Scope note: this covers interactive UI chrome only — input labels, result
// labels, tab names, unit options. The long-form prose, FAQ, and methodology
// panels in each calculator stay English: they are the indexed body content,
// and translating them is a separate decision with SEO consequences.

const en = {
  switcher: {
    label: 'Language',
    ariaLabel: 'Choose display language',
    note: 'Translates the calculator labels. Explanations stay in English.',
  },

  hub: {
    eyebrow: 'India',
    title: 'India Calculators Hub',
    subtitle:
      'High-intent India tools for tax, borrowing, investing, salary, and decision workflows — all free and current for FY 2026-27.',
    overviewHeading: 'Built for FY 2026-27 rules',
  },

  // Keyed by card id (see IndiaCalculatorsHub) rather than by path, so a URL
  // change does not silently orphan five translations.
  cards: {
    loan: {
      title: 'Loan & EMI Calculator',
      description: 'Calculate EMI, prepayment impact, and amortization for home, car, and personal loans.',
      tags: ['EMI breakdown', 'Prepayment', 'Amortization'],
    },
    incomeTax: {
      title: 'Income Tax Calculator',
      description: 'Estimate income tax for FY 2026-27 with old/new regime comparison.',
      tags: ['FY 2026-27', 'Old vs new', 'Tax estimate'],
    },
    taxRegime: {
      title: 'Tax Regime Comparison',
      description: 'Check which regime saves more tax using salary and deduction-aware inputs.',
      tags: ['Old vs new', 'Savings view', 'Decision support'],
    },
    gst: {
      title: 'GST Calculator',
      description: 'Add/remove/reverse GST with CGST, SGST, and IGST split.',
      tags: ['Inclusive/exclusive', 'CGST/SGST/IGST', 'Rate-wise'],
    },
    gstReform: {
      title: 'GST 2.0 Price Calculator',
      description: 'Compare an item’s price before and after the Sept 2025 GST reform (5/18/40).',
      tags: ['Old vs new GST', 'Price change', 'GST 2.0'],
    },
    hra: {
      title: 'HRA Exemption Calculator',
      description: 'Find your tax-exempt House Rent Allowance using the least-of-three rule (old regime).',
      tags: ['Old regime', 'Metro/non-metro', 'Rent receipts'],
    },
    capitalGains: {
      title: 'Capital Gains Tax Calculator',
      description: 'LTCG/STCG on equity, mutual funds, and property for FY 2026-27.',
      tags: ['LTCG 12.5%', 'STCG 20%', '₹1.25L exemption'],
    },
    gratuity: {
      title: 'Gratuity Calculator',
      description: 'Estimate gratuity using the 15/26 formula with the ₹20 lakh tax-free ceiling.',
      tags: ['Gratuity Act', '15/26 rule', 'Tax-free limit'],
    },
    taxOnSalary: {
      title: 'Tax on Salary (₹5L–₹50L)',
      description: 'New-regime income tax for every salary level with full slab breakdown.',
      tags: ['FY 2026-27', 'By salary', 'Take-home'],
    },
    sip: {
      title: 'SIP Calculator',
      description: 'Estimate SIP corpus with expected returns and goal-based planning.',
      tags: ['Future value', 'Goal planning', 'Step-up'],
    },
    ppf: {
      title: 'PPF Calculator',
      description: 'Project PPF maturity with year-wise contribution and interest assumptions.',
      tags: ['15-year plan', 'Year-wise table', 'Maturity'],
    },
    salary: {
      title: 'Salary Calculator',
      description: 'Convert CTC to in-hand salary with key deduction estimates.',
      tags: ['CTC to net', 'Deduction view', 'Take-home'],
    },
    dueDates: {
      title: 'Income Tax Due Dates',
      description: 'Every ITR and advance tax deadline for AY 2026-27, with calendar reminders you add yourself.',
      tags: ['ITR last date', 'Advance tax', 'Calendar reminder'],
    },
    buyVsRent: {
      title: 'Buy vs Rent Calculator',
      description: 'Estimate break-even timeline for buying vs renting using EMI and rent growth.',
      tags: ['Break-even', 'EMI vs rent', 'Home decision'],
    },
    prepayVsInvest: {
      title: 'Prepay vs Invest Workflow',
      description: 'Compare whether monthly surplus should prepay debt or be invested for growth.',
      tags: ['Debt vs investing', 'Risk-adjusted', 'Surplus'],
    },
    fdVsSip: {
      title: 'FD vs SIP Workflow',
      description: 'Compare fixed deposit and SIP on post-tax maturity with a horizon-aware verdict.',
      tags: ['Post-tax view', 'LTCG vs slab', 'Verdict'],
    },
    retirement: {
      title: 'Retirement Readiness Workflow',
      description: 'Find the corpus your lifestyle needs at 60 and whether your savings are on track to build it.',
      tags: ['Corpus target', 'Readiness score', 'Monthly plan'],
    },
    emergencyFund: {
      title: 'Emergency Fund Readiness',
      description: 'Find your target runway, current gap, and monthly plan to build a safer corpus.',
      tags: ['Runway target', 'Gap to target', 'Milestones'],
    },
    rentVsBuy: {
      title: 'Rent vs Buy Decision',
      description: 'Compare renting versus buying with break-even year, affordability, and cash buffer.',
      tags: ['Break-even', 'Cash buffer', 'Housing'],
    },
    carCost: {
      title: 'Car Ownership Cost',
      description: 'Estimate fuel, toll, parking, EMI, and upkeep cost of running a car.',
      tags: ['Fuel expense', 'Transport budget', 'Running cost'],
    },
    creditCardTrap: {
      title: 'Credit Card Trap Calculator',
      description: 'Compare minimum due vs fixed payment and estimate payoff time.',
      tags: ['Debt payoff', 'Interest saved', 'Strategy'],
    },
  },

  // Labels that recur across several calculators. Translating these once keeps
  // terminology identical everywhere, which matters more in a second language
  // than in English — a reader who learns "ब्याज दर" on the EMI page should
  // meet the same phrase on the loan and credit-card pages.
  common: {
    amount: 'Amount',
    annualIncome: 'Annual income',
    annualSalaryGross: 'Annual salary (gross)',
    basicSalary: 'Basic salary',
    city: 'City',
    effectiveRate: 'Effective rate',
    expectedAnnualReturn: 'Expected annual return',
    financialYear: 'Financial year',
    futureValue: 'Future value',
    grossSalary: 'Gross salary',
    hra: 'HRA',
    incomeTax: 'Income tax',
    interestRatePa: 'Interest rate (p.a.)',
    invested: 'Invested',
    investmentPeriod: 'Investment period',
    loanAmount: 'Loan amount',
    maturityValue: 'Maturity value',
    monthlyEmi: 'Monthly EMI',
    months: 'Months',
    principal: 'Principal',
    professionalTax: 'Professional tax',
    rate: 'Rate',
    returnPercent: 'Return %',
    taxRegime: 'Tax regime',
    taxableIncome: 'Taxable income',
    tenure: 'Tenure',
    totalDeductions: 'Total deductions',
    totalInterest: 'Total interest',
    totalInvested: 'Total invested',
    totalPayment: 'Total payment',
    totalReturns: 'Total returns',
    totalTax: 'Total tax',
    totalTaxPayable: 'Total tax payable',
    unit: 'Unit',
    years: 'Years',
    regimeOld: 'Old regime',
    regimeNew: 'New regime',
  },

  emi: {
    loanTenure: 'Loan tenure',
    outstandingPrincipal: 'Outstanding principal',
    currentEmi: 'Current EMI',
    remainingTenure: 'Remaining tenure',
    interestSaved: 'Interest saved',
    timeSaved: 'Time saved',
  },

  sip: {
    monthlyInvestment: 'Monthly investment',
    annualStepUp: 'Annual step-up (optional)',
    stepUpHint: 'Increase your SIP each year as income grows.',
    returnOnInvestment: 'Return on investment',
    targetCorpus: 'Target corpus',
    requiredMonthlySip: 'Required monthly SIP',
    projectedReturns: 'Projected returns',
    monthlySipAmount: 'Monthly SIP amount',
    lumpsumAmount: 'Lumpsum amount',
  },

  ppf: {
    annualContribution: 'Annual contribution',
    contributionMode: 'Contribution mode',
    annualInterestRate: 'Annual Interest Rate',
    finalAnnualContribution: 'Final annual contribution',
  },

  hra: {
    basicSalaryAnnual: 'Basic salary (annual)',
    daAnnual: 'Dearness allowance (annual)',
    hraReceivedAnnual: 'HRA received (annual)',
    rentPaidAnnual: 'Rent paid (annual)',
    rentPaid: 'Rent paid',
    metroLabel:
      'Metro city — Delhi, Mumbai, Kolkata, Chennai, plus Bengaluru, Hyderabad, Pune & Ahmedabad from FY 2026-27',
    exemptHra: 'Exempt HRA',
    optionActual: '1. Actual HRA received',
    optionRent: '2. Rent paid − 10% of salary',
    optionPercentMetro: '3. 50% of salary',
    optionPercentNonMetro: '3. 40% of salary',
    exemptLeast: 'Exempt (least of the three)',
    taxableHra: 'Taxable HRA',
  },

  gratuity: {
    lastDrawnSalary: 'Last drawn monthly salary (Basic + DA)',
    completedYears: 'Completed years of service',
    additionalMonths: 'Additional months',
    gratuityApplicable: 'Gratuity applicable',
    coveredByAct: 'Covered by the Payment of Gratuity Act (divisor 26)',
    estimatedGratuity: 'Estimated gratuity',
    cappedNote: 'Capped at the ₹20,00,000 statutory tax-free ceiling.',
    yearsWord: 'years',
  },

  gst: {
    baseAmount: 'Base amount',
    baseAmountBeforeGst: 'Base amount (before GST)',
    gstRate: 'GST rate',
    gstInclusiveAmount: 'GST-inclusive amount',
    inclusiveAmount: 'Inclusive amount',
    totalInclGst: 'Total (incl. GST)',
    originalTaxableValue: 'Original taxable value',
    finalAmount: 'Final amount',
    finalAmountReceived: 'Final amount received',
  },

  incomeTax: {
    ageGroup: 'Age group',
    section80C: 'Section 80C',
    section80D: 'Section 80D',
    deductions80C: '80C Deductions',
    deductions80D: '80D Deductions',
    otherDeductions: 'Other deductions',
    homeLoanInterest: 'Home-loan interest',
    npsCcd1b: 'NPS 80CCD(1B)',
    hraExemptionOld: 'HRA Exemption (Old Regime)',
    slabTax: 'Slab tax',
    rebate87A: 'Section 87A rebate',
    marginalRelief: 'Marginal relief',
    cess4: 'Cess (4%)',
    healthEducationCess: 'Health & education cess (4%)',
    advanceTaxPaid: 'Advance tax paid',
    balanceTaxPayable: 'Balance tax payable',
    balanceTaxToPay: 'Balance tax to pay',
    grossIncome: 'Gross income',
  },

  taxRegime: {
    oldRegimeTax: 'Old regime tax',
    newRegimeTax: 'New regime tax',
    oldTaxableIncome: 'Old taxable income',
    newTaxableIncome: 'New taxable income',
    oldRegimeDeductions: 'Old-regime deductions (80C, 80D, HRA, etc.)',
  },

  salary: {
    annualCtc: 'Annual CTC',
    annualSalaryInr: 'Annual Salary (INR)',
    includesHra: 'Includes HRA',
    specialAllowance: 'Special allowance',
    hraReceived: 'HRA received',
    pfEmployee: 'PF (employee)',
    pfContribution: 'PF contribution',
    esic: 'ESIC',
    netSalaryAfterTax: 'Net salary (after tax)',
    monthlyTakeHome: 'Monthly take-home',
    annualTakeHome: 'Annual take-home',
    takeHomeRatio: 'Take-home ratio',
    currentSalaryCtc: 'Current salary (CTC)',
    newOfferCtc: 'New offer (CTC)',
    currentCity: 'Current city',
    newCity: 'New city',
    salaryIncrease: 'Salary increase',
    nominalRaise: 'Nominal raise',
    costAdjustedRaise: 'Cost-adjusted raise',
    realIncrease: 'Real increase (adj.)',
    grossBusinessIncome: 'Gross business income',
    businessExpenses: 'Business expenses',
    depreciation: 'Depreciation',
    taxableProfit: 'Taxable profit',
    totalExpenses: 'Total expenses',
  },

  creditCard: {
    outstandingBalance: 'Outstanding Balance',
    minimumDuePercent: 'Minimum Due (% of balance)',
    minimumDueFloor: 'Minimum Due Floor',
    payoffTime: 'Payoff Time',
    estimatedDebtFreeBy: 'Estimated Debt Free By',
    monthlyPaymentPlan: 'Your Monthly Payment Plan',
    totalInterestCap: 'Total Interest',
  },

  // Dropdown option text. Kept apart from the field labels so a select and
  // its choices can be reviewed together.
  options: {
    unitYears: 'years',
    unitMonths: 'months',
    regimeNewDefault: 'New regime (default)',
    regimeOld: 'Old regime',
    cityMetro: 'Metro city',
    cityNonMetro: 'Non-metro city',
    ageBelow60: 'Below 60',
    ageSenior: '60 to 79 (senior citizen)',
    ageSuperSenior: '80 and above (super senior)',
    ppfMonthly: 'Monthly installments',
    ppfYearlyStart: 'Yearly lump sum (start of year)',
    ppfYearlyEnd: 'Yearly lump sum (end of year)',
    assetEquity: 'Listed equity / equity mutual fund',
    assetProperty: 'Property (land / building)',
    assetOther: 'Other (gold, unlisted, debt fund, etc.)',
    termLong: 'Long-term',
    termShort: 'Short-term',
    gstBasePrice: 'Base price (before GST)',
    gstOldMrp: 'Old MRP (including old GST)',
  },


  capitalGains: {
    assetType: 'Asset type',
    holdingTerm: 'Holding term',
    saleValue: 'Sale value',
    purchaseCost: 'Purchase cost',
    transferExpenses: 'Transfer / improvement expenses',
    slabRate: 'Your income slab rate (%)',
    totalTaxPayableCess: 'Total tax payable (incl. 4% cess)',
    capitalGain: 'Capital gain',
    lessExemption: 'Less: exemption',
    tax: 'Tax',
    netGainAfterTax: 'Net gain after tax',
  },

  gstReform: {
    thisAmountIs: 'This amount is…',
    oldGstRate: 'Old GST rate',
    newGstRate: 'New GST rate',
    oldPriceGst: 'Old price · GST',
    newPriceGst: 'New price · GST',
  },

  buyVsRent: {
    homePrice: 'Home Price (INR)',
    downPayment: 'Down Payment (%)',
    loanInterestRate: 'Loan Interest Rate (%)',
    loanTenureYears: 'Loan Tenure (Years)',
    monthlyRent: 'Monthly Rent (INR)',
    annualRentIncrease: 'Annual Rent Increase (%)',
    homeAppreciation: 'Home Appreciation (%)',
    analysisPeriod: 'Analysis Period (Years)',
    estimatedEmi: 'Estimated EMI',
    breakEvenYear: 'Break-even Year',
    decisionSummary: 'Decision Summary',
    cumulativeBuying: 'Cumulative buying outflow',
    cumulativeRenting: 'Cumulative renting outflow',
  },


  deadlines: {
    hideAuditOnly: 'Hide audit-only deadlines (most salaried taxpayers should leave this ticked)',
    remindMe: 'Remind me',
    lead1Day: '1 day before',
    lead3Days: '3 days before',
    lead1Week: '1 week before',
    lead2Weeks: '2 weeks before',
    downloaded: '✓ Calendar file downloaded',
    addOne: 'Add {count} deadline to my calendar',
    addMany: 'Add {count} deadlines to my calendar',
  },


  tabs: {
    addGst: 'Add GST',
    removeGst: 'Remove GST',
    reverseGst: 'Reverse GST',
    businessTax: 'Business tax',
    salaryTax: 'Salary tax',
    taxComparison: 'Old vs new',
    sipStepUp: 'SIP & step-up',
    goalBased: 'Goal-based',
    sipVsLumpsum: 'SIP vs lumpsum',
    emiSchedule: 'EMI & schedule',
    prepaymentSavings: 'Prepayment savings',
    ctcInHand: 'CTC → in-hand',
    compareOffers: 'Compare offers',
  },

};

export default en;
