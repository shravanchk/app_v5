const test = require('node:test');
const assert = require('node:assert/strict');

// utils/edge/gone.mjs is ESM (it runs on the Cloudflare Pages runtime).
const loadGone = () => import('../utils/edge/gone.mjs');

test('goneResponse returns a real 410, not a 404 or 200', async () => {
  const { goneResponse } = await loadGone();
  const res = goneResponse('/animalinfo');
  assert.equal(res.status, 410);
  assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(res.headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('the 410 body is useful, noindexed, and names the dead path', async () => {
  const { goneResponse } = await loadGone();
  const body = await goneResponse('/tutorial/dry-principle').text();
  assert.ok(body.length > 500, `body was only ${body.length} bytes`);
  assert.match(body, /410/);
  assert.match(body, /noindex, nofollow/);
  assert.match(body, /\/tutorial\/dry-principle/);
  assert.match(body, /href="\/"/, 'should offer a route back into the live site');
});

test('the path is HTML-escaped so a crafted URL cannot inject markup', async () => {
  const { goneResponse } = await loadGone();
  const body = await goneResponse('/tutorial/<img src=x onerror=alert(1)>').text();
  assert.ok(!body.includes('<img src=x'), 'raw markup leaked into the body');
  assert.match(body, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test('onRequestGone derives the path from the request URL', async () => {
  const { onRequestGone } = await loadGone();
  const res = onRequestGone({ request: new Request('https://upaman.com/tutorial/solid?ref=x') });
  assert.equal(res.status, 410);
  const body = await res.text();
  assert.match(body, /\/tutorial\/solid/);
  assert.ok(!body.includes('ref=x'), 'query string should not be echoed');
});
