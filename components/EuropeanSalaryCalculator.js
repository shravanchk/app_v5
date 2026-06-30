import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from './AffiliateRecommendations';
import AdSenseAd from './AdSenseAd';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import { PieBreakdownChart } from './calculator/ResultVisualizations';
import ResultActions from './ResultActions';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import { NumberField, SelectField, Tabs } from './ui/Field';
import Card from './ui/Card';
import { cn } from './ui/cn';

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

  // European salary tax systems and rates configured for this calculator
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
      // 2026 Einkommensteuer zones (§32a EStG). Grundfreibetrag €12,348;
      // 42% top-of-progression starts at €69,878; 45% Reichensteuer above €277,825.
      taxBands: [
        { min: 0, max: 12348, rate: 0 },
        { min: 12348, max: 69878, rate: 14 },
        { min: 69878, max: 277825, rate: 42 },
        { min: 277825, max: Infinity, rate: 45 }
      ],
      // Employee shares, 2026. NOTE: health excludes the fund-specific average
      // additional contribution (~1.45% employee share of the 2.9% Zusatzbeitrag);
      // care base 1.7% excludes the +0.6% childless surcharge.
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
      // 2026 barème de l'impôt sur le revenu (2026 Finance Act, thresholds +0.9%).
      taxBands: [
        { min: 0, max: 11600, rate: 0 },
        { min: 11600, max: 29579, rate: 11 },
        { min: 29579, max: 84577, rate: 30 },
        { min: 84577, max: 181917, rate: 41 },
        { min: 181917, max: Infinity, rate: 45 }
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
      // 2026 Box 1 brackets (three-band structure). Bracket 1 includes national
      // insurance (combined rate 35.70%; one source cites 35.75%).
      taxBands: [
        { min: 0, max: 38883, rate: 35.70 },
        { min: 38883, max: 78426, rate: 37.56 },
        { min: 78426, max: Infinity, rate: 49.50 }
      ],
      // 2026 maxima (flat approximation; both credits phase out with income).
      generalCredit: 3115,
      laborCredit: 5685,
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
    } else {
      setResults(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grossSalary, country, frequency]);

  const formatCurrency = (amount, currency) => {
    return `${currency}${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const selectedCountry = SALARY_SYSTEMS[country] || SALARY_SYSTEMS.UK;
  const selectedCountryName = selectedCountry.country;
  const canonicalUrl = `https://upaman.com${canonicalPath}`;
  const resolvedTitle = seoTitle || (forcedCountry
    ? `${selectedCountryName} Salary Calculator | Net Salary After Tax | Upaman`
    : 'European Salary Calculator | UK Germany France Switzerland | Net Salary Calculator | Upaman');
  const resolvedDescription = seoDescription || (forcedCountry
    ? `Calculate ${selectedCountryName} net salary after tax and social contributions. Get annual and monthly take-home pay with effective deduction estimates.`
    : 'Calculate net salary after taxes for European countries. UK, Germany, France, Netherlands, Switzerland salary calculator with tax rates and social security deductions.');
  const resolvedKeywords = seoKeywords || (forcedCountry
    ? `${selectedCountryName} salary calculator, ${selectedCountryName} net salary calculator, ${selectedCountryName} tax calculator, take home pay ${selectedCountryName}`
    : 'European salary calculator, UK salary calculator, Germany salary calculator, France salary calculator, Switzerland salary calculator, net salary calculator, European tax calculator, after tax salary');
  const resolvedHeading = pageHeading || (forcedCountry ? `${selectedCountryName} Salary Calculator` : 'European Salary Calculator');
  const resolvedSubheading = pageSubheading || (forcedCountry
    ? `Calculate your net salary after tax in ${selectedCountryName}`
    : 'Estimate net salary after tax and social contributions across 8 European countries.');

  const deductionLabels = {
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

  const resultShareLines = results ? [
    `Country: ${results.flag} ${results.country}`,
    `Gross annual salary: ${formatCurrency(results.grossAnnual, results.currency)}`,
    `Net annual salary (take-home): ${formatCurrency(results.netAnnual, results.currency)}`,
    `Net monthly salary: ${formatCurrency(results.netMonthly, results.currency)}`,
    `Total annual deductions: ${formatCurrency(results.breakdown.totalDeductions, results.currency)}`,
    `Effective tax rate: ${results.effectiveRate?.toFixed(1)}%`
  ] : [];

  return (
    <>
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
            "name": forcedCountry ? `${selectedCountryName} Salary Calculator` : "European Salary Calculator",
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

      <CalcLayout
        eyebrow={forcedCountry ? `Europe · ${selectedCountryName}` : 'Europe · Salary'}
        title={resolvedHeading}
        subtitle={resolvedSubheading}
      >
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Input Panel */}
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              {!forcedCountry && (
                <SelectField
                  id="eu-country"
                  label="Country"
                  value={country}
                  onChange={setCountry}
                  options={Object.entries(SALARY_SYSTEMS).map(([code, data]) => ({
                    value: code,
                    label: `${data.flag} ${data.country}`
                  }))}
                />
              )}

              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink-soft dark:text-slate-300">Salary frequency</span>
                <Tabs
                  tabs={[
                    { id: 'annual', label: 'Annual' },
                    { id: 'monthly', label: 'Monthly' }
                  ]}
                  active={frequency}
                  onChange={setFrequency}
                />
              </div>

              <NumberField
                id="eu-gross"
                label={`Gross salary (${frequency})`}
                prefix={selectedCountry.currency}
                value={grossSalary}
                onChange={setGrossSalary}
                hint={`Enter your gross ${frequency} salary to calculate take-home pay.`}
              />

              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-sm dark:border-teal-800/60 dark:bg-teal-900/20">
                <p className="font-semibold text-teal-800 dark:text-teal-300">{selectedCountry.flag} {selectedCountryName}</p>
                <p className="mt-0.5 text-teal-700 dark:text-teal-400">
                  Calculations include income tax, social security, and other mandatory deductions for {selectedCountryName}.
                </p>
              </div>
            </div>
            <div className="mt-5"><AdSenseAd /></div>
          </Card>

          {/* Results Panel */}
          <div className="space-y-5 lg:col-span-3">
            {results ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Net annual (take-home)" value={formatCurrency(results.netAnnual, results.currency)} emphasis tone="positive" />
                  <ResultStat label="Net monthly" value={formatCurrency(results.netMonthly, results.currency)} />
                  <ResultStat label="Total deductions" value={formatCurrency(results.breakdown.totalDeductions, results.currency)} />
                  <ResultStat label="Effective tax rate" value={`${results.effectiveRate?.toFixed(1)}%`} />
                </div>

                <Card className="p-5">
                  <PieBreakdownChart
                    title="Gross salary composition"
                    items={[
                      { label: 'Net take-home', value: results.netAnnual, color: '#10b981' },
                      { label: 'Total deductions', value: results.breakdown.totalDeductions, color: '#f97316' }
                    ]}
                    formatter={(value) => formatCurrency(value, results.currency)}
                  />
                </Card>

                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Detailed breakdown</h3>
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                    <div className="flex items-center justify-between py-2 text-sm">
                      <span className="font-medium text-ink-soft dark:text-slate-300">Gross annual salary</span>
                      <span className="font-semibold text-ink dark:text-white">{formatCurrency(results.grossAnnual, results.currency)}</span>
                    </div>
                    {Object.entries(results.breakdown).map(([key, value]) => {
                      if (key === 'totalDeductions') return null;
                      const isPositive = key.includes('Credit') || key.includes('Allowance') || key === 'taxableIncome';
                      const isNeutral = key === 'taxableIncome';
                      return (
                        <div key={key} className="flex items-center justify-between py-2 text-sm">
                          <span className="text-ink-soft dark:text-slate-300">{deductionLabels[key] || key}</span>
                          <span className={cn(
                            'font-medium',
                            isNeutral
                              ? 'text-ink dark:text-white'
                              : isPositive
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-amber-700 dark:text-amber-400'
                          )}>
                            {isNeutral ? '' : isPositive ? '+' : '-'}{formatCurrency(Math.abs(value), results.currency)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between py-2 text-sm font-semibold">
                      <span className="text-emerald-700 dark:text-emerald-400">Net annual salary</span>
                      <span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(results.netAnnual, results.currency)}</span>
                    </div>
                  </div>
                </Card>

                <ResultActions
                  title={`${results.country} salary calculation summary`}
                  summaryLines={resultShareLines}
                  fileName="upaman-european-salary-summary.txt"
                />

                <AffiliateRecommendations calculatorType="european-salary" />
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your gross salary to see your net take-home breakdown.
              </Card>
            )}
          </div>
        </div>

        {/* Country Comparison */}
        {!forcedCountry && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-ink dark:text-white">European tax systems comparison</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(SALARY_SYSTEMS).map(([code, data]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCountry(code)}
                  className={cn(
                    'rounded-xl border p-4 text-left transition',
                    country === code
                      ? 'border-brand-300 bg-brand-50/60 dark:border-brand-700 dark:bg-brand-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink dark:text-white">{data.flag} {data.country}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-ink-soft dark:bg-slate-700 dark:text-slate-200">{data.currency}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
                    {data.taxBands ? `Tax: up to ${data.taxBands[data.taxBands.length - 1].rate}%` : 'Complex tax system'}
                    {data.socialSecurity && ` · Social: ${typeof data.socialSecurity === 'number' ? data.socialSecurity : 'Variable'}%`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">
            {forcedCountry ? `${selectedCountryName} Salary Calculator FAQ` : 'European Salary Calculator FAQ'}
          </h2>
          <div className="mt-4 grid gap-3">
            {[
              { q: 'How accurate are these salary calculations?', a: 'These calculations use the tax rates and standard deductions configured in this calculator. Actual take-home pay may vary based on personal circumstances, allowances, and local variations. Consult a tax professional for precise calculations.' },
              { q: "What's included in social security deductions?", a: 'Social security typically includes pension contributions, unemployment insurance, health insurance, and disability insurance. The exact components and rates vary significantly between European countries.' },
              { q: 'Which European country is most tax-efficient for high earners?', a: 'Switzerland generally has lower overall tax rates, especially for high earners. However, cost of living and available services vary greatly. Consider total compensation packages and living costs, not just tax rates.' },
              { q: 'Do these calculations include all possible deductions?', a: 'These are standard calculations for employees. Additional deductions may apply for pension contributions, charitable donations, professional expenses, or other tax-deductible items specific to each country.' }
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology and assumptions"
            inputs={[
              'Country, salary frequency (annual or monthly), and gross salary amount'
            ]}
            formulas={[
              'Progressive income-tax bands applied per country',
              'Employee social-security / national-insurance contributions per country rules',
              'Net = gross − income tax − social contributions (− credits where applicable)'
            ]}
            assumptions={[
              'Standard single-employee treatment without personal allowances beyond those modelled',
              'Germany uses a linear-progressive approximation in the 14–42% zone; Netherlands applies flat general + labour credits',
              'Swiss cantonal tax uses an average rate; actual rates vary significantly by canton',
              'Rates reflect 2026 published thresholds; verify with official sources before relying on figures'
            ]}
            sources={[
              { label: 'UK Income Tax rates (gov.uk)', url: 'https://www.gov.uk/income-tax-rates' },
              { label: 'Germany income tax (BMF)', url: 'https://www.bundesfinanzministerium.de/' },
              { label: 'France impôt sur le revenu (service-public.fr)', url: 'https://www.service-public.fr/particuliers/vosdroits/F1419' },
              { label: 'Netherlands Box 1 rates (belastingdienst.nl)', url: 'https://www.belastingdienst.nl/' }
            ]}
          />
        </div>

        <div className="mt-8 text-center"><AdSenseAd /></div>
      </CalcLayout>
    </>
  );
};

export default EuropeanSalaryCalculator;
