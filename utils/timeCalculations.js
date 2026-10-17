// Time card engine: hours worked per day from clock-in/clock-out times, then
// regular / overtime / double-time under US federal or California rules.
// Everything is in whole minutes until the very end, so 7.5 hours never
// becomes 7.4999 through repeated decimal arithmetic.

const parseHM = (s) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h <= 23 && m <= 59 ? h * 60 + m : null;
};

// Round a clock time to the nearest `step` minutes (0 = no rounding). The US
// Department of Labor accepts rounding to the nearest 5, 6 (tenth of an hour)
// or 15 minutes provided it is neutral, which nearest-rounding is: 7 minutes
// past rounds down, 8 minutes past rounds up, for a 15-minute step.
const roundClock = (minutes, step) => (step ? Math.round(minutes / step) * step : minutes);

// Paid minutes for one shift. An end time at or before the start is treated as
// the next day (an overnight shift); identical times mean no shift.
const shiftMinutes = ({ start, end, breakMin }, step = 0) => {
  const a = parseHM(start);
  const b = parseHM(end);
  if (a === null || b === null || a === b) return 0;
  const from = roundClock(a, step);
  let to = roundClock(b, step);
  if (to <= from) to += 1440;
  const unpaid = Math.max(0, Math.trunc(Number(breakMin) || 0));
  return Math.max(0, to - from - unpaid);
};

const RULES = {
  none: 'No overtime',
  federal: 'US federal (over 40 hours a week)',
  california: 'California (daily, weekly and 7th-day)'
};

// Splits each day's minutes into regular, overtime (1.5x) and double time (2x).
//
// federal: FLSA — every hour past 40 in the workweek is overtime; days don't matter.
// california: Labor Code 510 — past 8 in a day is overtime and past 12 is double
// time; on the 7th consecutive workday of the workweek the first 8 hours are
// overtime and the rest double time; and regular hours past 40 for the week
// become overtime. Hours already paid as daily overtime don't count toward the
// 40, so nothing is paid twice.
const splitWeek = (dayMinutes, rule) => {
  const days = dayMinutes.map((minutes) => ({ minutes, reg: minutes, ot: 0, dt: 0 }));
  if (rule === 'none') return days;

  if (rule === 'california') {
    const seventhDay = days.length === 7 && days.every((d) => d.minutes > 0);
    days.forEach((d, i) => {
      if (seventhDay && i === 6) {
        d.reg = 0;
        d.ot = Math.min(d.minutes, 480);
        d.dt = Math.max(0, d.minutes - 480);
      } else {
        d.reg = Math.min(d.minutes, 480);
        d.ot = Math.min(Math.max(0, d.minutes - 480), 240);
        d.dt = Math.max(0, d.minutes - 720);
      }
    });
  }

  // Weekly 40-hour rule (both federal and California): walk the week in order
  // and convert regular minutes past 2,400 into overtime.
  let regularSoFar = 0;
  days.forEach((d) => {
    const room = Math.max(0, 2400 - regularSoFar);
    const keep = Math.min(d.reg, room);
    d.ot += d.reg - keep;
    d.reg = keep;
    regularSoFar += keep;
  });
  return days;
};

const computeTimeCard = (rows, { rule = 'federal', rounding = 0, rate = 0, otMultiplier = 1.5, dtMultiplier = 2 } = {}) => {
  const minutes = rows.map((row) => shiftMinutes(row, rounding));
  const days = splitWeek(minutes, RULES[rule] ? rule : 'federal');
  const sum = (key) => days.reduce((s, d) => s + d[key], 0);
  const totals = { minutes: sum('minutes'), reg: sum('reg'), ot: sum('ot'), dt: sum('dt') };
  const hourly = Math.max(0, Number(rate) || 0);
  const pay = {
    reg: (totals.reg / 60) * hourly,
    ot: (totals.ot / 60) * hourly * otMultiplier,
    dt: (totals.dt / 60) * hourly * dtMultiplier
  };
  pay.total = pay.reg + pay.ot + pay.dt;
  return { days, totals, pay };
};

// 450 -> "7:30"; 450 -> 7.5 via toDecimalHours.
const toHM = (minutes) => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
const toDecimalHours = (minutes) => Math.round((minutes / 60) * 100) / 100;

module.exports = { RULES, parseHM, roundClock, shiftMinutes, splitWeek, computeTimeCard, toHM, toDecimalHours };
