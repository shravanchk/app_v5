const test = require('node:test');
const assert = require('node:assert/strict');
const {
  sipFutureValue,
  sipForTarget,
  stepUpSipSchedule,
  lumpsumFutureValue
} = require('../utils/sipCalculations');

// The bug this file exists to prevent: the calculator's SIP tab compounded as
// an annuity-due while the goal and comparison tabs used an ordinary annuity,
// so the same inputs disagreed by ~1% between tabs on the same page.

test('sipFutureValue matches the SIP tab month-by-month loop', () => {
  const i = 0.12 / 12;
  let expected = 0;
  for (let m = 0; m < 120; m += 1) expected = (expected + 5000) * (1 + i);

  assert.equal(Math.round(sipFutureValue(5000, 12, 10)), Math.round(expected));
});

test('sipForTarget is the exact inverse of sipFutureValue', () => {
  const monthly = sipForTarget(10000000, 12, 10);
  assert.equal(Math.round(sipFutureValue(monthly, 12, 10)), 10000000);
});

test('a level step-up of zero agrees with the closed-form future value', () => {
  const { futureValue } = stepUpSipSchedule(5000, 12, 10, 0);
  assert.equal(Math.round(futureValue), Math.round(sipFutureValue(5000, 12, 10)));
});

test('annuity-due beats an ordinary annuity by exactly one period of growth', () => {
  const i = 0.12 / 12;
  const ordinary = (5000 * (Math.pow(1 + i, 120) - 1)) / i;
  assert.equal(Math.round(sipFutureValue(5000, 12, 10)), Math.round(ordinary * (1 + i)));
});

test('a step-up raises both the contribution and the corpus', () => {
  const flat = stepUpSipSchedule(5000, 12, 10, 0);
  const stepped = stepUpSipSchedule(5000, 12, 10, 10);

  assert.ok(stepped.futureValue > flat.futureValue);
  assert.ok(stepped.totalInvestment > flat.totalInvestment);
  assert.equal(stepped.schedule.length, 10);
  // Nine step-ups across ten years — the final year does not step again.
  assert.equal(Math.round(stepped.finalMonthlyAmount), Math.round(5000 * Math.pow(1.1, 9)));
});

test('the schedule ends on the same corpus it reports', () => {
  const { futureValue, schedule } = stepUpSipSchedule(5000, 12, 10, 10);
  assert.equal(schedule[schedule.length - 1].futureValue, Math.round(futureValue));
});

test('a zero return returns exactly what was paid in', () => {
  assert.equal(sipFutureValue(5000, 0, 10), 600000);
  assert.equal(sipForTarget(600000, 0, 10), 5000);
});

test('degenerate inputs return zero rather than NaN', () => {
  assert.equal(sipFutureValue(0, 12, 10), 0);
  assert.equal(sipFutureValue(5000, 12, 0), 0);
  assert.equal(sipForTarget(0, 12, 10), 0);
  assert.equal(sipForTarget(1000000, 12, 0), 0);
});

test('lumpsumFutureValue compounds annually', () => {
  assert.equal(Math.round(lumpsumFutureValue(600000, 12, 10)), Math.round(600000 * Math.pow(1.12, 10)));
});
