# AdSense Approval Audit — upaman.com

Working document. Issues found while upgrading calculator pages into educational
resources. Items are **not** auto-fixed unless noted; severity reflects estimated
impact on AdSense approval probability.

Last updated: 2026-07-05

## Already fixed (this review cycle)

| Issue | Fix | Commit |
|---|---|---|
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
| Thin content: per-country Europe salary pages — Germany (→1,810w), France (→1,764w), Netherlands (→1,731w) | These reuse the shared `EuropeanSalaryCalculator` with `forcedCountry`; the hub article/comparison were gated to the hub, so the country pages rendered only the widget + generic FAQ. Added a `COUNTRY_CONTENT` map (per-country article + 3 country-specific FAQs) rendered only when `forcedCountry` is set. Every euro figure verified against `computeEuropeanSalary` (DE €60k→€37,551 net; FR €60k→€36,116; NL €60k→€46,987). FAQ schema now built from the same country+shared array shown on each page (10 entries each); hub unchanged (7) | `PENDING` |

## Open issues

### High

1. **Thin content on remaining calculator pages.**
   Why: "insufficient value" is the stated rejection reason; every indexed thin page
   drags the site-level quality assessment.
   Fix: continue the pilot pattern. Done: all non-India batches, the four thin India
   CalcShell pages (HRA, Gratuity, Capital Gains, GST Reform), PPF, and the per-country
   Europe salary pages (Germany, France, Netherlands — now carry country-specific
   articles + FAQs gated on `forcedCountry`). Already had full article layouts (not
   thin): GST, EMI, Income Tax (`CalculatorArticleLayout`), Salary, SIP, IRCTC, Tax
   Regime Comparison, Buy-vs-Rent (`SearchLandingSections`), Credit Card Trap
   (`SearchLandingSections`). Remaining: Credit Card Analyzer (a large interactive
   expense tool — has real functionality, not low-value, but carries no educational
   prose/FAQ) is the only calculator page still without an article. Verify each against
   its actual rendered content before assuming it is thin — several flagged pages
   already carry articles.
   Impact: high — this is the core complaint.

2. **Legacy static guides (`public/guide-*.html`, 8 files).**
   Why: pre-redesign standalone HTML with different design/navigation than the site;
   reviewers see inconsistent quality and orphan-ish templates. They are indexed
   (in sitemap, linked from SIP/EMI pages).
   Fix: either migrate content into `/guides/*` (GuidePageLayout) and 301 the old
   URLs, or visually refresh them. Migration recommended.
   Impact: high-medium — quality inconsistency is very visible.

### Medium

3. **Template repetition across ~126 programmatic pages** (after-taxes 26, paycheck 52,
   uk/take-home 26, germany/take-home 26, tax-on-salary 46+).
   Why: Google's scaled-content guidance; pages differ mainly by numbers.
   Mitigation already present: per-page FAQ answers embed page-specific figures;
   tables genuinely differ. Fix: add 2–3 salary-band-specific prose observations per
   template tier (e.g., taper note already varies). Do not add boilerplate.
   Impact: medium — programmatic pages are common on approved sites, but during a
   quality-focused review they dilute; consider deprioritizing in sitemap priorities.

4. **Author/E-E-A-T depth unverified.** `/authors/*` pages exist plus editorial,
   methodology, corrections, review-process pages (good coverage — better than most
   applicants). Verify author pages carry real bios and are linked from content
   (EEATPanel names them but check hyperlinks).
   Impact: medium.

5. **`og:image` is the SVG logo.** Social scrapers and some search features ignore
   SVG. Fix: one 1200×630 PNG, referenced site-wide.
   Impact: low-medium (indirect).

### Low

6. **Sitemap `lastmod` values stale** on pages updated during the redesign.
   Fix: one-time bulk refresh; keep honest going forward.
7. **robots.txt itemized Allow list is stale noise** (harmless — `Allow: /` governs).
   Fix: trim to `Allow: /` + sitemap line.
8. **AdSense script now site-wide**: verify Auto ads (once approved) don't render on
   thin programmatic pages in a layout-shifting way; CLS is a CWV input.
9. **Accessibility sweep pending**: forms have labels and details/summary FAQs are
   keyboard-friendly; a full audit (contrast, focus traps in search modal, aria on
   animated charts) hasn't been run.

## Process recommendations

- Deploy before the next review; the live site must show all of the above.
- Resubmit sitemap in GSC after deploy; request re-indexing of the upgraded pages.
- Hold off on adding new thin programmatic verticals until approval.
