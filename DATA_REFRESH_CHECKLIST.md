# Data Refresh Checklist

Tracks every page whose numbers go stale — tax years, rates, thresholds, formulas — so
refreshes are scheduled, not discovered. **Review this file at the start of every month**;
work the items whose window is open, tick them, and stamp the date.

Created: 2026-07-15 · Baseline: everything below verified current as of 2026-07-15.

---

## How to use

- `[ ]` = due / not yet verified for the current cycle · `[x] YYYY-MM-DD` = done, with date.
- When a cycle completes (e.g. all January items done), reset the boxes for the next year.
- Every refresh, no matter how small, ends with the **post-refresh ritual** (bottom of file).
- Rule of thumb: **calculators are the source of truth; guides must agree with them.**
  Update the engine first, then sweep the guides that quote its numbers.

---

## 📅 Annual calendar

| Month | What opens | Section |
|---|---|---|
| **January** | US tax year figures (IRS Rev. Proc. + SSA), CPI-U annual average, EU/EEA rates | US, EU |
| **February** | India Union Budget — watch for slab/deduction changes effective April | India |
| **March–April** | UK new tax year (April 6), India new FY (April 1) — biggest sweep of the year | UK, India |
| **July** | Mid-year sanity pass: re-read this file, check "as announced" items below | All |
| **Quarterly** (Jan/Apr/Jul/Oct) | PPF interest rate review by GoI | India |

---

## 🇺🇸 United States — refresh every January

Official sources: IRS Revenue Procedure (inflation adjustments, ~Oct–Nov prior year),
SSA wage base announcement (~Oct), BLS CPI (mid-January), state DOR sites.

| Done | File / page | What goes stale |
|---|---|---|
| [ ] | `utils/usPaycheckCalculations.js` | `FEDERAL_<year>` brackets, standard deduction, `FICA_<year>` SS wage base; **state tables are 2025-26 estimates — full 50-state re-verify** |
| [ ] | `pages/paycheck/` (51 state pages) + `/after-taxes` | Regenerated from the util above — rebuild & spot-check 3 states after updating it |
| [ ] | `pages/hourly/` (26 rate pages, `utils/hourlyRates.js`) | After-tax estimates and "2026" copy regenerate from `usPaycheckCalculations.js` — rebuild after the annual update and spot-check one rate |
| [ ] | `utils/quickCalculations.js` (`CPI_U_ANNUAL`) | Add the new annual average when BLS publishes it (mid-Jan); feeds `/inflation-calculator` |
| [ ] | `components/us/US401kCalculator.js` → `/us-401k-calculator` | No hardcoded limit in the engine (percentage-based inputs) — but check the article/FAQ copy for quoted limits |
| [ ] | `/us-savings-cd-calculator`, `/us-mortgage-calculator`, `/us-auto-loan-calculator`, `/us-refinance-calculator`, `/us-credit-card-payoff-calculator` | No hardcoded market rates by design — verify defaults still look plausible, nothing more |
| [ ] | Guide: `how-to-read-your-paycheck` | Year in title/desc, bracket figures |
| [ ] | Guide: `traditional-vs-roth-401k` | "(2026)" in headline, $24,500 / $8,000 / $11,250 limits, Roth catch-up wage threshold (~$145k indexed) |
| [ ] | Guide: `how-much-house-can-i-afford` | Illustrative 6.5% rate & $632/$100k figure — refresh if rates have moved materially |
| [ ] | Blog: `2026-us-take-home-pay-by-state` | Year-stamped — decide: refresh to new year or leave as archival |
| [ ] | US workflows (`us-retirement-readiness`, `us-mortgage-payoff-vs-invest`) | Any quoted limits/brackets in the article copy |

**Evergreen — accuracy re-read only, no data:** `50-30-20-rule`, `cd-ladder-explained`,
`apr-vs-apy`, `how-much-saved-by-30-40-50` (Fidelity multiples are stable), compound
interest / percentage / tip calculators.

---

## 🇬🇧 United Kingdom — refresh every March–April (new tax year April 6)

Official sources: GOV.UK rates pages, HMRC "rates and thresholds for employers", Autumn
Budget (usually Nov — pre-read it; the April numbers are announced there).

| Done | File / page | What goes stale |
|---|---|---|
| [ ] | `utils/taxCalculations.js` (`UK_TAX_YEAR`) + UK engine | Personal Allowance, rUK bands, Scottish bands, NI thresholds & rates (8%/2%), student-loan plan thresholds |
| [ ] | `/uk-income-tax-calculator` + `pages/uk/take-home` tables | Regenerated from the engine — rebuild and spot-check £30k / £60k / £110k |
| [ ] | Guide: `uk-tax-rates-2026-27` | **Year-stamped URL** — ship a new `/guides/uk-tax-rates-2027-28`, keep the old page live as archival, update all internal links to point at the new one |
| [ ] | Guide: `how-to-read-your-uk-payslip` | "(2026-27)" in title, allowance, NI rates, all five student-loan thresholds, tax code (1257L changes if allowance changes) |
| [ ] | Guide: `salary-sacrifice-explained` | 8% NI in the worked example (£160 saving), £100k–£125,140 taper band |
| [ ] | `pages/tax-on-salary` UK programmatic pages | Regenerated — verify after engine update |
| [ ] | `pages/uk/hourly/` (20 rate pages, `utils/hourlyRates.js`) | Take-home estimates and "2026-27" copy regenerate from `taxCalculations.js` — rebuild after the April update and spot-check one rate |

