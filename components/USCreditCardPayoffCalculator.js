import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('dark-theme', localStorage.getItem('theme') === 'dark');
    }
  }, []);

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

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const previewRows = fixedPlan.schedule.slice(0, 24);

  return (
    <div className="calculator-container credit-trap-container">
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

      <div className="calculator-card">
        <div className="calculator-header credit-trap-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <h1 className="header-title">US Credit Card Payoff Calculator</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Compare minimum payment with a fixed monthly payment plan to reduce debt faster.
          </p>
        </div>

        <div className="mobile-card-content">
          <div className="input-section" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">Card Debt Inputs</h2>
            <div className="responsive-grid" style={{ alignItems: 'end' }}>
              <div>
                <label className="input-label">Current Balance ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.balance} onChange={(e) => handleInputChange('balance', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">APR (%)</label>
                <input className="calculator-input" type="number" min="0" step="0.1" value={inputs.apr} onChange={(e) => handleInputChange('apr', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Minimum Payment (% of balance)</label>
                <input className="calculator-input" type="number" min="0" step="0.1" value={inputs.minPercent} onChange={(e) => handleInputChange('minPercent', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Minimum Payment Floor ($)</label>
                <input className="calculator-input" type="number" min="0" step="1" value={inputs.minFloor} onChange={(e) => handleInputChange('minFloor', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Your Fixed Monthly Payment ($)</label>
                <input className="calculator-input" type="number" min="0" step="1" value={inputs.fixedPayment} onChange={(e) => handleInputChange('fixedPayment', Number(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div className="results-container" style={{ borderColor: '#0f766e', background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)' }}>
            <h2 className="results-title" style={{ color: '#0f2a43' }}>Payoff Comparison</h2>
            <div className="responsive-grid" style={{ marginBottom: '1.2rem' }}>
              <div className="result-item">
                <div className="result-label">Minimum Payment Timeline</div>
                <div className="result-value total">{formatDuration(minimumPlan.months)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Fixed Payment Timeline</div>
                <div className="result-value emi">{formatDuration(fixedPlan.months)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Interest Saved</div>
                <div className="result-value interest">{formatUSD(interestSaved)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Time Saved</div>
                <div className="result-value principal">{formatDuration(monthsSaved)}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 0.35rem 0' }}>
                <strong>Total interest (minimum plan):</strong> {formatUSD(minimumPlan.totalInterest)}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Total interest (fixed plan):</strong> {formatUSD(fixedPlan.totalInterest)}
              </p>
            </div>
          </div>

          {!!previewRows.length && (
            <div className="responsive-table-container" style={{ marginBottom: '1.5rem' }}>
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Opening</th>
                    <th>Payment</th>
                    <th>Interest</th>
                    <th>Principal</th>
                    <th>Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{formatUSD(row.openingBalance)}</td>
                      <td>{formatUSD(row.payment)}</td>
                      <td>{formatUSD(row.interest)}</td>
                      <td>{formatUSD(row.principal)}</td>
                      <td>{formatUSD(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <ResultActions title="US Credit Card Payoff Summary" summaryLines={summaryLines} fileName="us-credit-card-payoff-summary.txt" />

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
      </div>
    </div>
  );
};

export default USCreditCardPayoffCalculator;
