const test = require('node:test');
const assert = require('node:assert/strict');

const { DEADLINES, daysUntil, statusFor, buildCalendar, istToday } = require('../utils/engines/taxDeadlines');
const { buildIcsCalendar, istToUtc, toCompactUtc, escapeIcsText } = require('../utils/calendarReminders');

// A fixed "today" so these assertions never rot with the wall clock.
const ON = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

// --- the dates themselves ---------------------------------------------------
//
// These are statutory and were checked against the Income Tax Department's own
// ITR FAQs. The revised-return date in particular is a recent change (Budget
// 2026 moved it from 31 Dec to 31 Mar) and a great deal of published material
// still carries the old one — so it is pinned here deliberately.

test('revised return for AY 2026-27 is 31 March 2027, not 31 December 2026', () => {
  const revised = DEADLINES.find((d) => d.id === 'revised-return-ay2026-27');
  assert.equal(revised.date, '2027-03-31');
});

test('belated return for AY 2026-27 is 31 December 2026', () => {
  const belated = DEADLINES.find((d) => d.id === 'belated-return-ay2026-27');
  assert.equal(belated.date, '2026-12-31');
});

test('belated and revised deadlines are never the same date', () => {
  const belated = DEADLINES.find((d) => d.id === 'belated-return-ay2026-27');
  const revised = DEADLINES.find((d) => d.id === 'revised-return-ay2026-27');
  assert.notEqual(belated.date, revised.date);
});

test('advance tax instalments fall on the 15th of Jun, Sep, Dec and Mar', () => {
  const advance = DEADLINES.filter((d) => d.id.startsWith('advance-tax-')).map((d) => d.date).sort();
  assert.deepEqual(advance, ['2026-06-15', '2026-09-15', '2026-12-15', '2027-03-15']);
});

test('every deadline has a year label, an audience, and a parseable date', () => {
  for (const d of DEADLINES) {
    assert.match(d.date, /^\d{4}-\d{2}-\d{2}$/, `${d.id} has a malformed date`);
    assert.ok(d.year, `${d.id} is missing its AY/FY label`);
    assert.ok(d.who, `${d.id} is missing its audience`);
    assert.ok(d.title && d.detail, `${d.id} is missing copy`);
  }
});

test('deadline ids are unique — they become calendar UIDs', () => {
  const ids = DEADLINES.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length);
});

// --- countdown arithmetic ---------------------------------------------------

test('daysUntil counts forward, hits zero on the day, and goes negative after', () => {
  assert.equal(daysUntil('2026-12-31', ON('2026-12-01')), 30);
  assert.equal(daysUntil('2026-12-31', ON('2026-12-31')), 0);
  assert.equal(daysUntil('2026-12-31', ON('2027-01-05')), -5);
});

test('daysUntil crosses a year boundary correctly', () => {
  assert.equal(daysUntil('2027-03-31', ON('2026-12-31')), 90);
});

test('status bands move from upcoming through urgent to passed', () => {
  assert.equal(statusFor('2026-12-31', ON('2026-06-01')).band, 'upcoming');
  assert.equal(statusFor('2026-12-31', ON('2026-11-15')).band, 'soon');
  assert.equal(statusFor('2026-12-31', ON('2026-12-20')).band, 'urgent');
  assert.equal(statusFor('2026-12-31', ON('2026-12-31')).band, 'today');
  assert.equal(statusFor('2026-12-31', ON('2027-01-01')).band, 'passed');
});

test('the singular day is not rendered as "1 days left"', () => {
  assert.equal(statusFor('2026-12-31', ON('2026-12-30')).label, '1 day left');
  assert.equal(statusFor('2026-12-31', ON('2026-12-29')).label, '2 days left');
});

// --- calendar assembly ------------------------------------------------------

test('buildCalendar splits on the given day, not the machine clock', () => {
  const { upcoming, passed } = buildCalendar(ON('2026-08-02'));
  const ids = (rows) => rows.map((r) => r.id);
  // 31 July 2026 has gone; 31 December 2026 has not.
  assert.ok(ids(passed).includes('itr-due-fy2025-26'));
  assert.ok(ids(upcoming).includes('belated-return-ay2026-27'));
  assert.equal(upcoming.length + passed.length, DEADLINES.length);
});

