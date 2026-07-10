// Generic EU/UK market configuration for decision-workflow engines.
// Per-country tax rules are intentionally not modelled here; when EU workflow
// variants are built, split this into per-country configs (de.js, fr.js, ...).
const marketEU = {
  key: 'eu',
  label: 'EU/UK (Generic)',
  locale: 'en-IE',
  currency: 'EUR',

  prepayVsInvestDefaults: {
    outstandingLoan: 220000,
    annualLoanRate: 4.8,
    remainingYears: 20,
    monthlySurplus: 400,
    expectedReturn: 7
  }
};

const formatCurrencyEU = (amount) =>
  new Intl.NumberFormat(marketEU.locale, {
    style: 'currency',
    currency: marketEU.currency,
    maximumFractionDigits: 0
  }).format(amount);

module.exports = { marketEU, formatCurrencyEU };
