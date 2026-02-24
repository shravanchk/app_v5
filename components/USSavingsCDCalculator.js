import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('dark-theme', localStorage.getItem('theme') === 'dark');
    }
  }, []);

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

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="calculator-container sip-container">
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

      <div className="calculator-card">
        <div className="calculator-header sip-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <h1 className="header-title">US Savings & CD Calculator</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Project high-yield savings growth and CD maturity outcomes in one view.
          </p>
        </div>

        <div className="mobile-card-content">
          <div className="input-section" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">Savings Projection Inputs</h2>
            <div className="responsive-grid" style={{ alignItems: 'end' }}>
              <div>
                <label className="input-label">Initial Deposit ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.savingsInitialDeposit} onChange={(e) => handleInputChange('savingsInitialDeposit', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Monthly Contribution ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.savingsMonthlyContribution} onChange={(e) => handleInputChange('savingsMonthlyContribution', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Savings APY (%)</label>
                <input className="calculator-input" type="number" min="0" step="0.01" value={inputs.savingsApy} onChange={(e) => handleInputChange('savingsApy', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Projection Horizon (Years)</label>
                <input className="calculator-input" type="number" min="1" max="40" step="1" value={inputs.savingsYears} onChange={(e) => handleInputChange('savingsYears', Number(e.target.value) || 1)} />
              </div>
            </div>
          </div>

          <div className="input-section" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">CD Inputs</h2>
            <div className="responsive-grid" style={{ alignItems: 'end' }}>
              <div>
                <label className="input-label">CD Deposit ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.cdDeposit} onChange={(e) => handleInputChange('cdDeposit', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">CD APY (%)</label>
                <input className="calculator-input" type="number" min="0" step="0.01" value={inputs.cdApy} onChange={(e) => handleInputChange('cdApy', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">CD Term (Months)</label>
                <input className="calculator-input" type="number" min="1" max="120" value={inputs.cdTermMonths} onChange={(e) => handleInputChange('cdTermMonths', Number(e.target.value) || 1)} />
              </div>
            </div>
          </div>

          <div className="results-container" style={{ borderColor: '#7c3aed', background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)' }}>
            <h2 className="results-title" style={{ color: '#4c1d95' }}>Projected Outcomes</h2>
            <div className="responsive-grid">
              <div className="result-item">
                <div className="result-label">Savings Ending Balance</div>
                <div className="result-value total">{formatUSD(savingsResult.endingBalance)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Savings Interest Earned</div>
                <div className="result-value interest">{formatUSD(savingsResult.interestEarned)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">CD Maturity Value</div>
                <div className="result-value emi">{formatUSD(cdResult.maturityValue)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">CD Interest Earned</div>
                <div className="result-value principal">{formatUSD(cdResult.interestEarned)}</div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#4c1d95', lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 0.35rem 0' }}>
                <strong>Total savings contributions:</strong> {formatUSD(savingsResult.totalContributed)}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Savings projection period:</strong> {savingsResult.months} months
              </p>
            </div>
          </div>

          <ResultActions title="US Savings & CD Calculator Summary" summaryLines={summaryLines} fileName="us-savings-cd-calculator-summary.txt" />

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
      </div>
    </div>
  );
};

export default USSavingsCDCalculator;
