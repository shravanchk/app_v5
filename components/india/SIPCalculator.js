import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from '../AffiliateRecommendations';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import EEATPanel from '../calculator/EEATPanel';
import { PieBreakdownChart, ComparisonBars } from '../calculator/ResultVisualizations';
import SearchLandingSections from '../calculator/SearchLandingSections';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const SIPCalculator = () => {
  const [activeTab, setActiveTab] = useState('sip');

  const [sipParams, setSipParams] = useState({ monthlyInvestment: 5000, annualReturn: 12, investmentPeriod: 10, stepUpPercentage: 0 });
  const [goalParams, setGoalParams] = useState({ targetAmount: 1000000, annualReturn: 12, investmentPeriod: 10 });
  const [comparisonParams, setComparisonParams] = useState({ monthlyAmount: 5000, lumpsumAmount: 600000, annualReturn: 12, investmentPeriod: 10 });

  const [sipResult, setSipResult] = useState(null);
  const [goalResult, setGoalResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [yearlyBreakdown, setYearlyBreakdown] = useState([]);

  const calculateSIP = useCallback(() => {
    const { monthlyInvestment, annualReturn, investmentPeriod, stepUpPercentage } = sipParams;
    if (!monthlyInvestment || !annualReturn || !investmentPeriod) return;
    const monthlyRate = annualReturn / 100 / 12;
    let totalInvestment = 0;
    let futureValue = 0;
    let currentMonthlyAmount = monthlyInvestment;
    const breakdown = [];
    for (let year = 1; year <= investmentPeriod; year++) {
      let yearlyInvestment = 0;
      for (let month = 1; month <= 12; month++) {
        totalInvestment += currentMonthlyAmount;
        yearlyInvestment += currentMonthlyAmount;
        futureValue = (futureValue + currentMonthlyAmount) * (1 + monthlyRate);
      }
      if (stepUpPercentage > 0 && year < investmentPeriod) {
        currentMonthlyAmount = currentMonthlyAmount * (1 + stepUpPercentage / 100);
      }
      breakdown.push({
        year,
        yearlyInvestment: Math.round(yearlyInvestment),
        totalInvestment: Math.round(totalInvestment),
        futureValue: Math.round(futureValue),
        returns: Math.round(futureValue - totalInvestment),
      });
    }
    const totalReturns = Math.round(futureValue - totalInvestment);
    setSipResult({
      monthlyInvestment: Math.round(currentMonthlyAmount),
      totalInvestment: Math.round(totalInvestment),
      futureValue: Math.round(futureValue),
      totalReturns,
      returnPercentage: ((totalReturns / totalInvestment) * 100).toFixed(2),
    });
    setYearlyBreakdown(breakdown);
  }, [sipParams]);

  const calculateGoalSIP = useCallback(() => {
    const { targetAmount, annualReturn, investmentPeriod } = goalParams;
    if (!targetAmount || !annualReturn || !investmentPeriod) return;
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = investmentPeriod * 12;
    const requiredMonthlySIP = (targetAmount * monthlyRate) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const totalInvestment = requiredMonthlySIP * totalMonths;
    const totalReturns = targetAmount - totalInvestment;
    setGoalResult({
      requiredMonthlySIP: Math.round(requiredMonthlySIP),
      totalInvestment: Math.round(totalInvestment),
      targetAmount: Math.round(targetAmount),
      totalReturns: Math.round(totalReturns),
      returnPercentage: ((totalReturns / totalInvestment) * 100).toFixed(2),
    });
  }, [goalParams]);

  const calculateComparison = useCallback(() => {
    const { monthlyAmount, lumpsumAmount, annualReturn, investmentPeriod } = comparisonParams;
    if (!monthlyAmount || !lumpsumAmount || !annualReturn || !investmentPeriod) return;
    const monthlyRate = annualReturn / 100 / 12;
    const annualRate = annualReturn / 100;
    const totalMonths = investmentPeriod * 12;
    const sipFutureValue = (monthlyAmount * (Math.pow(1 + monthlyRate, totalMonths) - 1)) / monthlyRate;
    const sipTotalInvestment = monthlyAmount * totalMonths;
    const sipReturns = sipFutureValue - sipTotalInvestment;
    const lumpsumFutureValue = lumpsumAmount * Math.pow(1 + annualRate, investmentPeriod);
    const lumpsumReturns = lumpsumFutureValue - lumpsumAmount;
    setComparisonResult({
      sip: { investment: Math.round(sipTotalInvestment), futureValue: Math.round(sipFutureValue), returns: Math.round(sipReturns), returnPercentage: ((sipReturns / sipTotalInvestment) * 100).toFixed(2) },
      lumpsum: { investment: Math.round(lumpsumAmount), futureValue: Math.round(lumpsumFutureValue), returns: Math.round(lumpsumReturns), returnPercentage: ((lumpsumReturns / lumpsumAmount) * 100).toFixed(2) },
    });
  }, [comparisonParams]);

  useEffect(() => { if (activeTab === 'sip') calculateSIP(); }, [activeTab, calculateSIP]);
  useEffect(() => { if (activeTab === 'goal') calculateGoalSIP(); }, [activeTab, calculateGoalSIP]);
  useEffect(() => { if (activeTab === 'comparison') calculateComparison(); }, [activeTab, calculateComparison]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const num = (v) => parseFloat(v) || 0;

  const sipShareLines = sipResult ? [
    `Total investment: ${formatCurrency(sipResult.totalInvestment)}`,
    `Future value: ${formatCurrency(sipResult.futureValue)}`,
    `Total returns: ${formatCurrency(sipResult.totalReturns)}`,
    `Return percentage: ${sipResult.returnPercentage}%`,
  ] : [];
  const goalShareLines = goalResult ? [
    `Required monthly SIP: ${formatCurrency(goalResult.requiredMonthlySIP)}`,
    `Total investment: ${formatCurrency(goalResult.totalInvestment)}`,
    `Target amount: ${formatCurrency(goalResult.targetAmount)}`,
    `Projected returns: ${formatCurrency(goalResult.totalReturns)}`,
  ] : [];
  const comparisonShareLines = comparisonResult ? [
    `SIP future value: ${formatCurrency(comparisonResult.sip.futureValue)}`,
    `Lumpsum future value: ${formatCurrency(comparisonResult.lumpsum.futureValue)}`,
    `SIP return %: ${comparisonResult.sip.returnPercentage}%`,
    `Lumpsum return %: ${comparisonResult.lumpsum.returnPercentage}%`,
  ] : [];

  const seoFaqItems = [
    { question: 'What is a SIP step-up calculator used for?', answer: 'It helps you model yearly increase in monthly SIP amount so investments can scale with income growth instead of staying flat.' },
    { question: 'Are SIP returns guaranteed?', answer: 'No. SIP returns are market-linked. This tool uses expected return assumptions for planning scenarios only.' },
    { question: 'Should I choose SIP or lumpsum?', answer: 'That depends on cash flow and risk profile. Comparison mode helps you evaluate projected outcomes under aligned assumptions.' },
  ];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'SIP Calculator India',
    url: 'https://upaman.com/sip-calculator',
    description: 'SIP, step-up SIP, goal-based SIP, and SIP vs lumpsum projection calculator for planning.',
    featureList: ['SIP Calculator', 'Step-up SIP Calculator', 'Goal-based SIP Planner', 'SIP vs Lumpsum Comparison'],
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'SIP Calculator', item: 'https://upaman.com/sip-calculator' },
  ]);

  const formColCls = 'lg:col-span-2';
  const resultColCls = 'lg:col-span-3';

  return (
    <>
      <Head>
        <title>SIP Calculator India | Step-up, Goal &amp; Lumpsum | Upaman</title>
        <meta name="description" content="Free SIP calculator for India. Project mutual fund SIP returns with step-up, plan a goal-based SIP, and compare SIP vs lumpsum — with a full year-by-year breakdown." />
        <link rel="canonical" href="https://upaman.com/sip-calculator" />
        <meta property="og:title" content="SIP Calculator India | Upaman" />
        <meta property="og:description" content="Project SIP returns with step-up, goal planning and SIP vs lumpsum comparison." />
        <meta property="og:url" content="https://upaman.com/sip-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout eyebrow="Investing" title="SIP Calculator" subtitle="Project mutual-fund SIP returns with optional step-up, plan a goal-based SIP, or compare SIP against a lumpsum.">
        <div className="mb-6">
          <Tabs
            tabs={[{ id: 'sip', label: 'SIP & step-up' }, { id: 'goal', label: 'Goal-based' }, { id: 'comparison', label: 'SIP vs lumpsum' }]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {activeTab === 'sip' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className={`${formColCls} p-5`}>
              <div className="space-y-4">
                <NumberField id="sip-amt" label="Monthly investment" prefix="₹" value={sipParams.monthlyInvestment} onChange={(v) => setSipParams((p) => ({ ...p, monthlyInvestment: num(v) }))} />
                <NumberField id="sip-ret" label="Expected annual return" suffix="%" step={0.5} value={sipParams.annualReturn} onChange={(v) => setSipParams((p) => ({ ...p, annualReturn: num(v) }))} />
                <NumberField id="sip-yrs" label="Investment period" suffix="yrs" value={sipParams.investmentPeriod} onChange={(v) => setSipParams((p) => ({ ...p, investmentPeriod: num(v) }))} />
                <NumberField id="sip-step" label="Annual step-up (optional)" suffix="%" step={1} value={sipParams.stepUpPercentage} onChange={(v) => setSipParams((p) => ({ ...p, stepUpPercentage: num(v) }))} hint="Increase your SIP each year as income grows." />
              </div>
            </Card>

            <div className={`${resultColCls} space-y-5`}>
              {sipResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultStat label="Total invested" value={formatCurrency(sipResult.totalInvestment)} />
                    <ResultStat label="Future value" value={formatCurrency(sipResult.futureValue)} emphasis tone="positive" />
                    <ResultStat label="Total returns" value={formatCurrency(sipResult.totalReturns)} />
                    <ResultStat label="Return on investment" value={`${sipResult.returnPercentage}%`} />
                  </div>
                  <Card className="p-5"><PieBreakdownChart title="Investment vs returns" items={[{ label: 'Total investment', value: sipResult.totalInvestment, color: '#3b82f6' }, { label: 'Total returns', value: sipResult.totalReturns, color: '#10b981' }]} formatter={formatCurrency} /></Card>
                  {yearlyBreakdown.length > 0 && (
                    <Card className="overflow-hidden">
                      <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-ink dark:border-slate-700 dark:text-slate-100">Year-by-year breakdown</div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[460px] text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted dark:bg-slate-800/60">
                              <th className="px-4 py-2 font-semibold">Year</th>
                              <th className="px-4 py-2 font-semibold">Invested</th>
                              <th className="px-4 py-2 font-semibold">Value</th>
                              <th className="px-4 py-2 font-semibold">Returns</th>
                            </tr>
                          </thead>
                          <tbody>
                            {yearlyBreakdown.map((row) => (
                              <tr key={row.year} className="border-t border-slate-100 dark:border-slate-700/60">
                                <td className="px-4 py-2">{row.year}</td>
                                <td className="px-4 py-2">{formatCurrency(row.totalInvestment)}</td>
                                <td className="px-4 py-2 font-medium">{formatCurrency(row.futureValue)}</td>
                                <td className="px-4 py-2 text-emerald-600 dark:text-emerald-400">{formatCurrency(row.returns)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                  <AffiliateRecommendations calculatorType="sip" result={sipResult} isDarkMode={false} />
                  <ResultActions title="SIP investment summary" summaryLines={sipShareLines} fileName="upaman-sip-summary.txt" />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'goal' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className={`${formColCls} p-5`}>
              <div className="space-y-4">
                <NumberField id="goal-amt" label="Target corpus" prefix="₹" value={goalParams.targetAmount} onChange={(v) => setGoalParams((p) => ({ ...p, targetAmount: num(v) }))} />
                <NumberField id="goal-ret" label="Expected annual return" suffix="%" step={0.5} value={goalParams.annualReturn} onChange={(v) => setGoalParams((p) => ({ ...p, annualReturn: num(v) }))} />
                <NumberField id="goal-yrs" label="Investment period" suffix="yrs" value={goalParams.investmentPeriod} onChange={(v) => setGoalParams((p) => ({ ...p, investmentPeriod: num(v) }))} />
              </div>
            </Card>
            <div className={`${resultColCls} space-y-5`}>
              {goalResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultStat label="Required monthly SIP" value={formatCurrency(goalResult.requiredMonthlySIP)} emphasis tone="positive" />
                    <ResultStat label="Total invested" value={formatCurrency(goalResult.totalInvestment)} />
                    <ResultStat label="Target corpus" value={formatCurrency(goalResult.targetAmount)} />
                    <ResultStat label="Projected returns" value={formatCurrency(goalResult.totalReturns)} />
                  </div>
                  <ResultActions title="Goal-based SIP summary" summaryLines={goalShareLines} fileName="upaman-goal-sip-summary.txt" />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className={`${formColCls} p-5`}>
              <div className="space-y-4">
                <NumberField id="cmp-sip" label="Monthly SIP amount" prefix="₹" value={comparisonParams.monthlyAmount} onChange={(v) => setComparisonParams((p) => ({ ...p, monthlyAmount: num(v) }))} />
                <NumberField id="cmp-lump" label="Lumpsum amount" prefix="₹" value={comparisonParams.lumpsumAmount} onChange={(v) => setComparisonParams((p) => ({ ...p, lumpsumAmount: num(v) }))} />
                <NumberField id="cmp-ret" label="Expected annual return" suffix="%" step={0.5} value={comparisonParams.annualReturn} onChange={(v) => setComparisonParams((p) => ({ ...p, annualReturn: num(v) }))} />
                <NumberField id="cmp-yrs" label="Investment period" suffix="yrs" value={comparisonParams.investmentPeriod} onChange={(v) => setComparisonParams((p) => ({ ...p, investmentPeriod: num(v) }))} />
              </div>
            </Card>
            <div className={`${resultColCls} space-y-5`}>
              {comparisonResult && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card className="p-4">
                      <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">SIP</p>
                      <div className="mt-3 space-y-2">
                        <ResultStat label="Future value" value={formatCurrency(comparisonResult.sip.futureValue)} emphasis tone="positive" />
                        <ResultStat label="Invested" value={formatCurrency(comparisonResult.sip.investment)} />
                        <ResultStat label="Return %" value={`${comparisonResult.sip.returnPercentage}%`} />
                      </div>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">Lumpsum</p>
                      <div className="mt-3 space-y-2">
                        <ResultStat label="Future value" value={formatCurrency(comparisonResult.lumpsum.futureValue)} emphasis tone="positive" />
                        <ResultStat label="Invested" value={formatCurrency(comparisonResult.lumpsum.investment)} />
                        <ResultStat label="Return %" value={`${comparisonResult.lumpsum.returnPercentage}%`} />
                      </div>
                    </Card>
                  </div>
                  <Card className="p-5"><ComparisonBars title="Projected future value" items={[{ label: 'SIP future value', value: comparisonResult.sip.futureValue, color: '#3b82f6' }, { label: 'Lumpsum future value', value: comparisonResult.lumpsum.futureValue, color: '#8b5cf6' }]} formatter={formatCurrency} /></Card>
                  <ResultActions title="SIP vs lumpsum summary" summaryLines={comparisonShareLines} fileName="upaman-sip-vs-lumpsum.txt" />
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">What a SIP projection can and cannot tell you</h2>
          <p className="mt-3">
            A SIP projection answers one question well: given a monthly amount, a tenure, and an assumed return,
            what does compounding do to the money? It cannot tell you what the market will return — that input is
            yours, and it is the weakest one. Treat the output as a planning scenario, not a forecast, and the
            calculator becomes genuinely useful: it shows how sensitive your goal is to each of the three levers
            you actually control — how much, how long, and how aggressively you step up contributions over time.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">A worked example: ₹15,000 a month for 15 years</h3>
          <p className="mt-3">
            Rohan, 30, starts a ₹15,000 monthly SIP in an equity index fund and assumes 12% annual returns. Over
            15 years he invests ₹27,00,000, and the projection lands at roughly <strong className="text-ink dark:text-white">₹75.7 lakh</strong> —
            ₹48.7 lakh of it growth. Two details in the year-by-year table deserve more attention than the final figure:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">Gains overtake contributions only in year 11.</strong>{' '}
              For the first decade, most of the corpus is simply his own money. The dramatic compounding lives
              almost entirely in the last third of the tenure — which is why quitting a SIP in year 6 or 7
              forfeits far more than the years already invested suggest.
            </li>
            <li>
              <strong className="text-ink dark:text-white">The return assumption swings the outcome by lakhs.</strong>{' '}
              The same ₹15,000 for the same 15 years projects to ₹62.7 lakh at 10% and ₹91.9 lakh at 14%. A
              two-point difference in an assumption he cannot control moves the result by more than his entire
              first four years of contributions. Planning against a conservative band (say 10–12% for equity)
              and being pleasantly surprised beats anchoring on an optimistic point estimate.
            </li>
          </ul>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Time beats amount — by more than intuition suggests</h3>
          <p className="mt-3">
            Compare two investors targeting retirement. One starts ₹15,000 a month at 25 and continues for 25
            years, investing ₹45 lakh in total. The other waits a decade, then invests double — ₹30,000 a month
            for 15 years, ₹54 lakh in total. At the same 12%, the early starter finishes with about{' '}
            <strong className="text-ink dark:text-white">₹2.85 crore</strong>; the late starter with{' '}
            <strong className="text-ink dark:text-white">₹1.51 crore</strong>. Nine lakh less invested, ₹1.3 crore
            more at the end. Every year of delay quietly removes the most valuable years of compounding — the last
            ones.
          </p>
          <p className="mt-3">
            The step-up feature models the realistic middle path: start with what fits today and raise the SIP as
            income grows. Rohan&rsquo;s ₹15,000 SIP with a 10% annual step-up invests ₹57.2 lakh over the same 15
            years and projects to about ₹1.30 crore — but note the honest framing: most of that improvement comes
            from investing more money, not from any compounding magic. The step-up&rsquo;s real value is
            behavioural — it commits future raises before lifestyle absorbs them.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">What the projection deliberately leaves out</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">Costs.</strong> Expense ratios compound against you
              exactly the way returns compound for you. A regular plan typically carries distributor commission
              that a direct plan of the same fund does not; over 15 years even a half-percent drag is material.
              Model it by shaving your return assumption, not by ignoring it.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Volatility.</strong> Real equity returns arrive
              lumpily. The projection&rsquo;s smooth curve is an average; actual portfolios spend years above and
              below it. Rupee-cost averaging works precisely because contributions continue through the dips —
              pausing a SIP during a fall buys fewer of the cheapest units you were ever offered.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Tax.</strong> Under current rules, long-term capital
              gains on equity funds above the annual exemption are taxed on redemption, so the corpus you see is
              pre-tax. Since each SIP instalment has its own purchase date, instalments from the final year may
              still be short-term when you begin withdrawing — sequencing redemptions matters at the goal end.
            </li>
          </ul>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Ideas people conflate</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">SIP vs lumpsum is a cash-flow question, not a returns
              debate.</strong> If money arrives monthly from salary, a SIP is simply how investing looks. The
              comparison tab matters only when a lump sum exists today — historically, deploying it immediately
              wins more often than spreading it, but spreading softens the regret of a crash in month two. That
              trade-off is about temperament as much as math.
            </li>
            <li>
              <strong className="text-ink dark:text-white">CAGR vs absolute return.</strong> &ldquo;My fund
              doubled&rdquo; means little without the holding period: doubling in 6 years is roughly 12% CAGR;
              in 10 years, about 7%. The calculator speaks CAGR; fund marketing often speaks absolute.
            </li>
            <li>
              <strong className="text-ink dark:text-white">NAV level says nothing about value.</strong> A fund at
              NAV ₹15 is not cheaper than one at ₹150 — you simply hold more units of the first. Growth depends on
              the portfolio behind the NAV, never on the number itself.
            </li>
          </ul>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">When to come back to this page</h3>
          <p className="mt-3">
            Rerun the projection when income changes (to size a step-up), when a goal date moves, or annually to
            compare actual portfolio value against the scenario line — a portfolio meaningfully below the 10%
            curve after several years is a prompt to review fund selection or contribution levels, not to abandon
            the plan. Pair it with the <a href="/prepay-vs-invest-workflow" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">prepay vs invest workflow</a>{' '}
            if a loan competes for the same monthly surplus, or the{' '}
            <a href="/ppf-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">PPF calculator</a>{' '}
            to model the guaranteed-return leg of the same goal.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <EEATPanel
            author="Upaman Research Team"
            reviewer="Investment Methodology Review Desk (Upaman)"
            reviewedOn="June 28, 2026"
            scope="SIP projections are deterministic scenarios based on constant return assumptions and periodic contributions."
            sources={[
              { label: 'SEBI Investor Education', url: 'https://investor.sebi.gov.in/' },
              { label: 'AMFI Knowledge Center', url: 'https://www.amfiindia.com/investor-corner/knowledge-center' },
              { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
            ]}
          />
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            reviewedOn="June 28, 2026"
            inputs={['Monthly SIP amount, expected annual return, investment tenure, and optional step-up', 'Goal mode uses target corpus, expected return, and tenure']}
            formulas={['Future value uses monthly compounding for recurring contributions', 'Goal SIP uses PMT-based reverse calculation for required monthly amount']}
            assumptions={['Expected return is constant through the full tenure', 'No entry/exit load, tax, or fund-level expense variations are modeled', 'Results are estimates for planning, not guaranteed investment outcomes']}
            sources={[{ label: 'SEBI investor awareness', url: 'https://investor.sebi.gov.in/' }, { label: 'AMFI investor education', url: 'https://www.amfiindia.com/investor-corner/knowledge-center' }]}
            guideLinks={[{ label: 'SIP step-up planning guide', href: '/guide-sip-step-up-planning.html' }, { label: 'PPF vs SIP guide', href: '/guide-ppf-vs-sip-choice.html' }]}
          />
          <SearchLandingSections
            intro={(<><p>SIP planning is most effective when you model both contribution behaviour and target outcomes. This SIP calculator supports regular SIP, goal-based planning, and SIP vs lumpsum comparison in one workflow.</p><p>If you are searching for a SIP step-up calculator or goal SIP calculator, this page helps you estimate required monthly investment, return contribution, and how annual step-up changes long-term outcomes.</p></>)}
            example={(<p>Assume ₹15,000 monthly SIP for 15 years at expected 12% annual return. The calculator projects total invested amount, expected corpus, and returns. Add a 10% yearly step-up to compare how progressive contribution growth can improve final corpus without a large first-year commitment.</p>)}
            formula={(<p>SIP mode uses periodic compounding across monthly contributions. Goal mode reverses compounding logic to estimate required monthly SIP for a target corpus. Comparison mode evaluates recurring SIP and one-time lumpsum under the same return horizon for consistent decision support.</p>)}
            faqItems={seoFaqItems}
            relatedLinks={[{ label: 'PPF Calculator', href: '/ppf-calculator' }, { label: 'Salary Calculator', href: '/salary-calculator' }, { label: 'SIP Step-up Planning Guide', href: '/guide-sip-step-up-planning.html' }]}
          />
        </div>
      
        <HowToSection
          name="How to use the SIP Calculator"
          description="Estimate the maturity value of a monthly mutual-fund SIP."
          steps={[
            { name: "Enter your monthly SIP amount", text: "Type how much you plan to invest each month." },
            { name: "Set the expected return", text: "Enter the annual return rate you expect from the fund." },
            { name: "Choose the investment period", text: "Set how many years you will stay invested." },
            { name: "Review the projection", text: "See the maturity value, total invested, and estimated gains." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default SIPCalculator;
