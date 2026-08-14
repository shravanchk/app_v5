const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// The dictionaries are ES modules of plain object literals with no imports, so
// the test evaluates the literal directly rather than pulling in a transpiler.
const STRINGS_DIR = path.join(__dirname, '..', 'utils', 'i18n', 'strings');

// Must match utils/i18n/regions.js. Asserted against it at the bottom.
const REGION_LOCALES = {
  in: ['en', 'hi', 'bn', 'mr', 'ta', 'te'],
  eu: ['en', 'de', 'fr', 'es'],
};

const load = (region, locale) => {
  const src = fs.readFileSync(path.join(STRINGS_DIR, region, `${locale}.js`), 'utf8');
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

for (const [region, locales] of Object.entries(REGION_LOCALES)) {
  const tables = Object.fromEntries(locales.map((l) => [l, load(region, l)]));
  const enPaths = paths(tables.en);

  test(`${region}: every locale is loadable and non-empty`, () => {
    for (const locale of locales) {
      assert.ok(Object.keys(tables[locale]).length > 0, `${region}/${locale} is empty`);
    }
  });

  for (const locale of locales.filter((l) => l !== 'en')) {
    test(`${region}/${locale} matches the English key shape`, () => {
      const localePaths = paths(tables[locale]);

      const missing = [...enPaths.keys()].filter((k) => !localePaths.has(k));
      assert.deepEqual(missing, [], `${region}/${locale} is missing keys`);

      // Orphans are the dangerous direction: a renamed English key leaves stale
      // translations behind that no longer render anywhere.
      const orphaned = [...localePaths.keys()].filter((k) => !enPaths.has(k));
      assert.deepEqual(orphaned, [], `${region}/${locale} has keys English does not`);

      const mismatched = [...enPaths.entries()]
        .filter(([k, kind]) => localePaths.get(k) !== kind)
        .map(([k]) => k);
      assert.deepEqual(mismatched, [], `${region}/${locale} has type/length mismatches`);
    });

    test(`${region}/${locale} has no blank values`, () => {
      const blank = [...paths(tables[locale]).keys()].filter((k) => {
        const value = k.split('.').reduce((n, part) => n[part], tables[locale]);
        return Array.isArray(value) ? value.some((v) => !String(v).trim()) : !String(value).trim();
      });
      assert.deepEqual(blank, [], `${region}/${locale} has empty strings`);
    });
  }

  // Interpolated placeholders have to survive translation or the currency
  // symbol silently disappears from the label.
  test(`${region}: placeholders survive translation`, () => {
    const withPlaceholders = [...enPaths.keys()].filter((k) => {
      const v = k.split('.').reduce((n, part) => n[part], tables.en);
      return typeof v === 'string' && /\{\w+\}/.test(v);
    });
    for (const key of withPlaceholders) {
      const expected = (key.split('.').reduce((n, p) => n[p], tables.en).match(/\{\w+\}/g) || []).sort();
      for (const locale of locales) {
        const actual = (String(key.split('.').reduce((n, p) => n[p], tables[locale])).match(/\{\w+\}/g) || []).sort();
        assert.deepEqual(actual, expected, `${region}/${locale} ${key} lost a placeholder`);
      }
    }
  });
}

test('region config matches the shipped dictionaries', () => {
  const src = fs.readFileSync(path.join(STRINGS_DIR, '..', 'regions.js'), 'utf8');
  for (const [region, locales] of Object.entries(REGION_LOCALES)) {
    const block = src.slice(src.indexOf(`${region}: {`));
    const declared = (block.slice(0, block.indexOf('},')).match(/'(\w+)'/g) || []).map((s) => s.slice(1, -1));
    const codes = declared.filter((c) => locales.includes(c) || c.length === 2);
    assert.deepEqual(
      codes.filter((c) => c !== region).sort(),
      [...locales].sort(),
      `regions.js ${region} locales drifted from strings/${region}/`
    );
    // Every declared locale must have a file on disk.
    for (const locale of locales) {
      assert.ok(
        fs.existsSync(path.join(STRINGS_DIR, region, `${locale}.js`)),
        `strings/${region}/${locale}.js missing`
      );
    }
  }
});
