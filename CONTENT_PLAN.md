# Upaman Content Plan — Organic Traffic & Monetization

**Goal:** Build the written content layer that earns organic search traffic, qualifies the
site for AdSense, and opens affiliate revenue. The calculators are commodities; **guides are
the growth engine.** Each guide targets a real search query and links into a calculator.

**Owner:** Shravan · **Created:** 2026-06-28 · **Format:** all guides use `GuidePageLayout`
(same as the 4 FY 2026-27 tax guides already shipped).

---

## How to read this

- **Priority** — P1 = write first (best ROI / momentum), P2 = next, P3 = backlog.
- **Intent** — *Informational* (explain), *Commercial* (compare to decide), *Transactional* (ready to act → best for affiliates).
- **$$$** — monetization potential: 💰💰💰 strong affiliate, 💰💰 affiliate/AdSense, 💰 AdSense only.
- **Calc** — the existing calculator this guide links to (the hub).

**Cadence target:** 2–4 guides/week. **Measure in quarters.** New pages take 2–6 months to rank.

---

## ⚠️ Do this FIRST — clean up before adding

Before publishing new guides, resolve the legacy duplicates or they'll cannibalize rankings:

| Legacy file (`public/*.html`) | Action |
|---|---|
| `guide-ctc-inhand-breakdown.html` | Rewrite as `/guides/ctc-to-in-hand-salary` (item #1), then 301 the .html → new URL |
| `guide-ppf-vs-sip-choice.html` | Rewrite as `/guides/sip-vs-ppf` (item #13), 301 old → new |
| `guide-sip-step-up-planning.html` | Rewrite as `/guides/step-up-sip-explained` (item #10), 301 |
| `guide-credit-card-minimum-due-trap.html` | Rewrite as `/guides/credit-card-minimum-due-trap` (item #19), 301 |
| `guide-income-tax-regime-choice.html` | Superseded by the shipped `old-vs-new-regime-breakeven` guide → 301 old → that |
| `guide-emi-prepayment-strategy.html` | Rewrite as `/guides/home-loan-prepayment-vs-investment` (item #15), 301 |
| `guide-prepay-vs-invest-decision.html` | Merge into item #15, 301 |
| `guide-ppf-vs-sip-choice.html` | (see above) |
| `guide-irctc-booking-strategy.html` | Rewrite as `/guides/irctc-tatkal-booking-tips` (P3), 301 |
| `guide-emergency-fund-readiness.html` | Rewrite as `/guides/how-much-emergency-fund` (P2), 301 |

**Also:** confirm Google Search Console is set up and the sitemap is submitted, and simplify
`robots.txt` (it manually Allow-lists every URL and is missing the 4 new guides).

---

## Cluster A — India Income Tax & Salary  *(highest momentum + biggest audience)*

Already shipped: `india-income-tax-2026-27`, `standard-deduction-fy-2026-27`,
`tax-on-12-lakh-salary-fy-2026-27`, `marginal-relief-new-regime-fy-2026-27`,
`old-vs-new-regime-breakeven-fy-2026-27`.

| # | Guide title | Target keyword | Intent | Calc | $$$ | Pri |
|---|---|---|---|---|---|---|
| 1 | ✅ CTC to In-Hand Salary: How to Calculate (FY 2026-27) — `/guides/ctc-to-in-hand-salary` (shipped, legacy .html 301'd) | ctc to in hand salary | Informational | salary-calculator | 💰 | **P1** |
| 2 | Is ₹X LPA a Good Salary in India? (template: 10/15/25 LPA) | is 15 lpa good salary india | Informational | salary-calculator | 💰 | **P1** |
| 3 | HRA Exemption: How It's Calculated (with examples) | hra exemption calculation | Informational | income-tax-calculator | 💰💰 | **P1** |
| 4 | Section 80C: Full Investment List FY 2026-27 | 80c deduction list | Commercial | tax-regime-comparison | 💰💰💰 | **P1** |
| 5 | New Tax Regime: Which Deductions Are Still Allowed | new tax regime deductions | Informational | tax-regime-comparison | 💰 | P2 |
| 6 | TDS on Salary: How Much Is Cut and Why | tds on salary | Informational | salary-calculator | 💰 | P2 |
| 7 | How to Save Tax on a ₹20 Lakh Salary (FY 2026-27) | how to save tax on 20 lakh salary | Transactional | tax-regime-comparison | 💰💰💰 | P2 |

## Cluster B — Investing: SIP / PPF / Mutual Funds  *(strong affiliate: broking signups)*

Already shipped: none in `/guides/`. Legacy `.html` to migrate (see cleanup table).

| # | Guide title | Target keyword | Intent | Calc | $$$ | Pri |
|---|---|---|---|---|---|---|
| 8 | SIP vs Lumpsum: Which Is Better in 2026? | sip vs lumpsum | Commercial | sip-calculator | 💰💰💰 | **P1** |
| 9 | How Much SIP to Invest for ₹1 Crore | sip for 1 crore | Transactional | sip-calculator | 💰💰💰 | **P1** |
| 10 | Step-Up SIP Explained (with worked example) | step up sip | Informational | sip-calculator | 💰💰 | P2 |
| 11 | PPF vs ELSS vs NPS: Where to Put Tax-Saving Money | ppf vs elss | Commercial | ppf-calculator | 💰💰💰 | P2 |
| 12 | PPF Withdrawal & Loan Rules (2026) | ppf withdrawal rules | Informational | ppf-calculator | 💰 | P2 |
| 13 | SIP vs PPF: Which Should You Choose? | sip vs ppf | Commercial | sip-calculator | 💰💰💰 | P2 |
| 14 | Best SIP Amount for Beginners (₹500 to ₹5,000) | how much to start sip | Transactional | sip-calculator | 💰💰💰 | P3 |

## Cluster C — Loans & EMI  *(affiliate: loan aggregators)*

Already shipped: `how-much-emi-is-safe`. Legacy `.html` to migrate.

| # | Guide title | Target keyword | Intent | Calc | $$$ | Pri |
|---|---|---|---|---|---|---|
| 15 | Home Loan Prepayment vs Investing: Which Wins? | home loan prepayment vs sip | Commercial | prepay-vs-invest-workflow | 💰💰 | **P1** |
| 16 | How Is EMI Calculated? (Reducing-Balance Explained) | how is emi calculated | Informational | loan-calculator | 💰 | P2 |
| 17 | Home Loan Eligibility Based on Your Salary | home loan eligibility salary | Transactional | home-loan-readiness-workflow | 💰💰💰 | P2 |
| 18 | Should You Prepay Your Home Loan? | should i prepay home loan | Commercial | prepay-vs-invest-workflow | 💰💰 | P3 |

## Cluster D — Credit Cards  *(HIGHEST affiliate value in finance)*

Already shipped: none. Legacy `.html` to migrate.

| # | Guide title | Target keyword | Intent | Calc | $$$ | Pri |
|---|---|---|---|---|---|---|
| 19 | The Credit Card Minimum-Due Trap, Explained | credit card minimum due trap | Informational | credit-card-trap-calculator | 💰💰💰 | **P1** |
| 20 | How Credit Card Interest Is Calculated in India | credit card interest calculation | Informational | credit-card-trap-calculator | 💰💰💰 | P2 |
| 21 | How to Get Out of Credit Card Debt (step by step) | how to pay off credit card debt | Transactional | credit-card-analyzer | 💰💰💰 | P2 |
| 22 | Credit Card vs Personal Loan for a Big Purchase | credit card vs personal loan | Commercial | loan-calculator | 💰💰💰 | P3 |

## Cluster E — GST & Everyday India

Already shipped: none.

| # | Guide title | Target keyword | Intent | Calc | $$$ | Pri |
|---|---|---|---|---|---|---|
| 23 | How to Calculate GST (with examples) | how to calculate gst | Informational | gst-calculator | 💰 | P2 |
| 24 | GST Inclusive vs Exclusive: What's the Difference? | gst inclusive meaning | Informational | gst-calculator | 💰 | P3 |

## Cluster F — US Finance  *(strategic: US AdSense RPM is 10–20× India)*

Already shipped: none. **This cluster matters disproportionately for AdSense income** — even
modest US traffic earns far more per visit than India traffic.

| # | Guide title | Target keyword | Intent | Calc | $$$ | Pri |
|---|---|---|---|---|---|---|
| 25 | Is a 7% Mortgage Rate Good in 2026? | is 7 percent mortgage rate good | Informational | us-mortgage-calculator | 💰💰 | **P1** |
| 26 | How Much House Can I Afford on My Salary? | how much house can i afford | Transactional | us-mortgage-calculator | 💰💰💰 | **P1** |
| 27 | 401(k) Contribution Limits 2026 (annual refresh) | 401k contribution limit 2026 | Informational | us-401k-calculator | 💰💰 | P2 |
| 28 | When Does Refinancing Actually Make Sense? | is it worth refinancing | Commercial | us-refinance-calculator | 💰💰💰 | P2 |
| 29 | 15-Year vs 30-Year Mortgage: Which to Pick | 15 vs 30 year mortgage | Commercial | us-mortgage-calculator | 💰💰 | P3 |
| 30 | How to Pay Off Credit Card Debt Fast (US) | how to pay off credit card debt fast | Transactional | us-credit-card-payoff-calculator | 💰💰💰 | P3 |

---

## Suggested first sprint (the P1 ten)

Write these ten first — they combine momentum, traffic, and money:

1. CTC to In-Hand Salary (#1) — huge India volume, you have the calculator
2. Section 80C Investment List (#4) — high volume + ELSS affiliate
3. SIP vs Lumpsum (#8) — broking affiliate
4. How Much SIP for ₹1 Crore (#9) — broking affiliate
5. Credit Card Minimum-Due Trap (#19) — credit card affiliate (highest payout)
6. Home Loan Prepayment vs Investing (#15) — also clears a legacy duplicate
7. HRA Exemption (#3) — high India volume
8. Is ₹X LPA a Good Salary (#2) — high India volume, easy to rank
9. Is a 7% Mortgage Rate Good (#25) — opens the high-RPM US cluster
10. How Much House Can I Afford (#26) — high US intent + affiliate

While writing these, retire the matching legacy `.html` files with 301 redirects.

---

## Monetization sequencing

1. **Now → month 3:** publish P1 + P2 guides, add affiliate links (broking, credit cards, loan
   aggregators) inside relevant guides. Affiliate income can start *before* AdSense approval.
2. **Month 3–6:** once ~25 guides are indexed and getting impressions in Search Console,
   apply for AdSense. The US cluster is what makes AdSense worthwhile.
3. **Ongoing:** refresh the FY-dated guides each April (tax year change) — recurring traffic spikes.
