import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Calculator, TrendingUp, Info } from 'lucide-react';
import AffiliateRecommendations from './AffiliateRecommendations';
import AdSenseAd from './AdSenseAd';
import HomeButton from './HomeButton';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import ResultActions from './ResultActions';
const { calculateUKTax } = require('../utils/taxCalculations');

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

  const calculateMarginalRate = (income) => {
    if (region === 'scotland') {
      if (income <= 16537) return 27; // 19% + 8%
      if (income <= 29526) return 28; // 20% + 8%
      if (income <= 43662) return 29; // 21% + 8%
      if (income <= 50270) return 50; // 42% + 8%
      if (income <= 75000) return 44; // 42% + 2%
      if (income <= 125140) return 47; // 45% + 2%
      return 50; // 48% + 2%
    } else {
      if (income <= 50270) return 28; // 20% + 8%
      if (income <= 125140) return 42; // 40% + 2%
      return 47; // 45% + 2%
    }
  };

  useEffect(() => {
    const performCalculation = () => {
      if (!income) return;

      const taxResult = calculateUKTax({
        grossIncome: parseFloat(income),
        pensionContribution: parseFloat(pensionContribution) || 0,
        region,
        studentLoan
      });

      setResults({
        ...taxResult,
        marginalRate: calculateMarginalRate(taxResult.grossIncome)
      });
    };

    performCalculation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income, region, pensionContribution, studentLoan]);

  const resultShareLines = results ? [
    `Gross income: ${formatGBP(results.grossIncome)}`,
    `Income tax: ${formatGBP(results.incomeTax)}`,
    `Employee National Insurance: ${formatGBP(results.nationalInsurance)}`,
    `Student loan repayment: ${formatGBP(results.studentLoanRepayment)}`,
    `Pension contribution: ${formatGBP(results.pension)}`,
    `Annual take-home: ${formatGBP(results.netIncome)}`,
    `Tax year: 2026-27`
  ] : [];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)',
      padding: '2rem 1rem',
      fontFamily: 'var(--app-font)'
    }}>
      <Head>
        <title>UK Income Tax Calculator 2026-27 | Tax, NI & Student Loan | Upaman</title>
        <meta name="description" content="UK Income Tax Calculator for 2026-27. Estimate PAYE tax, 8% employee National Insurance, pension impact, student loans, and Scottish tax bands." />
        <meta name="keywords" content="UK income tax calculator 2026-27, personal allowance 12570, national insurance calculator 2026-27, student loan repayment, Scottish tax rates" />
        <link rel="canonical" href="https://upaman.com/uk-income-tax-calculator" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="UK Income Tax Calculator 2026-27 | Tax, NI & Student Loan" />
        <meta property="og:description" content="Calculate UK income tax, employee National Insurance and student loan repayments for 2026-27." />
        <meta property="og:url" content="https://upaman.com/uk-income-tax-calculator" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Cards */}
        <meta name="twitter:title" content="UK Income Tax Calculator 2026-27" />
        <meta name="twitter:description" content="Calculate UK income tax, employee National Insurance and student loans for 2026-27." />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "UK Income Tax Calculator 2026-27",
            "description": "Calculate UK income tax, National Insurance, pension impact, and student loan repayments for tax year 2026-27",
            "url": "https://upaman.com/uk-income-tax-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "GBP"
            },
            "featureList": [
              "Income Tax calculation for 2026-27",
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
                "name": "What is the Personal Allowance for 2026-27?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The standard Personal Allowance for 2026-27 is £12,570. It reduces by £1 for every £2 of adjusted net income above £100,000."
                }
              },
              {
                "@type": "Question",
                "name": "What are the UK income tax rates for 2026-27?",
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
                  "text": "Employee Class 1 National Insurance category A is charged at 8% on earnings between £12,570 and £50,270, then 2% above £50,270."
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
              Calculate Tax, National Insurance & Student Loans for 2026-27
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
                    <span style={{ fontWeight: '600', color: '#115e59' }}>2026-27 Tax Year</span>
                  </div>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#0f766e',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Personal Allowance: £12,570 • Rates apply from 6 April 2026
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
                    { label: 'Student loan', value: results.studentLoanRepayment, color: '#8b5cf6' },
                    { label: 'Pension', value: results.pension, color: '#0f766e' }
                  ]}
                  formatter={formatGBP}
                />
                <ComparisonBars
                  title="Annual take-home vs tax burden"
                  items={[
                    { label: 'Annual take-home', value: results.netIncome, color: '#10b981' },
                    { label: 'Total deductions', value: results.totalDeductions, color: '#ef4444' }
                  ]}
                  formatter={formatGBP}
                />
                <ResultActions
                  title="UK tax calculation summary (2026-27)"
                  summaryLines={resultShareLines}
                  fileName="upaman-uk-tax-2026-27-summary.txt"
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
              UK Tax Calculator FAQ 2026-27
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  What is the Personal Allowance for 2026-27?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  The standard Personal Allowance for 2026-27 is £12,570. This is the amount you can earn tax-free before paying income tax.
                  However, it reduces by £1 for every £2 you earn over £100,000.
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  How do Scottish tax rates differ?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  Scotland has 6 tax bands: Starter (19%), Basic (20%), Intermediate (21%), Higher (42%), Advanced (45%), and Top (48%).
                  This differs from England/Wales/NI which have 3 bands: Basic (20%), Higher (40%), Additional (45%).
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  How is National Insurance calculated?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  Employee Class 1 National Insurance category A is charged at 8% on earnings between £12,570 and £50,270, and 2% above £50,270.
                  The threshold aligns with the Personal Allowance.
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  What are the different Student Loan plans?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  Plan 1: £26,900 threshold. Plan 2: £29,385 threshold. Plan 4: £33,795 threshold.
                  Plan 5 (2023+): £25,000 threshold. All charge 9% above threshold, except Postgraduate (6% above £21,000).
                </p>
              </details>
            </div>
          </div>
        </div>

        <section style={{ marginTop: '2rem', background: '#ffffff', border: '1px solid #dbe2eb', borderRadius: '12px', padding: '1.25rem' }}>
          <h2 style={{ margin: '0 0 0.65rem', color: '#0f2a43', fontSize: '1.15rem' }}>2026-27 methodology and official sources</h2>
          <p style={{ margin: '0 0 0.65rem', color: '#475569', lineHeight: 1.6 }}>
            This estimate applies the standard Personal Allowance taper, regional income-tax bands, employee Class 1
            National Insurance category A, and annual student-loan thresholds. Pension input is treated as reducing
            adjusted net income and take-home; actual payroll treatment can vary by scheme.
          </p>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>
            Official references: <a href="https://www.gov.uk/income-tax-rates" target="_blank" rel="noopener noreferrer">UK Income Tax rates</a>,{' '}
            <a href="https://www.gov.uk/scottish-income-tax" target="_blank" rel="noopener noreferrer">Scottish Income Tax</a>,{' '}
            <a href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027" target="_blank" rel="noopener noreferrer">HMRC 2026-27 payroll thresholds</a>, and{' '}
            <a href="https://www.gov.uk/repaying-your-student-loan/what-you-pay" target="_blank" rel="noopener noreferrer">student-loan repayment thresholds</a>.
            See also the <a href="/guides/uk-tax-rates-2026-27">UK tax rates 2026-27 guide</a>.
          </p>
        </section>

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
