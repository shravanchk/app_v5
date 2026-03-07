import React, { useMemo, useState } from 'react';
import { Briefcase, TrendingUp, PiggyBank, Wallet, CheckCircle2 } from 'lucide-react';
import HomeButton from './HomeButton';

const regionConfigs = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    annualCompLabel: 'Annual CTC',
    fixedCostLabel: 'Monthly Fixed Costs (Rent + Existing EMI + Essentials)',
    taxModelLabel: 'India progressive estimate with cess and professional tax assumptions.',
    employeeContributionRate: 0.12,
    employeeContributionCap: 21600,
    standardDeduction: 0,
    cessRate: 0.04,
    decisionThresholds: {
      realGainLow: 7000,
      monthlySurplusTight: 18000
    },
    taxBrackets: [
      { upTo: 400000, rate: 0 },
      { upTo: 800000, rate: 0.05 },
      { upTo: 1200000, rate: 0.1 },
      { upTo: 1600000, rate: 0.15 },
      { upTo: 2000000, rate: 0.2 },
      { upTo: 2400000, rate: 0.25 },
      { upTo: Infinity, rate: 0.3 }
    ],
    locationTiers: {
      high: {
        label: 'Tier 1 Metro',
        costIndex: 1.0,
        localChargeFixed: 2500,
        localChargeRate: 0
      },
      mid: {
        label: 'Tier 2 City',
        costIndex: 0.82,
        localChargeFixed: 2000,
        localChargeRate: 0
      },
      low: {
        label: 'Tier 3 / Small Town',
        costIndex: 0.7,
        localChargeFixed: 1200,
        localChargeRate: 0
      }
    },
    defaults: {
      currentComp: 800000,
      newComp: 1200000,
      monthlyFixedCosts: 35000,
      currentLocation: 'mid',
      newLocation: 'high'
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    annualCompLabel: 'Annual Gross Pay',
    fixedCostLabel: 'Monthly Fixed Costs (Housing + Debt + Essentials)',
    taxModelLabel: 'Federal-style progressive estimate with payroll and local tax assumptions.',
    employeeContributionRate: 0.0765,
    employeeContributionCap: Infinity,
    standardDeduction: 14600,
    cessRate: 0,
    decisionThresholds: {
      realGainLow: 550,
      monthlySurplusTight: 1800
    },
    taxBrackets: [
      { upTo: 12000, rate: 0.1 },
      { upTo: 48000, rate: 0.12 },
      { upTo: 103000, rate: 0.22 },
      { upTo: 191000, rate: 0.24 },
      { upTo: Infinity, rate: 0.32 }
    ],
    locationTiers: {
      high: {
        label: 'High-Cost Metro',
        costIndex: 1.2,
        localChargeFixed: 0,
        localChargeRate: 0.06
      },
      mid: {
        label: 'Mid-Cost City',
        costIndex: 1.0,
        localChargeFixed: 0,
        localChargeRate: 0.04
      },
      low: {
        label: 'Lower-Cost City',
        costIndex: 0.86,
        localChargeFixed: 0,
        localChargeRate: 0.025
      }
    },
    defaults: {
      currentComp: 90000,
      newComp: 115000,
      monthlyFixedCosts: 4200,
      currentLocation: 'mid',
      newLocation: 'high'
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    annualCompLabel: 'Annual Gross Pay',
    fixedCostLabel: 'Monthly Fixed Costs (Housing + Debt + Essentials)',
    taxModelLabel: 'EU/UK blended progressive estimate with social and local deduction assumptions.',
    employeeContributionRate: 0.09,
    employeeContributionCap: Infinity,
    standardDeduction: 10000,
    cessRate: 0,
    decisionThresholds: {
      realGainLow: 450,
      monthlySurplusTight: 1500
    },
    taxBrackets: [
      { upTo: 15000, rate: 0 },
      { upTo: 40000, rate: 0.2 },
      { upTo: 85000, rate: 0.3 },
      { upTo: 160000, rate: 0.4 },
      { upTo: Infinity, rate: 0.45 }
    ],
    locationTiers: {
      high: {
        label: 'Major Capital / Financial Center',
        costIndex: 1.18,
        localChargeFixed: 0,
        localChargeRate: 0.035
      },
      mid: {
        label: 'Regional City',
        costIndex: 1.0,
        localChargeFixed: 0,
        localChargeRate: 0.025
      },
      low: {
        label: 'Lower-Cost Town',
        costIndex: 0.88,
        localChargeFixed: 0,
        localChargeRate: 0.015
      }
    },
    defaults: {
      currentComp: 68000,
      newComp: 84000,
      monthlyFixedCosts: 3000,
      currentLocation: 'mid',
      newLocation: 'high'
    }
  }
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionConfigs[regionKey]?.defaults;
  return {
    currentCTC: defaults?.currentComp ?? 0,
    newCTC: defaults?.newComp ?? 0,
    monthlyFixedCosts: defaults?.monthlyFixedCosts ?? 0,
    currentCity: defaults?.currentLocation ?? 'mid',
    newCity: defaults?.newLocation ?? 'high'
  };
};