---

## 🇮🇳 India — refresh every February (Budget) → April (new FY)

Official sources: Union Budget documents (Feb 1), incometax.gov.in, CBDT circulars,
Ministry of Finance quarterly small-savings rate notifications.

| Done | File / page | What goes stale |
|---|---|---|
| [ ] | Income tax engine + `/income-tax-calculator`, `/tax-regime-comparison`, `/salary-calculator` | New-regime slabs, rebate threshold, standard deduction (₹75,000), surcharge; old-regime rarely moves but verify |
| [ ] | Guides: `india-income-tax-2026-27`, `standard-deduction-fy-2026-27`, `tax-on-12-lakh-salary-fy-2026-27`, `marginal-relief-new-regime-fy-2026-27`, `old-vs-new-regime-breakeven-fy-2026-27`, `income-tax-regime-choice` | **All FY-stamped** — same treatment as UK: new FY versions + link sweep, or in-place update if the URL isn't year-stamped |
| [ ] | `components/india/HraCalculator.js` + guide `hra-exemption-calculation` | Metro city list (8 cities from FY 2026-27 — watch for further changes), FY references, the FY 2025-26 four-city caveat becomes obsolete after AY 2026-27 filing season |
| [ ] | `pages/tax-on-salary` India programmatic pages (₹5L–₹50L) | Regenerated from engine |
| [ ] | Blog: `old-vs-new-tax-regime-2026-27-breakeven` | FY-stamped — refresh or archive |
| [ ] | Guide: `how-to-file-itr` | **Refresh every June, before filing season** (evergreen URL, in-place update): AY/FY references, due date, belated-return date & fee, ITR form applicability, regime-election rules, the HRA metro-list caveat (drops after AY 2026-27) |
| [ ] | `/gratuity-calculator` | ₹20 lakh ceiling, 15/26 formula (stable, but ceiling changes by notification) |
| [ ] | `/capital-gains-calculator` | LTCG/STCG rates, holding periods, exemption limit — Budget moves these often |
| [ ] | `/gst-calculator`, `/gst-reform-calculator` | Slab structure — **as announced** by GST Council, not annual |

**Quarterly (Jan / Apr / Jul / Oct):**

| Done | File / page | What goes stale |
|---|---|---|
| [ ] Q3-2026 | `components/india/PPFCalculator.js` | 7.1% rate appears in the FAQ, subtitle, and default input — GoI reviews quarterly (usually unchanged; 5-min check) |
| [ ] Q3-2026 | `/fd-vs-sip-workflow`, guide `ppf-vs-sip-choice` | Any quoted PPF/FD rates |

**As announced (no fixed date — check during July + January passes):**

| Done | File / page | Trigger |
|---|---|---|
| [ ] | `components/india/IRCTCCancellationCalculator.js` + `/irctc-calculator` + guide `irctc-booking-strategy` | Railway ministry revises cancellation/Tatkal rules (current: April 2026 rules) |
| [ ] | `/credit-card-trap-calculator`, guide `credit-card-minimum-due-trap` | RBI minimum-due norms |
| [ ] | EPF interest rate mentions (salary content) | EPFO annual declaration (~Feb–Mar) |

---

## 🇪🇺 EU — refresh every January

| Done | File / page | What goes stale |
|---|---|---|
| [ ] | `utils/europeanSalaryCalculations.js` | Germany (§32a tariff, social-insurance %s and ceilings), France (barème), Netherlands (Box 1 bands) — all year-stamped |
| [ ] | `/european-salary-calculator`, `/germany-salary-calculator`, `/france-salary-calculator`, `/netherlands-salary-calculator`, `pages/germany/` | Regenerated/derived from the util |
| [ ] | `/eu-vat-calculator` | VAT rates — as announced per country; verify during the January pass |
| [ ] | Blog: `60000-across-europe-2026` | Year-stamped — refresh or archive |

---

## 🔁 Post-refresh ritual (every time, no exceptions)

1. **Engine first, prose second** — update the util/component, then grep the updated
   number's *old* value across `pages/` and `components/` to catch every guide, FAQ,
   meta description, and structured-data block that quotes it.
2. Update **`reviewedOn`** and **`dateModified`** (article schema) on every touched guide.
3. Bump **`lastmod`** in `public/sitemap.xml` for every touched URL.
4. Add a line to **`components/home/LatestUpdates.tsx`** (date must match the deploy).
5. Build, verify locally, commit, deploy.
6. GSC: resubmit sitemap; request indexing for the highest-value refreshed pages.
7. Stamp the checkbox here with the date.

## 🗓 Next scheduled passes

- **2026-10:** PPF quarterly check (5 min).
- **2026-11:** Read the UK Autumn Budget; pre-stage the April 2027 UK numbers.
- **2027-01:** Full US + EU + CPI pass. The big one — budget a day.
- **2027-02:** India Budget watch.
- **2027-04:** UK new tax year + India new FY sweep (largest guide-URL migration).
