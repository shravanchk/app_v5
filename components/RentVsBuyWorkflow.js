import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Home, Wallet, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import HomeButton from './HomeButton';
import EEATPanel from './calculator/EEATPanel';
import SearchLandingSections from './calculator/SearchLandingSections';
import { buildBreadcrumbSchema } from '../utils/schema';
import { editorialProfiles } from '../utils/editorialProfiles';

const regionSettings = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    ownershipCostRate: 0.015,
    closingCostRate: 0.07,
    comfortRatio: 0.35,
    safetyBuffer: 15000,
    defaults: {
      monthlyInHand: 150000,
      monthlyFixedExpenses: 50000,
      homePrice: 10000000,
      downPaymentPct: 20,
      loanRate: 8.5,
      loanYears: 20,
      monthlyRent: 35000,
      rentIncrease: 6,
      homeAppreciation: 5,
      plannedStayYears: 8
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    ownershipCostRate: 0.022,
    closingCostRate: 0.03,
    comfortRatio: 0.32,
    safetyBuffer: 800,
    defaults: {
      monthlyInHand: 9000,
      monthlyFixedExpenses: 3200,
      homePrice: 550000,
      downPaymentPct: 20,
      loanRate: 6.5,
      loanYears: 30,
      monthlyRent: 2600,
      rentIncrease: 4,
      homeAppreciation: 4,
      plannedStayYears: 7
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    ownershipCostRate: 0.018,
    closingCostRate: 0.04,
    comfortRatio: 0.33,
    safetyBuffer: 700,
    defaults: {
      monthlyInHand: 5200,
      monthlyFixedExpenses: 2100,
      homePrice: 360000,
      downPaymentPct: 20,
      loanRate: 4.6,
      loanYears: 25,
      monthlyRent: 1650,
      rentIncrease: 3,
      homeAppreciation: 3,
      plannedStayYears: 7
    }
  }
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionSettings[regionKey]?.defaults;
  return {
    monthlyInHand: defaults?.monthlyInHand ?? 0,
    monthlyFixedExpenses: defaults?.monthlyFixedExpenses ?? 0,
    homePrice: defaults?.homePrice ?? 0,
    downPaymentPct: defaults?.downPaymentPct ?? 0,
    loanRate: defaults?.loanRate ?? 0,
    loanYears: defaults?.loanYears ?? 0,
    monthlyRent: defaults?.monthlyRent ?? 0,
    rentIncrease: defaults?.rentIncrease ?? 0,
    homeAppreciation: defaults?.homeAppreciation ?? 0,
    plannedStayYears: defaults?.plannedStayYears ?? 0
  };
};

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const monthlyEmi = (principal, annualRate, years) => {
  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  if (!principal || !months) return 0;
  if (monthlyRate === 0) return principal / months;
  const growth = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * growth) / (growth - 1);
};

const principalFromPayment = (payment, annualRate, years) => {
  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  if (!payment || !months) return 0;
  if (monthlyRate === 0) return payment * months;
  const growth = Math.pow(1 + monthlyRate, months);
  return (payment * (growth - 1)) / (monthlyRate * growth);
};

const round = (value) => Math.round(value);

