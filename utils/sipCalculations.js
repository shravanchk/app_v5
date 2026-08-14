// SIP maths, kept in one place so the calculator's tabs cannot drift apart.
//
// Every function here uses the annuity-due convention: a SIP instalment is
// debited at the START of the month, so each one earns a full extra period of
// growth. This is the convention the SIP tab has always used, the one the
// embeddable widget documents, and the one that matches how Indian SIP
// mandates actually debit.
//
// The goal and comparison tabs previously used an ordinary annuity (no
// trailing (1 + i) term), which made the same inputs disagree by ~1% between
// tabs on the same page.

const monthlyRateOf = (annualPercent) => annualPercent / 100 / 12;

// Future value of a level monthly contribution.
const sipFutureValue = (monthlyAmount, annualPercent, years) => {
  const i = monthlyRateOf(annualPercent);
  const n = Math.round(years * 12);
  if (n <= 0 || monthlyAmount <= 0) return 0;
  if (i === 0) return monthlyAmount * n;
  return (monthlyAmount * (Math.pow(1 + i, n) - 1) * (1 + i)) / i;
};

// The monthly contribution needed to reach `target` — the inverse of the above.
const sipForTarget = (target, annualPercent, years) => {
  const i = monthlyRateOf(annualPercent);
  const n = Math.round(years * 12);
  if (n <= 0 || target <= 0) return 0;
  if (i === 0) return target / n;
  return (target * i) / ((Math.pow(1 + i, n) - 1) * (1 + i));
};

// Future value when the contribution steps up by a fixed percentage each year.
// Returned per-year so the calculator can chart the build-up.
const stepUpSipSchedule = (monthlyAmount, annualPercent, years, stepUpPercent = 0) => {
  const i = monthlyRateOf(annualPercent);
  const schedule = [];
  let futureValue = 0;
  let totalInvestment = 0;
  let current = monthlyAmount;

  for (let year = 1; year <= years; year += 1) {
    let yearlyInvestment = 0;
    for (let month = 1; month <= 12; month += 1) {
      totalInvestment += current;
      yearlyInvestment += current;
      futureValue = (futureValue + current) * (1 + i);
    }
    if (stepUpPercent > 0 && year < years) current *= 1 + stepUpPercent / 100;
    schedule.push({
      year,
      yearlyInvestment: Math.round(yearlyInvestment),
      totalInvestment: Math.round(totalInvestment),
      futureValue: Math.round(futureValue),
      returns: Math.round(futureValue - totalInvestment)
    });
  }

  return { futureValue, totalInvestment, finalMonthlyAmount: current, schedule };
};

// Lumpsum grown annually, for the SIP-vs-lumpsum comparison.
const lumpsumFutureValue = (amount, annualPercent, years) =>
  amount * Math.pow(1 + annualPercent / 100, years);

module.exports = {
  monthlyRateOf,
  sipFutureValue,
  sipForTarget,
  stepUpSipSchedule,
  lumpsumFutureValue
};
