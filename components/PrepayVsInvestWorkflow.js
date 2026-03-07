import React, { useMemo, useState } from 'react';
import { ArrowRightLeft, TrendingUp, ShieldCheck, PiggyBank, CheckCircle2 } from 'lucide-react';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import HomeButton from './HomeButton';

const regionSettings = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    defaults: {
      outstandingLoan: 3500000,
      annualLoanRate: 8.5,
      remainingYears: 15,
      monthlySurplus: 25000,
      expectedReturn: 11
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    defaults: {
      outstandingLoan: 260000,
      annualLoanRate: 6.6,
      remainingYears: 20,
      monthlySurplus: 500,
      expectedReturn: 8
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    defaults: {
      outstandingLoan: 220000,
      annualLoanRate: 4.8,
      remainingYears: 20,
      monthlySurplus: 400,
      expectedReturn: 7
    }
  }
};

const riskHaircut = {
  conservative: 2,
  balanced: 1,
  aggressive: 0
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionSettings[regionKey]?.defaults;
  return {
    outstandingLoan: defaults?.outstandingLoan ?? 0,
    annualLoanRate: defaults?.annualLoanRate ?? 0,
    remainingYears: defaults?.remainingYears ?? 0,
    monthlySurplus: defaults?.monthlySurplus ?? 0,
    expectedReturn: defaults?.expectedReturn ?? 0
  };
};

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const emiForLoan = (principal, annualRate, months) => {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const growth = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * growth) / (growth - 1);
};