const profileAllocations = {
  conservative: { sip: 0.3, emergency: 0.45, emiRatio: 0.25 },
  balanced: { sip: 0.4, emergency: 0.25, emiRatio: 0.35 },
  aggressive: { sip: 0.5, emergency: 0.1, emiRatio: 0.4 }
};

const round = (value) => Math.round(value);

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const progressiveTax = (taxableIncome, taxBrackets) => {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let lowerBound = 0;

  for (const bracket of taxBrackets) {
    if (taxableIncome <= lowerBound) break;
    const upperBound = bracket.upTo;
    const taxableAtThisRate = Math.min(taxableIncome, upperBound) - lowerBound;
    if (taxableAtThisRate > 0) {
      tax += taxableAtThisRate * bracket.rate;
    }
    lowerBound = upperBound;
  }

  return round(tax);
};

const calculateTakeHome = (annualComp, regionConfig, locationKey) => {
  const locationTier = regionConfig.locationTiers[locationKey] || regionConfig.locationTiers.mid;
  const contributionCap = regionConfig.employeeContributionCap ?? Infinity;
  const employeeContribution = round(Math.min(annualComp * regionConfig.employeeContributionRate, contributionCap));
  const taxableIncome = Math.max(0, annualComp - employeeContribution - (regionConfig.standardDeduction || 0));
  const baseTax = progressiveTax(taxableIncome, regionConfig.taxBrackets);
  const annualTax = round(baseTax * (1 + (regionConfig.cessRate || 0)));
  const localCharge = round(annualComp * (locationTier.localChargeRate || 0) + (locationTier.localChargeFixed || 0));
  const annualNet = round(annualComp - employeeContribution - annualTax - localCharge);
  const monthlyNet = round(annualNet / 12);
  const realValueMonthly = round(monthlyNet / locationTier.costIndex);

  return {
    employeeContribution,
    annualTax,
    localCharge,
    monthlyNet,
    annualNet,
    realValueMonthly
  };
};

const recommendationFor = (monthlyGain, realGain, monthlySurplus, thresholds) => {
  if (monthlyGain <= 0) {
    return {
      label: 'Do not switch yet',
      reason: 'Your estimated monthly in-hand does not improve after deductions.',
      color: '#dc2626'
    };
  }

  if (realGain < thresholds.realGainLow) {
    return {
      label: 'Negotiate before accepting',
      reason: 'Offer improves cash flow, but cost-of-living adjusted gain is still limited.',
      color: '#d97706'
    };
  }

  if (monthlySurplus < thresholds.monthlySurplusTight) {
    return {
      label: 'Accept with a tighter budget',
      reason: 'Income improves, but discretionary headroom remains tight after fixed costs.',
      color: '#2563eb'
    };
  }

  return {
    label: 'Accept offer',
    reason: 'The offer improves both take-home and monthly planning flexibility.',
    color: '#059669'
  };
};

