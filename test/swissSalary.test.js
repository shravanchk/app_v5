const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../utils/swissSalary');
const { computeEuropeanSalary } = require('../utils/europeanSalaryCalculations');

const closeTo = (actual, expected, tolerance = 1) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
};

test('snapshot covers all 26 cantons and four BVG age bands', () => {
  assert.equal(S.CANTONS.length, 26);
  assert.deepEqual(S.AGE_BANDS, ['25-34', '35-44', '45-54', '55-65']);
  S.CANTONS.forEach((code) => assert.ok(S.CANTON_NAMES[code], code));
});

test('Zürich, CHF 100,000, age 35-44 reproduces the ESTV calculator', () => {
  // ESTV API_calculateDetailedTaxes, tax year 2026, Zürich city, single,
  // no church, age 35: federal 1,701, cantonal 4,494, city 5,629, personal 24.
  const r = S.computeSwissSalary({ gross: 100000, canton: 'ZH', ageBand: '35-44' });
  closeTo(r.taxes.total, 11848);
  closeTo(r.taxes.federal, 1701);
  closeTo(r.social.ahv, 5300);
  closeTo(r.social.alv, 1100);
  closeTo(r.social.nbu, 400);
  closeTo(r.social.bvg, 3538);
  closeTo(r.net, 100000 - 10338 - 11848);
});

test('interpolation lands between the neighbouring grid points', () => {
  const lo = S.computeSwissSalary({ gross: 100000, canton: 'GE' });
  const mid = S.computeSwissSalary({ gross: 105000, canton: 'GE' });
  const hi = S.computeSwissSalary({ gross: 110000, canton: 'GE' });
  assert.ok(mid.taxes.total > lo.taxes.total && mid.taxes.total < hi.taxes.total);
  closeTo(mid.taxes.total, (lo.taxes.total + hi.taxes.total) / 2, 0.01);
});

test('BVG contributions rise with the age band', () => {
  const bvg = S.AGE_BANDS.map((ageBand) => S.computeSwissSalary({ gross: 100000, canton: 'ZH', ageBand }).social.bvg);
  for (let i = 1; i < bvg.length; i += 1) assert.ok(bvg[i] > bvg[i - 1], bvg.join(', '));
});

test('canton ranking is complete and ordered by take-home pay', () => {
  const ranked = S.rankCantons(100000);
  assert.equal(ranked.length, 26);
  for (let i = 1; i < ranked.length; i += 1) assert.ok(ranked[i - 1].net >= ranked[i].net);
  // Zug is famously the lowest-tax canton for employees; Geneva/Vaud/Neuchâtel-type cantons sit at the other end.
  assert.equal(ranked[0].canton, 'ZG');
});

test('below the modelled range the result is flagged, not silently extrapolated', () => {
  const r = S.computeSwissSalary({ gross: 20000, canton: 'ZH' });
  assert.equal(r.belowModelledRange, true);
  closeTo(r.social.ahv, 20000 * 0.053, 1);
});

test('the European engine now uses the ESTV figures for Switzerland', () => {
  const eu = computeEuropeanSalary('CH', 100000);
  const ch = S.computeSwissSalary({ gross: 100000, canton: 'ZH', ageBand: '35-44' });
  closeTo(eu.netAnnual, ch.net, 0.01);
  assert.ok(eu.breakdown.occupationalPension > 0);
});
