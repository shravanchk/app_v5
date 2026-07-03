import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import { PieBreakdownChart } from '../calculator/ResultVisualizations';
import { NumberField, SelectField } from '../ui/Field';
import Card from '../ui/Card';
import { COMPOUND_FREQUENCIES, computeCompoundGrowth } from '../../utils/quickCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'What is compound interest?', answer: 'Compound interest is interest earned on both your original money and on interest already earned. Each period the balance grows, so the next period’s interest is calculated on a larger amount — that is why growth accelerates over time.' },
  { question: 'How often should interest compound?', answer: 'More frequent compounding grows money slightly faster at the same nominal rate: $10,000 at 5% for 10 years becomes $16,289 compounded annually vs $16,470 compounded monthly. The difference is real but small — the rate and time matter far more.' },
  { question: 'What is the Rule of 72?', answer: 'Divide 72 by your annual return to estimate how many years it takes money to double. At 8%, money doubles roughly every 9 years; at 6%, every 12 years.' },
  { question: 'Does this calculator include taxes or inflation?', answer: 'No — results are pre-tax, nominal returns. Interest in taxable accounts is usually taxed yearly, and inflation reduces buying power. Pair this with the inflation calculator to see results in today’s dollars.' }
];

const fmtUSD = (v, digits = 0) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

