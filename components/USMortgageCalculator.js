import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
import { PieBreakdownChart } from './calculator/ResultVisualizations';
import { formatCurrency } from '../utils/calculations';

const getMonthlyPayment = (principal, annualRate, months) => {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
};

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

const USMortgageCalculator = () => {
  const [inputs, setInputs] = useState({
    homePrice: 450000,
    downPayment: 90000,
    interestRate: 6.75,
    loanTermYears: 30,
    propertyTaxRate: 1.1,
    homeInsuranceAnnual: 1800,
    hoaMonthly: 150,
    pmiRate: 0.6,
    monthlyGrossIncome: 9000
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('dark-theme', localStorage.getItem('theme') === 'dark');
    }
  }, []);

  const results = useMemo(() => {
    const homePrice = Math.max(0, Number(inputs.homePrice) || 0);
    const downPayment = Math.max(0, Number(inputs.downPayment) || 0);
    const rate = Math.max(0, Number(inputs.interestRate) || 0);
    const years = Math.max(1, Math.floor(Number(inputs.loanTermYears) || 0));
    const taxRate = Math.max(0, Number(inputs.propertyTaxRate) || 0);
    const insuranceAnnual = Math.max(0, Number(inputs.homeInsuranceAnnual) || 0);
    const hoaMonthly = Math.max(0, Number(inputs.hoaMonthly) || 0);
    const pmiRate = Math.max(0, Number(inputs.pmiRate) || 0);
    const monthlyGrossIncome = Math.max(0, Number(inputs.monthlyGrossIncome) || 0);

    const loanAmount = Math.max(0, homePrice - downPayment);
    const termMonths = years * 12;
    const principalAndInterest = getMonthlyPayment(loanAmount, rate, termMonths);
    const propertyTaxMonthly = (homePrice * taxRate) / 100 / 12;
    const insuranceMonthly = insuranceAnnual / 12;
    const downPaymentPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
    const pmiMonthly = downPaymentPercent < 20 ? (loanAmount * pmiRate) / 100 / 12 : 0;
    const totalMonthlyPayment = principalAndInterest + propertyTaxMonthly + insuranceMonthly + hoaMonthly + pmiMonthly;

    const totalPrincipalAndInterestPaid = principalAndInterest * termMonths;
    const totalInterest = Math.max(0, totalPrincipalAndInterestPaid - loanAmount);
    const housingRatio = monthlyGrossIncome > 0 ? (totalMonthlyPayment / monthlyGrossIncome) * 100 : 0;
    const firstMonthInterest = loanAmount * (rate / 100 / 12);
    const firstMonthPrincipal = Math.max(0, principalAndInterest - firstMonthInterest);

    return {
      loanAmount,
      principalAndInterest,
      propertyTaxMonthly,
      insuranceMonthly,
      hoaMonthly,
      pmiMonthly,
      totalMonthlyPayment,
      totalInterest,
      downPaymentPercent,
      housingRatio,
      firstMonthPrincipal,
      firstMonthInterest
    };
  }, [inputs]);

  const summaryLines = [
    `Loan amount: ${formatUSD(results.loanAmount)}`,
    `Estimated monthly payment (PITI + HOA + PMI): ${formatUSD(results.totalMonthlyPayment)}`,
    `Principal & interest: ${formatUSD(results.principalAndInterest)}`,
    `Estimated total interest over term: ${formatUSD(results.totalInterest)}`,
    `Down payment: ${results.downPaymentPercent.toFixed(2)}%`,
    `Housing ratio (payment / gross income): ${results.housingRatio.toFixed(1)}%`
  ];

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="calculator-container emi-container">
      <Head>
        <title>US Mortgage Calculator | Monthly Payment, PMI, Tax & Insurance | Upaman</title>
        <meta
          name="description"
          content="Free US mortgage calculator with principal and interest, property tax, homeowners insurance, HOA and PMI estimates."
        />
        <meta
          name="keywords"
          content="US mortgage calculator, monthly mortgage payment calculator, PMI calculator, PITI calculator, home loan calculator USA"
        />
        <link rel="canonical" href="https://upaman.com/us-mortgage-calculator" />
        <meta property="og:title" content="US Mortgage Calculator | Upaman" />
        <meta
          property="og:description"
          content="Estimate US mortgage payments with principal, interest, property tax, insurance, HOA and PMI."
        />
        <meta property="og:url" content="https://upaman.com/us-mortgage-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Mortgage Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Calculate monthly mortgage payment, PMI impact and first-month principal vs interest."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'US Mortgage Calculator',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              url: 'https://upaman.com/us-mortgage-calculator',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
      </Head>

      <div className="calculator-card">
        <div className="calculator-header emi-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <h1 className="header-title">US Mortgage Calculator</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Estimate monthly payment with principal, interest, taxes, insurance, HOA, and PMI.
          </p>
        </div>

        <div className="mobile-card-content">
          <div className="input-section" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">Mortgage Inputs</h2>
            <div className="responsive-grid" style={{ alignItems: 'end' }}>
              <div>
                <label className="input-label">Home Price ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.homePrice} onChange={(e) => handleInputChange('homePrice', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Down Payment ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.downPayment} onChange={(e) => handleInputChange('downPayment', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Interest Rate (% APR)</label>
                <input className="calculator-input" type="number" min="0" step="0.01" value={inputs.interestRate} onChange={(e) => handleInputChange('interestRate', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Loan Term (Years)</label>
                <input className="calculator-input" type="number" min="1" max="40" value={inputs.loanTermYears} onChange={(e) => handleInputChange('loanTermYears', Number(e.target.value) || 30)} />
              </div>
              <div>
                <label className="input-label">Property Tax Rate (% yearly)</label>
                <input className="calculator-input" type="number" min="0" step="0.01" value={inputs.propertyTaxRate} onChange={(e) => handleInputChange('propertyTaxRate', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Home Insurance ($ / year)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.homeInsuranceAnnual} onChange={(e) => handleInputChange('homeInsuranceAnnual', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">HOA ($ / month)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.hoaMonthly} onChange={(e) => handleInputChange('hoaMonthly', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">PMI Rate (% yearly, if &lt;20% down)</label>
                <input className="calculator-input" type="number" min="0" step="0.01" value={inputs.pmiRate} onChange={(e) => handleInputChange('pmiRate', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Gross Income ($ / month)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.monthlyGrossIncome} onChange={(e) => handleInputChange('monthlyGrossIncome', Number(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div className="results-container" style={{ borderColor: '#1d4e89', background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)' }}>
            <h2 className="results-title" style={{ color: '#0f2a43' }}>Estimated Monthly Payment</h2>
            <div className="responsive-grid">
              <div className="result-item">
                <div className="result-label">Total Monthly</div>
                <div className="result-value emi">{formatUSD(results.totalMonthlyPayment)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Principal & Interest</div>
                <div className="result-value total">{formatUSD(results.principalAndInterest)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Property Tax + Insurance</div>
                <div className="result-value interest">{formatUSD(results.propertyTaxMonthly + results.insuranceMonthly)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">PMI + HOA</div>
                <div className="result-value principal">{formatUSD(results.pmiMonthly + results.hoaMonthly)}</div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#334155', lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 0.35rem 0' }}><strong>Loan amount:</strong> {formatUSD(results.loanAmount)}</p>
              <p style={{ margin: '0 0 0.35rem 0' }}><strong>Estimated total interest:</strong> {formatUSD(results.totalInterest)}</p>
              <p style={{ margin: '0 0 0.35rem 0' }}><strong>First-month split:</strong> Principal {formatUSD(results.firstMonthPrincipal)} | Interest {formatUSD(results.firstMonthInterest)}</p>
              <p style={{ margin: 0 }}>
                <strong>Housing ratio:</strong> {results.housingRatio.toFixed(1)}%
                {results.housingRatio > 28 ? ' (above common 28% guideline)' : ' (within common 28% guideline)'}
              </p>
            </div>
            <PieBreakdownChart
              title="Monthly payment composition"
              items={[
                { label: 'Principal & interest', value: results.principalAndInterest, color: '#3b82f6' },
                { label: 'Property tax', value: results.propertyTaxMonthly, color: '#f59e0b' },
                { label: 'Insurance', value: results.insuranceMonthly, color: '#10b981' },
                { label: 'HOA', value: results.hoaMonthly, color: '#8b5cf6' },
                { label: 'PMI', value: results.pmiMonthly, color: '#ef4444' }
              ]}
              formatter={formatUSD}
            />
          </div>

          <ResultActions title="US Mortgage Calculator Summary" summaryLines={summaryLines} fileName="us-mortgage-calculator-summary.txt" />

          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Home price, down payment, APR, term, tax rate, insurance, HOA, PMI rate',
              'Gross monthly income for housing ratio context'
            ]}
            formulas={[
              'Principal & interest: standard amortization mortgage payment formula',
              'Property tax monthly = home price × tax rate ÷ 12',
              'PMI estimate shown when down payment is below 20%',
              'Housing ratio = total monthly payment ÷ gross monthly income'
            ]}
            assumptions={[
              'Property tax and insurance are treated as fixed estimates',
              'PMI cancellation timing is not modeled here',
              'Actual lender costs and escrow rules vary by state and lender'
            ]}
            sources={[
              { label: 'Consumer Financial Protection Bureau (CFPB) - Mortgage basics', url: 'https://www.consumerfinance.gov/owning-a-home/' },
              { label: 'Fannie Mae - Loan-to-value and mortgage topics', url: 'https://singlefamily.fanniemae.com/' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default USMortgageCalculator;
