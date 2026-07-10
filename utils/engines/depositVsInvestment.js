// Deposit-vs-investment engine: compares a guaranteed interest-bearing
// deposit (interest taxed annually at the investor's marginal rate) against a
// market investment (taxed under capital-gains rules at redemption), on the
// same horizon and contribution pattern.
//
// India instance: FD/RD vs equity SIP. Future US instance: CD/HYSA vs index
// fund. All market-specific tax treatment comes from the market config; all
// UI copy lives in the consuming component.

const {
  effectiveAnnualYield,
  annualToMonthlyYield,
  fvOfMonthlyAtMonthlyRate,
  fvOfLumpSum
} = require('./growth');

// Guaranteed deposit path. Interest is taxed at the marginal rate (plus cess)
// on accrual every year, so the post-tax path compounds at a reduced yield
// rather than taking one hit at maturity.
// inputs: { mode: 'monthly'|'lumpsum', amount, years, ratePct, marginalRatePct }
const depositOutcome = (inputs, market) => {
  const { mode, amount, years, ratePct, marginalRatePct } = inputs;
  const months = Math.max(1, Math.round(years * 12));
  const grossYield = effectiveAnnualYield(ratePct, market.deposit.compoundingPerYear);
  const netYield = grossYield * (1 - (marginalRatePct / 100) * market.interestTax.cessMultiplier);

  const contributions = mode === 'monthly' ? amount * months : amount;
  const preTax =
    mode === 'monthly'
      ? fvOfMonthlyAtMonthlyRate(amount, annualToMonthlyYield(grossYield), months)
      : fvOfLumpSum(amount, grossYield, years);
  const postTax =
    mode === 'monthly'
      ? fvOfMonthlyAtMonthlyRate(amount, annualToMonthlyYield(netYield), months)
      : fvOfLumpSum(amount, netYield, years);

  return {
    contributions,
    preTax,
    postTax,
    tax: Math.max(0, preTax - postTax),
    grossYield,
    netYield
  };
};

// Market-investment path. Nothing is taxed while compounding; at redemption,
// gains are taxed under the market's capital-gains rules (long-term rate above
// the exemption once the horizon crosses the long-term threshold).
// inputs: { mode: 'monthly'|'lumpsum', amount, years, expectedReturnPct }
const investmentOutcome = (inputs, market) => {
  const { mode, amount, years, expectedReturnPct } = inputs;
  const { ltcgRate, ltcgExemption, stcgRate, longTermYears, cessMultiplier } = market.equityTax;
  const months = Math.max(1, Math.round(years * 12));
  const contributions = mode === 'monthly' ? amount * months : amount;
  const preTax =
    mode === 'monthly'
      ? fvOfMonthlyAtMonthlyRate(amount, expectedReturnPct / 100 / 12, months)
      : fvOfLumpSum(amount, expectedReturnPct / 100, years);

  const gains = Math.max(0, preTax - contributions);
  const isLongTerm = years >= longTermYears;
  const taxableGain = isLongTerm ? Math.max(0, gains - ltcgExemption) : gains;
  const tax = taxableGain * (isLongTerm ? ltcgRate : stcgRate) * cessMultiplier;

  return {
    contributions,
    preTax,
    gains,
    tax,
    postTax: preTax - tax,
    isLongTerm
  };
};

// Horizon-aware verdict. Returns a code plus the numbers the UI needs to
// phrase the reason; copy is deliberately not produced here because it is
// market-specific.
//
// Codes:
//   'deposit-short-horizon' — investment projects higher but horizon ≤ 3y
//   'deposit-wins'          — deposit ahead post-tax outright
//   'investment-clear-edge' — investment ahead >15% with a ≥5y horizon
//   'hybrid'                — outcomes close; split
const depositVsInvestmentVerdict = ({ depositPost, investPost, years }) => {
  const investEdge = depositPost > 0 ? investPost / depositPost - 1 : 0;

  if (years <= 3 && investPost > depositPost) {
    return { code: 'deposit-short-horizon', investEdge };
  }
  if (depositPost >= investPost) {
    return { code: 'deposit-wins', investEdge };
  }
  if (investEdge > 0.15 && years >= 5) {
    return { code: 'investment-clear-edge', investEdge };
  }
  return { code: 'hybrid', investEdge };
};

module.exports = {
  depositOutcome,
  investmentOutcome,
  depositVsInvestmentVerdict
};
