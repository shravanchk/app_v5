const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../utils/dateCalculations');

const iso = D.parseISO;
const names = (list) => list.map((h) => `${D.toISO(h.date)} ${h.name}`);

test('parseISO rejects impossible dates instead of rolling them over', () => {
  assert.equal(iso('2026-02-30'), null);
  assert.equal(iso('2026-13-01'), null);
  assert.equal(iso(''), null);
  assert.equal(D.toISO(iso('2028-02-29')), '2028-02-29');
});

test('weekday, day of year and ISO week match the calendar', () => {
  assert.equal(D.WEEKDAYS[D.weekday(iso('2026-10-17'))], 'Saturday');
  assert.equal(D.dayOfYear(iso('2026-12-31')), 365);
  assert.equal(D.dayOfYear(iso('2028-12-31')), 366);
  // 2027-01-01 is a Friday, so it belongs to 2026's last ISO week (53).
  assert.deepEqual(D.isoWeek(iso('2027-01-01')), { year: 2026, week: 53 });
  assert.deepEqual(D.isoWeek(iso('2026-01-01')), { year: 2026, week: 1 });
});

test('adding a month clamps to the end of a shorter month', () => {
  assert.equal(D.toISO(D.addMonths(iso('2026-01-31'), 1)), '2026-02-28');
  assert.equal(D.toISO(D.addMonths(iso('2028-01-31'), 1)), '2028-02-29');
  assert.equal(D.toISO(D.addMonths(iso('2026-03-31'), -1)), '2026-02-28');
  assert.equal(D.toISO(D.addToDate(iso('2026-10-17'), { years: 1, weeks: 2, days: 3 })), '2027-11-03');
  assert.equal(D.toISO(D.addToDate(iso('2026-10-17'), { days: 90 }, -1)), '2026-07-19');
});

test('diffYMD counts whole months first', () => {
  assert.deepEqual(D.diffYMD(iso('2026-01-31'), iso('2026-03-01')), { years: 0, months: 1, days: 1, negative: false });
  assert.deepEqual(D.diffYMD(iso('1990-05-15'), iso('2026-10-17')), { years: 36, months: 5, days: 2, negative: false });
  assert.equal(D.diffYMD(iso('2026-10-17'), iso('2026-01-01')).negative, true);
});

test('countDays: start counted, end optional', () => {
  const mon = iso('2026-10-12');
  const fri = iso('2026-10-16');
  assert.equal(D.countDays(mon, fri).calendar, 4);
  assert.equal(D.countDays(mon, fri, { includeEnd: true }).calendar, 5);
  assert.equal(D.countDays(mon, fri, { includeEnd: true }).weekdays, 5);
  // Across a DST change (US: 2026-11-01) a day is still a day.
  assert.equal(D.countDays(iso('2026-10-31'), iso('2026-11-02')).calendar, 2);
  assert.equal(D.countDays(iso('2026-01-01'), iso('2027-01-01')).calendar, 365);
});

test('Easter Sunday for known years', () => {
  assert.equal(D.toISO(D.easterSunday(2024)), '2024-03-31');
  assert.equal(D.toISO(D.easterSunday(2026)), '2026-04-05');
  assert.equal(D.toISO(D.easterSunday(2027)), '2027-03-28');
});

test('US federal holidays 2026 match OPM, with observed dates', () => {
  const list = names(D.holidaysBetween(iso('2026-01-01'), iso('2026-12-31'), 'us'));
  assert.deepEqual(list, [
    "2026-01-01 New Year's Day",
    '2026-01-19 Martin Luther King Jr. Day',
    "2026-02-16 Washington's Birthday (Presidents' Day)",
    '2026-05-25 Memorial Day',
    '2026-06-19 Juneteenth National Independence Day',
    '2026-07-03 Independence Day (observed)',
    '2026-09-07 Labor Day',
    '2026-10-12 Columbus Day',
    '2026-11-11 Veterans Day',
    '2026-11-26 Thanksgiving Day',
    '2026-12-25 Christmas Day'
  ]);
});

