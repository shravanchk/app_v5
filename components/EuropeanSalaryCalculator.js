import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Calculator, Euro, TrendingUp, Users, Info, Globe, PiggyBank } from 'lucide-react';
import AffiliateRecommendations from './AffiliateRecommendations';
import AdSenseAd from './AdSenseAd';
import HomeButton from './HomeButton';

const EuropeanSalaryCalculator = ({
  onBack,
  forcedCountry = null,
  canonicalPath = '/european-salary-calculator',
  seoTitle = null,
  seoDescription = null,
  seoKeywords = null,
  pageHeading = null,
  pageSubheading = null
}) => {
  const [grossSalary, setGrossSalary] = useState('');
  const [country, setCountry] = useState(forcedCountry || 'UK');
  const [frequency, setFrequency] = useState('annual'); // annual, monthly
  const [results, setResults] = useState(null);

  // European salary tax systems and rates for 2025
  const SALARY_SYSTEMS = {
    'UK': {
      country: 'United Kingdom',
      currency: '£',
      symbol: 'GBP',
      personalAllowance: 12570,
      taxBands: [
        { min: 0, max: 37700, rate: 20 },
        { min: 37700, max: 150000, rate: 40 },
        { min: 150000, max: Infinity, rate: 45 }
      ],
      niEmployee: [
        { min: 0, max: 12570, rate: 0 },
        { min: 12570, max: 50270, rate: 12 },
        { min: 50270, max: Infinity, rate: 2 }
      ],
      niEmployer: 13.8,
      flag: '🇬🇧'
    },
    'DE': {
      country: 'Germany',
      currency: '€',
      symbol: 'EUR',
      taxBands: [
        { min: 0, max: 11604, rate: 0 },
        { min: 11604, max: 66760, rate: 14 },
        { min: 66760, max: 277825, rate: 42 },
        { min: 277825, max: Infinity, rate: 45 }
      ],
      socialSecurity: {
        pension: 9.3,
        unemployment: 1.3,
        health: 7.3,
        care: 1.7
      },
      solidarityTax: 5.5,
      flag: '🇩🇪'
    },
    'FR': {
      country: 'France',
      currency: '€',
      symbol: 'EUR',
      taxBands: [
        { min: 0, max: 11294, rate: 0 },
        { min: 11294, max: 28797, rate: 11 },
        { min: 28797, max: 82341, rate: 30 },
        { min: 82341, max: 177106, rate: 41 },
        { min: 177106, max: Infinity, rate: 45 }
      ],
      socialSecurity: {
        generalSocial: 9.7,
        csg: 9.2,
        unemployment: 2.4
      },
      flag: '🇫🇷'
    },
    'NL': {
      country: 'Netherlands',
      currency: '€',
      symbol: 'EUR',
      taxBands: [
        { min: 0, max: 75518, rate: 37.07 },
        { min: 75518, max: Infinity, rate: 49.5 }
      ],
      generalCredit: 3362,
      laborCredit: 4426,
      flag: '🇳🇱'
    },
    'CH': {
      country: 'Switzerland',
      currency: 'CHF',
      symbol: 'CHF',
      federalTax: [
        { min: 0, max: 14500, rate: 0 },
        { min: 14500, max: 31600, rate: 0.77 },
        { min: 31600, max: 41400, rate: 0.88 },
        { min: 41400, max: 55200, rate: 2.64 },
        { min: 55200, max: 72500, rate: 2.97 },
        { min: 72500, max: 78100, rate: 5.94 },
        { min: 78100, max: Infinity, rate: 11.5 }
      ],
      cantonalTax: 7.8, // Average rate
      ahv: 5.3, // Old age and survivors insurance
      flag: '🇨🇭'
    },
    'AT': {
      country: 'Austria',
      currency: '€',
      symbol: 'EUR',
      taxBands: [
        { min: 0, max: 11693, rate: 0 },
        { min: 11693, max: 19134, rate: 20 },
        { min: 19134, max: 32075, rate: 32.5 },
        { min: 32075, max: 63350, rate: 42 },
        { min: 63350, max: 1000000, rate: 48 },
        { min: 1000000, max: Infinity, rate: 55 }
      ],
      socialSecurity: 18.12,
      flag: '🇦🇹'
    },
    'BE': {
      country: 'Belgium',
      currency: '€',
      symbol: 'EUR',
      taxBands: [
        { min: 0, max: 15200, rate: 25 },
        { min: 15200, max: 26830, rate: 40 },
        { min: 26830, max: 46440, rate: 45 },
        { min: 46440, max: Infinity, rate: 50 }
      ],
      socialSecurity: 13.07,
      flag: '🇧🇪'
    },
    'SE': {
      country: 'Sweden',
      currency: 'SEK',
      symbol: 'SEK',
      municipalTax: 32.12, // Average
      stateTax: [
        { min: 0, max: 598500, rate: 0 },
        { min: 598500, max: Infinity, rate: 20 }
      ],
      socialSecurity: 7,
      flag: '🇸🇪'
    }
  };

  useEffect(() => {
    if (forcedCountry) {
      setCountry(forcedCountry);
    }
  }, [forcedCountry]);

  const calculateSalary = () => {
    if (!grossSalary || !country) return;

    const annual = frequency === 'annual' ? parseFloat(grossSalary) : parseFloat(grossSalary) * 12;
    const system = SALARY_SYSTEMS[country];
    
    let results = {
      grossAnnual: annual,
      grossMonthly: annual / 12,
      currency: system.currency,
      country: system.country,
      flag: system.flag,
      breakdown: {}
    };

    // Calculate based on country-specific rules
    switch(country) {
      case 'UK':
        results = calculateUKSalary(annual, system, results);
        break;
      case 'DE':
        results = calculateGermanySalary(annual, system, results);
        break;
      case 'FR':
        results = calculateFranceSalary(annual, system, results);
        break;
      case 'NL':
        results = calculateNetherlandsSalary(annual, system, results);
        break;
      case 'CH':
        results = calculateSwitzerlandSalary(annual, system, results);
        break;
      case 'AT':
        results = calculateAustriaSalary(annual, system, results);
        break;
      case 'BE':
        results = calculateBelgiumSalary(annual, system, results);
        break;
      case 'SE':
        results = calculateSwedenSalary(annual, system, results);
        break;
      default:
        return;
    }

    setResults(results);
  };

  // UK Tax Calculation
  const calculateUKSalary = (annual, system, results) => {
    const taxableIncome = Math.max(0, annual - system.personalAllowance);
    let incomeTax = 0;
    let ni = 0;
    
    // Income Tax
    for (const band of system.taxBands) {
      if (taxableIncome > band.min) {
        const taxableAmount = Math.min(taxableIncome - band.min, band.max - band.min);
        incomeTax += taxableAmount * (band.rate / 100);
      }
    }
    
    // National Insurance
    for (const band of system.niEmployee) {
      if (annual > band.min) {
        const niAmount = Math.min(annual - band.min, band.max - band.min);
        ni += niAmount * (band.rate / 100);
      }
    }
    
    const totalDeductions = incomeTax + ni;
    const netAnnual = annual - totalDeductions;
    
    results.breakdown = {
      incomeTax,
      nationalInsurance: ni,
      totalDeductions,
      personalAllowance: system.personalAllowance,
      taxableIncome
    };
    
    results.netAnnual = netAnnual;
    results.netMonthly = netAnnual / 12;
    results.effectiveRate = (totalDeductions / annual) * 100;
    
    return results;
  };

  // Germany Tax Calculation
  const calculateGermanySalary = (annual, system, results) => {
    let incomeTax = 0;
    let socialSec = 0;
    let solidarity = 0;
    
    // Income Tax
    for (const band of system.taxBands) {
      if (annual > band.min) {
        const taxableAmount = Math.min(annual - band.min, band.max - band.min);
        if (band.rate === 14) {
          // Progressive rate from 14% to 42%
          const rate = 14 + ((annual - band.min) / (band.max - band.min)) * 28;
          incomeTax += taxableAmount * (rate / 100);
        } else {
          incomeTax += taxableAmount * (band.rate / 100);
        }
      }
    }
    
    // Social Security (employee portion)
    const totalSocialRate = Object.values(system.socialSecurity).reduce((a, b) => a + b, 0);
    socialSec = annual * (totalSocialRate / 100);
    
    // Solidarity Tax (5.5% of income tax)
    solidarity = incomeTax * 0.055;
    
    const totalDeductions = incomeTax + socialSec + solidarity;
    const netAnnual = annual - totalDeductions;
    
    results.breakdown = {
      incomeTax,
      socialSecurity: socialSec,
      solidarityTax: solidarity,
      totalDeductions
    };
    
    results.netAnnual = netAnnual;
    results.netMonthly = netAnnual / 12;
    results.effectiveRate = (totalDeductions / annual) * 100;
    
    return results;
  };

  // France Tax Calculation
  const calculateFranceSalary = (annual, system, results) => {
    let incomeTax = 0;
    let socialSec = 0;
    
    // Income Tax
    for (const band of system.taxBands) {
      if (annual > band.min) {
        const taxableAmount = Math.min(annual - band.min, band.max - band.min);
        incomeTax += taxableAmount * (band.rate / 100);
      }
    }
    
    // Social Security
    const totalSocialRate = Object.values(system.socialSecurity).reduce((a, b) => a + b, 0);
    socialSec = annual * (totalSocialRate / 100);
    
    const totalDeductions = incomeTax + socialSec;
    const netAnnual = annual - totalDeductions;
    
    results.breakdown = {
      incomeTax,
      socialSecurity: socialSec,
      totalDeductions
    };
    
    results.netAnnual = netAnnual;
    results.netMonthly = netAnnual / 12;
    results.effectiveRate = (totalDeductions / annual) * 100;
    
    return results;
  };

  // Netherlands Tax Calculation
  const calculateNetherlandsSalary = (annual, system, results) => {
    let incomeTax = 0;
    
    // Income Tax
    for (const band of system.taxBands) {
      if (annual > band.min) {
        const taxableAmount = Math.min(annual - band.min, band.max - band.min);
        incomeTax += taxableAmount * (band.rate / 100);
      }
    }
    
    // Apply tax credits
    const taxCredits = system.generalCredit + system.laborCredit;
    const finalTax = Math.max(0, incomeTax - taxCredits);
    
    const netAnnual = annual - finalTax;
    
    results.breakdown = {
      grossTax: incomeTax,
      taxCredits,
      incomeTax: finalTax,
      totalDeductions: finalTax
    };
    
    results.netAnnual = netAnnual;
    results.netMonthly = netAnnual / 12;
    results.effectiveRate = (finalTax / annual) * 100;
    
    return results;
  };

  // Switzerland Tax Calculation
  const calculateSwitzerlandSalary = (annual, system, results) => {
    let federalTax = 0;
    let cantonalTax = 0;
    let ahv = 0;
    
    // Federal Tax
    for (const band of system.federalTax) {
      if (annual > band.min) {
        const taxableAmount = Math.min(annual - band.min, band.max - band.min);
        federalTax += taxableAmount * (band.rate / 100);
      }
    }
    
    // Cantonal Tax (average)
    cantonalTax = annual * (system.cantonalTax / 100);
    
    // AHV (Old age insurance)
    ahv = annual * (system.ahv / 100);
    
    const totalDeductions = federalTax + cantonalTax + ahv;
    const netAnnual = annual - totalDeductions;
    
    results.breakdown = {
      federalTax,
      cantonalTax,
      ahv,
      totalDeductions
    };
    
    results.netAnnual = netAnnual;
    results.netMonthly = netAnnual / 12;
    results.effectiveRate = (totalDeductions / annual) * 100;
    
    return results;
  };

  // Austria Tax Calculation
  const calculateAustriaSalary = (annual, system, results) => {
    let incomeTax = 0;
    let socialSec = 0;
    
    // Income Tax
    for (const band of system.taxBands) {
      if (annual > band.min) {
        const taxableAmount = Math.min(annual - band.min, band.max - band.min);
        incomeTax += taxableAmount * (band.rate / 100);
      }
    }
    
    // Social Security
    socialSec = annual * (system.socialSecurity / 100);
    
    const totalDeductions = incomeTax + socialSec;
    const netAnnual = annual - totalDeductions;
    
    results.breakdown = {
      incomeTax,
      socialSecurity: socialSec,
      totalDeductions
    };
    
    results.netAnnual = netAnnual;
    results.netMonthly = netAnnual / 12;
    results.effectiveRate = (totalDeductions / annual) * 100;
    
    return results;
  };

  // Belgium Tax Calculation
  const calculateBelgiumSalary = (annual, system, results) => {
    let incomeTax = 0;
    let socialSec = 0;
    
    // Income Tax
    for (const band of system.taxBands) {
      if (annual > band.min) {
        const taxableAmount = Math.min(annual - band.min, band.max - band.min);
        incomeTax += taxableAmount * (band.rate / 100);
      }
    }
    
    // Social Security
    socialSec = annual * (system.socialSecurity / 100);
    
    const totalDeductions = incomeTax + socialSec;
    const netAnnual = annual - totalDeductions;
    
    results.breakdown = {
      incomeTax,
      socialSecurity: socialSec,
      totalDeductions
    };
    
    results.netAnnual = netAnnual;
    results.netMonthly = netAnnual / 12;
    results.effectiveRate = (totalDeductions / annual) * 100;
    
    return results;
  };

  // Sweden Tax Calculation
  const calculateSwedenSalary = (annual, system, results) => {
    let municipalTax = 0;
    let stateTax = 0;
    let socialFees = 0;
    
    // Municipal Tax
    municipalTax = annual * (system.municipalTax / 100);
    
    // State Tax
    for (const band of system.stateTax) {
      if (annual > band.min) {
        const taxableAmount = Math.min(annual - band.min, band.max - band.min);
        stateTax += taxableAmount * (band.rate / 100);
      }
    }
    
    // Social Security Fees
    socialFees = annual * (system.socialSecurity / 100);
    
    const totalDeductions = municipalTax + stateTax + socialFees;
    const netAnnual = annual - totalDeductions;
    
    results.breakdown = {
      municipalTax,
      stateTax,
      socialSecurity: socialFees,
      totalDeductions
    };
    
    results.netAnnual = netAnnual;
    results.netMonthly = netAnnual / 12;
    results.effectiveRate = (totalDeductions / annual) * 100;
    
    return results;
  };

  useEffect(() => {
    if (grossSalary) {
      calculateSalary();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grossSalary, country, frequency]);

  const getCountryFlag = (countryCode) => {
    return SALARY_SYSTEMS[countryCode]?.flag || '🌍';
  };

  const formatCurrency = (amount, currency) => {
    return `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const selectedCountry = SALARY_SYSTEMS[country] || SALARY_SYSTEMS.UK;
  const selectedCountryName = selectedCountry.country;
  const canonicalUrl = `https://upaman.com${canonicalPath}`;
  const resolvedTitle = seoTitle || (forcedCountry
    ? `${selectedCountryName} Salary Calculator 2026 | Net Salary After Tax | Upaman`
    : 'European Salary Calculator 2025 | UK Germany France Switzerland | Net Salary Calculator | Upaman');
  const resolvedDescription = seoDescription || (forcedCountry
    ? `Calculate ${selectedCountryName} net salary after tax and social contributions. Get annual and monthly take-home pay with effective deduction estimates.`
    : 'Calculate net salary after taxes for European countries 2025. UK, Germany, France, Netherlands, Switzerland salary calculator with tax rates and social security deductions.');
  const resolvedKeywords = seoKeywords || (forcedCountry
    ? `${selectedCountryName} salary calculator, ${selectedCountryName} net salary calculator, ${selectedCountryName} tax calculator, take home pay ${selectedCountryName}`
    : 'European salary calculator 2025, UK salary calculator, Germany salary calculator, France salary calculator, Switzerland salary calculator, net salary calculator, European tax calculator, after tax salary');
  const resolvedHeading = pageHeading || (forcedCountry ? `${selectedCountryName} Salary Calculator` : 'European Salary Calculator');
  const resolvedSubheading = pageSubheading || (forcedCountry
    ? `Calculate your net salary after tax in ${selectedCountryName}`
    : 'Calculate Your Net Salary After Tax - 8 European Countries');

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)',
      padding: '2rem 1rem',
      fontFamily: 'var(--app-font)'
    }}>
      <Head>
        <title>{resolvedTitle}</title>
        <meta name="description" content={resolvedDescription} />
        <meta name="keywords" content={resolvedKeywords} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={resolvedTitle} />
        <meta property="og:description" content={resolvedDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Cards */}
        <meta name="twitter:title" content={resolvedTitle} />
        <meta name="twitter:description" content={resolvedDescription} />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": forcedCountry ? `${selectedCountryName} Salary Calculator` : "European Salary Calculator 2025",
            "description": resolvedDescription,
            "url": canonicalUrl,
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": selectedCountry.symbol || "EUR"
            },
            "featureList": [
              forcedCountry ? `Salary calculation for ${selectedCountryName}` : "Salary calculation for 8 European countries",
              "Tax and social security deductions",
              "Annual and monthly salary breakdown",
              "Multi-currency support (GBP, EUR, CHF, SEK)",
              "Effective tax rate calculation",
              "Country-specific tax systems"
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
                "name": "How is net salary calculated in Europe?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Net salary is calculated by deducting income tax, social security contributions, and other mandatory deductions from gross salary. Each European country has different tax rates and social security systems."
                }
              },
              {
                "@type": "Question",
                "name": "Which European country has the highest tax rates?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Belgium and France generally have among the highest effective tax rates in Europe, while Switzerland typically has lower rates. However, this varies significantly based on income level and personal circumstances."
                }
              },
              {
                "@type": "Question",
                "name": "What is included in European social security deductions?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Social security typically includes pension contributions, unemployment insurance, health insurance, and disability insurance. The specific components and rates vary by country."
                }
              }
            ]
          })}
        </script>
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="calculator-header salary-header">
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
              {resolvedHeading}
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '1.1rem',
              marginBottom: '0',
              fontWeight: '500'
            }}>
              {resolvedSubheading}
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
          <div className="salary-container">
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
                Salary Calculator
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Country Selection */}
                {!forcedCountry && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: '600',
                      color: '#334155',
                      fontSize: '0.95rem'
                    }}>
                      <Globe size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Select Country
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
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
                      {Object.entries(SALARY_SYSTEMS).map(([code, data]) => (
                        <option key={code} value={code}>
                          {data.flag} {data.country}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Frequency Selection */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.75rem', 
                    fontWeight: '600',
                    color: '#334155',
                    fontSize: '0.95rem'
                  }}>
                    Salary Frequency
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: frequency === 'annual' ? '#dbe7f4' : '#f8fafc',
                      border: `2px solid ${frequency === 'annual' ? '#1d4e89' : '#d1dae6'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      flex: 1,
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      <input
                        type="radio"
                        name="frequency"
                        value="annual"
                        checked={frequency === 'annual'}
                        onChange={(e) => setFrequency(e.target.value)}
                        style={{ margin: 0 }}
                      />
                      Annual
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: frequency === 'monthly' ? '#dbe7f4' : '#f8fafc',
                      border: `2px solid ${frequency === 'monthly' ? '#1d4e89' : '#d1dae6'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      flex: 1,
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      <input
                        type="radio"
                        name="frequency"
                        value="monthly"
                        checked={frequency === 'monthly'}
                        onChange={(e) => setFrequency(e.target.value)}
                        style={{ margin: 0 }}
                      />
                      Monthly
                    </label>
                  </div>
                </div>

                {/* Salary Input */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#334155',
                    fontSize: '0.95rem'
                  }}>
                    Gross Salary ({SALARY_SYSTEMS[country].currency}) - {frequency}
                  </label>
                  <input
                    type="number"
                    value={grossSalary}
                    onChange={(e) => setGrossSalary(e.target.value)}
                    placeholder={`e.g., ${frequency === 'annual' ? '50000' : '4000'}`}
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

                {/* Country Info Box */}
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
                    <span style={{ fontWeight: '600', color: '#115e59' }}>
                      {getCountryFlag(country)} {SALARY_SYSTEMS[country].country}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#0f766e',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Calculations include income tax, social security, and other mandatory deductions for {SALARY_SYSTEMS[country].country}.
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
            <div className="salary-container">
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
                  Salary Breakdown
                </h2>

                {/* Summary Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {/* Gross Salary */}
                  <div style={{
                    background: 'linear-gradient(135deg, #0f2a43, #1d4e89)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Gross Annual Salary</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                        {formatCurrency(results.grossAnnual, results.currency)}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        {formatCurrency(results.grossMonthly, results.currency)} per month
                      </div>
                    </div>
                    <PiggyBank size={32} style={{ opacity: 0.7 }} />
                  </div>

                  {/* Net Salary */}
                  <div style={{
                    background: 'linear-gradient(135deg, #0f766e, #115e59)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Net Annual Salary (Take Home)</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                        {formatCurrency(results.netAnnual, results.currency)}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        {formatCurrency(results.netMonthly, results.currency)} per month
                      </div>
                    </div>
                    <Euro size={32} style={{ opacity: 0.7 }} />
                  </div>

                  {/* Total Deductions */}
                  <div style={{
                    background: 'linear-gradient(135deg, #b45309, #c2410c)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Annual Deductions</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                        {formatCurrency(results.breakdown.totalDeductions, results.currency)}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        Effective Tax Rate: {results.effectiveRate?.toFixed(1)}%
                      </div>
                    </div>
                    <Users size={32} style={{ opacity: 0.7 }} />
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #dbe2eb',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
                    Detailed Breakdown
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: '600', color: '#115e59' }}>Gross Annual Salary:</span>
                      <span>{formatCurrency(results.grossAnnual, results.currency)}</span>
                    </div>
                    
                    {Object.entries(results.breakdown).map(([key, value]) => {
                      if (key === 'totalDeductions') return null;
                      
                      const labels = {
                        incomeTax: 'Income Tax',
                        nationalInsurance: 'National Insurance',
                        socialSecurity: 'Social Security',
                        solidarityTax: 'Solidarity Tax',
                        federalTax: 'Federal Tax',
                        cantonalTax: 'Cantonal Tax',
                        ahv: 'AHV/Insurance',
                        municipalTax: 'Municipal Tax',
                        stateTax: 'State Tax',
                        grossTax: 'Gross Tax',
                        taxCredits: 'Tax Credits',
                        personalAllowance: 'Personal Allowance',
                        taxableIncome: 'Taxable Income'
                      };
                      
                      return (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: '500', color: '#374151' }}>
                            {labels[key] || key}:
                          </span>
                          <span style={{ color: key.includes('Credit') || key.includes('Allowance') ? '#0f766e' : '#b45309' }}>
                            {key.includes('Credit') || key.includes('Allowance') ? '+' : '-'}{formatCurrency(Math.abs(value), results.currency)}
                          </span>
                        </div>
                      );
                    })}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', fontWeight: '700' }}>
                      <span style={{ color: '#115e59' }}>Net Annual Salary:</span>
                      <span style={{ color: '#115e59' }}>{formatCurrency(results.netAnnual, results.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Affiliate Recommendations */}
              <div style={{ marginTop: '1.5rem' }}>
                <AffiliateRecommendations calculatorType="european-salary" />
              </div>
            </div>
          )}
        </div>

        {/* Country Comparison Table */}
        {!forcedCountry && (
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
                European Tax Systems Comparison
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '1rem' 
              }}>
                {Object.entries(SALARY_SYSTEMS).map(([code, data]) => (
                  <div key={code} style={{
                    background: country === code ? '#dbe7f4' : '#f8fafc',
                    border: `1px solid ${country === code ? '#a8bdd8' : '#dbe2eb'}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setCountry(code)}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ 
                        fontSize: '1rem', 
                        fontWeight: '700',
                        color: '#1e293b'
                      }}>
                        {data.flag} {data.country}
                      </span>
                      <span style={{
                        background: country === code ? '#1d4e89' : '#64748b',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '700'
                      }}>
                        {data.currency}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {data.taxBands ? `Tax: ${data.taxBands[data.taxBands.length - 1].rate}% max` : 'Complex tax system'}
                      {data.socialSecurity && ` • Social: ${typeof data.socialSecurity === 'number' ? data.socialSecurity : 'Variable'}%`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
              {forcedCountry ? `${selectedCountryName} Salary Calculator FAQ` : 'European Salary Calculator FAQ'}
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  How accurate are these salary calculations?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  These calculations use current 2025 tax rates and standard deductions. Actual take-home pay may vary based on 
                  personal circumstances, allowances, and local variations. Consult a tax professional for precise calculations.
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  What's included in social security deductions?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  Social security typically includes pension contributions, unemployment insurance, health insurance, and disability 
                  insurance. The exact components and rates vary significantly between European countries.
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  Which European country is most tax-efficient for high earners?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  Switzerland generally has lower overall tax rates, especially for high earners. However, cost of living and 
                  available services vary greatly. Consider total compensation packages and living costs, not just tax rates.
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  Do these calculations include all possible deductions?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  These are standard calculations for employees. Additional deductions may apply for pension contributions, 
                  charitable donations, professional expenses, or other tax-deductible items specific to each country.
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
        .salary-header {
          animation: slideDown 0.8s ease-out;
        }
        
        .salary-container {
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
          .salary-container {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default EuropeanSalaryCalculator;
