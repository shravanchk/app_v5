import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Car, Fuel, Wallet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import HomeButton from './HomeButton';
import EEATPanel from './calculator/EEATPanel';
import SearchLandingSections from './calculator/SearchLandingSections';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/schema';
import { editorialProfiles } from '../utils/editorialProfiles';

const regionSettings = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    distanceUnit: 'km',
    fuelUnit: 'litre',
    efficiencyLabel: 'Fuel efficiency (km/litre)',
    fuelPriceLabel: 'Fuel price per litre',
    transportRatio: 0.16,
    safetyBuffer: 15000,
    defaults: {
      monthlyInHand: 120000,
      monthlyFixedExpenses: 45000,
      carEmi: 18000,
      roundTripDistance: 36,
      officeDays: 22,
      fuelEfficiency: 16,
      fuelPrice: 105,
      monthlyTolls: 2200,
      monthlyParking: 1800,
      monthlyMaintenance: 2500,
      annualInsurance: 28000,
      carValue: 1200000,
      annualDepreciationPct: 12,
      alternativeCommuteMonthly: 5500
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    distanceUnit: 'miles',
    fuelUnit: 'gallon',
    efficiencyLabel: 'Fuel efficiency (miles/gallon)',
    fuelPriceLabel: 'Fuel price per gallon',
    transportRatio: 0.15,
    safetyBuffer: 800,
    defaults: {
      monthlyInHand: 6500,
      monthlyFixedExpenses: 2800,
      carEmi: 450,
      roundTripDistance: 24,
      officeDays: 20,
      fuelEfficiency: 28,
      fuelPrice: 3.8,
      monthlyTolls: 75,
      monthlyParking: 140,
      monthlyMaintenance: 120,
      annualInsurance: 1800,
      carValue: 28000,
      annualDepreciationPct: 15,
      alternativeCommuteMonthly: 240
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    distanceUnit: 'km',
    fuelUnit: 'litre',
    efficiencyLabel: 'Fuel efficiency (km/litre)',
    fuelPriceLabel: 'Fuel price per litre',
    transportRatio: 0.15,
    safetyBuffer: 700,
    defaults: {
      monthlyInHand: 4600,
      monthlyFixedExpenses: 2100,
      carEmi: 320,
      roundTripDistance: 28,
      officeDays: 20,
      fuelEfficiency: 17,
      fuelPrice: 1.9,
      monthlyTolls: 45,
      monthlyParking: 70,
      monthlyMaintenance: 95,
      annualInsurance: 900,
      carValue: 22000,
      annualDepreciationPct: 13,
      alternativeCommuteMonthly: 180
    }
  }
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionSettings[regionKey]?.defaults;
  return {
    monthlyInHand: defaults?.monthlyInHand ?? 0,
    monthlyFixedExpenses: defaults?.monthlyFixedExpenses ?? 0,
    carEmi: defaults?.carEmi ?? 0,
    roundTripDistance: defaults?.roundTripDistance ?? 0,
    officeDays: defaults?.officeDays ?? 0,
    fuelEfficiency: defaults?.fuelEfficiency ?? 0,
    fuelPrice: defaults?.fuelPrice ?? 0,
    monthlyTolls: defaults?.monthlyTolls ?? 0,
    monthlyParking: defaults?.monthlyParking ?? 0,
    monthlyMaintenance: defaults?.monthlyMaintenance ?? 0,
    annualInsurance: defaults?.annualInsurance ?? 0,
    carValue: defaults?.carValue ?? 0,
    annualDepreciationPct: defaults?.annualDepreciationPct ?? 0,
    alternativeCommuteMonthly: defaults?.alternativeCommuteMonthly ?? 0
  };
};

