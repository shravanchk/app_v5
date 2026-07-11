# AdSense Approval Audit — upaman.com

Working document. Issues found while upgrading calculator pages into educational
resources. Items are **not** auto-fixed unless noted; severity reflects estimated
impact on AdSense approval probability.

Last updated: 2026-07-11

## Already fixed (this review cycle)

| Issue | Fix | Commit |
|---|---|---|
| Thin hub pages (GSC "crawled – currently not indexed" follow-up): /tools 285w, /workflows 317w, /health-calculators 401w, /us-calculators 447w, /eu-calculators 508w, /india-calculators 615w | Each hub gained a region-specific overview section (now 470–847w) with figures computed at build time from the site's own engines (US: TX vs CA $75k paycheck via `computePaycheck`; EU: €60k nets via `computeEuropeanSalary`; India: ₹12L zero-tax rebate via `calculateIndianIncomeTax`), so prose cannot drift from calculators. Also: homepage "Latest updates" dated changelog block (real ship dates from git, easy-to-append array in `components/home/LatestUpdates.tsx`); named maintainer (Shravan Cherukuri) added to /about, research-team author page, and Organization schema `founder` for E-E-A-T; removed stale robots.txt disallows (`/index.html` was causing GSC's "blocked by robots.txt" — Cloudflare 308s it to `/`); sitemap lastmod bumped for the 9 touched pages | `e647014` |
| Placeholder ₹X/₹Y text on Income Tax page | Engine-verified worked example | `3bdb8ea` |
| "Loading Advertisement / Please wait" in prerendered HTML on ad pages | Silent ad-slot placeholder | `3bdb8ea` |
| Doubled step numbers ("1. 1") for screen readers / text extraction | HowToSection `ol`→`ul` + aria-hidden badge | `3bdb8ea` |
| "This calculator provides planning estimates" on JSON Tools (not a calculator) | Tool-appropriate trust copy | `3bdb8ea` |
| 404 page declared canonical while noindex | Canonical removed | `3bdb8ea` |
| Broken WebSite SearchAction (target page handles no `?q=`) | Schema removed | `bcfd25b` |
| `/tools` hub missing from sitemap | Added (now 272 URLs) | `bcfd25b` |
| Low-value "beta" UK Rail page | Removed + 301 to EU hub | `cc0ddc0` |
| Stale German salary engine (wrong net figures site-wide) | Rewritten on official §32a EStG | `ce96049` |
| Thin content: UK Income Tax (522w), SIP (618w), BMI (524w), Compound (650w), US Paycheck (749w), IRCTC (736w) | Educational articles, engine-verified examples, FAQ schema sync | `b5dddd0`, `afb04b9` |
| Thin content: US Mortgage (→1,449w, FAQPage schema added), Percentage (→1,302w, +2 FAQs) | Same pattern; all figures computed from the page's own formulas | `fb4862b` |
| Thin content: health cluster — BMR (548→1,338w), Body Fat (584→1,364w), Calorie (620→1,365w), Ideal Weight (622→1,299w), Macro (629→1,296w), Water (584→1,323w) | Same pattern; worked examples verified against `utils/healthCalculations.js`; +3–4 FAQs each, schema auto-synced | `897c966` |
| Thin content: European Salary (613→1,316w), EU VAT (727→1,485w), Tip (591→1,387w), Age (146→1,009w), Inflation (851→1,584w) | Same pattern; examples verified against page engines (`europeanSalaryCalculations`, `quickCalculations`, CPI data). Europe + Age pages also had hard-coded Head FAQ schemas that didn't match visible FAQs (Age had *no* visible FAQ — a structured-data violation); all three now render FAQs from the same array the schema is built from | `7c9c431` |
| Thin content: India CalcShell pages — HRA (348→1,177w), Gratuity (343→1,160w), Capital Gains (385→1,209w), GST Reform (356→1,125w) | Same pattern; worked examples verified against each page's own `compute` function. **All four also emitted FAQPage JSON-LD with zero visible FAQ on the page** — the same structured-data violation as the Age page. New shared `CalcFAQ` component now renders the same `faqItems` the schema is built from; new `.calc-prose`/`.calc-faq` CSS (dark-mode-safe) added to `common.css` | `a44a27d` |
| Thin content: PPF (474→1,406w) | Same pattern; worked examples verified against the page's `calculatePPFProjection` engine. PPF had a projection table but **no FAQ and no FAQPage schema at all** — added both the visible FAQ and matching JSON-LD, plus an EEE/tax-equivalent-yield article and the deposit-timing (5th-of-month) explanation | `f2a74af` |
| Thin content: per-country Europe salary pages — Germany (→1,810w), France (→1,764w), Netherlands (→1,731w) | These reuse the shared `EuropeanSalaryCalculator` with `forcedCountry`; the hub article/comparison were gated to the hub, so the country pages rendered only the widget + generic FAQ. Added a `COUNTRY_CONTENT` map (per-country article + 3 country-specific FAQs) rendered only when `forcedCountry` is set. Every euro figure verified against `computeEuropeanSalary` (DE €60k→€37,551 net; FR €60k→€36,116; NL €60k→€46,987). FAQ schema now built from the same country+shared array shown on each page (10 entries each); hub unchanged (7) | `fa56d0d` |
| Thin content: Credit Card Analyzer (→1,310w) | The last calculator page without prose — a bespoke interactive multi-currency expense tracker. Added an always-visible educational article (50/30/20 budgeting, reading budget-vs-actual, multi-currency caveats, avoiding revolving interest) plus a 5-item FAQ and matching FAQPage JSON-LD. No numeric claims fabricated (it is a tracker, not a fixed-formula calculator); figures are framed as illustrative. Cross-links to `/us-credit-card-payoff-calculator` and `/credit-card-trap-calculator` | `9ff75ab` |
| Legacy static guides migrated (8 files) | Migrated all 8 `public/guide-*.html` standalone pages into `/guides/*` (GuidePageLayout — full site chrome, dark-mode-safe prose, reviewed-on byline, Article schema). Content preserved faithfully with a new shared `Callout` component for the old `.box`/`.note` blocks. Rewrote all internal links (10 components) from `/guide-*.html` to `/guides/*`; updated the 8 sitemap URLs (+ bumped lastmod); added 8 `301` redirects to `_redirects`; added the guides to the `/guides` index (new "Saving & investing" group); deleted the legacy HTML so redirects take effect | `0445552` |
| New `/blog` section (3 launch posts) | Added a distinct editorial blog (nav + footer links, index page with `Blog` JSON-LD, new `BlogPostLayout` mirroring the guides design, `BlogPosting` schema, linked author/reviewer byline). Framed as *timely/data-driven* analysis to stay distinct from the evergreen `/guides`. Three launch posts (US/EU/India mix), every figure engine-verified: US $100k take-home by state (735w), €60k keep-rate across 8 EU systems (671w), old-vs-new regime FY 2026-27 break-even (763w). Added to sitemap. | `5b1baf7` |
| Thin content: 5 US calculators missed by every batch — Refinance (426→1,264w), Auto Loan (430→1,288w), 401(k) (515→1,417w), Savings & CD (417→1,333w), Credit Card Payoff (554→1,454w). All five had HowTo + InfoPanel but **no article and no FAQPage schema**; issue #1 below had been marked resolved prematurely | Same pattern as prior batches: FAQ array feeding both visible `<details>` and FAQPage JSON-LD, per-topic article, every figure computed from each page's own formulas and verified against the live widget (refinance break-even 2y 4m; 401(k) $2,439,809 projection; CC minimum-payment 100-year cap with $190,638 interest). No IRS limits, APR tables, or FDIC dollar amounts hardcoded | `76958f6` |
| Issue #10 batch A: 3 generic tools — Unit Converter (370→1,370w), Scientific (392→1,297w), Statistics (414→1,405w). All three had **no FAQPage schema** | Usage-focused articles + 6-item FAQ each with FAQPage JSON-LD; figures from each tool's own constants (binary GB gap 931.32, default-dataset CI [16.57, 24.10]), verified live | `d459d6d` |
| Issue #10 batch B: health — Period (565→1,295w), Pregnancy Due Date (578→1,315w) | YMYL-conservative 4-section articles + 2 FAQs each (schema via `buildFaqSchema`); calendar-method scope, qualitative clinical guidance; examples verified live (LMP Jan 1 2026 → Oct 8 2026; Jun 1 → next period Jun 29) | `9410b7a` |
| Issue #10 batch C: Buy vs Rent (449→1,173w), Tax Regime (582→1,156w), Salary (711→1,173w), JSON Tools (904→1,203w), CC Trap (953→1,409w) | Multi-paragraph intro/example/formula + 3–4 FAQs each via existing schema builders; all figures replicated from each page's model and checked live (break-even yr 4 / sensitivity yr 8–13; regime crossover ≈₹5.4L deductions at ₹15L; CTC ₹12L → ₹86,827/mo; CC 15y vs 2y). Honest-limits paragraphs where models flatter one side | `bd6df0a` |
| Issue #10 batch D: 6 older workflows — Emergency Fund (529→1,057w), Prepay vs Invest (549→1,024w), Job Offer (585→1,085w), Home Loan Readiness (604→1,129w), Rent vs Buy (619→1,071w), Car Ownership (757→1,306w) | Default-scenario walkthroughs traced through each model + 3–4 FAQs (via `SearchLandingSections`, no duplicate schema); all verdicts/figures verified live (hybrid verdict, "not ready" gap ₹18,78,410, "rent for now" despite yr-6 break-even, car ₹44,031/mo true cost) | `3649039` |

