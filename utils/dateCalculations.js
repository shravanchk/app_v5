// Date arithmetic for the days-between, date and business-days calculators.
//
// Everything works on "day numbers" — whole days since 1970-01-01 in UTC — so a
// daylight-saving change can never make a 24-hour gap count as 0 or 2 days.
// Dates cross the boundary as ISO strings (YYYY-MM-DD), the format a native
// <input type="date"> reads and writes.

const MS_PER_DAY = 86400000;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const fromYMD = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / MS_PER_DAY);

const toYMD = (dayNum) => {
  const dt = new Date(dayNum * MS_PER_DAY);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
};

const parseISO = (s) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const n = fromYMD(y, m, d);
  const back = toYMD(n);
  // Reject impossible dates such as 2026-02-30 rather than rolling them over.
  return back.y === y && back.m === m && back.d === d ? n : null;
};

const pad = (n) => String(n).padStart(2, '0');
const toISO = (dayNum) => {
  const { y, m, d } = toYMD(dayNum);
  return `${y}-${pad(m)}-${pad(d)}`;
};

// 0 = Sunday … 6 = Saturday. Day 0 (1970-01-01) was a Thursday.
const weekday = (dayNum) => (((dayNum + 4) % 7) + 7) % 7;
const isWeekend = (dayNum) => weekday(dayNum) === 0 || weekday(dayNum) === 6;

