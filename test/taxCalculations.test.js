const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateIndianIncomeTax,
  calculateUKTax
} = require('../utils/taxCalculations');

const closeTo = (actual, expected, tolerance = 0.01) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
};

test('India new regime gives full section 87A relief at ₹12 lakh taxable income', () => {
  const result = calculateIndianIncomeTax(1200000, 'new');

  assert.equal(result.slabTax, 60000);
  assert.equal(result.rebate, 60000);
  assert.equal(result.cess, 0);
  assert.equal(result.totalTax, 0);
});

test('India new regime applies marginal relief just above ₹12 lakh', () => {
  const result = calculateIndianIncomeTax(1210000, 'new');

  assert.equal(result.slabTax, 61500);
  assert.equal(result.marginalRelief, 51500);
  assert.equal(result.cess, 400);
  assert.equal(result.totalTax, 10400);
});

test('India old regime applies rebate before cess', () => {
  const result = calculateIndianIncomeTax(500000, 'old');

  assert.equal(result.slabTax, 12500);
  assert.equal(result.rebate, 12500);
  assert.equal(result.totalTax, 0);
});

test('UK 2026-27 employee NI uses 8% main rate and 2% upper rate', () => {
  const result = calculateUKTax({ grossIncome: 60000, region: 'england' });

  closeTo(result.incomeTax, 11432);
  closeTo(result.nationalInsurance, 3210.6);
  closeTo(result.netIncome, 45357.4);
});

test('UK 2026-27 Scottish bands include higher-rate income above £43,662', () => {
  const result = calculateUKTax({ grossIncome: 50000, region: 'scotland' });

  closeTo(result.incomeTax, 8982.05);
  closeTo(result.nationalInsurance, 2994.4);
});

test('UK Personal Allowance tapers to zero at £125,140', () => {
  const result = calculateUKTax({ grossIncome: 125140, region: 'england' });

  assert.equal(result.personalAllowance, 0);
});

test('UK Plan 2 uses the 2026-27 annual repayment threshold', () => {
  const result = calculateUKTax({ grossIncome: 30000, region: 'england', studentLoan: 'plan2' });

  closeTo(result.studentLoanRepayment, 55.35);
});