## Open issues

### High

1. **Thin content on remaining calculator pages.** ✅ **RESOLVED** — every calculator
   page now carries an educational article + FAQ.
   Why: "insufficient value" is the stated rejection reason; every indexed thin page
   drags the site-level quality assessment.
   Fix: completed the pilot pattern across all pages. Done: all non-India batches, the
   four thin India CalcShell pages (HRA, Gratuity, Capital Gains, GST Reform), PPF, the
   per-country Europe salary pages (Germany, France, Netherlands — country-specific
   articles + FAQs gated on `forcedCountry`), and the Credit Card Analyzer (bespoke
   interactive tracker — article + FAQ added). Already had full article layouts: GST,
   EMI, Income Tax (`CalculatorArticleLayout`), Salary, SIP, IRCTC, Tax Regime
   Comparison, Buy-vs-Rent (`SearchLandingSections`), Credit Card Trap
   (`SearchLandingSections`). (Remaining site-wide quality work lives under issues
   #2–#3: the legacy static guides and programmatic template repetition.)
   **Correction (2026-07-10):** this was marked resolved prematurely — a word-count
   sweep of the built US pages found five calculators (Refinance, Auto Loan, 401(k),
   Savings & CD, Credit Card Payoff) at 417–554 words with no article and no FAQPage
   schema. All five upgraded in `76958f6` (now 1,264–1,454w). A full-site sweep after
   that fix confirms every **US** calculator page is now ≥1,000 words with exactly one
   FAQPage schema; the remaining sub-1,000-word calculator/tool/workflow pages are
   tracked as issue #10 below. Lesson recorded: verify "all pages done" claims against
   the built HTML, not the batch list.
   Impact: high — this was the core complaint.

2. **Legacy static guides (`public/guide-*.html`, 8 files).** ✅ **RESOLVED.**
   Why: pre-redesign standalone HTML with different design/navigation than the site;
   reviewers saw inconsistent quality and orphan-ish templates. They were indexed
   (in sitemap, linked from SIP/EMI pages).
   Fix (done): all 8 migrated into `/guides/*` (GuidePageLayout — full site chrome,
   dark mode, Article schema), internal links rewritten, sitemap URLs updated, `301`
   redirects added in `_redirects`, and the legacy HTML deleted. Content preserved via
   a shared `Callout` component for the old highlighted boxes. Note: the `301`s rely on
   the host honouring `public/_redirects` (Netlify-style); confirm the production host
   applies it, or add the equivalent redirect rules for whatever platform serves the site.
   Impact: high-medium — quality inconsistency was very visible.

### Medium

3. **Template repetition across ~172 programmatic pages** (after-taxes 25, paycheck 51,
   uk/take-home 25, germany/take-home 25, tax-on-salary 46). ✅ **Largely addressed.**
   Why: Google's scaled-content guidance; pages differ mainly by numbers.
   Done (`e0db39b`): all five templates emitted FAQPage JSON-LD but rendered
   **no visible FAQ** — a structured-data violation across every page. Refactored each
   into a single `faqItems` array that builds both the schema and a visible FAQ
   section, so they always match. Each page now carries 3 page-specific questions with
   its own figures (state spread, monthly, per-hour; old-vs-new-regime and tax-free
   status for India; solidarity/no-tax-state conditional branches), which is genuine
   per-page visible content, not boilerplate. UK/Germany already carried band-specific
   taper/soli callouts. Remaining optional polish: sitemap priority tuning.
   **Second pass (2026-07-10, `fca5458`):** word-count check showed the two US
   templates were still near-duplicates (paycheck states: ~450w sharing all but ~46
   words between Texas and California). Both now generate per-page analysis in
   getStaticProps from the same engine that builds the tables: paycheck states get
   type-conditional "how X taxes a paycheck" sections (no-tax/flat/progressive read
   structurally differently), a build-time 51-state ranking with dollar gaps and
   nearest-neighbor cross-links, marginal raise math, and 1–2 type-specific FAQs
   (~800–910w, unique-word count tripled); after-taxes levels get federal-bracket
   position, threshold-conditional SS-cap/additional-Medicare notes, ladder deltas
   vs adjacent levels, and 2 level FAQs (~1,130–1,160w). The same check then showed
   UK/Germany/tax-on-salary were *not* acceptable after all (482–550w, 17–19 unique
   words between adjacent levels — the band callouts were conditional one-liners).
   Third pass (`b782acf`): all three now compute level-specific marginal analysis
   from their engines — UK band placement incl. the 60% allowance-taper branch,
   German §32a marginal keep with three-way contribution-ceiling branches, India
   rebate/marginal-relief/normal-slab branches plus a binary-searched old-regime
   break-even deduction per level — each with ladder deltas and +2 FAQs
   (now 703–828w). All five templates done; branch rendering verified across
   category boundaries. ✅ **RESOLVED** — remaining optional polish: sitemap
   priority tuning only.
   Impact: medium — the hidden-FAQ-schema violation is now fixed everywhere.

4. **Author/E-E-A-T depth.** ✅ **RESOLVED.** `/authors/*` pages exist (3 team/desk
   profiles with real bios) plus editorial, methodology, corrections, review-process
   pages — good coverage. The gap was hyperlinks: the EEATPanel *named* the author but
   every calculator/tool passed `author="Upaman Research Team"` as a plain string, so
   the byline was unlinked and the author pages were orphaned from content. Fix
   (`78704d5`): pointed the 16 calculator/tool bylines at the existing
   `editorialProfiles.researchTeam` object (which the panel renders as a link), and
   linked the IRCTC travel reviewer to `travelReviewDesk`. All three author pages now
   have inbound content links (research team 22 pages, finance desk 6, travel desk 1);
   workflows already linked both author and reviewer. Bios are honest org/desk profiles,
   not fabricated individuals.
   Impact: medium.

5. **`og:image` is the SVG logo.** ✅ **RESOLVED** (`b255e8c`). Social scrapers and some
   search features ignore SVG, so share cards were blank. Generated a branded
   1200×630 `public/og-image.png` (elephant logo + wordmark + tagline, rendered with
   `sharp`) and wired it site-wide via a default `<Head>` in `_app.js` (og:image +
   width/height/type/alt + twitter:image). Removed the old SVG og:image overrides from
   the 4 calculators and the homepage that set their own; also bumped the dormant
   `getSEOTags` dims from 512² to 1200×630. Swept all 275 built pages: each now has
   exactly one og:image pointing at the PNG, zero SVG og:images, no duplicates.
   Impact: low-medium (indirect).

### Low

6. **Sitemap `lastmod` values stale** on pages updated during the redesign.
   ✅ **DONE** (`058a2ad`). Honest, targeted refresh: bumped `lastmod` to 2026-07-06 for
   the 193 pages actually edited in this review cycle's batches (172 programmatic
   templates + 4 Europe salary calculators + Credit Card Analyzer + 16 author-linked
   calculators). Pages not touched this cycle keep their real dates. XML re-validated,
   272 URLs unchanged.
