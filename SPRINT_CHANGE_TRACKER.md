# Upaman Sprint + Change Tracker

Last updated: 2026-03-07  
Project: `/Users/shravancherukuri/workspace/app_v5`

Purpose: Single source of truth for implementation scope, sprint status, and change history so work is trackable and repeatable.

---

## 1) Status Legend

- `PENDING` = planned, not started
- `IN_PROGRESS` = currently being implemented
- `DONE` = implemented and verified locally
- `DEPLOYED` = live on Cloudflare Pages
- `BLOCKED` = waiting on dependency/input

---

## 2) Current Strategy Baseline

- Positioning direction: `Decision Intelligence Tools`
- Product focus: decision-oriented finance tools and workflows
- Execution style: cluster-based rollout (not random tool additions)
- SEO model: hub-and-spoke internal linking + schema + E-E-A-T blocks

Reference archive: `FEEDBACK_ARCHIVE_2026-03-07.md`

---

## 3) Active Sprints

## Sprint 0: Foundation Hardening
Target: stabilize platform + trust layer + deployment reliability

| Item | Status | Notes |
|---|---|---|
| Next.js migration scaffold and route parity | DONE | Core pages and routes available |
| Legal/trust page layout unification | DONE | Shared `LegalPageLayout` in use |
| Add trust policies (ad/cookie/affiliate/corrections/publisher) | DEPLOYED | Added pages + footer/main links + crawl links |
| Fix local dev chunk/runtime issues | DONE | stale server root cause identified and fixed workflow documented |
| Cloudflare Pages deploy pipeline verification | DEPLOYED | `app-v5` project live on `upaman.com` |

## Sprint 1: Decision-First UX + SEO Core
Target: apply high-impact template and authority improvements on priority pages

| Item | Status | Notes |
|---|---|---|
| Reposition homepage copy to decision-intelligence framing | DONE | homepage hero heading/subheading updated to decision-first messaging |
| Add reusable E-E-A-T module (author/reviewer/sources/updated) | DONE | `components/calculator/EEATPanel.js` created and integrated in top pages |
| Add reusable schema helpers (`SoftwareApplication`, `FAQ`, `Breadcrumb`) | DONE | `utils/schema.js` and integration in target pages |
| Strengthen internal linking blocks ("Next step tools", related guides) | DONE | completed across sprint priority pages (tax/loan/regime/salary/sip/credit-card/irctc) |
| Apply answer-first layout standard on top priority pages | DONE | calculator-first flow retained with trust+insight+related sections on priority pages |

Priority pages for Sprint 1:
- `/income-tax-calculator`
- `/tax-regime-comparison`
- `/loan-calculator`
- `/buy-vs-rent-calculator`
- `/salary-calculator`
- `/credit-card-trap-calculator`
- `/sip-calculator`
- `/irctc-calculator`

## Sprint 2: US Decision Cluster Seed
Target: launch first US decision-intent cluster pages

| Item | Status | Notes |
|---|---|---|
| Create hub pages (`/career-finance`, `/housing`, `/debt`, `/financial-independence`) | PENDING | initial cluster navigation |
| Build first 4 US decision tools | PENDING | job offer, salary-after-tax-us, relocation-salary, layoff-runway |
| Add 1 guide per new hub (4 guides) | PENDING | SSR content with internal links |
| Add scenario comparison + charts to new tools | PENDING | engagement and differentiation |

## Sprint 3: Cluster Expansion + Monetization Readiness
Target: broaden authority and improve conversion/retention

| Item | Status | Notes |
|---|---|---|
| Expand to 8-10 US decision tools | PENDING | prioritize housing + debt tools |
| Add shareable result links and export options | PENDING | share/backlink potential |
| Add newsletter or lightweight lead capture | PENDING | retention baseline |
| Evaluate embeddable calculator MVP | PENDING | backlink acquisition experiment |

---

## 4) Change Log

| Date | Sprint | Change | Status | Verification | Deploy |
|---|---|---|---|---|---|
| 2026-03-07 | Sprint 0 | Added trust policy pages (`advertising`, `cookie`, `affiliate`, `corrections`, `publisher`) and linked globally | DEPLOYED | `npm run build` passed | Cloudflare Pages deploy completed |
| 2026-03-07 | Sprint 0 | Updated robots/sitemap with trust URLs | DEPLOYED | build output includes pages | Live on `upaman.com` |
| 2026-03-07 | Sprint 0 | Diagnosed local "missing required error components" loop; stale dev process fix | DONE | chunk URLs returned `200` after clean restart | N/A |
| 2026-03-07 | Planning | Created feedback archive and this tracker | DONE | file created in repo root | N/A |
| 2026-03-07 | Sprint 1 | Added reusable `EEATPanel` and schema helpers, then integrated on income tax / loan / tax-regime pages | DONE | `npm run build` passed after integrations | Pending |
| 2026-03-07 | Sprint 1 | Added breadcrumb schema and stronger next-step internal linking on income tax / loan / tax-regime pages | DONE | build output includes updated routes | Pending |
| 2026-03-07 | Sprint 1 | Integrated shared trust+schema pattern on salary / sip / credit-card-trap / irctc pages | DONE | `npm run build` passed after integrations | Pending |
| 2026-03-07 | Sprint 1 | Updated homepage hero messaging to "Decision-First Financial Calculators" with decision-focused subheading | DONE | code updated in `components/Main.js` | Pending |
| 2026-03-07 | Sprint 1 | Aligned homepage metadata titles (`title`, `og:title`, `twitter:title`) with updated H1 | DONE | metadata updated in `components/Main.js` | Pending |
| 2026-03-07 | Sprint 0 | Fixed recurring local chunk-missing runtime loop by removing auto-clean on `npm run dev`; added explicit `npm run dev:fresh` | DONE | `dev:fresh` returns `200` for `/` and `/_next/static/chunks/pages/_app.js` | N/A |

---

## 5) Implementation Rules (to avoid rework)

1. Do not remove existing indexed pages without redirects.
2. Prefer reusable components for repeated SEO/E-E-A-T sections.
3. Every major page change must include:
   - content structure check
   - internal link update
   - schema check
4. Update this file after each meaningful implementation batch.
5. Deploy only after local build passes.

---

## 6) Open Risks / Blockers

| Risk | Impact | Mitigation | Status |
|---|---|---|---|
| Over-expanding page count too quickly | quality dilution | launch in clusters/sprints only | OPEN |
| Mixed-topic authority dilution | weaker rankings | keep decision-finance as primary roadmap | OPEN |
| Local environment drift (Node version mismatch) | dev instability | use Node 20/22 as per engines | OPEN |

---

## 7) Next Planned Update Entry

When Sprint 1 starts, update:
- `Last updated` date
- Sprint 1 item statuses
- Change log rows with implemented pages/components
- Verification/deploy details
