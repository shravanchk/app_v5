import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import ResultActions from './ResultActions';
import { PieBreakdownChart } from './calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import { NumberField, SelectField } from './ui/Field';
import Card from './ui/Card';
import { formatINR } from '../utils/calculations';

const PPF_CONTRIBUTION_LIMIT = 150000;

const contributionModes = [
  { value: 'monthly', label: 'Monthly installments' },
  { value: 'yearly-start', label: 'Yearly lump sum (start of year)' },
  { value: 'yearly-end', label: 'Yearly lump sum (end of year)' },
];

const getClampedContribution = (value) => {
  const safeValue = Number(value) || 0;
  return Math.min(Math.max(safeValue, 0), PPF_CONTRIBUTION_LIMIT);
};

const calculatePPFProjection = ({ annualContribution, annualRate, tenureYears, annualStepUp, contributionMode }) => {
  const monthlyRate = (Number(annualRate) || 0) / 100 / 12;
  const years = Math.max(1, Math.floor(Number(tenureYears) || 0));
  const stepUp = Math.max(0, Number(annualStepUp) || 0) / 100;

  let runningBalance = 0;
  let currentContribution = getClampedContribution(annualContribution);
  const projection = [];

  for (let year = 1; year <= years; year += 1) {
    const openingBalance = runningBalance;
    let monthlyBalance = runningBalance;
    let yearlyContribution = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= 12; month += 1) {
      if (contributionMode === 'monthly') {
        const installment = currentContribution / 12;
        monthlyBalance += installment;
        yearlyContribution += installment;
      } else if (contributionMode === 'yearly-start' && month === 1) {
        monthlyBalance += currentContribution;
        yearlyContribution += currentContribution;
      }
      yearlyInterest += monthlyBalance * monthlyRate;
      if (contributionMode === 'yearly-end' && month === 12) {
        monthlyBalance += currentContribution;
        yearlyContribution += currentContribution;
      }
    }

    runningBalance = monthlyBalance + yearlyInterest;
    projection.push({ year, openingBalance, yearlyContribution, yearlyInterest, closingBalance: runningBalance, contributionUsed: currentContribution });
    currentContribution = getClampedContribution(currentContribution * (1 + stepUp));
  }

  const totalInvested = projection.reduce((sum, row) => sum + row.yearlyContribution, 0);
  const maturityValue = projection[projection.length - 1]?.closingBalance || 0;
  const totalInterest = maturityValue - totalInvested;

  return { projection, summary: { totalInvested, maturityValue, totalInterest, finalAnnualContribution: projection[projection.length - 1]?.contributionUsed || 0 } };
};

const softwareSchema = {
  '@context': 'https://schema.org', '@type': 'WebApplication', name: 'PPF Calculator India - Upaman',
  url: 'https://upaman.com/ppf-calculator', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  featureList: ['PPF maturity calculator', 'Year-wise projection table', 'Interest breakdown', 'Annual step-up option'],
};

