import React, { useMemo, useState } from 'react';
import { ShieldCheck, AlertTriangle, Wallet, Target, CheckCircle2 } from 'lucide-react';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import HomeButton from './HomeButton';

const regionSettings = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    defaults: {
      monthlyEssentials: 45000,
      currentEmergencyFund: 120000,
      monthlySurplus: 30000
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    defaults: {
      monthlyEssentials: 3500,
      currentEmergencyFund: 6000,
      monthlySurplus: 900
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    defaults: {
      monthlyEssentials: 2600,
      currentEmergencyFund: 5000,
      monthlySurplus: 700
    }
  }
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionSettings[regionKey]?.defaults;
  return {
    monthlyEssentials: defaults?.monthlyEssentials ?? 0,
    currentEmergencyFund: defaults?.currentEmergencyFund ?? 0,
    monthlySurplus: defaults?.monthlySurplus ?? 0
  };
};

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const clamp = (min, value, max) => Math.min(max, Math.max(min, value));

const EmergencyFundReadinessWorkflow = () => {
  const [step, setStep] = useState(1);
  const baseRegion = 'india';
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion),
    dependents: 1,
    jobRisk: 'medium',
    incomeType: 'salaried',
    hasHealthInsurance: 'yes',
    singleIncomeHousehold: 'no'
  });

  const regionConfig = regionSettings[inputs.region];

  const output = useMemo(() => {
    const monthlyEssentials = Math.max(1, Number(inputs.monthlyEssentials) || 1);
    const currentEmergencyFund = Math.max(0, Number(inputs.currentEmergencyFund) || 0);
    const monthlySurplus = Math.max(0, Number(inputs.monthlySurplus) || 0);
    const dependents = Math.max(0, Number(inputs.dependents) || 0);

    const jobRiskAdjustment = {
      low: 0.5,
      medium: 1.5,
      high: 3
    }[inputs.jobRisk];

    const incomeTypeAdjustment = {
      salaried: 0.5,
      variable: 1.2,
      selfEmployed: 2
    }[inputs.incomeType];

    const insuranceAdjustment = inputs.hasHealthInsurance === 'yes' ? -0.5 : 0.75;
    const householdAdjustment = inputs.singleIncomeHousehold === 'yes' ? 1 : 0;
    const dependentAdjustment = Math.min(3, dependents * 0.5);

    const targetMonthsRaw =
      4 + jobRiskAdjustment + incomeTypeAdjustment + insuranceAdjustment + householdAdjustment + dependentAdjustment;
    const targetMonths = clamp(3, Math.round(targetMonthsRaw * 10) / 10, 12);

    const targetCorpus = targetMonths * monthlyEssentials;
    const currentCoverageMonths = currentEmergencyFund / monthlyEssentials;
    const gap = Math.max(0, targetCorpus - currentEmergencyFund);

    const allocationRate =
      currentCoverageMonths < 3 ? 0.8 : currentCoverageMonths < targetMonths ? 0.65 : 0.35;
    const recommendedMonthlyContribution = Math.round(monthlySurplus * allocationRate);
    const monthsToTarget =
      gap > 0 && recommendedMonthlyContribution > 0
        ? Math.ceil(gap / recommendedMonthlyContribution)
        : null;

    const status =
      currentCoverageMonths >= targetMonths
        ? {
            label: 'Ready',
            color: '#059669',
            reason: 'Your emergency runway meets your current risk profile.'
          }
        : currentCoverageMonths >= targetMonths * 0.6
          ? {
              label: 'Progressing',
              color: '#d97706',
              reason: 'You have a base cushion. Close the remaining gap to reduce stress risk.'
            }
          : {
              label: 'At risk',
              color: '#dc2626',
              reason: 'Current runway is thin for your profile. Prioritize emergency corpus build-up.'
            };

    const milestoneMonths = Array.from(
      new Set([1, 3, 6, Math.ceil(targetMonths)].filter((m) => m <= Math.ceil(targetMonths)))
    );
    const milestones = milestoneMonths.map((months) => {
      const required = months * monthlyEssentials;
      return {
        months,
        required,
        achieved: currentEmergencyFund >= required,
        shortfall: Math.max(0, required - currentEmergencyFund)
      };
    });

    return {
      monthlyEssentials,
      currentEmergencyFund,
      monthlySurplus,
      targetMonths,
      targetCorpus,
      currentCoverageMonths,
      gap,
      recommendedMonthlyContribution,
      monthsToTarget,
      status,
      milestones
    };
  }, [inputs]);

  const stepStyle = (active) => ({
    background: active ? '#1d4ed8' : '#e2e8f0',
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
    <div className="calculator-container salary-container">
      <div className="calculator-card">
        <div className="calculator-header salary-header">
          <div className="header-nav">
            <HomeButton style={{ position: 'static' }} />
            <div style={{ flex: 1 }} />
          </div>
          <h1 className="header-title">Emergency Fund Readiness Workflow</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>
            Estimate target corpus, coverage runway, and timeline to become financially resilient.
          </p>
        </div>

        <div className="mobile-card-content">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button type="button" style={stepStyle(step === 1)} onClick={() => setStep(1)}>
              1. Inputs
            </button>
            <button type="button" style={stepStyle(step === 2)} onClick={() => setStep(2)}>
              2. Readiness
            </button>
            <button type="button" style={stepStyle(step === 3)} onClick={() => setStep(3)}>
              3. Milestones
            </button>
          </div>

          {step === 1 && (
            <div className="input-section">
              <h2 className="section-title">Step 1: Household risk profile</h2>
              <div style={helperBoxStyle}>
                <strong>How to fill this quickly:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Use only essential monthly expenses, not lifestyle spending.</li>
                  <li>Use immediately available emergency money, not long-term investments.</li>
                  <li>Select job risk honestly; this drives recommended runway months.</li>
                </ul>
              </div>
              <div className="responsive-grid">
                <div>
                  <label className="input-label">{withTipLabel('Region', 'Changes defaults and currency formatting for estimates.')}</label>
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
                  <label className="input-label">{withTipLabel(`Monthly Essentials (${regionConfig.currency})`, 'Use only non-negotiable monthly outflows.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.monthlyEssentials}
                    onChange={(e) => setInputs((prev) => ({ ...prev, monthlyEssentials: e.target.value }))}
                  />
                  <p style={hintStyle}>Include rent/EMI, food, utilities, insurance, and minimum debt only.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Current Emergency Fund (${regionConfig.currency})`, 'Cash + highly liquid balances available immediately.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.currentEmergencyFund}
                    onChange={(e) => setInputs((prev) => ({ ...prev, currentEmergencyFund: e.target.value }))}
                  />
                  <p style={hintStyle}>Use cash and highly liquid balances only.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Available Monthly Surplus (${regionConfig.currency})`, 'Amount you can allocate monthly without stress.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.monthlySurplus}
                    onChange={(e) => setInputs((prev) => ({ ...prev, monthlySurplus: e.target.value }))}
                  />
                  <p style={hintStyle}>Keep this conservative so plan stays executable.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Dependents', 'Higher dependents usually require larger emergency runway.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    max="8"
                    value={inputs.dependents}
                    onChange={(e) => setInputs((prev) => ({ ...prev, dependents: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Job risk', 'Drives recommended runway months based on stability risk.')}</label>
                  <select
                    className="calculator-input"
                    value={inputs.jobRisk}
                    onChange={(e) => setInputs((prev) => ({ ...prev, jobRisk: e.target.value }))}
                  >
                    <option value="low">Low (stable role/industry)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (volatile income/job risk)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Income type', 'Variable/self-employed income increases runway requirement.')}</label>
                  <select
                    className="calculator-input"
                    value={inputs.incomeType}
                    onChange={(e) => setInputs((prev) => ({ ...prev, incomeType: e.target.value }))}
                  >
                    <option value="salaried">Salaried (fixed)</option>
                    <option value="variable">Variable bonus/commission</option>
                    <option value="selfEmployed">Self-employed/business</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Health insurance', 'No coverage increases emergency target due to medical uncertainty.')}</label>
                  <select
                    className="calculator-input"
                    value={inputs.hasHealthInsurance}
                    onChange={(e) => setInputs((prev) => ({ ...prev, hasHealthInsurance: e.target.value }))}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Single-income household', 'Single earner households generally need higher emergency cushion.')}</label>
                  <select
                    className="calculator-input"
                    value={inputs.singleIncomeHousehold}
                    onChange={(e) => setInputs((prev) => ({ ...prev, singleIncomeHousehold: e.target.value }))}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              <button
                className="calculator-button primary-button"
                type="button"
                style={stepPrimaryCtaStyle}
                onClick={() => setStep(2)}
              >
                Continue to Readiness
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="results-container">
              <h2 className="results-title">Step 2: Readiness snapshot</h2>
              <div style={helperBoxStyle}>
                <strong>How to read this step:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Target runway is your recommended emergency months for current risk profile.</li>
                  <li>Funding gap is the exact shortfall to close before being fully ready.</li>
                  <li>Use the gap chart to decide how much monthly surplus to allocate first.</li>
                </ul>
              </div>
              <div
                style={{
                  borderLeft: `6px solid ${output.status.color}`,
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, color: output.status.color }}>
                  <CheckCircle2 size={16} style={{ verticalAlign: 'middle' }} /> {output.status.label}
                </p>
                <p style={{ margin: '0.4rem 0 0 0', color: '#334155' }}>{output.status.reason}</p>
              </div>

              <div className="responsive-grid">
                <div className="result-item">
                  <p className="result-label">
                    <Target size={16} /> Target runway
                  </p>
                  <p className="result-value">{output.targetMonths.toFixed(1)} months</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <ShieldCheck size={16} /> Current runway
                  </p>
                  <p className="result-value">{output.currentCoverageMonths.toFixed(1)} months</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <Wallet size={16} /> Target corpus
                  </p>
                  <p className="result-value">{formatCurrency(output.targetCorpus, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <AlertTriangle size={16} /> Funding gap
                  </p>
                  <p className="result-value">{formatCurrency(output.gap, regionConfig)}</p>
                </div>
              </div>

              <ComparisonBars
                title="Emergency corpus gap view"
                items={[
                  { label: 'Current fund', value: output.currentEmergencyFund, color: '#1d4ed8' },
                  { label: 'Target corpus', value: output.targetCorpus, color: '#0f766e' },
                  { label: 'Gap', value: output.gap, color: '#f97316' }
                ]}
                formatter={(value) => formatCurrency(value, regionConfig)}
              />

              <PieBreakdownChart
                title="Target corpus composition"
                items={[
                  { label: 'Already funded', value: output.currentEmergencyFund, color: '#22c55e' },
                  { label: 'Remaining gap', value: output.gap, color: '#ef4444' }
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
                  Continue to Milestones
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="results-container">
              <h2 className="results-title">Step 3: Monthly action plan</h2>
              <div style={helperBoxStyle}>
                <strong>How to use this plan:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Automate the recommended monthly contribution first.</li>
                  <li>
                    {output.monthsToTarget === null
                      ? 'No timeline shown because there is no gap or contribution is zero.'
                      : `At current pace, target runway is expected in about ${output.monthsToTarget} months.`}
                  </li>
                  <li>Recalculate whenever expenses, dependents, or job risk changes.</li>
                </ul>
              </div>
              <div className="responsive-grid">
                <div className="result-item">
                  <p className="result-label">Recommended monthly emergency contribution</p>
                  <p className="result-value">{formatCurrency(output.recommendedMonthlyContribution, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">Estimated months to full target</p>
                  <p className="result-value">
                    {output.monthsToTarget === null ? 'N/A' : `${output.monthsToTarget} months`}
                  </p>
                </div>
                <div className="result-item">
                  <p className="result-label">Surplus left after fund contribution</p>
                  <p className="result-value">
                    {formatCurrency(Math.max(0, output.monthlySurplus - output.recommendedMonthlyContribution), regionConfig)}
                  </p>
                </div>
              </div>

              <h3 style={{ marginTop: '1.1rem', marginBottom: '0.8rem', color: '#1e293b' }}>Runway milestones</h3>
              <div className="responsive-grid">
                {output.milestones.map((milestone) => (
                  <div key={milestone.months} className="result-item">
                    <p className="result-label">{milestone.months}-month corpus target</p>
                    <p style={{ marginBottom: '0.4rem', color: '#334155' }}>
                      Required: <strong>{formatCurrency(milestone.required, regionConfig)}</strong>
                    </p>
                    <p style={{ color: milestone.achieved ? '#059669' : '#b45309', marginBottom: '0.2rem' }}>
                      {milestone.achieved ? 'Achieved' : `Shortfall: ${formatCurrency(milestone.shortfall, regionConfig)}`}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Action checklist</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155' }}>
                  <li>Keep emergency corpus in high-liquidity, low-volatility instruments.</li>
                  <li>Automate the recommended monthly contribution right after salary credit.</li>
                  <li>Recalculate target runway after major life changes or income shifts.</li>
                </ul>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Related guides</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155' }}>
                  <li><a href="/guide-emergency-fund-readiness.html" target="_blank" rel="noopener noreferrer">Emergency Fund Readiness Guide</a></li>
                  <li><a href="/guide-prepay-vs-invest-decision.html" target="_blank" rel="noopener noreferrer">Prepay vs Invest Decision Guide</a></li>
                  <li><a href="/guide-credit-card-minimum-due-trap.html" target="_blank" rel="noopener noreferrer">Credit Card Minimum Due Trap Guide</a></li>
                </ul>
              </div>

              <button className="calculator-button" type="button" onClick={() => setStep(2)}>
                Back to Readiness
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyFundReadinessWorkflow;