const round = (value) => Math.round(value);

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const CarOwnershipCostWorkflow = () => {
  const baseRegion = 'india';
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion)
  });

  const regionConfig = regionSettings[inputs.region];

  const output = useMemo(() => {
    const monthlyInHand = Math.max(0, Number(inputs.monthlyInHand) || 0);
    const monthlyFixedExpenses = Math.max(0, Number(inputs.monthlyFixedExpenses) || 0);
    const carEmi = Math.max(0, Number(inputs.carEmi) || 0);
    const roundTripDistance = Math.max(0, Number(inputs.roundTripDistance) || 0);
    const officeDays = Math.max(0, Number(inputs.officeDays) || 0);
    const fuelEfficiency = Math.max(0.1, Number(inputs.fuelEfficiency) || 0.1);
    const fuelPrice = Math.max(0, Number(inputs.fuelPrice) || 0);
    const monthlyTolls = Math.max(0, Number(inputs.monthlyTolls) || 0);
    const monthlyParking = Math.max(0, Number(inputs.monthlyParking) || 0);
    const monthlyMaintenance = Math.max(0, Number(inputs.monthlyMaintenance) || 0);
    const annualInsurance = Math.max(0, Number(inputs.annualInsurance) || 0);
    const carValue = Math.max(0, Number(inputs.carValue) || 0);
    const annualDepreciationPct = Math.max(0, Number(inputs.annualDepreciationPct) || 0);
    const alternativeCommuteMonthly = Math.max(0, Number(inputs.alternativeCommuteMonthly) || 0);

    const monthlyDistance = round(roundTripDistance * officeDays);
    const monthlyFuelUnits = monthlyDistance / fuelEfficiency;
    const monthlyFuelCost = round(monthlyFuelUnits * fuelPrice);
    const insuranceMonthly = round(annualInsurance / 12);
    const monthlyDepreciation = round((carValue * annualDepreciationPct / 100) / 12);
    const commuteOnlyCost = round(monthlyFuelCost + monthlyTolls + monthlyParking);
    const trueOwnershipCost = round(
      monthlyFuelCost +
      monthlyTolls +
      monthlyParking +
      monthlyMaintenance +
      insuranceMonthly +
      monthlyDepreciation +
      carEmi
    );
    const transportBudgetTarget = round(
      Math.max(
        0,
        Math.min(
          monthlyInHand * regionConfig.transportRatio,
          monthlyInHand - monthlyFixedExpenses - regionConfig.safetyBuffer
        )
      )
    );
    const postOwnershipBuffer = round(monthlyInHand - monthlyFixedExpenses - trueOwnershipCost);
    const postAlternativeBuffer = round(monthlyInHand - monthlyFixedExpenses - alternativeCommuteMonthly);
    const monthlyGapVsAlternative = round(trueOwnershipCost - alternativeCommuteMonthly);
    const annualOwnershipCost = round(trueOwnershipCost * 12);
    const annualAlternativeCost = round(alternativeCommuteMonthly * 12);
    const annualSavingsWithAlternative = round(Math.max(0, annualOwnershipCost - annualAlternativeCost));
    const costSharePct = monthlyInHand > 0 ? (trueOwnershipCost / monthlyInHand) * 100 : 0;
    const oneOfficeDayDriveCost = round(
      (roundTripDistance / fuelEfficiency) * fuelPrice +
      (officeDays > 0 ? monthlyTolls / officeDays : 0) +
      (officeDays > 0 ? monthlyParking / officeDays : 0)
    );
    const fourDaysHybridSavings = round(oneOfficeDayDriveCost * 4);

    let recommendation;
    if (postOwnershipBuffer < 0 || trueOwnershipCost > monthlyInHand * 0.25) {
      recommendation = {
        label: 'Car cost is too heavy',
        color: '#dc2626',
        reason: 'Transport is consuming too much of monthly income after essential expenses.'
      };
    } else if (trueOwnershipCost > transportBudgetTarget || postOwnershipBuffer < regionConfig.safetyBuffer) {
      recommendation = {
        label: 'Manageable, but tight',
        color: '#d97706',
        reason: 'You can carry this cost, but it leaves less room for savings, emergencies, and future goals.'
      };
    } else if (alternativeCommuteMonthly > 0 && monthlyGapVsAlternative > transportBudgetTarget * 0.35) {
      recommendation = {
        label: 'Use a hybrid commute',
        color: '#2563eb',
        reason: 'Owning and driving is workable, but the cheaper commute option saves enough to matter.'
      };
    } else {
      recommendation = {
        label: 'Current car budget is reasonable',
        color: '#059669',
        reason: 'Your monthly transport cost fits the modeled budget without stressing cash flow.'
      };
    }

    const actionItems = [
      `Fuel alone costs about ${formatCurrency(monthlyFuelCost, regionConfig)} per month across ${monthlyDistance} ${regionConfig.distanceUnit}.`,
      `Keep total transport cost near ${formatCurrency(transportBudgetTarget, regionConfig)} or below to protect other goals.`,
      alternativeCommuteMonthly > 0
        ? `A cheaper commute option saves about ${formatCurrency(Math.max(0, monthlyGapVsAlternative), regionConfig)} per month and ${formatCurrency(annualSavingsWithAlternative, regionConfig)} per year.`
        : 'Compare this against a public transport or car-pool alternative if you want a true decision view.',
      `Cutting four office commute days per month saves about ${formatCurrency(fourDaysHybridSavings, regionConfig)} without changing the car itself.`
    ];

    return {
      monthlyDistance,
      monthlyFuelUnits: round(monthlyFuelUnits * 10) / 10,
      monthlyFuelCost,
      insuranceMonthly,
      monthlyDepreciation,
      commuteOnlyCost,
      trueOwnershipCost,
      transportBudgetTarget,
      postOwnershipBuffer,
      postAlternativeBuffer,
      monthlyGapVsAlternative,
      annualOwnershipCost,
      annualAlternativeCost,
      annualSavingsWithAlternative,
      costSharePct,
      oneOfficeDayDriveCost,
      fourDaysHybridSavings,
      recommendation,
      actionItems
    };
  }, [inputs, regionConfig]);

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Car Ownership Cost Workflow',
    url: 'https://upaman.com/car-ownership-cost-workflow',
    description: 'Transport budgeting workflow with fuel expense, EMI, insurance, maintenance, depreciation, and cheaper-commute comparison.',
    applicationCategory: 'FinanceApplication',
    featureList: [
      'Fuel Expense Calculator',
      'Monthly Car Cost Breakdown',
      'Alternative Commute Comparison',
      'Transport Budget Check'
    ]
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'Car Ownership Cost Workflow', item: 'https://upaman.com/car-ownership-cost-workflow' }
  ]);

  const seoFaqItems = [
    {
      question: 'Why is fuel cost alone not enough to budget for a car?',
      answer: 'Fuel is only the running-cost layer. EMI, insurance, maintenance, parking, tolls, and depreciation usually change the real monthly affordability picture much more than people expect.'
    },
    {
      question: 'What transport budget is considered safe?',
      answer: 'This workflow uses a conservative share of monthly in-hand income and leaves a safety buffer after fixed expenses. The exact number depends on region and existing obligations.'
    },
    {
      question: 'When does a cheaper commute option become worth considering?',
      answer: 'If the cheaper option saves a meaningful amount every month and your current car budget is crowding out savings, emergency funds, or debt reduction, it is worth testing.'
    }
  ];

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
          <h1 className="header-title">Car Ownership Cost Workflow</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>
            Estimate true monthly driving cost with fuel, EMI, insurance, upkeep, and a cheaper-commute comparison.
          </p>
        </div>

        <div className="mobile-card-content">
          <EEATPanel
            author={editorialProfiles.researchTeam}
            reviewer={editorialProfiles.financeReviewDesk}
            reviewedOn="March 14, 2026"
            scope="This workflow estimates transport affordability using user-entered driving, loan, and upkeep assumptions. It is for planning, not insurer or lender validation."
            sources={[
              { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
              { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/' },
              { label: 'NHTSA Vehicle Ownership Resources', url: 'https://www.nhtsa.gov/road-safety' }
            ]}
          />

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button type="button" style={stepStyle(step === 1)} onClick={() => setStep(1)}>
              1. Inputs
            </button>
            <button type="button" style={stepStyle(step === 2)} onClick={() => setStep(2)}>
              2. Cost View
            </button>
            <button type="button" style={stepStyle(step === 3)} onClick={() => setStep(3)}>
              3. Action Plan
            </button>
          </div>

          {step === 1 && (
            <div className="input-section">
              <h2 className="section-title">Step 1: Car and commute assumptions</h2>
              <div style={helperBoxStyle}>
                <strong>How to use this step:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Use net monthly income and only essential fixed expenses.</li>
                  <li>Enter realistic commute distance and office days, not best-case estimates.</li>
                  <li>Include EMI and upkeep even if fuel feels like the main expense. That is where transport budgets usually get distorted.</li>
                </ul>
              </div>
              <div className="responsive-grid">
                <div>
                  <label className="input-label">{withTipLabel('Region', 'Changes defaults, labels, currency, and budget assumptions.')}</label>
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
                  <label className="input-label">{withTipLabel(`Monthly in-hand income (${regionConfig.currency})`, 'Use post-tax income available for actual spending.')}</label>
                  <input className="calculator-input" type="number" value={inputs.monthlyInHand} onChange={(e) => setInputs((prev) => ({ ...prev, monthlyInHand: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Monthly fixed expenses (${regionConfig.currency})`, 'Rent, EMIs, groceries, utilities, school fees, and other non-negotiable bills.')}</label>
                  <input className="calculator-input" type="number" value={inputs.monthlyFixedExpenses} onChange={(e) => setInputs((prev) => ({ ...prev, monthlyFixedExpenses: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Car EMI (${regionConfig.currency})`, 'Set to zero if the vehicle is already fully paid off.')}</label>
                  <input className="calculator-input" type="number" value={inputs.carEmi} onChange={(e) => setInputs((prev) => ({ ...prev, carEmi: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Daily round-trip commute (${regionConfig.distanceUnit})`, 'Distance for one workday there-and-back travel.')}</label>
                  <input className="calculator-input" type="number" value={inputs.roundTripDistance} onChange={(e) => setInputs((prev) => ({ ...prev, roundTripDistance: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Office days per month', 'Use expected office or driving days, not calendar days.')}</label>
                  <input className="calculator-input" type="number" value={inputs.officeDays} onChange={(e) => setInputs((prev) => ({ ...prev, officeDays: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(regionConfig.efficiencyLabel, 'Average real-world efficiency is better than brochure numbers.')}</label>
                  <input className="calculator-input" type="number" value={inputs.fuelEfficiency} onChange={(e) => setInputs((prev) => ({ ...prev, fuelEfficiency: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`${regionConfig.fuelPriceLabel} (${regionConfig.currency})`, 'Use the regular fuel price you actually pay.')}</label>
                  <input className="calculator-input" type="number" value={inputs.fuelPrice} onChange={(e) => setInputs((prev) => ({ ...prev, fuelPrice: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Monthly tolls (${regionConfig.currency})`, 'Fastag, toll roads, congestion charges, or similar recurring commute charges.')}</label>
                  <input className="calculator-input" type="number" value={inputs.monthlyTolls} onChange={(e) => setInputs((prev) => ({ ...prev, monthlyTolls: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Monthly parking (${regionConfig.currency})`, 'Office parking, building parking, or public parking passes.')}</label>
                  <input className="calculator-input" type="number" value={inputs.monthlyParking} onChange={(e) => setInputs((prev) => ({ ...prev, monthlyParking: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Monthly maintenance reserve (${regionConfig.currency})`, 'Tyres, servicing, minor repairs, washing, and misc upkeep reserve.')}</label>
                  <input className="calculator-input" type="number" value={inputs.monthlyMaintenance} onChange={(e) => setInputs((prev) => ({ ...prev, monthlyMaintenance: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Annual insurance (${regionConfig.currency})`, 'Full-year insurance premium; the model converts this to monthly cost.')}</label>
                  <input className="calculator-input" type="number" value={inputs.annualInsurance} onChange={(e) => setInputs((prev) => ({ ...prev, annualInsurance: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Current car value (${regionConfig.currency})`, 'Approximate resale or current market value for depreciation estimate.')}</label>
                  <input className="calculator-input" type="number" value={inputs.carValue} onChange={(e) => setInputs((prev) => ({ ...prev, carValue: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel('Annual depreciation (%)', 'Approximate annual drop in car value. Use a conservative estimate.')}</label>
                  <input className="calculator-input" type="number" value={inputs.annualDepreciationPct} onChange={(e) => setInputs((prev) => ({ ...prev, annualDepreciationPct: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">{withTipLabel(`Alternative monthly commute cost (${regionConfig.currency})`, 'Public transport, car-pool, taxi budget, or hybrid commute benchmark.')}</label>
                  <input className="calculator-input" type="number" value={inputs.alternativeCommuteMonthly} onChange={(e) => setInputs((prev) => ({ ...prev, alternativeCommuteMonthly: e.target.value }))} />
                </div>
              </div>

              <button
                type="button"
                className="calculator-button success-button"
                style={{ marginTop: '1.1rem', width: 'auto', minWidth: '220px' }}
                onClick={() => setStep(2)}
              >
                Continue to Cost View
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="results-container">
              <h2 className="results-title">Step 2: True monthly car cost</h2>

              <div style={helperBoxStyle}>
                <strong>How to read this:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Fuel cost is only one part of total transport spending.</li>
                  <li>The all-in car number is what matters for budgeting decisions.</li>
                  <li>Compare car cost with the cheaper commute option before treating driving as a fixed necessity.</li>
                </ul>
              </div>

              <div className="responsive-grid">
                <div className="result-item">
                  <p className="result-label"><Fuel size={16} /> Monthly fuel cost</p>
                  <p className="result-value">{formatCurrency(output.monthlyFuelCost, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label"><Car size={16} /> Commute distance / month</p>
                  <p className="result-value">{`${output.monthlyDistance} ${regionConfig.distanceUnit}`}</p>
                </div>
                <div className="result-item">
                  <p className="result-label"><Wallet size={16} /> Commute-only cost</p>
                  <p className="result-value">{formatCurrency(output.commuteOnlyCost, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label"><Car size={16} /> True car ownership cost</p>
                  <p className="result-value">{formatCurrency(output.trueOwnershipCost, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label"><ShieldCheck size={16} /> Suggested transport budget</p>
                  <p className="result-value">{formatCurrency(output.transportBudgetTarget, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label"><Wallet size={16} /> Cost vs alternative</p>
                  <p className="result-value">{formatCurrency(output.monthlyGapVsAlternative, regionConfig)}</p>
                </div>
              </div>

              <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                Transport cost share of income: <strong>{output.costSharePct.toFixed(1)}%</strong>
              </div>

              <ComparisonBars
                title="Monthly transport comparison"
                items={[
                  { label: 'Fuel only', value: output.monthlyFuelCost, color: '#0f766e' },
                  { label: 'Commute-only cost', value: output.commuteOnlyCost, color: '#1d4e89' },
                  { label: 'True car cost', value: output.trueOwnershipCost, color: '#b45309' },
                  { label: 'Alternative commute', value: Number(inputs.alternativeCommuteMonthly) || 0, color: '#7c3aed' },
                  { label: 'Suggested budget', value: output.transportBudgetTarget, color: '#475569' }
                ]}
                formatter={(value) => formatCurrency(value, regionConfig)}
              />

              <PieBreakdownChart
                title="Where the car budget goes"
                items={[
                  { label: 'Fuel', value: output.monthlyFuelCost, color: '#0f766e' },
                  { label: 'Tolls + parking', value: (Number(inputs.monthlyTolls) || 0) + (Number(inputs.monthlyParking) || 0), color: '#1d4e89' },
                  { label: 'EMI', value: Number(inputs.carEmi) || 0, color: '#b45309' },
                  { label: 'Maintenance', value: Number(inputs.monthlyMaintenance) || 0, color: '#7c3aed' },
                  { label: 'Insurance', value: output.insuranceMonthly, color: '#14b8a6' },
                  { label: 'Depreciation', value: output.monthlyDepreciation, color: '#f97316' }
                ]}
                formatter={(value) => formatCurrency(value, regionConfig)}
              />

              <button
                type="button"
                className="calculator-button success-button"
                style={{ marginTop: '1.1rem', width: 'auto', minWidth: '220px' }}
                onClick={() => setStep(3)}
              >
                Continue to Action Plan
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="results-container">
              <h2 className="results-title">Step 3: Recommendation and next step</h2>
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
                <strong>How to use this plan:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.1rem' }}>
                  <li>Focus on all-in monthly cost, not just fuel savings.</li>
                  <li>If the budget is tight, first attack the commute pattern before changing the car itself.</li>
                  <li>Re-run this when fuel price, office frequency, or EMI changes.</li>
                </ul>
              </div>

              <div className="responsive-grid">
                <div className="result-item">
                  <p className="result-label"><Wallet size={16} /> Buffer after car cost</p>
                  <p className="result-value">{formatCurrency(output.postOwnershipBuffer, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label"><Wallet size={16} /> Buffer with cheaper commute</p>
                  <p className="result-value">{formatCurrency(output.postAlternativeBuffer, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label"><Fuel size={16} /> One office-day driving cost</p>
                  <p className="result-value">{formatCurrency(output.oneOfficeDayDriveCost, regionConfig)}</p>
                </div>
                <div className="result-item">
                  <p className="result-label"><ShieldCheck size={16} /> 4-day hybrid saving</p>
                  <p className="result-value">{formatCurrency(output.fourDaysHybridSavings, regionConfig)}</p>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Action checklist</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', lineHeight: 1.6 }}>
                  {output.actionItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#ffffff', padding: '1rem', marginTop: '1rem' }}>
                <h3 style={{ marginTop: 0, color: '#0f2a43' }}>Annual view</h3>
                <div className="responsive-grid">
                  <div className="result-item">
                    <p className="result-label">Annual car cost</p>
                    <p className="result-value">{formatCurrency(output.annualOwnershipCost, regionConfig)}</p>
                  </div>
                  <div className="result-item">
                    <p className="result-label">Annual alternative cost</p>
                    <p className="result-value">{formatCurrency(output.annualAlternativeCost, regionConfig)}</p>
                  </div>
                  <div className="result-item">
                    <p className="result-label">Annual saving if you switch</p>
                    <p className="result-value">{formatCurrency(output.annualSavingsWithAlternative, regionConfig)}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Next-step tools</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', lineHeight: 1.6 }}>
                  <li><a href="/job-offer-workflow">Job offer decision workflow</a></li>
                  <li><a href="/emergency-fund-readiness-workflow">Emergency fund readiness workflow</a></li>
                  <li><a href="/loan-calculator">Loan and EMI calculator</a></li>
                </ul>
              </div>

              <button className="calculator-button" type="button" onClick={() => setStep(2)}>
                Back to Cost View
              </button>
            </div>
          )}

          <SearchLandingSections
            intro={(
              <>
                <p>
                  A fuel expense calculator is useful, but it usually understates what a car actually costs each month.
                  The bigger budgeting mistake is ignoring EMI, insurance, maintenance, and depreciation when deciding
                  whether a vehicle is comfortably affordable.
                </p>
                <p>
                  This workflow treats fuel as one part of a wider transport-budget decision. That makes it more useful
                  for monthly planning, offer evaluation, and commute optimization than a fuel-only tool.
                </p>
              </>
            )}
            example={(
              <p>
                Suppose you drive a 36 km round trip for 22 office days, your car returns 16 km per litre, and fuel is
                priced at 105 per litre. That gives a monthly fuel bill of roughly 5,200. Once EMI, parking, tolls,
                insurance, and depreciation are added, the true transport cost becomes much higher than the fuel number
                alone.
              </p>
            )}
            formula={(
              <p>
                Core flow: monthly commute distance = round-trip distance multiplied by office days. Fuel cost =
                monthly distance divided by fuel efficiency, multiplied by fuel price. True ownership cost = fuel +
                tolls + parking + maintenance + monthly insurance + monthly depreciation + EMI. The tool then compares
                this against a safer transport-budget target and an alternative commute benchmark.
              </p>
            )}
            faqItems={seoFaqItems}
            relatedLinks={[
              { label: 'Car Ownership Cost Guide', href: '/guides/car-ownership-cost-guide' },
              { label: 'Loan and EMI calculator', href: '/loan-calculator' },
              { label: 'Job offer decision workflow', href: '/job-offer-workflow' },
              { label: 'Emergency fund readiness workflow', href: '/emergency-fund-readiness-workflow' }
            ]}
            softwareSchema={softwareSchema}
          />
        </div>
      </div>
    </div>
  );
};

export default CarOwnershipCostWorkflow;
