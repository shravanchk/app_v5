const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// The dictionaries are ES modules of plain object literals with no imports, so
// the test evaluates the literal directly rather than pulling in a transpiler.
const STRINGS_DIR = path.join(__dirname, '..', 'utils', 'i18n', 'strings');
const LOCALES = ['en', 'hi', 'bn', 'mr', 'ta', 'te'];

const load = (locale) => {
  const src = fs.readFileSync(path.join(STRINGS_DIR, `${locale}.js`), 'utf8');
  const body = src.replace(/^\s*export default \w+;\s*$/m, '');
  // eslint-disable-next-line no-new-func
  return new Function(`${body}\nreturn ${locale};`)();
};

// Flattens to "a.b.c" paths; arrays record their length so a locale cannot
// quietly ship two tag chips where English ships three.
const paths = (node, prefix = '', out = new Map()) => {
  for (const [key, value] of Object.entries(node)) {
    const p = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) out.set(p, `array(${value.length})`);
    else if (value && typeof value === 'object') paths(value, p, out);
    else out.set(p, typeof value);
  }
  return out;
};

const tables = Object.fromEntries(LOCALES.map((l) => [l, load(l)]));
const enPaths = paths(tables.en);

test('every locale is loadable and non-empty', () => {
  for (const locale of LOCALES) {
    assert.ok(Object.keys(tables[locale]).length > 0, `${locale} is empty`);
  }
});

for (const locale of LOCALES.filter((l) => l !== 'en')) {
  test(`${locale} matches the English key shape`, () => {
    const localePaths = paths(tables[locale]);

    const missing = [...enPaths.keys()].filter((k) => !localePaths.has(k));
    assert.deepEqual(missing, [], `${locale} is missing keys`);

    // Orphans are the dangerous direction: a renamed English key leaves stale
    // translations behind that no longer render anywhere.
    const orphaned = [...localePaths.keys()].filter((k) => !enPaths.has(k));
    assert.deepEqual(orphaned, [], `${locale} has keys English does not`);

    const mismatched = [...enPaths.entries()]
      .filter(([k, kind]) => localePaths.get(k) !== kind)
      .map(([k]) => k);
    assert.deepEqual(mismatched, [], `${locale} has type/length mismatches`);
  });

  test(`${locale} has no blank values`, () => {
    const blank = [...paths(tables[locale]).keys()].filter((k) => {
      const value = k.split('.').reduce((n, part) => n[part], tables[locale]);
      return Array.isArray(value) ? value.some((v) => !String(v).trim()) : !String(value).trim();
    });
    assert.deepEqual(blank, [], `${locale} has empty strings`);
  });
}

test('locale registry matches the shipped dictionaries', () => {
  const src = fs.readFileSync(path.join(STRINGS_DIR, '..', 'locales.js'), 'utf8');
  const codes = [...src.matchAll(/\{ code: '(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(codes.sort(), [...LOCALES].sort());
});
