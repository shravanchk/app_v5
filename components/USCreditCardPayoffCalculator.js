import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import ResultActions from './ResultActions';
import { ComparisonBars } from './calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import { NumberField } from './ui/Field';
import Card from './ui/Card';
import { formatCurrency } from '../utils/calculations';

const MAX_MONTHS = 1200;

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

const formatDuration = (months) => {
  if (!months || months < 1) return '0 months';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
  if (remainingMonths === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
};

const getMinimumDue = (balanceAfterInterest, minPercent, minFloor) => {
  const percentagePayment = (balanceAfterInterest * minPercent) / 100;
  return Math.min(balanceAfterInterest, Math.max(percentagePayment, minFloor));
};

const simulatePayoff = ({ balance, apr, minPercent, minFloor, fixedPayment, mode }) => {
  let outstanding = Math.max(0, Number(balance) || 0);
  const monthlyRate = Math.max(0, Number(apr) || 0) / 100 / 12;

  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule = [];

  while (outstanding > 0.01 && month < MAX_MONTHS) {
    month += 1;
    const openingBalance = outstanding;
    const interest = openingBalance * monthlyRate;
    const balanceAfterInterest = openingBalance + interest;
    const minimumDue = getMinimumDue(balanceAfterInterest, minPercent, minFloor);
    const payment = Math.min(
      balanceAfterInterest,
      mode === 'fixed' ? Math.max(minimumDue, fixedPayment || 0) : minimumDue
    );
    const principal = payment - interest;

    if (principal <= 0) {
      return {
        months: month,
        totalInterest,
        totalPaid,
        schedule,
        isUnpayable: true
      };
    }

    outstanding = Math.max(0, balanceAfterInterest - payment);
    totalInterest += interest;
    totalPaid += payment;

    if (month <= 240) {
      schedule.push({
        month,
        openingBalance,
        payment,
        minimumDue,
        interest,
        principal,
        closingBalance: outstanding
      });
    }
  }

  return {
    months: month,
    totalInterest,
    totalPaid,
    schedule,
    isUnpayable: outstanding > 0.01,
    isCappedByLimit: month >= MAX_MONTHS
  };
};

const USCreditCardPayoffCalculator = () => {
  const [inputs, setInputs] = useState({
    balance: 10000,
    apr: 24,
    minPercent: 2,
    minFloor: 35,
    fixedPayment: 350
  });

  const minimumPlan = useMemo(
    () =>
      simulatePayoff({
        ...inputs,
        mode: 'minimum'
      }),
    [inputs]
  );

  const fixedPlan = useMemo(
    () =>
      simulatePayoff({
        ...inputs,
        mode: 'fixed'
      }),
    [inputs]
  );

  const interestSaved = Math.max(0, minimumPlan.totalInterest - fixedPlan.totalInterest);
  const monthsSaved = Math.max(0, minimumPlan.months - fixedPlan.months);

  const summaryLines = [
    `Minimum payment payoff: ${formatDuration(minimumPlan.months)}`,
    `Minimum payment interest: ${formatUSD(minimumPlan.totalInterest)}`,
    `Your fixed-payment payoff: ${formatDuration(fixedPlan.months)}`,
    `Your fixed-payment interest: ${formatUSD(fixedPlan.totalInterest)}`,
    `Interest saved: ${formatUSD(interestSaved)}`,
    `Time saved: ${formatDuration(monthsSaved)}`
  ];

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  const previewRows = fixedPlan.schedule.slice(0, 24);

  return (
    <>
      <Head>
        <title>US Credit Card Payoff Calculator | Minimum vs Fixed Payment | Upaman</title>
        <meta
          name="description"
          content="Compare US credit card minimum payment vs fixed monthly payment. Estimate payoff time, interest paid, and potential savings."
        />
        <meta
          name="keywords"
          content="US credit card payoff calculator, credit card minimum payment calculator, debt payoff planner USA, APR payoff calculator"
        />
        <link rel="canonical" href="https://upaman.com/us-credit-card-payoff-calculator" />
        <meta property="og:title" content="US Credit Card Payoff Calculator | Upaman" />
        <meta
          property="og:description"
          content="Estimate payoff timeline and interest impact of minimum payment vs fixed payment strategy."
        />
        <meta property="og:url" content="https://upaman.com/us-credit-card-payoff-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Credit Card Payoff Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Compare minimum due and fixed payment strategies to get out of credit card debt faster."
        />
      </Head>

      <CalcLayout
        eyebrow="United States"
        title="US Credit Card Payoff Calculator"
        subtitle="Compare the minimum payment with a fixed monthly payment plan to clear card debt faster."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="c-bal" label="Current balance" prefix="$" value={inputs.balance} onChange={(v) => set('balance', v)} />
              <NumberField id="c-apr" label="APR" suffix="%" step={0.1} value={inputs.apr} onChange={(v) => set('apr', v)} />
              <NumberField id="c-minp" label="Minimum payment" suffix="%" step={0.1} value={inputs.minPercent} onChange={(v) => set('minPercent', v)} />
              <NumberField id="c-floor" label="Minimum payment floor" prefix="$" step={1} value={inputs.minFloor} onChange={(v) => set('minFloor', v)} />
              <NumberField id="c-fixed" label="Your fixed monthly payment" prefix="$" step={1} value={inputs.fixedPayment} onChange={(v) => set('fixedPayment', v)} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Fixed payment timeline" value={formatDuration(fixedPlan.months)} emphasis tone="positive" />
              <ResultStat label="Minimum payment timeline" value={formatDuration(minimumPlan.months)} />
              <ResultStat label="Interest saved" value={formatUSD(interestSaved)} tone="positive" />
              <ResultStat label="Time saved" value={formatDuration(monthsSaved)} />
            </div>

            <Card className="p-5">
              <div className="space-y-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <p><strong className="font-semibold text-ink dark:text-white">Total interest (minimum plan):</strong> {formatUSD(minimumPlan.totalInterest)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">Total interest (fixed plan):</strong> {formatUSD(fixedPlan.totalInterest)}</p>
              </div>
            </Card>

            <Card className="p-5">
              <ComparisonBars
                title="Total interest by payoff strategy"
                items={[
                  { label: 'Minimum plan', value: minimumPlan.totalInterest, color: '#ef4444' },
                  { label: 'Fixed plan', value: fixedPlan.totalInterest, color: '#10b981' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <Card className="p-5">
              <ComparisonBars
                title="Payoff timeline by strategy"
                items={[
                  { label: 'Minimum plan', value: minimumPlan.months, color: '#f97316' },
                  { label: 'Fixed plan', value: fixedPlan.months, color: '#3b82f6' }
                ]}
                formatter={(value) => `${Math.round(value)} mo`}
              />
            </Card>

            {!!previewRows.length && (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-muted dark:bg-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Month</th>
                        <th className="px-3 py-2 font-semibold">Opening</th>
                        <th className="px-3 py-2 font-semibold">Payment</th>
                        <th className="px-3 py-2 font-semibold">Interest</th>
                        <th className="px-3 py-2 font-semibold">Principal</th>
                        <th className="px-3 py-2 font-semibold">Closing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-ink-soft dark:divide-slate-700 dark:text-slate-300">
                      {previewRows.map((row) => (
                        <tr key={row.month}>
                          <td className="px-3 py-2">{row.month}</td>
                          <td className="px-3 py-2">{formatUSD(row.openingBalance)}</td>
                          <td className="px-3 py-2">{formatUSD(row.payment)}</td>
                          <td className="px-3 py-2">{formatUSD(row.interest)}</td>
                          <td className="px-3 py-2">{formatUSD(row.principal)}</td>
                          <td className="px-3 py-2 font-medium text-ink dark:text-white">{formatUSD(row.closingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <ResultActions title="US Credit Card Payoff Summary" summaryLines={summaryLines} fileName="us-credit-card-payoff-summary.txt" />
          </div>
        </div>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Current balance, APR, minimum payment percentage/floor, and fixed monthly payment',
              'Minimum due is estimated as max(% of balance, floor amount)'
            ]}
            formulas={[
              'Interest accrues monthly at APR ÷ 12',
              'Payment first covers interest, then principal',
              'Simulation runs month-by-month until payoff'
            ]}
            assumptions={[
              'No additional purchases or fees are added during payoff period',
              'APR is assumed constant',
              'Card issuer minimum-due formula may differ from this estimate'
            ]}
            sources={[
              { label: 'Consumer Financial Protection Bureau (CFPB) - Credit cards', url: 'https://www.consumerfinance.gov/consumer-tools/credit-cards/' },
              { label: 'Federal Reserve - Credit card basics and costs', url: 'https://www.federalreserve.gov/consumerscommunities/credit-cards.htm' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default USCreditCardPayoffCalculator;
