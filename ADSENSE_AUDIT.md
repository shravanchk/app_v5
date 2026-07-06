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
| Thin content: per-country Europe salary pages — Germany (→1,810w), France (→1,764w), Netherlands (→1,731w) | These reuse the shared `EuropeanSalaryCalculator` with `forcedCountry`; the hub article/comparison were gated to the hub, so the country pages rendered only the widget + generic FAQ. Added a `COUNTRY_CONTENT` map (per-country article + 3 country-specific FAQs) rendered only when `forcedCountry` is set. Every euro figure verified against `computeEuropeanSalary` (DE €60k→€37,551 net; FR €60k→€36,116; NL €60k→€46,987). FAQ schema now built from the same country+shared array shown on each page (10 entries each); hub unchanged (7) | `fa56d0d` |
| Thin content: Credit Card Analyzer (→1,310w) | The last calculator page without prose — a bespoke interactive multi-currency expense tracker. Added an always-visible educational article (50/30/20 budgeting, reading budget-vs-actual, multi-currency caveats, avoiding revolving interest) plus a 5-item FAQ and matching FAQPage JSON-LD. No numeric claims fabricated (it is a tracker, not a fixed-formula calculator); figures are framed as illustrative. Cross-links to `/us-credit-card-payoff-calculator` and `/credit-card-trap-calculator` | `9ff75ab` |
| Legacy static guides migrated (8 files) | Migrated all 8 `public/guide-*.html` standalone pages into `/guides/*` (GuidePageLayout — full site chrome, dark-mode-safe prose, reviewed-on byline, Article schema). Content preserved faithfully with a new shared `Callout` component for the old `.box`/`.note` blocks. Rewrote all internal links (10 components) from `/guide-*.html` to `/guides/*`; updated the 8 sitemap URLs (+ bumped lastmod); added 8 `301` redirects to `_redirects`; added the guides to the `/guides` index (new "Saving & investing" group); deleted the legacy HTML so redirects take effect | `0445552` |

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
   (`SearchLandingSections`). No calculator page is now thin. (Remaining site-wide
   quality work lives under issues #2–#3: the legacy static guides and programmatic
   template repetition.)
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
   Done (`PENDING` commit): all five templates emitted FAQPage JSON-LD but rendered
   **no visible FAQ** — a structured-data violation across every page. Refactored each
   into a single `faqItems` array that builds both the schema and a visible FAQ
   section, so they always match. Each page now carries 3 page-specific questions with
   its own figures (state spread, monthly, per-hour; old-vs-new-regime and tax-free
   status for India; solidarity/no-tax-state conditional branches), which is genuine
   per-page visible content, not boilerplate. UK/Germany already carried band-specific
   taper/soli callouts. Remaining optional polish: sitemap priority tuning.
   Impact: medium — the hidden-FAQ-schema violation is now fixed everywhere.

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
