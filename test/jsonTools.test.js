const test = require('node:test');
const assert = require('node:assert/strict');
const {
  deepSortKeys,
  flattenObject,
  unflattenObject,
  csvToJson,
  jsonToCsv,
  parseJsonWithDetails,
  createJsonPatch,
  yamlToJson,
  jsonToYaml
} = require('../utils/jsonTools');

test('parseJsonWithDetails reports line and column for a syntax error', () => {
  const result = parseJsonWithDetails('{\n  "a": 1,\n  "b": ,\n}');
  assert.ok(result.error);
  assert.equal(result.error.line, 3);
  assert.ok(result.error.column >= 1);
});

test('parseJsonWithDetails parses valid JSON', () => {
  const result = parseJsonWithDetails('{"a": [1, 2]}');
  assert.deepEqual(result.value, { a: [1, 2] });
});

test('deepSortKeys sorts object keys recursively but leaves arrays alone', () => {
  const sorted = deepSortKeys({ b: { z: 1, a: 2 }, a: [3, 1, { y: 1, x: 2 }] });
  assert.deepEqual(Object.keys(sorted), ['a', 'b']);
  assert.deepEqual(Object.keys(sorted.b), ['a', 'z']);
  assert.deepEqual(sorted.a.slice(0, 2), [3, 1]);
  assert.deepEqual(Object.keys(sorted.a[2]), ['x', 'y']);
});

test('flatten and unflatten round-trip nested structures', () => {
  const original = {
    user: { name: 'Aarav', tags: ['a', 'b'] },
    goals: [{ name: 'Fund', target: 300000 }]
  };
  const flat = flattenObject(original);
  assert.equal(flat['user.name'], 'Aarav');
  assert.equal(flat['user.tags[1]'], 'b');
  assert.equal(flat['goals[0].target'], 300000);
  assert.deepEqual(unflattenObject(flat), original);
});

test('csvToJson maps headers, infers types, and honors quoting', () => {
  const rows = csvToJson('name,count,active,note\n"Smith, Jane",3,true,"said ""hi"""\nBob,,false,');
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], { name: 'Smith, Jane', count: 3, active: true, note: 'said "hi"' });
  assert.equal(rows[1].count, '');
  assert.equal(rows[1].active, false);
});

test('csvToJson requires a header plus data row', () => {
  assert.throws(() => csvToJson('only,one,row'), /header row/);
});

test('jsonToCsv takes the union of keys and quotes special values', () => {
  const { csv, rowCount } = jsonToCsv([
    { a: 1, b: 'x,y' },
    { a: 2, c: true }
  ]);
  assert.equal(rowCount, 2);
  const lines = csv.split('\n');
  assert.equal(lines[0], 'a,b,c');
  assert.equal(lines[1], '1,"x,y",');
  assert.equal(lines[2], '2,,true');
});

test('createJsonPatch emits add, remove, and replace operations', () => {
  const patch = createJsonPatch(
    { a: 1, gone: true, nested: { x: 1 } },
    { a: 2, nested: { x: 1, y: 3 } }
  );
  assert.deepEqual(patch, [
    { op: 'remove', path: '/gone' },
    { op: 'replace', path: '/a', value: 2 },
    { op: 'add', path: '/nested/y', value: 3 }
  ]);
});

test('createJsonPatch escapes JSON Pointer special characters', () => {
  const patch = createJsonPatch({}, { 'a/b~c': 1 });
  assert.deepEqual(patch, [{ op: 'add', path: '/a~1b~0c', value: 1 }]);
});

test('createJsonPatch returns empty patch for equivalent documents', () => {
  assert.deepEqual(createJsonPatch({ a: [1, 2] }, { a: [1, 2] }), []);
});

test('yamlToJson handles anchors, aliases, and multiline strings', async () => {
  const data = await yamlToJson('base: &b\n  retries: 3\njob:\n  <<: *b\n  name: deploy\nnotes: |\n  line one\n  line two');
  assert.equal(data.job.retries, 3);
  assert.equal(data.job.name, 'deploy');
  assert.equal(data.notes, 'line one\nline two\n');
});

test('jsonToYaml round-trips through yamlToJson', async () => {
  const original = { user: { name: 'Aarav', active: true }, goals: [{ target: 300000 }, { target: 2500000 }] };
  const yamlText = await jsonToYaml(original);
  assert.deepEqual(await yamlToJson(yamlText), original);
});
