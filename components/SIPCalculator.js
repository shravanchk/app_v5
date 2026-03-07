import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from './AffiliateRecommendations';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
import EEATPanel from './calculator/EEATPanel';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import SearchLandingSections from './calculator/SearchLandingSections';
import { buildFaqSchema } from '../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/schema';

const SIPCalculator = () => {
  const [activeTab, setActiveTab] = useState('sip');
  
  // SIP Calculator State
  const [sipParams, setSipParams] = useState({
    monthlyInvestment: 5000,
    annualReturn: 12,
    investmentPeriod: 10,
    stepUpPercentage: 0
  });

  // Goal-based SIP State
  const [goalParams, setGoalParams] = useState({
    targetAmount: 1000000,
    annualReturn: 12,
    investmentPeriod: 10
  });

  // Lumpsum vs SIP State
  const [comparisonParams, setComparisonParams] = useState({
    monthlyAmount: 5000,
    lumpsumAmount: 600000,
    annualReturn: 12,
    investmentPeriod: 10
  });

  // Results
  const [sipResult, setSipResult] = useState(null);
  const [goalResult, setGoalResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [yearlyBreakdown, setYearlyBreakdown] = useState([]);

  // SIP Calculation Functions
  const calculateSIP = useCallback(() => {
    const { monthlyInvestment, annualReturn, investmentPeriod, stepUpPercentage } = sipParams;
    
    if (!monthlyInvestment || !annualReturn || !investmentPeriod) return;

    const monthlyRate = annualReturn / 100 / 12;
    let totalInvestment = 0;
    let futureValue = 0;
    let currentMonthlyAmount = monthlyInvestment;
    const breakdown = [];

    for (let year = 1; year <= investmentPeriod; year++) {
      let yearlyInvestment = 0;

      for (let month = 1; month <= 12; month++) {
        totalInvestment += currentMonthlyAmount;
        yearlyInvestment += currentMonthlyAmount;
        
        // Calculate future value with compound interest
        futureValue = (futureValue + currentMonthlyAmount) * (1 + monthlyRate);
      }

      // Step-up for next year
      if (stepUpPercentage > 0 && year < investmentPeriod) {
        currentMonthlyAmount = currentMonthlyAmount * (1 + stepUpPercentage / 100);
      }

      breakdown.push({
        year,
        yearlyInvestment: Math.round(yearlyInvestment),
        totalInvestment: Math.round(totalInvestment),
        futureValue: Math.round(futureValue),
        returns: Math.round(futureValue - totalInvestment)
      });
    }

    const totalReturns = Math.round(futureValue - totalInvestment);
    
    setSipResult({
      monthlyInvestment: Math.round(currentMonthlyAmount),
      totalInvestment: Math.round(totalInvestment),
      futureValue: Math.round(futureValue),
      totalReturns,
      returnPercentage: ((totalReturns / totalInvestment) * 100).toFixed(2)
    });

    setYearlyBreakdown(breakdown);
  }, [sipParams]);

  const calculateGoalSIP = useCallback(() => {
    const { targetAmount, annualReturn, investmentPeriod } = goalParams;
    
    if (!targetAmount || !annualReturn || !investmentPeriod) return;

    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = investmentPeriod * 12;
    
    // Calculate required monthly SIP using PMT formula
    const requiredMonthlySIP = targetAmount * monthlyRate / 
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const totalInvestment = requiredMonthlySIP * totalMonths;
    const totalReturns = targetAmount - totalInvestment;

    setGoalResult({
      requiredMonthlySIP: Math.round(requiredMonthlySIP),
      totalInvestment: Math.round(totalInvestment),
      targetAmount: Math.round(targetAmount),
      totalReturns: Math.round(totalReturns),
      returnPercentage: ((totalReturns / totalInvestment) * 100).toFixed(2)
    });
  }, [goalParams]);

  const calculateComparison = useCallback(() => {
    const { monthlyAmount, lumpsumAmount, annualReturn, investmentPeriod } = comparisonParams;
    
    if (!monthlyAmount || !lumpsumAmount || !annualReturn || !investmentPeriod) return;

    const monthlyRate = annualReturn / 100 / 12;
    const annualRate = annualReturn / 100;
    const totalMonths = investmentPeriod * 12;

    // SIP Calculation
    const sipFutureValue = monthlyAmount * 
      (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
    const sipTotalInvestment = monthlyAmount * totalMonths;
    const sipReturns = sipFutureValue - sipTotalInvestment;

    // Lumpsum Calculation
    const lumpsumFutureValue = lumpsumAmount * Math.pow(1 + annualRate, investmentPeriod);
    const lumpsumReturns = lumpsumFutureValue - lumpsumAmount;

    setComparisonResult({
      sip: {
        investment: Math.round(sipTotalInvestment),
        futureValue: Math.round(sipFutureValue),
        returns: Math.round(sipReturns),
        returnPercentage: ((sipReturns / sipTotalInvestment) * 100).toFixed(2)
      },
      lumpsum: {
        investment: Math.round(lumpsumAmount),
        futureValue: Math.round(lumpsumFutureValue),
        returns: Math.round(lumpsumReturns),
        returnPercentage: ((lumpsumReturns / lumpsumAmount) * 100).toFixed(2)
      }
    });
  }, [comparisonParams]);

  // Auto-calculate when parameters change
  useEffect(() => {
    if (activeTab === 'sip') calculateSIP();
  }, [activeTab, calculateSIP]);

  useEffect(() => {
    if (activeTab === 'goal') calculateGoalSIP();
  }, [activeTab, calculateGoalSIP]);

  useEffect(() => {
    if (activeTab === 'comparison') calculateComparison();
  }, [activeTab, calculateComparison]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const sipShareLines = sipResult ? [
    `Total investment: ${formatCurrency(sipResult.totalInvestment)}`,
    `Future value: ${formatCurrency(sipResult.futureValue)}`,
    `Total returns: ${formatCurrency(sipResult.totalReturns)}`,
    `Return percentage: ${sipResult.returnPercentage}%`
  ] : [];

  const goalShareLines = goalResult ? [
    `Required monthly SIP: ${formatCurrency(goalResult.requiredMonthlySIP)}`,
    `Total investment: ${formatCurrency(goalResult.totalInvestment)}`,
    `Target amount: ${formatCurrency(goalResult.targetAmount)}`,
    `Projected returns: ${formatCurrency(goalResult.totalReturns)}`
  ] : [];

  const comparisonShareLines = comparisonResult ? [
    `SIP future value: ${formatCurrency(comparisonResult.sip.futureValue)}`,
    `Lumpsum future value: ${formatCurrency(comparisonResult.lumpsum.futureValue)}`,
    `SIP return %: ${comparisonResult.sip.returnPercentage}%`,
    `Lumpsum return %: ${comparisonResult.lumpsum.returnPercentage}%`
  ] : [];

  const seoFaqItems = [
    {
      question: 'What is a SIP step-up calculator used for?',
      answer: 'It helps you model yearly increase in monthly SIP amount so investments can scale with income growth instead of staying flat.'
    },
    {
      question: 'Are SIP returns guaranteed?',
      answer: 'No. SIP returns are market-linked. This tool uses expected return assumptions for planning scenarios only.'
    },
    {
      question: 'Should I choose SIP or lumpsum?',
      answer: 'That depends on cash flow and risk profile. Comparison mode helps you evaluate projected outcomes under aligned assumptions.'
    }
  ];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'SIP Calculator 2025 India',
    url: 'https://upaman.com/sip-calculator',
    description: 'SIP, step-up SIP, goal-based SIP, and SIP vs lumpsum projection calculator for planning.',
    featureList: [
      'SIP Calculator',
      'Step-up SIP Calculator',
      'Goal-based SIP Planner',
      'SIP vs Lumpsum Comparison'
    ]
  });
  const faqSchema = buildFaqSchema(seoFaqItems);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'SIP Calculator', item: 'https://upaman.com/sip-calculator' }
  ]);

  return (
    <div className="calculator-container sip-container">
      <Head>
    <title>SIP Calculator 2025 India | Mutual Fund Returns & Goal Planning | Upaman</title>
    <meta name="description" content="Free SIP Calculator India 2025. Calculate SIP & lumpsum returns, step-up growth, goal-based investment planning and wealth projections." />
    <meta name="keywords" content="SIP calculator India 2025, mutual fund SIP, goal based SIP, lumpsum vs SIP, investment calculator" />
    <link rel="canonical" href="https://upaman.com/sip-calculator" />
    <meta property="og:title" content="SIP Calculator 2025 India | Upaman" />
    <meta property="og:description" content="SIP, step-up, goal & lumpsum mutual fund return projections." />
    <meta property="og:url" content="https://upaman.com/sip-calculator" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
    <meta property="og:image:alt" content="SIP Calculator - Upaman" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="SIP Calculator 2025 India | Upaman" />
    <meta name="twitter:description" content="Mutual fund SIP, step-up & goal planning calculator." />
    <meta name="twitter:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>
      <div className="calculator-card">
        <div className="calculator-header sip-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <h1 className="header-title">
            SIP Investment Calculator
          </h1>
          <div className="mobile-tabs">
            <button
              className={`mobile-tab-button ${activeTab === 'sip' ? 'active' : ''}`}
              onClick={() => setActiveTab('sip')}
            >
              SIP Calculator
            </button>
            <button
              className={`mobile-tab-button ${activeTab === 'goal' ? 'active' : ''}`}
              onClick={() => setActiveTab('goal')}
            >
              Goal-based SIP
            </button>
            <button
              className={`mobile-tab-button ${activeTab === 'comparison' ? 'active' : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              SIP vs Lumpsum
            </button>
          </div>
        </div>

        <div className="mobile-card-content">
          {activeTab === 'sip' && (
            <div>
              <div className="input-section">
                <h2 className="section-title">💡 SIP Investment Details</h2>
                <div className="responsive-grid" style={{alignItems: 'end'}}>
                  <div>
                    <label className="input-label">Monthly Investment (₹)</label>
                    <input
                      type="number"
                      value={sipParams.monthlyInvestment || ''}
                      onChange={(e) => setSipParams(prev => ({...prev, monthlyInvestment: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Expected Annual Return (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={sipParams.annualReturn || ''}
                      onChange={(e) => setSipParams(prev => ({...prev, annualReturn: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Investment Period (Years)</label>
                    <input
                      type="number"
                      value={sipParams.investmentPeriod || ''}
                      onChange={(e) => setSipParams(prev => ({...prev, investmentPeriod: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Annual Step-up (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={sipParams.stepUpPercentage || ''}
                      onChange={(e) => setSipParams(prev => ({...prev, stepUpPercentage: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {sipResult && (
                <div className="results-container">
                  <h3 className="results-title">SIP Investment Results</h3>
                  <div className="results-grid">
                    <div className="result-item">
                      <div className="result-label">Total Investment</div>
                      <div className="result-value principal">{formatCurrency(sipResult.totalInvestment)}</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Future Value</div>
                      <div className="result-value total">{formatCurrency(sipResult.futureValue)}</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Total Returns</div>
                      <div className="result-value interest">{formatCurrency(sipResult.totalReturns)}</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Return Percentage</div>
                      <div className="result-value emi">{sipResult.returnPercentage}%</div>
                    </div>
                  </div>
                  <PieBreakdownChart
                    title="Investment vs returns"
                    items={[
                      { label: 'Total investment', value: sipResult.totalInvestment, color: '#3b82f6' },
                      { label: 'Total returns', value: sipResult.totalReturns, color: '#10b981' }
                    ]}
                    formatter={formatCurrency}
                  />

                  {/* Affiliate Recommendations */}
                  <AffiliateRecommendations 
                    calculatorType="sip" 
                    result={sipResult}
                    isDarkMode={false} 
                  />
                  <ResultActions
                    title="SIP investment summary"
                    summaryLines={sipShareLines}
                    fileName="upaman-sip-summary.txt"
                  />
                </div>
              )}

              {yearlyBreakdown.length > 0 && (
                <div className="results-container">
                  <h3 className="results-title">Year-wise Investment Breakdown</h3>
                  <div className="responsive-table-container">
                    <table className="responsive-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Yearly Investment</th>
                          <th>Total Investment</th>
                          <th>Future Value</th>
                          <th>Returns</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearlyBreakdown.map((row) => (
                          <tr key={row.year}>
                            <td>{row.year}</td>
                            <td>{formatCurrency(row.yearlyInvestment)}</td>
                            <td>{formatCurrency(row.totalInvestment)}</td>
                            <td>{formatCurrency(row.futureValue)}</td>
                            <td>{formatCurrency(row.returns)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'goal' && (
            <div>
              <div className="input-section">
                <h2 className="section-title">Goal-based SIP Calculator</h2>
                <div className="responsive-grid" style={{alignItems: 'end'}}>
                  <div>
                    <label className="input-label">Target Amount (₹)</label>
                    <input
                      type="number"
                      value={goalParams.targetAmount || ''}
                      onChange={(e) => setGoalParams(prev => ({...prev, targetAmount: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Expected Annual Return (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={goalParams.annualReturn || ''}
                      onChange={(e) => setGoalParams(prev => ({...prev, annualReturn: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Investment Period (Years)</label>
                    <input
                      type="number"
                      value={goalParams.investmentPeriod || ''}
                      onChange={(e) => setGoalParams(prev => ({...prev, investmentPeriod: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                </div>
              </div>

              {goalResult && (
                <div className="results-container">
                  <h3 className="results-title">Required SIP Details</h3>
                  <div className="results-grid">
                    <div className="result-item">
                      <div className="result-label">Required Monthly SIP</div>
                      <div className="result-value emi">{formatCurrency(goalResult.requiredMonthlySIP)}</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Total Investment</div>
                      <div className="result-value principal">{formatCurrency(goalResult.totalInvestment)}</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Target Amount</div>
                      <div className="result-value total">{formatCurrency(goalResult.targetAmount)}</div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Total Returns</div>
                      <div className="result-value interest">{formatCurrency(goalResult.totalReturns)}</div>
                    </div>
                  </div>
                  <PieBreakdownChart
                    title="Target amount composition"
                    items={[
                      { label: 'Total investment', value: goalResult.totalInvestment, color: '#3b82f6' },
                      { label: 'Projected returns', value: goalResult.totalReturns, color: '#10b981' }
                    ]}
                    formatter={formatCurrency}
                  />
                  <ResultActions
                    title="Goal-based SIP summary"
                    summaryLines={goalShareLines}
                    fileName="upaman-goal-sip-summary.txt"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'comparison' && (
            <div>
              <div className="input-section">
                <h2 className="section-title">SIP vs Lumpsum Comparison</h2>
                <div className="responsive-grid" style={{alignItems: 'end'}}>
                  <div>
                    <label className="input-label">Monthly SIP Amount (₹)</label>
                    <input
                      type="number"
                      value={comparisonParams.monthlyAmount || ''}
                      onChange={(e) => setComparisonParams(prev => ({...prev, monthlyAmount: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Lumpsum Amount (₹)</label>
                    <input
                      type="number"
                      value={comparisonParams.lumpsumAmount || ''}
                      onChange={(e) => setComparisonParams(prev => ({...prev, lumpsumAmount: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Expected Annual Return (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={comparisonParams.annualReturn || ''}
                      onChange={(e) => setComparisonParams(prev => ({...prev, annualReturn: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Investment Period (Years)</label>
                    <input
                      type="number"
                      value={comparisonParams.investmentPeriod || ''}
                      onChange={(e) => setComparisonParams(prev => ({...prev, investmentPeriod: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                    />
                  </div>
                </div>
              </div>

              {comparisonResult && (
                <div>
                  <div className="scenario-grid">
                    <div className="scenario-card">
                    <div className="scenario-title">
                      SIP Investment
                    </div>
                    <div className="scenario-details">
                      <div className="scenario-detail-item">
                        <div className="scenario-detail-label">Total Investment</div>
                        <div className="scenario-detail-value principal">{formatCurrency(comparisonResult.sip.investment)}</div>
                      </div>
                      <div className="scenario-detail-item">
                        <div className="scenario-detail-label">Future Value</div>
                        <div className="scenario-detail-value new-emi">{formatCurrency(comparisonResult.sip.futureValue)}</div>
                      </div>
                      <div className="scenario-detail-item">
                        <div className="scenario-detail-label">Returns</div>
                        <div className="scenario-detail-value savings">{formatCurrency(comparisonResult.sip.returns)}</div>
                      </div>
                      <div className="scenario-detail-item">
                        <div className="scenario-detail-label">Return %</div>
                        <div className="scenario-detail-value new-emi">{comparisonResult.sip.returnPercentage}%</div>
                      </div>
                    </div>
                    </div>

                    <div className="scenario-card">
                    <div className="scenario-title">
                      Lumpsum Investment
                    </div>
                    <div className="scenario-details">
                      <div className="scenario-detail-item">
                        <div className="scenario-detail-label">Total Investment</div>
                        <div className="scenario-detail-value principal">{formatCurrency(comparisonResult.lumpsum.investment)}</div>
                      </div>
                      <div className="scenario-detail-item">
                        <div className="scenario-detail-label">Future Value</div>
                        <div className="scenario-detail-value new-emi">{formatCurrency(comparisonResult.lumpsum.futureValue)}</div>
                      </div>
                      <div className="scenario-detail-item">
                        <div className="scenario-detail-label">Returns</div>
                        <div className="scenario-detail-value savings">{formatCurrency(comparisonResult.lumpsum.returns)}</div>
                      </div>
                      <div className="scenario-detail-item">
                        <div className="scenario-detail-label">Return %</div>
                        <div className="scenario-detail-value new-emi">{comparisonResult.lumpsum.returnPercentage}%</div>
                      </div>
                    </div>
                    </div>
                  </div>
                  <ComparisonBars
                    title="Future value comparison"
                    items={[
                      { label: 'SIP future value', value: comparisonResult.sip.futureValue, color: '#3b82f6' },
                      { label: 'Lumpsum future value', value: comparisonResult.lumpsum.futureValue, color: '#8b5cf6' }
                    ]}
                    formatter={formatCurrency}
                  />
                  <ComparisonBars
                    title="Return comparison"
                    items={[
                      { label: 'SIP returns', value: comparisonResult.sip.returns, color: '#10b981' },
                      { label: 'Lumpsum returns', value: comparisonResult.lumpsum.returns, color: '#f97316' }
                    ]}
                    formatter={formatCurrency}
                  />
                  <ResultActions
                    title="SIP vs lumpsum comparison summary"
                    summaryLines={comparisonShareLines}
                    fileName="upaman-sip-vs-lumpsum-summary.txt"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mobile-card-content" style={{ paddingTop: 0 }}>
          <EEATPanel
            author="Upaman Research Team"
            reviewer="Investment Methodology Review Desk (Upaman)"
            reviewedOn="March 7, 2026"
            scope="SIP projections are deterministic scenarios based on constant return assumptions and periodic contributions."
            sources={[
              { label: 'SEBI Investor Education', url: 'https://investor.sebi.gov.in/' },
              { label: 'AMFI Knowledge Center', url: 'https://www.amfiindia.com/investor-corner/knowledge-center' },
              { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' }
            ]}
          />
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Monthly SIP amount, expected annual return, investment tenure, and optional step-up',
              'Goal mode uses target corpus, expected return, and tenure'
            ]}
            formulas={[
              'Future value uses monthly compounding for recurring contributions',
              'Goal SIP uses PMT-based reverse calculation for required monthly amount'
            ]}
            assumptions={[
              'Expected return is constant through the full tenure',
              'No entry/exit load, tax, or fund-level expense variations are modeled',
              'Results are estimates for planning, not guaranteed investment outcomes'
            ]}
            sources={[
              { label: 'SEBI investor awareness', url: 'https://investor.sebi.gov.in/' },
              { label: 'AMFI investor education', url: 'https://www.amfiindia.com/investor-corner/knowledge-center' }
            ]}
            guideLinks={[
              { label: 'SIP step-up planning guide', href: '/guide-sip-step-up-planning.html' },
              { label: 'PPF vs SIP guide', href: '/guide-ppf-vs-sip-choice.html' }
            ]}
          />
          <SearchLandingSections
            intro={(
              <>
                <p>
                  SIP planning is most effective when you model both contribution behavior and target outcomes. This SIP
                  calculator supports regular SIP, goal-based planning, and SIP vs lumpsum comparison in one workflow.
                </p>
                <p>
                  If you are searching for SIP step-up calculator or goal SIP calculator, this page helps you estimate
                  required monthly investment, return contribution, and how annual step-up changes long-term outcomes.
                </p>
              </>
            )}
            example={(
              <p>
                Assume ₹15,000 monthly SIP for 15 years at expected 12% annual return. The calculator projects total
                invested amount, expected corpus, and returns. Add a 10% yearly step-up to compare how progressive
                contribution growth can improve final corpus without a large first-year commitment.
              </p>
            )}
            formula={(
              <p>
                SIP mode uses periodic compounding across monthly contributions. Goal mode reverses compounding logic to
                estimate required monthly SIP for a target corpus. Comparison mode evaluates recurring SIP and one-time
                lumpsum under the same return horizon for consistent decision support.
              </p>
            )}
            faqItems={seoFaqItems}
            relatedLinks={[
              { label: 'PPF Calculator', href: '/ppf-calculator' },
              { label: 'Salary Calculator', href: '/salary-calculator' },
              { label: 'SIP Step-up Planning Guide', href: '/guide-sip-step-up-planning.html' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default SIPCalculator;
