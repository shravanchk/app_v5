# SEO remediation — runbook

Everything shipped 2026-07-26, in the order it should be deployed and watched:

| § | Change | Status |
|---|---|---|
| 1–4 | 301s for legacy calculator slugs, real 410s for pre-revamp blog URLs | shipped |
| 5 | www → apex host redirect | **you, in the Cloudflare dashboard** |
| 6–7 | What to watch in GSC, and how to pull the exports | reference |
| 8 | Diagnosis of the 137 not-indexed pages | reference |
| 9 | Sitemap trim, 352 → 267 entries | shipped |
| 10 | Author profile pages rewritten and named | shipped |

Inventory and rationale: [LEGACY_URLS.md](./LEGACY_URLS.md).

---

## 1. What changed

| File | Change |
|---|---|
| [`public/_redirects`](../public/_redirects) | +18 legacy 301 rules (8 slugs × with/without trailing slash) and 2 trailing-slash normalisers. Existing 25 rules untouched. |
| [`functions/`](../functions) | **New.** Four Cloudflare Pages Function routes returning a genuine 410: `/animalinfo`, `/services`, `/tutorial`, `/tutorial/*`. |
| [`utils/edge/gone.mjs`](../utils/edge/gone.mjs) | Shared 410 response — HTML body, `noindex`, links back into the live site. |
| [`test/goneResponse.test.js`](../test/goneResponse.test.js) | Offline unit tests for the 410 body. |
| [`test/legacyUrls.integration.test.js`](../test/legacyUrls.integration.test.js) | Network integration guard. Skipped unless `SEO_BASE_URL` is set. |
| [`package.json`](../package.json) | `test:seo`, `preview:edge` scripts. |
| [`.gitignore`](../.gitignore) | `seo-audit/*` → `seo-audit/gsc/` + `seo-audit/out/`, so the notes are tracked but raw exports are not. Also ignores `.wrangler`. |
| [`public/sitemap.xml`](../public/sitemap.xml) | 352 → 267 entries (§9). |
| [`seo-audit/trim_sitemap.py`](./trim_sitemap.py) + [`tests/`](./tests) | Sitemap trim tool, 15 unit tests (§9). |
| [`pages/authors/*`](../pages/authors) | Three profile pages rewritten and named (§10). |
| [`utils/editorialProfiles.js`](../utils/editorialProfiles.js) | `SITE_OPERATOR` identity + `buildProfileSchema()` (§10). |
| [`components/legal/LegalPageLayout.js`](../components/legal/LegalPageLayout.js) | New optional `schema` prop for JSON-LD. |

**This project now has Pages Functions.** It was previously a pure static
export. That is the one architectural change here, and the main deploy risk.

## 2. Pre-deploy verification (already run, repeat if you change anything)

```bash
npm test
```

Then the edge runtime — this is the check that matters, because `next dev` does
not execute `functions/`:

```bash
npm run preview:edge
```

In a second terminal:

```bash
SEO_BASE_URL=http://localhost:8788 npm run test:seo
```

Verified locally on 2026-07-26: **30/30 pass**, 104/104 offline. Direct proof:

```
/animalinfo                  410   1280B
/animalinfo/                 410   1281B
/tutorial                    410   1278B
/tutorial/dry-principle      410   1292B
/tutorial/deep/nested/thing  410   1296B
/services                    410   1278B
/sip-calc                    301   -> /sip-calculator
/nope-random                 404  15097B
/income-tax-calculator       200  43450B
```

Note the `www` assertion self-skips against localhost — host rules live at the
Cloudflare zone, not in the Pages build. It will genuinely run in step 5.

## 3. Deploy

```bash
git add -A && git commit -m "Add 301/410 layer for pre-revamp legacy URLs"
```

Push, then **read the Cloudflare Pages build log**. Confirm it says
`Compiled Worker successfully` or `Found Functions directory`. If Functions are
not picked up, the four legacy paths fall back to 404 — degraded, not broken.