const futureValueOfMonthly = (amount, annualRate, months) => {
  if (amount <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return amount * months;
  return amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

const simulateLoan = (principal, annualRate, baselineEmi, extraPayment = 0, maxMonths = 0) => {
  const monthlyRate = annualRate / 100 / 12;
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

  return {
    monthsUsed,
    totalInterest,
    outstanding
  };
};

const recommendationFor = ({ prepayCorpus, investCorpus, loanRate, adjustedReturn }) => {
  if (prepayCorpus > investCorpus * 1.1 || loanRate - adjustedReturn >= 2) {
    return {
      label: 'Prepay first, then invest',
      color: '#059669',
      reason: 'Your debt cost is high relative to expected risk-adjusted return. Reducing guaranteed interest drag is stronger.'
    };
  }

  if (investCorpus > prepayCorpus * 1.1 && adjustedReturn > loanRate) {
    return {
      label: 'Invest surplus first',
      color: '#1d4ed8',
      reason: 'Expected risk-adjusted portfolio growth is stronger than loan-cost savings in this setup.'
    };
  }

  return {
    label: 'Use a hybrid split',
    color: '#d97706',
    reason: 'Both options are close. Split surplus between loan prepayment and disciplined investing to balance certainty and growth.'
  };
};

const PrepayVsInvestWorkflow = () => {
  const [step, setStep] = useState(1);
  const baseRegion = 'india';
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion),
    riskProfile: 'balanced'
  });

  const regionConfig = regionSettings[inputs.region];

  const output = useMemo(() => {
    const outstandingLoan = Number(inputs.outstandingLoan) || 0;
    const annualLoanRate = Number(inputs.annualLoanRate) || 0;
    const remainingMonths = Math.max(1, Math.round((Number(inputs.remainingYears) || 0) * 12));
    const monthlySurplus = Math.max(0, Number(inputs.monthlySurplus) || 0);
    const expectedReturn = Math.max(0, Number(inputs.expectedReturn) || 0);
    const adjustedReturn = Math.max(0, expectedReturn - riskHaircut[inputs.riskProfile]);

    const baselineEmi = emiForLoan(outstandingLoan, annualLoanRate, remainingMonths);
    const baseline = simulateLoan(outstandingLoan, annualLoanRate, baselineEmi, 0, remainingMonths);
    const prepay = simulateLoan(outstandingLoan, annualLoanRate, baselineEmi, monthlySurplus, 0);

    const monthsSaved = Math.max(0, baseline.monthsUsed - prepay.monthsUsed);
    const interestSaved = Math.max(0, baseline.totalInterest - prepay.totalInterest);
    const postCloseMonths = Math.max(0, remainingMonths - prepay.monthsUsed);

    const investOnlyCorpus = futureValueOfMonthly(monthlySurplus, adjustedReturn, remainingMonths);
    const prepayThenInvestCorpus = futureValueOfMonthly(
      Math.max(0, baselineEmi + monthlySurplus),
      adjustedReturn,
      postCloseMonths
    );
    const corpusDelta = prepayThenInvestCorpus - investOnlyCorpus;

    const recommendation = recommendationFor({
      prepayCorpus: prepayThenInvestCorpus,
      investCorpus: investOnlyCorpus,
      loanRate: annualLoanRate,
      adjustedReturn
    });

    return {
      outstandingLoan,
      annualLoanRate,
      remainingMonths,
      monthlySurplus,
      expectedReturn,
      adjustedReturn,
      baselineEmi,
      baselineInterest: baseline.totalInterest,
      prepayInterest: prepay.totalInterest,
      monthsSaved,
      interestSaved,
      postCloseMonths,
      investOnlyCorpus,
      prepayThenInvestCorpus,
      corpusDelta,
      recommendation
    };
  }, [inputs]);

  const stepStyle = (active) => ({
    background: active ? '#0f766e' : '#e2e8f0',
    color: active ? '#fff' : '#334155',
    border: 'none',
    borderRadius: '999px',
    padding: '0.5rem 1rem',
    fontWeight: 600,
    cursor: 'pointer'
  });
  const stepPrimaryCtaStyle = {
    marginTop: '1.1rem',
    width: 'auto',
    minWidth: '220px',
    padding: '0.58rem 0.95rem',
    fontSize: '0.88rem',
    lineHeight: 1.2
  };
  const stepInlineCtaStyle = {
    width: 'auto',
    minWidth: '200px',
    padding: '0.56rem 0.9rem',
    fontSize: '0.86rem',
    lineHeight: 1.2
  };
  const helperBoxStyle = {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '0.75rem',
    padding: '0.85rem',
    marginBottom: '1rem',
    color: '#1e3a8a'
  };
  const hintStyle = {
    margin: '0.25rem 0 0',
    fontSize: '0.8rem',
    color: '#64748b'
  };
  const tipIconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '999px',
    border: '1px solid #94a3b8',
    color: '#475569',
    fontSize: '0.68rem',
    lineHeight: 1,
    cursor: 'help',
    background: '#f8fafc'
  };
  const withTipLabel = (text, tip) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <span>{text}</span>
      <span style={tipIconStyle} title={tip} aria-label={tip}>i</span>
    </span>
  );

  return (
    <div className="calculator-container emi-container">
      <div className="calculator-card">
        <div className="calculator-header emi-header">
          <div className="header-nav">
            <HomeButton style={{ position: 'static' }} />
            <div style={{ flex: 1 }} />
          </div>
          <h1 className="header-title">Prepay Loan vs Invest Surplus Workflow</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>
            Compare debt prepayment versus investing monthly surplus with a risk-adjusted view.
          </p>
        </div>

        <div className="mobile-card-content">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button type="button" style={stepStyle(step === 1)} onClick={() => setStep(1)}>
              1. Inputs
            </button>
            <button type="button" style={stepStyle(step === 2)} onClick={() => setStep(2)}>
              2. Comparison
            </button>
            <button type="button" style={stepStyle(step === 3)} onClick={() => setStep(3)}>
              3. Action Plan
            </button>
          </div>

          {step === 1 && (
            <div className="input-section">
              <h2 className="section-title">Step 1: Loan and surplus assumptions</h2>
              <div style={helperBoxStyle}>
                <strong>How to fill this quickly:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Use current outstanding principal from latest loan statement.</li>
                  <li>Use realistic return expectations, not best-case returns.</li>
                  <li>Enter only repeatable monthly surplus, not one-time windfalls.</li>
                </ul>
              </div>
              <div className="responsive-grid">
                <div>
                  <label className="input-label">{withTipLabel('Region', 'Changes currency and default assumptions for rates/amounts.')}</label>
                  <select
                    className="calculator-input"
                    value={inputs.region}
                    onChange={(e) => {
                      const nextRegion = e.target.value;
                      setInputs((prev) => ({
                        ...prev,
                        region: nextRegion,
                        ...getRegionDefaults(nextRegion)
                      }));
                    }}
                  >
                    <option value="india">India</option>
                    <option value="us">United States</option>
                    <option value="eu">EU/UK (Generic)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Outstanding Loan (${regionConfig.currency})`, 'Use current principal from latest loan statement.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.outstandingLoan}
                    onChange={(e) => setInputs((prev) => ({ ...prev, outstandingLoan: e.target.value }))}
                  />
                  <p style={hintStyle}>Use current principal, not original sanction amount.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Loan Interest Rate (% yearly)', 'Current effective borrowing rate after resets, if any.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    step="0.1"
                    min="0"
                    value={inputs.annualLoanRate}
                    onChange={(e) => setInputs((prev) => ({ ...prev, annualLoanRate: e.target.value }))}
                  />
                  <p style={hintStyle}>Use effective current rate after reset.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Remaining Tenure (years)', 'Remaining duration on current loan, not original tenure.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={inputs.remainingYears}
                    onChange={(e) => setInputs((prev) => ({ ...prev, remainingYears: e.target.value }))}
                  />
                  <p style={hintStyle}>Round to nearest 0.5 years if exact months are not handy.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Monthly Surplus (${regionConfig.currency})`, 'Only include surplus you can consistently maintain.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.monthlySurplus}
                    onChange={(e) => setInputs((prev) => ({ ...prev, monthlySurplus: e.target.value }))}
                  />
                  <p style={hintStyle}>Enter amount you can sustain every month comfortably.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Expected Return (% yearly)', 'Use conservative long-term expectation, not short-term peak return.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    step="0.1"
                    min="0"
                    value={inputs.expectedReturn}
                    onChange={(e) => setInputs((prev) => ({ ...prev, expectedReturn: e.target.value }))}
                  />
                  <p style={hintStyle}>Use long-term conservative expectation for planning.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Risk Profile', 'Applies return haircut before comparison to reduce optimism bias.')}</label>
                  <select
                    className="calculator-input"
                    value={inputs.riskProfile}
                    onChange={(e) => setInputs((prev) => ({ ...prev, riskProfile: e.target.value }))}
                  >
                    <option value="conservative">Conservative (higher return haircut)</option>
                    <option value="balanced">Balanced</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
              </div>
              <button
                className="calculator-button primary-button"
                type="button"
                style={stepPrimaryCtaStyle}
                onClick={() => setStep(2)}
              >
                Continue to Comparison
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="results-container">
              <h2 className="results-title">Step 2: Outcome comparison at current tenure horizon</h2>
              <div style={helperBoxStyle}>
                <strong>How to read this step:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>"Interest saved" and "months saved" show certainty benefit of prepayment.</li>
                  <li>"Corpus at baseline horizon" compares wealth outcome at same time point.</li>
                  <li>If values are close, prefer hybrid split over all-or-nothing choice.</li>
                </ul>
              </div>
              <div className="responsive-grid">
                <div className="result-item">
                  <p className="result-label">
                    <ShieldCheck size={16} /> Current baseline EMI
                  </p>
                  <p className="result-value">{formatCurrency(output.baselineEmi, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <PiggyBank size={16} /> Interest saved with prepayment
                  </p>
                  <p className="result-value">{formatCurrency(output.interestSaved, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <ArrowRightLeft size={16} /> Loan closes earlier by
                  </p>
                  <p className="result-value">{output.monthsSaved} months</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <TrendingUp size={16} /> Risk-adjusted return used
                  </p>
                  <p className="result-value">{output.adjustedReturn.toFixed(1)}%</p>
                </div>
              </div>

              <ComparisonBars
                title="Corpus at baseline horizon"
                items={[
                  { label: 'Invest surplus monthly', value: output.investOnlyCorpus, color: '#1d4ed8' },
                  { label: 'Prepay then invest post-closure', value: output.prepayThenInvestCorpus, color: '#059669' }
                ]}
                formatter={(value) => formatCurrency(value, regionConfig)}
              />

              <PieBreakdownChart
                title="Invest option: contributions vs gains"
                items={[
                  {
                    label: 'Total contributions',
                    value: output.monthlySurplus * output.remainingMonths,
                    color: '#3b82f6'
                  },
                  {
                    label: 'Projected gains',
                    value: Math.max(0, output.investOnlyCorpus - output.monthlySurplus * output.remainingMonths),
                    color: '#10b981'
                  }
                ]}
                formatter={(value) => formatCurrency(value, regionConfig)}
              />

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="calculator-button" type="button" onClick={() => setStep(1)}>
                  Back to Inputs
                </button>
                <button
                  className="calculator-button success-button"
                  type="button"
                  style={stepInlineCtaStyle}
                  onClick={() => setStep(3)}
                >
                  Continue to Action Plan
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="results-container">
              <h2 className="results-title">Step 3: Recommendation and plan</h2>
              <div
                style={{
                  borderLeft: `6px solid ${output.recommendation.color}`,
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, color: output.recommendation.color }}>
                  <CheckCircle2 size={16} style={{ verticalAlign: 'middle' }} /> {output.recommendation.label}
                </p>
                <p style={{ margin: '0.4rem 0 0 0', color: '#334155' }}>{output.recommendation.reason}</p>
              </div>

              <div style={helperBoxStyle}>
                <strong>How to use this recommendation:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>
                    {output.corpusDelta >= 0
                      ? 'Prepay-first route has higher projected corpus in current assumptions.'
                      : 'Invest-first route has higher projected corpus in current assumptions.'}
                  </li>
                  <li>Re-run this workflow when rates, income, or risk profile changes.</li>
                  <li>Do not allocate full surplus until emergency runway is secure.</li>
                </ul>
              </div>

              <div className="responsive-grid">
                <div className="result-item">
                  <p className="result-label">Invest option corpus</p>
                  <p className="result-value">{formatCurrency(output.investOnlyCorpus, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">Prepay-first corpus</p>
                  <p className="result-value">{formatCurrency(output.prepayThenInvestCorpus, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">Corpus difference</p>
                  <p className="result-value">{formatCurrency(output.corpusDelta, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">Post-closure investing window</p>
                  <p className="result-value">{output.postCloseMonths} months</p>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Action checklist</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155' }}>
                  <li>Keep emergency fund intact before aggressive prepayment or equity-heavy investing.</li>
                  <li>Review this decision at every rate reset or yearly portfolio expectation change.</li>
                  <li>If unsure, split surplus (for example 60:40) between prepayment and investing.</li>
                </ul>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Related guides</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155' }}>
                  <li><a href="/guide-prepay-vs-invest-decision.html" target="_blank" rel="noopener noreferrer">Prepay vs Invest Decision Guide</a></li>
                  <li><a href="/guide-emergency-fund-readiness.html" target="_blank" rel="noopener noreferrer">Emergency Fund Readiness Guide</a></li>
                  <li><a href="/guide-emi-prepayment-strategy.html" target="_blank" rel="noopener noreferrer">EMI Prepayment Strategy Guide</a></li>
                </ul>
              </div>

              <button className="calculator-button" type="button" onClick={() => setStep(2)}>
                Back to Comparison
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrepayVsInvestWorkflow;
