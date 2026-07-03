import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import { NumberField, SelectField } from '../ui/Field';
import Card from '../ui/Card';
import { CPI_YEARS, CPI_FIRST_YEAR, CPI_LATEST_YEAR, adjustForInflation } from '../../utils/quickCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'How is inflation calculated here?', answer: `This calculator uses the Consumer Price Index for All Urban Consumers (CPI-U) annual averages published by the U.S. Bureau of Labor Statistics, covering ${CPI_FIRST_YEAR} through ${CPI_LATEST_YEAR}. The adjusted amount is your dollars multiplied by the ratio of the two years' index values.` },
  { question: 'What does “buying power” mean?', answer: 'Buying power is what your money can actually purchase. If prices double, each dollar buys half as much — its buying power fell 50% even though the dollar amount didn’t change.' },
  { question: 'When was US inflation the highest?', answer: 'The modern peak was 1980, when CPI inflation averaged about 13.5% during the oil-shock era. More recently, 2022 saw roughly 8% — the highest since 1981. The Federal Reserve targets 2% per year.' },
  { question: 'Why doesn’t this match my personal cost increases?', answer: 'CPI tracks an average urban basket of goods and services. Your personal inflation depends on what you buy — housing, healthcare, and college have outpaced average CPI for decades, while electronics have gotten cheaper.' }
];

const fmtUSD = (v, digits = 2) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

// Two animated bars: the same buying power expressed in each year's dollars.
function ValueBars({ amount, adjusted, fromYear, toYear }) {
  const max = Math.max(amount, adjusted) || 1;
  const rows = [
    { label: `${fmtUSD(amount, amount % 1 ? 2 : 0)} in ${fromYear}`, value: amount, cls: 'bg-sky-400 dark:bg-sky-500' },
    { label: `${fmtUSD(adjusted)} in ${toYear}`, value: adjusted, cls: 'bg-emerald-400 dark:bg-emerald-500' }
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <p className="mb-1 text-sm font-medium text-ink-soft dark:text-slate-300">{r.label}</p>
          <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
            <div
              className={`h-full rounded-full ${r.cls} transition-[width] duration-700 ease-out`}
              style={{ width: `${Math.max((r.value / max) * 100, 2)}%` }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-ink-muted dark:text-slate-500">Same buying power, expressed in each year&apos;s dollars.</p>
    </div>
  );
}

const InflationCalculator = () => {
  const [amount, setAmount] = useState('100');
  const [fromYear, setFromYear] = useState('2000');
  const [toYear, setToYear] = useState(String(CPI_LATEST_YEAR));

  const yearOptions = useMemo(() => [...CPI_YEARS].reverse().map((y) => ({ value: String(y), label: String(y) })), []);

  const result = useMemo(() => adjustForInflation({
    amount: parseFloat(amount) || 0,
    fromYear: parseInt(fromYear, 10),
    toYear: parseInt(toYear, 10)
  }), [amount, fromYear, toYear]);

  const amt = parseFloat(amount) || 0;
  const hasResult = result && amt > 0;

  const milestones = useMemo(() => {
    const to = parseInt(toYear, 10);
    return [1950, 1970, 1990, 2000, 2010, 2020]
      .filter((y) => y !== to)
      .map((y) => ({ year: y, r: adjustForInflation({ amount: 100, fromYear: y, toYear: to }) }))
      .filter((m) => m.r);
  }, [toYear]);

  const shareLines = hasResult ? [
    `${fmtUSD(amt)} in ${fromYear} = ${fmtUSD(result.adjusted)} in ${toYear}`,
    `Total price change: ${result.totalChangePct >= 0 ? '+' : ''}${result.totalChangePct.toFixed(1)}%`,
    `Average inflation: ${result.avgAnnualPct.toFixed(2)}% per year`,
    `Source: BLS CPI-U annual averages`
  ] : [];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'US Inflation Calculator',
    url: 'https://upaman.com/inflation-calculator',
    description: `Adjust US dollars for inflation between any two years from ${CPI_FIRST_YEAR} to ${CPI_LATEST_YEAR} using official BLS CPI-U data.`,
    applicationCategory: 'FinanceApplication',
    priceCurrency: 'USD',
    featureList: [`CPI-U data ${CPI_FIRST_YEAR}–${CPI_LATEST_YEAR}`, 'Works in both directions', 'Average annual inflation rate', 'Buying-power comparison', 'Decade milestones']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'US Calculators', item: 'https://upaman.com/us-calculators' },
    { name: 'US Inflation Calculator', item: 'https://upaman.com/inflation-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>{`US Inflation Calculator | Dollar Value ${CPI_FIRST_YEAR}–${CPI_LATEST_YEAR} | Upaman`}</title>
        <meta name="description" content={`Free US inflation calculator using official BLS CPI data: see what dollars from any year ${CPI_FIRST_YEAR}–${CPI_LATEST_YEAR} are worth today, total price change, and the average annual inflation rate.`} />
        <meta name="keywords" content="inflation calculator, US inflation calculator, CPI calculator, dollar value over time, buying power calculator, inflation rate calculator" />
        <link rel="canonical" href="https://upaman.com/inflation-calculator" />
        <meta property="og:title" content="US Inflation Calculator | Upaman" />
        <meta property="og:description" content={`What are old dollars worth today? CPI-U data ${CPI_FIRST_YEAR}–${CPI_LATEST_YEAR}.`} />
        <meta property="og:url" content="https://upaman.com/inflation-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="US Inflation Calculator | Upaman" />
        <meta name="twitter:description" content={`Dollar value between any two years, ${CPI_FIRST_YEAR}–${CPI_LATEST_YEAR}.`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="United States · Money"
        title="US Inflation Calculator"
        subtitle={`Convert dollars between any two years from ${CPI_FIRST_YEAR} to ${CPI_LATEST_YEAR} using official CPI data — and see how buying power has changed.`}
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <NumberField id="inf-amount" label="Amount" prefix="$" value={amount} onChange={setAmount} min={0} />
              <SelectField id="inf-from" label="From year" value={fromYear} onChange={setFromYear} options={yearOptions} />
              <SelectField id="inf-to" label="To year" value={toYear} onChange={setToYear} options={yearOptions} />
              <button
                type="button"
                onClick={() => { setFromYear(toYear); setToYear(fromYear); }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-brand-300"
              >
                <ArrowLeftRight size={15} /> Swap years
              </button>
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 text-sm dark:border-sky-800/60 dark:bg-sky-900/20">
                <p className="font-semibold text-sky-800 dark:text-sky-300">Official data</p>
                <p className="mt-0.5 text-sky-700 dark:text-sky-400">
                  CPI-U annual averages from the U.S. Bureau of Labor Statistics, {CPI_FIRST_YEAR}–{CPI_LATEST_YEAR}.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {hasResult ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label={`Worth in ${toYear}`} value={fmtUSD(result.adjusted)} emphasis tone="positive" />
                  <ResultStat label="Total price change" value={`${result.totalChangePct >= 0 ? '+' : ''}${result.totalChangePct.toFixed(1)}%`} />
                  <ResultStat label="Average per year" value={`${result.avgAnnualPct.toFixed(2)}%`} />
                  <ResultStat label="Dollar buying power" value={`${result.buyingPowerRatio - 1 >= 0 ? '+' : ''}${((result.buyingPowerRatio - 1) * 100).toFixed(1)}%`} />
                </div>

                <Card className="p-5">
                  <h3 className="mb-4 font-display text-base font-bold text-ink dark:text-white">Same money, different years</h3>
                  <ValueBars amount={amt} adjusted={result.adjusted} fromYear={fromYear} toYear={toYear} />
                </Card>

                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">What $100 from past decades is worth in {toYear}</h3>
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                    {milestones.map(({ year, r }) => (
                      <div key={year} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-ink-soft dark:text-slate-300">$100 in {year}</span>
                        <span className="font-medium text-ink dark:text-white">{fmtUSD(r.adjusted)}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <ResultActions
                  title={`Inflation: ${fromYear} → ${toYear}`}
                  summaryLines={shareLines}
                  fileName="upaman-inflation-summary.txt"
                />

                <p className="text-sm text-ink-muted dark:text-slate-400">
                  Beat inflation by investing — try the{' '}
                  <Link href="/compound-interest-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">compound interest calculator</Link>{' '}
                  or check your real take-home with the{' '}
                  <Link href="/us-paycheck-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">US paycheck calculator</Link>.
                </p>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter an amount and two years to compare dollar values.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the US Inflation Calculator"
          description="Compare dollar values across years in three steps."
          steps={[
            { name: 'Enter a dollar amount', text: 'Any amount — a salary, a price, a gift, or an old bill.' },
            { name: 'Pick the two years', text: `Choose any years from ${CPI_FIRST_YEAR} to ${CPI_LATEST_YEAR}; use Swap to flip the direction.` },
            { name: 'Read the result', text: 'You get the equivalent amount, the total price change, and the average annual inflation rate between those years.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Inflation FAQ</h2>
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
            title="Data and methodology"
            inputs={['Dollar amount, start year, end year']}
            formulas={[
              'Adjusted amount = amount × (CPI in end year ÷ CPI in start year)',
              'Average annual rate = (CPI ratio)^(1/years) − 1',
              'CPI-U annual averages (all items, U.S. city average), not seasonally adjusted'
            ]}
            assumptions={[
              `Annual average index values — a specific month in a year can differ slightly`,
              `${CPI_LATEST_YEAR} is the latest complete annual average; data is reviewed when BLS publishes each new year`,
              'CPI reflects an average urban consumption basket, not any individual’s spending'
            ]}
            sources={[
              { label: 'BLS — Consumer Price Index (CPI-U)', url: 'https://www.bls.gov/cpi/' },
              { label: 'BLS — CPI inflation calculator', url: 'https://www.bls.gov/data/inflation_calculator.htm' },
              { label: 'Federal Reserve — Why 2% inflation target', url: 'https://www.federalreserve.gov/faqs/economy_14400.htm' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default InflationCalculator;