**Rollback:** `git rm -r functions/` and redeploy. Behaviour returns to 404 for
those paths; the `_redirects` 301s are independent and unaffected.

## 4. Post-deploy verification

```bash
for u in /animalinfo /animalinfo/ /tutorial /tutorial/dry-principle /services /sip-calc /emi-calc /tax-calc /gst-calc /irctc-calc /nope-$RANDOM /income-tax-calculator /; do printf '%-30s %s\n' "$u" "$(curl -sS -o /dev/null -w '%{http_code} -> %{redirect_url}' "https://upaman.com$u")"; done
```

Expected: `410` for the first four, `301` to the matching calculator for the
`-calc` slugs, `404` for the random path, `200` for the last two.

Confirm Cloudflare is not rewriting the 410 down to a 404 — this is the failure
mode the brief warned about:

```bash
curl -sI https://upaman.com/tutorial/dry-principle | head -1
```

Must print `HTTP/2 410`. If it prints `404`, check for a Cloudflare Custom Error
Page or a Transform Rule on the zone overriding it.

Then the full suite against production:

```bash
npm run test:seo
```

## 5. www → apex redirect (dashboard, not in this repo) — do this first

**Priority raised 2026-07-26.** The GSC *Alternative page with proper canonical
tag* export is 12 URLs and **all 12 are `www` duplicates** — `www./`,
`www./sip-calculator`, `www./income-tax-calculator`, `www./loan-calculator`,
`www./uk-income-tax-calculator`, `www./us-401k-calculator`, and 6 more. Google
is spending crawl budget re-fetching a second copy of your best pages. The
canonical tag is holding the line on which one ranks, but it is not stopping
the duplicate crawl. This is the single cheapest fix available.

Cannot be done from the Pages build — it needs a zone-level rule.

1. Cloudflare dashboard → **upaman.com** zone → **Rules** → **Redirect Rules**
2. **Create rule** → name it `www to apex`
3. **When incoming requests match** → Custom filter expression:
   ```
   (http.host eq "www.upaman.com")
   ```
4. **Then** → URL redirect → **Dynamic**
   - Expression: `concat("https://upaman.com", http.request.uri.path)`
   - Status code: **301**
   - **Preserve query string: on**
5. Deploy.

There is also a built-in **Redirect from WWW to Root** template that does the
same thing — either is fine, as long as it preserves the path. It must not dump
everything to `/`.

Verify:

```bash
curl -sI https://www.upaman.com/sip-calculator | grep -iE '^(HTTP|location)'
```

Expected: `HTTP/2 301` and `location: https://upaman.com/sip-calculator`.

Once this exists, `npm run test:seo` runs its www assertion for real. Until
then that one test will fail against production — expected, and the reason it
is written as an assertion rather than a skip.

## 6. GSC: what to watch, and for how long

Submit nothing for the 410s — you do not request indexing for a dead page, and
the Removals tool only hides results for ~6 months without deindexing. A 410
clears faster than a 404 on its own.

| Report | Expected movement | Horizon |
|---|---|---|
| Indexing → Pages → **Not found (404)** | Rises by up to ~4 (GSC files 410s under this label — do not be alarmed), then falls to zero as they clear | 2–6 weeks |
| Indexing → Pages → **Page with redirect** | +8 as the `-calc` slugs are recrawled | 2–4 weeks |
| Performance → Pages, filter `tutorial` / `animalinfo` | Impressions → 0 | 4–8 weeks |
| Performance → Pages, filter `www.upaman.com` | Rows collapse into apex equivalents | 4–8 weeks after step 5 |
| Indexing → **Discovered – currently not indexed** | **Unaffected by this change.** Tracked separately — see §8. | — |

Legacy URLs were 81 impressions and 0 clicks over 16 months, so expect no
measurable traffic change. The point of this work is a clean index, not
recovery.

