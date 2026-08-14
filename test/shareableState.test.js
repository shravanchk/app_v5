const test = require('node:test');
const assert = require('node:assert/strict');
const {
  collectSharedValues,
  buildShareQuery,
  restoreValues,
  encodeRows,
  decodeRows,
  toNumber,
  toNumericString,
  toOption,
  toBoolean
} = require('../utils/shareableState');

const DEFAULTS = { price: 450000, rate: 6.75, term: 30 };

test('collectSharedValues picks up only the keys the calculator owns', () => {
  const shared = collectSharedValues('?price=600000&rate=5.5&utm_source=newsletter', DEFAULTS);
  assert.deepEqual(shared, { price: '600000', rate: '5.5' });
});

test('collectSharedValues ignores empty params', () => {
  assert.deepEqual(collectSharedValues('?price=&rate=5.5', DEFAULTS), { rate: '5.5' });
});

test('collectSharedValues returns nothing for a clean URL', () => {
  assert.deepEqual(collectSharedValues('', DEFAULTS), {});
});

test('buildShareQuery omits values still at their default', () => {
  const query = buildShareQuery({ price: 450000, rate: 5.5, term: 30 }, DEFAULTS, '');
  assert.equal(query, 'rate=5.5');
});

test('buildShareQuery produces an empty string for a pristine calculator', () => {
  assert.equal(buildShareQuery({ price: 450000, rate: 6.75, term: 30 }, DEFAULTS, ''), '');
});

test('buildShareQuery preserves campaign params it does not own', () => {
  const query = buildShareQuery({ price: 600000 }, DEFAULTS, '?utm_source=newsletter&gclid=abc');
  const params = new URLSearchParams(query);
  assert.equal(params.get('utm_source'), 'newsletter');
  assert.equal(params.get('gclid'), 'abc');
  assert.equal(params.get('price'), '600000');
});

test('buildShareQuery drops a param once the input returns to its default', () => {
  const query = buildShareQuery({ price: 450000 }, DEFAULTS, '?price=600000&utm_source=x');
  assert.equal(query, 'utm_source=x');
});

test('buildShareQuery ignores keys outside the declared defaults', () => {
  const query = buildShareQuery({ price: 600000, secret: 'nope' }, DEFAULTS, '');
  assert.equal(query, 'price=600000');
});

test('buildShareQuery skips empty and nullish values', () => {
  assert.equal(buildShareQuery({ price: '', rate: null, term: undefined }, DEFAULTS, ''), '');
});

test('a round trip restores every changed value', () => {
  const entered = { price: 600000, rate: 5.5, term: 15 };
  const query = buildShareQuery(entered, DEFAULTS, '');
  const shared = collectSharedValues(`?${query}`, DEFAULTS);

  assert.equal(toNumber(shared.price, DEFAULTS.price), 600000);
  assert.equal(toNumber(shared.rate, DEFAULTS.rate), 5.5);
  assert.equal(toNumber(shared.term, DEFAULTS.term), 15);
});

test('toNumber falls back on junk input', () => {
  assert.equal(toNumber('abc', 30), 30);
  assert.equal(toNumber('', 30), 30);
  assert.equal(toNumber(undefined, 30), 30);
  assert.equal(toNumber('Infinity', 30), 30);
  assert.equal(toNumber('0', 30), 0);
  assert.equal(toNumber('-12.5', 30), -12.5);
});

const ROW_FIELDS = ['name', 'balance', 'apr'];

test('encodeRows and decodeRows round-trip a list', () => {
  const rows = [
    { name: 'Credit card', balance: 9000, apr: 24 },
    { name: 'Car loan', balance: 14000, apr: 7 }
  ];
  const decoded = decodeRows(encodeRows(rows, ROW_FIELDS), ROW_FIELDS);
  assert.deepEqual(decoded, [
    { name: 'Credit card', balance: '9000', apr: '24' },
    { name: 'Car loan', balance: '14000', apr: '7' }
  ]);
});

test('a name containing the cell and row separators survives the round trip', () => {
  const rows = [{ name: 'Card ~ A | B', balance: 100, apr: 5 }];
  const decoded = decodeRows(encodeRows(rows, ROW_FIELDS), ROW_FIELDS);
  assert.equal(decoded[0].name, 'Card ~ A | B');
  assert.equal(decoded.length, 1);
});

