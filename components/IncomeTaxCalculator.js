import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Calculator, TrendingUp, Info } from 'lucide-react';
import AffiliateRecommendations from './AffiliateRecommendations';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';

const IncomeTaxCalculator = () => {
  const [activeTab, setActiveTab] = useState('salary-tax');
  
  // Tax Comparison State
  const [comparisonParams, setComparisonParams] = useState({
    annualIncome: 800000,
    deductions: 0
  });
  const [comparisonResult, setComparisonResult] = useState(null);
  
  // Salary Tax State
  const [salaryParams, setSalaryParams] = useState({
    annualSalary: 1200000,
    regime: 'new',
    hra: 0,
    rentPaid: 0,
    section80C: 150000,
    section80D: 25000,
    nps: 50000,
    homeLoanInterest: 0,
    otherDeductions: 0
  });
  
  // Business Tax State
  const [businessParams, setBusinessParams] = useState({
    grossIncome: 2000000,
    businessExpenses: 500000,
    depreciation: 50000,
    otherDeductions: 0,
    advanceTax: 0
  });

  // Results
  const [salaryTaxResult, setSalaryTaxResult] = useState(null);
  const [businessTaxResult, setBusinessTaxResult] = useState(null);

  // Tax slabs for FY 2025-26 (AY 2026-27) - Updated as per ClearTax and Government notification
  const taxSlabs = useMemo(() => ({
    old: [
      { min: 0, max: 250000, rate: 0, description: "No tax" },
      { min: 250000, max: 500000, rate: 5, description: "5% tax on income above ₹2.5 lakh" },
      { min: 500000, max: 1000000, rate: 20, description: "20% tax on income above ₹5 lakh" },
      { min: 1000000, max: Infinity, rate: 30, description: "30% tax on income above ₹10 lakh" }
    ],
    new: [
      { min: 0, max: 400000, rate: 0, description: "No tax" },
      { min: 400000, max: 800000, rate: 5, description: "5% tax on income above ₹4 lakh" },
      { min: 800000, max: 1200000, rate: 10, description: "10% tax on income above ₹8 lakh" },
      { min: 1200000, max: 1600000, rate: 15, description: "15% tax on income above ₹12 lakh" },
      { min: 1600000, max: 2000000, rate: 20, description: "20% tax on income above ₹16 lakh" },
      { min: 2000000, max: 2400000, rate: 25, description: "25% tax on income above ₹20 lakh" },
      { min: 2400000, max: Infinity, rate: 30, description: "30% tax on income above ₹24 lakh" }
    ]
  }), []);

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate tax based on slabs
  const calculateTaxOnIncome = useCallback((income, regime) => {
    const slabs = taxSlabs[regime];
    let tax = 0;
    let breakdown = [];

    for (const slab of slabs) {
      if (income > slab.min) {
        const taxableInThisSlab = Math.min(income, slab.max) - slab.min;
        const taxInThisSlab = (taxableInThisSlab * slab.rate) / 100;
        tax += taxInThisSlab;
        
        if (taxableInThisSlab > 0) {
          breakdown.push({
            range: `₹${slab.min.toLocaleString('en-IN')} - ₹${slab.max === Infinity ? '∞' : slab.max.toLocaleString('en-IN')}`,
            rate: slab.rate,
            taxableAmount: taxableInThisSlab,
            tax: taxInThisSlab
          });
        }
      }
    }

    return { tax, breakdown };
  }, [taxSlabs]);

  // Salary Tax Calculation
  const calculateSalaryTax = useCallback(() => {
    const { annualSalary, regime, hra, rentPaid, section80C, section80D, nps, homeLoanInterest, otherDeductions } = salaryParams;
    
    if (!annualSalary) return;

    let taxableIncome = annualSalary;
    let deductions = 0;

    if (regime === 'old') {
      // Standard deduction for old regime (AY 2026-27)
      const standardDeduction = Math.min(50000, annualSalary);
      deductions += standardDeduction;

      // HRA exemption
      if (hra > 0 && rentPaid > 0) {
        const hraExemption = Math.min(
          hra,
          rentPaid - (annualSalary * 0.1),
          annualSalary * 0.5
        );
        deductions += Math.max(0, hraExemption);
      }

      // Section 80C
      deductions += Math.min(section80C, 150000);
      
      // Section 80D
      deductions += Math.min(section80D, 25000);
      
      // NPS (80CCD(1B))
      deductions += Math.min(nps, 50000);
      
      // Home loan interest (24b)
      deductions += Math.min(homeLoanInterest, 200000);
      
      // Other deductions
      deductions += otherDeductions;
    } else {
      // New regime - standard deduction for AY 2026-27 is ₹75,000
      const standardDeduction = Math.min(75000, annualSalary);
      deductions += standardDeduction;
    }

    taxableIncome = Math.max(0, annualSalary - deductions);
    
    const { tax: incomeTax, breakdown } = calculateTaxOnIncome(taxableIncome, regime);
    
    // Health and Education Cess (4%)
    const cess = incomeTax * 0.04;
    const totalTax = incomeTax + cess;
    
    // Rebate under section 87A (Updated for AY 2026-27)
    let rebate = 0;
    if (regime === 'new') {
      // For AY 2026-27, new regime has rebate of ₹60,000 for taxable income up to ₹12 lakh
      if (taxableIncome <= 1200000) {
        rebate = Math.min(totalTax, 60000);
      }
    } else if (regime === 'old' && taxableIncome <= 500000) {
      rebate = Math.min(totalTax, 12500);
    }
    
    const finalTax = Math.max(0, totalTax - rebate);

    setSalaryTaxResult({
      grossSalary: annualSalary,
      totalDeductions: deductions,
      taxableIncome: taxableIncome,
      incomeTax: incomeTax,
      cess: cess,
      rebate: rebate,
      totalTax: finalTax,
      netSalary: annualSalary - finalTax,
      breakdown: breakdown,
      regime: regime,
      effectiveRate: annualSalary > 0 ? (finalTax / annualSalary) * 100 : 0
    });
  }, [salaryParams, calculateTaxOnIncome]);

  // Business Tax Calculation
  const calculateBusinessTax = useCallback(() => {
    const { grossIncome, businessExpenses, depreciation, otherDeductions, advanceTax } = businessParams;
    
    if (!grossIncome) return;

    const totalExpenses = businessExpenses + depreciation + otherDeductions;
    const netProfit = Math.max(0, grossIncome - totalExpenses);
    const taxableIncome = netProfit;
    
    const { tax: incomeTax, breakdown } = calculateTaxOnIncome(taxableIncome, 'old');
    
    // Health and Education Cess (4%)
    const cess = incomeTax * 0.04;
    const totalTax = incomeTax + cess;
    const balanceTax = Math.max(0, totalTax - advanceTax);

    setBusinessTaxResult({
      grossIncome: grossIncome,
      totalExpenses: totalExpenses,
      netProfit: netProfit,
      taxableIncome: taxableIncome,
      incomeTax: incomeTax,
      cess: cess,
      totalTax: totalTax,
      advanceTax: advanceTax,
      balanceTax: balanceTax,
      breakdown: breakdown,
      effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0
    });
  }, [businessParams, calculateTaxOnIncome]);

  // Calculate tax comparison
  const calculateTaxComparison = useCallback(() => {
    const { annualIncome, deductions } = comparisonParams;
    
    if (!annualIncome || annualIncome <= 0) {
      setComparisonResult(null);
      return;
    }

    // Old regime calculation with standard deduction + provided deductions
    const oldRegimeStandardDeduction = Math.min(50000, annualIncome);
    const oldRegimeTaxableIncome = Math.max(0, annualIncome - oldRegimeStandardDeduction - deductions);
    
    // New regime calculation with only standard deduction
    const newRegimeStandardDeduction = Math.min(75000, annualIncome);
    const newRegimeTaxableIncome = Math.max(0, annualIncome - newRegimeStandardDeduction);

    // Calculate base tax
    const oldRegimeBaseTax = calculateTaxOnIncome(oldRegimeTaxableIncome, 'old').tax;
    const newRegimeBaseTax = calculateTaxOnIncome(newRegimeTaxableIncome, 'new').tax;
    
    // Add health and education cess (4%)
    const oldRegimeCess = oldRegimeBaseTax * 0.04;
    const newRegimeCess = newRegimeBaseTax * 0.04;
    
    const oldRegimeTotalTax = oldRegimeBaseTax + oldRegimeCess;
    const newRegimeTotalTax = newRegimeBaseTax + newRegimeCess;
    
    // Apply rebates
    let oldRegimeRebate = 0;
    let newRegimeRebate = 0;
    
    if (oldRegimeTaxableIncome <= 500000) {
      oldRegimeRebate = Math.min(oldRegimeTotalTax, 12500);
    }
    
    // New regime rebate of ₹60,000 for AY 2026-27 for taxable income up to ₹12 lakh
    if (newRegimeTaxableIncome <= 1200000) {
      newRegimeRebate = Math.min(newRegimeTotalTax, 60000);
    }
    
    const oldRegimeFinalTax = Math.max(0, oldRegimeTotalTax - oldRegimeRebate);
    const newRegimeFinalTax = Math.max(0, newRegimeTotalTax - newRegimeRebate);

    const taxDifference = Math.abs(oldRegimeFinalTax - newRegimeFinalTax);
    const betterRegime = oldRegimeFinalTax < newRegimeFinalTax ? 'old' : 'new';

    setComparisonResult({
      oldRegimeTax: oldRegimeFinalTax,
      newRegimeTax: newRegimeFinalTax,
      taxDifference,
      betterRegime,
      oldRegimeTakeHome: annualIncome - oldRegimeFinalTax,
      newRegimeTakeHome: annualIncome - newRegimeFinalTax
    });
  }, [comparisonParams, calculateTaxOnIncome]);

  // Auto-calculate when params change
  useEffect(() => {
    if (activeTab === 'salary-tax') {
      calculateSalaryTax();
    }
  }, [activeTab, calculateSalaryTax]);

  useEffect(() => {
    if (activeTab === 'business-tax') {
      calculateBusinessTax();
    }
  }, [activeTab, calculateBusinessTax]);

  useEffect(() => {
    if (activeTab === 'tax-comparison') {
      calculateTaxComparison();
    }
  }, [activeTab, calculateTaxComparison]);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Income Tax Calculator India FY 2025-26",
    "description": "Free online income tax calculator for India FY 2025-26. Calculate salary tax, business tax with both old and new tax regimes. Compare tax slabs and get detailed breakdown.",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "featureList": [
      "Salary Tax Calculator",
      "Business Income Tax Calculator", 
      "Old vs New Tax Regime Comparison",
      "Tax Slabs FY 2025-26",
      "Section 80C, 80D Deductions",
      "HRA Exemption Calculator"
    ]
  };

  const salaryShareLines = salaryTaxResult ? [
    `Gross salary: ${formatCurrency(salaryTaxResult.grossSalary)}`,
    `Taxable income: ${formatCurrency(salaryTaxResult.taxableIncome)}`,
    `Total tax: ${formatCurrency(salaryTaxResult.totalTax)}`,
    `Net salary after tax: ${formatCurrency(salaryTaxResult.netSalary)}`,
    `Regime: ${salaryTaxResult.regime}`
  ] : [];

  const businessShareLines = businessTaxResult ? [
    `Gross income: ${formatCurrency(businessTaxResult.grossIncome)}`,
    `Total expenses: ${formatCurrency(businessTaxResult.totalExpenses)}`,
    `Taxable profit: ${formatCurrency(businessTaxResult.taxableIncome)}`,
    `Total tax: ${formatCurrency(businessTaxResult.totalTax)}`,
    `Balance tax to pay: ${formatCurrency(businessTaxResult.balanceTax)}`
  ] : [];

  const comparisonShareLines = comparisonResult ? [
    `Old regime tax: ${formatCurrency(comparisonResult.oldRegimeTax)}`,
    `New regime tax: ${formatCurrency(comparisonResult.newRegimeTax)}`,
    `Tax difference: ${formatCurrency(comparisonResult.taxDifference)}`,
    `Better regime: ${comparisonResult.betterRegime === 'old' ? 'Old regime' : 'New regime'}`
  ] : [];

  return (
    <div className="calculator-container tax-container">
      <Head>
  <title>Income Tax Calculator India FY 2025-26 | Old vs New Regime | Upaman</title>
  <meta name="description" content="Income Tax Calculator India FY 2025-26. Compare old vs new regime, calculate salary & business tax with deductions (80C, 80D, HRA, home loan) and detailed slab breakdown." />
  <meta name="keywords" content="income tax calculator India FY 2025-26, old vs new regime, salary tax, business tax, tax slabs, 80C 80D HRA deductions" />
  <link rel="canonical" href="https://upaman.com/income-tax-calculator" />
  <meta property="og:title" content="Income Tax Calculator FY 2025-26 India | Upaman" />
  <meta property="og:description" content="Compare old vs new regime and compute tax with deductions & slab breakdown." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://upaman.com/income-tax-calculator" />
  <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
  <meta property="og:image:alt" content="Income Tax Calculator FY 2025-26" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Income Tax Calculator FY 2025-26 India | Upaman" />
  <meta name="twitter:description" content="Old vs new regime tax comparison with deductions & slab details." />
  <meta name="twitter:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(jsonLdData)
        }} />
      </Head>

      <div className="calculator-card">
        <div className="calculator-header tax-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <div className="header-title-container">
            <img 
              src="/upaman-elephant-logo.svg" 
              alt="Upaman Logo"
              className="header-logo"
            />
            <h1 className="header-title">
              Income Tax Calculator
            </h1>
          </div>
        </div>

        <div className="tax-operations">
          <h2 className="operations-title">Choose Tax Operation</h2>
          <div className="operation-buttons">
            <button
              className={`operation-button salary-tax-btn ${activeTab === 'salary-tax' ? 'active' : ''}`}
              onClick={() => setActiveTab('salary-tax')}
            >
              <div className="button-icon">
                <TrendingUp size={24} />
              </div>
              <div className="button-content">
                <h3>Salary Tax</h3>
                <p>Calculate income tax on salary with old/new regime comparison</p>
              </div>
              <div className="button-arrow">→</div>
            </button>
            
            <button
              className={`operation-button business-tax-btn ${activeTab === 'business-tax' ? 'active' : ''}`}
              onClick={() => setActiveTab('business-tax')}
            >
              <div className="button-icon">
                <Calculator size={24} />
              </div>
              <div className="button-content">
                <h3>Business Tax</h3>
                <p>Calculate tax on business income with expenses and deductions</p>
              </div>
              <div className="button-arrow">→</div>
            </button>
            
            <button
              className={`operation-button tax-comparison-btn ${activeTab === 'tax-comparison' ? 'active' : ''}`}
              onClick={() => setActiveTab('tax-comparison')}
            >
              <div className="button-icon">
                <Info size={24} />
              </div>
              <div className="button-content">
                <h3>Tax Comparison</h3>
                <p>Compare tax slabs, regimes and calculate tax differences</p>
              </div>
              <div className="button-arrow">→</div>
            </button>
          </div>
        </div>

        <div className="calculator-content">
          {/* Salary Tax Tab */}
          {activeTab === 'salary-tax' && (
            <div className="tab-content">
              <div className="input-section">
                <h3 className="section-title">
                  <TrendingUp size={24} />
                  Calculate Salary Tax
                </h3>
                
                <div className="input-group">
                  <label className="input-label">Annual Salary (₹)</label>
                  <input
                    type="number"
                    value={salaryParams.annualSalary}
                    onChange={(e) => setSalaryParams({ ...salaryParams, annualSalary: Number(e.target.value) })}
                    className="calculator-input"
                    placeholder="Enter annual salary"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Tax Regime</label>
                  <select
                    value={salaryParams.regime}
                    onChange={(e) => setSalaryParams({ ...salaryParams, regime: e.target.value })}
                    className="calculator-input"
                  >
                    <option value="new">New Tax Regime</option>
                    <option value="old">Old Tax Regime</option>
                  </select>
                </div>

                {salaryParams.regime === 'old' && (
                  <div className="deductions-section">
                    <h4 className="subsection-title">Deductions (Old Regime Only)</h4>
                    
                    <div className="input-row">
                      <div className="input-group">
                        <label className="input-label">HRA Received (₹)</label>
                        <input
                          type="number"
                          value={salaryParams.hra}
                          onChange={(e) => setSalaryParams({ ...salaryParams, hra: Number(e.target.value) })}
                          className="calculator-input"
                          placeholder="Enter HRA"
                        />
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">Rent Paid (₹)</label>
                        <input
                          type="number"
                          value={salaryParams.rentPaid}
                          onChange={(e) => setSalaryParams({ ...salaryParams, rentPaid: Number(e.target.value) })}
                          className="calculator-input"
                          placeholder="Enter rent"
                        />
                      </div>
                    </div>

                    <div className="input-row">
                      <div className="input-group">
                        <label className="input-label">Section 80C (₹)</label>
                        <input
                          type="number"
                          value={salaryParams.section80C}
                          onChange={(e) => setSalaryParams({ ...salaryParams, section80C: Number(e.target.value) })}
                          className="calculator-input"
                          placeholder="Max ₹1,50,000"
                          max="150000"
                        />
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">Section 80D (₹)</label>
                        <input
                          type="number"
                          value={salaryParams.section80D}
                          onChange={(e) => setSalaryParams({ ...salaryParams, section80D: Number(e.target.value) })}
                          className="calculator-input"
                          placeholder="Max ₹25,000"
                          max="25000"
                        />
                      </div>
                    </div>

                    <div className="input-row">
                      <div className="input-group">
                        <label className="input-label">NPS (80CCD 1B) (₹)</label>
                        <input
                          type="number"
                          value={salaryParams.nps}
                          onChange={(e) => setSalaryParams({ ...salaryParams, nps: Number(e.target.value) })}
                          className="calculator-input"
                          placeholder="Max ₹50,000"
                          max="50000"
                        />
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">Home Loan Interest (₹)</label>
                        <input
                          type="number"
                          value={salaryParams.homeLoanInterest}
                          onChange={(e) => setSalaryParams({ ...salaryParams, homeLoanInterest: Number(e.target.value) })}
                          className="calculator-input"
                          placeholder="Max ₹2,00,000"
                          max="200000"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {salaryTaxResult && (
                <div className="results-container">
                  <h3 className="results-title">Tax Calculation Result</h3>
                  
                  <div className="result-grid">
                    <div className="result-item">
                      <span className="result-label">Gross Salary</span>
                      <span className="result-value">{formatCurrency(salaryTaxResult.grossSalary)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total Deductions</span>
                      <span className="result-value">{formatCurrency(salaryTaxResult.totalDeductions)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Taxable Income</span>
                      <span className="result-value">{formatCurrency(salaryTaxResult.taxableIncome)}</span>
                    </div>
                    <div className="result-item total">
                      <span className="result-label">Total Tax</span>
                      <span className="result-value">{formatCurrency(salaryTaxResult.totalTax)}</span>
                    </div>
                    <div className="result-item highlight">
                      <span className="result-label">Net Salary (After Tax)</span>
                      <span className="result-value">{formatCurrency(salaryTaxResult.netSalary)}</span>
                    </div>
                  </div>

                  <div className="tax-breakdown">
                    <h4>Tax Breakdown</h4>
                    <div className="breakdown-grid">
                      <div className="breakdown-item">
                        <span>Income Tax</span>
                        <span>{formatCurrency(salaryTaxResult.incomeTax)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Health & Education Cess (4%)</span>
                        <span>{formatCurrency(salaryTaxResult.cess)}</span>
                      </div>
                      {salaryTaxResult.rebate > 0 && (
                        <div className="breakdown-item rebate">
                          <span>Rebate u/s 87A</span>
                          <span>-{formatCurrency(salaryTaxResult.rebate)}</span>
                        </div>
                      )}
                      <div className="breakdown-note">
                        <Info size={16} />
                        <span>Effective Tax Rate: {salaryTaxResult.effectiveRate.toFixed(2)}% ({salaryTaxResult.regime} regime)</span>
                      </div>
                    </div>
                  </div>

                  {/* Affiliate Recommendations */}
                  <AffiliateRecommendations 
                    calculatorType="tax" 
                    result={salaryTaxResult}
                    isDarkMode={false} 
                  />
                  <ResultActions
                    title="Income tax salary summary"
                    summaryLines={salaryShareLines}
                    fileName="upaman-income-tax-salary-summary.txt"
                  />
                </div>
              )}
            </div>
          )}

          {/* Business Tax Tab */}
          {activeTab === 'business-tax' && (
            <div className="tab-content">
              <div className="input-section">
                <h3 className="section-title">
                  <Calculator size={24} />
                  Calculate Business Tax
                </h3>
                
                <div className="input-group">
                  <label className="input-label">Gross Business Income (₹)</label>
                  <input
                    type="number"
                    value={businessParams.grossIncome}
                    onChange={(e) => setBusinessParams({ ...businessParams, grossIncome: Number(e.target.value) })}
                    className="calculator-input"
                    placeholder="Enter gross business income"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Business Expenses (₹)</label>
                  <input
                    type="number"
                    value={businessParams.businessExpenses}
                    onChange={(e) => setBusinessParams({ ...businessParams, businessExpenses: Number(e.target.value) })}
                    className="calculator-input"
                    placeholder="Enter business expenses"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Depreciation (₹)</label>
                  <input
                    type="number"
                    value={businessParams.depreciation}
                    onChange={(e) => setBusinessParams({ ...businessParams, depreciation: Number(e.target.value) })}
                    className="calculator-input"
                    placeholder="Enter depreciation amount"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Other Deductions (₹)</label>
                  <input
                    type="number"
                    value={businessParams.otherDeductions}
                    onChange={(e) => setBusinessParams({ ...businessParams, otherDeductions: Number(e.target.value) })}
                    className="calculator-input"
                    placeholder="Enter other deductions"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Advance Tax Paid (₹)</label>
                  <input
                    type="number"
                    value={businessParams.advanceTax}
                    onChange={(e) => setBusinessParams({ ...businessParams, advanceTax: Number(e.target.value) })}
                    className="calculator-input"
                    placeholder="Enter advance tax paid"
                  />
                </div>
              </div>

              {businessTaxResult && (
                <div className="results-container">
                  <h3 className="results-title">Business Tax Result</h3>
                  
                  <div className="result-grid">
                    <div className="result-item">
                      <span className="result-label">Gross Income</span>
                      <span className="result-value">{formatCurrency(businessTaxResult.grossIncome)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Total Expenses</span>
                      <span className="result-value">{formatCurrency(businessTaxResult.totalExpenses)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Net Profit</span>
                      <span className="result-value">{formatCurrency(businessTaxResult.netProfit)}</span>
                    </div>
                    <div className="result-item total">
                      <span className="result-label">Total Tax</span>
                      <span className="result-value">{formatCurrency(businessTaxResult.totalTax)}</span>
                    </div>
                    <div className="result-item highlight">
                      <span className="result-label">Balance Tax to Pay</span>
                      <span className="result-value">{formatCurrency(businessTaxResult.balanceTax)}</span>
                    </div>
                  </div>

                  <div className="tax-breakdown">
                    <h4>Tax Breakdown</h4>
                    <div className="breakdown-grid">
                      <div className="breakdown-item">
                        <span>Income Tax</span>
                        <span>{formatCurrency(businessTaxResult.incomeTax)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>Health & Education Cess (4%)</span>
                        <span>{formatCurrency(businessTaxResult.cess)}</span>
                      </div>
                      <div className="breakdown-item rebate">
                        <span>Advance Tax Paid</span>
                        <span>-{formatCurrency(businessTaxResult.advanceTax)}</span>
                      </div>
                      <div className="breakdown-note">
                        <Info size={16} />
                        <span>Effective Tax Rate: {businessTaxResult.effectiveRate.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                  <ResultActions
                    title="Income tax business summary"
                    summaryLines={businessShareLines}
                    fileName="upaman-income-tax-business-summary.txt"
                  />
                </div>
              )}
            </div>
          )}

          {/* Tax Comparison Tab */}
          {activeTab === 'tax-comparison' && (
            <div className="tab-content">
              <div className="tax-comparison-container">
                <h3 className="section-title">
                  <Info size={24} />
                  Tax Comparison & Slabs for FY 2025-26
                </h3>
                
                {/* Quick Comparison Calculator */}
                <div className="comparison-calculator">
                  <h4 className="subsection-title">Quick Tax Comparison</h4>
                  <div className="input-row">
                    <div className="input-group">
                      <label className="input-label">Annual Income (₹)</label>
                      <input
                        type="number"
                        value={comparisonParams.annualIncome}
                        onChange={(e) => setComparisonParams({ ...comparisonParams, annualIncome: Number(e.target.value) })}
                        className="calculator-input"
                        placeholder="Enter annual income"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Total Deductions (₹)</label>
                      <input
                        type="number"
                        value={comparisonParams.deductions}
                        onChange={(e) => setComparisonParams({ ...comparisonParams, deductions: Number(e.target.value) })}
                        className="calculator-input"
                        placeholder="Enter total deductions"
                      />
                    </div>
                  </div>
                  
                  {/* Comparison Results */}
                  {comparisonResult && (
                    <div className="comparison-results">
                      <div className="comparison-cards">
                        <div className="comparison-card old-regime-card">
                          <h5>Old Tax Regime</h5>
                          <div className="tax-amount">
                            ₹{comparisonResult.oldRegimeTax.toLocaleString('en-IN')}
                          </div>
                          <div className="take-home">
                            Take Home: ₹{comparisonResult.oldRegimeTakeHome.toLocaleString('en-IN')}
                          </div>
                        </div>
                        
                        <div className="comparison-card new-regime-card">
                          <h5>New Tax Regime</h5>
                          <div className="tax-amount">
                            ₹{comparisonResult.newRegimeTax.toLocaleString('en-IN')}
                          </div>
                          <div className="take-home">
                            Take Home: ₹{comparisonResult.newRegimeTakeHome.toLocaleString('en-IN')}
                          </div>
                        </div>
                        
                        <div className="comparison-card savings-card">
                          <h5>Tax Difference</h5>
                          <div className="tax-amount">
                            ₹{comparisonResult.taxDifference.toLocaleString('en-IN')}
                          </div>
                          <div className="take-home">
                            {comparisonResult.betterRegime === 'old' ? 'Old Regime Better' : 'New Regime Better'}
                          </div>
                        </div>
                      </div>
                      <ResultActions
                        title="Income tax regime comparison summary"
                        summaryLines={comparisonShareLines}
                        fileName="upaman-income-tax-comparison-summary.txt"
                      />
                    </div>
                  )}
                </div>
                
                {/* Tax Slabs Information */}
                <div className="slabs-comparison">
                  <h4 className="subsection-title">Tax Slabs Comparison</h4>
                  
                  <div className="slab-section new-regime">
                    <h5 className="slab-title">New Tax Regime (AY 2026-27)</h5>
                    <div className="slab-table">
                      <div className="slab-header">
                        <span>Income Range</span>
                        <span>Tax Rate</span>
                      </div>
                      {taxSlabs.new.map((slab, index) => (
                        <div key={index} className="slab-row">
                          <span className="slab-range">
                            ₹{(slab.min/100000).toFixed(0)}L - {slab.max === Infinity ? '∞' : `₹${(slab.max/100000).toFixed(0)}L`}
                          </span>
                          <span className="slab-rate">{slab.rate}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="regime-highlights">
                      <span className="highlight-item">📋 Std. Deduction: ₹75K</span>
                      <span className="highlight-item">🎯 Tax-free up to ₹12L</span>
                      <span className="highlight-item">⚡ Simplified filing</span>
                    </div>
                  </div>

                  <div className="slab-section old-regime">
                    <h5 className="slab-title">Old Tax Regime (AY 2026-27)</h5>
                    <div className="slab-table">
                      <div className="slab-header">
                        <span>Income Range</span>
                        <span>Tax Rate</span>
                      </div>
                      {taxSlabs.old.map((slab, index) => (
                        <div key={index} className="slab-row">
                          <span className="slab-range">
                            ₹{(slab.min/100000).toFixed(0)}L - {slab.max === Infinity ? '∞' : `₹${(slab.max/100000).toFixed(0)}L`}
                          </span>
                          <span className="slab-rate">{slab.rate}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="regime-highlights">
                      <span className="highlight-item">📋 Std. Deduction: ₹50K</span>
                      <span className="highlight-item">💰 80C: ₹1.5L</span>
                      <span className="highlight-item">🏠 HRA & Home Loan</span>
                      <span className="highlight-item">💊 80D: ₹25K</span>
                    </div>
                  </div>
                </div>
                
                {/* Regime Selection Guide */}
                <div className="regime-guide">
                  <h4 className="subsection-title">Which Regime Should You Choose?</h4>
                  <div className="guide-cards">
                    <div className="guide-card">
                      <h6>Choose Old Regime If:</h6>
                      <ul>
                        <li>• You have significant investments (80C, 80D)</li>
                        <li>• You pay house rent (HRA exemption)</li>
                        <li>• You have home loan interest payments</li>
                        <li>• Your total deductions exceed ₹50,000</li>
                      </ul>
                    </div>
                    <div className="guide-card">
                      <h6>Choose New Regime If:</h6>
                      <ul>
                        <li>• You have minimal or no deductions</li>
                        <li>• Your income is below ₹15 lakh</li>
                        <li>• You prefer simplicity in tax calculation</li>
                        <li>• You don't invest much in tax-saving instruments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="calculator-content" style={{ paddingTop: 0 }}>
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Annual income (salary or business), selected regime, and applicable deductions',
              'Old regime deductions include 80C/80D/NPS/HRA/home-loan fields when provided'
            ]}
            formulas={[
              'Slab-wise marginal tax computation by regime',
              'Health and education cess applied after base tax',
              'Section 87A rebate logic applied where eligible'
            ]}
            assumptions={[
              'Rates and slab structures are modeled for FY 2025-26 / AY 2026-27 configuration in this app',
              'Surcharge, special incomes, and complex exemptions are not fully modeled',
              'Use results for planning; file taxes using official utilities or a qualified advisor'
            ]}
            sources={[
              { label: 'Income Tax Department (India)', url: 'https://www.incometax.gov.in/' },
              { label: 'CBDT notifications and circulars', url: 'https://incometaxindia.gov.in/' }
            ]}
            guideLinks={[
              { label: 'Old vs new regime guide', href: '/guide-income-tax-regime-choice.html' },
              { label: 'CTC to in-hand breakdown guide', href: '/guide-ctc-inhand-breakdown.html' }
            ]}
          />
        </div>

        {/* Footer Disclaimer */}
        <div className="calculator-footer">
          <div className="disclaimer-section">
            <h4>📋 Important Disclaimer</h4>
            <div className="disclaimer-content">
              <p>
                <strong>Information Purpose Only:</strong> This Income Tax calculator is provided for informational and educational purposes only. 
                The calculations are based on current tax slabs and rates as per Indian Income Tax laws for FY 2025-26.
              </p>
              <p>
                <strong>Not Financial Advice:</strong> The results should not be considered as professional tax advice or official tax calculations. 
                Tax laws are complex and individual circumstances vary. Please consult a qualified CA or tax professional for personalized advice.
              </p>
              <p>
                <strong>Accuracy Notice:</strong> While we strive for accuracy, tax rates, slabs, and rules may change during the financial year. 
                Always verify current tax rates and regulations from official Income Tax Department sources before making financial decisions.
              </p>
              <p>
                <strong>No Liability:</strong> We disclaim any liability for financial decisions made based on these calculations. 
                Users are responsible for verifying the accuracy of inputs, understanding their tax obligations, and filing returns correctly.
              </p>
            </div>
            <div className="disclaimer-footer">
              <p>💡 <em>For official tax information, visit: </em><strong>incometax.gov.in</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeTaxCalculator;