const JobOfferWorkflow = () => {
  const [step, setStep] = useState(1);
  const baseRegion = 'india';
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion),
    riskProfile: 'balanced'
  });

  const regionConfig = regionConfigs[inputs.region];
  const locationOptions = Object.entries(regionConfig.locationTiers);

  const current = useMemo(
    () => calculateTakeHome(Number(inputs.currentCTC) || 0, regionConfig, inputs.currentCity),
    [inputs.currentCTC, inputs.currentCity, regionConfig]
  );
  const offer = useMemo(
    () => calculateTakeHome(Number(inputs.newCTC) || 0, regionConfig, inputs.newCity),
    [inputs.newCTC, inputs.newCity, regionConfig]
  );

  const deltas = useMemo(() => {
    const monthlyGain = offer.monthlyNet - current.monthlyNet;
    const realGain = offer.realValueMonthly - current.realValueMonthly;
    const taxDelta = offer.annualTax - current.annualTax;
    const contributionDelta = offer.employeeContribution - current.employeeContribution;
    const localChargeDelta = offer.localCharge - current.localCharge;
    const monthlySurplus = Math.max(0, offer.monthlyNet - (Number(inputs.monthlyFixedCosts) || 0));
    const allocation = profileAllocations[inputs.riskProfile];
    const sipSuggestion = round(monthlySurplus * allocation.sip);
    const emergencySuggestion = round(monthlySurplus * allocation.emergency);
    const emiCap = round(offer.monthlyNet * allocation.emiRatio);

    return {
      monthlyGain,
      realGain,
      taxDelta,
      contributionDelta,
      localChargeDelta,
      monthlySurplus,
      sipSuggestion,
      emergencySuggestion,
      emiCap,
      recommendation: recommendationFor(monthlyGain, realGain, monthlySurplus, regionConfig.decisionThresholds)
    };
  }, [offer, current, inputs.monthlyFixedCosts, inputs.riskProfile, regionConfig.decisionThresholds]);

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
          <h1 className="header-title">Job Offer Decision Workflow</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>
            One flow: compare take-home, stress-test monthly budget, then decide.
          </p>
        </div>

        <div className="mobile-card-content">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button type="button" style={stepStyle(step === 1)} onClick={() => setStep(1)}>
              1. Inputs
            </button>
            <button type="button" style={stepStyle(step === 2)} onClick={() => setStep(2)}>
              2. In-hand Impact
            </button>
            <button type="button" style={stepStyle(step === 3)} onClick={() => setStep(3)}>
              3. Decision Plan
            </button>
          </div>

          {step === 1 && (
            <div className="input-section">
              <h2 className="section-title">Step 1: Enter current vs new offer</h2>
              <div style={helperBoxStyle}>
                <strong>How to use this step:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Enter current and new package values from actual offer letters.</li>
                  <li>Choose location types honestly to avoid inflated gain estimates.</li>
                  <li>Keep fixed costs realistic so monthly surplus calculation is useful.</li>
                </ul>
              </div>
              <div className="responsive-grid">
                <div>
                  <label className="input-label">{withTipLabel('Region', 'Changes tax and cost-of-living model assumptions.')}</label>
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
                  <label className="input-label">
                    {withTipLabel(`Current ${regionConfig.annualCompLabel} (${regionConfig.currency})`, 'Use your current total annual package before deductions.')}
                  </label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.currentCTC}
                    onChange={(e) => setInputs((prev) => ({ ...prev, currentCTC: e.target.value }))}
                  />
                  <p style={hintStyle}>Use current effective annual package, not outdated salary.</p>
                </div>
                <div>
                  <label className="input-label">
                    {withTipLabel(`New ${regionConfig.annualCompLabel} (${regionConfig.currency})`, 'Enter the offered annual package to compare against current pay.')}
                  </label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.newCTC}
                    onChange={(e) => setInputs((prev) => ({ ...prev, newCTC: e.target.value }))}
                  />
                  <p style={hintStyle}>If offer has variable pay, use conservative expected value.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Current Location Type', 'Used for cost-of-living adjustment in real-gain comparison.')}</label>
                  <select
                    className="calculator-input"
                    value={inputs.currentCity}
                    onChange={(e) => setInputs((prev) => ({ ...prev, currentCity: e.target.value }))}
                  >
                    {locationOptions.map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('New Location Type', 'Higher-cost location can reduce real benefit even with higher pay.')}</label>
                  <select
                    className="calculator-input"
                    value={inputs.newCity}
                    onChange={(e) => setInputs((prev) => ({ ...prev, newCity: e.target.value }))}
                  >
                    {locationOptions.map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">
                    {withTipLabel(`${regionConfig.fixedCostLabel} (${regionConfig.currency})`, 'Used to estimate post-switch free monthly surplus.')}
                  </label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.monthlyFixedCosts}
                    onChange={(e) => setInputs((prev) => ({ ...prev, monthlyFixedCosts: e.target.value }))}
                  />
                  <p style={hintStyle}>Include rent, EMIs, and recurring essentials only.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Risk Profile', 'Controls suggested split between investing, emergency fund, and EMI cap.')}</label>
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
                Model assumptions: {regionConfig.taxModelLabel}
              </div>
              <button
                className="calculator-button primary-button"
                type="button"
                style={stepPrimaryCtaStyle}
                onClick={() => setStep(2)}
              >
                Continue to In-hand Impact
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="results-container">
              <h2 className="results-title">Step 2: What changes if you switch?</h2>
              <div style={helperBoxStyle}>
                <strong>How to read this step:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Monthly gain is raw cash difference after modeled deductions.</li>
                  <li>Cost-of-living adjusted gain shows real spending-power change.</li>
                  <li>If adjusted gain is low, negotiate or revise expectations before switching.</li>
                </ul>
              </div>
              <div className="responsive-grid">
                <div className="result-item">
                  <p className="result-label">
                    <Briefcase size={16} /> Current in-hand (monthly)
                  </p>
                  <p className="result-value">{formatCurrency(current.monthlyNet, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <TrendingUp size={16} /> New in-hand (monthly)
                  </p>
                  <p className="result-value">{formatCurrency(offer.monthlyNet, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <TrendingUp size={16} /> Monthly gain (actual)
                  </p>
                  <p className="result-value">{formatCurrency(deltas.monthlyGain, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <Wallet size={16} /> Annual tax difference
                  </p>
                  <p className="result-value">{formatCurrency(deltas.taxDelta, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <Wallet size={16} /> Employee contribution difference
                  </p>
                  <p className="result-value">{formatCurrency(deltas.contributionDelta, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <Wallet size={16} /> Local deduction difference
                  </p>
                  <p className="result-value">{formatCurrency(deltas.localChargeDelta, regionConfig)}</p>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                Cost-of-living adjusted monthly gain: <strong>{formatCurrency(deltas.realGain, regionConfig)}</strong>
              </div>

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
                  Continue to Decision Plan
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="results-container">
              <h2 className="results-title">Step 3: Suggested monthly plan</h2>
              <div
                style={{
                  borderLeft: `6px solid ${deltas.recommendation.color}`,
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, color: deltas.recommendation.color }}>
                  <CheckCircle2 size={16} style={{ verticalAlign: 'middle' }} /> {deltas.recommendation.label}
                </p>
                <p style={{ margin: '0.4rem 0 0 0', color: '#334155' }}>{deltas.recommendation.reason}</p>
              </div>

              <div style={helperBoxStyle}>
                <strong>How to use this plan:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Treat this as first-month allocation guidance after switching.</li>
                  <li>Protect emergency runway first, then scale investing and EMI commitments.</li>
                  <li>Re-run after 2-3 salary cycles with actual cash-flow data.</li>
                </ul>
              </div>

              <div className="responsive-grid">
                <div className="result-item">
                  <p className="result-label">
                    <Wallet size={16} /> Free monthly surplus
                  </p>
                  <p className="result-value">{formatCurrency(deltas.monthlySurplus, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <PiggyBank size={16} /> Suggested monthly investing
                  </p>
                  <p className="result-value">{formatCurrency(deltas.sipSuggestion, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <Wallet size={16} /> Emergency fund bucket
                  </p>
                  <p className="result-value">{formatCurrency(deltas.emergencySuggestion, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label">
                    <Briefcase size={16} /> Max EMI cap (profile-based)
                  </p>
                  <p className="result-value">{formatCurrency(deltas.emiCap, regionConfig)}</p>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Action checklist</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155' }}>
                  <li>Keep total EMIs under the suggested cap before accepting bigger liabilities.</li>
                  <li>Automate monthly investing on salary day to maintain discipline.</li>
                  <li>Build 4-6 months emergency runway from the monthly emergency bucket.</li>
                </ul>
              </div>

              <button className="calculator-button" type="button" onClick={() => setStep(2)}>
                Back to In-hand Impact
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobOfferWorkflow;
