// Salary levels with dedicated /after-taxes/[salary] pages. Keep in sync with
// public/sitemap.xml and the row set used on /paycheck/[state] pages.
const SALARY_LEVELS = [
  30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000,
  80000, 85000, 90000, 95000, 100000, 110000, 120000, 125000, 130000,
  140000, 150000, 160000, 175000, 200000, 250000
];

// UK salary levels with dedicated /uk/take-home/[salary] pages. Keep in sync
// with public/sitemap.xml.
const UK_SALARY_LEVELS = [
  20000, 22000, 25000, 28000, 30000, 32000, 35000, 40000, 42000, 45000,
  50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 100000,
  110000, 120000, 125000, 130000, 150000
];

// German salary levels with dedicated /germany/take-home/[salary] pages.
// Keep in sync with public/sitemap.xml.
const DE_SALARY_LEVELS = [
  25000, 28000, 30000, 32000, 35000, 38000, 40000, 42000, 45000, 48000,
  50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 100000,
  110000, 120000, 130000, 140000, 150000
];

module.exports = { SALARY_LEVELS, UK_SALARY_LEVELS, DE_SALARY_LEVELS };