test('US: a Saturday New Year is observed on the previous December 31', () => {
  const list = names(D.holidaysBetween(iso('2027-12-01'), iso('2027-12-31'), 'us'));
  assert.ok(list.includes("2027-12-31 New Year's Day (observed)"));
  assert.ok(list.includes('2027-12-24 Christmas Day (observed)'));
});

test('UK bank holidays 2026 match GOV.UK', () => {
  const list = names(D.holidaysBetween(iso('2026-01-01'), iso('2026-12-31'), 'uk'));
  assert.deepEqual(list, [
    "2026-01-01 New Year's Day",
    '2026-04-03 Good Friday',
    '2026-04-06 Easter Monday',
    '2026-05-04 Early May bank holiday',
    '2026-05-25 Spring bank holiday',
    '2026-08-31 Summer bank holiday',
    '2026-12-25 Christmas Day',
    '2026-12-28 Boxing Day (substitute day)'
  ]);
});

test('UK substitute days: Christmas on a Sunday and on a Saturday', () => {
  // 2022: Christmas Sunday -> Boxing Day Mon 26, Christmas substitute Tue 27.
  assert.deepEqual(names(D.holidaysBetween(iso('2022-12-20'), iso('2022-12-31'), 'uk')), [
    '2022-12-26 Boxing Day',
    '2022-12-27 Christmas Day (substitute day)'
  ]);
  // 2027: Christmas Saturday -> Mon 27 and Tue 28.
  assert.deepEqual(names(D.holidaysBetween(iso('2027-12-20'), iso('2027-12-31'), 'uk')), [
    '2027-12-27 Christmas Day (substitute day)',
    '2027-12-28 Boxing Day (substitute day)'
  ]);
});

test('UK one-off holidays replace the regular ones they displaced', () => {
  const y2022 = names(D.holidaysBetween(iso('2022-05-01'), iso('2022-09-30'), 'uk'));
  assert.ok(y2022.includes('2022-06-03 Platinum Jubilee bank holiday'));
  assert.ok(!y2022.includes('2022-05-30 Spring bank holiday'));
  assert.ok(y2022.includes('2022-09-19 State Funeral of Queen Elizabeth II'));
});

test('business days exclude weekends and weekday holidays', () => {
  // US, Nov 2026: 21 weekdays, Veterans Day and Thanksgiving off.
  const r = D.countDays(iso('2026-11-01'), iso('2026-11-30'), { includeEnd: true, region: 'us' });
  assert.equal(r.weekdays, 21);
  assert.equal(r.businessDays, 19);
  // UK 2026 has 253 working days (261 weekdays less 8 bank holidays).
  const year = D.countDays(iso('2026-01-01'), iso('2026-12-31'), { includeEnd: true, region: 'uk' });
  assert.equal(year.weekdays, 261);
  assert.equal(year.businessDays, 253);
});

test('addBusinessDays skips weekends and holidays, never counting the start', () => {
  // Friday + 1 business day = Monday.
  assert.equal(D.toISO(D.addBusinessDays(iso('2026-10-16'), 1)), '2026-10-19');
  // Wed 2026-11-25 + 2 US business days skips Thanksgiving -> Mon 30th.
  assert.equal(D.toISO(D.addBusinessDays(iso('2026-11-25'), 2, 'us')), '2026-11-30');
  // Backwards: Monday - 1 = Friday.
  assert.equal(D.toISO(D.addBusinessDays(iso('2026-10-19'), -1)), '2026-10-16');
  assert.equal(D.toISO(D.addBusinessDays(iso('2026-10-19'), 0)), '2026-10-19');
});

test('monthly business-day table sums to the yearly count', () => {
  const months = D.businessDaysByMonth(2026, 'uk');
  assert.equal(months.length, 12);
  assert.equal(months.reduce((s, m) => s + m.businessDays, 0), 253);
});