7. **robots.txt itemized Allow list is stale noise** (harmless — `Allow: /` governs).
   ✅ **DONE** (`058a2ad`). Trimmed from ~110 lines to 21: dropped the entire itemized
   `Allow` list (it still referenced the 8 deleted `/guide-*.html` files — actively
   pointing crawlers at dead URLs), kept `Allow: /`, the legitimate `Disallow` hygiene
   block, and the `Sitemap:` line.
8. **AdSense script now site-wide**: verify Auto ads (once approved) don't render on
   thin programmatic pages in a layout-shifting way; CLS is a CWV input.
9. **Accessibility sweep pending**: forms have labels and details/summary FAQs are
   keyboard-friendly; a full audit (contrast, focus traps in search modal, aria on
   animated charts) hasn't been run.
10. **Remaining sub-1,000-word calculator/tool/workflow pages** (full-build sweep,
   2026-07-10). ✅ **RESOLVED** (2026-07-10, same day) — all 16 pages upgraded across
   four commits: batch A generic tools `d459d6d`, batch B health `9410b7a`, batch C
   India/tools `bd6df0a`, batch D workflows `3649039` (fixed-rows above have details).
   Verified against the built HTML, not the batch list: a fresh full-site sweep after
   batch D shows **every indexed interactive page ≥1,000 words**; the only remaining
   sub-1,000-word pages are policy/legal/contact pages and the `/paycheck` state index,
   all navigation/boilerplate and deliberately out of scope. Original list for the
   record: Unit Converter (370w, no FAQ), Scientific (392w, no FAQ), Statistics (414w,
   no FAQ), Buy vs Rent (449w), Period (565w), Pregnancy Due Date (578w), Tax Regime
   (582w), Salary (711w), JSON Tools (904w), Credit Card Trap (953w), and six older
   workflows (Emergency Fund 529w, Prepay vs Invest 549w, Job Offer 585w, Home Loan
   604w, Rent vs Buy 619w, Car Ownership 757w). `home-preview` (685w) remains a
   noindex, unlinked dev page — harmless, consider deleting before approval anyway.

## Process recommendations

- Deploy before the next review; the live site must show all of the above.
- Resubmit sitemap in GSC after deploy; request re-indexing of the upgraded pages.
- Hold off on adding new thin programmatic verticals until approval.
