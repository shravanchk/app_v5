const { marketIN, formatCurrencyIN } = require('./in');
const { marketUS, formatCurrencyUS } = require('./us');
const { marketEU, formatCurrencyEU } = require('./eu');

// Keyed by the region values already used in workflow UIs.
const markets = {
  india: marketIN,
  us: marketUS,
  eu: marketEU
};

const formatCurrencyFor = (market) => (amount) =>
  new Intl.NumberFormat(market.locale, {
    style: 'currency',
    currency: market.currency,
    maximumFractionDigits: 0
  }).format(amount);

module.exports = {
  markets,
  formatCurrencyFor,
  marketIN,
  marketUS,
  marketEU,
  formatCurrencyIN,
  formatCurrencyUS,
  formatCurrencyEU
};
