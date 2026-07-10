// United States market configuration for decision-workflow engines.
// Currently only the fields consumed by the prepay-vs-invest workflow are
// populated. equityTax/interestTax/deposit will be filled in when US variants
// of the deposit-vs-investment workflows are built (CD vs index fund, etc.).
const marketUS = {
  key: 'us',
  label: 'United States',
  locale: 'en-US',
  currency: 'USD',

  prepayVsInvestDefaults: {
    outstandingLoan: 260000,
    annualLoanRate: 6.6,
    remainingYears: 20,
    monthlySurplus: 500,
    expectedReturn: 8
  }
};

const formatCurrencyUS = (amount) =>
  new Intl.NumberFormat(marketUS.locale, {
    style: 'currency',
    currency: marketUS.currency,
    maximumFractionDigits: 0
  }).format(amount);

module.exports = { marketUS, formatCurrencyUS };
