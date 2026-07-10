// India market configuration for decision-workflow engines.
// Tax constants are FY 2026-27, kept in sync with CapitalGainsCalculator:
// Section 112A LTCG 12.5% above the ₹1.25 lakh annual exemption,
// Section 111A STCG 20%, plus 4% health and education cess on the tax.
const marketIN = {
  key: 'india',
  label: 'India',
  locale: 'en-IN',
  currency: 'INR',

  // Equity mutual fund capital-gains treatment.
  equityTax: {
    ltcgRate: 0.125,
    ltcgExemption: 125000,
    stcgRate: 0.2,
    longTermYears: 1,
    cessMultiplier: 1.04
  },

  // Bank deposit (FD/RD) interest treatment: taxed at marginal slab on accrual.
  interestTax: {
    cessMultiplier: 1.04
  },

  // Banks credit FD/RD interest quarterly.
  deposit: {
    compoundingPerYear: 4
  },

  marginalRateOptions: [0, 5, 10, 15, 20, 25, 30],

  prepayVsInvestDefaults: {
    outstandingLoan: 3500000,
    annualLoanRate: 8.5,
    remainingYears: 15,
    monthlySurplus: 25000,
    expectedReturn: 11
  },

  retirementDefaults: {
    currentAge: 30,
    retireAge: 60,
    lifeExpectancy: 85,
    monthlyExpenses: 50000,
    inflationPct: 6,
    preRetReturnPct: 11,
    postRetReturnPct: 7,
    currentCorpus: 500000,
    monthlySaving: 20000,
    stepUpPct: 5
  }
};

const formatCurrencyIN = (amount) =>
  new Intl.NumberFormat(marketIN.locale, {
    style: 'currency',
    currency: marketIN.currency,
    maximumFractionDigits: 0
  }).format(amount);

module.exports = { marketIN, formatCurrencyIN };
