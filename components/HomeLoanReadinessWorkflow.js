import React, { useMemo, useState } from 'react';
import { Home, Wallet, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import HomeButton from './HomeButton';

const regionSettings = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    defaultInterestRate: 8.5,
    defaultTenureYears: 20,
    housingOverheadRate: 0.05,
    fiorAdjustment: 0,
    almostReadyGapMonthly: 7000,
    minPostPaymentBuffer: 10000,
    monthlyIncomeLabel: 'Monthly In-hand Income',
    monthlyExpensesLabel: 'Monthly Fixed Expenses',
    existingDebtLabel: 'Existing EMI Commitments',
    downPaymentLabel: 'Available Down Payment',
    propertyCostLabel: 'Target Property Cost',
    assumptions: 'Includes an estimated 5% housing overhead for taxes, maintenance, and ownership costs.',
    defaults: {
      monthlyInHand: 100000,
      monthlyFixedExpenses: 40000,
      existingEMI: 7000,
      downPayment: 1500000,
      targetPropertyCost: 7000000
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    defaultInterestRate: 6.7,
    defaultTenureYears: 30,
    housingOverheadRate: 0.25,
    fiorAdjustment: -0.02,
    almostReadyGapMonthly: 450,
    minPostPaymentBuffer: 700,
    monthlyIncomeLabel: 'Monthly Net Income',
    monthlyExpensesLabel: 'Monthly Fixed Expenses',
    existingDebtLabel: 'Existing Monthly Debt Payments',
    downPaymentLabel: 'Available Down Payment',
    propertyCostLabel: 'Target Home Price',
    assumptions: 'Includes an estimated 25% overhead for taxes, insurance, HOA, and ownership costs.',
    defaults: {
      monthlyInHand: 7500,
      monthlyFixedExpenses: 3200,
      existingEMI: 600,
      downPayment: 80000,
      targetPropertyCost: 450000
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    defaultInterestRate: 4.6,
    defaultTenureYears: 25,
    housingOverheadRate: 0.17,
    fiorAdjustment: -0.01,
    almostReadyGapMonthly: 380,
    minPostPaymentBuffer: 600,
    monthlyIncomeLabel: 'Monthly Net Income',
    monthlyExpensesLabel: 'Monthly Fixed Expenses',
    existingDebtLabel: 'Existing Monthly Debt Payments',
    downPaymentLabel: 'Available Down Payment',
    propertyCostLabel: 'Target Property Cost',
    assumptions: 'Includes an estimated 17% overhead for taxes, service charges, insurance, and ownership costs.',
    defaults: {
      monthlyInHand: 5200,
      monthlyFixedExpenses: 2200,
      existingEMI: 400,
      downPayment: 60000,
      targetPropertyCost: 350000
    }
  }
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionSettings[regionKey]?.defaults;
  return {
    monthlyInHand: defaults?.monthlyInHand ?? 0,
    monthlyFixedExpenses: defaults?.monthlyFixedExpenses ?? 0,
    existingEMI: defaults?.existingEMI ?? 0,
    downPayment: defaults?.downPayment ?? 0,
    targetPropertyCost: defaults?.targetPropertyCost ?? 0
  };
};

const riskProfiles = {
  conservative: { label: 'Conservative', fiorCap: 0.35, buffer: 0.3 },
  balanced: { label: 'Balanced', fiorCap: 0.4, buffer: 0.2 },
  aggressive: { label: 'Aggressive', fiorCap: 0.45, buffer: 0.1 }
};

const round = (value) => Math.round(value);

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const emiForLoan = (principal, annualRate, tenureMonths) => {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const multiplier = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * multiplier) / (multiplier - 1);
};

