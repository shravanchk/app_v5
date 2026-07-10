const test = require('node:test');
const assert = require('node:assert/strict');

const {
  effectiveAnnualYield,
  fvOfMonthlyAtAnnualPct,
  emiForLoan,
  simulateLoan
} = require('../utils/engines/growth');
const {
  depositOutcome,
  investmentOutcome,
  depositVsInvestmentVerdict
} = require('../utils/engines/depositVsInvestment');
const { comparePrepayVsInvest, prepayVsInvestVerdict } = require('../utils/engines/prepayVsInvest');
const { marketIN } = require('../utils/markets/in');

const closeTo = (actual, expected, tolerance = 1) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} was not within ${tolerance} of ${expected}`
  );
};

// --- growth primitives ---

test('7% quarterly compounding gives ~7.19% effective annual yield', () => {
  closeTo(effectiveAnnualYield(7, 4) * 100, 7.1859, 0.001);
});

test('EMI for ₹35 lakh at 8.5% over 15 years matches the standard formula', () => {
  closeTo(emiForLoan(3500000, 8.5, 180), 34465.88, 0.01);
});

test('loan simulation without extra payment closes at the scheduled tenure', () => {
  const emi = emiForLoan(3500000, 8.5, 180);
  const result = simulateLoan(3500000, 8.5, emi, 0, 180);
  assert.equal(result.monthsUsed, 180);
  closeTo(result.outstanding, 0, 5);
});

test('extra payment shortens tenure and reduces total interest', () => {
  const emi = emiForLoan(3500000, 8.5, 180);
  const baseline = simulateLoan(3500000, 8.5, emi, 0, 180);
  const prepay = simulateLoan(3500000, 8.5, emi, 25000, 0);
  assert.ok(prepay.monthsUsed < baseline.monthsUsed);
  assert.ok(prepay.totalInterest < baseline.totalInterest);
});

// --- deposit vs investment (FD vs SIP), pinned to the worked example
// documented on /fd-vs-sip-workflow: ₹10,000/month, 10 years, 7% FD,
// 12% SIP, 30% slab ---

const fdInputs = { mode: 'monthly', amount: 10000, years: 10, ratePct: 7, marginalRatePct: 30 };
const sipInputs = { mode: 'monthly', amount: 10000, years: 10, expectedReturnPct: 12 };

test('FD path matches documented worked example (₹15,39,215 post-tax)', () => {
  const fd = depositOutcome(fdInputs, marketIN);
  assert.equal(fd.contributions, 1200000);
  closeTo(fd.preTax, 1727001, 2);
  closeTo(fd.postTax, 1539215, 2);
  closeTo(fd.tax, 187786, 3);
});

test('SIP path matches documented worked example (₹21,73,587 post-tax)', () => {
  const sip = investmentOutcome(sipInputs, marketIN);
  assert.equal(sip.contributions, 1200000);
  closeTo(sip.preTax, 2300387, 2);
  closeTo(sip.tax, 126800, 2);
  closeTo(sip.postTax, 2173587, 2);
  assert.equal(sip.isLongTerm, true);
});

test('3-year SIP gains stay inside the LTCG exemption (zero tax)', () => {
  const sip = investmentOutcome({ mode: 'monthly', amount: 10000, years: 3, expectedReturnPct: 12 }, marketIN);
  closeTo(sip.preTax, 430769, 2);
  assert.equal(sip.tax, 0);
});

test('sub-year horizon is taxed short-term with no exemption', () => {
  const sip = investmentOutcome({ mode: 'lumpsum', amount: 1000000, years: 0.5, expectedReturnPct: 12 }, marketIN);
  assert.equal(sip.isLongTerm, false);
  closeTo(sip.tax, sip.gains * 0.2 * 1.04, 1);
});

test('lumpsum FD mode compounds at the net yield', () => {
  const fd = depositOutcome({ mode: 'lumpsum', amount: 1000000, years: 5, ratePct: 7, marginalRatePct: 30 }, marketIN);
  const netYield = effectiveAnnualYield(7, 4) * (1 - 0.3 * 1.04);
  closeTo(fd.postTax, 1000000 * Math.pow(1 + netYield, 5), 1);
});

// --- verdict codes ---

test('verdict: short horizon with investment ahead → deposit-short-horizon', () => {
  const v = depositVsInvestmentVerdict({ depositPost: 100, investPost: 110, years: 3 });
  assert.equal(v.code, 'deposit-short-horizon');
});

test('verdict: deposit ahead outright → deposit-wins', () => {
  assert.equal(depositVsInvestmentVerdict({ depositPost: 110, investPost: 100, years: 10 }).code, 'deposit-wins');
});

test('verdict: >15% edge at ≥5 years → investment-clear-edge', () => {
  assert.equal(depositVsInvestmentVerdict({ depositPost: 100, investPost: 120, years: 10 }).code, 'investment-clear-edge');
});

test('verdict: close outcomes at long horizon → hybrid', () => {
  assert.equal(depositVsInvestmentVerdict({ depositPost: 100, investPost: 105, years: 10 }).code, 'hybrid');
});

// --- prepay vs invest ---

test('prepay comparison produces consistent corpus delta', () => {
  const result = comparePrepayVsInvest({
    outstandingLoan: 3500000,
    annualLoanRate: 8.5,
    remainingMonths: 180,
    monthlySurplus: 25000,
    adjustedReturn: 10
  });
  assert.ok(result.monthsSaved > 0);
  assert.ok(result.interestSaved > 0);
  closeTo(result.corpusDelta, result.prepayThenInvestCorpus - result.investOnlyCorpus, 0.01);
  closeTo(
    result.investOnlyCorpus,
    fvOfMonthlyAtAnnualPct(25000, 10, 180),
    0.01
  );
});

test('prepay verdict: high loan rate vs low adjusted return → prepay-first', () => {
  assert.equal(
    prepayVsInvestVerdict({ prepayCorpus: 100, investCorpus: 100, loanRate: 10, adjustedReturn: 7 }).code,
    'prepay-first'
  );
});

test('prepay verdict: strong adjusted return → invest-first', () => {
  assert.equal(
    prepayVsInvestVerdict({ prepayCorpus: 100, investCorpus: 115, loanRate: 7, adjustedReturn: 9 }).code,
    'invest-first'
  );
});

test('prepay verdict: close outcomes → hybrid', () => {
  assert.equal(
    prepayVsInvestVerdict({ prepayCorpus: 100, investCorpus: 105, loanRate: 8, adjustedReturn: 8.5 }).code,
    'hybrid'
  );
});
