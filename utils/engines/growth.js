// Market-agnostic time-value-of-money primitives shared by decision-workflow
// engines. Pure functions only — no market config, no UI copy.

// Nominal card rate (percent) with intra-year compounding → effective annual
// yield (decimal). E.g. 7% compounded quarterly → 0.0719.
const effectiveAnnualYield = (nominalRatePct, periodsPerYear) =>
  Math.pow(1 + nominalRatePct / 100 / periodsPerYear, periodsPerYear) - 1;

// Effective annual yield (decimal) → equivalent monthly yield (decimal).
const annualToMonthlyYield = (annualYield) => Math.pow(1 + annualYield, 1 / 12) - 1;

// Future value of an ordinary annuity (deposits at the end of each month),
// with the monthly rate given as a decimal.
const fvOfMonthlyAtMonthlyRate = (amount, monthlyRate, months) => {
  if (amount <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return amount * months;
  return amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

// Future value of monthly contributions with the annual rate given in percent
// and converted using the simple nominal/12 convention (matches SIP-calculator
// behaviour across the site).
const fvOfMonthlyAtAnnualPct = (amount, annualRatePct, months) =>
  fvOfMonthlyAtMonthlyRate(amount, annualRatePct / 100 / 12, months);

// Future value of a lump sum at an effective annual yield (decimal).
const fvOfLumpSum = (amount, annualYield, years) => amount * Math.pow(1 + annualYield, years);

// Standard reducing-balance EMI.
const emiForLoan = (principal, annualRatePct, months) => {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const growth = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * growth) / (growth - 1);
};

// Month-by-month loan simulation with an optional fixed extra payment.
// Mirrors the long-standing workflow behaviour: with no extra payment the
// simulation stops at maxMonths; with an extra payment it runs to closure
// (bounded at maxMonths + 240 as a safety valve).
const simulateLoan = (principal, annualRatePct, baselineEmi, extraPayment = 0, maxMonths = 0) => {
  const monthlyRate = annualRatePct / 100 / 12;
  let outstanding = principal;
  let monthsUsed = 0;
  let totalInterest = 0;

  while (outstanding > 0.01 && monthsUsed < maxMonths + 240) {
    const interest = outstanding * monthlyRate;
    const payable = outstanding + interest;
    const payment = Math.min(payable, baselineEmi + extraPayment);
    const principalPaid = Math.max(0, payment - interest);

    outstanding = Math.max(0, outstanding - principalPaid);
    totalInterest += interest;
    monthsUsed += 1;

    if (maxMonths > 0 && monthsUsed >= maxMonths && extraPayment === 0) {
      break;
    }
  }

  return { monthsUsed, totalInterest, outstanding };
};

module.exports = {
  effectiveAnnualYield,
  annualToMonthlyYield,
  fvOfMonthlyAtMonthlyRate,
  fvOfMonthlyAtAnnualPct,
  fvOfLumpSum,
  emiForLoan,
  simulateLoan
};