// Animated stacked column chart: contributions vs interest per year.
function GrowthBars({ yearly, principal }) {
  if (!yearly.length) return null;
  const max = yearly[yearly.length - 1].balance;
  const shown = yearly.length > 40 ? yearly.filter((y, i) => i % 2 === 1 || i === yearly.length - 1) : yearly;
  return (
    <div>
      <div className="flex h-44 items-end gap-[3px]" role="img" aria-label="Balance growth by year">
        {shown.map((y) => (
          <div key={y.year} className="group relative flex h-full flex-1 flex-col justify-end" title={`Year ${y.year}: ${fmtUSD(y.balance)}`}>
            <div
              className="w-full rounded-t-sm bg-emerald-400 transition-[height] duration-700 ease-out dark:bg-emerald-500"
              style={{ height: `${Math.max((y.interest / max) * 100, 0)}%` }}
            />
            <div
              className="w-full bg-violet-400 transition-[height] duration-700 ease-out dark:bg-violet-500"
              style={{ height: `${(y.contributed / max) * 100}%` }}
            />
            <div
              className="w-full rounded-b-sm bg-sky-400 transition-[height] duration-700 ease-out dark:bg-sky-500"
              style={{ height: `${(principal / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-muted dark:text-slate-500">
        <span>Year 1</span>
        <span>Year {yearly[yearly.length - 1].year}</span>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" /> Initial deposit</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-400" /> Contributions</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Interest earned</span>
      </div>
    </div>
  );
}

const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState('10000');
  const [monthly, setMonthly] = useState('200');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('20');
  const [frequency, setFrequency] = useState('monthly');

  const result = useMemo(() => computeCompoundGrowth({
    principal: parseFloat(principal) || 0,
    monthlyContribution: parseFloat(monthly) || 0,
    annualRatePct: parseFloat(rate) || 0,
    years: parseFloat(years) || 0,
    frequency
  }), [principal, monthly, rate, years, frequency]);

  const hasResult = result.yearly.length > 0 && result.finalBalance > 0;
  const growthMultiple = result.principal + result.totalContributions > 0
    ? result.finalBalance / (result.principal + result.totalContributions)
    : 0;
  const doublingYears = parseFloat(rate) > 0 ? 72 / parseFloat(rate) : null;

  const shareLines = hasResult ? [
    `Initial deposit: ${fmtUSD(result.principal)}`,
    `Monthly contribution: ${fmtUSD(parseFloat(monthly) || 0)}`,
    `Annual rate: ${rate}% compounded ${frequency}`,
    `Time: ${years} years`,
    `Total contributions: ${fmtUSD(result.totalContributions)}`,
    `Interest earned: ${fmtUSD(result.totalInterest)}`,
    `Final balance: ${fmtUSD(result.finalBalance)}`
  ] : [];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Compound Interest Calculator',
    url: 'https://upaman.com/compound-interest-calculator',
    description: 'Free compound interest calculator with monthly contributions, five compounding frequencies, and a year-by-year growth chart and table.',
    applicationCategory: 'FinanceApplication',
    priceCurrency: 'USD',
    featureList: ['Monthly contributions', 'Daily to annual compounding', 'Year-by-year growth chart', 'Interest vs contributions breakdown', 'Rule of 72 doubling time']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'US Calculators', item: 'https://upaman.com/us-calculators' },
    { name: 'Compound Interest Calculator', item: 'https://upaman.com/compound-interest-calculator' }
  ]);

  // Show every year up to 15 years, then every 5th (always include the last).
  const tableRows = result.yearly.filter((y, i, arr) =>
    arr.length <= 15 || y.year % 5 === 0 || i === arr.length - 1);

  return (
    <>
      <Head>
        <title>Compound Interest Calculator | Daily, Monthly & Annual Compounding | Upaman</title>
        <meta name="description" content="Free compound interest calculator: see how your savings grow with monthly contributions and daily, monthly, quarterly, or annual compounding. Year-by-year chart and table included." />
        <meta name="keywords" content="compound interest calculator, compound interest formula, interest calculator, savings growth calculator, monthly compound interest, investment calculator" />
        <link rel="canonical" href="https://upaman.com/compound-interest-calculator" />
        <meta property="og:title" content="Compound Interest Calculator | Upaman" />
        <meta property="og:description" content="See how savings grow with contributions and compounding — year-by-year chart and table." />
        <meta property="og:url" content="https://upaman.com/compound-interest-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Compound Interest Calculator | Upaman" />
        <meta name="twitter:description" content="Savings growth with contributions and compounding, year by year." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Savings · Investing"
        title="Compound Interest Calculator"
        subtitle="See how an initial deposit plus regular contributions grows over time — with compounding from daily to annually and a year-by-year breakdown."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <NumberField id="ci-principal" label="Initial deposit" prefix="$" value={principal} onChange={setPrincipal} min={0} />
              <NumberField id="ci-monthly" label="Monthly contribution" prefix="$" value={monthly} onChange={setMonthly} min={0} hint="Added at the end of each month." />
              <NumberField id="ci-rate" label="Annual interest rate" suffix="%" value={rate} onChange={setRate} min={0} max={50} step={0.1} hint="E.g. 4–5% for HYSA, ~7% for a stock-index long-term average." />
              <NumberField id="ci-years" label="Years" value={years} onChange={setYears} min={1} max={60} />
              <SelectField
                id="ci-frequency"
                label="Compounding frequency"
                value={frequency}
                onChange={setFrequency}
                options={COMPOUND_FREQUENCIES.map((f) => ({ value: f.value, label: f.label }))}
              />
              {doublingYears ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-sm dark:border-emerald-800/60 dark:bg-emerald-900/20">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">Rule of 72</p>
                  <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                    At {rate}%, money doubles roughly every {doublingYears.toFixed(doublingYears < 10 ? 1 : 0)} years.
                  </p>
                </div>
              ) : null}
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {hasResult ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label={`Balance after ${result.yearly[result.yearly.length - 1].year} years`} value={fmtUSD(result.finalBalance)} emphasis tone="positive" />
                  <ResultStat label="Interest earned" value={fmtUSD(result.totalInterest)} />
                  <ResultStat label="Total invested" value={fmtUSD(result.principal + result.totalContributions)} />
                  <ResultStat label="Growth multiple" value={`${growthMultiple.toFixed(2)}×`} />
                </div>

                <Card className="p-5">
                  <h3 className="mb-4 font-display text-base font-bold text-ink dark:text-white">Growth year by year</h3>
                  <GrowthBars yearly={result.yearly} principal={result.principal} />
                </Card>

                <Card className="p-5">
                  <PieBreakdownChart
                    title="Where the final balance comes from"
                    items={[
                      { label: 'Initial deposit', value: result.principal, color: '#38bdf8' },
                      { label: 'Contributions', value: result.totalContributions, color: '#a78bfa' },
                      { label: 'Interest earned', value: result.totalInterest, color: '#34d399' }
                    ].filter((i) => i.value > 0)}
                    formatter={(v) => fmtUSD(v)}
                  />
                </Card>

                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Yearly schedule</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-ink-muted dark:border-slate-700 dark:text-slate-400">
                          <th className="py-2 pr-3 font-semibold">Year</th>
                          <th className="py-2 pr-3 font-semibold">Contributed</th>
                          <th className="py-2 pr-3 font-semibold">Interest</th>
                          <th className="py-2 font-semibold">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/70">
                        {tableRows.map((y) => (
                          <tr key={y.year}>
                            <td className="py-2 pr-3 text-ink-soft dark:text-slate-300">{y.year}</td>
                            <td className="py-2 pr-3 text-ink-soft dark:text-slate-300">{fmtUSD(y.principal + y.contributed)}</td>
                            <td className="py-2 pr-3 text-emerald-700 dark:text-emerald-400">{fmtUSD(y.interest)}</td>
                            <td className="py-2 font-medium text-ink dark:text-white">{fmtUSD(y.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <ResultActions
                  title="Compound interest projection"
                  summaryLines={shareLines}
                  fileName="upaman-compound-interest-summary.txt"
                />

                <p className="text-sm text-ink-muted dark:text-slate-400">
                  Planning retirement savings? Try the{' '}
                  <Link href="/us-401k-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">401(k) calculator</Link>{' '}
                  or check what inflation does to those dollars with the{' '}
                  <Link href="/inflation-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">US inflation calculator</Link>.
                </p>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter a deposit, rate, and time period to project growth.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the Compound Interest Calculator"
          description="Project savings growth in four steps."
          steps={[
            { name: 'Enter your starting amount', text: 'Type the amount you are investing or saving today — zero is fine if you are starting from scratch.' },
            { name: 'Add a monthly contribution', text: 'Regular contributions usually end up mattering more than the starting amount.' },
            { name: 'Set the rate and time', text: 'Use your account’s APY, or a long-term market average for investments, and how many years you’ll let it grow.' },
            { name: 'Read the breakdown', text: 'The chart splits your final balance into deposits, contributions, and interest — and the table shows every year.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Compound Interest FAQ</h2>
          <div className="mt-4 grid gap-3">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology"
            inputs={['Initial deposit, monthly contribution, annual nominal rate, years, compounding frequency (daily to annually)']}
            formulas={[
              'A = P(1 + r/n)^(nt) for the lump sum, where n is compounds per year',
              'Contributions are simulated month by month at the equivalent monthly rate (1 + r/n)^(n/12) − 1, added at month-end',
              'Rule of 72 doubling estimate: 72 ÷ annual rate'
            ]}
            assumptions={[
              'Constant rate for the whole period — real investment returns vary year to year',
              'Nominal, pre-tax results; taxes and inflation are not deducted',
              'Contributions are made at the end of each month'
            ]}
            sources={[
              { label: 'SEC Investor.gov — Compound interest calculator & definitions', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
              { label: 'FDIC — How interest and APY work', url: 'https://www.fdic.gov/resources/consumers/' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default CompoundInterestCalculator;
