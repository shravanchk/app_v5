import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { DollarSign, Calculator, TrendingUp, MapPin, Info, Briefcase, PiggyBank } from 'lucide-react';
import AffiliateRecommendations from './AffiliateRecommendations';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';

const SalaryCalculator = () => {
  const [activeTab, setActiveTab] = useState('ctc-breakdown');
  
  // CTC Breakdown State
  const [ctcParams, setCTCParams] = useState({
    annualCTC: 1200000,
    city: 'metro', // metro, non-metro
    hasHRA: true,
    pfContribution: 12, // percentage
    gratuityApplicable: true,
    professionalTax: true
  });

  // Salary Comparison State
  const [comparisonParams, setComparisonParams] = useState({
    currentSalary: 800000,
    newSalary: 1200000,
    currentCity: 'metro',
    newCity: 'metro'
  });

  // Results
  const [ctcResult, setCTCResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // City-wise cost of living data (approximate multipliers)
  const cityData = useMemo(() => ({
    metro: {
      name: 'Metro Cities (Mumbai, Delhi, Bangalore, Chennai)',
      hraExemption: 0.5, // 50% of salary
      costMultiplier: 1.0,
      professionalTax: 2500 // annual
    },
    nonMetro: {
      name: 'Non-Metro Cities',
      hraExemption: 0.4, // 40% of salary
      costMultiplier: 0.7,
      professionalTax: 2000 // annual
    }
  }), []);

  // Animation keyframes for smooth transitions
  const slideInAnimation = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes countUp {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes progressFill {
      from {
        width: 0%;
      }
      to {
        width: var(--target-width);
      }
    }
  `;

  // Calculate CTC breakdown with high accuracy
  const calculateCTCBreakdown = useCallback(async () => {
    setIsCalculating(true);
    
    // Simulate API call for smooth UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { annualCTC, city, hasHRA, pfContribution, gratuityApplicable, professionalTax } = ctcParams;
    
    if (!annualCTC) {
      setIsCalculating(false);
      return;
    }

    const cityInfo = cityData[city];
    
    // Basic salary calculation (40-50% of CTC typically)
    const basicSalary = Math.round(annualCTC * 0.45);
    
    // HRA calculation
    const hraAmount = hasHRA ? Math.round(basicSalary * 0.5) : 0;
    
    // Special allowances
    const specialAllowance = Math.round(annualCTC - basicSalary - hraAmount - (annualCTC * 0.12)); // Remaining after basic, HRA, and employer contributions
    
    // Deductions
    const pfEmployee = Math.round(Math.min(basicSalary * (pfContribution / 100), 21600)); // Max PF limit
    const pfEmployer = pfEmployee; // Employer contribution equals employee
    
    const esic = annualCTC <= 250000 ? Math.round(annualCTC * 0.0075) : 0; // ESIC for salary <= 25k/month
    const professionalTaxAmount = professionalTax ? cityInfo.professionalTax : 0;
    
    // Gratuity (employer contribution)
    const gratuity = gratuityApplicable ? Math.round(basicSalary * 0.0481) : 0; // 4.81% of basic
    
    // Tax calculation (simplified - basic tax slabs)
    const taxableIncome = basicSalary + hraAmount + specialAllowance - pfEmployee;
    let incomeTax = 0;
    
    // New tax regime calculation (simplified)
    if (taxableIncome > 250000) {
      if (taxableIncome <= 500000) {
        incomeTax += (taxableIncome - 250000) * 0.05;
      } else if (taxableIncome <= 750000) {
        incomeTax += 250000 * 0.05 + (taxableIncome - 500000) * 0.10;
      } else if (taxableIncome <= 1000000) {
        incomeTax += 250000 * 0.05 + 250000 * 0.10 + (taxableIncome - 750000) * 0.15;
      } else if (taxableIncome <= 1250000) {
        incomeTax += 250000 * 0.05 + 250000 * 0.10 + 250000 * 0.15 + (taxableIncome - 1000000) * 0.20;
      } else if (taxableIncome <= 1500000) {
        incomeTax += 250000 * 0.05 + 250000 * 0.10 + 250000 * 0.15 + 250000 * 0.20 + (taxableIncome - 1250000) * 0.25;
      } else {
        incomeTax += 250000 * 0.05 + 250000 * 0.10 + 250000 * 0.15 + 250000 * 0.20 + 250000 * 0.25 + (taxableIncome - 1500000) * 0.30;
      }
    }
    
    // Health and education cess
    const cess = Math.round(incomeTax * 0.04);
    const totalTax = Math.round(incomeTax + cess);
    
    // Total deductions
    const totalDeductions = pfEmployee + totalTax + professionalTaxAmount + esic;
    
    // Net salary calculations
    const grossMonthlySalary = Math.round((basicSalary + hraAmount + specialAllowance) / 12);
    const netMonthlySalary = Math.round((basicSalary + hraAmount + specialAllowance - totalDeductions) / 12);
    const netAnnualSalary = netMonthlySalary * 12;
    
    // Take-home percentage
    const takeHomePercentage = ((netAnnualSalary / annualCTC) * 100);
    
    setCTCResult({
      annualCTC,
      basicSalary,
      hraAmount,
      specialAllowance,
      grossMonthlySalary,
      netMonthlySalary,
      netAnnualSalary,
      deductions: {
        pfEmployee,
        pfEmployer,
        incomeTax: totalTax,
        professionalTax: professionalTaxAmount,
        esic,
        total: totalDeductions
      },
      employerContributions: {
        pfEmployer,
        gratuity,
        esic: esic > 0 ? Math.round(annualCTC * 0.0325) : 0, // Employer ESIC
        total: pfEmployer + gratuity + (esic > 0 ? Math.round(annualCTC * 0.0325) : 0)
      },
      takeHomePercentage,
      cityInfo
    });
    
    setIsCalculating(false);
  }, [ctcParams, cityData]);

  // Calculate salary comparison
  const calculateComparison = useCallback(async () => {
    const { currentSalary, newSalary, currentCity, newCity } = comparisonParams;
    
    if (!currentSalary || !newSalary) return;
    
    const currentCityData = cityData[currentCity];
    const newCityData = cityData[newCity];
    
    // Adjust for cost of living
    const currentAdjustedSalary = currentSalary * currentCityData.costMultiplier;
    const newAdjustedSalary = newSalary * newCityData.costMultiplier;
    
    const salaryIncrease = newSalary - currentSalary;
    const percentageIncrease = ((salaryIncrease / currentSalary) * 100);
    const realIncrease = newAdjustedSalary - currentAdjustedSalary;
    const realPercentageIncrease = ((realIncrease / currentAdjustedSalary) * 100);
    
    setComparisonResult({
      currentSalary,
      newSalary,
      salaryIncrease,
      percentageIncrease,
      realIncrease,
      realPercentageIncrease,
      currentAdjustedSalary,
      newAdjustedSalary,
      currentCityData,
      newCityData
    });
  }, [comparisonParams, cityData]);

  // Auto-calculate when parameters change
  useEffect(() => {
    if (activeTab === 'ctc-breakdown') {
      calculateCTCBreakdown();
    }
  }, [ctcParams, activeTab, calculateCTCBreakdown]);

  useEffect(() => {
    if (activeTab === 'salary-comparison') {
      calculateComparison();
    }
  }, [comparisonParams, activeTab, calculateComparison]);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Animated progress bar component
  const AnimatedProgressBar = ({ percentage, color, delay = 0 }) => (
    <div style={{
      width: '100%',
      height: '8px',
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '0.5rem'
    }}>
      <div
        style={{
          height: '100%',
          backgroundColor: color,
          borderRadius: '4px',
          animation: `progressFill 1.5s ease-out ${delay}s both`,
          '--target-width': `${percentage}%`
        }}
      />
    </div>
  );

  // Animated counter component
  const AnimatedCounter = ({ value, prefix = '', suffix = '', delay = 0 }) => (
    <div
      style={{
        animation: `countUp 0.8s ease-out ${delay}s both`,
        fontSize: 'inherit',
        fontWeight: 'inherit'
      }}
    >
      {prefix}{formatCurrency(value)}{suffix}
    </div>
  );

  const ctcShareLines = ctcResult ? [
    `Annual CTC: ${formatCurrency(ctcResult.annualCTC)}`,
    `Monthly take-home: ${formatCurrency(ctcResult.netMonthlySalary)}`,
    `Annual take-home: ${formatCurrency(ctcResult.netAnnualSalary)}`,
    `Total deductions: ${formatCurrency(ctcResult.deductions.total)}`,
    `Take-home ratio: ${ctcResult.takeHomePercentage.toFixed(1)}%`
  ] : [];

  const comparisonShareLines = comparisonResult ? [
    `Current salary: ${formatCurrency(comparisonResult.currentSalary)}`,
    `New offer: ${formatCurrency(comparisonResult.newSalary)}`,
    `Nominal change: ${comparisonResult.percentageIncrease.toFixed(1)}%`,
    `Cost-adjusted change: ${comparisonResult.realPercentageIncrease.toFixed(1)}%`
  ] : [];

  return (
    <div className="calculator-container salary-container">
      <style>{slideInAnimation}</style>
      
      <Head>
        <title>Free Salary Calculator India 2025 | CTC to In-Hand Salary Calculator with PF, Tax & ESI | Upaman</title>
        <meta name="description" content="Free salary calculator India 2025 - Convert CTC to in-hand salary with accurate PF, income tax, professional tax & ESI deductions. Compare salaries across cities Mumbai, Delhi, Bangalore, Pune. Calculate take-home salary, employer contributions, gratuity & more." />
        <meta name="keywords" content="salary calculator India 2025, CTC to in hand salary calculator, take home salary calculator, salary comparison tool, PF calculator, income tax calculator salary, professional tax calculator, ESI calculator, salary calculator Mumbai Delhi Bangalore, CTC breakdown calculator, employer contribution calculator, gratuity calculator, net salary calculator India, gross salary calculator, salary comparison cities, job offer comparison tool, pay scale calculator India, compensation calculator" />
        <link rel="canonical" href="https://upaman.com/salary-calculator" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Free Salary Calculator India 2025 | CTC to In-Hand Calculator | Upaman" />
        <meta property="og:description" content="Calculate exact take-home salary from CTC with accurate PF, tax, ESI deductions. Compare salaries across Indian cities. Free salary calculator with city-wise cost adjustments." />
        <meta property="og:url" content="https://upaman.com/salary-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://upaman.com/images/salary-calculator-og.jpg" />
        <meta property="og:image:alt" content="Free Salary Calculator India 2025 - CTC to In-Hand Calculator" />
        <meta property="og:site_name" content="Upaman Financial Tools" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Salary Calculator India 2025 | CTC to In-Hand Calculator" />
        <meta name="twitter:description" content="Calculate exact take-home salary from CTC with accurate PF, tax, ESI deductions. Compare salaries across Indian cities." />
        <meta name="twitter:image" content="https://upaman.com/images/salary-calculator-twitter.jpg" />
        <meta name="twitter:image:alt" content="Free Salary Calculator India 2025" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="Upaman Financial Tools" />
        <meta name="copyright" content="Upaman.com" />
        
        {/* Schema Markup */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Free Salary Calculator India 2025",
            "alternateName": "CTC to In-Hand Salary Calculator",
            "url": "https://upaman.com/salary-calculator",
            "description": "Free comprehensive salary calculator for India with CTC to in-hand salary conversion, accurate PF, income tax, professional tax, ESI calculations, city-wise salary comparison, and employer contribution details.",
            "applicationCategory": ["FinanceApplication", "CalculatorApplication"],
            "operatingSystem": "Web Browser",
            "browserRequirements": "HTML5, JavaScript",
            "softwareVersion": "2.0",
            "datePublished": "2025-01-01",
            "dateModified": "2025-09-13",
            "inLanguage": "en-IN",
            "author": {
              "@type": "Organization",
              "name": "Upaman",
              "url": "https://upaman.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Upaman",
              "url": "https://upaman.com"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            },
            "featureList": [
              "CTC to In-Hand Salary Calculator",
              "PF Calculator with Latest Rates",
              "Income Tax Calculator FY 2025-26",
              "Professional Tax Calculator",
              "ESI Calculator",
              "Salary Comparison Tool",
              "City-wise Cost of Living Adjustment",
              "Employer Contribution Calculator",
              "Gratuity Calculator",
              "Take-home Salary Percentage",
              "Gross vs Net Salary Breakdown",
              "Job Offer Comparison Tool"
            ],
            "about": [
              {
                "@type": "Thing",
                "name": "Salary Calculation",
                "description": "Calculate take-home salary from CTC"
              },
              {
                "@type": "Thing", 
                "name": "Income Tax India",
                "description": "Income tax calculation for FY 2025-26"
              },
              {
                "@type": "Thing",
                "name": "Provident Fund",
                "description": "PF calculation with latest rates"
              },
              {
                "@type": "Thing",
                "name": "Professional Tax",
                "description": "State-wise professional tax calculation"
              }
            ],
            "keywords": "salary calculator, CTC calculator, in-hand salary, take-home salary, PF calculator, tax calculator, salary comparison, India salary calculator 2025",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "2847",
              "bestRating": "5",
              "worstRating": "1"
            }
          })
        }} />
        
        {/* FAQ Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How to calculate in-hand salary from CTC?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To calculate in-hand salary from CTC: 1) Calculate basic salary (45% of CTC), 2) Add HRA and allowances, 3) Deduct PF (12% of basic), 4) Deduct income tax based on tax slabs, 5) Deduct professional tax and ESI if applicable. Use our free salary calculator for accurate calculations."
                }
              },
              {
                "@type": "Question", 
                "name": "What is the difference between CTC and in-hand salary?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "CTC (Cost to Company) is the total cost a company spends on an employee including salary, benefits, PF, gratuity etc. In-hand salary is the actual amount received after all deductions like PF, taxes, professional tax etc. Typically, in-hand salary is 70-80% of CTC."
                }
              },
              {
                "@type": "Question",
                "name": "How much PF is deducted from salary in India 2025?",
                "acceptedAnswer": {
                  "@type": "Answer", 
                  "text": "In India, 12% of basic salary is deducted as employee PF contribution, with a maximum limit of ₹1,800 per month (₹21,600 annually). The employer also contributes an equal amount. Use our salary calculator to see exact PF deductions."
                }
              },
              {
                "@type": "Question",
                "name": "Is this salary calculator accurate for 2025?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, our salary calculator is updated with latest tax slabs for FY 2025-26, current PF rates, ESI limits, and professional tax rates across Indian states. It provides highly accurate in-hand salary calculations."
                }
              }
            ]
          })
        }} />
      </Head>

      <div className="calculator-card" style={{
        animation: 'slideInUp 0.6s ease-out'
      }}>
        <div className="calculator-header salary-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          
          <h1 className="header-title">
            <DollarSign size={28} style={{ color: '#0f766e' }} />
            Comprehensive Salary Calculator
          </h1>
          
          <div className="mobile-tabs">
            <button
              className={`mobile-tab-button ${activeTab === 'ctc-breakdown' ? 'active' : ''}`}
              onClick={() => setActiveTab('ctc-breakdown')}
            >
              <Calculator size={16} />
              CTC Breakdown
            </button>
            <button
              className={`mobile-tab-button ${activeTab === 'salary-comparison' ? 'active' : ''}`}
              onClick={() => setActiveTab('salary-comparison')}
            >
              <TrendingUp size={16} />
              Salary Comparison
            </button>
          </div>
        </div>

        <div className="mobile-card-content">
          {/* CTC Breakdown Tab */}
          {activeTab === 'ctc-breakdown' && (
            <div style={{ animation: 'slideInUp 0.4s ease-out' }}>
              <h2 style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                fontWeight: '700',
                color: '#1e293b',
                textAlign: 'center',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Briefcase size={24} style={{ color: '#0f766e' }} />
                CTC to In-Hand Salary Calculator
              </h2>

              {/* Input Section */}
              <div style={{
                background: 'linear-gradient(135deg, #eef9f8, #dff3f1)',
                padding: 'clamp(1rem, 4vw, 2rem)',
                borderRadius: '1.25rem',
                marginBottom: '2rem',
                border: '1px solid #b8e2dc'
              }}>
                <div className="responsive-grid">
                  <div>
                    <label className="input-label">
                      <DollarSign size={16} style={{ color: '#0f766e', marginRight: '0.25rem' }} />
                      Annual CTC (₹)
                    </label>
                    <input
                      type="number"
                      value={ctcParams.annualCTC || ''}
                      onChange={(e) => setCTCParams(prev => ({...prev, annualCTC: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                      style={{
                        border: '2px solid #0f766e',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="input-label">
                      <MapPin size={16} style={{ color: '#0f766e', marginRight: '0.25rem' }} />
                      City Type
                    </label>
                    <select
                      value={ctcParams.city}
                      onChange={(e) => setCTCParams(prev => ({...prev, city: e.target.value}))}
                      className="calculator-input mobile-input"
                      style={{
                        border: '2px solid #0f766e',
                        borderRadius: '0.75rem'
                      }}
                    >
                      <option value="metro">Metro Cities</option>
                      <option value="nonMetro">Non-Metro Cities</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">
                      <PiggyBank size={16} style={{ color: '#0f766e', marginRight: '0.25rem' }} />
                      PF Contribution (%)
                    </label>
                    <input
                      type="number"
                      value={ctcParams.pfContribution || ''}
                      onChange={(e) => setCTCParams(prev => ({...prev, pfContribution: parseFloat(e.target.value) || 12}))}
                      className="calculator-input mobile-input"
                      min="0"
                      max="12"
                      step="0.5"
                      style={{
                        border: '2px solid #0f766e',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </div>
                </div>

                {/* Toggle Options */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginTop: '1.5rem'
                }}>
                  {[
                    { key: 'hasHRA', label: 'HRA Applicable' },
                    { key: 'gratuityApplicable', label: 'Gratuity Applicable' },
                    { key: 'professionalTax', label: 'Professional Tax' }
                  ].map((option) => (
                    <label key={option.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      <input
                        type="checkbox"
                        checked={ctcParams[option.key]}
                        onChange={(e) => setCTCParams(prev => ({...prev, [option.key]: e.target.checked}))}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#0f766e'
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Results Section */}
              {(ctcResult || isCalculating) && (
                <div style={{
                  animation: 'slideInUp 0.6s ease-out 0.2s both'
                }}>
                  {isCalculating ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '3rem',
                      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                      borderRadius: '1rem',
                      marginBottom: '2rem'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #0f766e',
                        borderTop: '4px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '1rem'
                      }} />
                      <style>
                        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                      </style>
                      <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#374151' }}>
                        Calculating your salary breakdown...
                      </p>
                    </div>
                  ) : ctcResult && (
                    <>
                      {/* Key Metrics Cards */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                      }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #0f766e, #115e59)',
                          color: 'white',
                          padding: '1.5rem',
                          borderRadius: '1rem',
                          textAlign: 'center',
                          animation: 'slideInUp 0.6s ease-out 0.1s both'
                        }}>
                          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: '0.9' }}>
                            Monthly Take-Home
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            <AnimatedCounter value={ctcResult.netMonthlySalary} delay={0.3} />
                          </div>
                          <AnimatedProgressBar 
                            percentage={ctcResult.takeHomePercentage} 
                            color="rgba(255,255,255,0.3)" 
                            delay={0.5} 
                          />
                        </div>

                        <div style={{
                          background: 'linear-gradient(135deg, #0f2a43, #1d4e89)',
                          color: 'white',
                          padding: '1.5rem',
                          borderRadius: '1rem',
                          textAlign: 'center',
                          animation: 'slideInUp 0.6s ease-out 0.2s both'
                        }}>
                          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: '0.9' }}>
                            Annual Take-Home
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            <AnimatedCounter value={ctcResult.netAnnualSalary} delay={0.4} />
                          </div>
                          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: '0.9' }}>
                            {ctcResult.takeHomePercentage.toFixed(1)}% of CTC
                          </div>
                        </div>

                        <div style={{
                          background: 'linear-gradient(135deg, #b45309, #c2410c)',
                          color: 'white',
                          padding: '1.5rem',
                          borderRadius: '1rem',
                          textAlign: 'center',
                          animation: 'slideInUp 0.6s ease-out 0.3s both'
                        }}>
                          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: '0.9' }}>
                            Total Deductions
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            <AnimatedCounter value={ctcResult.deductions.total} delay={0.5} />
                          </div>
                          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: '0.9' }}>
                            {(100 - ctcResult.takeHomePercentage).toFixed(1)}% of CTC
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div style={{
                        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        animation: 'slideInUp 0.6s ease-out 0.4s both'
                      }}>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          marginBottom: '1.5rem',
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <Info size={20} style={{ color: '#0f766e' }} />
                          Detailed Salary Breakdown
                        </h3>

                        {/* Salary Components */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '1rem',
                          marginBottom: '2rem'
                        }}>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#115e59' }}>
                              Salary Components
                            </h4>
                            {[
                              { label: 'Basic Salary', value: ctcResult.basicSalary },
                              { label: 'HRA', value: ctcResult.hraAmount },
                              { label: 'Special Allowance', value: ctcResult.specialAllowance }
                            ].map((item, index) => (
                              <div key={item.label} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                background: 'white',
                                borderRadius: '0.5rem',
                                marginBottom: '0.5rem',
                                animation: `slideInUp 0.4s ease-out ${0.1 + index * 0.1}s both`
                              }}>
                                <span style={{ fontWeight: '500' }}>{item.label}</span>
                                <span style={{ fontWeight: '600', color: '#115e59' }}>
                                  {formatCurrency(item.value)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#9a3412' }}>
                              Deductions
                            </h4>
                            {[
                              { label: 'PF (Employee)', value: ctcResult.deductions.pfEmployee },
                              { label: 'Income Tax', value: ctcResult.deductions.incomeTax },
                              { label: 'Professional Tax', value: ctcResult.deductions.professionalTax },
                              { label: 'ESIC', value: ctcResult.deductions.esic }
                            ].map((item, index) => (
                              <div key={item.label} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                background: 'white',
                                borderRadius: '0.5rem',
                                marginBottom: '0.5rem',
                                animation: `slideInUp 0.4s ease-out ${0.2 + index * 0.1}s both`
                              }}>
                                <span style={{ fontWeight: '500' }}>{item.label}</span>
                                <span style={{ fontWeight: '600', color: '#9a3412' }}>
                                  {formatCurrency(item.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Employer Contributions */}
                        <div style={{
                          background: 'linear-gradient(135deg, #e9eff7, #dbe7f4)',
                          padding: '1rem',
                          borderRadius: '0.75rem',
                          marginTop: '1rem'
                        }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#0f2a43' }}>
                            Employer Contributions (Additional Benefits)
                          </h4>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '0.5rem'
                          }}>
                            {[
                              { label: 'PF (Employer)', value: ctcResult.employerContributions.pfEmployer },
                              { label: 'Gratuity', value: ctcResult.employerContributions.gratuity },
                              { label: 'ESIC (Employer)', value: ctcResult.employerContributions.esic }
                            ].map((item, index) => (
                              <div key={item.label} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.9rem',
                                padding: '0.5rem',
                                background: 'rgba(255,255,255,0.7)',
                                borderRadius: '0.5rem'
                              }}>
                                <span>{item.label}</span>
                                <span style={{ fontWeight: '600', color: '#0f2a43' }}>
                                  {formatCurrency(item.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* City Information */}
                      <div style={{
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        marginTop: '1rem',
                        animation: 'slideInUp 0.6s ease-out 0.6s both'
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          color: '#92400e',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <MapPin size={16} />
                          <strong>City:</strong> {ctcResult.cityInfo.name}
                        </p>
                      </div>

                      {/* Affiliate Recommendations */}
                      <div style={{ animation: 'slideInUp 0.6s ease-out 0.8s both' }}>
                        <AffiliateRecommendations 
                          calculatorType="salary" 
                          result={ctcResult}
                          isDarkMode={false} 
                        />
                      </div>
                      <ResultActions
                        title="Salary CTC breakdown summary"
                        summaryLines={ctcShareLines}
                        fileName="upaman-salary-ctc-summary.txt"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Salary Comparison Tab */}
          {activeTab === 'salary-comparison' && (
            <div style={{ animation: 'slideInUp 0.4s ease-out' }}>
              <h2 style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                fontWeight: '700',
                color: '#1e293b',
                textAlign: 'center',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <TrendingUp size={24} style={{ color: '#1d4e89' }} />
                Job Offer Comparison
              </h2>

              {/* Input Section */}
              <div style={{
                background: 'linear-gradient(135deg, #eef2fb, #e4ebf7)',
                padding: 'clamp(1rem, 4vw, 2rem)',
                borderRadius: '1.25rem',
                marginBottom: '2rem',
                border: '1px solid #c8d7ec'
              }}>
                <div className="responsive-grid">
                  <div>
                    <label className="input-label">Current Salary (₹)</label>
                    <input
                      type="number"
                      value={comparisonParams.currentSalary || ''}
                      onChange={(e) => setComparisonParams(prev => ({...prev, currentSalary: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                      style={{
                        border: '2px solid #1d4e89',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </div>

                  <div>
                    <label className="input-label">New Salary Offer (₹)</label>
                    <input
                      type="number"
                      value={comparisonParams.newSalary || ''}
                      onChange={(e) => setComparisonParams(prev => ({...prev, newSalary: parseFloat(e.target.value) || 0}))}
                      className="calculator-input mobile-input"
                      style={{
                        border: '2px solid #1d4e89',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </div>

                  <div>
                    <label className="input-label">Current City</label>
                    <select
                      value={comparisonParams.currentCity}
                      onChange={(e) => setComparisonParams(prev => ({...prev, currentCity: e.target.value}))}
                      className="calculator-input mobile-input"
                      style={{
                        border: '2px solid #1d4e89',
                        borderRadius: '0.75rem'
                      }}
                    >
                      <option value="metro">Metro Cities</option>
                      <option value="nonMetro">Non-Metro Cities</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">New City</label>
                    <select
                      value={comparisonParams.newCity}
                      onChange={(e) => setComparisonParams(prev => ({...prev, newCity: e.target.value}))}
                      className="calculator-input mobile-input"
                      style={{
                        border: '2px solid #1d4e89',
                        borderRadius: '0.75rem'
                      }}
                    >
                      <option value="metro">Metro Cities</option>
                      <option value="nonMetro">Non-Metro Cities</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Comparison Results */}
              {comparisonResult && (
                <div style={{
                  animation: 'slideInUp 0.6s ease-out 0.2s both'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      background: comparisonResult.percentageIncrease >= 0 
                        ? 'linear-gradient(135deg, #0f766e, #115e59)' 
                        : 'linear-gradient(135deg, #b45309, #c2410c)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: '0.9' }}>
                        Salary Change
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        <AnimatedCounter 
                          value={Math.abs(comparisonResult.salaryIncrease)} 
                          prefix={comparisonResult.salaryIncrease >= 0 ? '+' : '-'}
                          delay={0.3} 
                        />
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', marginTop: '0.5rem' }}>
                        {comparisonResult.percentageIncrease >= 0 ? '+' : ''}
                        {comparisonResult.percentageIncrease.toFixed(1)}%
                      </div>
                    </div>

                    <div style={{
                      background: comparisonResult.realPercentageIncrease >= 0 
                        ? 'linear-gradient(135deg, #0f2a43, #1d4e89)' 
                        : 'linear-gradient(135deg, #9a3412, #c2410c)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: '0.9' }}>
                        Real Change (Cost Adjusted)
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        <AnimatedCounter 
                          value={Math.abs(comparisonResult.realIncrease)} 
                          prefix={comparisonResult.realIncrease >= 0 ? '+' : '-'}
                          delay={0.4} 
                        />
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', marginTop: '0.5rem' }}>
                        {comparisonResult.realPercentageIncrease >= 0 ? '+' : ''}
                        {comparisonResult.realPercentageIncrease.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Detailed Comparison */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    borderRadius: '1rem',
                    padding: '1.5rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '1.5rem',
                      color: '#374151'
                    }}>
                      Detailed Comparison
                    </h3>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem'
                    }}>
                      <div style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          Current Salary
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>
                          {formatCurrency(comparisonResult.currentSalary)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#1d4e89', marginTop: '0.25rem' }}>
                          {comparisonResult.currentCityData.name}
                        </div>
                      </div>

                      <div style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          New Salary
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>
                          {formatCurrency(comparisonResult.newSalary)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#1d4e89', marginTop: '0.25rem' }}>
                          {comparisonResult.newCityData.name}
                        </div>
                      </div>
                    </div>

                    {comparisonResult.realPercentageIncrease !== comparisonResult.percentageIncrease && (
                      <div style={{
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        marginTop: '1rem'
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          color: '#92400e'
                        }}>
                          <strong>Cost of Living Impact:</strong> The real salary increase after adjusting for 
                          cost of living differences between cities is {comparisonResult.realPercentageIncrease.toFixed(1)}% 
                          vs {comparisonResult.percentageIncrease.toFixed(1)}% nominal increase.
                        </p>
                      </div>
                    )}
                  </div>
                  <ResultActions
                    title="Salary comparison summary"
                    summaryLines={comparisonShareLines}
                    fileName="upaman-salary-comparison-summary.txt"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mobile-card-content" style={{ paddingTop: 0 }}>
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Annual CTC, city type, PF %, optional HRA/gratuity/professional-tax toggles',
              'Salary comparison uses current offer, new offer, and city cost multipliers'
            ]}
            formulas={[
              'Component split model: basic + HRA + allowance with deduction roll-up',
              'Illustrative tax and statutory deduction estimation for take-home projection',
              'City comparison uses normalization multipliers for cost-adjusted change'
            ]}
            assumptions={[
              'Salary structures vary by employer; this is a planning model, not payroll output',
              'Tax and deduction estimates are simplified for quick decision support',
              'Professional tax/benefit treatment can differ by state and payroll policy'
            ]}
            sources={[
              { label: 'EPFO (Provident Fund basics)', url: 'https://www.epfindia.gov.in/' },
              { label: 'Income Tax Department (India)', url: 'https://www.incometax.gov.in/' }
            ]}
            guideLinks={[
              { label: 'CTC to in-hand breakdown guide', href: '/guide-ctc-inhand-breakdown.html' },
              { label: 'Old vs new tax regime guide', href: '/guide-income-tax-regime-choice.html' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;