const PPFCalculator = () => {
  const [inputs, setInputs] = useState({ annualContribution: 150000, annualRate: 7.1, tenureYears: 15, annualStepUp: 0, contributionMode: 'monthly' });
  const [showFullProjection, setShowFullProjection] = useState(false);
  const results = useMemo(() => calculatePPFProjection(inputs), [inputs]);

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));
  const num = (v) => parseFloat(v) || 0;

  const projectionRows = showFullProjection ? results.projection : results.projection.slice(0, 15);
  const hasContributionCap = Number(inputs.annualContribution) > PPF_CONTRIBUTION_LIMIT;
  const ppfShareLines = [
    `Total investment: ${formatINR(results.summary.totalInvested)}`,
    `Estimated maturity value: ${formatINR(results.summary.maturityValue)}`,
    `Estimated total interest: ${formatINR(results.summary.totalInterest)}`,
    `Final annual contribution used: ${formatINR(results.summary.finalAnnualContribution)}`,
  ];

  return (
    <>
      <Head>
        <title>PPF Calculator India 2026 | Maturity &amp; Interest Projection | Upaman</title>
        <meta name="description" content="Free PPF calculator for India. Estimate maturity value, yearly interest accrual and full contribution projection with annual step-up and contribution mode options." />
        <meta name="keywords" content="PPF calculator India, PPF maturity calculator, public provident fund interest calculator, PPF yearly projection, PPF 15 year calculation" />
        <link rel="canonical" href="https://upaman.com/ppf-calculator" />
        <meta property="og:title" content="PPF Calculator India | Upaman" />
        <meta property="og:description" content="Calculate Public Provident Fund maturity value, total investment and interest with a detailed year-wise projection." />
        <meta property="og:url" content="https://upaman.com/ppf-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      </Head>

      <CalcLayout eyebrow="Investing" title="PPF Calculator" subtitle="Estimate your Public Provident Fund maturity value and interest, with a full year-by-year projection. Current rate: 7.1% p.a.">
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <NumberField id="ppf-amt" label="Annual contribution" prefix="₹" value={inputs.annualContribution} onChange={(v) => set('annualContribution', num(v))} hint={hasContributionCap ? 'Capped at ₹1,50,000 per year in the projection.' : 'Maximum eligible: ₹1,50,000 per year.'} />
              <NumberField id="ppf-rate" label="Interest rate (p.a.)" suffix="%" step={0.1} value={inputs.annualRate} onChange={(v) => set('annualRate', num(v))} />
              <NumberField id="ppf-yrs" label="Tenure" suffix="yrs" value={inputs.tenureYears} onChange={(v) => set('tenureYears', num(v))} hint="PPF has a 15-year lock-in, extendable in 5-year blocks." />
              <NumberField id="ppf-step" label="Annual step-up (optional)" suffix="%" step={1} value={inputs.annualStepUp} onChange={(v) => set('annualStepUp', num(v))} />
              <SelectField id="ppf-mode" label="Contribution mode" value={inputs.contributionMode} onChange={(v) => set('contributionMode', v)} options={contributionModes} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Maturity value" value={formatINR(results.summary.maturityValue)} emphasis tone="positive" />
              <ResultStat label="Total invested" value={formatINR(results.summary.totalInvested)} />
              <ResultStat label="Total interest" value={formatINR(results.summary.totalInterest)} />
              <ResultStat label="Final annual contribution" value={formatINR(results.summary.finalAnnualContribution)} />
            </div>
            <Card className="p-5">
              <PieBreakdownChart title="Investment vs interest" items={[{ label: 'Total invested', value: results.summary.totalInvested, color: '#3b82f6' }, { label: 'Total interest', value: results.summary.totalInterest, color: '#10b981' }]} formatter={formatINR} />
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-ink dark:border-slate-700 dark:text-slate-100">Year-by-year projection</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted dark:bg-slate-800/60">
                      <th className="px-4 py-2 font-semibold">Year</th>
                      <th className="px-4 py-2 font-semibold">Contribution</th>
                      <th className="px-4 py-2 font-semibold">Interest</th>
                      <th className="px-4 py-2 font-semibold">Closing balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectionRows.map((row) => (
                      <tr key={row.year} className="border-t border-slate-100 dark:border-slate-700/60">
                        <td className="px-4 py-2">{row.year}</td>
                        <td className="px-4 py-2">{formatINR(row.yearlyContribution)}</td>
                        <td className="px-4 py-2 text-emerald-600 dark:text-emerald-400">{formatINR(row.yearlyInterest)}</td>
                        <td className="px-4 py-2 font-medium">{formatINR(row.closingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {results.projection.length > 15 && (
                <button type="button" onClick={() => setShowFullProjection((s) => !s)} className="w-full border-t border-slate-100 px-5 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:bg-slate-800">
                  {showFullProjection ? 'Show first 15 years' : 'Show full projection'}
                </button>
              )}
            </Card>

            <ResultActions title="PPF projection summary" summaryLines={ppfShareLines} fileName="upaman-ppf-summary.txt" />
          </div>
        </div>

        <div className="mt-10">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            reviewedOn="June 28, 2026"
            inputs={['Annual contribution, annual interest rate, tenure, contribution mode, and optional annual step-up', 'Contribution cap applied as per current PPF annual limit']}
            formulas={['Monthly accrual approximation with annual interest crediting', 'Year-wise rolling balance: opening + contribution + accrued interest']}
            assumptions={['Yearly contribution used for projection is capped at ₹1,50,000', 'Interest rate is assumed constant for the selected tenure', 'This is a planning projection and may differ from official passbook posting logic']}
            sources={[{ label: 'National Savings Institute (PPF scheme)', url: 'https://www.nsiindia.gov.in/' }, { label: 'India Post - Public Provident Fund', url: 'https://www.indiapost.gov.in/' }]}
            guideLinks={[{ label: 'PPF vs SIP choice guide', href: '/guide-ppf-vs-sip-choice.html' }, { label: 'SIP step-up planning guide', href: '/guide-sip-step-up-planning.html' }]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default PPFCalculator;