test('buildCalendar returns entries in date order', () => {
  const dates = buildCalendar(ON('2026-08-02')).all.map((d) => d.date);
  assert.deepEqual(dates, [...dates].sort());
});

test('istToday resolves the IST calendar day, not the UTC one', () => {
  // 23:00 UTC on 1 Aug is already 04:30 IST on 2 Aug.
  const lateUtc = new Date(Date.UTC(2026, 7, 1, 23, 0));
  assert.equal(istToday(lateUtc).toISOString().slice(0, 10), '2026-08-02');
});

// --- ICS output -------------------------------------------------------------

test('IST wall clock converts to the correct UTC instant', () => {
  assert.equal(toCompactUtc(istToUtc('2026-12-31T10:00')), '20261231T043000Z');
});

test('buildIcsCalendar emits one VEVENT per deadline inside one VCALENDAR', () => {
  const ics = buildIcsCalendar([
    { title: 'Belated return', startWallIst: '2026-12-31T10:00', uid: 'a@upaman.com' },
    { title: 'Revised return', startWallIst: '2027-03-31T10:00', uid: 'b@upaman.com' }
  ]);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert.equal((ics.match(/BEGIN:VCALENDAR/g) || []).length, 1);
  assert.ok(ics.startsWith('BEGIN:VCALENDAR'));
  assert.ok(ics.trimEnd().endsWith('END:VCALENDAR'));
});

test('ICS uses CRLF line endings as RFC 5545 requires', () => {
  const ics = buildIcsCalendar([{ title: 'X', startWallIst: '2026-12-31T10:00', uid: 'x@upaman.com' }]);
  assert.ok(ics.includes('\r\n'));
  assert.equal(ics.split('\r\n').some((l) => l.endsWith('\r') || l.endsWith('\n')), false);
});

test('an alarm is emitted for the requested lead time', () => {
  const ics = buildIcsCalendar([
    { title: 'X', startWallIst: '2026-12-31T10:00', uid: 'x@upaman.com', alarmMinutesBefore: [7 * 24 * 60] }
  ]);
  assert.ok(ics.includes('TRIGGER:-PT10080M'));
  assert.ok(ics.includes('BEGIN:VALARM'));
});

test('commas and semicolons in copy are escaped, not left to break the file', () => {
  assert.equal(escapeIcsText('Pay 45%, or interest applies; see 234C'), 'Pay 45%\\, or interest applies\\; see 234C');
  const ics = buildIcsCalendar([
    { title: 'A, B; C', startWallIst: '2026-12-31T10:00', uid: 'x@upaman.com' }
  ]);
  assert.ok(ics.includes('SUMMARY:A\\, B\\; C'));
});

test('long lines are folded to 75 octets with a leading space on continuations', () => {
  const ics = buildIcsCalendar([
    {
      title: 'X',
      startWallIst: '2026-12-31T10:00',
      uid: 'x@upaman.com',
      description: 'y'.repeat(300)
    }
  ]);
  for (const line of ics.split('\r\n')) {
    assert.ok(line.length <= 75, `unfolded line of ${line.length} octets`);
  }
});

test('every real deadline survives a round trip into the calendar file', () => {
  const events = DEADLINES.map((d) => ({
    title: `${d.title} (${d.year})`,
    startWallIst: `${d.date}T10:00`,
    description: d.detail,
    uid: `${d.id}@upaman.com`,
    alarmMinutesBefore: [24 * 60]
  }));
  const ics = buildIcsCalendar(events);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, DEADLINES.length);
  for (const d of DEADLINES) {
    assert.ok(ics.includes(`${d.id}@upaman.com`), `${d.id} missing from the ICS`);
  }
});

test('an empty or invalid selection produces no file rather than an empty calendar', () => {
  assert.equal(buildIcsCalendar([]), null);
  assert.equal(buildIcsCalendar([{ title: 'no date' }]), null);
  assert.equal(buildIcsCalendar([{ startWallIst: '2026-12-31T10:00' }]), null);
});