const loanFromEmi = (emi, annualRate, tenureMonths) => {
  if (emi <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const multiplier = Math.pow(1 + monthlyRate, tenureMonths);
  return (emi * (multiplier - 1)) / (monthlyRate * multiplier);
};

const HomeLoanReadinessWorkflow = () => {
  const [step, setStep] = useState(1);
  const baseRegion = 'india';
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion),
    annualInterestRate: 8.5,
    tenureYears: 20,
    riskProfile: 'balanced'
  });

  const regionConfig = regionSettings[inputs.region];

  const output = useMemo(() => {
    const inHand = Number(inputs.monthlyInHand) || 0;
    const fixed = Number(inputs.monthlyFixedExpenses) || 0;
    const existingEmi = Number(inputs.existingEMI) || 0;
    const downPayment = Number(inputs.downPayment) || 0;
    const targetPropertyCost = Number(inputs.targetPropertyCost) || 0;
    const annualInterestRate = Number(inputs.annualInterestRate) || 0;
    const tenureMonths = (Number(inputs.tenureYears) || 0) * 12;
    const profile = riskProfiles[inputs.riskProfile];
    const effectiveFiorCap = Math.max(0.25, profile.fiorCap + regionConfig.fiorAdjustment);
    const housingOverheadRate = regionConfig.housingOverheadRate;

    const disposableBeforeLoan = Math.max(0, inHand - fixed - existingEmi);
    const emiByFior = Math.max(0, inHand * effectiveFiorCap - existingEmi);
    const emiByBuffer = Math.max(0, disposableBeforeLoan * (1 - profile.buffer));
    const safeHousingBudget = round(Math.min(emiByFior, emiByBuffer));
    const safeNewEmi = round(safeHousingBudget / (1 + housingOverheadRate));

    const maxAffordableLoan = round(loanFromEmi(safeNewEmi, annualInterestRate, tenureMonths));
    const maxPropertyBudget = maxAffordableLoan + downPayment;

    const neededLoan = Math.max(0, targetPropertyCost - downPayment);
    const requiredEmi = round(emiForLoan(neededLoan, annualInterestRate, tenureMonths));
    const requiredHousingPayment = round(requiredEmi * (1 + housingOverheadRate));

    const monthlyStress = round(inHand - fixed - existingEmi - requiredHousingPayment);
    const emiGap = Math.max(0, requiredHousingPayment - safeHousingBudget);
    const loanGap = Math.max(0, neededLoan - maxAffordableLoan);
    const extraDownPaymentNeeded = loanGap;
    const almostReadyGapMonthly = regionConfig.almostReadyGapMonthly;
    const minPostPaymentBuffer = regionConfig.minPostPaymentBuffer;

    const readiness =
      loanGap <= 0 && monthlyStress >= minPostPaymentBuffer
        ? {
            label: 'Ready to proceed',
            color: '#059669',
            reason: 'Your current budget supports the target property at the selected tenure.'
          }
        : emiGap <= almostReadyGapMonthly && monthlyStress >= 0
          ? {
              label: 'Almost ready',
              color: '#d97706',
              reason: 'You are close. Slightly higher down payment or lower property budget will make this comfortable.'
            }
          : {
              label: 'Not ready yet',
              color: '#dc2626',
              reason: 'Current affordability is below the required EMI. Improve savings or reduce target budget.'
            };

    const tenureScenarios = [15, 20, 25, 30].map((years) => ({
      years,
      affordableLoan: round(loanFromEmi(safeNewEmi, annualInterestRate, years * 12)),
      requiredEmi: round(emiForLoan(neededLoan, annualInterestRate, years * 12)),
      requiredHousingPayment: round(emiForLoan(neededLoan, annualInterestRate, years * 12) * (1 + housingOverheadRate))
    }));

    return {
      profile,
      effectiveFiorCap,
      housingOverheadRate,
      safeHousingBudget,
      safeNewEmi,
      maxAffordableLoan,
      maxPropertyBudget,
      neededLoan,
      requiredEmi,
      requiredHousingPayment,
      monthlyStress,
      emiGap,
      loanGap,
      extraDownPaymentNeeded,
      readiness,
      tenureScenarios
    };
  }, [inputs, regionConfig]);

  const stepStyle = (active) => ({
    background: active ? '#0f766e' : '#e2e8f0',
    color: active ? '#fff' : '#334155',
    border: 'none',
    borderRadius: '999px',
    padding: '0.5rem 1rem',
    fontWeight: 600,
    cursor: 'pointer'
  });

  return (
    <div className="calculator-container ppf-container">
      <div className="calculator-card">
        <div className="calculator-header ppf-header">
          <div className="header-nav">
            <HomeButton style={{ position: 'static' }} />
            <div style={{ flex: 1 }} />
          </div>
          <h1 className="header-title">Home Loan Readiness Workflow</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>
            Validate affordability before you commit to a property budget.
          </p>
        </div>

        <div className="mobile-card-content">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button type="button" style={stepStyle(step === 1)} onClick={() => setStep(1)}>
              1. Inputs
            </button>
            <button type="button" style={stepStyle(step === 2)} onClick={() => setStep(2)}>
              2. Affordability
            </button>
            <button type="button" style={stepStyle(step === 3)} onClick={() => setStep(3)}>
              3. Action Plan
            </button>
          </div>

          {step === 1 && (
            <div className="input-section">
              <h2 className="section-title">Step 1: Household and loan assumptions</h2>
              <div className="responsive-grid">
                <div>
                  <label className="input-label">Region</label>
                  <select
                    className="calculator-input"
                    value={inputs.region}
                    onChange={(e) => {
                      const nextRegion = e.target.value;
                      const defaults = regionSettings[nextRegion];
                      setInputs((prev) => ({
                        ...prev,
                        region: nextRegion,
                        ...getRegionDefaults(nextRegion),
                        annualInterestRate: defaults.defaultInterestRate,
                        tenureYears: defaults.defaultTenureYears
                      }));
                    }}
                  >
                    <option value="india">India</option>
                    <option value="us">United States</option>
                    <option value="eu">EU/UK (Generic)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">
                    {regionConfig.monthlyIncomeLabel} ({regionConfig.currency})
                  </label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.monthlyInHand}
                    onChange={(e) => setInputs((prev) => ({ ...prev, monthlyInHand: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">
                    {regionConfig.monthlyExpensesLabel} ({regionConfig.currency})
                  </label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.monthlyFixedExpenses}
                    onChange={(e) => setInputs((prev) => ({ ...prev, monthlyFixedExpenses: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">
                    {regionConfig.existingDebtLabel} ({regionConfig.currency})
                  </label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.existingEMI}
                    onChange={(e) => setInputs((prev) => ({ ...prev, existingEMI: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">
                    {regionConfig.downPaymentLabel} ({regionConfig.currency})
                  </label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.downPayment}
                    onChange={(e) => setInputs((prev) => ({ ...prev, downPayment: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">
                    {regionConfig.propertyCostLabel} ({regionConfig.currency})
                  </label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.targetPropertyCost}
                    onChange={(e) => setInputs((prev) => ({ ...prev, targetPropertyCost: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">Interest Rate (% per year)</label>
                  <input
                    className="calculator-input"
                    type="number"
                    step="0.1"
                    min="0"
                    value={inputs.annualInterestRate}
                    onChange={(e) => setInputs((prev) => ({ ...prev, annualInterestRate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">Loan Tenure (years)</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="1"
                    value={inputs.tenureYears}
                    onChange={(e) => setInputs((prev) => ({ ...prev, tenureYears: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">Risk Profile</label>
                  <select
                    className="calculator-input"
                    value={inputs.riskProfile}
                    onChange={(e) => setInputs((prev) => ({ ...prev, riskProfile: e.target.value }))}
                  >
                    <option value="conservative">Conservative</option>
                    <option value="balanced">Balanced</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', color: '#475569', fontSize: '0.92rem' }}>
                Model assumptions: {regionConfig.assumptions}
              </div>
              <button className="calculator-button primary-button" type="button" onClick={() => setStep(2)}>
                Continue to Affordability
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="results-container">
              <h2 className="results-title">Step 2: Affordability snapshot</h2>
              <div className="responsive-grid">
                <div className="result-item">
                  <p className="result-label">
                    <ShieldCheck size={16} /> Safe new EMI
                  </p>
                  <p className="result-value">{formatCurrency(output.safeNewEmi, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <Wallet size={16} /> Safe total housing budget
                  </p>
                  <p className="result-value">{formatCurrency(output.safeHousingBudget, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <Home size={16} /> Max affordable loan
                  </p>
                  <p className="result-value">{formatCurrency(output.maxAffordableLoan, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <Wallet size={16} /> Max property budget (incl. down payment)
                  </p>
                  <p className="result-value">{formatCurrency(output.maxPropertyBudget, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <AlertTriangle size={16} /> Required EMI for target
                  </p>
                  <p className="result-value">{formatCurrency(output.requiredEmi, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <AlertTriangle size={16} /> Required total housing payment
                  </p>
                  <p className="result-value">{formatCurrency(output.requiredHousingPayment, regionConfig)}</p>
                </div>
              </div>

              <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                Monthly balance after required housing payment:{' '}
                <strong>{formatCurrency(output.monthlyStress, regionConfig)}</strong>
                <div style={{ marginTop: '0.4rem', color: '#64748b', fontSize: '0.9rem' }}>
                  Effective FIOR cap used: {(output.effectiveFiorCap * 100).toFixed(0)}% | Estimated overhead:{' '}
                  {(output.housingOverheadRate * 100).toFixed(0)}%
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="calculator-button" type="button" onClick={() => setStep(1)}>
                  Back to Inputs
                </button>
                <button className="calculator-button success-button" type="button" onClick={() => setStep(3)}>
                  Continue to Action Plan
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="results-container">
              <h2 className="results-title">Step 3: Readiness and action plan</h2>
              <div
                style={{
                  borderLeft: `6px solid ${output.readiness.color}`,
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, color: output.readiness.color }}>
                  <CheckCircle2 size={16} style={{ verticalAlign: 'middle' }} /> {output.readiness.label}
                </p>
                <p style={{ margin: '0.4rem 0 0 0', color: '#334155' }}>{output.readiness.reason}</p>
              </div>

              <div className="responsive-grid">
                <div className="result-item">
                  <p className="result-label">Required loan</p>
                  <p className="result-value">{formatCurrency(output.neededLoan, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">Loan affordability gap</p>
                  <p className="result-value">{formatCurrency(output.loanGap, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">Housing payment gap</p>
                  <p className="result-value">{formatCurrency(output.emiGap, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">Extra down payment needed</p>
                  <p className="result-value">{formatCurrency(output.extraDownPaymentNeeded, regionConfig)}</p>
                </div>
              </div>

              <h3 style={{ marginTop: '1.2rem', marginBottom: '0.8rem', color: '#1e293b' }}>Tenure sensitivity</h3>
              <div className="responsive-grid">
                {output.tenureScenarios.map((scenario) => (
                  <div key={scenario.years} className="result-item">
                    <p className="result-label">{scenario.years}-year tenure</p>
                    <p style={{ marginBottom: '0.35rem', color: '#334155' }}>
                      Affordable loan: <strong>{formatCurrency(scenario.affordableLoan, regionConfig)}</strong>
                    </p>
                    <p style={{ color: '#334155' }}>
                      Required EMI: <strong>{formatCurrency(scenario.requiredEmi, regionConfig)}</strong>
                    </p>
                    <p style={{ color: '#334155' }}>
                      Total housing payment:{' '}
                      <strong>{formatCurrency(scenario.requiredHousingPayment, regionConfig)}</strong>
                    </p>
                  </div>
                ))}
              </div>

              <button className="calculator-button" type="button" onClick={() => setStep(2)}>
                Back to Affordability
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeLoanReadinessWorkflow;
