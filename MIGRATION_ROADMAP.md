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

## Deployment target

- Static export via Cloudflare Pages.
- Build command: `npm run build`
- Output directory: `out`
