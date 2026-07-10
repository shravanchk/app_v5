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
const {
  corpusForGrowingWithdrawals,
  savingsFvWithStepUp,
  assessRetirementReadiness,
  retirementReadinessVerdict
} = require('../utils/engines/retirementReadiness');
const { marketIN } = require('../utils/markets/in');
const { marketUS } = require('../utils/markets/us');

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

// --- retirement readiness, pinned to the worked examples documented on
// /retirement-readiness-workflow (India) and /us-retirement-readiness-workflow ---

test('step-up savings FV reduces to ordinary annuity when step-up is 0', () => {
  closeTo(
    savingsFvWithStepUp(10000, 12, 120, 0),
    fvOfMonthlyAtAnnualPct(10000, 12, 120),
    0.01
  );
});

test('growing-withdrawal corpus equals expense × years when return equals inflation', () => {
  closeTo(corpusForGrowingWithdrawals(1000000, 6, 6, 25), 25000000, 0.01);
});

test('India defaults match documented worked example (126.3% ready)', () => {
  const r = assessRetirementReadiness(marketIN.retirementDefaults);
  assert.equal(r.yearsToRetire, 30);
  assert.equal(r.retirementYears, 25);
  closeTo(r.monthlyExpenseAtRetirement, 287175, 2);
  closeTo(r.requiredCorpus, 77148478, 5);
  closeTo(r.projectedCorpus, 97448883, 5);
  closeTo(r.readinessRatio, 1.263, 0.001);
  assert.equal(r.extraMonthlyNeeded, 0);
  closeTo(r.sustainableMonthlyToday, 63157, 2);
});

test('India without step-up falls to 87.5% and needs ₹3,427 more per month', () => {
  const r = assessRetirementReadiness({ ...marketIN.retirementDefaults, stepUpPct: 0 });
  closeTo(r.readinessRatio, 0.875, 0.001);
  closeTo(r.shortfall, 9611935, 5);
  closeTo(r.extraMonthlyNeeded, 3427, 2);
});

test('US defaults match documented worked example (137.5% ready)', () => {
  const r = assessRetirementReadiness(marketUS.retirementDefaults);
  assert.equal(r.yearsToRetire, 35);
  closeTo(r.requiredCorpus, 2165053, 3);
  closeTo(r.projectedCorpus, 2976545, 3);
  closeTo(r.readinessRatio, 1.375, 0.001);
});

test('US starting at 45 drops to 48.6% and needs $1,305 more per month', () => {
  const r = assessRetirementReadiness({ ...marketUS.retirementDefaults, currentAge: 45 });
  closeTo(r.readinessRatio, 0.486, 0.001);
  closeTo(r.extraMonthlyNeeded, 1305, 2);
});

test('readiness verdict boundaries', () => {
  assert.equal(retirementReadinessVerdict({ readinessRatio: 1.0 }).code, 'on-track');
  assert.equal(retirementReadinessVerdict({ readinessRatio: 0.9 }).code, 'close');
  assert.equal(retirementReadinessVerdict({ readinessRatio: 0.6 }).code, 'behind');
  assert.equal(retirementReadinessVerdict({ readinessRatio: 0.3 }).code, 'far-behind');
});
