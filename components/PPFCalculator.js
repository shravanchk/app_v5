import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
import { formatINR } from '../utils/calculations';

const PPF_CONTRIBUTION_LIMIT = 150000;

const contributionModes = [
  { value: 'monthly', label: 'Monthly installments' },
  { value: 'yearly-start', label: 'Yearly lump sum (start of year)' },
  { value: 'yearly-end', label: 'Yearly lump sum (end of year)' }
];

const getClampedContribution = (value) => {
  const safeValue = Number(value) || 0;
  return Math.min(Math.max(safeValue, 0), PPF_CONTRIBUTION_LIMIT);
};

const calculatePPFProjection = ({ annualContribution, annualRate, tenureYears, annualStepUp, contributionMode }) => {
  const monthlyRate = (Number(annualRate) || 0) / 100 / 12;
  const years = Math.max(1, Math.floor(Number(tenureYears) || 0));
  const stepUp = Math.max(0, Number(annualStepUp) || 0) / 100;

  let runningBalance = 0;
  let currentContribution = getClampedContribution(annualContribution);
  const projection = [];

  for (let year = 1; year <= years; year += 1) {
    const openingBalance = runningBalance;
    let monthlyBalance = runningBalance;
    let yearlyContribution = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= 12; month += 1) {
      if (contributionMode === 'monthly') {
        const installment = currentContribution / 12;
        monthlyBalance += installment;
        yearlyContribution += installment;
      } else if (contributionMode === 'yearly-start' && month === 1) {
        monthlyBalance += currentContribution;
        yearlyContribution += currentContribution;
      }

      yearlyInterest += monthlyBalance * monthlyRate;

      if (contributionMode === 'yearly-end' && month === 12) {
        monthlyBalance += currentContribution;
        yearlyContribution += currentContribution;
      }
    }

    runningBalance = monthlyBalance + yearlyInterest;

    projection.push({
      year,
      openingBalance,
      yearlyContribution,
      yearlyInterest,
      closingBalance: runningBalance,
      contributionUsed: currentContribution
    });

    currentContribution = getClampedContribution(currentContribution * (1 + stepUp));
  }

  const totalInvested = projection.reduce((sum, row) => sum + row.yearlyContribution, 0);
  const maturityValue = projection[projection.length - 1]?.closingBalance || 0;
  const totalInterest = maturityValue - totalInvested;

  return {
    projection,
    summary: {
      totalInvested,
      maturityValue,
      totalInterest,
      finalAnnualContribution: projection[projection.length - 1]?.contributionUsed || 0
    }
  };
};

