import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from '../AffiliateRecommendations';
import AdSenseAd from '../AdSenseAd';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import { PieBreakdownChart, ComparisonBars } from '../calculator/ResultVisualizations';
import ResultActions from '../ResultActions';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, SelectField } from '../ui/Field';
import Card from '../ui/Card';
const { calculateUKTax } = require('../../utils/taxCalculations');

// Single source for the visible FAQ list and the FAQPage JSON-LD so the
// schema can never drift from what's on the page. Figures verified against
// calculateUKTax in utils/taxCalculations.
const UK_FAQS = [
  {
    q: 'What is the Personal Allowance for 2026-27?',
    a: 'The standard Personal Allowance for 2026-27 is £12,570. This is the amount you can earn tax-free before paying income tax. However, it reduces by £1 for every £2 you earn over £100,000, disappearing entirely at £125,140.'
  },
  {
    q: 'Why did my take-home barely move after a £10,000 pay rise above £100,000?',
    a: 'Between £100,000 and £125,140 the Personal Allowance tapers away, so each extra £1 is taxed at 40% and also removes 50p of tax-free allowance. Combined with 2% National Insurance, a rise from £100,000 to £110,000 adds only about £3,800 to annual take-home — an effective marginal rate of 62%. Pension contributions that bring adjusted net income back under £100,000 restore the allowance, which is why relief in this band is often described as 60%.'
  },
  {
    q: 'Does paying into my pension reduce National Insurance too?',
    a: 'Usually not. With net-pay or relief-at-source schemes, contributions reduce income tax but NI is still charged on your full gross salary — that is how this calculator models it. Salary-sacrifice arrangements are the exception: your contractual pay is reduced before both tax and NI, so you also save 8% (or 2% above £50,270) in NI.'
  },
  {
    q: 'Do student loan repayments reduce my income tax?',
    a: 'No — the two are calculated independently. Student loan repayments take 9% of gross income above your plan’s threshold (6% above £21,000 for postgraduate loans) regardless of how much tax you pay. In practice it behaves like an extra 9% marginal band: a Plan 2 graduate in the higher-rate band keeps just 49p of each extra £1 after 40% tax, 2% NI, and 9% loan.'
  },
  {
    q: 'How do Scottish tax rates differ?',
    a: 'Scotland sets its own income-tax bands: Starter (19%), Basic (20%), Intermediate (21%), Higher (42%), Advanced (45%), and Top (48%). England, Wales and Northern Ireland have three bands: Basic (20%), Higher (40%), and Additional (45%). National Insurance and student loan rules are identical across the UK — only income tax is devolved.'
  },
  {
    q: 'How is National Insurance calculated?',
    a: 'Employee Class 1 National Insurance (category A) is charged at 8% on earnings between £12,570 and £50,270, then 2% above £50,270. Unlike income tax, the rate falls at higher incomes, and NI is normally assessed on each pay period rather than the year as a whole.'
  },
  {
    q: 'What are the different Student Loan plans?',
    a: 'Plan 1 (pre-2012 loans): £26,900 threshold. Plan 2 (2012 onwards, England and Wales): £29,385. Plan 4 (Scotland): £33,795. Plan 5 (courses from August 2023): £25,000. All charge 9% of income above the threshold; Postgraduate loans charge 6% above £21,000, and can stack on top of an undergraduate plan.'
  }
];

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

        {/* FAQ Schema — generated from UK_FAQS so it always matches the visible FAQ list */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": UK_FAQS.map(({ q, a }) => ({
              "@type": "Question",
              "name": q,
              "acceptedAnswer": { "@type": "Answer", "text": a }
            }))
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

        <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">How UK take-home pay actually gets worked out</h2>
          <p className="mt-3">
            Three separate systems act on a UK payslip, and each one uses a different definition of your income.
            Income tax applies to taxable income — what remains after the Personal Allowance and any pension
            contributions that qualify for relief. Employee National Insurance ignores all of that and takes a
            slice of gross pay, assessed per pay period. Student loan repayments ignore both and charge a flat
            percentage of gross income above a threshold set by your repayment plan. Because the three bases never
            quite line up, intuitions built on one system routinely fail on the others: a pension contribution
            that saves 40p per £1 in tax saves nothing in NI under most schemes, and no amount of tax planning
            changes a student loan deduction.
          </p>
          <p className="mt-3">
            PAYE hides this machinery. Your employer deducts everything before pay lands, so most people only
            confront the mechanics when something changes — a new job, a pay rise that crosses a band boundary, a
            pension decision, or a move to Scotland. Those are exactly the moments this calculator is built for.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">A worked example: £58,000 with a pension and a Plan 2 loan</h3>
          <p className="mt-3">
            Amelia accepts a £58,000 role in Manchester. She contributes 5% of salary (£2,900) to her workplace
            pension and, having started university in 2014, repays a Plan 2 student loan. Her 2026-27 payslip
            builds up like this:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">Personal Allowance:</strong> her income is below
              £100,000, so she keeps the full £12,570 tax-free.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Income tax:</strong> taxable income is £58,000 − £2,900
              pension − £12,570 allowance = £42,530. The first £37,700 is taxed at 20% (£7,540); the remaining
              £4,830 falls in the higher-rate band at 40% (£1,932). Total: <strong className="text-ink dark:text-white">£9,472</strong>.
            </li>
            <li>
              <strong className="text-ink dark:text-white">National Insurance:</strong> charged on her full gross
              salary — the pension makes no difference here. 8% of the band between £12,570 and £50,270 is £3,016,
              plus 2% on the £7,730 above, giving <strong className="text-ink dark:text-white">£3,171</strong>.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Student loan:</strong> 9% of everything over the Plan 2
              threshold of £29,385 — again on gross pay — comes to <strong className="text-ink dark:text-white">£2,575</strong>.
            </li>
          </ul>
          <p className="mt-3">
            Net result: <strong className="text-ink dark:text-white">£39,882 a year, about £3,324 a month</strong>,
            an overall deduction rate of 26.2%. Two readings of those numbers matter more than the numbers
            themselves. First, the pension: without it her take-home would be £41,622, so the £2,900 going into
            her pension only costs her £1,740 in spendable income — the higher-rate band is doing 40% of the
            saving for her. Second, her true marginal rate: each additional £1 she earns loses 40p to tax, 2p to
            NI, and 9p to her loan. She keeps 49p of every extra pound, which changes how she should think about
            overtime, bonuses, and salary negotiations.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Why the bands trip people up</h3>
          <p className="mt-3">
            UK income tax is marginal: crossing into the 40% band does not re-tax anything below it, so there is
            no cliff at £50,270 — only the slice above it is taxed at the higher rate. The genuine cliff sits at
            £100,000, where the Personal Allowance starts tapering away at £1 for every £2 of extra income.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-[0.9rem]">
              <tbody>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white">Gross income (2026-27)</th>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white">Income tax on next £1</th>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white">Employee NI</th>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white">Combined marginal</th>
                </tr>
                {[
                  ['Up to £12,570', '0%', '0%', '0%'],
                  ['£12,571 – £50,270', '20%', '8%', '28%'],
                  ['£50,271 – £100,000', '40%', '2%', '42%'],
                  ['£100,001 – £125,140', '40% + allowance taper', '2%', '62%'],
                  ['Over £125,140', '45%', '2%', '47%']
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} className="border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
            <strong className="text-ink dark:text-white">The 62% zone in practice:</strong> a pay rise from
            £100,000 to £110,000 adds only about £3,800 to annual take-home, because each extra £1 is taxed at 40%
            while also withdrawing 50p of tax-free allowance (an effective 60% before NI). This is why pension
            contributions are unusually powerful in this band — money sacrificed here gets roughly 60% relief, and
            bringing adjusted net income back under £100,000 restores the allowance entirely.
          </p>
          <p className="mt-3">
            The other quiet force is threshold freezing. The £12,570 allowance and the £50,270 higher-rate
            boundary have been frozen since April 2021, so ordinary pay growth pushes more of each salary into
            higher bands every year without any rate rising — fiscal drag. National Insurance runs in the opposite
            direction to income tax: its rate <em>falls</em> from 8% to 2% above £50,270, which is why combined
            marginal rates in the table don&rsquo;t simply climb.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Practical notes</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">Check your tax code.</strong> 1257L means the standard
              allowance is applied. Job changes, company benefits, or untaxed income often produce a different
              code, and an incorrect one quietly over- or under-deducts until HMRC corrects it. The code is on
              every payslip.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Pension route matters.</strong> This calculator models
              tax relief on contributions. Under salary sacrifice, your contractual pay is reduced before both tax
              and NI, adding an 8% (or 2%) NI saving on top — worth asking your employer about.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Married couples:</strong> if one partner earns under
              the allowance, Marriage Allowance lets them transfer £1,260 of it to a basic-rate partner.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Child Benefit:</strong> from April 2024 the High Income
              Child Benefit Charge starts at £60,000 of adjusted net income and removes the benefit entirely by
              £80,000 — another zone where pension contributions can restore a benefit the headline bands
              don&rsquo;t show.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Scotland:</strong> only income tax is devolved. If you
              move across the border, your income-tax bands change but NI and student loan deductions do not.
            </li>
          </ul>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Terms people mix up</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">Marginal vs effective rate.</strong> Amelia&rsquo;s
              marginal rate is 51% (tax + NI + loan on her next pound); her effective rate is 26.2% (deductions as
              a share of the whole salary). Negotiations and overtime decisions hinge on the first; budgeting
              hinges on the second.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Gross vs adjusted net income.</strong> The £100,000
              taper and the Child Benefit charge test adjusted net income — gross income minus pension
              contributions and Gift Aid — not your headline salary. That gap is precisely what makes pension
              planning around those thresholds work.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Tax code vs tax band.</strong> The code (1257L) tells
              your employer how much allowance to apply; the bands decide the rates above it. A wrong code changes
              your deductions even though the bands never moved.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Loan repayment vs loan balance.</strong> Student loan
              deductions are income-contingent: they depend only on earnings above the threshold, not on how much
              you owe. Two graduates with identical salaries repay identical amounts even if one owes triple the
              other.
            </li>
          </ul>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">When this calculator earns its keep</h3>
          <p className="mt-3">
            Reach for it when a number is about to change: comparing job offers whose pension terms differ,
            deciding a contribution percentage near £50,270 or £100,000, sanity-checking your first payslip after
            a new tax code, or pricing a move between Scotland and the rest of the UK. For a full reference of
            this year&rsquo;s bands and thresholds, the <a href="/guides/uk-tax-rates-2026-27" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">UK tax rates guide</a>{' '}
            pairs well with the tables of ready-made results at <a href="/uk/take-home" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">UK take-home by salary</a>.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">UK Tax Calculator FAQ 2026-27</h2>
          <div className="mt-4 grid gap-3">
            {UK_FAQS.map(({ q, a }) => (
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
      
        <HowToSection
          name="How to use the UK Income Tax Calculator"
          description="Estimate UK take-home pay after tax, NI, and student loans."
          steps={[
            { name: "Enter your gross income", text: "Type your annual gross salary." },
            { name: "Select your region", text: "Choose England/Wales/NI or Scotland for the right bands." },
            { name: "Add pension and student loan", text: "Enter any pension contribution and your student loan plan." },
            { name: "Review your take-home", text: "See income tax, National Insurance, and net pay for the year." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default UKIncomeTaxCalculator;
