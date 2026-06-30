import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import ResultActions from './ResultActions';
import { PieBreakdownChart } from './calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import { NumberField } from './ui/Field';
import Card from './ui/Card';
import { formatCurrency } from '../utils/calculations';

const getMonthlyPayment = (principal, annualRate, months) => {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
};

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

const USMortgageCalculator = () => {
  const [inputs, setInputs] = useState({
    homePrice: 450000,
    downPayment: 90000,
    interestRate: 6.75,
    loanTermYears: 30,
    propertyTaxRate: 1.1,
    homeInsuranceAnnual: 1800,
    hoaMonthly: 150,
    pmiRate: 0.6,
    monthlyGrossIncome: 9000
  });

  const results = useMemo(() => {
    const homePrice = Math.max(0, Number(inputs.homePrice) || 0);
    const downPayment = Math.max(0, Number(inputs.downPayment) || 0);
    const rate = Math.max(0, Number(inputs.interestRate) || 0);
    const years = Math.max(1, Math.floor(Number(inputs.loanTermYears) || 0));
    const taxRate = Math.max(0, Number(inputs.propertyTaxRate) || 0);
    const insuranceAnnual = Math.max(0, Number(inputs.homeInsuranceAnnual) || 0);
    const hoaMonthly = Math.max(0, Number(inputs.hoaMonthly) || 0);
    const pmiRate = Math.max(0, Number(inputs.pmiRate) || 0);
    const monthlyGrossIncome = Math.max(0, Number(inputs.monthlyGrossIncome) || 0);

    const loanAmount = Math.max(0, homePrice - downPayment);
    const termMonths = years * 12;
    const principalAndInterest = getMonthlyPayment(loanAmount, rate, termMonths);
    const propertyTaxMonthly = (homePrice * taxRate) / 100 / 12;
    const insuranceMonthly = insuranceAnnual / 12;
    const downPaymentPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
    const pmiMonthly = downPaymentPercent < 20 ? (loanAmount * pmiRate) / 100 / 12 : 0;
    const totalMonthlyPayment = principalAndInterest + propertyTaxMonthly + insuranceMonthly + hoaMonthly + pmiMonthly;

    const totalPrincipalAndInterestPaid = principalAndInterest * termMonths;
    const totalInterest = Math.max(0, totalPrincipalAndInterestPaid - loanAmount);
    const housingRatio = monthlyGrossIncome > 0 ? (totalMonthlyPayment / monthlyGrossIncome) * 100 : 0;
    const firstMonthInterest = loanAmount * (rate / 100 / 12);
    const firstMonthPrincipal = Math.max(0, principalAndInterest - firstMonthInterest);

    return {
      loanAmount,
      principalAndInterest,
      propertyTaxMonthly,
      insuranceMonthly,
      hoaMonthly,
      pmiMonthly,
      totalMonthlyPayment,
      totalInterest,
      downPaymentPercent,
      housingRatio,
      firstMonthPrincipal,
      firstMonthInterest
    };
  }, [inputs]);

  const summaryLines = [
    `Loan amount: ${formatUSD(results.loanAmount)}`,
    `Estimated monthly payment (PITI + HOA + PMI): ${formatUSD(results.totalMonthlyPayment)}`,
    `Principal & interest: ${formatUSD(results.principalAndInterest)}`,
    `Estimated total interest over term: ${formatUSD(results.totalInterest)}`,
    `Down payment: ${results.downPaymentPercent.toFixed(2)}%`,
    `Housing ratio (payment / gross income): ${results.housingRatio.toFixed(1)}%`
  ];

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <Head>
        <title>US Mortgage Calculator | Monthly Payment, PMI, Tax & Insurance | Upaman</title>
        <meta
          name="description"
          content="Free US mortgage calculator with principal and interest, property tax, homeowners insurance, HOA and PMI estimates."
        />
        <meta
          name="keywords"
          content="US mortgage calculator, monthly mortgage payment calculator, PMI calculator, PITI calculator, home loan calculator USA"
        />
        <link rel="canonical" href="https://upaman.com/us-mortgage-calculator" />
        <meta property="og:title" content="US Mortgage Calculator | Upaman" />
        <meta
          property="og:description"
          content="Estimate US mortgage payments with principal, interest, property tax, insurance, HOA and PMI."
        />
        <meta property="og:url" content="https://upaman.com/us-mortgage-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Mortgage Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Calculate monthly mortgage payment, PMI impact and first-month principal vs interest."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'US Mortgage Calculator',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              url: 'https://upaman.com/us-mortgage-calculator',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
      </Head>

      <CalcLayout
        eyebrow="United States"
        title="US Mortgage Calculator"
        subtitle="Estimate your monthly payment with principal, interest, property tax, insurance, HOA, and PMI."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="m-price" label="Home price" prefix="$" value={inputs.homePrice} onChange={(v) => set('homePrice', v)} />
              <NumberField id="m-down" label="Down payment" prefix="$" value={inputs.downPayment} onChange={(v) => set('downPayment', v)} />
              <NumberField id="m-rate" label="Interest rate (APR)" suffix="%" step={0.01} value={inputs.interestRate} onChange={(v) => set('interestRate', v)} />
              <NumberField id="m-term" label="Loan term" suffix="yrs" min={1} max={40} value={inputs.loanTermYears} onChange={(v) => set('loanTermYears', v)} />
              <NumberField id="m-tax" label="Property tax rate" suffix="%/yr" step={0.01} value={inputs.propertyTaxRate} onChange={(v) => set('propertyTaxRate', v)} />
              <NumberField id="m-ins" label="Home insurance" prefix="$" suffix="/yr" value={inputs.homeInsuranceAnnual} onChange={(v) => set('homeInsuranceAnnual', v)} />
              <NumberField id="m-hoa" label="HOA" prefix="$" suffix="/mo" value={inputs.hoaMonthly} onChange={(v) => set('hoaMonthly', v)} />
              <NumberField id="m-pmi" label="PMI rate (if <20% down)" suffix="%/yr" step={0.01} value={inputs.pmiRate} onChange={(v) => set('pmiRate', v)} />
              <NumberField id="m-income" label="Gross income" prefix="$" suffix="/mo" value={inputs.monthlyGrossIncome} onChange={(v) => set('monthlyGrossIncome', v)} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Total monthly" value={formatUSD(results.totalMonthlyPayment)} emphasis tone="positive" />
              <ResultStat label="Principal & interest" value={formatUSD(results.principalAndInterest)} />
              <ResultStat label="Property tax + insurance" value={formatUSD(results.propertyTaxMonthly + results.insuranceMonthly)} />
              <ResultStat label="PMI + HOA" value={formatUSD(results.pmiMonthly + results.hoaMonthly)} />
            </div>

            <Card className="p-5">
              <div className="space-y-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <p><strong className="font-semibold text-ink dark:text-white">Loan amount:</strong> {formatUSD(results.loanAmount)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">Estimated total interest:</strong> {formatUSD(results.totalInterest)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">First-month split:</strong> Principal {formatUSD(results.firstMonthPrincipal)} · Interest {formatUSD(results.firstMonthInterest)}</p>
                <p>
                  <strong className="font-semibold text-ink dark:text-white">Housing ratio:</strong> {results.housingRatio.toFixed(1)}%
                  {results.housingRatio > 28 ? ' (above common 28% guideline)' : ' (within common 28% guideline)'}
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <PieBreakdownChart
                title="Monthly payment composition"
                items={[
                  { label: 'Principal & interest', value: results.principalAndInterest, color: '#3b82f6' },
                  { label: 'Property tax', value: results.propertyTaxMonthly, color: '#f59e0b' },
                  { label: 'Insurance', value: results.insuranceMonthly, color: '#10b981' },
                  { label: 'HOA', value: results.hoaMonthly, color: '#8b5cf6' },
                  { label: 'PMI', value: results.pmiMonthly, color: '#ef4444' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <ResultActions title="US Mortgage Calculator Summary" summaryLines={summaryLines} fileName="us-mortgage-calculator-summary.txt" />
          </div>
        </div>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Home price, down payment, APR, term, tax rate, insurance, HOA, PMI rate',
              'Gross monthly income for housing ratio context'
            ]}
            formulas={[
              'Principal & interest: standard amortization mortgage payment formula',
              'Property tax monthly = home price × tax rate ÷ 12',
              'PMI estimate shown when down payment is below 20%',
              'Housing ratio = total monthly payment ÷ gross monthly income'
            ]}
            assumptions={[
              'Property tax and insurance are treated as fixed estimates',
              'PMI cancellation timing is not modeled here',
              'Actual lender costs and escrow rules vary by state and lender'
            ]}
            sources={[
              { label: 'Consumer Financial Protection Bureau (CFPB) - Mortgage basics', url: 'https://www.consumerfinance.gov/owning-a-home/' },
              { label: 'Fannie Mae - Loan-to-value and mortgage topics', url: 'https://singlefamily.fanniemae.com/' }
            ]}
          />
        </div>
      
        <HowToSection
          name="How to use the Mortgage Calculator"
          description="Estimate your monthly mortgage payment."
          steps={[
            { name: "Enter the home price", text: "Type the purchase price of the property." },
            { name: "Set the down payment", text: "Enter your down payment amount or percentage." },
            { name: "Set the rate and term", text: "Enter the interest rate and loan length in years." },
            { name: "Add taxes and insurance", text: "Include property tax, insurance, and HOA if relevant." },
            { name: "Review the payment", text: "See your monthly payment and total interest over the loan." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default USMortgageCalculator;