const RentVsBuyWorkflow = () => {
  const baseRegion = 'india';
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion)
  });

  const regionConfig = regionSettings[inputs.region];
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Rent vs Buy Decision Workflow', item: 'https://upaman.com/rent-vs-buy-workflow' }
  ]);
  const faqItems = [
    {
      question: 'What usually decides rent versus buy more than anything else?',
      answer: 'Planned stay duration is often the biggest factor because buying has upfront and ownership costs that need time to be recovered.'
    },
    {
      question: 'Why does this workflow use effective cost instead of just EMI versus rent?',
      answer: 'EMI alone misses down payment, closing costs, ownership overhead, and equity built over time. Effective cost is a better decision view.'
    },
    {
      question: 'What if buying is cheaper on paper but my monthly buffer looks weak?',
      answer: 'That usually means buying may still be financially stressful despite a long-run advantage. Monthly resilience still matters.'
    }
  ];

  const output = useMemo(() => {
    const monthlyInHand = Math.max(0, Number(inputs.monthlyInHand) || 0);
    const monthlyFixedExpenses = Math.max(0, Number(inputs.monthlyFixedExpenses) || 0);
    const homePrice = Math.max(0, Number(inputs.homePrice) || 0);
    const downPaymentPct = Math.max(0, Number(inputs.downPaymentPct) || 0);
    const loanRate = Math.max(0, Number(inputs.loanRate) || 0);
    const loanYears = Math.max(1, Number(inputs.loanYears) || 1);
    const monthlyRent = Math.max(0, Number(inputs.monthlyRent) || 0);
    const rentIncrease = Math.max(0, Number(inputs.rentIncrease) || 0);
    const homeAppreciation = Math.max(0, Number(inputs.homeAppreciation) || 0);
    const plannedStayYears = Math.max(1, Number(inputs.plannedStayYears) || 1);

    const downPayment = homePrice * downPaymentPct / 100;
    const closingCosts = homePrice * regionConfig.closingCostRate;
    const loanPrincipal = Math.max(0, homePrice - downPayment);
    const emi = monthlyEmi(loanPrincipal, loanRate, loanYears);
    const baseOwnershipMonthly = (homePrice * regionConfig.ownershipCostRate) / 12;
    const totalBuyMonthly = emi + baseOwnershipMonthly;
    const comfortableHousingBudget = Math.max(
      0,
      Math.min(monthlyInHand * regionConfig.comfortRatio, monthlyInHand - monthlyFixedExpenses - regionConfig.safetyBuffer)
    );
    const monthlyBufferIfBuy = monthlyInHand - monthlyFixedExpenses - totalBuyMonthly;
    const monthlyBufferIfRent = monthlyInHand - monthlyFixedExpenses - monthlyRent;
    const affordabilityGap = Math.max(0, totalBuyMonthly - comfortableHousingBudget);

    const affordableLoan = principalFromPayment(
      Math.max(0, comfortableHousingBudget - baseOwnershipMonthly),
      loanRate,
      loanYears
    );
    const requiredTotalDownPayment = Math.max(0, homePrice - affordableLoan);
    const additionalDownPaymentNeeded = Math.max(0, requiredTotalDownPayment - downPayment);

    const analysisMonths = Math.max(plannedStayYears * 12, loanYears * 12);
    const plannedStayMonth = plannedStayYears * 12;
    const monthlyRate = loanRate / 12 / 100;
    let outstanding = loanPrincipal;
    let cumulativeBuyOutflow = downPayment + closingCosts;
    let cumulativeRentOutflow = 0;
    let breakEvenYear = null;
    let plannedBuyOutflow = downPayment + closingCosts;
    let plannedRentOutflow = 0;
    let plannedHomeValue = homePrice;
    let plannedOutstanding = loanPrincipal;
    const yearlySnapshots = [];

    for (let month = 1; month <= analysisMonths; month += 1) {
      const interest = outstanding * monthlyRate;
      const principalPaid = Math.min(outstanding, Math.max(0, emi - interest));
      outstanding = Math.max(0, outstanding - principalPaid);

      const yearIndex = Math.ceil(month / 12);
      const currentRent = monthlyRent * Math.pow(1 + rentIncrease / 100, yearIndex - 1);
      const currentHomeValue = homePrice * Math.pow(1 + homeAppreciation / 100, yearIndex - 1);
      const maintenanceMonthly = (currentHomeValue * regionConfig.ownershipCostRate) / 12;

      cumulativeBuyOutflow += emi + maintenanceMonthly;
      cumulativeRentOutflow += currentRent;

      const currentEquity = currentHomeValue - outstanding;
      const buyEffectiveCost = cumulativeBuyOutflow - currentEquity;

      if (!breakEvenYear && month % 12 === 0 && buyEffectiveCost <= cumulativeRentOutflow) {
        breakEvenYear = yearIndex;
      }

      if (month === plannedStayMonth) {
        plannedBuyOutflow = cumulativeBuyOutflow;
        plannedRentOutflow = cumulativeRentOutflow;
        plannedHomeValue = currentHomeValue;
        plannedOutstanding = outstanding;
      }

      if (month % 12 === 0 && yearIndex <= Math.max(plannedStayYears, 10)) {
        yearlySnapshots.push({
          year: yearIndex,
          rentOutflow: round(cumulativeRentOutflow),
          buyEffectiveCost: round(buyEffectiveCost)
        });
      }
    }

    const plannedEquity = Math.max(0, plannedHomeValue - plannedOutstanding);
    const plannedBuyEffectiveCost = Math.max(0, plannedBuyOutflow - plannedEquity);
    const monthlyFlexibilityGain = monthlyBufferIfRent - monthlyBufferIfBuy;

    let decision;
    if (monthlyBufferIfBuy < regionConfig.safetyBuffer || affordabilityGap > 0) {
      decision = {
        label: 'Rent for now',
        color: '#dc2626',
        reason: 'Buying strains your monthly cash buffer under current assumptions.'
      };
    } else if (breakEvenYear && breakEvenYear <= plannedStayYears) {
      decision = {
        label: 'Buying looks stronger',
        color: '#059669',
        reason: 'Your planned stay is long enough for buying to beat renting on effective cost.'
      };
    } else {
      decision = {
        label: 'Renting fits better',
        color: '#d97706',
        reason: 'Your planned stay is shorter than the financial break-even timeline.'
      };
    }

    const actionItems = [
      affordabilityGap > 0 || monthlyBufferIfBuy < regionConfig.safetyBuffer
        ? `To make buying comfortable, increase down payment by about ${formatCurrency(additionalDownPaymentNeeded, regionConfig)} or lower target home price.`
        : `Your current monthly cash flow can support a buy path while preserving about ${formatCurrency(monthlyBufferIfBuy, regionConfig)} as monthly buffer.`,
      breakEvenYear
        ? `Buying becomes more favorable around year ${breakEvenYear} under current assumptions.`
        : 'Break-even is not reached within the modeled horizon, so renting stays cheaper on effective cost.',
      monthlyFlexibilityGain > 0
        ? `Renting preserves about ${formatCurrency(monthlyFlexibilityGain, regionConfig)} more monthly flexibility than buying right now.`
        : `Buying uses less monthly cash than renting by about ${formatCurrency(Math.abs(monthlyFlexibilityGain), regionConfig)} under current assumptions.`
    ];

    return {
      downPayment: round(downPayment),
      closingCosts: round(closingCosts),
      loanPrincipal: round(loanPrincipal),
      emi: round(emi),
      baseOwnershipMonthly: round(baseOwnershipMonthly),
      totalBuyMonthly: round(totalBuyMonthly),
      monthlyBufferIfBuy: round(monthlyBufferIfBuy),
      monthlyBufferIfRent: round(monthlyBufferIfRent),
      comfortableHousingBudget: round(comfortableHousingBudget),
      affordabilityGap: round(affordabilityGap),
      affordableLoan: round(affordableLoan),
      additionalDownPaymentNeeded: round(additionalDownPaymentNeeded),
      breakEvenYear,
      plannedRentOutflow: round(plannedRentOutflow),
      plannedBuyOutflow: round(plannedBuyOutflow),
      plannedEquity: round(plannedEquity),
      plannedBuyEffectiveCost: round(plannedBuyEffectiveCost),
      monthlyFlexibilityGain: round(monthlyFlexibilityGain),
      plannedStayYears,
      decision,
      actionItems,
      yearlySnapshots
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
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>
      <div className="calculator-card">
        <div className="calculator-header emi-header">
          <div className="header-nav">
            <HomeButton style={{ position: 'static' }} />
            <div style={{ flex: 1 }} />
          </div>
          <h1 className="header-title">Rent vs Buy Decision Workflow</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>
            Compare monthly affordability, break-even timeline, and flexibility before committing to buying a home.
          </p>
        </div>

        <div className="mobile-card-content">
          <EEATPanel
            author={editorialProfiles.researchTeam}
            reviewer={editorialProfiles.financeReviewDesk}
            reviewedOn="March 14, 2026"
            scope="This workflow compares renting and buying using affordability, effective cost, ownership overhead, and planned stay assumptions."
            sources={[
              { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
              { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/owning-a-home/' },
              { label: 'National Housing Bank', url: 'https://nhb.org.in/' }
            ]}
          />

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
              <h2 className="section-title">Step 1: Housing decision inputs</h2>
              <div style={helperBoxStyle}>
                <strong>How to use this:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Use in-hand or net monthly income, not gross salary.</li>
                  <li>Keep only non-negotiable expenses in fixed expenses.</li>
                  <li>Enter realistic stay duration. This matters more than most people assume.</li>
                </ul>
              </div>
              <div className="responsive-grid">
                <div>
                  <label className="input-label">{withTipLabel('Region', 'Changes defaults, currency, and ownership cost assumptions.')}</label>
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
                  <label className="input-label">{withTipLabel(`Monthly In-hand Income (${regionConfig.currency})`, 'Use post-tax income available for actual spending.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.monthlyInHand}
                    onChange={(e) => setInputs((prev) => ({ ...prev, monthlyInHand: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Monthly Fixed Expenses (${regionConfig.currency})`, 'Include essentials and existing commitments before housing choice.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.monthlyFixedExpenses}
                    onChange={(e) => setInputs((prev) => ({ ...prev, monthlyFixedExpenses: e.target.value }))}
                  />
                  <p style={hintStyle}>Exclude current rent from this field; rent is entered separately.</p>
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Target Home Price (${regionConfig.currency})`, 'The purchase price you are seriously considering.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.homePrice}
                    onChange={(e) => setInputs((prev) => ({ ...prev, homePrice: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Down Payment (%)', 'Percent of home price you can put down immediately.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    max="100"
                    value={inputs.downPaymentPct}
                    onChange={(e) => setInputs((prev) => ({ ...prev, downPaymentPct: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Loan Rate (%)', 'Use realistic borrowing rate, not an ideal best-case quote.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    step="0.1"
                    value={inputs.loanRate}
                    onChange={(e) => setInputs((prev) => ({ ...prev, loanRate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Loan Tenure (Years)', 'Longer tenure lowers EMI but can delay break-even.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="1"
                    value={inputs.loanYears}
                    onChange={(e) => setInputs((prev) => ({ ...prev, loanYears: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Current Monthly Rent (${regionConfig.currency})`, 'Your realistic current or expected rent for a similar home.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    value={inputs.monthlyRent}
                    onChange={(e) => setInputs((prev) => ({ ...prev, monthlyRent: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Annual Rent Increase (%)', 'Use conservative rent growth assumption.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    step="0.1"
                    value={inputs.rentIncrease}
                    onChange={(e) => setInputs((prev) => ({ ...prev, rentIncrease: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Home Appreciation (%)', 'Expected annual property value growth, not a guaranteed return.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="0"
                    step="0.1"
                    value={inputs.homeAppreciation}
                    onChange={(e) => setInputs((prev) => ({ ...prev, homeAppreciation: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Planned Stay (Years)', 'Critical decision input. Buying often fails for short holding periods.')}</label>
                  <input
                    className="calculator-input"
                    type="number"
                    min="1"
                    value={inputs.plannedStayYears}
                    onChange={(e) => setInputs((prev) => ({ ...prev, plannedStayYears: e.target.value }))}
                  />
                </div>
              </div>
              <button type="button" className="calculator-button" style={{ marginTop: '1.1rem', width: 'auto', minWidth: '220px' }} onClick={() => setStep(2)}>
                Continue to comparison
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="results-container" style={{ marginBottom: '1rem' }}>
                <h2 className="results-title">Step 2: Financial comparison</h2>
                <p style={{ marginTop: 0, color: '#475569' }}>
                  <strong style={{ color: output.decision.color }}>{output.decision.label}</strong>:
                  {' '}{output.decision.reason}
                </p>
                <div className="results-grid">
                  <div className="result-item">
                    <div className="result-label">Estimated EMI</div>
                    <div className="result-value principal">{formatCurrency(output.emi, regionConfig)}</div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">Monthly Buy Cost</div>
                    <div className="result-value total">{formatCurrency(output.totalBuyMonthly, regionConfig)}</div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">Monthly Rent Cost</div>
                    <div className="result-value emi">{formatCurrency(Number(inputs.monthlyRent) || 0, regionConfig)}</div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">Break-even</div>
                    <div className="result-value interest">
                      {output.breakEvenYear ? `Year ${output.breakEvenYear}` : 'Not reached'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '1rem' }}>
                <div style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#ffffff', padding: '1rem' }}>
                  <h3 style={{ marginTop: 0, color: '#0f2a43', fontSize: '1rem' }}>Monthly flexibility</h3>
                  <p style={{ margin: '0 0 0.4rem', color: '#334155' }}>
                    Renting buffer: <strong>{formatCurrency(output.monthlyBufferIfRent, regionConfig)}</strong>
                  </p>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Buying buffer: <strong>{formatCurrency(output.monthlyBufferIfBuy, regionConfig)}</strong>
                  </p>
                </div>
                <div style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#ffffff', padding: '1rem' }}>
                  <h3 style={{ marginTop: 0, color: '#0f2a43', fontSize: '1rem' }}>Affordability check</h3>
                  <p style={{ margin: '0 0 0.4rem', color: '#334155' }}>
                    Comfortable housing budget: <strong>{formatCurrency(output.comfortableHousingBudget, regionConfig)}</strong>
                  </p>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Extra down payment needed: <strong>{formatCurrency(output.additionalDownPaymentNeeded, regionConfig)}</strong>
                  </p>
                </div>
              </div>

              <ComparisonBars
                title="Monthly housing comparison"
                items={[
                  { label: 'Current rent', value: Number(inputs.monthlyRent) || 0, color: '#0f766e' },
                  { label: 'Buy monthly cost', value: output.totalBuyMonthly, color: '#1d4e89' },
                  { label: 'Comfortable housing budget', value: output.comfortableHousingBudget, color: '#b45309' }
                ]}
                formatter={(value) => formatCurrency(value, regionConfig)}
              />

              <ComparisonBars
                title={`Effective cost over planned ${output.plannedStayYears}-year stay`}
                items={[
                  { label: 'Rent total outflow', value: output.plannedRentOutflow, color: '#0f766e' },
                  { label: 'Buy effective cost', value: output.plannedBuyEffectiveCost, color: '#1d4e89' }
                ]}
                formatter={(value) => formatCurrency(value, regionConfig)}
              />

              <PieBreakdownChart
                title="Buying path at planned stay end"
                items={[
                  { label: 'Home equity built', value: output.plannedEquity, color: '#22c55e' },
                  { label: 'Net buy cost', value: output.plannedBuyEffectiveCost, color: '#f97316' }
                ]}
                formatter={(value) => formatCurrency(value, regionConfig)}
              />

              <button type="button" className="calculator-button" style={{ marginTop: '1.1rem', width: 'auto', minWidth: '220px' }} onClick={() => setStep(3)}>
                Continue to action plan
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <div
                style={{
                  borderRadius: '1rem',
                  border: `1px solid ${output.decision.color}`,
                  background: `${output.decision.color}12`,
                  padding: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <h2 style={{ marginTop: 0, color: output.decision.color, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} />
                  Recommended direction: {output.decision.label}
                </h2>
                <p style={{ margin: '0 0 0.8rem', color: '#334155' }}>{output.decision.reason}</p>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#334155', lineHeight: 1.6 }}>
                  {output.actionItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '1rem' }}>
                <div style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#ffffff', padding: '1rem' }}>
                  <h3 style={{ marginTop: 0, color: '#0f2a43', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Wallet size={18} />
                    Cash readiness
                  </h3>
                  <p style={{ margin: '0 0 0.4rem', color: '#334155' }}>
                    Down payment: <strong>{formatCurrency(output.downPayment, regionConfig)}</strong>
                  </p>
                  <p style={{ margin: '0 0 0.4rem', color: '#334155' }}>
                    Closing costs: <strong>{formatCurrency(output.closingCosts, regionConfig)}</strong>
                  </p>
                  <p style={{ margin: 0, color: '#334155' }}>
                    If buying, keep separate emergency cash beyond these amounts.
                  </p>
                </div>
                <div style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#ffffff', padding: '1rem' }}>
                  <h3 style={{ marginTop: 0, color: '#0f2a43', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Clock size={18} />
                    Stay-duration rule
                  </h3>
                  <p style={{ margin: '0 0 0.4rem', color: '#334155' }}>
                    Planned stay: <strong>{output.plannedStayYears} years</strong>
                  </p>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Break-even: <strong>{output.breakEvenYear ? `Year ${output.breakEvenYear}` : 'Not reached in model'}</strong>
                  </p>
                </div>
                <div style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#ffffff', padding: '1rem' }}>
                  <h3 style={{ marginTop: 0, color: '#0f2a43', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <ShieldCheck size={18} />
                    Buffer protection
                  </h3>
                  <p style={{ margin: '0 0 0.4rem', color: '#334155' }}>
                    Safe monthly buffer target: <strong>{formatCurrency(regionConfig.safetyBuffer, regionConfig)}</strong>
                  </p>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Buy-path buffer after fixed costs: <strong>{formatCurrency(output.monthlyBufferIfBuy, regionConfig)}</strong>
                  </p>
                </div>
              </div>

              <div style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#ffffff', padding: '1rem' }}>
                <h3 style={{ marginTop: 0, color: '#0f2a43' }}>Year-by-year effective cost checkpoints</h3>
                <div className="responsive-table-container">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Rent Outflow</th>
                        <th>Buy Effective Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {output.yearlySnapshots.map((snapshot) => (
                        <tr key={snapshot.year}>
                          <td>{snapshot.year}</td>
                          <td>{formatCurrency(snapshot.rentOutflow, regionConfig)}</td>
                          <td>{formatCurrency(snapshot.buyEffectiveCost, regionConfig)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <SearchLandingSections
            intro={(
              <>
                <p>
                  Rent versus buy is not an EMI comparison. The real decision depends on stay duration, upfront cash,
                  ownership costs, and whether the buy path still leaves enough monthly flexibility after fixed expenses.
                </p>
                <p>
                  This workflow combines those pieces into one housing decision view so you can see when buying becomes
                  stronger and when renting still protects cash flow better.
                </p>
              </>
            )}
            example={(
              <p>
                A household may find that buying beats renting after year seven, but if the expected stay is only four years
                or the buy path leaves too little monthly buffer, renting can still be the safer decision today.
              </p>
            )}
            formula={(
              <p>
                Core flow: estimate total buy outflow using EMI, down payment, closing costs, and ownership overhead; compare
                it with cumulative rent outflow; subtract built home equity to estimate effective buy cost; then evaluate the
                result against planned stay and monthly buffer protection.
              </p>
            )}
            faqItems={faqItems}
            relatedLinks={[
              { label: 'Buy vs Rent Calculator', href: '/buy-vs-rent-calculator' },
              { label: 'Home Loan Readiness Workflow', href: '/home-loan-readiness-workflow' },
              { label: 'How Much EMI Is Safe Guide', href: '/guides/how-much-emi-is-safe' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default RentVsBuyWorkflow;
