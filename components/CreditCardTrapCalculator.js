import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
import { formatINR } from '../utils/calculations';

const MAX_MONTHS = 1200;

const formatDuration = (months) => {
  if (!months || months < 1) return '0 months';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
  if (remainingMonths === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
};

const getEstimatedPayoffDate = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

const getMinimumDue = ({ balanceAfterInterest, interest, minPercent, minFloor }) => {
  const percentageBased = (balanceAfterInterest * minPercent) / 100;
  const floorBased = Math.max(minFloor, 0);
  const principalGuard = interest + Math.max(balanceAfterInterest * 0.01, 50);
  return Math.min(balanceAfterInterest, Math.max(percentageBased, floorBased, principalGuard));
};

const simulatePayoff = ({ outstandingBalance, annualRate, minPercent, minFloor, fixedMonthlyPayment, mode }) => {
  let balance = Math.max(0, Number(outstandingBalance) || 0);
  const monthlyRate = Math.max(0, Number(annualRate) || 0) / 100 / 12;

  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule = [];

  while (balance > 0.01 && months < MAX_MONTHS) {
    months += 1;

    const openingBalance = balance;
    const interest = openingBalance * monthlyRate;
    const balanceAfterInterest = openingBalance + interest;
    const minimumDue = getMinimumDue({ balanceAfterInterest, interest, minPercent, minFloor });

    let payment = minimumDue;

    if (mode === 'accelerated') {
      payment = Math.max(fixedMonthlyPayment || 0, minimumDue);
    }

    payment = Math.min(payment, balanceAfterInterest);

    const principal = payment - interest;
    if (principal <= 0) {
      return {
        months,
        totalInterest,
        totalPaid,
        schedule,
        isUnpayable: true
      };
    }

    balance = Math.max(0, balanceAfterInterest - payment);
    totalInterest += interest;
    totalPaid += payment;

    if (months <= 240) {
      schedule.push({
        month: months,
        openingBalance,
        minimumDue,
        payment,
        interest,
        principal,
        closingBalance: balance
      });
    }
  }

  return {
    months,
    totalInterest,
    totalPaid,
    schedule,
    isUnpayable: balance > 0.01,
    isCappedByLimit: months >= MAX_MONTHS
  };
};

const CreditCardTrapCalculator = () => {
  const [inputs, setInputs] = useState({
    outstandingBalance: 250000,
    annualRate: 36,
    minPercent: 5,
    minFloor: 500,
    fixedMonthlyPayment: 15000
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

  const acceleratedPlan = useMemo(
    () =>
      simulatePayoff({
        ...inputs,
        mode: 'accelerated'
      }),
    [inputs]
  );

  const interestSaved = Math.max(0, minimumPlan.totalInterest - acceleratedPlan.totalInterest);
  const monthsSaved = Math.max(0, minimumPlan.months - acceleratedPlan.months);
  const shareLines = [
    `Minimum-due payoff: ${formatDuration(minimumPlan.months)}`,
    `Minimum-due interest: ${formatINR(minimumPlan.totalInterest)}`,
    `Your-plan payoff: ${formatDuration(acceleratedPlan.months)}`,
    `Your-plan interest: ${formatINR(acceleratedPlan.totalInterest)}`,
    `Interest saved: ${formatINR(interestSaved)}`,
    `Time saved: ${formatDuration(monthsSaved)}`
  ];

  const scheduleRows = acceleratedPlan.schedule.slice(0, 24);

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="calculator-container credit-trap-container">
      <Head>
        <title>Credit Card Trap Calculator India | Payoff Time & Interest Saved | Upaman</title>
        <meta
          name="description"
          content="Find out how long credit card debt will take to clear on minimum due and compare with a fixed monthly payment plan."
        />
        <meta
          name="keywords"
          content="credit card payoff calculator India, minimum due trap calculator, credit card interest calculator, debt payoff planner"
        />
        <link rel="canonical" href="https://upaman.com/credit-card-trap-calculator" />
        <meta property="og:title" content="Credit Card Trap Calculator | Upaman" />
        <meta
          property="og:description"
          content="Compare minimum due vs higher payment to see payoff months and total interest impact."
        />
        <meta property="og:url" content="https://upaman.com/credit-card-trap-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <meta property="og:image:alt" content="Credit Card Trap Calculator - Upaman" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Credit Card Trap Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Estimate payoff time and interest impact with minimum due vs fixed monthly payment."
        />
        <meta name="twitter:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Credit Card Trap Calculator',
              url: 'https://upaman.com/credit-card-trap-calculator',
              description:
                'Credit card payoff estimator that compares minimum due repayment vs accelerated monthly repayment.',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR'
              },
              featureList: [
                'Minimum due payoff simulation',
                'Fixed monthly payment simulation',
                'Interest saved comparison',
                'Month-wise debt table'
              ]
            })
          }}
        />
      </Head>

      <div className="calculator-card">
        <div className="calculator-header credit-trap-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <h1 className="header-title">Credit Card Trap Calculator</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Compare minimum due repayment vs a fixed monthly payment and see how much interest you can save.
          </p>
        </div>

        <div className="mobile-card-content">
          <div className="input-section" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">Debt Inputs</h2>

            <div className="responsive-grid" style={{ alignItems: 'end' }}>
              <div>
                <label className="input-label">Outstanding Balance (₹)</label>
                <input
                  type="number"
                  className="calculator-input"
                  value={inputs.outstandingBalance}
                  onChange={(e) => handleInputChange('outstandingBalance', Number(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div>
                <label className="input-label">Annual Interest Rate (% APR)</label>
                <input
                  type="number"
                  className="calculator-input"
                  value={inputs.annualRate}
                  onChange={(e) => handleInputChange('annualRate', Number(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="input-label">Minimum Due (% of balance)</label>
                <input
                  type="number"
                  className="calculator-input"
                  value={inputs.minPercent}
                  onChange={(e) => handleInputChange('minPercent', Number(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="input-label">Minimum Due Floor (₹)</label>
                <input
                  type="number"
                  className="calculator-input"
                  value={inputs.minFloor}
                  onChange={(e) => handleInputChange('minFloor', Number(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div>
                <label className="input-label">Your Monthly Payment Plan (₹)</label>
                <input
                  type="number"
                  className="calculator-input"
                  value={inputs.fixedMonthlyPayment}
                  onChange={(e) => handleInputChange('fixedMonthlyPayment', Number(e.target.value) || 0)}
                  min="0"
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                  If this is lower than minimum due, minimum due will be used.
                </p>
              </div>
            </div>
          </div>

          <div className="responsive-grid" style={{ marginBottom: '1.5rem' }}>
            <div
              className="results-container"
              style={{ borderColor: '#b91c1c', background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' }}
            >
              <h3 className="results-title" style={{ color: '#b91c1c' }}>
                Minimum Due Path
              </h3>
              <div className="result-item" style={{ marginBottom: '0.75rem' }}>
                <div className="result-label">Payoff Time</div>
                <div className="result-value" style={{ color: '#7f1d1d' }}>{formatDuration(minimumPlan.months)}</div>
              </div>
              <div className="result-item" style={{ marginBottom: '0.75rem' }}>
                <div className="result-label">Total Interest</div>
                <div className="result-value" style={{ color: '#b45309' }}>{formatINR(minimumPlan.totalInterest)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Estimated Debt Free By</div>
                <div className="result-value" style={{ color: '#1d4ed8', fontSize: '1rem' }}>
                  {getEstimatedPayoffDate(minimumPlan.months)}
                </div>
              </div>
            </div>

            <div
              className="results-container"
              style={{ borderColor: '#047857', background: 'linear-gradient(135deg, #ecfdf5 0%, #dcfce7 100%)' }}
            >
              <h3 className="results-title" style={{ color: '#047857' }}>
                Your Payment Plan
              </h3>
              <div className="result-item" style={{ marginBottom: '0.75rem' }}>
                <div className="result-label">Payoff Time</div>
                <div className="result-value" style={{ color: '#065f46' }}>{formatDuration(acceleratedPlan.months)}</div>
              </div>
              <div className="result-item" style={{ marginBottom: '0.75rem' }}>
                <div className="result-label">Total Interest</div>
                <div className="result-value" style={{ color: '#92400e' }}>{formatINR(acceleratedPlan.totalInterest)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Estimated Debt Free By</div>
                <div className="result-value" style={{ color: '#1d4ed8', fontSize: '1rem' }}>
                  {getEstimatedPayoffDate(acceleratedPlan.months)}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e3a8a' }}>📉 Trap Impact</h3>
            <div className="responsive-grid">
              <div className="result-item">
                <div className="result-label">Interest Saved</div>
                <div className="result-value" style={{ color: '#047857' }}>{formatINR(interestSaved)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Time Saved</div>
                <div className="result-value" style={{ color: '#1d4ed8' }}>{formatDuration(monthsSaved)}</div>
              </div>
            </div>
          </div>

          {(minimumPlan.isUnpayable || acceleratedPlan.isUnpayable) && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.75rem',
                color: '#991b1b',
                padding: '0.85rem 1rem',
                marginBottom: '1rem'
              }}
            >
              Current assumptions produced an unstable payoff path. Increase minimum due settings or monthly payment.
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
              📆 First 24 Months (Your Payment Plan)
            </h3>
            <div className="responsive-table-container">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Opening Balance</th>
                    <th>Minimum Due</th>
                    <th>Payment</th>
                    <th>Interest</th>
                    <th>Principal</th>
                    <th>Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRows.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{formatINR(row.openingBalance)}</td>
                      <td>{formatINR(row.minimumDue)}</td>
                      <td>{formatINR(row.payment)}</td>
                      <td>{formatINR(row.interest)}</td>
                      <td>{formatINR(row.principal)}</td>
                      <td>{formatINR(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              borderRadius: '1rem',
              border: '1px solid #fde68a',
              background: '#fffbeb',
              padding: '1rem'
            }}
          >
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#b45309' }}>How to Use This</h4>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#92400e', lineHeight: 1.6 }}>
              <li>Use your actual card APR and current outstanding balance.</li>
              <li>Set your monthly payment target and compare with the minimum due path.</li>
              <li>Paying more early usually reduces both payoff time and interest sharply.</li>
            </ul>
          </div>

          <ResultActions
            title="Credit card payoff comparison summary"
            summaryLines={shareLines}
            fileName="upaman-credit-card-trap-summary.txt"
          />

          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Outstanding balance, APR, minimum due %, minimum floor amount, and your fixed monthly payment',
              'Each month recalculates minimum due after adding monthly interest'
            ]}
            formulas={[
              'Monthly interest = opening balance × (APR / 12)',
              'Payment applied = max(minimum due, fixed plan payment) for accelerated mode',
              'Balance progression is simulated month-by-month until payoff'
            ]}
            assumptions={[
              'APR remains constant through the simulation period',
              'No new card spends, fees, penalties, or rate revisions are included',
              'Schedule is capped at a high month limit to flag unstable payoff patterns'
            ]}
            sources={[
              { label: 'RBI financial literacy resources', url: 'https://www.rbi.org.in/financialeducation/' }
            ]}
            guideLinks={[
              { label: 'Credit card minimum due trap guide', href: '/guide-credit-card-minimum-due-trap.html' },
              { label: 'EMI prepayment strategy guide', href: '/guide-emi-prepayment-strategy.html' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default CreditCardTrapCalculator;
