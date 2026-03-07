import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { DollarSign, Calculator, TrendingUp, MapPin, Info, Briefcase, PiggyBank } from 'lucide-react';
import AffiliateRecommendations from './AffiliateRecommendations';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
import EEATPanel from './calculator/EEATPanel';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import SearchLandingSections from './calculator/SearchLandingSections';
import { buildFaqSchema } from '../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/schema';

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

  const seoFaqItems = [
    {
      question: 'How do I estimate 15 LPA or 20 LPA in-hand salary?',
      answer: 'Enter your annual CTC and review monthly take-home after modeled deductions. Use city and PF settings to approximate your specific payroll context.'
    },
    {
      question: 'Why can in-hand salary differ from this calculator?',
      answer: 'Actual payroll depends on employer structure, allowance policy, tax declarations, and state-specific deductions. Treat outputs as planning estimates.'
    },
    {
      question: 'Can I compare two job offers here?',
      answer: 'Yes. Use the comparison tab to evaluate nominal and cost-adjusted salary difference between two offers and city contexts.'
    }
  ];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Salary Calculator India 2025',
    url: 'https://upaman.com/salary-calculator',
    description: 'Calculate CTC to in-hand salary with deduction estimates and compare offers across city contexts.',
    featureList: [
      'CTC to In-hand Salary Calculator',
      'Salary Comparison Tool',
      'City Cost-Adjusted Salary Comparison',
      'Deduction Breakdown'
    ]
  });

  const faqSchema = buildFaqSchema(seoFaqItems);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'Salary Calculator', item: 'https://upaman.com/salary-calculator' }
  ]);

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
        
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
                        <PieBreakdownChart
                          title="Annual salary composition"
                          items={[
                            { label: 'Take-home salary', value: ctcResult.netAnnualSalary, color: '#10b981' },
                            { label: 'Employee deductions', value: ctcResult.deductions.total, color: '#f97316' },
                            { label: 'Employer contributions', value: ctcResult.employerContributions.total, color: '#3b82f6' }
                          ]}
                          formatter={formatCurrency}
                        />
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
                    <ComparisonBars
                      title="Salary offer comparison"
                      items={[
                        { label: 'Current salary', value: comparisonResult.currentSalary, color: '#64748b' },
                        { label: 'New salary', value: comparisonResult.newSalary, color: '#3b82f6' }
                      ]}
                      formatter={formatCurrency}
                    />
                    <ComparisonBars
                      title="Cost-adjusted comparison"
                      items={[
                        { label: 'Current (adjusted)', value: comparisonResult.currentAdjustedSalary, color: '#f97316' },
                        { label: 'New (adjusted)', value: comparisonResult.newAdjustedSalary, color: '#10b981' }
                      ]}
                      formatter={formatCurrency}
                    />
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
          <EEATPanel
            author="Upaman Research Team"
            reviewer="Compensation and Payroll Review Desk (Upaman)"
            reviewedOn="March 7, 2026"
            scope="Salary outputs are planning estimates based on modeled structure, deduction assumptions, and city normalization."
            sources={[
              { label: 'EPFO', url: 'https://www.epfindia.gov.in/' },
              { label: 'Income Tax Department', url: 'https://www.incometax.gov.in/' },
              { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' }
            ]}
          />
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
          <SearchLandingSections
            intro={(
              <>
                <p>
                  Salary decisions are among the highest-impact financial choices for most professionals, especially
                  during job switches. A useful CTC to in-hand salary calculator should do more than just one net
                  number. It should show deduction components, monthly cash flow impact, and salary-comparison context.
                  This page is structured for that decision workflow.
                </p>
                <p>
                  Use it to estimate take-home from annual CTC, compare offers across city contexts, and review how
                  deduction assumptions influence your real monthly spending capacity.
                </p>
              </>
            )}
            example={(
              <p>
                Suppose your offer is ₹15,00,000 CTC in a metro city with standard PF setup. Enter values, then review
                monthly in-hand and annual take-home. Next, compare with an alternate ₹17,00,000 offer in a different
                city. The comparison panel highlights nominal raise vs cost-adjusted raise, which is often more useful
                for final negotiation decisions.
              </p>
            )}
            formula={(
              <p>
                The model uses component-split estimation for basic, HRA, and allowances, then applies deduction roll-up
                (PF, tax assumptions, and selected statutory fields) to estimate net annual and monthly salary. Offer
                comparison mode additionally normalizes outcomes using city cost multipliers for practical purchasing-power context.
              </p>
            )}
            faqItems={seoFaqItems}
            relatedLinks={[
              { label: 'Income Tax Calculator (India)', href: '/income-tax-calculator' },
              { label: 'Tax Regime Comparison Tool', href: '/tax-regime-comparison' },
              { label: 'CTC to In-hand Salary Guide', href: '/guide-ctc-inhand-breakdown.html' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;
