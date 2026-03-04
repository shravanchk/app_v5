import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Calculator, Euro, TrendingUp, Building, Info, Globe } from 'lucide-react';
import AffiliateRecommendations from './AffiliateRecommendations';
import AdSenseAd from './AdSenseAd';
import HomeButton from './HomeButton';
import { PieBreakdownChart } from './calculator/ResultVisualizations';

const VATCalculator = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [country, setCountry] = useState('UK');
  const [calculationType, setCalculationType] = useState('exclusive'); // exclusive, inclusive
  const [results, setResults] = useState(null);

  // VAT rates for major European countries
  const VAT_RATES = {
    'UK': { standard: 20, reduced: [5, 0], country: 'United Kingdom', currency: '£', symbol: 'GBP' },
    'DE': { standard: 19, reduced: [7, 0], country: 'Germany', currency: '€', symbol: 'EUR' },
    'FR': { standard: 20, reduced: [10, 5.5, 2.1, 0], country: 'France', currency: '€', symbol: 'EUR' },
    'IT': { standard: 22, reduced: [10, 5, 4, 0], country: 'Italy', currency: '€', symbol: 'EUR' },
    'ES': { standard: 21, reduced: [10, 4, 0], country: 'Spain', currency: '€', symbol: 'EUR' },
    'NL': { standard: 21, reduced: [9, 0], country: 'Netherlands', currency: '€', symbol: 'EUR' },
    'BE': { standard: 21, reduced: [12, 6, 0], country: 'Belgium', currency: '€', symbol: 'EUR' },
    'AT': { standard: 20, reduced: [13, 10, 0], country: 'Austria', currency: '€', symbol: 'EUR' },
    'CH': { standard: 7.7, reduced: [3.7, 2.5, 0], country: 'Switzerland', currency: 'CHF', symbol: 'CHF' },
    'IE': { standard: 23, reduced: [13.5, 9, 4.8, 0], country: 'Ireland', currency: '€', symbol: 'EUR' },
    'PT': { standard: 23, reduced: [13, 6, 0], country: 'Portugal', currency: '€', symbol: 'EUR' },
    'DK': { standard: 25, reduced: [0], country: 'Denmark', currency: 'DKK', symbol: 'DKK' },
    'SE': { standard: 25, reduced: [12, 6, 0], country: 'Sweden', currency: 'SEK', symbol: 'SEK' },
    'NO': { standard: 25, reduced: [15, 12, 0], country: 'Norway', currency: 'NOK', symbol: 'NOK' },
    'FI': { standard: 24, reduced: [14, 10, 0], country: 'Finland', currency: '€', symbol: 'EUR' }
  };

  const calculateVAT = () => {
    if (!amount || !country) return;

    const inputAmount = parseFloat(amount);
    const vatRate = VAT_RATES[country].standard / 100;
    const currency = VAT_RATES[country].currency;

    let netAmount, vatAmount, grossAmount;

    if (calculationType === 'exclusive') {
      // Amount excluding VAT
      netAmount = inputAmount;
      vatAmount = netAmount * vatRate;
      grossAmount = netAmount + vatAmount;
    } else {
      // Amount including VAT
      grossAmount = inputAmount;
      netAmount = grossAmount / (1 + vatRate);
      vatAmount = grossAmount - netAmount;
    }

    setResults({
      netAmount: netAmount,
      vatAmount: vatAmount,
      grossAmount: grossAmount,
      vatRate: VAT_RATES[country].standard,
      currency: currency,
      country: VAT_RATES[country].country,
      calculationType: calculationType
    });
  };

  useEffect(() => {
    if (amount) {
      calculateVAT();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, country, calculationType]);

  const getCountryFlag = (countryCode) => {
    const flags = {
      'UK': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸',
      'NL': '🇳🇱', 'BE': '🇧🇪', 'AT': '🇦🇹', 'CH': '🇨🇭', 'IE': '🇮🇪',
      'PT': '🇵🇹', 'DK': '🇩🇰', 'SE': '🇸🇪', 'NO': '🇳🇴', 'FI': '🇫🇮'
    };
    return flags[countryCode] || '🌍';
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)',
      padding: '2rem 1rem',
      fontFamily: 'var(--app-font)'
    }}>
      <Head>
        <title>EU VAT Calculator 2025 | Free VAT Calculator for Europe | UK Germany France | Upaman</title>
        <meta name="description" content="Free VAT Calculator for European countries 2025. Calculate VAT for UK (20%), Germany (19%), France (20%), and all EU nations. VAT inclusive and exclusive calculations." />
        <meta name="keywords" content="VAT calculator Europe 2025, UK VAT calculator 20%, Germany VAT calculator 19%, France VAT calculator, EU VAT rates, value added tax calculator, business VAT calculator" />
        <link rel="canonical" href="https://upaman.com/eu-vat-calculator" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="EU VAT Calculator 2025 | Free VAT Calculator for Europe" />
        <meta property="og:description" content="Calculate VAT for all European countries. UK 20%, Germany 19%, France 20%. Free VAT inclusive/exclusive calculator." />
        <meta property="og:url" content="https://upaman.com/eu-vat-calculator" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Cards */}
        <meta name="twitter:title" content="EU VAT Calculator 2025 | Free European VAT Calculator" />
        <meta name="twitter:description" content="Calculate VAT for UK, Germany, France and all European countries. Free VAT calculator with latest rates." />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "European VAT Calculator 2025",
            "description": "Calculate Value Added Tax (VAT) for all European countries with current rates",
            "url": "https://upaman.com/eu-vat-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "featureList": [
              "VAT calculation for 15 European countries",
              "VAT inclusive and exclusive calculations",
              "Current VAT rates for 2025",
              "Multi-currency support (EUR, GBP, CHF, DKK, SEK, NOK)",
              "Business VAT calculator",
              "Real-time VAT calculations"
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
                "name": "What is the VAT rate in the UK for 2025?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The standard VAT rate in the UK for 2025 is 20%. There are also reduced rates of 5% and 0% for certain goods and services."
                }
              },
              {
                "@type": "Question",
                "name": "What is the VAT rate in Germany?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Germany has a standard VAT rate of 19% and reduced rates of 7% and 0% for specific categories."
                }
              },
              {
                "@type": "Question",
                "name": "How do I calculate VAT inclusive vs exclusive?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "VAT exclusive: Add VAT to the net amount (Net × VAT rate). VAT inclusive: Extract VAT from gross amount (Gross ÷ (1 + VAT rate))."
                }
              }
            ]
          })}
        </script>
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="calculator-header vat-header">
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
              European VAT Calculator
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '1.1rem',
              marginBottom: '0',
              fontWeight: '500'
            }}>
              Calculate VAT for 15+ European Countries - 2025 Rates
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
          <div className="vat-container">
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
                VAT Calculator
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Country Selection */}
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
                    {Object.entries(VAT_RATES).map(([code, data]) => (
                      <option key={code} value={code}>
                        {getCountryFlag(code)} {data.country} ({data.standard}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#334155',
                    fontSize: '0.95rem'
                  }}>
                    Amount ({VAT_RATES[country].currency})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g., 1000"
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

                {/* Calculation Type */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.75rem', 
                    fontWeight: '600',
                    color: '#334155',
                    fontSize: '0.95rem'
                  }}>
                    Calculation Type
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: calculationType === 'exclusive' ? '#d7f2ee' : '#f8fafc',
                      border: `2px solid ${calculationType === 'exclusive' ? '#0f766e' : '#d1dae6'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      flex: 1,
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      <input
                        type="radio"
                        name="calculationType"
                        value="exclusive"
                        checked={calculationType === 'exclusive'}
                        onChange={(e) => setCalculationType(e.target.value)}
                        style={{ margin: 0 }}
                      />
                      VAT Exclusive
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: calculationType === 'inclusive' ? '#d7f2ee' : '#f8fafc',
                      border: `2px solid ${calculationType === 'inclusive' ? '#0f766e' : '#d1dae6'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      flex: 1,
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      <input
                        type="radio"
                        name="calculationType"
                        value="inclusive"
                        checked={calculationType === 'inclusive'}
                        onChange={(e) => setCalculationType(e.target.value)}
                        style={{ margin: 0 }}
                      />
                      VAT Inclusive
                    </label>
                  </div>
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
                      {getCountryFlag(country)} {VAT_RATES[country].country}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#0f766e',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Standard VAT Rate: {VAT_RATES[country].standard}% • Currency: {VAT_RATES[country].currency}
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
            <div className="vat-container">
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
                  VAT Calculation Results
                </h2>

                {/* Results Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {/* Net Amount */}
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
                      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Net Amount (Excluding VAT)</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                        {results.currency}{results.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <Building size={32} style={{ opacity: 0.7 }} />
                  </div>

                  {/* VAT Amount */}
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
                      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>VAT Amount ({results.vatRate}%)</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                        {results.currency}{results.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <Euro size={32} style={{ opacity: 0.7 }} />
                  </div>

                  {/* Gross Amount */}
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
                      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Gross Amount (Including VAT)</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                        {results.currency}{results.grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <TrendingUp size={32} style={{ opacity: 0.7 }} />
                  </div>
                </div>

                {/* Summary */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #dbe2eb',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
                    Calculation Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600', color: '#115e59' }}>Country:</span>
                      <span>{getCountryFlag(country)} {results.country}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600', color: '#115e59' }}>VAT Rate:</span>
                      <span>{results.vatRate}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600', color: '#115e59' }}>Calculation Type:</span>
                      <span>{results.calculationType === 'exclusive' ? 'VAT Exclusive' : 'VAT Inclusive'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600', color: '#115e59' }}>Currency:</span>
                      <span>{results.currency}</span>
                    </div>
                  </div>
                </div>
                <PieBreakdownChart
                  title="Net amount vs VAT share"
                  items={[
                    { label: 'Net amount', value: results.netAmount, color: '#3b82f6' },
                    { label: 'VAT amount', value: results.vatAmount, color: '#f97316' }
                  ]}
                  formatter={(value) =>
                    `${results.currency}${Number(value || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}`
                  }
                />
              </div>

              {/* Affiliate Recommendations */}
              <div style={{ marginTop: '1.5rem' }}>
                <AffiliateRecommendations calculatorType="vat" />
              </div>
            </div>
          )}
        </div>

        {/* VAT Rates Table */}
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
              European VAT Rates 2025
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1rem' 
            }}>
              {Object.entries(VAT_RATES).map(([code, data]) => (
                <div key={code} style={{
                  background: country === code ? '#d7f2ee' : '#f8fafc',
                  border: `1px solid ${country === code ? '#a7e2dc' : '#dbe2eb'}`,
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
                      {getCountryFlag(code)} {data.country}
                    </span>
                    <span style={{
                      background: country === code ? '#0f766e' : '#1d4e89',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      {data.standard}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Currency: {data.currency} • Reduced: {data.reduced.join(', ')}%
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              VAT Calculator FAQ
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  What is VAT and how is it calculated?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  VAT (Value Added Tax) is a consumption tax levied on goods and services. For VAT exclusive amounts, 
                  multiply by the VAT rate. For VAT inclusive amounts, divide by (1 + VAT rate).
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  Which European country has the highest VAT rate?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  Denmark, Sweden, and Norway have the highest standard VAT rates at 25%. Ireland and Portugal 
                  follow with 23%, while Switzerland has the lowest at 7.7%.
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  What is the difference between VAT exclusive and inclusive?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  VAT exclusive means the price before VAT is added. VAT inclusive means the final price with VAT already included. 
                  Businesses often work with exclusive prices, while consumers see inclusive prices.
                </p>
              </details>

              <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <summary style={{ fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  Are VAT rates the same for all products?
                </summary>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', lineHeight: '1.6' }}>
                  No, most countries have reduced VAT rates for essential items like food, books, and medical supplies. 
                  Some items may be VAT-exempt (0%). Check your country's specific VAT rules.
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
        .vat-header {
          animation: slideDown 0.8s ease-out;
        }
        
        .vat-container {
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
          .vat-container {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default VATCalculator;