test('decodeRows drops rows with the wrong column count', () => {
  assert.deepEqual(decodeRows('a~1~2|broken|b~3~4', ROW_FIELDS).map((r) => r.name), ['a', 'b']);
});

test('decodeRows caps how many rows a URL can request', () => {
  const many = Array.from({ length: 50 }, (_, i) => ({ name: `d${i}`, balance: 1, apr: 1 }));
  assert.equal(decodeRows(encodeRows(many, ROW_FIELDS), ROW_FIELDS, 12).length, 12);
});

test('decodeRows returns nothing for empty input', () => {
  assert.deepEqual(decodeRows('', ROW_FIELDS), []);
  assert.deepEqual(decodeRows(undefined, ROW_FIELDS), []);
});

test('decodeRows survives a malformed percent escape', () => {
  const decoded = decodeRows('%E0%A4~1~2', ROW_FIELDS);
  assert.equal(decoded.length, 1);
  assert.equal(decoded[0].balance, '1');
});

test('toNumericString keeps the string form and rejects non-numeric input', () => {
  assert.equal(toNumericString('75000', '50000'), '75000');
  assert.equal(toNumericString('12.5', '0'), '12.5');
  assert.equal(toNumericString('abc', '50000'), '50000');
  assert.equal(toNumericString('', '50000'), '50000');
  assert.equal(toNumericString(undefined, '50000'), '50000');
  assert.equal(toNumericString('0', '50000'), '0');
});

test('toOption rejects values outside the allowed set', () => {
  assert.equal(toOption('yearly', ['monthly', 'yearly'], 'monthly'), 'yearly');
  assert.equal(toOption('hourly', ['monthly', 'yearly'], 'monthly'), 'monthly');
  assert.equal(toOption(undefined, ['monthly', 'yearly'], 'monthly'), 'monthly');
});

const MIXED_DEFAULTS = { saleValue: 800000, metro: true, asset: 'equity' };
const MIXED_OPTIONS = { asset: ['equity', 'debt', 'property'] };

test('restoreValues coerces each field by the type of its default', () => {
  const restored = restoreValues(
    MIXED_DEFAULTS,
    { saleValue: '950000', metro: 'false', asset: 'debt' },
    MIXED_DEFAULTS,
    MIXED_OPTIONS
  );
  assert.deepEqual(restored, { saleValue: 950000, metro: false, asset: 'debt' });
});

test('restoreValues keeps untouched fields at their previous value', () => {
  const restored = restoreValues(MIXED_DEFAULTS, { saleValue: '1' }, MIXED_DEFAULTS, MIXED_OPTIONS);
  assert.equal(restored.metro, true);
  assert.equal(restored.asset, 'equity');
});

test('restoreValues rejects an enum value outside the allowed set', () => {
  const restored = restoreValues(MIXED_DEFAULTS, { asset: 'crypto' }, MIXED_DEFAULTS, MIXED_OPTIONS);
  assert.equal(restored.asset, 'equity');
});

test('restoreValues ignores keys the calculator does not own', () => {
  const restored = restoreValues(MIXED_DEFAULTS, { injected: 'x' }, MIXED_DEFAULTS, MIXED_OPTIONS);
  assert.deepEqual(restored, MIXED_DEFAULTS);
});

test('a boolean survives the full write-then-restore round trip', () => {
  const query = buildShareQuery({ ...MIXED_DEFAULTS, metro: false }, MIXED_DEFAULTS, '');
  const shared = collectSharedValues(`?${query}`, MIXED_DEFAULTS);
  const restored = restoreValues(MIXED_DEFAULTS, shared, MIXED_DEFAULTS, MIXED_OPTIONS);
  assert.equal(restored.metro, false);
});

test('toBoolean reads both the 1/0 and true/false forms', () => {
  assert.equal(toBoolean('1', false), true);
  assert.equal(toBoolean('true', false), true);
  assert.equal(toBoolean('0', true), false);
  assert.equal(toBoolean('false', true), false);
  assert.equal(toBoolean('maybe', true), true);
});
