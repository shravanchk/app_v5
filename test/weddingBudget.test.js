const test = require('node:test');
const assert = require('node:assert/strict');
const W = require('../utils/weddingBudget');

const expense = (categoryId, estimate, extra = {}) => ({ id: `${categoryId}-${estimate}`, categoryId, name: 'x', estimate, ...extra });

test('default split sums to 100 and allocates the whole budget', () => {
  const total = W.DEFAULT_CATEGORIES.reduce((s, c) => s + c.pct, 0);
  assert.equal(total, 100);
  const plan = W.computePlan({ budget: 30000, guests: 100 });
  assert.equal(plan.allocated, 30000);
  assert.equal(plan.unallocated, 0);
  assert.equal(plan.perGuest, 300);
  assert.equal(plan.categories[0].allocated, 12600); // 42% venue & catering
});

test('actual overrides estimate when committing, paid is capped at the commitment', () => {
  const plan = W.computePlan({
    budget: 10000,
    expenses: [expense('venue', 5000, { actual: 5500, paid: 9000 }), expense('photo', 1100, { paid: 250 })]
  });
  const venue = plan.categories.find((c) => c.id === 'venue');
  assert.equal(venue.committed, 5500);
  assert.equal(venue.paid, 5500);
  assert.equal(venue.due, 0);
  assert.equal(venue.status, 'over'); // 42% of 10,000 is 4,200
  const photo = plan.categories.find((c) => c.id === 'photo');
  assert.equal(photo.committed, 1100);
  assert.equal(photo.due, 850);
  assert.equal(photo.status, 'tight'); // 1,100 of a 1,200 slice
  assert.equal(plan.committed, 6600);
  assert.equal(plan.remaining, 3400);
  assert.equal(plan.overBudget, false);
});

test('over budget when commitments exceed the total', () => {
  const plan = W.computePlan({ budget: 1000, expenses: [expense('venue', 1200)] });
  assert.equal(plan.overBudget, true);
  assert.equal(plan.remaining, -200);
});

test('upcoming payments are sorted by due date and skip settled items', () => {
  const plan = W.computePlan({
    budget: 1000,
    expenses: [
      expense('venue', 400, { dueDate: '2099-06-01' }),
      expense('photo', 300, { dueDate: '2099-01-15' }),
      expense('cake', 100, { dueDate: '2099-03-01', paid: 100 }),
      expense('music', 50)
    ]
  });
  assert.deepEqual(plan.upcoming.map((e) => e.dueDate), ['2099-01-15', '2099-06-01']);
  assert.equal(plan.upcoming[0].overdue, false);
});

test('normalizePercents rescales to exactly 100', () => {
  const out = W.normalizePercents([{ id: 'a', pct: 30 }, { id: 'b', pct: 30 }, { id: 'c', pct: 30 }]);
  assert.equal(out.reduce((s, c) => s + c.pct, 0), 100);
  assert.equal(out[0].pct, 33.3);
  assert.equal(out[2].pct, 33.4);
});

test('sanitizePlan drops expenses in unknown categories and bounds values', () => {
  const plan = W.sanitizePlan({
    budget: '25000', guests: '80.6', country: 'XX',
    categories: [{ id: 'venue', name: 'Venue', pct: 150 }],
    expenses: [{ categoryId: 'venue', name: 'Hall', estimate: '9000', dueDate: 'soon' }, { categoryId: 'ghost', estimate: 5 }]
  });
  assert.equal(plan.country, 'US');
  assert.equal(plan.guests, '81');
  assert.equal(plan.categories[0].pct, 100);
  assert.equal(plan.expenses.length, 1);
  assert.equal(plan.expenses[0].dueDate, '');
  assert.equal(W.sanitizePlan(null).categories, W.DEFAULT_CATEGORIES);
});

test('CSV escapes commas and quotes', () => {
  const plan = { categories: W.DEFAULT_CATEGORIES, expenses: [expense('venue', 100, { name: 'Hall, "The Barn"' })] };
  const csv = W.toCSV(plan, W.computePlan({ budget: 1000, ...plan }));
  assert.match(csv, /"Hall, ""The Barn"""/);
  assert.match(csv, /^Category,Item,Vendor/);
});

test('formatMoney uses the country currency without cents by default', () => {
  assert.equal(W.formatMoney(1234.5, 'US'), '$1,235');
  assert.equal(W.formatMoney(1234.5, 'UK'), '£1,235');
  assert.equal(W.formatMoney(12.5, 'US', { cents: true }), '$12.50');
});