const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysInMonth = (y, m) => [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

const dayOfYear = (dayNum) => dayNum - fromYMD(toYMD(dayNum).y, 1, 1) + 1;

// ISO-8601 week: weeks start Monday, week 1 contains the year's first Thursday.
const isoWeek = (dayNum) => {
  const thursday = dayNum - ((weekday(dayNum) + 6) % 7) + 3;
  const year = toYMD(thursday).y;
  return { year, week: Math.floor((thursday - fromYMD(year, 1, 1)) / 7) + 1 };
};

// Monday of ISO week 1: the week containing January 4.
const isoWeekOneMonday = (year) => {
  const jan4 = fromYMD(year, 1, 4);
  return jan4 - ((weekday(jan4) + 6) % 7);
};

// 53 when the year starts on a Thursday, or is a leap year starting on a Wednesday.
const isoWeeksInYear = (year) => (isoWeekOneMonday(year + 1) - isoWeekOneMonday(year)) / 7;

// Every ISO week of a year, Monday to Sunday.
const isoWeeksOfYear = (year) => {
  const first = isoWeekOneMonday(year);
  return Array.from({ length: isoWeeksInYear(year) }, (_, i) => ({
    week: i + 1,
    start: first + i * 7,
    end: first + i * 7 + 6
  }));
};

// US convention (Excel WEEKNUM's default): weeks start Sunday and week 1 is
// whichever week contains January 1, however short.
const usWeek = (dayNum) => {
  const { y } = toYMD(dayNum);
  return Math.floor((dayOfYear(dayNum) - 1 + weekday(fromYMD(y, 1, 1))) / 7) + 1;
};

const formatLong = (dayNum) => {
  const { y, m, d } = toYMD(dayNum);
  return `${WEEKDAYS[weekday(dayNum)]}, ${MONTHS[m - 1]} ${d}, ${y}`;
};

// Calendar months are added by month number, then the day is clamped to the
// month's length: Jan 31 + 1 month is Feb 28 (or 29), not Mar 3. This is the
// convention contracts, banks and most date libraries use.
const addMonths = (dayNum, months) => {
  const { y, m, d } = toYMD(dayNum);
  const total = (y * 12 + (m - 1)) + months;
  const ty = Math.floor(total / 12);
  const tm = (total % 12 + 12) % 12 + 1;
  return fromYMD(ty, tm, Math.min(d, daysInMonth(ty, tm)));
};

const addToDate = (dayNum, { years = 0, months = 0, weeks = 0, days = 0 } = {}, sign = 1) => {
  const s = sign < 0 ? -1 : 1;
  const afterMonths = addMonths(dayNum, s * (years * 12 + months));
  return afterMonths + s * (weeks * 7 + days);
};

// Years, months and days from a to b, counting whole months first. Returned
// values are always non-negative; `negative` says whether b is before a.
const diffYMD = (a, b) => {
  const negative = b < a;
  const [from, to] = negative ? [b, a] : [a, b];
  const f = toYMD(from);
  const t = toYMD(to);
  let months = (t.y - f.y) * 12 + (t.m - f.m);
  if (addMonths(from, months) > to) months -= 1;
  const days = to - addMonths(from, months);
  return { years: Math.floor(months / 12), months: months % 12, days, negative };
};

// ---------------------------------------------------------------------------
// Public holidays
// ---------------------------------------------------------------------------

// nth weekday of a month (n = -1 for the last one).
const nthWeekday = (y, m, wd, n) => {
  if (n > 0) {
    const first = fromYMD(y, m, 1);
    return first + ((wd - weekday(first) + 7) % 7) + (n - 1) * 7;
  }
  const last = fromYMD(y, m, daysInMonth(y, m));
  return last - ((weekday(last) - wd + 7) % 7);
};

// Anonymous Gregorian algorithm (Meeus/Jones/Butcher).
const easterSunday = (y) => {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return fromYMD(y, month, day);
};

// US federal holidays (5 U.S.C. 6103). A holiday on Saturday is observed the
// Friday before, on Sunday the Monday after — so New Year's Day 2028 (a
// Saturday) is observed on Friday 31 December 2027.
const usFederalHolidays = (y) => {
  const fixed = (m, d, name) => {
    const actual = fromYMD(y, m, d);
    const wd = weekday(actual);
    const date = wd === 6 ? actual - 1 : wd === 0 ? actual + 1 : actual;
    return { date, name: date === actual ? name : `${name} (observed)` };
  };
  const list = [
    fixed(1, 1, "New Year's Day"),
    { date: nthWeekday(y, 1, 1, 3), name: 'Martin Luther King Jr. Day' },
    { date: nthWeekday(y, 2, 1, 3), name: "Washington's Birthday (Presidents' Day)" },
    { date: nthWeekday(y, 5, 1, -1), name: 'Memorial Day' },
    fixed(7, 4, 'Independence Day'),
    { date: nthWeekday(y, 9, 1, 1), name: 'Labor Day' },
    { date: nthWeekday(y, 10, 1, 2), name: 'Columbus Day' },
    fixed(11, 11, 'Veterans Day'),
    { date: nthWeekday(y, 11, 4, 4), name: 'Thanksgiving Day' },
    fixed(12, 25, 'Christmas Day')
  ];
  if (y >= 2021) list.push(fixed(6, 19, 'Juneteenth National Independence Day'));
  return list;
};

// One-off bank holidays proclaimed for England & Wales, and the regular
// holidays they displaced. Future proclamations need adding here by hand.
const UK_ONE_OFFS = {
  2020: { add: [[5, 8, 'VE Day 75th anniversary']], remove: ['Early May bank holiday'] },
  2022: {
    add: [[6, 2, 'Spring bank holiday'], [6, 3, 'Platinum Jubilee bank holiday'], [9, 19, 'State Funeral of Queen Elizabeth II']],
    remove: ['Spring bank holiday']
  },
  2023: { add: [[5, 8, 'Coronation of King Charles III']], remove: [] }
};

// England & Wales bank holidays. Fixed-date holidays falling on a weekend get a
// substitute: the next weekday not already a holiday. Placing the weekday ones
// first is what makes Christmas on a Sunday land on Tuesday 27th, with Boxing
// Day keeping Monday 26th.
const ukBankHolidays = (y) => {
  const easter = easterSunday(y);
  const moveable = [
    { date: easter - 2, name: 'Good Friday' },
    { date: easter + 1, name: 'Easter Monday' },
    { date: nthWeekday(y, 5, 1, 1), name: 'Early May bank holiday' },
    { date: nthWeekday(y, 5, 1, -1), name: 'Spring bank holiday' },
    { date: nthWeekday(y, 8, 1, -1), name: 'Summer bank holiday' }
  ];
  const fixed = [
    { date: fromYMD(y, 1, 1), name: "New Year's Day" },
    { date: fromYMD(y, 12, 25), name: 'Christmas Day' },
    { date: fromYMD(y, 12, 26), name: 'Boxing Day' }
  ];

  const oneOff = UK_ONE_OFFS[y] || { add: [], remove: [] };
  const list = moveable.filter((h) => !oneOff.remove.includes(h.name));
  oneOff.add.forEach(([m, d, name]) => list.push({ date: fromYMD(y, m, d), name }));

  const taken = new Set(list.map((h) => h.date));
  fixed.filter((h) => !isWeekend(h.date)).forEach((h) => { list.push(h); taken.add(h.date); });
  fixed.filter((h) => isWeekend(h.date)).forEach((h) => {
    let sub = h.date + 1;
    while (isWeekend(sub) || taken.has(sub)) sub += 1;
    taken.add(sub);
    list.push({ date: sub, name: `${h.name} (substitute day)` });
  });
  return list;
};

const REGIONS = {
  none: { label: 'Weekends only', holidays: () => [] },
  us: { label: 'United States (federal)', holidays: usFederalHolidays },
  uk: { label: 'UK (England & Wales)', holidays: ukBankHolidays }
};

// Holidays observed between two day numbers (inclusive), sorted. Neighbouring
// years are generated too, because an observed date can cross a year boundary.
const holidaysBetween = (a, b, region) => {
  const def = REGIONS[region] || REGIONS.none;
  const [from, to] = a <= b ? [a, b] : [b, a];
  const out = [];
  for (let y = toYMD(from).y - 1; y <= toYMD(to).y + 1; y += 1) {
    def.holidays(y).forEach((h) => { if (h.date >= from && h.date <= to) out.push(h); });
  }
  return out.sort((x, y) => x.date - y.date);
};

// ---------------------------------------------------------------------------
// Counting
// ---------------------------------------------------------------------------

// Counts days from a to b. By default the start day is counted and the end day
// is not (Monday to Friday = 4 days), which is how "days until" and elapsed
// time work; includeEnd counts both (Monday to Friday = 5).
const countDays = (a, b, { includeEnd = false, region = 'none' } = {}) => {
  const negative = b < a;
  const [from, to] = negative ? [b, a] : [a, b];
  const last = includeEnd ? to : to - 1;

  const calendar = Math.max(0, last - from + 1);
  let weekdays = 0;
  for (let n = from; n <= last; n += 1) if (!isWeekend(n)) weekdays += 1;

  const holidays = last >= from
    ? holidaysBetween(from, last, region).filter((h) => !isWeekend(h.date))
    : [];
  // Two holidays can share a date (e.g. a one-off moved onto a regular one).
  const holidayDays = new Set(holidays.map((h) => h.date)).size;

  return {
    calendar,
    weekdays,
    weekendDays: calendar - weekdays,
    holidays,
    businessDays: weekdays - holidayDays,
    negative
  };
};

// The date n business days after (or, for negative n, before) start. The start
// day itself is never counted, matching "due 10 business days from today".
const addBusinessDays = (start, n, region = 'none') => {
  const step = n < 0 ? -1 : 1;
  let remaining = Math.abs(Math.trunc(n));
  let cursor = start;
  let holidaySet = null;
  let span = null;
  while (remaining > 0) {
    cursor += step;
    if (!span || cursor < span[0] || cursor > span[1]) {
      // Holiday lookups are generated a year at a time as the cursor advances.
      span = [cursor - 400, cursor + 400];
      holidaySet = new Set(holidaysBetween(span[0], span[1], region).map((h) => h.date));
    }
    if (!isWeekend(cursor) && !holidaySet.has(cursor)) remaining -= 1;
  }
  return cursor;
};

// Business days in each calendar month of a year, for the reference tables.
const businessDaysByMonth = (year, region) =>
  MONTHS.map((name, i) => {
    const first = fromYMD(year, i + 1, 1);
    const last = fromYMD(year, i + 1, daysInMonth(year, i + 1));
    const r = countDays(first, last, { includeEnd: true, region });
    return { month: name, weekdays: r.weekdays, holidays: r.weekdays - r.businessDays, businessDays: r.businessDays };
  });

module.exports = {
  WEEKDAYS,
  MONTHS,
  REGIONS,
  fromYMD,
  toYMD,
  parseISO,
  toISO,
  weekday,
  isWeekend,
  isLeapYear,
  daysInMonth,
  dayOfYear,
  isoWeek,
  isoWeekOneMonday,
  isoWeeksInYear,
  isoWeeksOfYear,
  usWeek,
  formatLong,
  addMonths,
  addToDate,
  diffYMD,
  easterSunday,
  usFederalHolidays,
  ukBankHolidays,
  holidaysBetween,
  countDays,
  addBusinessDays,
  businessDaysByMonth
};
