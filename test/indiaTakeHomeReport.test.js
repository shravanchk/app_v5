const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const R = require('../utils/indiaTakeHomeReport');

test('covers ₹5 lakh to ₹50 lakh in one-lakh steps', () => {
  const rows = R.buildRows();
  assert.equal(rows.length, 46);
  assert.equal(rows[0].gross, 500000);
  assert.equal(rows[45].gross, 5000000);
});

test('₹12 lakh and ₹12.75 lakh pay nothing under the new regime; ₹13 lakh pays a little', () => {
  assert.equal(R.buildRow(1200000).newTax, 0);
  assert.equal(R.newRegimeTax(1275000).totalTax, 0);
  const r13 = R.buildRow(1300000);
  assert.ok(r13.newTax > 0 && r13.newTax <= 26000, `expected marginal-relief-capped tax, got ${r13.newTax}`);
  assert.ok(r13.newMarginalRelief > 0);
});

test('known new-regime figures: ₹20 lakh and ₹50 lakh', () => {
  // ₹20L: taxable 19.25L -> 0+20k+40k+60k+65k = 1,85,000 + 4% cess = 1,92,400
  assert.equal(R.buildRow(2000000).newTax, 192400);
  // ₹50L: taxable 49.25L -> 20k+40k+60k+80k+100k + 30% of 25.25L (7,57,500) = 10,57,500 + cess = 10,99,800
  assert.equal(R.buildRow(5000000).newTax, 1099800);
});

test('old regime without deductions is never cheaper than new above the rebate zone', () => {
  R.buildRows().filter((r) => r.gross > 700000).forEach((r) => {
    assert.ok(r.oldTax >= r.newTax, `old ${r.oldTax} < new ${r.newTax} at ${r.gross}`);
  });
});

test('break-even deductions make the old regime match the new regime', () => {
  const r = R.buildRow(2500000);
  assert.ok(r.breakEvenDeductions > 0);
  const oldAtBreakEven = R.oldRegimeTax(2500000, r.breakEvenDeductions).totalTax;
  assert.ok(oldAtBreakEven <= r.newTax);
  const oldJustBelow = R.oldRegimeTax(2500000, r.breakEvenDeductions - 2000).totalTax;
  assert.ok(oldJustBelow > r.newTax);
  assert.equal(R.buildRow(1000000).breakEvenDeductions, null); // new-regime tax is already 0
});

test('headline thresholds are consistent with the slab design', () => {
  const h = R.buildHeadlines();
  assert.equal(h.zeroTaxCeiling, 1275000);
  assert.ok(h.reliefEnd > h.reliefStart && h.reliefEnd < 1400000);
  assert.ok(h.first10PercentAt > 1500000 && h.first10PercentAt < 2500000);
  assert.ok(h.first20PercentAt > 3000000);
  assert.equal(h.topMarginalKeep, 68800); // 30% + 4% cess on the next lakh
});

test('the committed CSV matches the engine output', () => {
  const committed = fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'india-take-home-fy-2026-27.csv'), 'utf8');
  assert.equal(committed, R.toCSV(), 'run: node scripts/write-india-report-csv.js');
});
