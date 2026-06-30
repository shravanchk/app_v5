import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import ResultActions from './ResultActions';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import { NumberField } from './ui/Field';
import Card from './ui/Card';
import { formatCurrency } from '../utils/calculations';

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

const projectSavings = (initialDeposit, monthlyContribution, apy, years) => {
  const months = Math.max(1, Math.floor((Number(years) || 0) * 12));
  const monthlyRate = Math.max(0, Number(apy) || 0) / 100 / 12;
  let balance = Math.max(0, Number(initialDeposit) || 0);
  let totalContributed = balance;

  for (let month = 1; month <= months; month += 1) {
    balance += Math.max(0, Number(monthlyContribution) || 0);
    totalContributed += Math.max(0, Number(monthlyContribution) || 0);
    balance += balance * monthlyRate;
  }

  return {
    months,
    totalContributed,
    endingBalance: balance,
    interestEarned: Math.max(0, balance - totalContributed)
  };
};

const projectCD = (deposit, apy, termMonths) => {
  const principal = Math.max(0, Number(deposit) || 0);
  const months = Math.max(1, Math.floor(Number(termMonths) || 1));
  const monthlyRate = Math.max(0, Number(apy) || 0) / 100 / 12;
  const maturityValue = principal * Math.pow(1 + monthlyRate, months);
  const interestEarned = Math.max(0, maturityValue - principal);
  return { maturityValue, interestEarned };
};

