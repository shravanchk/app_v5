// Retirement-readiness engine: compares the corpus a saver is on track to
// build by retirement against the corpus their lifestyle actually requires,
// on user-supplied return/inflation assumptions.
//
// Deliberately tax-light: account-level taxation (EPF/NPS, 401(k)/IRA,
// pension wrappers) varies by market and account type, so returns and
// expenses are treated as the user's post-tax assumptions. Market configs
// supply defaults and copy only; the math is market-agnostic.

const { fvOfLumpSum } = require('./growth');

// PV of a growing annuity-due: first withdrawal happens at retirement day 1,
// withdrawals grow at g (inflation) while the remaining corpus earns r.
// PV = E * (1 - x^n) / (1 - x) with x = (1+g)/(1+r); E * n when r == g.
const corpusForGrowingWithdrawals = (firstYearExpense, annualReturnPct, inflationPct, years) => {
  if (firstYearExpense <= 0 || years <= 0) return 0;
  const x = (1 + inflationPct / 100) / (1 + annualReturnPct / 100);
  if (Math.abs(1 - x) < 1e-9) return firstYearExpense * years;
  return firstYearExpense * ((1 - Math.pow(x, years)) / (1 - x));
};

// Future value of monthly savings with an annual step-up on the contribution.
// End-of-month deposits at the site-wide nominal/12 convention; reduces to the
// ordinary-annuity closed form when stepUpPct is 0.
const savingsFvWithStepUp = (monthly, annualRatePct, months, stepUpPct = 0) => {
  if (monthly <= 0 || months <= 0) return 0;
  const i = annualRatePct / 100 / 12;
  let value = 0;
  for (let m = 0; m < months; m += 1) {
    value = value * (1 + i) + monthly * Math.pow(1 + stepUpPct / 100, Math.floor(m / 12));
  }
  return value;
};

// Ordinary-annuity FV factor: what one currency unit per month grows to.
const monthlyAnnuityFactor = (annualRatePct, months) => {
  const i = annualRatePct / 100 / 12;
  if (i === 0) return months;
  return (Math.pow(1 + i, months) - 1) / i;
};

// inputs: { currentAge, retireAge, lifeExpectancy, monthlyExpenses,
//           inflationPct, preRetReturnPct, postRetReturnPct,
//           currentCorpus, monthlySaving, stepUpPct }
const assessRetirementReadiness = (inputs) => {
  const {
    currentAge,
    retireAge,
    lifeExpectancy,
    monthlyExpenses,
    inflationPct,
    preRetReturnPct,
    postRetReturnPct,
    currentCorpus,
    monthlySaving,
    stepUpPct
  } = inputs;

  const yearsToRetire = Math.max(1, retireAge - currentAge);
  const retirementYears = Math.max(1, lifeExpectancy - retireAge);
  const monthsToRetire = yearsToRetire * 12;

  const monthlyExpenseAtRetirement = monthlyExpenses * Math.pow(1 + inflationPct / 100, yearsToRetire);
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  const requiredCorpus = corpusForGrowingWithdrawals(
    annualExpenseAtRetirement,
    postRetReturnPct,
    inflationPct,
    retirementYears
  );

  const projectedFromCorpus = fvOfLumpSum(currentCorpus, preRetReturnPct / 100, yearsToRetire);
  const projectedFromSavings = savingsFvWithStepUp(monthlySaving, preRetReturnPct, monthsToRetire, stepUpPct);
  const projectedCorpus = projectedFromCorpus + projectedFromSavings;

  const readinessRatio = requiredCorpus > 0 ? projectedCorpus / requiredCorpus : 1;
  const shortfall = Math.max(0, requiredCorpus - projectedCorpus);
  const surplus = Math.max(0, projectedCorpus - requiredCorpus);
  // Flat extra amount (no step-up) that closes the shortfall by retirement.
  const extraMonthlyNeeded = shortfall > 0 ? shortfall / monthlyAnnuityFactor(preRetReturnPct, monthsToRetire) : 0;

  // What the projected corpus can actually sustain, expressed in today's money.
  const perUnitCorpus = corpusForGrowingWithdrawals(1, postRetReturnPct, inflationPct, retirementYears);
  const sustainableMonthlyToday =
    perUnitCorpus > 0
      ? projectedCorpus / perUnitCorpus / 12 / Math.pow(1 + inflationPct / 100, yearsToRetire)
      : 0;

  return {
    yearsToRetire,
    retirementYears,
    monthlyExpenseAtRetirement,
    annualExpenseAtRetirement,
    requiredCorpus,
    projectedFromCorpus,
    projectedFromSavings,
    projectedCorpus,
    readinessRatio,
    shortfall,
    surplus,
    extraMonthlyNeeded,
    sustainableMonthlyToday
  };
};

// Verdict codes:
//   'on-track'   — projected covers the full requirement
//   'close'      — 80–100% funded; small course-correction closes it
//   'behind'     — 50–80% funded; needs a real plan change
//   'far-behind' — under half funded
const retirementReadinessVerdict = ({ readinessRatio }) => {
  if (readinessRatio >= 1) return { code: 'on-track', readinessRatio };
  if (readinessRatio >= 0.8) return { code: 'close', readinessRatio };
  if (readinessRatio >= 0.5) return { code: 'behind', readinessRatio };
  return { code: 'far-behind', readinessRatio };
};

module.exports = {
  corpusForGrowingWithdrawals,
  savingsFvWithStepUp,
  monthlyAnnuityFactor,
  assessRetirementReadiness,
  retirementReadinessVerdict
};
