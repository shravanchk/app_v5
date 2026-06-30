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
- **Known issue**: `AgeCalculator` logs a dev-only React hydration warning (renders live current-date
  values during render → static prerender ≠ client). Pre-existing, not from the reskin. Renders fine.

### Other UI-reform items (from session 1, still open)
1. **Colourise homepage Start-Here + Workflow card icons** (`components/home/StartHere.tsx`,
   `WorkflowCards.tsx`) using the tint map, for consistency with the calculator grid.
4. ~~**Workflow pages** (home-loan-readiness, rent-vs-buy, prepay-vs-invest, job-offer,
   emergency-fund, car-ownership) — onto the new design + dark mode.~~ **DONE** — all 6
   migrated to `CalcLayout` + new shared `components/workflow/WorkflowKit.tsx` (`WorkflowSteps`,
   `HowToNote`, `DecisionBanner`, `Panel`/`PanelRow`, `ActionList`). Decision logic now returns
   a `tone` (`positive`/`warning`/`danger`/`info`) instead of a hex `color`. Field tips folded
   into `NumberField`/`SelectField` `hint`s. Logic/JSON-LD/EEAT/SearchLandingSections preserved.
   `HomeButton` dropped. Verified tsc + build + dark mode in preview.
5. **Guide pages**: make `components/guides/GuidePageLayout.js` dark-aware Tailwind (currently
   light inline styles). Also the programmatic `pages/tax-on-salary/[slug].js` + `index.js`.
6. **Create `/workflows` and `/guides` index pages** — the navbar's Workflows/Guides/Tools items
   currently point to homepage anchors (`/#workflows`, `/#guides`). Build real index pages and
   repoint the nav (`components/home/Navbar.tsx`).
7. **Legal pages**: verify `components/legal/LegalPageLayout.js` dark mode.
8. Final dark-mode audit across all inner pages.
9. **HowTo SEO (queued)**: only `AgeCalculator.js` currently emits `HowTo` JSON-LD. ~30 calculator
   pages have neither a visible "How to use this calculator" step list nor HowTo structured data.
   Plan: shared `HowToSection` component (numbered, dark-aware) + `buildHowToSchema` helper (copy
   AgeCalculator's pattern), then add 3-6 concrete steps per calculator. Workflows already show
   visible how-to notes (could also get HowTo schema).

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