const USSavingsCDCalculator = () => {
  const [inputs, setInputs] = useState({
    savingsInitialDeposit: 10000,
    savingsMonthlyContribution: 500,
    savingsApy: 4.5,
    savingsYears: 5,
    cdDeposit: 15000,
    cdApy: 5.1,
    cdTermMonths: 12
  });

  const savingsResult = useMemo(
    () =>
      projectSavings(
        inputs.savingsInitialDeposit,
        inputs.savingsMonthlyContribution,
        inputs.savingsApy,
        inputs.savingsYears
      ),
    [inputs.savingsInitialDeposit, inputs.savingsMonthlyContribution, inputs.savingsApy, inputs.savingsYears]
  );

  const cdResult = useMemo(
    () => projectCD(inputs.cdDeposit, inputs.cdApy, inputs.cdTermMonths),
    [inputs.cdDeposit, inputs.cdApy, inputs.cdTermMonths]
  );

  const summaryLines = [
    `Savings projection ending balance: ${formatUSD(savingsResult.endingBalance)}`,
    `Savings interest earned: ${formatUSD(savingsResult.interestEarned)}`,
    `CD maturity value: ${formatUSD(cdResult.maturityValue)}`,
    `CD interest earned: ${formatUSD(cdResult.interestEarned)}`
  ];

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <Head>
        <title>US Savings & CD Calculator | APY Growth and Maturity | Upaman</title>
        <meta
          name="description"
          content="Free US savings and CD calculator. Project high-yield savings growth with monthly contributions and estimate CD maturity value by APY and term."
        />
        <meta
          name="keywords"
          content="US savings calculator, CD calculator USA, APY calculator, high yield savings calculator, certificate of deposit maturity calculator"
        />
        <link rel="canonical" href="https://upaman.com/us-savings-cd-calculator" />
        <meta property="og:title" content="US Savings & CD Calculator | Upaman" />
        <meta
          property="og:description"
          content="Estimate savings growth and CD maturity value using APY and contribution assumptions."
        />
        <meta property="og:url" content="https://upaman.com/us-savings-cd-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Savings & CD Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Compare APY-based savings growth and CD maturity outcomes with practical assumptions."
        />
      </Head>

      <CalcLayout
        eyebrow="United States"
        title="US Savings & CD Calculator"
        subtitle="Project high-yield savings growth and CD maturity outcomes side by side."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted dark:text-slate-400">Savings projection</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="s-init" label="Initial deposit" prefix="$" value={inputs.savingsInitialDeposit} onChange={(v) => set('savingsInitialDeposit', v)} />
              <NumberField id="s-mon" label="Monthly contribution" prefix="$" value={inputs.savingsMonthlyContribution} onChange={(v) => set('savingsMonthlyContribution', v)} />
              <NumberField id="s-apy" label="Savings APY" suffix="%" step={0.01} value={inputs.savingsApy} onChange={(v) => set('savingsApy', v)} />
              <NumberField id="s-yrs" label="Horizon" suffix="yrs" min={1} max={40} value={inputs.savingsYears} onChange={(v) => set('savingsYears', v)} />
            </div>
            <p className="mb-3 mt-5 text-xs font-bold uppercase tracking-wide text-ink-muted dark:text-slate-400">Certificate of deposit</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="cd-dep" label="CD deposit" prefix="$" value={inputs.cdDeposit} onChange={(v) => set('cdDeposit', v)} />
              <NumberField id="cd-apy" label="CD APY" suffix="%" step={0.01} value={inputs.cdApy} onChange={(v) => set('cdApy', v)} />
              <NumberField id="cd-term" label="CD term" suffix="mo" min={1} max={120} value={inputs.cdTermMonths} onChange={(v) => set('cdTermMonths', v)} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Savings ending balance" value={formatUSD(savingsResult.endingBalance)} emphasis tone="positive" />
              <ResultStat label="Savings interest earned" value={formatUSD(savingsResult.interestEarned)} />
              <ResultStat label="CD maturity value" value={formatUSD(cdResult.maturityValue)} />
              <ResultStat label="CD interest earned" value={formatUSD(cdResult.interestEarned)} />
            </div>

            <Card className="p-5">
              <div className="space-y-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <p><strong className="font-semibold text-ink dark:text-white">Total savings contributions:</strong> {formatUSD(savingsResult.totalContributed)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">Savings projection period:</strong> {savingsResult.months} months</p>
              </div>
            </Card>

            <div className="grid gap-5 sm:grid-cols-2">
              <Card className="p-5">
                <PieBreakdownChart
                  title="Savings growth composition"
                  items={[
                    { label: 'Total contributed', value: savingsResult.totalContributed, color: '#3b82f6' },
                    { label: 'Interest earned', value: savingsResult.interestEarned, color: '#10b981' }
                  ]}
                  formatter={formatUSD}
                />
              </Card>
              <Card className="p-5">
                <PieBreakdownChart
                  title="CD maturity composition"
                  items={[
                    { label: 'CD principal', value: Math.max(0, Number(inputs.cdDeposit) || 0), color: '#8b5cf6' },
                    { label: 'CD interest', value: cdResult.interestEarned, color: '#f97316' }
                  ]}
                  formatter={formatUSD}
                />
              </Card>
            </div>

            <Card className="p-5">
              <ComparisonBars
                title="Ending value comparison"
                items={[
                  { label: 'Savings ending balance', value: savingsResult.endingBalance, color: '#3b82f6' },
                  { label: 'CD maturity value', value: cdResult.maturityValue, color: '#8b5cf6' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <ResultActions title="US Savings & CD Calculator Summary" summaryLines={summaryLines} fileName="us-savings-cd-calculator-summary.txt" />
          </div>
        </div>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Savings: initial deposit, monthly contribution, APY, and projection years',
              'CD: deposit amount, APY, and term in months'
            ]}
            formulas={[
              'Savings projection compounds monthly using APY ÷ 12',
              'CD maturity value uses compound growth for selected term',
              'Interest earned = ending value - contributed principal'
            ]}
            assumptions={[
              'Rates are assumed constant for the selected period',
              'Taxes and penalties are not modeled',
              'Actual bank compounding conventions can vary'
            ]}
            sources={[
              { label: 'FDIC - Deposit products and consumer resources', url: 'https://www.fdic.gov/resources/consumers/' },
              { label: 'Consumer Financial Protection Bureau (CFPB) - Savings resources', url: 'https://www.consumerfinance.gov/consumer-tools/' }
            ]}
          />
        </div>
      
        <HowToSection
          name="How to use the Savings & CD Calculator"
          description="Project the growth of a savings deposit or CD."
          steps={[
            { name: "Enter your deposit", text: "Type the initial amount and any regular contributions." },
            { name: "Set the APY", text: "Enter the annual percentage yield." },
            { name: "Choose the term", text: "Set how long the money stays invested." },
            { name: "Review the result", text: "See the maturity value and total interest earned." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default USSavingsCDCalculator;
