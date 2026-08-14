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
import { useShareableState, toNumericString, toOption } from '../../utils/shareableState';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'How is take-home pay calculated?', answer: 'Gross salary minus federal income tax (2026 brackets and standard deduction), Social Security (6.2% up to the wage base), Medicare (1.45% plus 0.9% on high incomes), state income tax where applicable, and any pre-tax 401(k) contribution.' },
  { question: 'Which states have no income tax?', answer: 'Nine states levy no tax on wages: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. Your take-home pay there is reduced only by federal taxes and FICA.' },
  { question: 'Does a 401(k) contribution reduce my taxes?', answer: 'Traditional 401(k) contributions are deducted before federal and state income tax, so they lower those taxes — but not Social Security or Medicare, which apply to your full wages.' },
  { question: 'Why is my actual paycheck different?', answer: 'This is a planning estimate. Real paychecks also reflect W-4 withholding choices, health/dental premiums, HSA/FSA contributions, local city taxes (e.g., NYC), state disability/family-leave programs, and bonuses. Withholding also differs from your final tax bill.' },
  { question: 'Is getting a big tax refund a good thing?', answer: 'A refund means your employer withheld more than you owed — an interest-free loan to the government repaid the following spring. It is not extra income. If your refunds are consistently large, adjusting your W-4 moves that money into each paycheck instead.' },
  { question: 'Do bonuses get taxed at a higher rate?', answer: 'No — they are withheld at a flat supplemental rate (22% federally for most bonuses), which often differs from your regular withholding. At filing time a bonus is just ordinary income taxed at your normal brackets; any over- or under-withholding settles in your refund or balance due.' },
  { question: 'What happens to Social Security tax on high salaries?', answer: 'Social Security (6.2%) applies only up to the annual wage base — $184,500 in 2026. Earnings above it pay no Social Security tax, which is why high earners see take-home jump late in the year once they cross the cap. Medicare has no cap and adds 0.9% above $200,000.' }
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

const SHARE_DEFAULTS = {
  salary: '75000',
  stateCode: 'TX',
  filingStatus: 'single',
  frequency: 'monthly',
  retirementPct: '0'
};

