# Legacy URL inventory (pre-revamp era)

Compiled 2026-07-26. This is the complete record of what could be recovered
about the URL layer that existed before upaman.com became a financial
calculators site.

## Provenance — and its limits

The old codebase is **not recoverable**:

- This repo (`app_v5`) begins at commit `aea6966`, 2026-02-24, containing only
  `.gitignore` and `README.md`. `git log --all --diff-filter=D` across all 118
  commits returns 10 deleted paths, every one of them from the current
  calculator era. **Zero blog routes.**
- The predecessor at `../app_v4` (Create React App) was *also* a calculators
  site. The general-interest blog is a generation older than that and exists
  nowhere on disk.

So the inventory below is assembled from two indirect sources:

1. `app_v4/public/.htaccess` — 301 rules someone wrote for the old URLs.
   **These never executed**: Cloudflare Pages ignores Apache config. Every one
   of them also pointed at `/`, which is a mass redirect-to-homepage and reads
   to Google as a soft 404.
2. `app_v4/public/robots.txt` — a "Legacy URLs retained for redirect handling"
   block.
3. GSC Performance → Pages, last 16 months.

The `/tutorial/*` namespace appears in **neither repo** — it is known only from
Google's index and from GSC. Its slug list is unknown, which is why it is
handled as a wildcard.

## What Google still shows for legacy URLs

Entire 16-month window:

| URL | Clicks | Impressions | Avg position |
|---|---|---|---|
| `upaman.com/animalinfo` | 0 | 45 | 6.7 |
| `www.upaman.com/tutorial` | 0 | 23 | 4.0 |
| `www.upaman.com/tutorial/dry-principle` | 0 | 13 | 4.4 |
| **Total** | **0** | **81** | |

~0.2% of site impressions, zero clicks. Recorded here so nobody re-litigates
the priority of this work later.

## Disposition

### 301 — genuine topical equivalent exists

Implemented in [`public/_redirects`](../public/_redirects), with trailing-slash
variants.

| Legacy path | Target | Source |
|---|---|---|
| `/old-calculator` | `/loan-calculator` | .htaccess |
| `/emi-calc` | `/loan-calculator` | .htaccess |
| `/loan-calc` | `/loan-calculator` | .htaccess |
| `/tax-calc` | `/income-tax-calculator` | .htaccess |
| `/income-tax-calc` | `/income-tax-calculator` | .htaccess |
| `/sip-calc` | `/sip-calculator` | .htaccess |
| `/gst-calc` | `/gst-calculator` | .htaccess |
| `/irctc-calc` | `/irctc-calculator` | .htaccess |
| `/vat-calculator` | `/eu-vat-calculator` | **GSC drilldown** |

Each is an abbreviation or old name of a page that still exists. These are the
only unambiguous matches in the whole inventory.

`/vat-calculator` was found in the GSC *Crawled – currently not indexed* export
(last crawled 2026-02-26, still 404 today) — an app_v4-era slug that was renamed
to `/eu-vat-calculator`. It was not in either repo's config, which is why the
drilldown exports mattered.

### 410 — no equivalent

Implemented in [`functions/`](../functions), because Cloudflare Pages
`_redirects` supports only 200/301/302/303/307/308/404 — a genuine 410 needs a
Pages Function.

| Legacy path | Why 410 |
|---|---|
| `/animalinfo` | Animal fun-facts section. Nothing on a financial calculators site is topically equivalent. |
| `/tutorial` | Index of the old tech-tutorial section. |
| `/tutorial/*` | All articles beneath it (`/tutorial/dry-principle`, …). Slug list unknown, so the whole namespace is caught. |
| `/services` | Old agency-style services page. |

A 301 from a programming tutorial to a SIP calculator is a relevance-mismatch
signal on a YMYL domain — worse than the honest 410.

### Deliberately not actioned

| Path / pattern | Reason |
|---|---|
| `/about`, `/contact` | **Live pages today** ([`pages/about.js`](../pages/about.js), [`pages/contact.js`](../pages/contact.js)). The .htaccess rule sending them to `/` was always wrong. |
| `/calculator/*` → `/$1-calculator` | Speculative rewrite from .htaccess. Would manufacture 301s into 404s for any slug without a matching page. A plain 404 is safer. |
| `/tools/*` → `/$1-calculator` | Same, and `/tools` is a live page now. |
| `/old-*`, `/legacy-*`, `/v1/`, `/v2/`, `/test/`, `/demo/` | Appear only as `Disallow` patterns in the old robots.txt. No evidence any concrete URL under them was ever indexed. Leave as 404 unless GSC's "Not found (404)" export names one. |
| `/uk-rail-calculator` → `/eu-calculators` | Pre-existing rule, shipped before this audit. Weak topical match, but it is live and the brief says not to touch existing behaviour. |

## GSC drilldown cross-check (2026-07-26)

Five of the six per-reason exports were pulled and reconciled against live
production. Result: **the legacy-URL surface is now fully accounted for.**

- *Not found (404)*, 6 URLs — 4 already fixed and stale in GSC
  (`/guide-irctc-booking-strategy`, `/emi-calculator`, `/blog` all resolve now;
  `/search?q={search_term_string}` came from a `SearchAction` schema that was
  already removed, see [`components/home/HomePage.tsx:13`](../components/home/HomePage.tsx)).
  `/cdn-cgi/l/email-protection` is Cloudflare's own and is robots-blocked.
  `www.upaman.com/tutorial` is covered by the 410 layer.
- *Page with redirect*, 5 URLs — all correct, expected behaviour.
- *Redirect error*, 1 URL — `/about.html`, verified today as a clean single-hop
  301 to `/about`. Stale (last crawled 2026-03-04).
- *Alternative page with proper canonical tag*, 12 URLs — **every one is a `www`
  host duplicate.** Direct evidence for the www→apex rule in runbook §5.
- *Crawled – currently not indexed*, 39 URLs — 15 are stale legacy redirects
  that now resolve, 1 was `/vat-calculator` (fixed above), 3 are junk
  (`/#!`, `/?q=…`, `/sitemap.xml`), and **21 are live, sitemap-listed pages
  Google chose not to index.** That last group is not a URL problem — see
  runbook §8.

**Still outstanding:** the *Discovered – currently not indexed* export (97
pages), the single largest bucket.
