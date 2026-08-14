// Which languages are offered where.
//
// Regions are kept apart deliberately: offering Tamil on the Germany salary
// calculator, or German on the GST calculator, is noise for both readers. Each
// region also stores its own choice, so someone who reads the India tools in
// Hindi and the Europe tools in German is not fighting one shared setting.

export const REGIONS = {
  in: {
    key: 'in',
    locales: ['en', 'hi', 'bn', 'mr', 'ta', 'te'],
    storageKey: 'upaman:locale',
  },
  eu: {
    key: 'eu',
    locales: ['en', 'de', 'fr', 'es'],
    storageKey: 'upaman:locale:eu',
  },
};

// Routes that belong to each region. Explicit rather than pattern-matched: the
// India tools have no shared URL prefix, and a stray prefix rule would put a
// language switcher on pages with nothing translated behind it.
const IN_ROUTES = [
  '/india-calculators',
  '/loan-calculator',
  '/income-tax-calculator',
  '/tax-regime-comparison',
  '/gst-calculator',
  '/gst-reform-calculator',
  '/hra-calculator',
  '/capital-gains-calculator',
  '/gratuity-calculator',
  '/sip-calculator',
  '/ppf-calculator',
  '/salary-calculator',
  '/income-tax-due-dates',
  '/buy-vs-rent-calculator',
  '/credit-card-trap-calculator',
];

// UK pages are deliberately absent. English is the native language there, and a
// German toggle on a UK income tax calculator helps nobody.
const EU_ROUTES = [
  '/eu-calculators',
  '/eu-vat-calculator',
  '/european-salary-calculator',
  '/germany-salary-calculator',
  '/france-salary-calculator',
  '/netherlands-salary-calculator',
];

const ROUTE_REGION = new Map([
  ...IN_ROUTES.map((r) => [r, 'in']),
  ...EU_ROUTES.map((r) => [r, 'eu']),
]);

/** The region a route belongs to, or null where no switcher should appear. */
export const regionForRoute = (pathname) => ROUTE_REGION.get(pathname) || null;

export default REGIONS;
