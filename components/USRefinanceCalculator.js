import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import ResultActions from './ResultActions';
import { ComparisonBars } from './calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import { NumberField } from './ui/Field';
import Card from './ui/Card';
import { formatCurrency } from '../utils/calculations';

const getMonthlyPayment = (principal, annualRate, months) => {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
};

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

const formatMonths = (months) => {
  if (!months || months < 1) return 'N/A';
  const whole = Math.ceil(months);
  const years = Math.floor(whole / 12);
  const remaining = whole % 12;
  if (!years) return `${whole} months`;
  if (!remaining) return `${years} years`;
  return `${years} years ${remaining} months`;
};

const USRefinanceCalculator = () => {
  const [inputs, setInputs] = useState({
    currentBalance: 320000,
    currentRate: 7.25,
    remainingTermMonths: 300,
    newRate: 6.25,
    newTermMonths: 300,
    closingCosts: 5500
  });

  const results = useMemo(() => {
    const currentBalance = Math.max(0, Number(inputs.currentBalance) || 0);
    const currentRate = Math.max(0, Number(inputs.currentRate) || 0);
    const remainingTermMonths = Math.max(1, Math.floor(Number(inputs.remainingTermMonths) || 1));
    const newRate = Math.max(0, Number(inputs.newRate) || 0);
    const newTermMonths = Math.max(1, Math.floor(Number(inputs.newTermMonths) || 1));
    const closingCosts = Math.max(0, Number(inputs.closingCosts) || 0);

    const currentPayment = getMonthlyPayment(currentBalance, currentRate, remainingTermMonths);
    const newPayment = getMonthlyPayment(currentBalance, newRate, newTermMonths);
    const monthlySavings = currentPayment - newPayment;
    const breakEvenMonths = monthlySavings > 0 ? closingCosts / monthlySavings : null;

    const interestRemainingCurrent = Math.max(0, currentPayment * remainingTermMonths - currentBalance);
    const interestNewLoan = Math.max(0, newPayment * newTermMonths - currentBalance);
    const lifetimeSavingsAfterCosts = interestRemainingCurrent - interestNewLoan - closingCosts;

    return {
      currentPayment,
      newPayment,
      monthlySavings,
      breakEvenMonths,
      interestRemainingCurrent,
      interestNewLoan,
      lifetimeSavingsAfterCosts
    };
  }, [inputs]);

  const summaryLines = [
    `Current estimated payment: ${formatUSD(results.currentPayment)}`,
    `Refinance estimated payment: ${formatUSD(results.newPayment)}`,
    `Monthly savings: ${formatUSD(results.monthlySavings)}`,
    `Estimated break-even: ${results.breakEvenMonths ? formatMonths(results.breakEvenMonths) : 'No break-even with current inputs'}`,
    `Lifetime savings after costs: ${formatUSD(results.lifetimeSavingsAfterCosts)}`
  ];

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <Head>
        <title>US Refinance Break-even Calculator | Mortgage Refi Savings | Upaman</title>
        <meta
          name="description"
          content="Free US refinance calculator to estimate new payment, break-even months, and potential lifetime savings after closing costs."
        />
        <meta
          name="keywords"
          content="refinance break-even calculator, mortgage refinance calculator USA, refinance savings calculator, mortgage refi closing costs"
        />
        <link rel="canonical" href="https://upaman.com/us-refinance-calculator" />
        <meta property="og:title" content="US Refinance Break-even Calculator | Upaman" />
        <meta
          property="og:description"
          content="Compare current mortgage vs refinance scenario with break-even and savings estimates."
        />
        <meta property="og:url" content="https://upaman.com/us-refinance-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Refinance Break-even Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Estimate refinance break-even timeline and net savings after closing costs."
        />
      </Head>

      <CalcLayout
        eyebrow="United States"
        title="US Refinance Break-even Calculator"
        subtitle="Compare your current mortgage with a refinance offer and estimate when the closing costs are recovered."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="r-bal" label="Current loan balance" prefix="$" value={inputs.currentBalance} onChange={(v) => set('currentBalance', v)} />
              <NumberField id="r-crate" label="Current rate (APR)" suffix="%" step={0.01} value={inputs.currentRate} onChange={(v) => set('currentRate', v)} />
              <NumberField id="r-cterm" label="Remaining term" suffix="mo" min={1} value={inputs.remainingTermMonths} onChange={(v) => set('remainingTermMonths', v)} />
              <NumberField id="r-nrate" label="New refinance rate (APR)" suffix="%" step={0.01} value={inputs.newRate} onChange={(v) => set('newRate', v)} />
              <NumberField id="r-nterm" label="New loan term" suffix="mo" min={1} value={inputs.newTermMonths} onChange={(v) => set('newTermMonths', v)} />
              <NumberField id="r-close" label="Closing costs" prefix="$" value={inputs.closingCosts} onChange={(v) => set('closingCosts', v)} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="New payment" value={formatUSD(results.newPayment)} emphasis tone={results.monthlySavings > 0 ? 'positive' : 'default'} />
              <ResultStat label="Current payment" value={formatUSD(results.currentPayment)} />
              <ResultStat label="Monthly savings" value={formatUSD(results.monthlySavings)} tone={results.monthlySavings > 0 ? 'positive' : 'default'} />
              <ResultStat label="Break-even" value={results.breakEvenMonths ? formatMonths(results.breakEvenMonths) : 'No break-even'} />
            </div>

            <Card className="p-5">
              <div className="space-y-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <p><strong className="font-semibold text-ink dark:text-white">Current remaining interest:</strong> {formatUSD(results.interestRemainingCurrent)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">New loan interest:</strong> {formatUSD(results.interestNewLoan)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">Lifetime savings after costs:</strong> {formatUSD(results.lifetimeSavingsAfterCosts)}</p>
              </div>
            </Card>

            <Card className="p-5">
              <ComparisonBars
                title="Current vs refinance payment"
                items={[
                  { label: 'Current payment', value: results.currentPayment, color: '#ef4444' },
                  { label: 'Refinance payment', value: results.newPayment, color: '#10b981' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <Card className="p-5">
              <ComparisonBars
                title="Remaining interest comparison"
                items={[
                  { label: 'Current remaining interest', value: results.interestRemainingCurrent, color: '#f97316' },
                  { label: 'Refinance interest', value: results.interestNewLoan, color: '#3b82f6' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <ResultActions title="US Refinance Calculator Summary" summaryLines={summaryLines} fileName="us-refinance-calculator-summary.txt" />
          </div>
        </div>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Current balance, current APR, remaining term, new APR, new term, and closing costs'
            ]}
            formulas={[
              'Current/new payment: amortization formula on same current balance',
              'Monthly savings = current payment - new payment',
              'Break-even months = closing costs ÷ monthly savings (if savings are positive)',
              'Lifetime savings = current remaining interest - new interest - closing costs'
            ]}
            assumptions={[
              'Escrow/tax/insurance changes are not included in payment difference',
              'Rate lock, lender credits, and tax effects are not modeled',
              'Use lender loan estimate for final refinance decision'
            ]}
            sources={[
              { label: 'Consumer Financial Protection Bureau (CFPB) - Refinance resources', url: 'https://www.consumerfinance.gov/owning-a-home/explore-rates/' },
              { label: 'Federal Housing Finance Agency (FHFA) - Mortgage market and refinance context', url: 'https://www.fhfa.gov/' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default USRefinanceCalculator;
