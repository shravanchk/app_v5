/**
 * Integration guard for the legacy-URL layer.
 *
 * Redirect layers rot silently: a rule gets dropped from _redirects, a Pages
 * Function stops being deployed, or the host starts rewriting 410 to 404, and
 * nothing in the build fails. This asserts the *actual status code on the
 * wire* for a sample of each category.
 *
 * Network-bound, so it is opt-in and skipped by default:
 *
 *   npm run test:seo                          # against production
 *   SEO_BASE_URL=http://localhost:8788 npm run test:seo   # wrangler pages dev
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const BASE = process.env.SEO_BASE_URL;
const skip = BASE ? false : 'set SEO_BASE_URL to run (e.g. https://upaman.com)';
const TIMEOUT_MS = 20_000;

/** Single request, redirects surfaced rather than followed. */
async function probe(path) {
  const res = await fetch(new URL(path, BASE), {
    redirect: 'manual',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': 'upaman-seo-integration-test' }
  });
  return {
    status: res.status,
    location: res.headers.get('location'),
    contentType: res.headers.get('content-type'),
    body: await res.text()
  };
}

/** Walk a redirect chain, returning every hop. */
async function chain(path, maxHops = 5) {
  const hops = [];
  let current = path;
  for (let i = 0; i < maxHops; i += 1) {
    const res = await probe(current);
    hops.push({ from: current, ...res });
    if (res.status < 300 || res.status >= 400 || !res.location) break;
    current = new URL(res.location, BASE).pathname;
  }
  return hops;
}

// --- legacy slugs with a genuine equivalent: single-hop 301 -----------------

const LEGACY_301 = [
  ['/emi-calc', '/loan-calculator'],
  ['/loan-calc', '/loan-calculator'],
  ['/old-calculator', '/loan-calculator'],
  ['/tax-calc', '/income-tax-calculator'],
  ['/income-tax-calc', '/income-tax-calculator'],
  ['/sip-calc', '/sip-calculator'],
  ['/gst-calc', '/gst-calculator'],
  ['/irctc-calc', '/irctc-calculator'],
  ['/vat-calculator', '/eu-vat-calculator'],
  ['/emi-calculator', '/loan-calculator']
];

for (const [from, to] of LEGACY_301) {
  test(`${from} -> 301 -> ${to}`, { skip }, async () => {
    const hops = await chain(from);
    assert.equal(hops[0].status, 301, `${from} should 301, got ${hops[0].status}`);
    assert.equal(new URL(hops[0].location, BASE).pathname, to);
    assert.equal(hops.length, 2, `${from} should reach its target in one hop`);
    assert.equal(hops[1].status, 200, `${to} must be live — never 301 to a dead page`);
  });
}

// --- legacy slugs with no equivalent: 410 -----------------------------------

const LEGACY_410 = ['/animalinfo', '/services', '/tutorial', '/tutorial/dry-principle'];

for (const path of LEGACY_410) {
  test(`${path} -> 410 Gone`, { skip }, async () => {
    const res = await probe(path);
    assert.equal(res.status, 410, `${path} should be 410, got ${res.status}`);
    assert.match(res.contentType ?? '', /text\/html/);
    assert.match(res.body, /410/, 'the 410 body should be useful, not empty');
  });
}

test('trailing-slash legacy paths normalise into the 410', { skip }, async () => {
  for (const path of ['/animalinfo/', '/services/', '/tutorial/']) {
    const hops = await chain(path);
    assert.equal(hops.at(-1).status, 410, `${path} ended at ${hops.at(-1).status}`);
  }
});

// --- unknown URLs: a real 404 with a real body ------------------------------

test('unknown URLs return 404, never an empty 200', { skip }, async () => {
  const res = await probe(`/does-not-exist-${Date.now()}`);
  assert.equal(res.status, 404);
  assert.ok(res.body.length > 500, `404 body was ${res.body.length} bytes`);
  assert.match(res.body, /noindex/i);
});

// --- currently-ranking pages must not have been caught by any rule ----------

