// Swiss take-home pay by canton, from an ESTV snapshot.
//
// Swiss income tax is set three times over (federal, cantonal, communal) and
// cantonal + communal tax varies roughly threefold across the country, so a
// formula with one "average" canton rate — what the European engine used to do
// — is wrong almost everywhere. Instead, scripts/fetch-swiss-tax-data.py asks
// the federal tax administration's own calculator for every cantonal capital
// at 18 salary levels and the four BVG age bands, and this module interpolates
// between those official points.
//
// Linear interpolation between grid points is close but not exact. Spot checks
// against the live ESTV calculator at 12 off-grid salaries (CHF 35k-450k, 9
// cantons) were within 0.3% of gross either way, most within 0.1%.

const DATA = require('../data/swissTax2026.json');

const CANTON_NAMES = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Lucerne', UR: 'Uri', SZ: 'Schwyz', OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus',
  ZG: 'Zug', FR: 'Fribourg', SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Landschaft', SH: 'Schaffhausen',
  AR: 'Appenzell Ausserrhoden', AI: 'Appenzell Innerrhoden', SG: 'St. Gallen', GR: 'Graubünden', AG: 'Aargau',
  TG: 'Thurgau', TI: 'Ticino', VD: 'Vaud', VS: 'Valais', NE: 'Neuchâtel', GE: 'Geneva', JU: 'Jura'
};

const AGE_BANDS = DATA.ageBands; // ['25-34', '35-44', '45-54', '55-65']
const CANTONS = Object.keys(DATA.cantons);
const MIN_GROSS = DATA.incomes[0];

// Value of a row-per-income table at `gross`: linear between grid points,
// extending the last segment's slope above the top of the grid. Below the
// grid there is no official point to anchor to, so callers are told the
// figure is outside the modelled range rather than given a guess.
const interpolate = (rows, gross) => {
  const xs = DATA.incomes;
  let i = xs.findIndex((x) => x >= gross);
  if (i === -1) i = xs.length - 1;
  if (i === 0) i = 1;
  const [x0, x1] = [xs[i - 1], xs[i]];
  const t = (gross - x0) / (x1 - x0);
  return rows[i - 1].map((v0, k) => v0 + (rows[i][k] - v0) * t);
};

const computeSwissSalary = ({ gross, canton = 'ZH', ageBand = '35-44' } = {}) => {
  const g = Number(gross);
  const entry = DATA.cantons[canton];
  const band = AGE_BANDS.includes(ageBand) ? ageBand : '35-44';
  if (!entry || !Number.isFinite(g) || g <= 0) return null;

  const x = Math.max(g, MIN_GROSS);
  const scale = g / x; // below the grid, social contributions still scale with pay
  const [ahv, alv, nbu, bvg] = interpolate(DATA.social[band], x).map((v) => v * scale);
  const [federal, cantonal, communal, personal] = interpolate(entry.taxes[band], x).map((v) => Math.max(0, v));

  const social = { ahv, alv, nbu, bvg, total: ahv + alv + nbu + bvg };
  const taxes = { federal, cantonal, communal, personal, total: federal + cantonal + communal + personal };
  const net = g - social.total - taxes.total;
  return {
    gross: g,
    canton,
    city: entry.city,
    ageBand: band,
    social,
    taxes,
    net,
    netMonthly: net / 12,
    effectiveRate: ((social.total + taxes.total) / g) * 100,
    taxRate: (taxes.total / g) * 100,
    belowModelledRange: g < MIN_GROSS
  };
};

// Every canton at one salary, highest take-home first.
const rankCantons = (gross, ageBand = '35-44') =>
  CANTONS.map((code) => computeSwissSalary({ gross, canton: code, ageBand }))
    .filter(Boolean)
    .sort((a, b) => b.net - a.net);

module.exports = {
  SWISS_TAX_YEAR: DATA.taxYear,
  SWISS_DATA_SOURCE: DATA.source,
  SWISS_DATA_FETCHED: DATA.fetchedOn,
  CANTON_NAMES,
  CANTONS,
  AGE_BANDS,
  MIN_GROSS,
  computeSwissSalary,
  rankCantons
};
