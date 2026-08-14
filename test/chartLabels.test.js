const test = require('node:test');
const assert = require('node:assert/strict');
const {
  HOLE_WIDTH,
  BASE_FONT_SIZE,
  MIN_FONT_SIZE,
  estimatedWidth,
  compactAmount,
  fitCentreLabel
} = require('../utils/chartLabels');

const inr = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
const usd = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

// The bug this guards: the centre label was drawn at a fixed size, so a large
// rupee total measured wider than the donut hole and spilled over the segments.

test('every magnitude fits inside the hole', () => {
  [1161695, 87813722, 878137249, 8781372496, 87813724960].forEach((v) => {
    const { label, fontSize } = fitCentreLabel(v, inr(v));
    assert.ok(estimatedWidth(label, fontSize) <= HOLE_WIDTH, `${label} overflowed`);
  });

  [2661, 463353, 4633530, 46335300, 463353000].forEach((v) => {
    const { label, fontSize } = fitCentreLabel(v, usd(v));
    assert.ok(estimatedWidth(label, fontSize) <= HOLE_WIDTH, `${label} overflowed`);
  });
});

test('the label never renders below the legibility floor', () => {
  [1e3, 1e6, 1e9, 1e12, 1e15].forEach((v) => {
    assert.ok(fitCentreLabel(v, inr(v)).fontSize >= MIN_FONT_SIZE);
  });
});

test('a short figure keeps the base font and its exact value', () => {
  const { label, fontSize } = fitCentreLabel(1161695, inr(1161695));
  assert.equal(label, inr(1161695));
  assert.equal(fontSize, BASE_FONT_SIZE);
});

test('a long figure shrinks before it abbreviates', () => {
  const { label, fontSize } = fitCentreLabel(87813722, inr(87813722));
  assert.equal(label, inr(87813722));
  assert.ok(fontSize < BASE_FONT_SIZE && fontSize >= MIN_FONT_SIZE);
});

test('rupees abbreviate to lakh and crore', () => {
  assert.equal(compactAmount(878137249, inr(878137249)), '₹87.8 Cr');
  assert.equal(compactAmount(8781372496, inr(8781372496)), '₹878 Cr');
  assert.equal(compactAmount(250000, inr(250000)), '₹2.50 L');
});

test('other currencies abbreviate to K, M and B', () => {
  assert.equal(compactAmount(46335300, usd(46335300)), '$46.3M');
  assert.equal(compactAmount(4633530000, usd(4633530000)), '$4.63B');
});

test('a value too small to abbreviate is returned untouched', () => {
  assert.equal(compactAmount(661, usd(661)), usd(661));
});

test('negative totals keep their sign', () => {
  assert.equal(compactAmount(-878137249, inr(-878137249)), '-₹87.8 Cr');
});