## 7. Pulling the GSC exports (needed for the next piece of work)

The export already in `seo-audit/gsc/` is the **summary** Coverage export —
`Chart.csv`, `Critical issues.csv`, `Metadata.csv`. It has counts but no URLs.
Per-URL lists are one level deeper.

**First, check which properties you have.** In the property switcher (top left),
note whether you have a `upaman.com` **Domain** property, a
`https://upaman.com/` URL-prefix property, or both plus a `www` one. A Domain
property covers apex + www together and is what you want. If you only have a
URL-prefix property for apex, the www traffic in the Performance export is
coming from somewhere else — say so, it changes the picture.

**Then, for each reason:**

1. Search Console → left nav → **Indexing** → **Pages**
2. Scroll to **"Why pages aren't indexed"**
3. **Click the reason row** — this opens a detail view with an Examples table
4. Top right → **Export** → **Download CSV**
5. Save into `seo-audit/gsc/` named after the reason

Pull all six:

| Reason | Pages | Priority |
|---|---|---|
| Discovered – currently not indexed | 97 | **Highest — this is the main event** |
| Crawled – currently not indexed | 40 | **High** |
| Alternative page with proper canonical tag | 12 | Medium |
| Not found (404) | 6 | For this task — may name legacy paths not in the inventory |
| Page with redirect | 5 | Low |
| Redirect error | 1 | Medium — a redirect error is a real bug |

The Examples table caps at 1,000 URLs per reason; every count here is well
under that, so the exports will be complete.

**Also useful, same effort:**

- **Performance → Queries**, last 16 months → export. Already present as
  `Queries.csv` in the performance zip.
- **Indexing → Sitemaps** → click `sitemap.xml` → note "Discovered pages" vs
  the 352 URLs actually in the file.
- **Settings → Crawl stats** → export. Shows whether Google is crawl-budget
  limited on this domain, which is the mechanism behind
  "Discovered – currently not indexed".

## 8. Not fixed by this change

Revised 2026-07-26 after reconciling the GSC drilldown exports against live
production. The 137 not-indexed pages are **two separate problems**, not one:

### 8a. 20 live pages crawled and rejected

Two *Crawled – currently not indexed* exports were pulled ~an hour apart and
the second is a strict subset: **40 → 20**. The 20 that cleared were exactly
the stale legacy `.html`/extensionless guide redirects, the junk URLs
(`/#!`, `/?q=…`, `/sitemap.xml`), `/vat-calculator`, and
`/irctc-cancellation-calculator`. GSC's validation is working through the
redirect fixes on its own — further evidence the legacy-URL layer was never
the bottleneck.

The 20 that remain are **live, 200, in the sitemap, crawled by Google, and
refused**:

```
/sip-calculator            /european-salary-calculator   /eu-vat-calculator
/uk-income-tax-calculator  /france-salary-calculator     /ppf-calculator
/salary-calculator         /us-refinance-calculator      /scientific-calculator
/buy-vs-rent-calculator    /rent-vs-buy-workflow         /home-loan-readiness-workflow
/credit-card-analyzer      /credit-card-trap-calculator  /job-offer-workflow
/statistics-calculator     /guides/income-tax-regime-choice
/authors/upaman-research-team  /authors/travel-utility-review-desk
/authors/personal-finance-review-desk
```

This is **not** crawl budget — Google spent the crawl and made a judgement.

**Cannibalisation was measured and ruled out.** An earlier draft of this
runbook proposed internal duplication as the cause. Body-text similarity
(`difflib.SequenceMatcher` over `<main>`, chrome stripped) says otherwise:

| Pair | Similarity |
|---|---|
| `/buy-vs-rent-calculator` vs `/rent-vs-buy-workflow` | 3.1% |
| `/credit-card-analyzer` vs `/credit-card-trap-calculator` | 0.5% |
| `/salary-calculator` vs `/european-salary-calculator` | 1.6% |
| `/sip-calculator` vs `/ppf-calculator` | 0.9% |
| `/european-salary-calculator` vs `/france-salary-calculator` | 49.6% |

