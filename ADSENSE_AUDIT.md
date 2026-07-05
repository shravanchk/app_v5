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
| Thin content: UK Income Tax (522w), SIP (618w), BMI (524w), Compound (650w), US Paycheck (749w), IRCTC (736w) | Educational articles, engine-verified examples, FAQ schema sync | `b5dddd0` + this batch |

## Open issues

### High

1. **Thin content on remaining calculator pages.**
   Why: "insufficient value" is the stated rejection reason; every indexed thin page
   drags the site-level quality assessment.
   Fix: continue the pilot pattern. Batch 2 candidates: European Salary, Calorie/TDEE,
   US Mortgage, EU VAT, Percentage, Tip, BMR, Body Fat, Ideal Weight, Macro, Water,
   Inflation, Age. Batch 3: remaining India pages (GST reform, HRA, capital gains,
   gratuity, credit-card pages, salary calculator).
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
