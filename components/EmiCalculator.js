import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from './AffiliateRecommendations';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import CalculatorArticleLayout from './calculator/CalculatorArticleLayout';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
import { buildFaqSchema } from '../utils/faqSchema';
import { formatINR } from '../utils/calculations';

const ComprehensiveLoanCalculator = React.memo(() => {
  const [activeTab, setActiveTab] = useState('emi');
  const [emiParams, setEmiParams] = useState({
    loanAmount: 2500000,
    interestRate: 8.5,
    loanTenure: 20,
    tenureUnit: 'years' // 'months' or 'years'
  });
  const [emiResult, setEmiResult] = useState(null);
  const [showAmortization, setShowAmortization] = useState(false);
  const [amortizationData, setAmortizationData] = useState([]);
  
  // Ref for auto-scrolling to results
  const resultsRef = useRef(null);
  const customResultsRef = useRef(null);

  const [prepaymentParams, setPrepaymentParams] = useState({
    outstandingAmount: 2577227,
    currentEMI: 25601,
    remainingMonths: 14.3,
    remainingTenureUnit: 'years', // 'months' or 'years'
    interestRate: 8.25
  });
  const [scenarios, setScenarios] = useState([]);
  const [customPrepayment, setCustomPrepayment] = useState('');
  const [customResult, setCustomResult] = useState(null);

  const calculateEMI = useCallback((principal, rate, tenure) => {
    const monthlyRate = rate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
           (Math.pow(1 + monthlyRate, tenure) - 1);
  }, []);

  const generateAmortization = useCallback((principal, rate, tenure, emi) => {
    const schedule = [];
    let remaining = principal;
    const monthlyRate = rate / 100 / 12;

    for (let month = 1; month <= Math.min(tenure, 60); month++) {
      const interest = remaining * monthlyRate;
      const principalPmt = emi - interest;
      remaining -= principalPmt;

      schedule.push({
        month,
        emi,
        principal: principalPmt,
        interest,
        balance: remaining > 0 ? remaining : 0
      });

      if (remaining <= 0) break;
    }
    return schedule;
  }, []);

  const calculateEMIDetails = () => {
    const { loanAmount, interestRate, loanTenure, tenureUnit } = emiParams;
    if (!loanAmount || !interestRate || !loanTenure) {
      alert('Please enter all parameters');
      return;
    }

    // Convert tenure to months if entered in years
    const tenureInMonths = tenureUnit === 'years' ? loanTenure * 12 : loanTenure;

    const emi = calculateEMI(loanAmount, interestRate, tenureInMonths);
    const totalAmount = emi * tenureInMonths;
    const totalInterest = totalAmount - loanAmount;

    setEmiResult({
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      loanAmount,
      tenureInMonths,
      displayTenure: tenureUnit === 'years' ? `${loanTenure} years (${tenureInMonths} months)` : `${loanTenure} months`
    });

    setAmortizationData(generateAmortization(loanAmount, interestRate, tenureInMonths, emi));
    
    // Auto-scroll to results after a brief delay to allow state update
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const generateScenarios = useCallback(() => {
    const { outstandingAmount, currentEMI, remainingMonths, remainingTenureUnit, interestRate } = prepaymentParams;
    if (!outstandingAmount || !currentEMI || !remainingMonths || !interestRate) return [];

    // Convert tenure to months if entered in years
    const remainingMonthsConverted = remainingTenureUnit === 'years' ? remainingMonths * 12 : remainingMonths;

    return [5, 10, 15, 20, 25, 30].map(percentage => {
      const prepayment = Math.round((outstandingAmount * percentage) / 100);
      const newPrincipal = outstandingAmount - prepayment;
      const newEMI = calculateEMI(newPrincipal, interestRate, remainingMonthsConverted);
      const savings = currentEMI - newEMI;

      return {
        title: `Prepay ${percentage}% (${formatINR(prepayment)})`,
        prepayment,
        newEMI: Math.round(newEMI),
        monthlySavings: Math.round(savings),
        totalSavings: Math.round(savings * remainingMonthsConverted),
        isHighlighted: percentage === 20
      };
    });
  }, [prepaymentParams, calculateEMI]);

  useEffect(() => {
    if (activeTab === 'prepayment') {
      setScenarios(generateScenarios());
    }
  }, [prepaymentParams, activeTab, generateScenarios]);

  const calculateCustom = () => {
    const prepayment = parseFloat(customPrepayment);
    if (!prepayment || prepayment <= 0) return;

    // Convert tenure to months if entered in years
    const remainingMonthsConverted = prepaymentParams.remainingTenureUnit === 'years' 
      ? prepaymentParams.remainingMonths * 12 
      : prepaymentParams.remainingMonths;

    const newPrincipal = prepaymentParams.outstandingAmount - prepayment;
    const newEMI = calculateEMI(newPrincipal, prepaymentParams.interestRate, remainingMonthsConverted);
    const savings = prepaymentParams.currentEMI - newEMI;

    setCustomResult({
      newEMI: formatINR(newEMI),
      monthlySavings: formatINR(savings),
      totalSavings: formatINR(savings * remainingMonthsConverted)
    });
    
    // Auto-scroll to custom results after a brief delay to allow state update
    setTimeout(() => {
      if (customResultsRef.current) {
        customResultsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const emiShareLines = emiResult ? [
    `Monthly EMI: ${formatINR(emiResult.emi)}`,
    `Total amount payable: ${formatINR(emiResult.totalAmount)}`,
    `Total interest: ${formatINR(emiResult.totalInterest)}`,
    `Principal: ${formatINR(emiResult.loanAmount)}`,
    `Tenure: ${emiResult.displayTenure}`
  ] : [];

  const faqItems = [
    {
      question: 'How is EMI calculated in this tool?',
      answer: 'EMI uses the standard reducing-balance formula with principal, monthly rate, and total tenure in months. The same method is used for amortization and prepayment estimates.'
    },
    {
      question: 'What is the difference between EMI mode and prepayment mode?',
      answer: 'EMI mode calculates loan payment from fresh inputs. Prepayment mode starts from existing outstanding principal and estimates savings after a part-prepayment.'
    },
    {
      question: 'Should I reduce EMI or tenure after prepayment?',
      answer: 'Both are possible in real banking products. This tool primarily estimates impact in a fixed-tenure style for fast comparison and planning.'
    },
    {
      question: 'Why can lender schedules differ slightly?',
      answer: 'Differences can occur due to processing conventions, reset clauses, floating-rate changes, and lender-specific rounding rules.'
    }
  ];

  const faqSchema = buildFaqSchema(faqItems);

  const relatedGuides = [
    { label: 'EMI prepayment strategy guide', href: '/guide-emi-prepayment-strategy.html' },
    { label: 'CTC to in-hand breakdown guide', href: '/guide-ctc-inhand-breakdown.html' },
    { label: 'Credit card minimum due trap guide', href: '/guide-credit-card-minimum-due-trap.html' }
  ];

  return (
    <div className="calculator-container emi-container">
      <Head>
    <title>EMI & Loan Calculator 2025 India | Home, Car & Personal Loan EMI | Upaman</title>
    <meta name="description" content="Free EMI & Loan Calculator India 2025. Calculate home, car, personal loan EMIs, prepayment savings and complete amortization schedule with interest breakdown." />
    <meta name="keywords" content="EMI calculator India 2025, loan calculator, home loan EMI, car loan EMI, personal loan EMI, prepayment calculator, amortization schedule" />
    <link rel="canonical" href="https://upaman.com/loan-calculator" />
    <meta property="og:title" content="EMI & Loan Calculator 2025 India | Upaman" />
    <meta property="og:description" content="Calculate EMI for home, car & personal loans with prepayment impact and amortization schedule." />
    <meta property="og:url" content="https://upaman.com/loan-calculator" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
    <meta property="og:image:alt" content="EMI & Loan Calculator - Upaman" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="EMI & Loan Calculator 2025 India | Upaman" />
    <meta name="twitter:description" content="Free EMI & Loan Calculator with prepayment savings and amortization schedule." />
    <meta name="twitter:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
      "name": "EMI & Loan Calculator 2025 India",
      "url": "https://upaman.com/loan-calculator",
            "description": "Free EMI Calculator for home loan, car loan, personal loan with prepayment options and amortization schedule",
            "applicationCategory": "Finance & Loans",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "featureList": ["EMI Calculator", "Prepayment Calculator", "Amortization Schedule", "Interest Savings Calculator", "Loan Comparison Tool"]
          })
        }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />
      </Head>


      <div id="calculator-tool" className="calculator-card">
        <div className="calculator-header emi-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <h2 className="header-title">
            Comprehensive Loan Calculator
          </h2>
          <div className="mobile-tabs">
            <button
              className={`mobile-tab-button ${activeTab === 'emi' ? 'active' : ''}`}
              onClick={() => setActiveTab('emi')}
            >
              EMI Calculator
            </button>
            <button
              className={`mobile-tab-button ${activeTab === 'prepayment' ? 'active' : ''}`}
              onClick={() => setActiveTab('prepayment')}
            >
              Prepayment Calculator
            </button>
          </div>
        </div>

        <div className="mobile-card-content">
          {activeTab === 'emi' && (
            <div>
              <h2 style={{fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: '700', color: '#2C3E50', textAlign: 'center', marginBottom: '2rem'}}>
                EMI and Amortization Calculator
              </h2>

              <div style={{
                background: 'linear-gradient(135deg, #F8F9FA, #E9ECEF)',
                padding: 'clamp(1rem, 4vw, 2rem)',
                borderRadius: '1.25rem',
                marginBottom: '2rem'
              }}>
                <div className="responsive-grid" style={{alignItems: 'end'}}>
                  <div>
                    <label className="input-label">
                      Loan Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={emiParams.loanAmount || ''}
                      onChange={(e) => setEmiParams(prev => ({...prev, loanAmount: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={emiParams.interestRate || ''}
                      onChange={(e) => setEmiParams(prev => ({...prev, interestRate: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">
                      Loan Tenure
                    </label>
                    <div className="tenure-input-group">
                      <input
                        type="number"
                        value={emiParams.loanTenure || ''}
                        onChange={(e) => setEmiParams(prev => ({...prev, loanTenure: parseFloat(e.target.value) || 0}))}
                        className="calculator-input tenure-input"
                        placeholder={`Enter ${emiParams.tenureUnit === 'years' ? 'years' : 'months'}`}
                      />
                      <div className="tenure-toggle-container">
                        <div className="tenure-toggle-label">Unit</div>
                        <div 
                          className="tenure-toggle"
                          onClick={() => setEmiParams(prev => ({
                            ...prev, 
                            tenureUnit: prev.tenureUnit === 'months' ? 'years' : 'months',
                            // Auto-convert tenure when unit changes
                            loanTenure: prev.tenureUnit === 'months' 
                              ? Math.round(prev.loanTenure / 12 * 10) / 10 
                              : prev.loanTenure * 12
                          }))}
                        >
                          <div className={`tenure-toggle-slider ${emiParams.tenureUnit === 'years' ? 'years' : ''}`}></div>
                          <div className="tenure-toggle-options">
                            <div className={`tenure-toggle-option ${emiParams.tenureUnit === 'months' ? 'active' : ''}`}>
                              Months
                            </div>
                            <div className={`tenure-toggle-option ${emiParams.tenureUnit === 'years' ? 'active' : ''}`}>
                              Years
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={calculateEMIDetails}
                      className="calculator-button primary-button mobile-button"
                    >
                      Calculate EMI
                    </button>
                  </div>
                </div>
              </div>

              {emiResult && (
                <div className="results-container" ref={resultsRef}>
                  <h3 className="results-title">
                    💡 Results
                  </h3>
                  <div className="results-grid">
                    <div className="result-item">
                      <div className="result-label">Monthly EMI</div>
                      <div className="result-value emi">{formatINR(emiResult.emi)}</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Loan Tenure</div>
                      <div className="result-value tenure">{emiResult.displayTenure}</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Total Amount</div>
                      <div className="result-value total">{formatINR(emiResult.totalAmount)}</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Total Interest</div>
                      <div className="result-value interest">{formatINR(emiResult.totalInterest)}</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Principal</div>
                      <div className="result-value principal">{formatINR(emiResult.loanAmount)}</div>
                    </div>
                  </div>
                  <PieBreakdownChart
                    title="Principal vs total interest"
                    items={[
                      { label: 'Principal', value: emiResult.loanAmount, color: '#3b82f6' },
                      { label: 'Total interest', value: emiResult.totalInterest, color: '#f97316' }
                    ]}
                    formatter={formatINR}
                  />

                  {/* Affiliate Recommendations */}
                  <AffiliateRecommendations 
                    calculatorType="emi" 
                    result={emiResult}
                    isDarkMode={false} 
                  />
                  <ResultActions
                    title="Loan EMI summary"
                    summaryLines={emiShareLines}
                    fileName="upaman-emi-summary.txt"
                  />
                </div>
              )}

              {amortizationData.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowAmortization(!showAmortization)}
                    className="mobile-button"
                    style={{
                      background: 'linear-gradient(135deg, #27AE60, #2ECC71)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '1rem',
                      maxWidth: '200px'
                    }}
                  >
                    {showAmortization ? '📉 Hide' : '📋 Show'} Amortization
                  </button>

                  {showAmortization && (
                    <div className="responsive-table-container">
                      <div style={{maxHeight: '400px', overflow: 'auto'}}>
                        <table className="responsive-table">
                          <thead style={{
                            background: 'linear-gradient(135deg, #34495E, #2C3E50)',
                            color: 'white',
                            position: 'sticky',
                            top: 0
                          }}>
                            <tr>
                              <th style={{padding: '0.75rem', fontSize: '0.875rem'}}>Month</th>
                              <th style={{padding: '0.75rem', fontSize: '0.875rem'}}>EMI</th>
                              <th style={{padding: '0.75rem', fontSize: '0.875rem'}}>Principal</th>
                              <th style={{padding: '0.75rem', fontSize: '0.875rem'}}>Interest</th>
                              <th style={{padding: '0.75rem', fontSize: '0.875rem'}}>Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {amortizationData.map((row, index) => (
                              <tr key={row.month} style={{backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'}}>
                                <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem'}}>{row.month}</td>
                                <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem'}}>{formatINR(row.emi)}</td>
                                <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem'}}>{formatINR(row.principal)}</td>
                                <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem'}}>{formatINR(row.interest)}</td>
                                <td style={{padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem'}}>{formatINR(row.balance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'prepayment' && (
            <div>
              <h2 style={{fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: '700', color: '#2C3E50', textAlign: 'center', marginBottom: '2rem'}}>
                Prepayment Analysis
              </h2>

              <div style={{
                background: 'linear-gradient(135deg, #F8F9FA, #E9ECEF)',
                padding: 'clamp(1rem, 4vw, 2rem)',
                borderRadius: '1.25rem',
                marginBottom: '2rem'
              }}>
                <div className="responsive-grid">
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#2C3E50',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase'
                    }}>
                      Outstanding (₹)
                    </label>
                    <input
                      type="number"
                      value={prepaymentParams.outstandingAmount || ''}
                      onChange={(e) => setPrepaymentParams(prev => ({...prev, outstandingAmount: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#2C3E50',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase'
                    }}>
                      Current EMI (₹)
                    </label>
                    <input
                      type="number"
                      value={prepaymentParams.currentEMI || ''}
                      onChange={(e) => setPrepaymentParams(prev => ({...prev, currentEMI: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#2C3E50',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase'
                    }}>
                      Remaining Tenure
                    </label>
                    <div className="tenure-input-group">
                      <input
                        type="number"
                        value={prepaymentParams.remainingMonths || ''}
                        onChange={(e) => setPrepaymentParams(prev => ({...prev, remainingMonths: parseFloat(e.target.value) || 0}))}
                        className="calculator-input tenure-input"
                        placeholder={`Enter ${prepaymentParams.remainingTenureUnit === 'years' ? 'years' : 'months'}`}
                      />
                      <div className="tenure-toggle-container">
                        <div className="tenure-toggle-label">Unit</div>
                        <div 
                          className="tenure-toggle"
                          onClick={() => setPrepaymentParams(prev => ({
                            ...prev, 
                            remainingTenureUnit: prev.remainingTenureUnit === 'months' ? 'years' : 'months',
                            // Auto-convert tenure when unit changes
                            remainingMonths: prev.remainingTenureUnit === 'months' 
                              ? Math.round(prev.remainingMonths / 12 * 10) / 10 
                              : prev.remainingMonths * 12
                          }))}
                        >
                          <div className={`tenure-toggle-slider ${prepaymentParams.remainingTenureUnit === 'years' ? 'years' : ''}`}></div>
                          <div className="tenure-toggle-options">
                            <div className={`tenure-toggle-option ${prepaymentParams.remainingTenureUnit === 'months' ? 'active' : ''}`}>
                              Months
                            </div>
                            <div className={`tenure-toggle-option ${prepaymentParams.remainingTenureUnit === 'years' ? 'active' : ''}`}>
                              Years
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#2C3E50',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase'
                    }}>
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={prepaymentParams.interestRate || ''}
                      onChange={(e) => setPrepaymentParams(prev => ({...prev, interestRate: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                </div>
              </div>

              {scenarios.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                  padding: 'clamp(2rem, 6vw, 3rem)',
                  background: '#f8f9fa',
                  borderRadius: '1rem'
                }}>
                  Enter all parameters to see scenarios
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'clamp(1rem, 3vw, 1.5rem)',
                    marginBottom: '2rem'
                  }}>
                    {scenarios.map((scenario, index) => (
                      <div
                        key={index}
                        style={{
                          border: scenario.isHighlighted ? '3px solid #27AE60' : '2px solid #E9ECEF',
                          borderRadius: '1rem',
                          padding: 'clamp(1rem, 3vw, 1.5rem)',
                          background: scenario.isHighlighted ? '#f8fff8' : 'white',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                        }}
                      >
                        <div style={{
                          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                          fontWeight: '700',
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          {scenario.title}
                          {scenario.isHighlighted && (
                            <span style={{
                              background: '#27AE60',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.75rem',
                              fontSize: '0.625rem',
                              fontWeight: '700'
                            }}>
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                          <div style={{
                            padding: '0.75rem',
                            background: '#f8f9fa',
                            borderRadius: '0.5rem',
                            textAlign: 'center'
                          }}>
                            <div style={{fontSize: '0.688rem', color: '#666', marginBottom: '0.25rem'}}>NEW EMI</div>
                            <div style={{fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '700', color: '#3498DB'}}>
                              {formatINR(scenario.newEMI)}
                            </div>
                          </div>
                          <div style={{
                            padding: '0.75rem',
                            background: '#f8f9fa',
                            borderRadius: '0.5rem',
                            textAlign: 'center'
                          }}>
                            <div style={{fontSize: '0.688rem', color: '#666', marginBottom: '0.25rem'}}>MONTHLY SAVINGS</div>
                            <div style={{fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '700', color: '#27AE60'}}>
                              {formatINR(scenario.monthlySavings)}
                            </div>
                          </div>
                          <div style={{
                            padding: '0.75rem',
                            background: '#f8f9fa',
                            borderRadius: '0.5rem',
                            textAlign: 'center'
                          }}>
                            <div style={{fontSize: '0.688rem', color: '#666', marginBottom: '0.25rem'}}>NEW PRINCIPAL</div>
                            <div style={{fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '700', color: '#2C3E50'}}>
                              {formatINR(prepaymentParams.outstandingAmount - scenario.prepayment)}
                            </div>
                          </div>
                          <div style={{
                            padding: '0.75rem',
                            background: '#f8f9fa',
                            borderRadius: '0.5rem',
                            textAlign: 'center'
                          }}>
                            <div style={{fontSize: '0.688rem', color: '#666', marginBottom: '0.25rem'}}>TOTAL SAVINGS</div>
                            <div style={{fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '700', color: '#27AE60'}}>
                              {formatINR(scenario.totalSavings)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <ComparisonBars
                    title="Prepayment scenarios: total savings comparison"
                    items={scenarios.map((scenario) => ({
                      label: scenario.title,
                      value: scenario.totalSavings,
                      color: scenario.isHighlighted ? '#16a34a' : '#60a5fa'
                    }))}
                    formatter={formatINR}
                  />

                  <div style={{
                    background: 'linear-gradient(135deg, #ECF0F1, #BDC3C7)',
                    borderRadius: '1rem',
                    padding: 'clamp(1rem, 4vw, 1.5rem)'
                  }}>
                    <h3 style={{
                      fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                      fontWeight: '700',
                      textAlign: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      Custom Calculator
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      alignItems: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <label style={{fontWeight: '600', fontSize: '1rem', alignSelf: 'flex-start'}}>Amount (₹):</label>
                      <input
                        type="number"
                        placeholder="Enter prepayment amount"
                        value={customPrepayment}
                        onChange={(e) => setCustomPrepayment(e.target.value)}
                        className="mobile-input"
                        style={{
                          border: '2px solid #BDC3C7',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          maxWidth: '300px'
                        }}
                      />
                      <button
                        onClick={calculateCustom}
                        className="mobile-button"
                        style={{
                          background: 'linear-gradient(135deg, #3498DB, #2980B9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          maxWidth: '200px'
                        }}
                      >
                        Calculate
                      </button>
                    </div>

                    {customResult && (
                      <div ref={customResultsRef} style={{
                        background: 'white',
                        border: '2px solid #27AE60',
                        borderRadius: '0.75rem',
                        padding: 'clamp(1rem, 3vw, 1.5rem)',
                        textAlign: 'center'
                      }}>
                        <div style={{fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '700', color: '#3498DB', marginBottom: '0.75rem'}}>
                          New EMI: {customResult.newEMI}
                        </div>
                        <div style={{fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', color: '#27AE60'}}>
                          Monthly Savings: {customResult.monthlySavings} | Total Savings: {customResult.totalSavings}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mobile-card-content" style={{ paddingTop: 0 }}>
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Loan amount, annual interest rate, and tenure in months/years',
              'Prepayment analysis uses outstanding principal and remaining tenure'
            ]}
            formulas={[
              'EMI = P × r × (1+r)^n / ((1+r)^n - 1)',
              'Amortization: monthly interest = outstanding × monthly rate'
            ]}
            assumptions={[
              'Interest rate stays constant through the selected tenure',
              'Prepayment scenarios keep tenure fixed and estimate EMI impact',
              'Results are planning estimates, not lender-sanctioned repayment schedules'
            ]}
            sources={[
              { label: 'RBI Financial Education (loan basics)', url: 'https://www.rbi.org.in/financialeducation/' }
            ]}
            guideLinks={[
              { label: 'EMI prepayment strategy guide', href: '/guide-emi-prepayment-strategy.html' },
              { label: 'Credit card minimum due trap guide', href: '/guide-credit-card-minimum-due-trap.html' }
            ]}
          />
        </div>
      </div>
      <CalculatorArticleLayout
        title="EMI and Loan Calculator India: EMI, Interest Split, and Prepayment Impact"
        summary={(
          <p style={{ margin: 0 }}>
            Start with calculator-first EMI and prepayment analysis, then review full educational notes on formulas,
            examples, mistakes, and decision tips below the tool.
          </p>
        )}
        intro={(
          <>
            <p>
              Loan decisions are rarely just about whether a bank approves your application. The real question is
              whether the EMI structure fits your long-term cash flow without creating pressure on emergency savings and
              essential spending. A practical calculator should therefore explain how EMI is formed, how much of each
              payment goes to interest, and how early prepayment can reduce total cost. This page is built for that
              planning workflow, not just a one-line EMI output.
            </p>
            <p>
              Many borrowers focus only on monthly EMI and ignore total interest over the full tenure. Two loans can
              show similar EMIs but very different total outflow depending on tenure and rate. Extending tenure often
              lowers monthly burden but increases total interest materially. Shortening tenure raises EMI but may reduce
              lifetime cost. This calculator surfaces both views so you can balance affordability and efficiency.
            </p>
            <p>
              The second major decision is prepayment. If you receive bonus income, sale proceeds, or annual surplus,
              a partial prepayment may produce meaningful savings. However, impact depends on outstanding principal,
              remaining tenure, and current rate. Random guesses are risky because a prepayment that looks large may
              still deliver limited savings if done late in tenure. The built-in prepayment scenarios here help you test
              alternatives quickly before you commit funds.
            </p>
          </>
        )}
        explanation={(
          <>
            <p>
              EMI calculation follows the reducing-balance formula. Principal (P), monthly interest rate (r), and total
              installments (n) are used to derive a constant monthly payment. Although EMI amount stays constant in a
              standard schedule, the composition changes: early payments carry higher interest share because outstanding
              principal is highest at the start. As principal reduces, interest portion declines and principal repayment
              increases.
            </p>
            <p>
              That changing composition is why amortization view is critical. Without it, borrowers often underestimate
              how much interest is front-loaded in initial years. The schedule table in this page provides month-level
              visibility for payment amount, principal component, interest component, and remaining balance. This helps
              in refinance timing, cash-flow forecasting, and discipline around annual prepayment opportunities.
            </p>
            <p>
              Prepayment analysis in this calculator starts from outstanding principal and remaining tenure. For each
              scenario, prepayment amount is deducted first, then a revised EMI is estimated for remaining months at the
              chosen rate. Monthly and total savings are shown so you can compare options instead of acting on intuition.
              A custom prepayment field allows testing your exact surplus amount beyond predefined percentages.
            </p>
            <p>
              This model is designed for planning. Real loans may include floating rates, reset clauses, processing
              charges, foreclosure conditions, and lender-specific rules around EMI-versus-tenure adjustment after
              prepayment. Use this page to shortlist decisions quickly, then confirm execution details with your lender
              schedule before final action.
            </p>
          </>
        )}
        example={(
          <>
            <p>
              Consider a home loan of ₹25,00,000 at 8.5% annual interest for 20 years. EMI mode estimates monthly EMI,
              total payment, and total interest over full tenure. Suppose the result shows EMI around ₹21,700 (illustrative)
              with substantial cumulative interest over 240 months. Now assume after a few years your outstanding
              principal is ₹25,77,227 and you can prepay 20% once.
            </p>
            <p>
              In prepayment mode, enter outstanding amount, current EMI, remaining tenure, and rate. The scenario card
              then shows revised EMI and savings. If monthly savings and total projected savings are strong relative to
              your liquidity needs, prepayment may be worth it. If savings are modest and emergency reserves are tight,
              retaining cash can be more prudent. This structured comparison is the reason prepayment should be modeled,
              not guessed.
            </p>
          </>
        )}
        tips={(
          <>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              <li>Do not evaluate loans on EMI alone; always compare total interest outflow.</li>
              <li>Use realistic tenure assumptions; very long tenures can mask high total borrowing cost.</li>
              <li>Run prepayment scenarios before using bonus cash on discretionary spending.</li>
              <li>Keep an emergency buffer before large prepayment actions.</li>
              <li>Recalculate after rate changes, refinance events, or significant income shifts.</li>
            </ul>
          </>
        )}
        faq={(
          <>
            {faqItems.map((item) => (
              <div key={item.question} style={{ marginBottom: '0.65rem' }}>
                <h3 style={{ margin: '0 0 0.15rem', fontSize: '0.95rem', color: '#0f2a43' }}>{item.question}</h3>
                <p style={{ margin: 0 }}>{item.answer}</p>
              </div>
            ))}
          </>
        )}
        relatedGuides={relatedGuides}
        methodology={(
          <>
            <p>
              Methodology uses standard reducing-balance EMI mathematics and month-level amortization expansion.
              Prepayment scenarios recompute payment effect after principal reduction while holding remaining months and
              rate assumptions constant in this model.
            </p>
            <p>
              Assumptions: fixed-rate behavior for projection, no processing-fee effects, and no dynamic reset modeling.
              Real lender outcomes can vary because of contractual clauses and floating benchmarks. Validate major
              financial decisions with lender amortization statements.
            </p>
          </>
        )}
      >
        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
          Use the calculator below for fresh EMI planning or switch to prepayment mode for savings analysis.
        </p>
      </CalculatorArticleLayout>
    </div>
  );
});

export default ComprehensiveLoanCalculator;
