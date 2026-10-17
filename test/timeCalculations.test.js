const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('../utils/timeCalculations');

const day = (start, end, breakMin = 0) => ({ start, end, breakMin });
const off = () => day('', '', 0);
const h = (hours) => hours * 60;

test('shift minutes subtract the unpaid break', () => {
  assert.equal(T.shiftMinutes(day('09:00', '17:30', 30)), h(8));
  assert.equal(T.shiftMinutes(day('', '17:00')), 0);
  assert.equal(T.shiftMinutes(day('09:00', '09:00')), 0);
});

test('an end time before the start is an overnight shift', () => {
  assert.equal(T.shiftMinutes(day('22:00', '06:00', 30)), h(7.5));
});

test('clock rounding is to the nearest step', () => {
  // 08:07 rounds down to 08:00, 17:08 rounds up to 17:15.
  assert.equal(T.shiftMinutes(day('08:07', '17:08'), 15), h(9.25));
  assert.equal(T.shiftMinutes(day('08:07', '17:08'), 0), 541);
  assert.equal(T.roundClock(T.parseHM('08:04'), 6), T.parseHM('08:06'));
});

test('federal: overtime only past 40 hours a week', () => {
  // Four 12-hour days = 48 hours: no daily overtime federally, 8 weekly.
  const rows = [day('06:00', '18:00'), day('06:00', '18:00'), day('06:00', '18:00'), day('06:00', '18:00'), off(), off(), off()];
  const r = T.computeTimeCard(rows, { rule: 'federal', rate: 20 });
  assert.equal(r.totals.reg, h(40));
  assert.equal(r.totals.ot, h(8));
  assert.equal(r.totals.dt, 0);
  assert.equal(r.pay.total, 40 * 20 + 8 * 30);
});

test('california: daily overtime past 8 and double time past 12', () => {
  const rows = [day('06:00', '20:00'), off(), off(), off(), off(), off(), off()]; // 14 hours
  const r = T.computeTimeCard(rows, { rule: 'california' });
  assert.deepEqual([r.totals.reg, r.totals.ot, r.totals.dt], [h(8), h(4), h(2)]);
});

test('california: daily overtime does not count toward the weekly 40', () => {
  // Five 10-hour days: 8 regular + 2 OT each -> 40 reg, 10 OT. No extra weekly OT.
  const rows = Array.from({ length: 5 }, () => day('08:00', '18:00')).concat([off(), off()]);
  const r = T.computeTimeCard(rows, { rule: 'california' });
  assert.deepEqual([r.totals.reg, r.totals.ot, r.totals.dt], [h(40), h(10), 0]);
  // Federal on the same week: 50 hours -> 40 + 10, identical here.
  const f = T.computeTimeCard(rows, { rule: 'federal' });
  assert.deepEqual([f.totals.reg, f.totals.ot], [h(40), h(10)]);
});

test('california: six 8-hour days put the sixth day into weekly overtime', () => {
  const rows = Array.from({ length: 6 }, () => day('09:00', '17:00')).concat([off()]);
  const r = T.computeTimeCard(rows, { rule: 'california' });
  assert.deepEqual([r.totals.reg, r.totals.ot, r.totals.dt], [h(40), h(8), 0]);
});

test('california: seventh consecutive day — first 8 at 1.5x, rest at 2x', () => {
  const rows = Array.from({ length: 6 }, () => day('09:00', '13:00')) // 6 x 4h = 24h regular
    .concat([day('08:00', '18:00')]); // 10h on day 7
  const r = T.computeTimeCard(rows, { rule: 'california' });
  assert.deepEqual([r.totals.reg, r.totals.ot, r.totals.dt], [h(24), h(8), h(2)]);
});

test('no-overtime rule pays everything as regular', () => {
  const rows = [day('06:00', '20:00'), off(), off(), off(), off(), off(), off()];
  const r = T.computeTimeCard(rows, { rule: 'none', rate: 10 });
  assert.deepEqual([r.totals.reg, r.totals.ot, r.totals.dt], [h(14), 0, 0]);
  assert.equal(r.pay.total, 140);
});

test('formatting helpers', () => {
  assert.equal(T.toHM(450), '7:30');
  assert.equal(T.toHM(5), '0:05');
  assert.equal(T.toDecimalHours(450), 7.5);
  assert.equal(T.toDecimalHours(20), 0.33);
});
