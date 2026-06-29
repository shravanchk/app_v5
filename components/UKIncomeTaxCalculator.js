import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from './AffiliateRecommendations';
import AdSenseAd from './AdSenseAd';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import ResultActions from './ResultActions';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import { NumberField, SelectField } from './ui/Field';
import Card from './ui/Card';
const { calculateUKTax } = require('../utils/taxCalculations');

const UKIncomeTaxCalculator = () => {
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
      if (!income) {
        setResults(null);
        return;
      }

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

  const breakdownRow = (label, value, tone) => (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-ink-soft dark:text-slate-300">{label}</span>
      <span className={tone === 'minus' ? 'font-medium text-amber-700 dark:text-amber-400' : tone === 'plus' ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'font-semibold text-ink dark:text-white'}>{value}</span>
    </div>
  );

  return (
    <>
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

      <CalcLayout
        eyebrow="United Kingdom"
        title="UK Income Tax Calculator"
        subtitle="Estimate income tax, employee National Insurance, pension impact and student loan repayments for the 2026-27 tax year, including Scottish bands."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <NumberField id="uk-income" label="Annual gross income" prefix="£" value={income} onChange={setIncome} hint="Enter your gross salary to calculate" />
              <SelectField
                id="uk-region"
                label="UK region"
                value={region}
                onChange={setRegion}
                options={[
                  { value: 'england', label: 'England, Wales & NI' },
                  { value: 'scotland', label: 'Scotland (different rates)' }
                ]}
              />
              <NumberField id="uk-pension" label="Annual pension contribution" prefix="£" value={pensionContribution} onChange={setPensionContribution} />
              <SelectField
                id="uk-loan"
                label="Student loan plan"
                value={studentLoan}
                onChange={setStudentLoan}
                options={[
                  { value: 'none', label: 'No student loan' },
                  { value: 'plan1', label: 'Plan 1 (pre-2012)' },
                  { value: 'plan2', label: 'Plan 2 (2012 onwards)' },
                  { value: 'plan4', label: 'Plan 4 (Scotland)' },
                  { value: 'plan5', label: 'Plan 5 (2023 onwards)' },
                  { value: 'postgrad', label: 'Postgraduate loan' }
                ]}
              />
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-sm dark:border-teal-800/60 dark:bg-teal-900/20">
                <p className="font-semibold text-teal-800 dark:text-teal-300">2026-27 tax year</p>
                <p className="mt-0.5 text-teal-700 dark:text-teal-400">Personal Allowance £12,570 · rates apply from 6 April 2026.</p>
              </div>
            </div>
            <div className="mt-5"><AdSenseAd /></div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {results ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Annual take-home" value={formatGBP(results.netIncome)} emphasis tone="positive" />
                  <ResultStat label="Monthly take-home" value={formatGBP(results.monthlyNet)} />
                  <ResultStat label="Total tax & NI" value={formatGBP(results.totalTax)} />
                  <ResultStat label="Effective rate" value={`${results.effectiveRate.toFixed(1)}%`} />
                </div>

                <Card className="p-5">
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
                </Card>

                <Card className="p-5">
                  <ComparisonBars
                    title="Annual take-home vs tax burden"
                    items={[
                      { label: 'Annual take-home', value: results.netIncome, color: '#10b981' },
                      { label: 'Total deductions', value: results.totalDeductions, color: '#ef4444' }
                    ]}
                    formatter={formatGBP}
                  />
                </Card>

                <ResultActions
                  title="UK tax calculation summary (2026-27)"
                  summaryLines={resultShareLines}
                  fileName="upaman-uk-tax-2026-27-summary.txt"
                />

                <Card className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold text-ink hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"
                  >
                    {showBreakdown ? 'Hide' : 'Show'} detailed breakdown
                    <span className="text-ink-muted">{showBreakdown ? '–' : '+'}</span>
                  </button>
                  {showBreakdown && (
                    <div className="border-t border-slate-100 p-5 dark:border-slate-700">
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {breakdownRow('Gross income', formatGBP(results.grossIncome))}
                        {breakdownRow('Personal allowance', `-${formatGBP(results.personalAllowance)}`, 'plus')}
                        {results.pension > 0 && breakdownRow('Pension contribution', `-${formatGBP(results.pension)}`, 'plus')}
                        {breakdownRow('Income tax', `-${formatGBP(results.incomeTax)}`, 'minus')}
                        {breakdownRow('National Insurance', `-${formatGBP(results.nationalInsurance)}`, 'minus')}
                        {results.studentLoanRepayment > 0 && breakdownRow('Student loan repayment', `-${formatGBP(results.studentLoanRepayment)}`, 'minus')}
                        {breakdownRow('Net take-home', formatGBP(results.netIncome))}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
                        <p><span className="font-semibold text-ink dark:text-white">Effective rate:</span> {results.effectiveRate.toFixed(1)}%</p>
                        <p><span className="font-semibold text-ink dark:text-white">Marginal rate:</span> {results.marginalRate}%</p>
                        <p><span className="font-semibold text-ink dark:text-white">Weekly net:</span> {formatGBP(results.weeklyNet)}</p>
                        <p><span className="font-semibold text-ink dark:text-white">Region:</span> {region === 'scotland' ? 'Scotland' : 'England/Wales/NI'}</p>
                      </div>
                    </div>
                  )}
                </Card>

                <AffiliateRecommendations calculatorType="uk-tax" />
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your annual gross income to see your 2026-27 tax breakdown.
              </Card>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">UK Tax Calculator FAQ 2026-27</h2>
          <div className="mt-4 grid gap-3">
            {[
              { q: 'What is the Personal Allowance for 2026-27?', a: 'The standard Personal Allowance for 2026-27 is £12,570. This is the amount you can earn tax-free before paying income tax. However, it reduces by £1 for every £2 you earn over £100,000.' },
              { q: 'How do Scottish tax rates differ?', a: 'Scotland has 6 tax bands: Starter (19%), Basic (20%), Intermediate (21%), Higher (42%), Advanced (45%), and Top (48%). This differs from England/Wales/NI which have 3 bands: Basic (20%), Higher (40%), Additional (45%).' },
              { q: 'How is National Insurance calculated?', a: 'Employee Class 1 National Insurance category A is charged at 8% on earnings between £12,570 and £50,270, and 2% above £50,270. The threshold aligns with the Personal Allowance.' },
              { q: 'What are the different Student Loan plans?', a: 'Plan 1: £26,900 threshold. Plan 2: £29,385 threshold. Plan 4: £33,795 threshold. Plan 5 (2023+): £25,000 threshold. All charge 9% above threshold, except Postgraduate (6% above £21,000).' }
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
            title="2026-27 methodology and official sources"
            inputs={[
              'Annual gross income, region (England/Wales/NI or Scotland), pension contribution, student loan plan'
            ]}
            formulas={[
              'Personal Allowance taper applied above £100,000 adjusted net income',
              'Regional income-tax bands plus employee Class 1 NI category A (8% / 2%)',
              'Student loan repayment uses the annual threshold for the selected plan'
            ]}
            assumptions={[
              'Pension input reduces adjusted net income and take-home; actual payroll treatment varies by scheme',
              'Rates apply from 6 April 2026'
            ]}
            sources={[
              { label: 'UK Income Tax rates (gov.uk)', url: 'https://www.gov.uk/income-tax-rates' },
              { label: 'Scottish Income Tax (gov.uk)', url: 'https://www.gov.uk/scottish-income-tax' },
              { label: 'HMRC 2026-27 payroll thresholds', url: 'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027' },
              { label: 'Student-loan repayment thresholds', url: 'https://www.gov.uk/repaying-your-student-loan/what-you-pay' }
            ]}
          />
        </div>

        <div className="mt-8 text-center"><AdSenseAd /></div>
      </CalcLayout>
    </>
  );
};

export default UKIncomeTaxCalculator;