Only the last pair is meaningfully similar, and a Europe hub overlapping a
country page is expected. Word counts are **900–1,800** across the group. These
are substantial, distinct pages.

**The exception: the three `/authors/*` pages were genuinely thin** — 87, 120
and 137 words. On a YMYL domain, author pages are an E-E-A-T signal, and
100-word stubs are a negative one. That was the only page-level defect in the
20. **Fixed 2026-07-26 — see §10.**

**Revised diagnosis.** Seventeen substantial, distinct, well-linked pages
crawled and refused is not a page-quality problem — it is a **site-level trust
problem**. The pattern fits: a 3-year-old domain that pivoted its entire topic
~5 months ago, ~124 clicks lifetime, in the YMYL category where Google applies
its highest E-E-A-T bar. Google is not rejecting these pages on their merits;
it is declining to allocate index slots to the domain.

That means editing individual calculator pages will not move this. The levers
are domain-level: external citations, real author credentials, and time with a
stable topic. Do **not** consolidate or rewrite these 17 pages on the theory
that they are low quality — the data does not support it.

### 8b. 97 pages never crawled at all — confirmed 2026-07-26

*Discovered – currently not indexed*, export now in hand. **Every one of the 97
has `Last crawled = 1970-01-01`** — GSC's null. Google has never fetched a
single one of them.

Composition:

| Group | Count | Share |
|---|---|---|
| `/paycheck/*` (48 US states + hub) | 49 | 51% |
| `/tax-on-salary/*` (₹-lakh bands + hub) | 38 | 39% |
| Everything else | 10 | 10% |

The 10 others: `/guides`, `/tools`, `/workflows`, `/us-paycheck-calculator`,
`/netherlands-salary-calculator`, `/percentage-calculator`, `/bmr-calculator`,
`/hra-calculator`, `/gratuity-calculator`,
`/us-mortgage-payoff-vs-invest-workflow`.

**It is not an internal-linking problem.** Measured against the built output:
`/guides`, `/tools`, `/workflows` and `/us-paycheck-calculator` are each linked
from all **354** pages; `/paycheck` from 81; `/paycheck/california` from 30.
Every one of those is still uncrawled. Link equity is being offered and Google
is declining to spend crawl on it.

**The tell:** Google *did* index a handful of `/paycheck/*` pages — `illinois`,
`north-carolina`, `rhode-island` all have impressions in the Performance
export. So it sampled the cluster, crawled a few, judged the marginal value
low, and stopped scheduling the rest. That is crawl scheduling behaviour on a
low-authority domain, not a technical fault.

**The compounding cost:** those 87 template URLs sit in the crawl queue ahead
of `/guides`, `/tools`, `/workflows` and two real calculators, which is why
well-linked hub pages are going unfetched. The programmatic set is not merely
failing on its own — it is crowding out the pages that would rank.

**Actioned 2026-07-26 — see §9.** The sitemap has been trimmed 352 → 267.

Still open, needing your call: whether those two clusters earn their place at
all. If they stay, they need something a template cannot produce —
state-specific rules, local rates, genuinely distinct copy. They remain live
and internally linked; only the sitemap listing was withdrawn.

## 9. Sitemap trim (shipped 2026-07-26)

[`seo-audit/trim_sitemap.py`](./trim_sitemap.py) reads the GSC
*Discovered – currently not indexed* export, keeps only rows Google has **never
crawled** (`Last crawled = 1970-01-01`), restricts them to the two programmatic
clusters, and strips the matching `<url>` blocks from `public/sitemap.xml`.

```bash
python3 seo-audit/trim_sitemap.py --dry-run    # report only
python3 seo-audit/trim_sitemap.py --apply      # rewrite in place
python3 -m unittest discover -s seo-audit/tests -v
```

