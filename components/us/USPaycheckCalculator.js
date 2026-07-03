import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import { PieBreakdownChart } from '../calculator/ResultVisualizations';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import {
  computePaycheck, US_STATES, FILING_STATUSES, PAY_FREQUENCIES, FICA_2026, stateSlug
} from '../../utils/usPaycheckCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'How is take-home pay calculated?', answer: 'Gross salary minus federal income tax (2026 brackets and standard deduction), Social Security (6.2% up to the wage base), Medicare (1.45% plus 0.9% on high incomes), state income tax where applicable, and any pre-tax 401(k) contribution.' },
  { question: 'Which states have no income tax?', answer: 'Nine states levy no tax on wages: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. Your take-home pay there is reduced only by federal taxes and FICA.' },
  { question: 'Does a 401(k) contribution reduce my taxes?', answer: 'Traditional 401(k) contributions are deducted before federal and state income tax, so they lower those taxes — but not Social Security or Medicare, which apply to your full wages.' },
  { question: 'Why is my actual paycheck different?', answer: 'This is a planning estimate. Real paychecks also reflect W-4 withholding choices, health/dental premiums, HSA/FSA contributions, local city taxes (e.g., NYC), state disability/family-leave programs, and bonuses. Withholding also differs from your final tax bill.' }
];

// Animated "where each $100 goes" stacked bar.
const SEGMENTS = [
  { key: 'net', label: 'Take-home', cls: 'bg-emerald-400' },
  { key: 'federal', label: 'Federal tax', cls: 'bg-amber-400' },
  { key: 'fica', label: 'FICA', cls: 'bg-sky-400' },
  { key: 'state', label: 'State tax', cls: 'bg-rose-400' },
  { key: 'retirement', label: '401(k)', cls: 'bg-violet-400' }
];

