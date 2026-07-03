import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from '../AffiliateRecommendations';
import AdSenseAd from '../AdSenseAd';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import { PieBreakdownChart } from '../calculator/ResultVisualizations';
import ResultActions from '../ResultActions';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { cn } from '../ui/cn';

const VATCalculator = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [country, setCountry] = useState('UK');
  const [calculationType, setCalculationType] = useState('exclusive'); // exclusive, inclusive
  const [results, setResults] = useState(null);

  // VAT rates for major European countries
  const VAT_RATES = {
    'UK': { standard: 20, reduced: [5, 0], country: 'United Kingdom', currency: '£', symbol: 'GBP', flag: '🇬🇧' },
    'DE': { standard: 19, reduced: [7, 0], country: 'Germany', currency: '€', symbol: 'EUR', flag: '🇩🇪' },
    'FR': { standard: 20, reduced: [10, 5.5, 2.1, 0], country: 'France', currency: '€', symbol: 'EUR', flag: '🇫🇷' },
    'IT': { standard: 22, reduced: [10, 5, 4, 0], country: 'Italy', currency: '€', symbol: 'EUR', flag: '🇮🇹' },
    'ES': { standard: 21, reduced: [10, 4, 0], country: 'Spain', currency: '€', symbol: 'EUR', flag: '🇪🇸' },
    'NL': { standard: 21, reduced: [9, 0], country: 'Netherlands', currency: '€', symbol: 'EUR', flag: '🇳🇱' },
    'BE': { standard: 21, reduced: [12, 6, 0], country: 'Belgium', currency: '€', symbol: 'EUR', flag: '🇧🇪' },
    'AT': { standard: 20, reduced: [13, 10, 0], country: 'Austria', currency: '€', symbol: 'EUR', flag: '🇦🇹' },
    'CH': { standard: 8.1, reduced: [3.8, 2.6, 0], country: 'Switzerland', currency: 'CHF', symbol: 'CHF', flag: '🇨🇭' },
    'IE': { standard: 23, reduced: [13.5, 9, 4.8, 0], country: 'Ireland', currency: '€', symbol: 'EUR', flag: '🇮🇪' },
    'PT': { standard: 23, reduced: [13, 6, 0], country: 'Portugal', currency: '€', symbol: 'EUR', flag: '🇵🇹' },
    'DK': { standard: 25, reduced: [0], country: 'Denmark', currency: 'DKK', symbol: 'DKK', flag: '🇩🇰' },
    'SE': { standard: 25, reduced: [12, 6, 0], country: 'Sweden', currency: 'SEK', symbol: 'SEK', flag: '🇸🇪' },
    'NO': { standard: 25, reduced: [15, 12, 0], country: 'Norway', currency: 'NOK', symbol: 'NOK', flag: '🇳🇴' },
    'FI': { standard: 25.5, reduced: [13.5, 10, 0], country: 'Finland', currency: '€', symbol: 'EUR', flag: '🇫🇮' }
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
    } else {
      setResults(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, country, calculationType]);

  const selectedCountry = VAT_RATES[country];

  const formatMoney = (value, currency) =>
    `${currency}${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const resultShareLines = results ? [
    `Country: ${VAT_RATES[country].flag} ${results.country}`,
    `VAT rate: ${results.vatRate}%`,
    `Calculation type: ${results.calculationType === 'exclusive' ? 'VAT exclusive' : 'VAT inclusive'}`,
    `Net amount (excl. VAT): ${formatMoney(results.netAmount, results.currency)}`,
    `VAT amount: ${formatMoney(results.vatAmount, results.currency)}`,
    `Gross amount (incl. VAT): ${formatMoney(results.grossAmount, results.currency)}`
  ] : [];

  return (
    <>
      <Head>
        <title>EU VAT Calculator | Free VAT Calculator for Europe | UK Germany France | Upaman</title>
        <meta name="description" content="Free VAT Calculator for European countries. Calculate VAT for the UK, Germany, France, and other supported European countries with inclusive and exclusive calculations." />
        <meta name="keywords" content="VAT calculator Europe, UK VAT calculator, Germany VAT calculator, France VAT calculator, EU VAT rates, value added tax calculator, business VAT calculator" />
        <link rel="canonical" href="https://upaman.com/eu-vat-calculator" />

        {/* Open Graph Tags */}
        <meta property="og:title" content="EU VAT Calculator | Free VAT Calculator for Europe" />
        <meta property="og:description" content="Calculate VAT for all European countries. UK 20%, Germany 19%, France 20%. Free VAT inclusive/exclusive calculator." />
        <meta property="og:url" content="https://upaman.com/eu-vat-calculator" />
        <meta property="og:type" content="website" />

        {/* Twitter Cards */}
        <meta name="twitter:title" content="EU VAT Calculator | Free European VAT Calculator" />
        <meta name="twitter:description" content="Calculate VAT for UK, Germany, France and all European countries. Free VAT calculator with latest rates." />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "European VAT Calculator",
            "description": "Calculate Value Added Tax (VAT) for supported European countries with configured rates",
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
              "Configured VAT rates by country",
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
                "name": "What VAT rate does this calculator use for the UK?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "This calculator uses a standard UK VAT rate of 20%. Reduced rates such as 5% and 0% may apply for specific goods and services."
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

      <CalcLayout
        eyebrow="Europe · VAT"
        title="European VAT Calculator"
        subtitle="Calculate VAT inclusive or exclusive amounts across 15+ European countries with current standard rates."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Input Panel */}
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <SelectField
                id="vat-country"
                label="Country"
                value={country}
                onChange={setCountry}
                options={Object.entries(VAT_RATES).map(([code, data]) => ({
                  value: code,
                  label: `${data.flag} ${data.country} (${data.standard}%)`
                }))}
              />

              <NumberField
                id="vat-amount"
                label={`Amount (${selectedCountry.currency})`}
                prefix={selectedCountry.currency}
                value={amount}
                onChange={setAmount}
                hint="Enter the amount to add or extract VAT from."
              />

              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink-soft dark:text-slate-300">Calculation type</span>
                <Tabs
                  tabs={[
                    { id: 'exclusive', label: 'VAT exclusive' },
                    { id: 'inclusive', label: 'VAT inclusive' }
                  ]}
                  active={calculationType}
                  onChange={setCalculationType}
                />
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-sm dark:border-teal-800/60 dark:bg-teal-900/20">
                <p className="font-semibold text-teal-800 dark:text-teal-300">{selectedCountry.flag} {selectedCountry.country}</p>
                <p className="mt-0.5 text-teal-700 dark:text-teal-400">
                  Standard VAT rate: {selectedCountry.standard}% · Currency: {selectedCountry.currency}
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
                  <ResultStat label="Gross (incl. VAT)" value={formatMoney(results.grossAmount, results.currency)} emphasis tone="positive" />
                  <ResultStat label={`VAT amount (${results.vatRate}%)`} value={formatMoney(results.vatAmount, results.currency)} />
                  <ResultStat label="Net (excl. VAT)" value={formatMoney(results.netAmount, results.currency)} />
                  <ResultStat label="Type" value={results.calculationType === 'exclusive' ? 'Exclusive' : 'Inclusive'} />
                </div>

                <Card className="p-5">
                  <PieBreakdownChart
                    title="Net amount vs VAT share"
                    items={[
                      { label: 'Net amount', value: results.netAmount, color: '#3b82f6' },
                      { label: 'VAT amount', value: results.vatAmount, color: '#f97316' }
                    ]}
                    formatter={(value) => formatMoney(value, results.currency)}
                  />
                </Card>

                <ResultActions
                  title={`${results.country} VAT calculation summary`}
                  summaryLines={resultShareLines}
                  fileName="upaman-eu-vat-summary.txt"
                />

                <AffiliateRecommendations calculatorType="vat" />
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter an amount to calculate VAT for {selectedCountry.country}.
              </Card>
            )}
          </div>
        </div>

        {/* VAT Rates Table */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">European VAT rates by country</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(VAT_RATES).map(([code, data]) => (
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
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-ink-soft dark:bg-slate-700 dark:text-slate-200">{data.standard}%</span>
                </div>
                <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
                  Currency: {data.currency} · Reduced: {data.reduced.join(', ')}%
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">VAT Calculator FAQ</h2>
          <div className="mt-4 grid gap-3">
            {[
              { q: 'What is VAT and how is it calculated?', a: 'VAT (Value Added Tax) is a consumption tax levied on goods and services. For VAT exclusive amounts, multiply by the VAT rate. For VAT inclusive amounts, divide by (1 + VAT rate).' },
              { q: 'Which European country has the highest VAT rate?', a: 'Finland has the highest standard VAT rate at 25.5%, followed by Denmark, Sweden, and Norway at 25%. Ireland and Portugal follow with 23%, while Switzerland has the lowest at 8.1%.' },
              { q: 'What is the difference between VAT exclusive and inclusive?', a: 'VAT exclusive means the price before VAT is added. VAT inclusive means the final price with VAT already included. Businesses often work with exclusive prices, while consumers see inclusive prices.' },
              { q: 'Are VAT rates the same for all products?', a: "No, most countries have reduced VAT rates for essential items like food, books, and medical supplies. Some items may be VAT-exempt (0%). Check your country's specific VAT rules." }
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
              'Country, amount, and calculation type (VAT exclusive or inclusive)'
            ]}
            formulas={[
              'VAT exclusive: VAT = net × rate; gross = net + VAT',
              'VAT inclusive: net = gross ÷ (1 + rate); VAT = gross − net'
            ]}
            assumptions={[
              'Uses each country’s standard VAT rate; reduced rates apply to specific goods and services',
              'Rates reflect current published standard rates and may change'
            ]}
            sources={[
              { label: 'EU VAT rates (European Commission)', url: 'https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en' },
              { label: 'UK VAT rates (gov.uk)', url: 'https://www.gov.uk/vat-rates' }
            ]}
          />
        </div>

        <div className="mt-8 text-center"><AdSenseAd /></div>
      
        <HowToSection
          name="How to use the European VAT Calculator"
          description="Add or extract VAT for any supported European country."
          steps={[
            { name: "Select the country", text: "Pick the country whose standard VAT rate applies." },
            { name: "Enter the amount", text: "Type the value you want to add or extract VAT from." },
            { name: "Choose inclusive or exclusive", text: "Decide whether VAT should be added to or removed from the amount." },
            { name: "Review the result", text: "See the net amount, VAT amount, and gross total." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default VATCalculator;
