import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('dark-theme', localStorage.getItem('theme') === 'dark');
    }
  }, []);

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

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="calculator-container emi-container">
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

      <div className="calculator-card">
        <div className="calculator-header emi-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <h1 className="header-title">US Refinance Break-even Calculator</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Compare your current mortgage with a refinance offer and estimate when costs are recovered.
          </p>
        </div>

        <div className="mobile-card-content">
          <div className="input-section" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">Refinance Inputs</h2>
            <div className="responsive-grid" style={{ alignItems: 'end' }}>
              <div>
                <label className="input-label">Current Loan Balance ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.currentBalance} onChange={(e) => handleInputChange('currentBalance', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Current Interest Rate (% APR)</label>
                <input className="calculator-input" type="number" min="0" step="0.01" value={inputs.currentRate} onChange={(e) => handleInputChange('currentRate', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Remaining Term (Months)</label>
                <input className="calculator-input" type="number" min="1" value={inputs.remainingTermMonths} onChange={(e) => handleInputChange('remainingTermMonths', Number(e.target.value) || 1)} />
              </div>
              <div>
                <label className="input-label">New Refinance Rate (% APR)</label>
                <input className="calculator-input" type="number" min="0" step="0.01" value={inputs.newRate} onChange={(e) => handleInputChange('newRate', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">New Loan Term (Months)</label>
                <input className="calculator-input" type="number" min="1" value={inputs.newTermMonths} onChange={(e) => handleInputChange('newTermMonths', Number(e.target.value) || 1)} />
              </div>
              <div>
                <label className="input-label">Closing Costs ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.closingCosts} onChange={(e) => handleInputChange('closingCosts', Number(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div className="results-container" style={{ borderColor: '#b45309', background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)' }}>
            <h2 className="results-title" style={{ color: '#7c2d12' }}>Refinance Comparison</h2>
            <div className="responsive-grid">
              <div className="result-item">
                <div className="result-label">Current Payment</div>
                <div className="result-value total">{formatUSD(results.currentPayment)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">New Payment</div>
                <div className="result-value emi">{formatUSD(results.newPayment)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Monthly Savings</div>
                <div className="result-value interest">{formatUSD(results.monthlySavings)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Break-even</div>
                <div className="result-value principal" style={{ fontSize: '1rem' }}>
                  {results.breakEvenMonths ? formatMonths(results.breakEvenMonths) : 'No break-even'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7c2d12', lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 0.35rem 0' }}>
                <strong>Current remaining interest:</strong> {formatUSD(results.interestRemainingCurrent)}
              </p>
              <p style={{ margin: '0 0 0.35rem 0' }}>
                <strong>New loan interest:</strong> {formatUSD(results.interestNewLoan)}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Lifetime savings after costs:</strong> {formatUSD(results.lifetimeSavingsAfterCosts)}
              </p>
            </div>
          </div>

          <ResultActions title="US Refinance Calculator Summary" summaryLines={summaryLines} fileName="us-refinance-calculator-summary.txt" />

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
      </div>
    </div>
  );
};

export default USRefinanceCalculator;