const PPFCalculator = () => {
  const [inputs, setInputs] = useState({
    annualContribution: 150000,
    annualRate: 7.1,
    tenureYears: 15,
    annualStepUp: 0,
    contributionMode: 'monthly'
  });
  const [showFullProjection, setShowFullProjection] = useState(false);

  const results = useMemo(() => calculatePPFProjection(inputs), [inputs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('dark-theme', localStorage.getItem('theme') === 'dark');
    }
  }, []);

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const projectionRows = showFullProjection ? results.projection : results.projection.slice(0, 15);
  const hasContributionCap = Number(inputs.annualContribution) > PPF_CONTRIBUTION_LIMIT;
  const ppfShareLines = [
    `Total investment: ${formatINR(results.summary.totalInvested)}`,
    `Estimated maturity value: ${formatINR(results.summary.maturityValue)}`,
    `Estimated total interest: ${formatINR(results.summary.totalInterest)}`,
    `Final annual contribution used: ${formatINR(results.summary.finalAnnualContribution)}`
  ];

  return (
    <div className="calculator-container ppf-container">
      <Head>
        <title>PPF Calculator 2026 India | Maturity, Interest & Yearly Projection | Upaman</title>
        <meta
          name="description"
          content="Free PPF calculator for India. Estimate maturity value, yearly interest accrual and full contribution projection with annual step-up and contribution mode options."
        />
        <meta
          name="keywords"
          content="PPF calculator India, PPF maturity calculator, public provident fund interest calculator, PPF yearly projection, PPF 15 year calculation"
        />
        <link rel="canonical" href="https://upaman.com/ppf-calculator" />
        <meta property="og:title" content="PPF Calculator India | Upaman" />
        <meta
          property="og:description"
          content="Calculate Public Provident Fund maturity value, total investment and interest with a detailed year-wise projection."
        />
        <meta property="og:url" content="https://upaman.com/ppf-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <meta property="og:image:alt" content="PPF Calculator - Upaman" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PPF Calculator India | Upaman" />
        <meta
          name="twitter:description"
          content="Estimate PPF maturity and yearly interest with a detailed projection table."
        />
        <meta name="twitter:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'PPF Calculator India',
              url: 'https://upaman.com/ppf-calculator',
              description:
                'Free PPF maturity calculator with annual contribution options, projection table and interest breakdown.',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR'
              },
              featureList: [
                'PPF maturity calculation',
                'Year-wise projection table',
                'Contribution mode comparison',
                'Annual step-up contribution'
              ]
            })
          }}
        />
      </Head>

      <div className="calculator-card">
        <div className="calculator-header ppf-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <h1 className="header-title">PPF Calculator</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Estimate maturity value using contribution pattern, interest rate and yearly projection.
          </p>
        </div>

        <div className="mobile-card-content">
          <div className="input-section" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">Contribution Inputs</h2>

            <div className="responsive-grid" style={{ alignItems: 'end' }}>
              <div>
                <label className="input-label">Annual Contribution (₹)</label>
                <input
                  type="number"
                  value={inputs.annualContribution}
                  onChange={(e) => handleInputChange('annualContribution', Number(e.target.value) || 0)}
                  className="calculator-input"
                  min="0"
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: hasContributionCap ? '#b91c1c' : '#475569' }}>
                  Max eligible contribution used in projection: ₹1,50,000 per year.
                </p>
              </div>

              <div>
                <label className="input-label">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.annualRate}
                  onChange={(e) => handleInputChange('annualRate', Number(e.target.value) || 0)}
                  className="calculator-input"
                  min="0"
                />
              </div>

              <div>
                <label className="input-label">Tenure (Years)</label>
                <input
                  type="number"
                  value={inputs.tenureYears}
                  onChange={(e) => handleInputChange('tenureYears', Number(e.target.value) || 0)}
                  className="calculator-input"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="input-label">Yearly Contribution Increase (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.annualStepUp}
                  onChange={(e) => handleInputChange('annualStepUp', Number(e.target.value) || 0)}
                  className="calculator-input"
                  min="0"
                />
              </div>

              <div>
                <label className="input-label">Contribution Mode</label>
                <select
                  className="calculator-input"
                  value={inputs.contributionMode}
                  onChange={(e) => handleInputChange('contributionMode', e.target.value)}
                >
                  {contributionModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            className="results-container"
            style={{
              borderColor: '#0f766e',
              background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)'
            }}
          >
            <h3 className="results-title" style={{ color: '#0f766e' }}>PPF Projection Summary</h3>
            <div className="responsive-grid">
              <div className="result-item">
                <div className="result-label">Total Investment</div>
                <div className="result-value" style={{ color: '#0f766e' }}>
                  {formatINR(results.summary.totalInvested)}
                </div>
              </div>

              <div className="result-item">
                <div className="result-label">Estimated Maturity Value</div>
                <div className="result-value" style={{ color: '#1d4ed8' }}>
                  {formatINR(results.summary.maturityValue)}
                </div>
              </div>

              <div className="result-item">
                <div className="result-label">Estimated Total Interest</div>
                <div className="result-value" style={{ color: '#b45309' }}>
                  {formatINR(results.summary.totalInterest)}
                </div>
              </div>

              <div className="result-item">
                <div className="result-label">Final Year Contribution Used</div>
                <div className="result-value" style={{ color: '#4338ca' }}>
                  {formatINR(results.summary.finalAnnualContribution)}
                </div>
              </div>
            </div>
            <ResultActions
              title="PPF projection summary"
              summaryLines={ppfShareLines}
              fileName="upaman-ppf-summary.txt"
            />
          </div>

          <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
              Year-wise Projection
              </h3>

            <div className="responsive-table-container">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Opening Balance</th>
                    <th>Contribution</th>
                    <th>Interest</th>
                    <th>Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {projectionRows.map((row) => (
                    <tr key={row.year}>
                      <td>{row.year}</td>
                      <td>{formatINR(row.openingBalance)}</td>
                      <td>{formatINR(row.yearlyContribution)}</td>
                      <td>{formatINR(row.yearlyInterest)}</td>
                      <td>{formatINR(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {results.projection.length > 15 && (
              <button
                type="button"
                onClick={() => setShowFullProjection((prev) => !prev)}
                className="calculator-button"
                style={{
                  marginTop: '1rem',
                  maxWidth: '280px',
                  background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                  color: '#fff'
                }}
              >
                {showFullProjection ? 'Show First 15 Years' : 'Show Full Projection'}
              </button>
            )}
          </div>

          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Annual contribution, annual interest rate, tenure, contribution mode, and optional annual step-up',
              'Contribution cap applied as per current PPF annual limit'
            ]}
            formulas={[
              'Monthly accrual approximation with annual interest crediting',
              'Year-wise rolling balance: opening + contribution + accrued interest'
            ]}
            assumptions={[
              'Yearly contribution used for projection is capped at ₹1,50,000',
              'Interest rate is assumed constant for the selected tenure',
              'This is a planning projection and may differ from official passbook posting logic'
            ]}
            sources={[
              { label: 'National Savings Institute (PPF scheme)', url: 'https://www.nsiindia.gov.in/' },
              { label: 'India Post - Public Provident Fund', url: 'https://www.indiapost.gov.in/' }
            ]}
            guideLinks={[
              { label: 'PPF vs SIP choice guide', href: '/guide-ppf-vs-sip-choice.html' },
              { label: 'SIP step-up planning guide', href: '/guide-sip-step-up-planning.html' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default PPFCalculator;
