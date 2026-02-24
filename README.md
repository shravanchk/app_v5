# Upaman App v5 (Next.js Migration)

This folder is a migration-safe Next.js version of app_v4.

## Goals

- Keep existing look and feel.
- Preserve existing URL paths for calculators/hubs.
- Migrate without changing app_v4 runtime behavior.

## What is migrated

- Shared components copied from app_v4 (`components/`).
- Shared styles copied (`styles/`).
- Shared utilities copied (`utils/`, `generated/`).
- Next pages created for all current calculator/workflow routes.
- Static trust/content files copied to `public/` (`ads.txt`, policy pages, guides, methodology, icons).

## Navigation status

- Core route navigation is now Next-native (`next/router` and `next/link`).
- No `react-router-dom` shim is required in this scaffold.

## Run locally

```bash
cd app_v5
npm install
npm run dev
```

## Build for static hosting

```bash
npm run build
```

The project is configured with `output: 'export'`, so static output is generated in `out/`.

## Cloudflare Pages (static)

- Build command: `npm run build`
- Output directory: `out`

## Next migration phases

1. Stabilize: verify all routes render and visual parity with app_v4.
2. SEO pass: move route-level metadata from `Helmet` to Next metadata APIs.
3. Performance pass: split heavy calculators and add route-level loading UX.
4. Content pass: keep guide/policy pages server-rendered and indexed.