Result: **352 → 267 entries**, removing 48 `/paycheck/*` and 37
`/tax-on-salary/*` leaves.

Deliberately kept:

- both cluster hubs, `/paycheck` and `/tax-on-salary`
- the leaves that *did* index — `/paycheck/{illinois,north-carolina,rhode-island}`,
  `/tax-on-salary/{13,17,27,32,50}-lakh`
- all 10 non-programmatic never-crawled pages (`/guides`, `/tools`,
  `/workflows`, `/us-paycheck-calculator`, …) — freeing budget for exactly
  these is the point
- every other cluster (`/hourly/*`, `/after-taxes/*`, `/uk/*`, `/germany/*`),
  which Google crawls fine

**The pages are not deleted.** They still serve 200 and stay internally linked,
so they remain discoverable. Only the explicit crawl request was withdrawn.
This is reversible: re-run with a different `ELIGIBLE_PREFIXES`, or
`git checkout public/sitemap.xml`.

Guarded by 15 unit tests (hub protection, prefix-collision safety, idempotency,
XML validity, count validation) and 4 integration assertions.

**After deploying:** GSC → Sitemaps → resubmit `sitemap.xml`. Then watch
*Discovered – currently not indexed* fall from 97 toward ~10 over 2–6 weeks,
and watch whether `/guides`, `/tools`, `/workflows` and `/us-paycheck-calculator`
finally get a crawl date. That last one is the real success metric — if those
four are still uncrawled in six weeks, crawl budget was not the constraint and
the answer is §8a's site-authority problem.

### 8c. Ranking

`/income-tax-calculator` 21,191 impressions at position 67.7; `/gst-calculator`
5,898 at 56.0; `/sip-calculator` 791 at 53.7. Site total ~124 clicks over 16
months.

None of this is a redirect problem. Separate task.

## 10. Author profile pages (shipped 2026-07-26)

The three `/authors/*` pages were 87–137 words and fronted by unnamed entities
("Upaman Research Team", "Personal Finance Review Desk", "Travel Utility Review
Desk"). On a YMYL domain that is an actively negative E-E-A-T signal: an
anonymous "Desk" reads as manufactured authority, which is worse than a small
site admitting it is small.

Rewritten so each page **names the real, accountable human**:

| Page | Before | After |
|---|---|---|
| `/authors/upaman-research-team` | 137w | 330w |
| `/authors/personal-finance-review-desk` | 120w | 352w |
| `/authors/travel-utility-review-desk` | 87w | 381w |

The URLs are unchanged — they are referenced by blog bylines and
[`utils/editorialProfiles.js`](../utils/editorialProfiles.js).

What changed beyond length:

- **Named and linked.** Each page states that Upaman is run by one person,
  Shravan Cherukuri, with a `rel="me"` LinkedIn link. The "desks" are described
  as review *functions* he performs, not teams. Honesty is the E-E-A-T play
  here; padding is not.
- **`ProfilePage` + `Person` JSON-LD** with `sameAs` → LinkedIn, via
  `buildProfileSchema()` in `utils/editorialProfiles.js`. Emitted through a new
  optional `schema` prop on `LegalPageLayout`.
- **Specific, checkable claims** instead of generic assurance — primary
  sourcing, generated worked examples, unit-tested engines, named boundary
  cases. Claims were verified against the code before being written: the IRCTC
  cut-offs quoted (72h / 24h / 8h confirmed, 0.5h RAC-WL) are the actual
  branches in `utils/engines/irctcCancellation.js`.
- **Explicit limits.** Each page says plainly that this is educational software
  written by an engineer, not advice from a chartered accountant or licensed
  professional.

No credentials were invented. Only what is verifiable — name, role, LinkedIn,
and how the code actually works — appears on these pages.

**Caveat:** this fixes the one page-level defect found in the 20. It does not
address §8a's site-level trust problem, which is the larger constraint.
