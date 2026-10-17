const test = require('node:test');
const assert = require('node:assert/strict');
const { SALARY_SYSTEMS, computeEuropeanSalary } = require('../utils/europeanSalaryCalculations');

const closeTo = (actual, expected, tolerance = 1) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} was not within ${tolerance} of ${expected}`
  );
};

// The bug this file exists to prevent: Belgium (and Austria, Sweden) applied the
// progressive bands straight to gross salary, with no social-security deduction
// from the taxable base, no professional-expenses allowance and no tax-free sum.
// On €60,000 that model returned €28,102 net (53.2%) against a real-world figure
// near €37,000 — a €750/month error on a page presented as a planning estimate.

test('Belgium deducts social security before anything is taxed', () => {
  const r = computeEuropeanSalary('BE', 60000);

  closeTo(r.breakdown.socialSecurity, 60000 * 0.1307);
  // Taxable = gross - RSZ - capped professional expenses.
  closeTo(r.breakdown.taxableIncome, 60000 - 60000 * 0.1307 - 6070);
});

test('Belgium caps the flat-rate professional expenses at the 2026 ceiling', () => {
  // 30% of income after social security exceeds the cap well before €30,000.
  const high = computeEuropeanSalary('BE', 60000);
  closeTo(high.breakdown.taxableIncome, 60000 * 0.8693 - 6070);

  // Below the cap the 30% rate binds instead.
  const low = computeEuropeanSalary('BE', 20000);
  const afterSocial = 20000 * 0.8693;
  closeTo(low.breakdown.taxableIncome, afterSocial - afterSocial * 0.3);
});

test('Belgium treats the tax-free sum as a 25% credit, not a zero-rate band', () => {
  const r = computeEuropeanSalary('BE', 60000);

  closeTo(r.breakdown.taxCredits, 11180 * 0.25);
  closeTo(r.breakdown.incomeTax, r.breakdown.grossTax - r.breakdown.taxCredits);
});

test('Belgium adds the communal surcharge on top of federal tax', () => {
  const r = computeEuropeanSalary('BE', 60000);

  closeTo(r.breakdown.municipalTax, r.breakdown.incomeTax * 0.07);
  closeTo(
    r.breakdown.totalDeductions,
    r.breakdown.socialSecurity + r.breakdown.incomeTax + r.breakdown.municipalTax
  );
});

test('Belgium never lets the tax-free credit exceed the tax due', () => {
  // Taxable income here is far below the tax-free sum, so the credit is
  // clamped and tax lands at exactly zero rather than going negative.
  const r = computeEuropeanSalary('BE', 12000);

  assert.equal(r.breakdown.incomeTax, 0);
  assert.equal(r.breakdown.municipalTax, 0);
  closeTo(r.breakdown.totalDeductions, 12000 * 0.1307);
});

test('Belgian net pay lands in the published real-world range', () => {
  // Cross-checked against Belgian payroll calculators for a single employee
  // with no dependants. The werkbonus (excluded) explains the remaining gap at
  // the bottom of the range, so only the mid and upper points are asserted.
  const cases = [
    [30000, 1930],
    [45000, 2540],
    [60000, 3100],
    [80000, 3800]
  ];

  for (const [gross, expectedMonthly] of cases) {
    const r = computeEuropeanSalary('BE', gross);
    closeTo(r.netMonthly, expectedMonthly, 60);
  }
});

test('Belgian effective rate rises monotonically with gross salary', () => {
  const rates = [20000, 30000, 45000, 60000, 80000, 120000]
    .map((g) => computeEuropeanSalary('BE', g).effectiveRate);

  for (let i = 1; i < rates.length; i += 1) {
    assert.ok(rates[i] > rates[i - 1], `effective rate fell between step ${i - 1} and ${i}`);
  }
});

// Austria's old model applied 2023 bands to gross, ran social security with no
// contribution ceiling, and ignored the 13th/14th salary entirely. On EUR 60,000
// that returned EUR 31,705 net (47.2%) against a real figure near EUR 41,000 --
// a EUR 780/month error, the largest in this engine.

test('Austria splits Jahresbrutto across 14 payments', () => {
  const r = computeEuropeanSalary('AT', 60000);
  const perPayment = 60000 / 14;

  // Running pay is 12 payments; the 13th and 14th are Sonderzahlungen.
  closeTo(r.breakdown.taxableIncome, perPayment * 12 - perPayment * 12 * 0.1812 - 132);
  assert.ok(r.breakdown.specialPaymentTax > 0, 'no tax computed on the 13th/14th');
});

test('Austria taxes the 13th/14th at 6% above the Freibetrag, not at the marginal rate', () => {
  const r = computeEuropeanSalary('AT', 60000);
  const specialPay = (60000 / 14) * 2;
  const specialTaxable = specialPay - specialPay * 0.1712;

  closeTo(r.breakdown.specialPaymentTax, (specialTaxable - 620) * 0.06);
  // The same money inside the progressive tariff would cost far more: this
  // salary's marginal band is 40%.
  assert.ok(
    r.breakdown.specialPaymentTax < specialTaxable * 0.4,
    'Sonderzahlungen were taxed at the marginal rate'
  );
});

test('Austria leaves Sonderzahlungen untaxed below the Freigrenze', () => {
  // A small salary keeps the Jahressechstel under EUR 2,447.
  const r = computeEuropeanSalary('AT', 16000);

  assert.equal(r.breakdown.specialPaymentTax, 0);
});

test('Austria caps social security at the Hoechstbeitragsgrundlage', () => {
  const r = computeEuropeanSalary('AT', 120000);

  // Running pay is capped monthly at EUR 6,930; the 13th/14th at EUR 13,860.
  const cappedRunning = 6930 * 12 * 0.1812;
  const cappedSpecial = 13860 * 0.1712;
  closeTo(r.breakdown.socialSecurity, cappedRunning + cappedSpecial);

  // Without the ceiling the contribution would keep climbing with salary.
  const uncapped = 120000 * 0.1812;
  assert.ok(r.breakdown.socialSecurity < uncapped, 'ceiling was not applied');
});

test('Austria deducts social security before the tariff applies', () => {
  const r = computeEuropeanSalary('AT', 45000);
  const runningPay = (45000 / 14) * 12;

  // Taxable income is running pay less its own social security and the
  // Werbungskostenpauschale -- never the gross figure.
  closeTo(r.breakdown.taxableIncome, runningPay - runningPay * 0.1812 - 132);
  assert.ok(r.breakdown.taxableIncome < runningPay);
});

test('Austria applies the raised Verkehrsabsetzbetrag only at low income', () => {
  const low = computeEuropeanSalary('AT', 21000);
  const mid = computeEuropeanSalary('AT', 60000);

  closeTo(low.breakdown.taxCredits, 853);
  closeTo(mid.breakdown.taxCredits, 496);
});

test('Austrian net pay lands in the published real-world range', () => {
  // Cross-checked against Austrian Brutto-Netto-Rechner for an Angestellte(r)
  // outside Vienna, single, no children. Compared per regular month (annual/14),
  // which is what actually reaches the account eleven months of the year.
  const cases = [
    [35000, 1898],
    [45000, 2328],
    [60000, 2934],
    [80000, 3695]
  ];

  for (const [gross, expectedPerPayment] of cases) {
    const r = computeEuropeanSalary('AT', gross);
    closeTo(r.netAnnual / 14, expectedPerPayment, 60);
  }
});

test('Austrian effective rate rises monotonically with gross salary', () => {
  const rates = [25000, 35000, 45000, 60000, 80000, 120000]
    .map((g) => computeEuropeanSalary('AT', g).effectiveRate);

  for (let i = 1; i < rates.length; i += 1) {
    assert.ok(rates[i] > rates[i - 1], `effective rate fell between step ${i - 1} and ${i}`);
  }
});

test('every configured country returns a coherent result', () => {
  for (const code of Object.keys(SALARY_SYSTEMS)) {
    const r = computeEuropeanSalary(code, 60000);

    assert.ok(r, `${code} returned no result`);
    assert.ok(r.netAnnual > 0 && r.netAnnual < 60000, `${code} net out of range`);
    closeTo(r.netAnnual, 60000 - r.breakdown.totalDeductions);
    closeTo(r.netMonthly, r.netAnnual / 12);
    closeTo(r.effectiveRate, (r.breakdown.totalDeductions / 60000) * 100, 0.01);
  }
});

// Sweden's old model charged full municipal tax on gross with no grundavdrag
// and no jobbskatteavdrag, then took the 7% pension fee on top as if it were a
// cost -- when a skattereduktion refunds 100% of it. On 400,000 kr that gave a
// 39.1% effective rate against a real ~20%: a 6,400 kr/month error.
//
// The grundavdrag figures below are taken from the worked examples in
// Skatteverket's SKV 433 (2026, utgava 36), so they pin the implementation to
// the official spec rather than to our own arithmetic.

test('Sweden matches the grundavdrag worked examples in SKV 433', () => {
  // Example 1: income 90,000 -> grundavdrag 31,400 (rounded up to a whole hundred).
  const low = computeEuropeanSalary('SE', 90000);
  closeTo(low.breakdown.taxableIncome, 90000 - 31400);

  // Example 2: income 240,000 -> grundavdrag 40,000.
  const mid = computeEuropeanSalary('SE', 240000);
  closeTo(mid.breakdown.taxableIncome, 240000 - 40000);
});

test('Sweden tapers the grundavdrag to its floor at high income', () => {
  // Above 7.88 prisbasbelopp the allowance sits at a flat 0.293 PBB = 17,345.60,
  // rounded up to 17,400.
  const r = computeEuropeanSalary('SE', 700000);

  closeTo(r.breakdown.taxableIncome, 700000 - 17400);
});

test('Sweden refunds the allmaen pensionsavgift in full', () => {
  const r = computeEuropeanSalary('SE', 400000);

  // The 7% fee is charged and then credited back, so it must not show up as a
  // net cost anywhere in the total.
  closeTo(r.breakdown.socialSecurity, 28000);
  assert.ok(r.breakdown.taxCredits > r.breakdown.socialSecurity);
  closeTo(
    r.breakdown.totalDeductions,
    r.breakdown.municipalTax + r.breakdown.stateTax + r.breakdown.socialSecurity - r.breakdown.taxCredits
  );
});

test('Sweden caps the pension fee at 8.07 inkomstbasbelopp', () => {
  const r = computeEuropeanSalary('SE', 1000000);

  // 7% of the 673,038 ceiling, rounded: 47,100 -- not 7% of a million.
  closeTo(r.breakdown.socialSecurity, 47100);
});

test('Sweden stops raising the jobbskatteavdrag past its 2026 ceiling', () => {
  const high = computeEuropeanSalary('SE', 800000);
  const higher = computeEuropeanSalary('SE', 1000000);

  // The phase-out was removed for 2026, so the credit plateaus rather than
  // tapering away -- both salaries sit on the flat top band.
  closeTo(high.breakdown.taxCredits, higher.breakdown.taxCredits);
});

test('Sweden charges state tax only above the skiktgraens', () => {
  const below = computeEuropeanSalary('SE', 600000);
  const above = computeEuropeanSalary('SE', 800000);

  assert.equal(below.breakdown.stateTax, 0);
  // 20% of taxable income above 643,000.
  closeTo(above.breakdown.stateTax, (800000 - 17400 - 643000) * 0.2);
});

test('Swedish net pay lands in the published real-world range', () => {
  // Cross-checked against Swedish net salary calculators for an employee under
  // 66, single, at the SCB average municipal rate.
  const cases = [
    [300000, 20437],
    [400000, 26715],
    [600000, 38489],
    [1000000, 55369]
  ];

  for (const [gross, expectedMonthly] of cases) {
    const r = computeEuropeanSalary('SE', gross);
    closeTo(r.netMonthly, expectedMonthly, 700);
  }
});

test('Swedish effective rate rises monotonically with gross salary', () => {
  const rates = [200000, 300000, 400000, 500000, 600000, 800000, 1000000]
    .map((g) => computeEuropeanSalary('SE', g).effectiveRate);

  for (let i = 1; i < rates.length; i += 1) {
    assert.ok(rates[i] > rates[i - 1], `effective rate fell between step ${i - 1} and ${i}`);
  }
});

test('per-payment net reflects how many times a year a country pays', () => {
  const at = computeEuropeanSalary('AT', 60000);
  const be = computeEuropeanSalary('BE', 60000);

  assert.equal(at.paymentsPerYear, 14);
  closeTo(at.netPerPayment, at.netAnnual / 14);
  // The averaged monthly figure is still available, and is larger -- showing it
  // as "what you get each month" would overstate a regular Austrian payslip.
  assert.ok(at.netMonthly > at.netPerPayment);

  assert.equal(be.paymentsPerYear, 12);
  closeTo(be.netPerPayment, be.netMonthly);
});

test('invalid input returns null rather than NaN', () => {
  assert.equal(computeEuropeanSalary('BE', 0), null);
  assert.equal(computeEuropeanSalary('BE', -1000), null);
  assert.equal(computeEuropeanSalary('XX', 60000), null);
});

// France had the same order-of-operations bug as Belgium, plus a phantom 2.4%
// unemployment charge: on €60,000 it returned €36,116 net against ~€41,100.

test('France taxes net imposable after the 10% allowance, not gross', () => {
  const r = computeEuropeanSalary('FR', 60000);
  const pass = SALARY_SYSTEMS.FR.pass;
  const csgBase = 60000 * 0.9825;
  const deductible = pass * (6.9 + 4.01) / 100 + 60000 * 0.004 +
    (60000 - pass) * 0.0972 + 60000 * 0.0014 + csgBase * 0.068;

  closeTo(r.breakdown.socialSecurity, deductible + csgBase * 0.029);
  closeTo(r.breakdown.taxableIncome, (60000 - deductible) * 0.9);
  closeTo(r.netAnnual, 41149, 5);
});

test('France charges employees no unemployment contribution', () => {
  // Below the PASS: pension 6.9 + 0.4 + AGIRC 4.01, CSG/CRDS 9.7 on 98.25%.
  const r = computeEuropeanSalary('FR', 30000);
  closeTo(r.breakdown.socialSecurity, 30000 * (6.9 + 0.4 + 4.01) / 100 + 30000 * 0.9825 * 0.097);
});

test('France applies the décote to modest earners only', () => {
  const low = computeEuropeanSalary('FR', 25000);
  assert.ok(low.breakdown.taxCredits > 0);
  closeTo(low.breakdown.incomeTax, low.breakdown.grossTax - (897 - low.breakdown.grossTax * 0.4525));

  const high = computeEuropeanSalary('FR', 60000);
  assert.equal(high.breakdown.taxCredits, undefined);
});