const USPaycheckCalculator = () => {
  const [salary, setSalary] = useState(SHARE_DEFAULTS.salary);
  const [stateCode, setStateCode] = useState(SHARE_DEFAULTS.stateCode);
  const [filingStatus, setFilingStatus] = useState(SHARE_DEFAULTS.filingStatus);
  const [frequency, setFrequency] = useState(SHARE_DEFAULTS.frequency);
  const [retirementPct, setRetirementPct] = useState(SHARE_DEFAULTS.retirementPct);

  useShareableState({
    values: { salary, stateCode, filingStatus, frequency, retirementPct },
    defaults: SHARE_DEFAULTS,
    onRestore: (shared) => {
      if ('salary' in shared) setSalary(toNumericString(shared.salary, SHARE_DEFAULTS.salary));
      if ('retirementPct' in shared) setRetirementPct(toNumericString(shared.retirementPct, SHARE_DEFAULTS.retirementPct));
      // The state and frequency lookups index straight into their tables, so an
      // unknown code would throw rather than degrade.
      if ('stateCode' in shared) setStateCode(toOption(shared.stateCode, Object.keys(US_STATES), SHARE_DEFAULTS.stateCode));
      if ('filingStatus' in shared) {
        setFilingStatus(toOption(shared.filingStatus, FILING_STATUSES.map((s) => s.value), SHARE_DEFAULTS.filingStatus));
      }
      if ('frequency' in shared) {
        setFrequency(toOption(shared.frequency, PAY_FREQUENCIES.map((f) => f.value), SHARE_DEFAULTS.frequency));
      }
    }
  });

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
        ratesFor="tax year 2026"
        reviewedOn="June 2026"
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

        <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Gross to net: where the money actually goes</h2>
          <p className="mt-3">
            An $85,000 offer letter and an $85,000 lifestyle are separated by four deductions, each with its own
            rules. Federal income tax is progressive and applies after the standard deduction. Social Security
            takes a flat 6.2% of wages up to an annual cap. Medicare takes 1.45% of everything, plus a surtax at
            high incomes. State income tax ranges from zero (nine states) to double digits (California&rsquo;s top
            brackets). Because each deduction uses a different base and different thresholds, questions like
            &ldquo;what does a $10,000 raise really pay me?&rdquo; or &ldquo;what does a 6% 401(k) contribution
            really cost me?&rdquo; have unintuitive answers — which is what this calculator is for.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">A worked example: $85,000, single, two states</h3>
          <p className="mt-3">
            Jordan earns $85,000 and is comparing offers in Austin and Los Angeles. In Texas the 2026 numbers run:
            federal income tax <strong className="text-ink dark:text-white">$9,870</strong> (on $68,900 of taxable
            income after the $16,100 standard deduction), Social Security{' '}
            <strong className="text-ink dark:text-white">$5,270</strong>, Medicare{' '}
            <strong className="text-ink dark:text-white">$1,233</strong>, state tax zero — take-home{' '}
            <strong className="text-ink dark:text-white">$68,628</strong>, or 81 cents of every gross dollar. The
            same salary in California keeps the federal numbers identical but adds about{' '}
            <strong className="text-ink dark:text-white">$3,932</strong> of state tax: take-home{' '}
            <strong className="text-ink dark:text-white">$64,695</strong>. The gap — roughly $328 a month — is a
            real input to the offer comparison, but only one: LA rent differences dwarf it, which is why
            state tax should inform a relocation decision, not decide it.
          </p>
          <p className="mt-3">
            Now add a 6% traditional 401(k) contribution in Texas. $5,100 goes into the account, but Jordan&rsquo;s
            take-home falls only to $64,650 — a drop of{' '}
            <strong className="text-ink dark:text-white">$3,978</strong>. The missing $1,122 is federal tax he no
            longer owes, because contributions come out before income tax. Every dollar he saves costs him about
            78 cents. Note what did <em>not</em> change: Social Security and Medicare are still charged on the
            full $85,000 — pre-tax retirement money escapes income tax, not FICA.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">The two rates worth knowing by heart</h3>
          <p className="mt-3">
            Jordan&rsquo;s <em>effective</em> rate in Texas is 19% — total deductions over total pay, the number
            that matters for budgeting. His <em>marginal</em> rate is 24% federal plus 7.65% FICA: what the next
            dollar loses, the number that matters for evaluating overtime, a side income, or the raise that comes
            with a promotion. Neither is the &ldquo;I&rsquo;m in the 22% bracket so I lose 22% of everything&rdquo;
            folk model — crossing a bracket boundary never reduces take-home pay, because higher rates apply only
            to the dollars above each threshold.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Withholding is not your tax bill</h3>
          <p className="mt-3">
            The deductions on a real pay stub are your employer&rsquo;s estimate of your annual tax, spread across
            pay periods according to your W-4. The truth arrives at filing time: withhold too much all year and
            the difference comes back as a refund; too little and you owe. Life events that break the estimate —
            a second job, a working spouse, large non-wage income — are exactly when a W-4 update is worth the
            ten minutes. A calculator like this one gives the annual liability side of that comparison; your pay
            stub gives the withholding side.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Distinctions that save real money</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">Pre-tax vs Roth contributions.</strong> Traditional
              401(k) money skips income tax now and pays it in retirement; Roth pays now and skips later. The
              worked example&rsquo;s 78-cents-per-dollar math applies only to traditional — a Roth dollar costs a
              full dollar of take-home today. The{' '}
              <a href="/guides/traditional-vs-roth-401k" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">traditional vs Roth guide</a>{' '}
              covers how to choose.
            </li>
            <li>
              <strong className="text-ink dark:text-white">FICA vs income tax.</strong> They fund different things
              and follow different rules: FICA is flat, capped (Social Security), and unavoidable through
              deductions; income tax is progressive and highly plannable. Advice that works on one is often
              useless against the other.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Salary vs taxable income.</strong> The brackets apply
              to income after the standard deduction ($16,100 single in 2026) and pre-tax contributions. An
              $85,000 salary is $68,900 of taxable income before any 401(k) — comparing your salary directly to
              bracket thresholds overstates your tax.
            </li>
          </ul>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Where to go from here</h3>
          <p className="mt-3">
            The ready-made tables answer the common questions instantly:{' '}
            <a href="/after-taxes" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">take-home by salary level</a>{' '}
            across every state, and{' '}
            <a href="/paycheck" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">take-home by state</a>{' '}
            across every salary. For the full anatomy of a pay stub — every code, every box — read{' '}
            <a href="/guides/how-to-read-your-paycheck" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">how to read your paycheck</a>.
          </p>
        </div>

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
            guideLinks={[
              { label: 'How to read your US paycheck', href: '/guides/how-to-read-your-paycheck' },
              { label: 'The 50/30/20 budget rule on real take-home pay', href: '/guides/50-30-20-rule' },
              { label: 'How much should you have saved by 30, 40, 50?', href: '/guides/how-much-saved-by-30-40-50' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default USPaycheckCalculator;