const MUST_STAY_200 = [
  '/',
  '/income-tax-calculator',
  '/gst-calculator',
  '/sip-calculator',
  '/loan-calculator',
  '/irctc-calculator',
  '/age-calculator',
  '/json-tools',
  '/european-salary-calculator',
  '/paycheck/illinois',
  '/uk/take-home/45000',
  '/guides/apr-vs-apy'
];

for (const path of MUST_STAY_200) {
  test(`${path} still 200`, { skip }, async () => {
    const res = await probe(path);
    assert.equal(res.status, 200, `${path} regressed to ${res.status}`);
  });
}

// --- host canonicalisation --------------------------------------------------

test('www redirects to apex with a 301', { skip }, async () => {
  const apex = new URL(BASE);
  if (apex.hostname === 'localhost' || apex.hostname.startsWith('127.')) {
    return; // host rules live at the Cloudflare zone, not in the Pages build
  }
  const res = await fetch(`https://www.upaman.com/sip-calculator`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  assert.equal(res.status, 301, `www should 301, got ${res.status}`);
  const target = new URL(res.headers.get('location'));
  assert.equal(target.hostname, 'upaman.com');
  assert.equal(target.pathname, '/sip-calculator', 'www must preserve the path, not dump to /');
});

// --- sitemap ----------------------------------------------------------------

test('sitemap is served as parseable, uncompressed XML', { skip }, async () => {
  const res = await probe('/sitemap.xml');
  assert.equal(res.status, 200);
  assert.match(res.contentType ?? '', /xml/);
  assert.ok(res.body.startsWith('<?xml'), 'sitemap must not be gzipped without Content-Encoding');
  assert.ok(res.body.includes('<loc>'), 'sitemap has no entries');
});

test('no legacy path leaks into the sitemap', { skip }, async () => {
  const res = await probe('/sitemap.xml');
  for (const path of [...LEGACY_410, ...LEGACY_301.map(([from]) => from)]) {
    assert.ok(
      !res.body.includes(`<loc>https://upaman.com${path}</loc>`),
      `sitemap advertises the dead path ${path}`
    );
  }
});

// --- sitemap trim (see seo-audit/trim_sitemap.py) ---------------------------
// 85 never-crawled programmatic leaves were removed to stop spending crawl
// budget on URLs Google has repeatedly declined to fetch.

const has = (body, path) => body.includes(`<loc>https://upaman.com${path}</loc>`);

test('never-crawled programmatic leaves are no longer advertised', { skip }, async () => {
  const { body } = await probe('/sitemap.xml');
  for (const path of ['/paycheck/california', '/paycheck/texas', '/paycheck/new-york',
                      '/tax-on-salary/9-lakh', '/tax-on-salary/12-lakh']) {
    assert.ok(!has(body, path), `sitemap still advertises the uncrawled ${path}`);
  }
});

test('cluster hubs and pages that did index are kept', { skip }, async () => {
  const { body } = await probe('/sitemap.xml');
  for (const path of ['/paycheck', '/tax-on-salary',
                      '/paycheck/illinois', '/paycheck/north-carolina', '/paycheck/rhode-island',
                      '/tax-on-salary/13-lakh', '/tax-on-salary/17-lakh',
                      '/guides', '/tools', '/workflows', '/us-paycheck-calculator',
                      '/netherlands-salary-calculator', '/bmr-calculator']) {
    assert.ok(has(body, path), `sitemap dropped ${path}, which must stay`);
  }
});

test('trimmed pages still exist and are reachable — de-listed, not deleted', { skip }, async () => {
  for (const path of ['/paycheck/california', '/tax-on-salary/9-lakh']) {
    const res = await probe(path);
    assert.equal(res.status, 200, `${path} should still serve, got ${res.status}`);
  }
});

test('sitemap has no duplicate entries', { skip }, async () => {
  const { body } = await probe('/sitemap.xml');
  const locs = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs.length, new Set(locs).size, 'sitemap contains duplicate <loc> values');
});
