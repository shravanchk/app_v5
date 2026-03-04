import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Calculator, TrendingUp, Info } from 'lucide-react';
import AffiliateRecommendations from './AffiliateRecommendations';
import AdSenseAd from './AdSenseAd';
import HomeButton from './HomeButton';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';

const UKIncomeTaxCalculator = ({ onBack }) => {
  const [income, setIncome] = useState('');
  const [region, setRegion] = useState('england'); // england, scotland, wales, ni
  const [pensionContribution, setPensionContribution] = useState('');
  const [studentLoan, setStudentLoan] = useState('none'); // none, plan1, plan2, plan4, plan5, postgrad
  const [results, setResults] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const formatGBP = (value) =>
    `£${Number(value || 0).toLocaleString('en-GB', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;

  // 2025-26 Tax Rates
  const TAX_RATES = {
    personalAllowance: 12570,
    england: {
      basic: { min: 12570, max: 50270, rate: 0.20 },
      higher: { min: 50270, max: 125140, rate: 0.40 },
      additional: { min: 125140, rate: 0.45 }
    },
    scotland: {
      starter: { min: 12570, max: 14876, rate: 0.19 },
      basic: { min: 14876, max: 26561, rate: 0.20 },
      intermediate: { min: 26561, max: 43662, rate: 0.21 },
      higher: { min: 43662, max: 125140, rate: 0.42 },
      top: { min: 125140, rate: 0.47 }
    }
  };

  const NI_RATES = {
    class1: {
      threshold: 12570,
      upperLimit: 50270,
      rate1: 0.12,
      rate2: 0.02
    }
  };

  const STUDENT_LOAN_RATES = {
    plan1: { threshold: 24990, rate: 0.09 },
    plan2: { threshold: 27295, rate: 0.09 },
    plan4: { threshold: 31395, rate: 0.09 },
    plan5: { threshold: 25000, rate: 0.09 },
    postgrad: { threshold: 21000, rate: 0.06 }
  };

  const calculateMarginalRate = (income) => {
    if (region === 'scotland') {
      if (income <= 14876) return 31; // 19% + 12%
      if (income <= 26561) return 32; // 20% + 12%
      if (income <= 43662) return 33; // 21% + 12%
      if (income <= 50270) return 54; // 42% + 12%
      if (income <= 125140) return 44; // 42% + 2%
      return 49; // 47% + 2%
    } else {
      if (income <= 50270) return 32; // 20% + 12%
      if (income <= 125140) return 42; // 40% + 2%
      return 47; // 45% + 2%
    }
  };

  useEffect(() => {
    const performCalculation = () => {
      if (!income) return;

      const grossIncome = parseFloat(income);
      const pension = parseFloat(pensionContribution) || 0;
      const taxableIncome = Math.max(0, grossIncome - pension);

      // Personal Allowance reduction for high earners
      let personalAllowance = TAX_RATES.personalAllowance;
      if (taxableIncome > 100000) {
        const reduction = Math.min(personalAllowance, Math.floor((taxableIncome - 100000) / 2));
        personalAllowance = Math.max(0, personalAllowance - reduction);
      }

      // Income Tax calculation
      let incomeTax = 0;
      const taxableAfterAllowance = Math.max(0, taxableIncome - personalAllowance);

      if (region === 'scotland') {
        const rates = TAX_RATES.scotland;
        
        // Scottish tax calculation
        if (taxableAfterAllowance > rates.starter.min - personalAllowance) {
          const starterTax = Math.min(taxableAfterAllowance, rates.starter.max - personalAllowance) * rates.starter.rate;
          incomeTax += starterTax;
        }
        
        if (taxableAfterAllowance > rates.basic.min - personalAllowance) {
          const basicAmount = Math.min(taxableAfterAllowance - (rates.basic.min - personalAllowance), rates.basic.max - rates.basic.min);
          if (basicAmount > 0) incomeTax += basicAmount * rates.basic.rate;
        }
        
        if (taxableAfterAllowance > rates.intermediate.min - personalAllowance) {
          const intAmount = Math.min(taxableAfterAllowance - (rates.intermediate.min - personalAllowance), rates.intermediate.max - rates.intermediate.min);
          if (intAmount > 0) incomeTax += intAmount * rates.intermediate.rate;
        }
        
        if (taxableAfterAllowance > rates.higher.min - personalAllowance) {
          const higherAmount = Math.min(taxableAfterAllowance - (rates.higher.min - personalAllowance), rates.higher.max - rates.higher.min);
          if (higherAmount > 0) incomeTax += higherAmount * rates.higher.rate;
        }
        
        if (taxableAfterAllowance > rates.top.min - personalAllowance) {
          const topAmount = taxableAfterAllowance - (rates.top.min - personalAllowance);
          if (topAmount > 0) incomeTax += topAmount * rates.top.rate;
        }
      } else {
        // England, Wales, Northern Ireland
        const rates = TAX_RATES.england;
        
        if (taxableAfterAllowance > rates.basic.min - personalAllowance) {
          const basicAmount = Math.min(taxableAfterAllowance, rates.basic.max - personalAllowance);
          incomeTax += basicAmount * rates.basic.rate;
        }
        
        if (taxableAfterAllowance > rates.higher.min - personalAllowance) {
          const higherAmount = Math.min(taxableAfterAllowance - (rates.higher.min - personalAllowance), rates.higher.max - rates.higher.min);
          if (higherAmount > 0) incomeTax += higherAmount * rates.higher.rate;
        }
        
        if (taxableAfterAllowance > rates.additional.min - personalAllowance) {
          const additionalAmount = taxableAfterAllowance - (rates.additional.min - personalAllowance);
          if (additionalAmount > 0) incomeTax += additionalAmount * rates.additional.rate;
        }
      }

      // National Insurance calculation
      let nationalInsurance = 0;
      const niableIncome = Math.max(0, grossIncome - NI_RATES.class1.threshold);
      
      if (niableIncome > 0) {
        const lowerAmount = Math.min(niableIncome, NI_RATES.class1.upperLimit - NI_RATES.class1.threshold);
        nationalInsurance += lowerAmount * NI_RATES.class1.rate1;
        
        if (niableIncome > NI_RATES.class1.upperLimit - NI_RATES.class1.threshold) {
          const upperAmount = niableIncome - (NI_RATES.class1.upperLimit - NI_RATES.class1.threshold);
          nationalInsurance += upperAmount * NI_RATES.class1.rate2;
        }
      }

      // Student Loan calculation
      let studentLoanRepayment = 0;
      if (studentLoan !== 'none' && STUDENT_LOAN_RATES[studentLoan]) {
        const threshold = STUDENT_LOAN_RATES[studentLoan].threshold;
        const rate = STUDENT_LOAN_RATES[studentLoan].rate;
        if (grossIncome > threshold) {
          studentLoanRepayment = (grossIncome - threshold) * rate;
        }
      }

      const totalTax = incomeTax + nationalInsurance + studentLoanRepayment;
      const netIncome = grossIncome - totalTax;

      setResults({
        grossIncome,
        incomeTax,
        nationalInsurance,
        studentLoanRepayment,
        pension,
        totalTax,
        netIncome,
        personalAllowance,
        taxableIncome,
        effectiveRate: (totalTax / grossIncome) * 100,
        marginalRate: calculateMarginalRate(grossIncome),
        monthlyNet: netIncome / 12,
        weeklyNet: netIncome / 52
      });
    };

    performCalculation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income, region, pensionContribution, studentLoan]);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)',
      padding: '2rem 1rem',
      fontFamily: 'var(--app-font)'
    }}>
      <Head>
        <title>UK Income Tax Calculator 2025-26 | Free Tax Calculator | Personal Allowance £12,570 | Upaman</title>
        <meta name="description" content="Free UK Income Tax Calculator for 2025-26. Calculate income tax, National Insurance, student loan repayments with Personal Allowance £12,570. Supports England, Scotland, Wales tax rates." />
        <meta name="keywords" content="UK income tax calculator 2025-26, personal allowance 12570, income tax rates UK, national insurance calculator, student loan repayment calculator, Scottish tax rates, UK tax calculator free" />
        <link rel="canonical" href="https://upaman.com/uk-income-tax-calculator" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="UK Income Tax Calculator 2025-26 | Free Tax Calculator" />
        <meta property="og:description" content="Calculate UK income tax, National Insurance & student loans for 2025-26. Personal Allowance £12,570. Supports all UK regions." />
        <meta property="og:url" content="https://upaman.com/uk-income-tax-calculator" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Cards */}
        <meta name="twitter:title" content="UK Income Tax Calculator 2025-26 | Free" />
        <meta name="twitter:description" content="Calculate UK income tax, National Insurance & student loans for 2025-26. Personal Allowance £12,570." />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "UK Income Tax Calculator 2025-26",
            "description": "Calculate UK income tax, National Insurance, and student loan repayments for tax year 2025-26",
            "url": "https://upaman.com/uk-income-tax-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "GBP"
            },
            "featureList": [
              "Income Tax calculation for 2025-26",
              "National Insurance calculation",
              "Student Loan repayment calculation",
              "Scottish tax rates support",
              "Personal Allowance calculation",
              "Marginal and effective tax rates"
            ]
          })}
        </script>

        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is the Personal Allowance for 2025-26?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Personal Allowance for 2025-26 is £12,570. This is the amount you can earn before paying income tax."
                }
              },
              {
                "@type": "Question",
                "name": "What are the UK income tax rates for 2025-26?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For England, Wales and Northern Ireland: 20% (£12,571-£50,270), 40% (£50,271-£125,140), 45% (over £125,140). Scotland has different rates with additional bands."
                }
              },
              {
                "@type": "Question",
                "name": "How is National Insurance calculated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "National Insurance is charged at 12% on earnings between £12,570-£50,270, and 2% on earnings above £50,270."
                }
              }
            ]
          })}
        </script>
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="calculator-header uk-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #0f2a43, #1d4e89, #0f766e)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              UK Income Tax Calculator
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '1.1rem',
              marginBottom: '0',
              fontWeight: '500'
            }}>
              Calculate Tax, National Insurance & Student Loans for 2025-26
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Input Panel */}
          <div className="uk-container">
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 16px 36px rgba(15, 42, 67, 0.14)',
              border: '1px solid #dbe2eb'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Calculator size={24} style={{ color: '#0f766e' }} />
                Tax Calculator
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Annual Income */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#334155',
                    fontSize: '0.95rem'
                  }}>
                    Annual Gross Income (£)
                  </label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="e.g., 50000"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #d1dae6',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      background: '#f8fafc'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0f766e'}
                    onBlur={(e) => e.target.style.borderColor = '#d1dae6'}
                  />
                </div>

                {/* Region */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#334155',
                    fontSize: '0.95rem'
                  }}>
                    UK Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #d1dae6',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      background: '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="england">England & Wales & NI</option>
                    <option value="scotland">Scotland (Different Rates)</option>
                  </select>
                </div>

                {/* Pension Contribution */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#334155',
                    fontSize: '0.95rem'
                  }}>
                    Annual Pension Contribution (£)
                  </label>
                  <input
                    type="number"
                    value={pensionContribution}
                    onChange={(e) => setPensionContribution(e.target.value)}
                    placeholder="e.g., 5000"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #d1dae6',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      background: '#f8fafc'
                    }}
                  />
                </div>

                {/* Student Loan */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#334155',
                    fontSize: '0.95rem'
                  }}>
                    Student Loan Plan
                  </label>
                  <select
                    value={studentLoan}
                    onChange={(e) => setStudentLoan(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #d1dae6',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      background: '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="none">No Student Loan</option>
                    <option value="plan1">Plan 1 (Pre-2012)</option>
                    <option value="plan2">Plan 2 (2012 onwards)</option>
                    <option value="plan4">Plan 4 (Scotland)</option>
                    <option value="plan5">Plan 5 (2023 onwards)</option>
                    <option value="postgrad">Postgraduate Loan</option>
                  </select>
                </div>

                {/* Key Info Box */}
                <div style={{
                  background: 'linear-gradient(135deg, #eef9f8, #d7f2ee)',
                  border: '1px solid #a7e2dc',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Info size={16} style={{ color: '#0f766e' }} />
                    <span style={{ fontWeight: '600', color: '#115e59' }}>2025-26 Tax Year</span>
                  </div>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#0f766e',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Personal Allowance: £12,570 • Tax rates from 6 April 2025
                  </p>
                </div>
              </div>
            </div>

            {/* AdSense Ad */}
            <div style={{ marginTop: '1.5rem' }}>
              <AdSenseAd />
            </div>
          </div>

          {/* Results Panel */}
          {results && (
            <div className="uk-container">
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 16px 36px rgba(15, 42, 67, 0.14)',
                border: '1px solid #dbe2eb'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <TrendingUp size={24} style={{ color: '#0f766e' }} />
                  Tax Calculation Results
                </h2>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #0f766e, #115e59)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.25rem' }}>Annual Take Home</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>£{results.netIncome.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>£{results.monthlyNet.toLocaleString()} monthly</div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #b45309, #c2410c)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.25rem' }}>Total Tax & NI</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>£{results.totalTax.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{results.effectiveRate.toFixed(1)}% effective rate</div>
                  </div>
                </div>
                <PieBreakdownChart
                  title="Gross income composition"
                  items={[
                    { label: 'Net income', value: results.netIncome, color: '#10b981' },
                    { label: 'Income tax', value: results.incomeTax, color: '#f97316' },
                    { label: 'National Insurance', value: results.nationalInsurance, color: '#3b82f6' },
                    { label: 'Student loan', value: results.studentLoanRepayment, color: '#8b5cf6' }
                  ]}
                  formatter={formatGBP}
                />
                <ComparisonBars
                  title="Annual take-home vs tax burden"
                  items={[
                    { label: 'Annual take-home', value: results.netIncome, color: '#10b981' },
                    { label: 'Total tax + NI + loan', value: results.totalTax, color: '#ef4444' }
                  ]}
                  formatter={formatGBP}
                />

                {/* Detailed Breakdown */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    style={{
                      background: 'linear-gradient(135deg, #0f2a43, #1d4e89)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      width: '100%',
                      marginBottom: '1rem'
                    }}
                  >
                    {showBreakdown ? 'Hide' : 'Show'} Detailed Breakdown
                  </button>

                  {showBreakdown && (
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #dbe2eb',
                      borderRadius: '12px',
                      padding: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '2px solid #1d4e89' }}>
                          <span style={{ fontWeight: '700' }}>Gross Income</span>
                          <span style={{ fontWeight: '700' }}>£{results.grossIncome.toLocaleString()}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Personal Allowance</span>
                          <span style={{ color: '#0f766e' }}>-£{results.personalAllowance.toLocaleString()}</span>
                        </div>

                        {results.pension > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Pension Contribution</span>
                            <span style={{ color: '#0f766e' }}>-£{results.pension.toLocaleString()}</span>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Income Tax</span>
                          <span style={{ color: '#b45309' }}>-£{results.incomeTax.toLocaleString()}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>National Insurance</span>
                          <span style={{ color: '#b45309' }}>-£{results.nationalInsurance.toLocaleString()}</span>
                        </div>

                        {results.studentLoanRepayment > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Student Loan Repayment</span>
                            <span style={{ color: '#b45309' }}>-£{results.studentLoanRepayment.toLocaleString()}</span>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid #0f766e', fontWeight: '700', fontSize: '1.1rem' }}>
                          <span>Net Take Home</span>
                          <span style={{ color: '#0f766e' }}>£{results.netIncome.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #dbe2eb' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ fontWeight: '600', color: '#0f2a43' }}>Effective Rate:</span>
                            <span style={{ marginLeft: '0.5rem' }}>{results.effectiveRate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: '600', color: '#0f2a43' }}>Marginal Rate:</span>
                            <span style={{ marginLeft: '0.5rem' }}>{results.marginalRate}%</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: '600', color: '#0f2a43' }}>Weekly Net:</span>
                            <span style={{ marginLeft: '0.5rem' }}>£{results.weeklyNet.toLocaleString()}</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: '600', color: '#0f2a43' }}>Region:</span>
                            <span style={{ marginLeft: '0.5rem' }}>{region === 'scotland' ? 'Scotland' : 'England/Wales/NI'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Affiliate Recommendations */}
              <div style={{ marginTop: '1.5rem' }}>
                <AffiliateRecommendations calculatorType="uk-tax" />
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: '3rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 16px 36px rgba(15, 42, 67, 0.14)',
            border: '1px solid #dbe2eb'
          }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>
              UK Tax Calculator FAQ 2025-26
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  What is the Personal Allowance for 2025-26?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  The Personal Allowance for 2025-26 is £12,570. This is the amount you can earn tax-free before paying income tax. 
                  However, it reduces by £1 for every £2 you earn over £100,000.
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  How do Scottish tax rates differ?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  Scotland has 5 tax bands: Starter (19%), Basic (20%), Intermediate (21%), Higher (42%), and Top (47%). 
                  This differs from England/Wales/NI which have 3 bands: Basic (20%), Higher (40%), Additional (45%).
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  How is National Insurance calculated?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  National Insurance is charged at 12% on earnings between £12,570-£50,270, and 2% on earnings above £50,270. 
                  The threshold aligns with the Personal Allowance.
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  What are the different Student Loan plans?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  Plan 1 (pre-2012): £24,990 threshold. Plan 2 (2012+): £27,295 threshold. Plan 4 (Scotland): £31,395 threshold. 
                  Plan 5 (2023+): £25,000 threshold. All charge 9% above threshold, except Postgraduate (6% above £21,000).
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* Final AdSense */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <AdSenseAd />
        </div>
      </div>

      <style jsx>{`
        .uk-header {
          animation: slideDown 0.8s ease-out;
        }
        
        .uk-container {
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        details summary::-webkit-details-marker {
          display: none;
        }
        
        details summary::before {
          content: "▶";
          margin-right: 0.5rem;
          transition: transform 0.2s;
        }
        
        details[open] summary::before {
          transform: rotate(90deg);
        }

        @media (max-width: 768px) {
          .uk-container {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default UKIncomeTaxCalculator;
