# Upaman UI Reform — Handoff Prompt (for Claude Code)

You are continuing a homepage + calculator UI redesign for **Upaman** (https://upaman.com), a
financial decision platform. Static Next.js (Pages Router) → `next export` (`output: 'export'`) →
Cloudflare Pages (direct `wrangler pages deploy out`). Work on the **`ui-reform`** git branch.

## Tech & design-system conventions (FOLLOW THESE)

- **TypeScript is set up** (`tsconfig.json`, `@types/*`, `typescript` in devDeps). New components are `.tsx`.
  JS calculators stay `.js` (importing `.tsx` from `.js` is fine).
- **Tailwind** with `darkMode: ['class', '.dark-theme']`. The navbar toggle adds `dark-theme` to `<body>`,
  so use `dark:` variants everywhere. Tokens in `tailwind.config.js`: `brand` color scale (#2563EB),
  `ink`/`ink-soft`/`ink-muted`, `font-display` (Manrope), shadows `soft`/`card`/`lift`.
- **Full-bleed layout**: content spans the viewport via `components/ui/Container.tsx`
  (`w-full px-4 sm:px-6 lg:px-10 xl:px-16`, no max-width). Long text blocks get their own max-width.
- **Reusable primitives** (already built):
  - `components/ui/`: `Container`, `Button`, `Card`, `Badge`, `SectionHeading`, `cn`, and
    `Field.tsx` → `NumberField`, `SelectField`, `Tabs`.
  - `components/calculator/CalcLayout.tsx` → `CalcLayout` (eyebrow/title/subtitle + Container) and `ResultStat`.
- **Icon colour tints** (light+dark) — reuse this map for icon grids:
  `brand / emerald / violet / amber / sky / rose / teal / indigo` (see `components/home/CalculatorGrid.tsx`).
- **Global chrome**: `components/home/Navbar.tsx` (sticky, search modal, dark toggle, back button) and
  `components/home/SiteFooter.tsx` are rendered globally in `pages/_app.js` (hidden only on `/embed/*`).
  The old floating `HomeButton` is a no-op.

### Pattern for rewriting a calculator onto the new design
Keep ALL business logic, `Head` JSON-LD schema, FAQ items, and reuse the existing (now dark-aware)
panels: `EEATPanel`, `CalculatorInfoPanel`, `SearchLandingSections`, `CalculatorArticleLayout`,
`ResultActions`, `AffiliateRecommendations`, `SavedScenarios`, and charts
`PieBreakdownChart` / `ComparisonBars`. Only the interactive UI moves to:
`CalcLayout` + `Tabs` + `Card` + `NumberField`/`SelectField` + `ResultStat`. Auto-calculate on input
change. Set `reviewedOn="June 28, 2026"`. Use `formatINR` / Intl `en-IN`.

## Already done (do NOT redo)
- New homepage (`components/home/*`), global Navbar + back button, SiteFooter, footer/section tinting.
- Calculators fully on the new system: **SIP, EMI/Loan, PPF, GST, Income Tax, Salary**
  (`SIPCalculator.js`, `EmiCalculator.js`, `PPFCalculator.js`, `GSTCalculator.js`,
  `IncomeTaxCalculator.js`, `SalaryCalculator.js`).
- Newer calculators on the editorial `CalcShell`: **Gratuity, HRA, Capital Gains, GST 2.0** (consistent, dark-ok).
- `/india-calculators` hub redesigned with coloured icons (`IndiaCalculatorsHub.js`).
- Collapsible, dark-aware explanation sections (`CalculatorArticleLayout.js`, `SearchLandingSections.js`).
- Dark mode fixed for: trust/methodology (`CredibilityPanel`), editorial trust (`EEATPanel`),
  embed block (`EmbedSnippet`), methodology notes (`.calculator-info-panel` in `styles/common.css`).

### Session 2 (multi-region) — done
- **Navbar bug fixes**: removed legacy `.hidden`/`.text-center`/`.sr-only` from `styles/common.css`
  (they clobbered Tailwind's `md:flex` etc. because common.css loads after globals.css → desktop
  menu was hidden). Mobile drawer + SearchModal moved OUT of `<header>` (the header's `backdrop-blur`
  was the containing block for their `fixed inset-0`, collapsing them to navbar height). Added an X
  close button to `SearchModal`.
- **Region hubs rebuilt on `CalcLayout` + tinted cards**: `USCalculatorsHub.js` (`/us-calculators`),
  `EUCalculatorsHub.js` (`/eu-calculators`, UK Rail folded in). New **Everyday Tools** hub:
  `components/ToolsHub.js` + `pages/tools.js` (`/tools`).
- **Discovery wiring**: Navbar "Calculators" dropdown has a "Browse by region" group (`REGIONS` array);
  "Tools" nav item repointed to `/tools`; mobile drawer updated; homepage `RegionSection.tsx`
  ("Calculators for where you are") inserted after `CalculatorGrid` in `HomePage.tsx`;
  footer "Regions" column in `SiteFooter.tsx`.
- **US calculators migrated** to new design (logic/JSON-LD/FAQ/charts/ResultActions/CalculatorInfoPanel
  preserved): `USMortgageCalculator`, `USRefinanceCalculator`, `USAutoLoanCalculator`,
  `US401kCalculator`, `USSavingsCDCalculator`, `USCreditCardPayoffCalculator`.
- **UK Income Tax** migrated: `UKIncomeTaxCalculator.js`.
- **Reskinned** (kept internal interaction model, swapped outer chrome to `CalcLayout`, dropped the
  old floating `HomeButton`): `AgeCalculator.js`, `JsonTools.js`.
- Pattern note: hub components rely on the page wrapper's `<Head>` (no `<Head>` in the hub component) —
  except `IndiaCalculatorsHub` which has both (pre-existing redundancy, left as-is).

## Remaining work (prioritized)

### Calculator pages still on the OLD design (functional + linked, NOT yet migrated)
These were explicitly deferred/skipped in session 2 — resume here:
- ~~**EU/UK salary + VAT**~~ **DONE** — `EuropeanSalaryCalculator.js` (shared engine driving
  `european-salary`, `france-salary`, `germany-salary`, `netherlands-salary` via thin wrappers)
  and `VATCalculator.js` (`eu-vat-calculator`) migrated to `CalcLayout` + `Card` +
  `NumberField`/`SelectField`/`Tabs` + `ResultStat` + `PieBreakdownChart`. Frequency / calc-type
  radios → `Tabs`; comparison/rates tables → tinted dark-aware button cards; added `ResultActions`
  + `CalculatorInfoPanel`; dropped `HomeButton`. All logic/JSON-LD/FAQ + the forced-country prop
  interface preserved. Verified tsc + build + preview (light/dark, forced-country wrapper).
- **UK Rail** (`UKRailCalculator.js`, ~1500 lines) — user said skip for now.
- ~~**Tools** still old: `ScientificCalculator.js`, `StatisticsCalculator.js`, `UnitConverter.js`~~
  **DONE** — all three migrated to `CalcLayout` + Tailwind `dark:` (not the old isDarkMode pattern).
- India extras: ~~`tax-regime-comparison`~~ **DONE**, ~~`credit-card-trap-calculator`~~ **DONE**
  (dropped its stray `useEffect` dark-theme toggle; uses kit `DecisionBanner`/`HowToNote`/`Panel`).
  ~~**`irctc-calculator`**~~ **DONE** — migrated to `CalcLayout` + `Card` + `SelectField` + a
  brand booking-opens card. Removed the legacy `isDarkMode`/localStorage theme system + floating
  theme-toggle button + `HomeButton`; **kept** the decorative moving-train SVG animation (now
  full-width, not `100vw`). Surfaced the previously-commented `specialNotes` as an amber note.
  All logic, JSON-LD (software/FAQ/breadcrumb), EEAT, SearchLandingSections preserved. Verified
  tsc + build + preview (light/dark, general + Tatkal branches).
- **IRCTC logic fix**: Tatkal AC classes (incl. Premium Tatkal) open at 10:00 AM, non-AC/Sleeper
  at 11:00 AM — the old code hard-coded 11:00 AM for the whole Tatkal branch (Premium Tatkal was
  wrong). Now uses the rule's `time`. Also unified the general-booking opening time to 10:00 AM for
  all passenger types (the old "ladies = 11:00 AM" was incorrect; ladies quota sits inside the
  normal window). Notes/rules text updated to match.
- **Known issue**: `AgeCalculator` logs a dev-only React hydration warning (renders live current-date
  values during render → static prerender ≠ client). Pre-existing, not from the reskin. Renders fine.

### Other UI-reform items (from session 1, still open)
1. ~~**Colourise homepage Start-Here + Workflow card icons**~~ **DONE** — both `StartHere.tsx` and
   `WorkflowCards.tsx` already carry distinct tints (brand/emerald/violet/amber/sky/rose).
4. ~~**Workflow pages** (home-loan-readiness, rent-vs-buy, prepay-vs-invest, job-offer,
   emergency-fund, car-ownership) — onto the new design + dark mode.~~ **DONE** — all 6
   migrated to `CalcLayout` + new shared `components/workflow/WorkflowKit.tsx` (`WorkflowSteps`,
   `HowToNote`, `DecisionBanner`, `Panel`/`PanelRow`, `ActionList`). Decision logic now returns
   a `tone` (`positive`/`warning`/`danger`/`info`) instead of a hex `color`. Field tips folded
   into `NumberField`/`SelectField` `hint`s. Logic/JSON-LD/EEAT/SearchLandingSections preserved.
   `HomeButton` dropped. Verified tsc + build + dark mode in preview.
5. ~~**Guide pages dark mode**~~ **DONE** — `GuidePageLayout.js` rewritten to dark-aware Tailwind
   (Container + prose via `[&_h2]/[&_p]/[&_a]…` descendant classes); legacy `sectionTitleStyle`
   export neutralized to `{}` so existing inline-styled headings adapt without per-page edits.
   Programmatic `pages/tax-on-salary/[slug].js` + `index.js` converted to the design system (brand
   hero + dark-aware slab table). Dropped the bespoke sticky home buttons.
6. ~~**Create `/workflows` and `/guides` index pages**~~ **DONE** — `pages/workflows.js` and
   `pages/guides/index.js` built on `CalcLayout` + `Card` with `ItemList` JSON-LD. Navbar (desktop +
   mobile drawer), Hero "Explore Workflows" button, and the homepage WorkflowCards/GuideCards
   "see all" actions all repointed from `/#workflows` / `/#guides` to `/workflows` / `/guides`.
7. ~~**Legal pages**~~ **DONE** — `LegalPageLayout.js` rewritten dark-aware the same way
   (neutralized `headingTwoStyle`); covers all legal + author profile pages.
8. **Final dark-mode audit** — calculators, workflows, guides, legal, hubs, tax-on-salary, and the
   new index pages all verified dark-aware. Remaining known light-in-dark elements (accepted, not
   regressions): `PieBreakdownChart`/`ComparisonBars` render on white cards, and guide-page data
   tables that use per-page inline `thStyle`/`tdStyle` (readable light islands).
9. ~~**HowTo SEO (queued)**~~ **DONE** — built shared `components/calculator/HowToSection.tsx`
   (visible numbered steps, dark-aware) + `buildHowToSchema` helper in `utils/schema.js`. The
   component renders the visible "How to use this calculator" list AND emits matching `HowTo`
   JSON-LD from the same `steps` array. Rolled out to all 20 migrated calculators
   (EMI/SIP/PPF/GST/IncomeTax/Salary/TaxRegime/CreditCardTrap + EU salary/VAT/UK tax + 6 US +
   Scientific/Statistics/UnitConverter) plus IRCTC; `AgeCalculator` already had bespoke HowTo
   schema. Workflows keep their visible `HowToNote` (no HowTo schema — decision tools, not
   step-by-step calculators).
   - **SEO audit (all 70 routes):** every page has `<title>` + meta description + canonical
     (verified via runtime fetch). Only `/404` lacks canonical, which is correct.

### Session 4 — Health & Fitness vertical (organic-traffic push) — done
New calculator category targeting high-volume, geo-agnostic health keywords (supports the US/EU
revenue focus). All on `CalcLayout` + `Card` + `NumberField`/`SelectField`/`Tabs` + `ResultStat`
+ `HowToSection` + FAQ + software/FAQ/breadcrumb JSON-LD + `EEATPanel` + `HealthDisclaimer`,
with **animated explanatory visuals** and US/metric unit toggles (imperial default):
- Shared math: `utils/healthCalculations.js` (BMI/WHO bands, Mifflin-St Jeor + revised
  Harris-Benedict, TDEE multipliers, US Navy body fat + ACE bands, cycle prediction, Naegele's rule).
- Shared visuals: `components/health/HealthKit.tsx` — `BandScale` (sliding marker), `GoalBars`
  (animated widths), `PulseBadge`, `CycleRing` (SVG arcs), `TrimesterTrack`, `HealthDisclaimer`.
- Calculators: `BMICalculator` (/bmi-calculator), `CalorieCalculator` (/calorie-calculator),
  `BMRCalculator` (/bmr-calculator), `BodyFatCalculator` (/body-fat-calculator, sex-specific
  hip field), `PeriodCalculator` (/period-calculator), `PregnancyDueDateCalculator`
  (/pregnancy-due-date-calculator, LMP or conception method).
- Hub: `HealthCalculatorsHub.js` + `pages/health-calculators.js`. Wired into Navbar `REGIONS`
  ("Health & fitness"), SearchModal (Health group), SiteFooter Regions, and `public/sitemap.xml`
  (also backfilled missing `/workflows` + `/guides` sitemap entries).
- Verified: tsc + build clean; math hand-checked (BMI 24.3, TDEE 2,283, Navy 18.3% male /
  28.8% female, next period +cycle days, due date LMP+280); light + dark previews; no console errors.

### Session 5 — US Paycheck vertical (highest-RPM US cluster) — done (commit 9e24bfe)
- **Engine** `utils/usPaycheckCalculations.js`: 2026 federal brackets + standard deductions
  (single/married/HoH, Rev. Proc. 2025-32), FICA 2026 (SS 6.2% to $184,500 wage base; Medicare
  1.45% + 0.9% additional), and all 50 states + DC (`US_STATES`: 9 no-tax, flat, and progressive
  states; married brackets/deductions doubled as an approximation; MD includes avg 3.2% county
  rate; local-tax notes for NYC/OH/PA). Pre-tax 401(k) reduces income taxes, not FICA.
  `stateSlug`/`codeFromSlug` drive the programmatic routes.
- **Calculator** `USPaycheckCalculator.js` → `/us-paycheck-calculator`: salary/state/filing
  status/401(k)%, pay-frequency Tabs (annual/monthly/bi-weekly/weekly), animated "Where each
  $100 goes" stacked bar, annual breakdown, PieBreakdownChart, ResultActions, HowToSection,
  FAQ, software/FAQ/breadcrumb JSON-LD, CalculatorInfoPanel (IRS/SSA/Tax Foundation sources).
- **Programmatic pages** `pages/paycheck/[state].js` (51 pages, `/paycheck/texas` etc.):
  $75k hero + $40k–$150k take-home table (single, standard deduction), state tax summary,
  state-specific FAQ schema, breadcrumb, prev/next links. Index `pages/paycheck/index.js`
  lists all states with $75k net + NO-TAX badges and ItemList schema.
- **Wiring**: US hub card (top slot), SearchModal, sitemap (+53 URLs), robots.txt.
- Verified live in production: TX $75k → $61,593 net and CA $75k → $58,575 net (both match
  hand calculations exactly), 9 NO-TAX badges, 51 index cards, all schemas present.
- **Maintenance note**: state rates are 2025-26 published figures labeled as estimates —
  revisit annually (federal figures are firm 2026).

### Session 6 — Quick-win calculator pack (top search-volume keywords) — done
- **Engine** `utils/quickCalculations.js`: compound growth (monthly simulation at the
  equivalent monthly rate so contributions work with any of 5 compounding frequencies),
  percentage helpers (percentOf / whatPercent / percentChange / applyPercent), tip split
  with per-person round-up, and US CPI-U annual averages 1913–2025 (`adjustForInflation`
  works both directions). All engines verified against closed-form results to the cent.
- **`/compound-interest-calculator`**: deposit + monthly contribution + rate + years +
  frequency; animated stacked growth bars (deposit/contributions/interest per year),
  pie composition, yearly schedule table, Rule-of-72 callout, ResultActions.
- **`/inflation-calculator`**: any two years 1913–2025, swap button, animated value bars,
  $100-by-decade milestones, buying-power stat. BLS/Fed sources. **Maintenance: add the
  new CPI annual average each January** (currently 2025 = 322.3).
- **`/percentage-calculator`**: 4 modes via Tabs (X% of Y, X is what % of Y, % change,
  increase/decrease), mode-aware field labels, sentence + formula + animated percent ring.
- **`/tip-calculator`**: preset % buttons (10–25) + custom, people stepper, per-person
  round-up, animated bill-vs-tip bar, US tipping guide table (Emily Post / Pew sources).
- All four: full SEO kit (title/desc/keywords/canonical/OG/Twitter + SoftwareApplication +
  FAQPage + HowTo + BreadcrumbList = 4 JSON-LD blocks each), FAQ details, CalculatorInfoPanel.
- **Wiring**: SearchModal (+4), ToolsHub cards (percentage, tip — top slots),
  USCalculatorsHub cards (compound interest, inflation), hub page meta refreshed,
  sitemap (189 URLs), robots.txt.
- Gotcha fixed: Next.js `<title>` must be a single string — use a template literal, not
  multiple JSX children (the inflation title silently truncated until fixed).
- Verified: tsc + build clean (186 pages); preview interactions tested on all four
  (mode switch, presets, stepper, swap); only pre-existing AdSense console warning.
- **Hero carousel** (`components/home/DashboardPreview.tsx`): now 5 cards — compound
  interest (US, first slide → prerendered in index.html) and calorie/TDEE added ahead of
  EMI/SIP/tax. Card math is inlined at module scope mirroring the utils so hero values
  match each calculator's default inputs exactly ($144,573; 2,283 kcal maintain).
- **Global repositioning**: About page Product Scope rewritten (global audience, was
  India-first); footer Calculators/Guides/Regions columns now lead with US/EU links.
- **Salary-level pages** (`/after-taxes`): 25 programmatic pages ($30k–$250k, list in
  `utils/salaryLevels.js`) targeting "$X after taxes" queries. Each has a 51-state
  take-home table linking every `/paycheck/[state]` page; state pages link back from
  their salary cells. Index + hub card on /us-calculators; sitemap now 215 URLs
  (keep `utils/salaryLevels.js`, sitemap, and state-page SALARIES row set in sync).

## Rules / gotchas
- **Verify every change** with `npx tsc --noEmit` (must be exit 0). The previous environment's
  `next build` hung on lint; locally you CAN run `npm run build` — do it before deploying.
- **After config/CSS/Tailwind changes, clear the cache**: `rm -rf .next && npm run dev`.
- Preserve all SEO: JSON-LD schema, FAQ, EEAT, internal links, canonical URLs. Don't drop content.
- Curate links to pages that exist (no 404s).
- Keep the calm editorial-fintech aesthetic: restrained palette, subtle borders over heavy gradients,
  WCAG-AA contrast, keyboard-accessible, mobile-first.

## When done
```bash
npx tsc --noEmit && npm run build      # must pass
git add -A && git commit -m "..."      # on ui-reform branch
npx wrangler pages deploy out          # deploy to Cloudflare Pages (project: app-v5)
```
Old homepage `components/Main.js` is unused (kept as fallback) — safe to delete later.
