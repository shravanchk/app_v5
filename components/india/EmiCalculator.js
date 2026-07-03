import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from '../AffiliateRecommendations';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import CalculatorArticleLayout from '../calculator/CalculatorArticleLayout';
import EEATPanel from '../calculator/EEATPanel';
import { PieBreakdownChart } from '../calculator/ResultVisualizations';
import ResultActions from '../ResultActions';
import SavedScenarios from '../SavedScenarios';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';
import { formatINR } from '../../utils/calculations';

const ComprehensiveLoanCalculator = React.memo(() => {
  const [activeTab, setActiveTab] = useState('emi');
  const [emiParams, setEmiParams] = useState({ loanAmount: 2500000, interestRate: 8.5, loanTenure: 20, tenureUnit: 'years' });
  const [emiResult, setEmiResult] = useState(null);
  const [showAmortization, setShowAmortization] = useState(false);
  const [amortizationData, setAmortizationData] = useState([]);

  const [prepaymentParams, setPrepaymentParams] = useState({ outstandingAmount: 2577227, currentEMI: 25601, remainingMonths: 14.3, remainingTenureUnit: 'years', interestRate: 8.25 });
  const [scenarios, setScenarios] = useState([]);
  const [customPrepayment, setCustomPrepayment] = useState('');
  const [customResult, setCustomResult] = useState(null);

  const calculateEMI = useCallback((principal, rate, tenure) => {
    const monthlyRate = rate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
  }, []);

  const generateAmortization = useCallback((principal, rate, tenure, emi) => {
    const schedule = [];
    let remaining = principal;
    const monthlyRate = rate / 100 / 12;
    for (let month = 1; month <= Math.min(tenure, 60); month++) {
      const interest = remaining * monthlyRate;
      const principalPmt = emi - interest;
      remaining -= principalPmt;
      schedule.push({ month, emi, principal: principalPmt, interest, balance: remaining > 0 ? remaining : 0 });
      if (remaining <= 0) break;
    }
    return schedule;
  }, []);

  // Auto-calculate EMI whenever inputs change (no manual button needed).
  useEffect(() => {
    if (activeTab !== 'emi') return;
    const { loanAmount, interestRate, loanTenure, tenureUnit } = emiParams;
    if (!loanAmount || !interestRate || !loanTenure) { setEmiResult(null); return; }
    const tenureInMonths = tenureUnit === 'years' ? loanTenure * 12 : loanTenure;
    const emi = calculateEMI(loanAmount, interestRate, tenureInMonths);
    const totalAmount = emi * tenureInMonths;
    setEmiResult({
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalAmount - loanAmount),
      loanAmount,
      tenureInMonths,
      displayTenure: tenureUnit === 'years' ? `${loanTenure} years (${tenureInMonths} months)` : `${loanTenure} months`,
    });
    setAmortizationData(generateAmortization(loanAmount, interestRate, tenureInMonths, emi));
  }, [emiParams, activeTab, calculateEMI, generateAmortization]);

  const restoreEMIScenario = useCallback((scenarioData) => {
    if (!scenarioData?.inputs) return;
    setActiveTab('emi');
    setEmiParams(scenarioData.inputs);
  }, []);

  const generateScenarios = useCallback(() => {
    const { outstandingAmount, currentEMI, remainingMonths, remainingTenureUnit, interestRate } = prepaymentParams;
    if (!outstandingAmount || !currentEMI || !remainingMonths || !interestRate) return [];
    const remainingMonthsConverted = remainingTenureUnit === 'years' ? remainingMonths * 12 : remainingMonths;
    return [5, 10, 15, 20, 25, 30].map((percentage) => {
      const prepayment = Math.round((outstandingAmount * percentage) / 100);
      const newPrincipal = outstandingAmount - prepayment;
      const newEMI = calculateEMI(newPrincipal, interestRate, remainingMonthsConverted);
      const savings = currentEMI - newEMI;
      return {
        title: `Prepay ${percentage}% (${formatINR(prepayment)})`,
        prepayment,
        newEMI: Math.round(newEMI),
        monthlySavings: Math.round(savings),
        totalSavings: Math.round(savings * remainingMonthsConverted),
        isHighlighted: percentage === 20,
      };
    });
  }, [prepaymentParams, calculateEMI]);

  useEffect(() => {
    if (activeTab === 'prepayment') setScenarios(generateScenarios());
  }, [prepaymentParams, activeTab, generateScenarios]);

  const calculateCustom = () => {
    const prepayment = parseFloat(customPrepayment);
    if (!prepayment || prepayment <= 0) return;
    const remainingMonthsConverted = prepaymentParams.remainingTenureUnit === 'years' ? prepaymentParams.remainingMonths * 12 : prepaymentParams.remainingMonths;
    const newPrincipal = prepaymentParams.outstandingAmount - prepayment;
    const newEMI = calculateEMI(newPrincipal, prepaymentParams.interestRate, remainingMonthsConverted);
    const savings = prepaymentParams.currentEMI - newEMI;
    setCustomResult({ newEMI: formatINR(newEMI), monthlySavings: formatINR(savings), totalSavings: formatINR(savings * remainingMonthsConverted) });
  };

  const num = (v) => parseFloat(v) || 0;

  const emiShareLines = emiResult ? [
    `Monthly EMI: ${formatINR(emiResult.emi)}`,
    `Total amount payable: ${formatINR(emiResult.totalAmount)}`,
    `Total interest: ${formatINR(emiResult.totalInterest)}`,
    `Principal: ${formatINR(emiResult.loanAmount)}`,
    `Tenure: ${emiResult.displayTenure}`,
  ] : [];

  const emiScenario = emiResult ? { summary: `${formatINR(emiResult.emi)} EMI for ${emiResult.displayTenure}`, data: { inputs: emiParams, result: emiResult } } : null;

  const faqItems = [
    { question: 'How is EMI calculated in this tool?', answer: 'EMI uses the standard reducing-balance formula with principal, monthly rate, and total tenure in months. The same method is used for amortization and prepayment estimates.' },
    { question: 'What is the difference between EMI mode and prepayment mode?', answer: 'EMI mode calculates loan payment from fresh inputs. Prepayment mode starts from existing outstanding principal and estimates savings after a part-prepayment.' },
    { question: 'Should I reduce EMI or tenure after prepayment?', answer: 'Both are possible in real banking products. This tool primarily estimates impact in a fixed-tenure style for fast comparison and planning.' },
    { question: 'Why can lender schedules differ slightly?', answer: 'Differences can occur due to processing conventions, reset clauses, floating-rate changes, and lender-specific rounding rules.' },
  ];
  const faqSchema = buildFaqSchema(faqItems);
  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'EMI and Loan Calculator India',
    url: 'https://upaman.com/loan-calculator',
    description: 'Free EMI calculator for home, car, and personal loans with prepayment scenarios and amortization schedule.',
    applicationCategory: 'FinanceApplication',
    featureList: ['EMI Calculator', 'Prepayment Calculator', 'Amortization Schedule', 'Interest Savings Calculator', 'Loan Comparison Tool'],
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'Loan Calculator', item: 'https://upaman.com/loan-calculator' },
  ]);
  const relatedGuides = [
    { label: 'EMI prepayment strategy guide', href: '/guide-emi-prepayment-strategy.html' },
    { label: 'CTC to in-hand breakdown guide', href: '/guides/ctc-to-in-hand-salary' },
    { label: 'Credit card minimum due trap guide', href: '/guide-credit-card-minimum-due-trap.html' },
  ];
  const nextStepTools = [
    { label: 'Home loan readiness workflow', href: '/home-loan-readiness-workflow' },
    { label: 'Prepay vs invest workflow', href: '/prepay-vs-invest-workflow' },
    { label: 'Car ownership cost workflow', href: '/car-ownership-cost-workflow' },
    { label: 'Buy vs rent calculator', href: '/buy-vs-rent-calculator' },
    { label: 'Income tax calculator', href: '/income-tax-calculator' },
  ];
  const eeatSources = [
    { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
    { label: 'National Housing Bank', url: 'https://nhb.org.in/' },
    { label: 'SBI Home Loans', url: 'https://homeloans.sbi/' },
  ];

  const unitOptions = [{ value: 'years', label: 'years' }, { value: 'months', label: 'months' }];

  return (
    <>
      <Head>
        <title>EMI &amp; Loan Calculator India | Home, Car &amp; Personal Loan EMI | Upaman</title>
        <meta name="description" content="Free EMI & Loan Calculator India. Calculate home, car, personal loan EMIs, prepayment savings and complete amortization schedule with interest breakdown." />
        <meta name="keywords" content="EMI calculator India, loan calculator, home loan EMI, car loan EMI, personal loan EMI, prepayment calculator, amortization schedule" />
        <link rel="canonical" href="https://upaman.com/loan-calculator" />
        <meta property="og:title" content="EMI & Loan Calculator India | Upaman" />
        <meta property="og:description" content="Calculate EMI for home, car & personal loans with prepayment impact and amortization schedule." />
        <meta property="og:url" content="https://upaman.com/loan-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout eyebrow="Loans" title="EMI & Loan Calculator" subtitle="Calculate EMI for home, car and personal loans, see the full interest split, and test prepayment savings.">
        <div className="mb-6">
          <Tabs tabs={[{ id: 'emi', label: 'EMI & schedule' }, { id: 'prepayment', label: 'Prepayment savings' }]} active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === 'emi' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <div className="space-y-4">
                <NumberField id="emi-amt" label="Loan amount" prefix="₹" value={emiParams.loanAmount} onChange={(v) => setEmiParams((p) => ({ ...p, loanAmount: num(v) }))} />
                <NumberField id="emi-rate" label="Interest rate (p.a.)" suffix="%" step={0.1} value={emiParams.interestRate} onChange={(v) => setEmiParams((p) => ({ ...p, interestRate: num(v) }))} />
                <div className="grid grid-cols-2 gap-3">
                  <NumberField id="emi-ten" label="Loan tenure" value={emiParams.loanTenure} onChange={(v) => setEmiParams((p) => ({ ...p, loanTenure: num(v) }))} />
                  <SelectField id="emi-unit" label="Unit" value={emiParams.tenureUnit} onChange={(v) => setEmiParams((p) => ({ ...p, tenureUnit: v }))} options={unitOptions} />
                </div>
              </div>
            </Card>

            <div className="space-y-5 lg:col-span-3">
              {emiResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultStat label="Monthly EMI" value={formatINR(emiResult.emi)} emphasis tone="positive" />
                    <ResultStat label="Total interest" value={formatINR(emiResult.totalInterest)} />
                    <ResultStat label="Total payment" value={formatINR(emiResult.totalAmount)} />
                    <ResultStat label="Principal" value={formatINR(emiResult.loanAmount)} />
                  </div>
                  <Card className="p-5">
                    <PieBreakdownChart title="Principal vs interest" items={[{ label: 'Principal', value: emiResult.loanAmount, color: '#3b82f6' }, { label: 'Total interest', value: emiResult.totalInterest, color: '#f59e0b' }]} formatter={formatINR} />
                  </Card>

                  {amortizationData.length > 0 && (
                    <Card className="overflow-hidden">
                      <button type="button" onClick={() => setShowAmortization((s) => !s)} className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-ink dark:text-slate-100">
                        Amortization schedule (first 5 years)
                        <span className="text-brand-600">{showAmortization ? 'Hide' : 'Show'}</span>
                      </button>
                      {showAmortization && (
                        <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-700">
                          <table className="w-full min-w-[520px] text-sm">
                            <thead>
                              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted dark:bg-slate-800/60">
                                <th className="px-4 py-2 font-semibold">Month</th>
                                <th className="px-4 py-2 font-semibold">Principal</th>
                                <th className="px-4 py-2 font-semibold">Interest</th>
                                <th className="px-4 py-2 font-semibold">Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {amortizationData.map((row) => (
                                <tr key={row.month} className="border-t border-slate-100 dark:border-slate-700/60">
                                  <td className="px-4 py-2">{row.month}</td>
                                  <td className="px-4 py-2">{formatINR(row.principal)}</td>
                                  <td className="px-4 py-2 text-amber-600 dark:text-amber-400">{formatINR(row.interest)}</td>
                                  <td className="px-4 py-2 font-medium">{formatINR(row.balance)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  )}

                  <AffiliateRecommendations calculatorType="emi" result={emiResult} isDarkMode={false} />
                  <ResultActions title="EMI summary" summaryLines={emiShareLines} fileName="upaman-emi-summary.txt" />
                  <SavedScenarios storageKey="upaman:loan-calculator:emi-scenarios" currentScenario={emiScenario} defaultName={`EMI ${emiResult.displayTenure}`} onLoadScenario={restoreEMIScenario} disabled={!emiResult} />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prepayment' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <div className="space-y-4">
                <NumberField id="pre-out" label="Outstanding principal" prefix="₹" value={prepaymentParams.outstandingAmount} onChange={(v) => setPrepaymentParams((p) => ({ ...p, outstandingAmount: num(v) }))} />
                <NumberField id="pre-emi" label="Current EMI" prefix="₹" value={prepaymentParams.currentEMI} onChange={(v) => setPrepaymentParams((p) => ({ ...p, currentEMI: num(v) }))} />
                <div className="grid grid-cols-2 gap-3">
                  <NumberField id="pre-rem" label="Remaining tenure" step={0.1} value={prepaymentParams.remainingMonths} onChange={(v) => setPrepaymentParams((p) => ({ ...p, remainingMonths: num(v) }))} />
                  <SelectField id="pre-unit" label="Unit" value={prepaymentParams.remainingTenureUnit} onChange={(v) => setPrepaymentParams((p) => ({ ...p, remainingTenureUnit: v }))} options={unitOptions} />
                </div>
                <NumberField id="pre-rate" label="Interest rate (p.a.)" suffix="%" step={0.1} value={prepaymentParams.interestRate} onChange={(v) => setPrepaymentParams((p) => ({ ...p, interestRate: num(v) }))} />
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="mb-2 text-sm font-semibold text-ink dark:text-slate-100">Custom prepayment</p>
                <div className="flex gap-2">
                  <input type="number" min="0" value={customPrepayment} onChange={(e) => setCustomPrepayment(e.target.value)} placeholder="Enter amount" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
                  <button type="button" onClick={calculateCustom} className="shrink-0 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Check</button>
                </div>
                {customResult && (
                  <div className="mt-3 space-y-1 text-sm text-ink-soft dark:text-slate-300">
                    <p>New EMI: <strong>{customResult.newEMI}</strong></p>
                    <p>Monthly savings: <strong className="text-emerald-600 dark:text-emerald-400">{customResult.monthlySavings}</strong></p>
                    <p>Total savings: <strong className="text-emerald-600 dark:text-emerald-400">{customResult.totalSavings}</strong></p>
                  </div>
                )}
              </div>
            </Card>

            <div className="lg:col-span-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {scenarios.map((s) => (
                  <div key={s.title} className={`rounded-2xl border p-4 ${s.isHighlighted ? 'border-brand-300 bg-brand-50/60 dark:border-brand-700 dark:bg-brand-900/20' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60'}`}>
                    <p className="text-sm font-semibold text-ink dark:text-slate-100">{s.title}</p>
                    <div className="mt-3 space-y-1.5 text-sm">
                      <p className="flex justify-between text-ink-muted dark:text-slate-400">New EMI <span className="font-medium text-ink dark:text-slate-100">{formatINR(s.newEMI)}</span></p>
                      <p className="flex justify-between text-ink-muted dark:text-slate-400">Monthly savings <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatINR(s.monthlySavings)}</span></p>
                      <p className="flex justify-between text-ink-muted dark:text-slate-400">Total savings <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatINR(s.totalSavings)}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            reviewedOn="June 28, 2026"
            inputs={['Loan amount, annual interest rate, and tenure in months/years', 'Prepayment analysis uses outstanding principal and remaining tenure']}
            formulas={['EMI = P × r × (1+r)^n / ((1+r)^n - 1)', 'Amortization: monthly interest = outstanding × monthly rate']}
            assumptions={['Interest rate stays constant through the selected tenure', 'Prepayment scenarios keep tenure fixed and estimate EMI impact', 'Results are planning estimates, not lender-sanctioned repayment schedules']}
            sources={[{ label: 'RBI Financial Education (loan basics)', url: 'https://www.rbi.org.in/financialeducation/' }]}
            guideLinks={[{ label: 'EMI prepayment strategy guide', href: '/guide-emi-prepayment-strategy.html' }, { label: 'Credit card minimum due trap guide', href: '/guide-credit-card-minimum-due-trap.html' }]}
          />
        </div>
      
        <HowToSection
          name="How to use the EMI Calculator"
          description="Work out your monthly loan instalment and total interest in a few steps."
          steps={[
            { name: "Enter the loan amount", text: "Type the principal you plan to borrow." },
            { name: "Set the interest rate", text: "Enter the annual interest rate offered by your lender." },
            { name: "Choose the tenure", text: "Set the repayment period in years or months." },
            { name: "Review your EMI", text: "See the monthly instalment, total interest, and total amount payable update instantly." },
            { name: "Explore the breakdown", text: "Check the principal-vs-interest split and amortization schedule." }
          ]}
        />

      </CalcLayout>

      <CalculatorArticleLayout
        title="EMI and Loan Calculator India: EMI, Interest Split, and Prepayment Impact"
        summary={(<p style={{ margin: 0 }}>Start with calculator-first EMI and prepayment analysis, then review full educational notes on formulas, examples, mistakes, and decision tips below the tool.</p>)}
        trustPanel={(
          <EEATPanel
            author="Upaman Research Team"
            reviewer="Credit and Lending Review Desk (Upaman)"
            reviewedOn="June 28, 2026"
            scope="Covers fixed-rate EMI projections and prepayment scenario estimates for education and planning."
            sources={eeatSources}
          />
        )}
        intro={(
          <>
            <p>Loan decisions are rarely just about whether a bank approves your application. The real question is whether the EMI structure fits your long-term cash flow without creating pressure on emergency savings and essential spending. A practical calculator should therefore explain how EMI is formed, how much of each payment goes to interest, and how early prepayment can reduce total cost. This page is built for that planning workflow, not just a one-line EMI output.</p>
            <p>Many borrowers focus only on monthly EMI and ignore total interest over the full tenure. Two loans can show similar EMIs but very different total outflow depending on tenure and rate. Extending tenure often lowers monthly burden but increases total interest materially. Shortening tenure raises EMI but may reduce lifetime cost. This calculator surfaces both views so you can balance affordability and efficiency.</p>
            <p>The second major decision is prepayment. If you receive bonus income, sale proceeds, or annual surplus, a partial prepayment may produce meaningful savings. However, impact depends on outstanding principal, remaining tenure, and current rate. Random guesses are risky because a prepayment that looks large may still deliver limited savings if done late in tenure. The built-in prepayment scenarios here help you test alternatives quickly before you commit funds.</p>
          </>
        )}
        explanation={(
          <>
            <p>EMI calculation follows the reducing-balance formula. Principal (P), monthly interest rate (r), and total installments (n) are used to derive a constant monthly payment. Although EMI amount stays constant in a standard schedule, the composition changes: early payments carry higher interest share because outstanding principal is highest at the start. As principal reduces, interest portion declines and principal repayment increases.</p>
            <p>That changing composition is why amortization view is critical. Without it, borrowers often underestimate how much interest is front-loaded in initial years. The schedule table in this page provides month-level visibility for payment amount, principal component, interest component, and remaining balance. This helps in refinance timing, cash-flow forecasting, and discipline around annual prepayment opportunities.</p>
            <p>Prepayment analysis in this calculator starts from outstanding principal and remaining tenure. For each scenario, prepayment amount is deducted first, then a revised EMI is estimated for remaining months at the chosen rate. Monthly and total savings are shown so you can compare options instead of acting on intuition. A custom prepayment field allows testing your exact surplus amount beyond predefined percentages.</p>
            <p>This model is designed for planning. Real loans may include floating rates, reset clauses, processing charges, foreclosure conditions, and lender-specific rules around EMI-versus-tenure adjustment after prepayment. Use this page to shortlist decisions quickly, then confirm execution details with your lender schedule before final action.</p>
          </>
        )}
        example={(
          <>
            <p>Consider a home loan of ₹25,00,000 at 8.5% annual interest for 20 years. EMI mode estimates monthly EMI, total payment, and total interest over full tenure. Suppose the result shows EMI around ₹21,700 (illustrative) with substantial cumulative interest over 240 months. Now assume after a few years your outstanding principal is ₹25,77,227 and you can prepay 20% once.</p>
            <p>In prepayment mode, enter outstanding amount, current EMI, remaining tenure, and rate. The scenario card then shows revised EMI and savings. If monthly savings and total projected savings are strong relative to your liquidity needs, prepayment may be worth it. If savings are modest and emergency reserves are tight, retaining cash can be more prudent. This structured comparison is the reason prepayment should be modeled, not guessed.</p>
          </>
        )}
        tips={(
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            <li>Do not evaluate loans on EMI alone; always compare total interest outflow.</li>
            <li>Use realistic tenure assumptions; very long tenures can mask high total borrowing cost.</li>
            <li>Run prepayment scenarios before using bonus cash on discretionary spending.</li>
            <li>Keep an emergency buffer before large prepayment actions.</li>
            <li>Recalculate after rate changes, refinance events, or significant income shifts.</li>
          </ul>
        )}
        faq={(
          <>
            {faqItems.map((item) => (
              <div key={item.question} style={{ marginBottom: '0.65rem' }}>
                <h3 style={{ margin: '0 0 0.15rem', fontSize: '0.95rem', color: '#0f2a43' }}>{item.question}</h3>
                <p style={{ margin: 0 }}>{item.answer}</p>
              </div>
            ))}
          </>
        )}
        relatedGuides={relatedGuides}
        nextStepTools={nextStepTools}
        methodology={(
          <>
            <p>Methodology uses standard reducing-balance EMI mathematics and month-level amortization expansion. Prepayment scenarios recompute payment effect after principal reduction while holding remaining months and rate assumptions constant in this model.</p>
            <p>Assumptions: fixed-rate behavior for projection, no processing-fee effects, and no dynamic reset modeling. Real lender outcomes can vary because of contractual clauses and floating benchmarks. Validate major financial decisions with lender amortization statements.</p>
          </>
        )}
      >
        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Use the calculator above for fresh EMI planning or switch to prepayment mode for savings analysis.</p>
      </CalculatorArticleLayout>
    </>
  );
});

ComprehensiveLoanCalculator.displayName = 'ComprehensiveLoanCalculator';

export default ComprehensiveLoanCalculator;
