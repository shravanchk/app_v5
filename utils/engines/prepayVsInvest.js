// Prepay-vs-invest engine: compares directing a monthly surplus at loan
// prepayment (then investing the freed-up EMI + surplus after closure)
// against investing the surplus from day one, over the same baseline horizon.
// Market-agnostic; risk haircut and all inputs are supplied by the caller.

const { emiForLoan, simulateLoan, fvOfMonthlyAtAnnualPct } = require('./growth');

// inputs: { outstandingLoan, annualLoanRate, remainingMonths, monthlySurplus, adjustedReturn }
const comparePrepayVsInvest = (inputs) => {
  const { outstandingLoan, annualLoanRate, remainingMonths, monthlySurplus, adjustedReturn } = inputs;

  const baselineEmi = emiForLoan(outstandingLoan, annualLoanRate, remainingMonths);
  const baseline = simulateLoan(outstandingLoan, annualLoanRate, baselineEmi, 0, remainingMonths);
  const prepay = simulateLoan(outstandingLoan, annualLoanRate, baselineEmi, monthlySurplus, 0);

  const monthsSaved = Math.max(0, baseline.monthsUsed - prepay.monthsUsed);
  const interestSaved = Math.max(0, baseline.totalInterest - prepay.totalInterest);
  const postCloseMonths = Math.max(0, remainingMonths - prepay.monthsUsed);

  const investOnlyCorpus = fvOfMonthlyAtAnnualPct(monthlySurplus, adjustedReturn, remainingMonths);
  const prepayThenInvestCorpus = fvOfMonthlyAtAnnualPct(
    Math.max(0, baselineEmi + monthlySurplus),
    adjustedReturn,
    postCloseMonths
  );

  return {
    baselineEmi,
    baselineInterest: baseline.totalInterest,
    prepayInterest: prepay.totalInterest,
    monthsSaved,
    interestSaved,
    postCloseMonths,
    investOnlyCorpus,
    prepayThenInvestCorpus,
    corpusDelta: prepayThenInvestCorpus - investOnlyCorpus
  };
};

// Verdict codes:
//   'prepay-first' — debt cost high relative to risk-adjusted return
//   'invest-first' — risk-adjusted growth clearly stronger
//   'hybrid'       — outcomes close; split surplus
const prepayVsInvestVerdict = ({ prepayCorpus, investCorpus, loanRate, adjustedReturn }) => {
  if (prepayCorpus > investCorpus * 1.1 || loanRate - adjustedReturn >= 2) {
    return { code: 'prepay-first' };
  }
  if (investCorpus > prepayCorpus * 1.1 && adjustedReturn > loanRate) {
    return { code: 'invest-first' };
  }
  return { code: 'hybrid' };
};

module.exports = {
  comparePrepayVsInvest,
  prepayVsInvestVerdict
};
