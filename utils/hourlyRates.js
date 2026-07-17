// Hourly rates with dedicated /hourly/[rate] pages. Keep in sync with
// public/sitemap.xml. Every dollar $15–$30 (highest query volume), then the
// common round rates up to $75.
const HOURLY_RATES = [
  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  32, 35, 40, 45, 50, 55, 60, 65, 70, 75
];

// UK rates with dedicated /uk/hourly/[rate] pages (£). Every pound £12–£25,
// then common round rates.
const UK_HOURLY_RATES = [
  12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
  28, 30, 35, 40, 45, 50
];

module.exports = { HOURLY_RATES, UK_HOURLY_RATES };