function HundredBar({ result }) {
  const parts = {
    net: result.netAnnual,
    federal: result.federalTax,
    fica: result.socialSecurity + result.medicare,
    state: result.stateTax,
    retirement: result.retirement
  };
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
        {SEGMENTS.map((s) => (
          <div
            key={s.key}
            className={`h-full ${s.cls} transition-[width] duration-700 ease-out`}
            style={{ width: `${(parts[s.key] / result.grossAnnual) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {SEGMENTS.filter((s) => parts[s.key] > 0).map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-ink-muted dark:text-slate-400">
            <span className={`h-2 w-2 rounded-full ${s.cls}`} />
            {s.label} · ${((parts[s.key] / result.grossAnnual) * 100).toFixed(1)}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-muted dark:text-slate-500">Of every $100 you earn.</p>
    </div>
  );
}

const fmtUSD = (v, digits = 0) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

const USPaycheckCalculator = () => {
  const [salary, setSalary] = useState('75000');
  const [stateCode, setStateCode] = useState('TX');
  const [filingStatus, setFilingStatus] = useState('single');
  const [frequency, setFrequency] = useState('monthly');
  const [retirementPct, setRetirementPct] = useState('0');

  const result = useMemo(() => computePaycheck({
    grossAnnual: parseFloat(salary) || 0,
    stateCode,
    filingStatus,
    retirementPct: parseFloat(retirementPct) || 0
  }), [salary, stateCode, filingStatus, retirementPct]);

  const periods = PAY_FREQUENCIES.find((f) => f.value === frequency).periods;
  const st = US_STATES[stateCode];

  const shareLines = result ? [
    `Gross annual salary: ${fmtUSD(result.grossAnnual)}`,
    `State: ${st.name}`,
    `Filing status: ${FILING_STATUSES.find((f) => f.value === filingStatus).label}`,
    `Federal income tax: ${fmtUSD(result.federalTax)}`,
    `Social Security + Medicare: ${fmtUSD(result.socialSecurity + result.medicare)}`,
    `State income tax: ${fmtUSD(result.stateTax)}`,
    `Annual take-home: ${fmtUSD(result.netAnnual)}`,
    `Effective tax rate: ${result.effectiveRate.toFixed(1)}%`
  ] : [];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'US Paycheck Calculator',
    url: 'https://upaman.com/us-paycheck-calculator',
    description: 'Estimate US take-home pay after federal tax, Social Security, Medicare, and state income tax for all 50 states and D.C. (2026 tax year).',
    applicationCategory: 'FinanceApplication',
    priceCurrency: 'USD',
    featureList: ['2026 federal brackets and standard deduction', 'All 50 states + D.C.', 'FICA incl. additional Medicare tax', 'Pre-tax 401(k) handling', 'Weekly to annual pay views']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'US Calculators', item: 'https://upaman.com/us-calculators' },
    { name: 'US Paycheck Calculator', item: 'https://upaman.com/us-paycheck-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>US Paycheck Calculator 2026 | Take-Home Pay by State | Upaman</title>
        <meta name="description" content="Free US paycheck calculator for 2026: take-home pay after federal income tax, Social Security, Medicare, and state tax — all 50 states + D.C., with 401(k) and filing-status options." />
        <meta name="keywords" content="paycheck calculator, take home pay calculator, salary after taxes, US tax calculator 2026, net pay calculator, take home pay by state" />
        <link rel="canonical" href="https://upaman.com/us-paycheck-calculator" />
        <meta property="og:title" content="US Paycheck Calculator 2026 | Take-Home Pay by State | Upaman" />
        <meta property="og:description" content="Take-home pay after federal, FICA, and state taxes for all 50 states + D.C." />
        <meta property="og:url" content="https://upaman.com/us-paycheck-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Paycheck Calculator 2026 | Upaman" />
        <meta name="twitter:description" content="Take-home pay after federal, FICA, and state taxes — every state." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="United States · Salary"
        title="US Paycheck Calculator"
        subtitle="See your 2026 take-home pay after federal income tax, Social Security, Medicare, and state tax — for any state, filing status, and 401(k) contribution."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <NumberField id="pc-salary" label="Annual gross salary" prefix="$" value={salary} onChange={setSalary} min={0} hint="Before taxes and deductions." />
              <SelectField
                id="pc-state"
                label="State"
                value={stateCode}
                onChange={setStateCode}
                options={Object.entries(US_STATES)
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([code, s]) => ({ value: code, label: s.type === 'none' ? `${s.name} (no income tax)` : s.name }))}
              />
              <SelectField
                id="pc-filing"
                label="Filing status"
                value={filingStatus}
                onChange={setFilingStatus}
                options={FILING_STATUSES}
              />
              <NumberField id="pc-401k" label="401(k) contribution" suffix="%" value={retirementPct} onChange={setRetirementPct} min={0} max={90} hint="Traditional pre-tax percent of salary (reduces income tax, not FICA)." />
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-sm dark:border-teal-800/60 dark:bg-teal-900/20">
                <p className="font-semibold text-teal-800 dark:text-teal-300">2026 tax year</p>
                <p className="mt-0.5 text-teal-700 dark:text-teal-400">
                  Standard deduction only; Social Security wage base {fmtUSD(FICA_2026.ssWageBase)}.
                  {st.localNote ? ` Note: ${st.localNote}.` : ''}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {result ? (
              <>
                <div>
                  <Tabs
                    tabs={PAY_FREQUENCIES.map((f) => ({ id: f.value, label: f.label }))}
                    active={frequency}
                    onChange={setFrequency}
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <ResultStat label={`Take-home (${frequency})`} value={fmtUSD(result.netAnnual / periods, periods === 1 ? 0 : 2)} emphasis tone="positive" />
                    <ResultStat label={`Gross (${frequency})`} value={fmtUSD(result.grossAnnual / periods, periods === 1 ? 0 : 2)} />
                    <ResultStat label="Effective tax rate" value={`${result.effectiveRate.toFixed(1)}%`} />
                    <ResultStat label="You keep" value={`${result.takeHomeRate.toFixed(1)}%`} />
                  </div>
                </div>

                <Card className="p-5">
                  <h3 className="mb-4 font-display text-base font-bold text-ink dark:text-white">Where each $100 goes</h3>
                  <HundredBar result={result} />
                </Card>

                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Annual breakdown</h3>
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                    {[
                      ['Gross salary', result.grossAnnual, 'text-ink dark:text-white'],
                      result.retirement > 0 ? ['401(k) contribution', -result.retirement, 'text-violet-700 dark:text-violet-400'] : null,
                      ['Federal income tax', -result.federalTax, 'text-amber-700 dark:text-amber-400'],
                      ['Social Security (6.2%)', -result.socialSecurity, 'text-sky-700 dark:text-sky-400'],
                      ['Medicare', -result.medicare, 'text-sky-700 dark:text-sky-400'],
                      result.stateTax > 0 ? [`${st.name} income tax`, -result.stateTax, 'text-rose-700 dark:text-rose-400'] : null,
                      ['Annual take-home', result.netAnnual, 'font-semibold text-emerald-700 dark:text-emerald-400']
                    ].filter(Boolean).map(([label, value, cls]) => (
                      <div key={label} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-ink-soft dark:text-slate-300">{label}</span>
                        <span className={`font-medium ${cls}`}>{value < 0 ? `−${fmtUSD(Math.abs(value))}` : fmtUSD(value)}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <PieBreakdownChart
                    title="Gross salary composition"
                    items={[
                      { label: 'Take-home', value: result.netAnnual, color: '#10b981' },
                      { label: 'Federal tax', value: result.federalTax, color: '#f59e0b' },
                      { label: 'FICA', value: result.socialSecurity + result.medicare, color: '#0ea5e9' },
                      { label: 'State tax', value: result.stateTax, color: '#f43f5e' },
                      { label: '401(k)', value: result.retirement, color: '#8b5cf6' }
                    ].filter((i) => i.value > 0)}
                    formatter={(v) => fmtUSD(v)}
                  />
                </Card>

                <ResultActions
                  title={`US paycheck estimate — ${st.name} (2026)`}
                  summaryLines={shareLines}
                  fileName="upaman-us-paycheck-summary.txt"
                />

                <p className="text-sm text-ink-muted dark:text-slate-400">
                  Want your state&apos;s details? See{' '}
                  <Link href={`/paycheck/${stateSlug(stateCode)}`} className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">
                    take-home pay in {st.name}
                  </Link>{' '}
                  browse <Link href="/paycheck" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">all states</Link>, or
                  compare <Link href="/after-taxes" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">salary levels after taxes</Link>.
                </p>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your salary to estimate take-home pay.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the US Paycheck Calculator"
          description="Estimate your 2026 take-home pay in four steps."
          steps={[
            { name: 'Enter your salary', text: 'Type your annual gross salary before taxes and deductions.' },
            { name: 'Pick your state and filing status', text: 'State tax varies from zero (nine states) to over 10% — filing status sets your federal brackets.' },
            { name: 'Add your 401(k) percent', text: 'Traditional contributions reduce federal and state income tax (not FICA).' },
            { name: 'Read your paycheck', text: 'Switch between weekly, bi-weekly, monthly, and annual views and see where each $100 goes.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Paycheck Calculator FAQ</h2>
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
            title="2026 methodology and sources"
            inputs={[
              'Annual gross salary, state, filing status (single / married filing jointly / head of household), pre-tax 401(k) percent'
            ]}
            formulas={[
              '2026 federal brackets with the standard deduction for the chosen filing status',
              'Social Security 6.2% up to the 2026 wage base; Medicare 1.45% + 0.9% additional above the threshold',
              'State tax from each state’s flat rate or brackets (married brackets/deductions doubled as an approximation)'
            ]}
            assumptions={[
              'Standard deduction only — no itemizing, credits, or other income',
              'State figures use the latest published rates and are estimates; local/city taxes excluded (noted for MD, NYC, OH, PA)',
              'Withholding on real paychecks (W-4 driven) will differ from this annual-liability estimate'
            ]}
            sources={[
              { label: 'IRS — 2026 inflation adjustments (Rev. Proc. 2025-32)', url: 'https://www.irs.gov/newsroom' },
              { label: 'SSA — 2026 Social Security changes', url: 'https://www.ssa.gov/cola/' },
              { label: 'Tax Foundation — State individual income tax rates', url: 'https://taxfoundation.org/data/all/state/state-income-tax-rates/' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default USPaycheckCalculator;
