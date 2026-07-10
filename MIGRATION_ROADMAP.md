# App v5 Migration Roadmap

## Current state

- Route parity scaffolded in Next.js (`pages/` mirrors app_v4 route paths).
- Core navigation migrated to Next router/link APIs (shim removed).
- Metadata stack fully migrated to Next `<Head>` (no `react-helmet-async` dependency).
- Static policy and guide pages copied to `public/`.

## Immediate checks

1. Visual parity check on homepage and hubs.
2. Calculator function parity for top-traffic pages:
   - `/loan-calculator`
   - `/income-tax-calculator`
   - `/sip-calculator`
   - `/us-mortgage-calculator`
   - `/eu-vat-calculator`
3. Verify static pages:
   - `/ads.txt`
   - `/methodology.html`
   - guide pages

## Hardening tasks

1. Add build-time sitemap/robots generation for v5.
2. Add CI build check (`npm run build`) and deploy preview.
3. Optionally migrate from `pages/` router to App Router for long-term Next.js alignment.

## Workflow internationalization (planned, 2026-07)

Goal: extend decision workflows (currently India-only: home loan readiness, buy vs rent, prepay vs invest, FD vs SIP, job offer, emergency fund, car ownership) to US/EU markets.

Approach: **market-specific pages sharing a common calculation engine** — NOT a country toggle on one page. Separate URLs rank for each market's search phrases and US/EU pages earn far higher ad RPM.

Key decisions:

1. Localize the decision, not the words. Each market gets its native framing:
   - FD vs SIP → US: CD vs index fund / HYSA vs brokerage
   - Prepay vs Invest → US: pay off mortgage early vs invest
   - Home Loan Readiness → US: mortgage affordability (DTI instead of FOIR)
2. Extract shared engine before building more workflows:
   - `components/workflow/*` → thin market-specific UI + copy
   - `utils/engines/*` → pure market-agnostic math (compounding, amortization, verdict thresholds), unit-tested
   - `utils/markets/in.js|us.js|...` → injected config (tax rules, currency, number formatting)
3. Anti-pattern to avoid: copy-pasting India components per market — verdict-logic bug fixes would need N edits.

Sequence:

1. Extract engine from existing workflows into `utils/engines/`.
2. Build next new workflows (Retirement Readiness, Break FD to Prepay Loan) on the engine from day one.
3. Port highest-RPM US variants first (mortgage payoff vs invest, retirement readiness).
4. EU last (per-country tax fragmentation, lower per-page volume).

## Deployment target

- Static export via Cloudflare Pages.
- Build command: `npm run build`
- Output directory: `out`
