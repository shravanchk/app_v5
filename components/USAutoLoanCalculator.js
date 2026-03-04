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

const getPayoffDate = (months) => {
  if (!months || months <= 0) return 'N/A';
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

const USAutoLoanCalculator = () => {
  const [inputs, setInputs] = useState({
    vehiclePrice: 38000,
    downPayment: 5000,
    tradeInValue: 3000,
    salesTaxRate: 7,
    dealerFees: 1200,
    apr: 6.5,
    termMonths: 60
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('dark-theme', localStorage.getItem('theme') === 'dark');
    }
  }, []);

  const results = useMemo(() => {
    const vehiclePrice = Math.max(0, Number(inputs.vehiclePrice) || 0);
    const downPayment = Math.max(0, Number(inputs.downPayment) || 0);
    const tradeInValue = Math.max(0, Number(inputs.tradeInValue) || 0);
    const salesTaxRate = Math.max(0, Number(inputs.salesTaxRate) || 0);
    const dealerFees = Math.max(0, Number(inputs.dealerFees) || 0);
    const apr = Math.max(0, Number(inputs.apr) || 0);
    const termMonths = Math.max(1, Math.floor(Number(inputs.termMonths) || 1));

    const taxableAmount = Math.max(0, vehiclePrice - tradeInValue);
    const salesTax = (taxableAmount * salesTaxRate) / 100;
    const financedAmount = Math.max(0, taxableAmount + salesTax + dealerFees - downPayment);
    const monthlyPayment = getMonthlyPayment(financedAmount, apr, termMonths);
    const totalLoanPaid = monthlyPayment * termMonths;
    const totalInterest = Math.max(0, totalLoanPaid - financedAmount);
    const totalOutOfPocketCost = totalLoanPaid + downPayment + tradeInValue;

    return {
      taxableAmount,
      salesTax,
      financedAmount,
      monthlyPayment,
      totalLoanPaid,
      totalInterest,
      totalOutOfPocketCost,
      payoffDate: getPayoffDate(termMonths)
    };
  }, [inputs]);

  const summaryLines = [
    `Estimated monthly payment: ${formatUSD(results.monthlyPayment)}`,
    `Amount financed: ${formatUSD(results.financedAmount)}`,
    `Estimated total loan interest: ${formatUSD(results.totalInterest)}`,
    `Total loan payments: ${formatUSD(results.totalLoanPaid)}`,
    `Estimated payoff date: ${results.payoffDate}`
  ];

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="calculator-container emi-container">
      <Head>
        <title>US Auto Loan Calculator | Payment, Interest & Total Cost | Upaman</title>
        <meta
          name="description"
          content="Free US auto loan calculator with sales tax, trade-in, fees, APR and term. Estimate monthly payment, interest and total cost."
        />
        <meta
          name="keywords"
          content="US auto loan calculator, car payment calculator, vehicle loan calculator, car financing calculator, APR auto loan estimator"
        />
        <link rel="canonical" href="https://upaman.com/us-auto-loan-calculator" />
        <meta property="og:title" content="US Auto Loan Calculator | Upaman" />
        <meta
          property="og:description"
          content="Calculate US auto loan payments with tax, trade-in, fees, APR and loan term."
        />
        <meta property="og:url" content="https://upaman.com/us-auto-loan-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Auto Loan Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Estimate monthly car payment, total interest, financed amount and payoff timeline."
        />
      </Head>

      <div className="calculator-card">
        <div className="calculator-header emi-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <h1 className="header-title">US Auto Loan Calculator</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Estimate car loan payment with sales tax, trade-in credit, and dealer fees.
          </p>
        </div>

        <div className="mobile-card-content">
          <div className="input-section" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">Vehicle Financing Inputs</h2>
            <div className="responsive-grid" style={{ alignItems: 'end' }}>
              <div>
                <label className="input-label">Vehicle Price ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.vehiclePrice} onChange={(e) => handleInputChange('vehiclePrice', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Down Payment ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.downPayment} onChange={(e) => handleInputChange('downPayment', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Trade-in Value ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.tradeInValue} onChange={(e) => handleInputChange('tradeInValue', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Sales Tax Rate (%)</label>
                <input className="calculator-input" type="number" min="0" step="0.01" value={inputs.salesTaxRate} onChange={(e) => handleInputChange('salesTaxRate', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Dealer Fees ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.dealerFees} onChange={(e) => handleInputChange('dealerFees', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Loan APR (%)</label>
                <input className="calculator-input" type="number" min="0" step="0.01" value={inputs.apr} onChange={(e) => handleInputChange('apr', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Loan Term (Months)</label>
                <input className="calculator-input" type="number" min="1" max="96" value={inputs.termMonths} onChange={(e) => handleInputChange('termMonths', Number(e.target.value) || 60)} />
              </div>
            </div>
          </div>

          <div className="results-container" style={{ borderColor: '#0f766e', background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)' }}>
            <h2 className="results-title" style={{ color: '#0f2a43' }}>Estimated Loan Summary</h2>
            <div className="responsive-grid">
              <div className="result-item">
                <div className="result-label">Monthly Payment</div>
                <div className="result-value emi">{formatUSD(results.monthlyPayment)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Amount Financed</div>
                <div className="result-value total">{formatUSD(results.financedAmount)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Total Interest</div>
                <div className="result-value interest">{formatUSD(results.totalInterest)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Payoff Date</div>
                <div className="result-value principal" style={{ fontSize: '1rem' }}>{results.payoffDate}</div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#334155', lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 0.35rem 0' }}><strong>Taxable amount:</strong> {formatUSD(results.taxableAmount)}</p>
              <p style={{ margin: '0 0 0.35rem 0' }}><strong>Sales tax estimate:</strong> {formatUSD(results.salesTax)}</p>
              <p style={{ margin: 0 }}><strong>Total out-of-pocket cost:</strong> {formatUSD(results.totalOutOfPocketCost)}</p>
            </div>
            <PieBreakdownChart
              title="Out-of-pocket cost composition"
              items={[
                {
                  label: 'Upfront (down + trade-in)',
                  value: Math.max(0, Number(inputs.downPayment) || 0) + Math.max(0, Number(inputs.tradeInValue) || 0),
                  color: '#0f766e'
                },
                { label: 'Loan principal', value: results.financedAmount, color: '#3b82f6' },
                { label: 'Loan interest', value: results.totalInterest, color: '#f97316' }
              ]}
              formatter={formatUSD}
            />
          </div>

          <ResultActions title="US Auto Loan Calculator Summary" summaryLines={summaryLines} fileName="us-auto-loan-calculator-summary.txt" />

          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Vehicle price, trade-in, down payment, sales tax rate, dealer fees, APR, and term',
              'Trade-in is applied before tax as a general estimate (state rules vary)'
            ]}
            formulas={[
              'Amount financed = (price - trade-in) + sales tax + fees - down payment',
              'Monthly payment uses standard amortization formula',
              'Total interest = total loan payments - amount financed'
            ]}
            assumptions={[
              'Taxable base and fee treatment vary by state and lender',
              'Title, registration, and optional products are not separately modeled',
              'Actual APR and contract terms depend on borrower profile and lender'
            ]}
            sources={[
              { label: 'Consumer Financial Protection Bureau (CFPB) - Auto loans', url: 'https://www.consumerfinance.gov/consumer-tools/auto-loans/' },
              { label: 'Federal Trade Commission (FTC) - Buying and financing a car', url: 'https://consumer.ftc.gov/articles/understanding-vehicle-financing' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default USAutoLoanCalculator;
