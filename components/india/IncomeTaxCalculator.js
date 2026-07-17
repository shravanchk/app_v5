import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from '../AffiliateRecommendations';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import CalculatorArticleLayout from '../calculator/CalculatorArticleLayout';
import EEATPanel from '../calculator/EEATPanel';
import { editorialProfiles } from '../../utils/editorialProfiles';
import { PieBreakdownChart, ComparisonBars } from '../calculator/ResultVisualizations';
import ResultActions from '../ResultActions';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';
const { calculateIndianIncomeTax } = require('../../utils/taxCalculations');

const IncomeTaxCalculator = () => {
  const [activeTab, setActiveTab] = useState('salary-tax');
  const [comparisonParams, setComparisonParams] = useState({ annualIncome: 800000, deductions: 0 });
  const [comparisonResult, setComparisonResult] = useState(null);
  const [salaryParams, setSalaryParams] = useState({ annualSalary: 1200000, regime: 'new', hra: 0, rentPaid: 0, section80C: 150000, section80D: 25000, nps: 50000, homeLoanInterest: 0, otherDeductions: 0 });
  const [businessParams, setBusinessParams] = useState({ grossIncome: 2000000, businessExpenses: 500000, depreciation: 50000, otherDeductions: 0, advanceTax: 0 });
  const [salaryTaxResult, setSalaryTaxResult] = useState(null);
  const [businessTaxResult, setBusinessTaxResult] = useState(null);

  // FY 2026-27 (AY 2027-28). Budget 2026 retained the prior-year slab structure.
  const taxSlabs = useMemo(() => ({
    old: [
      { min: 0, max: 250000, rate: 0 }, { min: 250000, max: 500000, rate: 5 },
      { min: 500000, max: 1000000, rate: 20 }, { min: 1000000, max: Infinity, rate: 30 },
    ],
    new: [
      { min: 0, max: 400000, rate: 0 }, { min: 400000, max: 800000, rate: 5 },
      { min: 800000, max: 1200000, rate: 10 }, { min: 1200000, max: 1600000, rate: 15 },
      { min: 1600000, max: 2000000, rate: 20 }, { min: 2000000, max: 2400000, rate: 25 },
      { min: 2400000, max: Infinity, rate: 30 },
    ],
  }), []);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  const num = (v) => Number(v) || 0;

  const calculateSalaryTax = useCallback(() => {
    const { annualSalary, regime, hra, rentPaid, section80C, section80D, nps, homeLoanInterest, otherDeductions } = salaryParams;
    if (!annualSalary) return;
    let deductions = 0;
    if (regime === 'old') {
      deductions += Math.min(50000, annualSalary);
      if (hra > 0 && rentPaid > 0) deductions += Math.max(0, Math.min(hra, rentPaid - annualSalary * 0.1, annualSalary * 0.5));
      deductions += Math.min(section80C, 150000);
      deductions += Math.min(section80D, 25000);
      deductions += Math.min(nps, 50000);
      deductions += Math.min(homeLoanInterest, 200000);
      deductions += otherDeductions;
    } else {
      deductions += Math.min(75000, annualSalary);
    }
    const taxableIncome = Math.max(0, annualSalary - deductions);
    const taxResult = calculateIndianIncomeTax(taxableIncome, regime);
    const finalTax = taxResult.totalTax;
    setSalaryTaxResult({
      grossSalary: annualSalary, totalDeductions: deductions, taxableIncome,
      incomeTax: taxResult.slabTax, cess: taxResult.cess, rebate: taxResult.rebate, marginalRelief: taxResult.marginalRelief,
      totalTax: finalTax, netSalary: annualSalary - finalTax, breakdown: taxResult.breakdown, regime,
      effectiveRate: annualSalary > 0 ? (finalTax / annualSalary) * 100 : 0,
    });
  }, [salaryParams]);

  const calculateBusinessTax = useCallback(() => {
    const { grossIncome, businessExpenses, depreciation, otherDeductions, advanceTax } = businessParams;
    if (!grossIncome) return;
    const totalExpenses = businessExpenses + depreciation + otherDeductions;
    const netProfit = Math.max(0, grossIncome - totalExpenses);
    const taxResult = calculateIndianIncomeTax(netProfit, 'old');
    const balanceTax = Math.max(0, taxResult.totalTax - advanceTax);
    setBusinessTaxResult({
      grossIncome, totalExpenses, netProfit, taxableIncome: netProfit,
      incomeTax: taxResult.slabTax, cess: taxResult.cess, totalTax: taxResult.totalTax, advanceTax, balanceTax,
      breakdown: taxResult.breakdown, effectiveRate: grossIncome > 0 ? (taxResult.totalTax / grossIncome) * 100 : 0,
    });
  }, [businessParams]);

  const calculateTaxComparison = useCallback(() => {
    const { annualIncome, deductions } = comparisonParams;
    if (!annualIncome || annualIncome <= 0) { setComparisonResult(null); return; }
    const oldRegimeTaxableIncome = Math.max(0, annualIncome - Math.min(50000, annualIncome) - deductions);
    const newRegimeTaxableIncome = Math.max(0, annualIncome - Math.min(75000, annualIncome));
    const oldRegimeFinalTax = calculateIndianIncomeTax(oldRegimeTaxableIncome, 'old').totalTax;
    const newRegimeFinalTax = calculateIndianIncomeTax(newRegimeTaxableIncome, 'new').totalTax;
    setComparisonResult({
      oldRegimeTax: oldRegimeFinalTax, newRegimeTax: newRegimeFinalTax,
      taxDifference: Math.abs(oldRegimeFinalTax - newRegimeFinalTax),
      betterRegime: oldRegimeFinalTax < newRegimeFinalTax ? 'old' : 'new',
      oldRegimeTakeHome: annualIncome - oldRegimeFinalTax, newRegimeTakeHome: annualIncome - newRegimeFinalTax,
    });
  }, [comparisonParams]);

  useEffect(() => { if (activeTab === 'salary-tax') calculateSalaryTax(); }, [activeTab, calculateSalaryTax]);
  useEffect(() => { if (activeTab === 'business-tax') calculateBusinessTax(); }, [activeTab, calculateBusinessTax]);
  useEffect(() => { if (activeTab === 'tax-comparison') calculateTaxComparison(); }, [activeTab, calculateTaxComparison]);

  const jsonLdData = buildSoftwareApplicationSchema({
    name: 'Income Tax Calculator India FY 2026-27',
    url: 'https://upaman.com/income-tax-calculator',
    description: 'Free online income tax calculator for India FY 2026-27. Calculate salary tax and compare old and new tax regimes with rebate, marginal relief, and cess.',
    featureList: ['Salary Tax Calculator', 'Business Income Tax Calculator', 'Old vs New Tax Regime Comparison', 'Tax Slabs FY 2026-27', 'Section 80C, 80D Deductions', 'HRA Exemption Calculator'],
  });
  const salaryShareLines = salaryTaxResult ? [`Gross salary: ${formatCurrency(salaryTaxResult.grossSalary)}`, `Taxable income: ${formatCurrency(salaryTaxResult.taxableIncome)}`, `Total tax: ${formatCurrency(salaryTaxResult.totalTax)}`, `Net salary after tax: ${formatCurrency(salaryTaxResult.netSalary)}`, `Regime: ${salaryTaxResult.regime}`] : [];
  const businessShareLines = businessTaxResult ? [`Gross income: ${formatCurrency(businessTaxResult.grossIncome)}`, `Total expenses: ${formatCurrency(businessTaxResult.totalExpenses)}`, `Taxable profit: ${formatCurrency(businessTaxResult.taxableIncome)}`, `Total tax: ${formatCurrency(businessTaxResult.totalTax)}`, `Balance tax to pay: ${formatCurrency(businessTaxResult.balanceTax)}`] : [];
  const comparisonShareLines = comparisonResult ? [`Old regime tax: ${formatCurrency(comparisonResult.oldRegimeTax)}`, `New regime tax: ${formatCurrency(comparisonResult.newRegimeTax)}`, `Tax difference: ${formatCurrency(comparisonResult.taxDifference)}`, `Better regime: ${comparisonResult.betterRegime === 'old' ? 'Old regime' : 'New regime'}`] : [];

  const faqItems = [
    { question: 'Does this calculator include cess and rebate under section 87A?', answer: 'Yes. After slab-wise tax computation, health and education cess is added, and then section 87A rebate logic is applied where eligibility conditions are met.' },
    { question: 'Can I compare old and new tax regimes with deductions?', answer: 'Yes. The comparison mode models old-regime deductions and compares final outflow with new-regime treatment so you can choose the better regime for planning.' },
    { question: 'Does this replace filing through the official income tax portal?', answer: 'No. Use this tool for planning and scenario analysis. Return filing should still be completed using official utilities and verified records.' },
    { question: 'Can salaried and business users both use this page?', answer: 'Yes. Salary-tax and business-tax tabs are provided separately so the assumptions and cash-flow context stay clear.' },
  ];
  const faqSchema = buildFaqSchema(faqItems);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'Income Tax Calculator', item: 'https://upaman.com/income-tax-calculator' },
  ]);
  const relatedGuides = [
    { label: 'FY 2026-27 income tax slabs guide', href: '/guides/india-income-tax-2026-27' },
    { label: 'Tax on ₹12 lakh salary (why it is ₹0)', href: '/guides/tax-on-12-lakh-salary-fy-2026-27' },
    { label: 'Old vs new regime breakeven', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27' },
    { label: 'Marginal relief explained', href: '/guides/marginal-relief-new-regime-fy-2026-27' },
    { label: 'Standard deduction ₹75,000 vs ₹50,000', href: '/guides/standard-deduction-fy-2026-27' },
    { label: 'CTC to in-hand breakdown guide', href: '/guides/ctc-to-in-hand-salary' },
    { label: 'How to file your ITR (AY 2026-27)', href: '/guides/how-to-file-itr' },
    { label: 'HRA exemption: how it is calculated', href: '/guides/hra-exemption-calculation' },
  ];
  const nextStepTools = [
    { label: 'Tax regime comparison tool', href: '/tax-regime-comparison' },
    { label: 'Salary calculator (CTC to in-hand)', href: '/salary-calculator' },
    { label: 'SIP calculator for tax-savings planning', href: '/sip-calculator' },
    { label: 'PPF calculator for Section 80C planning', href: '/ppf-calculator' },
  ];
  const eeatSources = [
    { label: 'Income Tax Department', url: 'https://www.incometax.gov.in/' },
    { label: 'CBDT', url: 'https://incometaxindia.gov.in/' },
    { label: 'Union Budget 2026', url: 'https://www.indiabudget.gov.in/' },
  ];

  const regimeOptions = [{ value: 'new', label: 'New regime (default)' }, { value: 'old', label: 'Old regime' }];
  const Row = ({ label, value, strong, tone }) => (
    <div className={`flex justify-between py-1.5 text-sm ${strong ? 'font-semibold' : ''}`}>
      <span className="text-ink-muted dark:text-slate-400">{label}</span>
      <span className={tone === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink dark:text-slate-100'}>{value}</span>
    </div>
  );

  return (
    <>
      <Head>
        <title>Income Tax Calculator India FY 2026-27 | Old vs New Regime | Upaman</title>
        <meta name="description" content="Free income tax calculator for India FY 2026-27 (AY 2027-28). Calculate salary and business tax, compare old vs new regime with rebate, marginal relief and cess." />
        <meta name="keywords" content="income tax calculator India, FY 2026-27 tax calculator, old vs new regime, salary tax calculator, 87A rebate, tax slabs 2026-27" />
        <link rel="canonical" href="https://upaman.com/income-tax-calculator" />
        <meta property="og:title" content="Income Tax Calculator India FY 2026-27 | Upaman" />
        <meta property="og:description" content="Old vs new regime tax comparison with deductions & slab details." />
        <meta property="og:url" content="https://upaman.com/income-tax-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout eyebrow="Taxes" title="Income Tax Calculator" subtitle="Estimate salary and business income tax for FY 2026-27, and compare the old and new regimes — with rebate, marginal relief and 4% cess.">
        <div className="mb-6">
          <Tabs tabs={[{ id: 'salary-tax', label: 'Salary tax' }, { id: 'business-tax', label: 'Business tax' }, { id: 'tax-comparison', label: 'Old vs new' }]} active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === 'salary-tax' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <div className="space-y-4">
                <NumberField id="s-sal" label="Annual salary (gross)" prefix="₹" value={salaryParams.annualSalary} onChange={(v) => setSalaryParams((p) => ({ ...p, annualSalary: num(v) }))} />
                <SelectField id="s-regime" label="Tax regime" value={salaryParams.regime} onChange={(v) => setSalaryParams((p) => ({ ...p, regime: v }))} options={regimeOptions} />
                {salaryParams.regime === 'old' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField id="s-80c" label="Section 80C" prefix="₹" value={salaryParams.section80C} onChange={(v) => setSalaryParams((p) => ({ ...p, section80C: num(v) }))} />
                      <NumberField id="s-80d" label="Section 80D" prefix="₹" value={salaryParams.section80D} onChange={(v) => setSalaryParams((p) => ({ ...p, section80D: num(v) }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField id="s-nps" label="NPS 80CCD(1B)" prefix="₹" value={salaryParams.nps} onChange={(v) => setSalaryParams((p) => ({ ...p, nps: num(v) }))} />
                      <NumberField id="s-hli" label="Home-loan interest" prefix="₹" value={salaryParams.homeLoanInterest} onChange={(v) => setSalaryParams((p) => ({ ...p, homeLoanInterest: num(v) }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField id="s-hra" label="HRA received" prefix="₹" value={salaryParams.hra} onChange={(v) => setSalaryParams((p) => ({ ...p, hra: num(v) }))} />
                      <NumberField id="s-rent" label="Rent paid" prefix="₹" value={salaryParams.rentPaid} onChange={(v) => setSalaryParams((p) => ({ ...p, rentPaid: num(v) }))} />
                    </div>
                    <NumberField id="s-other" label="Other deductions" prefix="₹" value={salaryParams.otherDeductions} onChange={(v) => setSalaryParams((p) => ({ ...p, otherDeductions: num(v) }))} />
                  </>
                ) : (
                  <p className="text-xs text-ink-muted dark:text-slate-500">New regime applies a flat ₹75,000 standard deduction; most other deductions don&rsquo;t apply.</p>
                )}
              </div>
            </Card>

            <div className="space-y-5 lg:col-span-3">
              {salaryTaxResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultStat label="Total tax payable" value={formatCurrency(salaryTaxResult.totalTax)} emphasis />
                    <ResultStat label="Net salary (after tax)" value={formatCurrency(salaryTaxResult.netSalary)} tone="positive" />
                    <ResultStat label="Taxable income" value={formatCurrency(salaryTaxResult.taxableIncome)} />
                    <ResultStat label="Effective rate" value={`${salaryTaxResult.effectiveRate.toFixed(2)}%`} />
                  </div>
                  <Card className="p-5">
                    <Row label="Gross salary" value={formatCurrency(salaryTaxResult.grossSalary)} />
                    <Row label="Total deductions" value={`− ${formatCurrency(salaryTaxResult.totalDeductions)}`} />
                    <Row label="Slab tax" value={formatCurrency(salaryTaxResult.incomeTax)} />
                    {salaryTaxResult.rebate > 0 && <Row label="Section 87A rebate" value={`− ${formatCurrency(salaryTaxResult.rebate)}`} />}
                    {salaryTaxResult.marginalRelief > 0 && <Row label="Marginal relief" value={`− ${formatCurrency(salaryTaxResult.marginalRelief)}`} />}
                    <Row label="Health & education cess (4%)" value={formatCurrency(salaryTaxResult.cess)} />
                    <div className="mt-1 border-t border-slate-100 pt-1 dark:border-slate-700"><Row label="Total tax" value={formatCurrency(salaryTaxResult.totalTax)} strong /></div>
                  </Card>
                  <Card className="p-5"><PieBreakdownChart title="Tax vs take-home" items={[{ label: 'Total tax', value: salaryTaxResult.totalTax, color: '#ef4444' }, { label: 'Net salary', value: salaryTaxResult.netSalary, color: '#10b981' }]} formatter={formatCurrency} /></Card>
                  <AffiliateRecommendations calculatorType="income-tax" result={salaryTaxResult} isDarkMode={false} />
                  <ResultActions title="Income tax summary" summaryLines={salaryShareLines} fileName="upaman-income-tax.txt" />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'business-tax' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <div className="space-y-4">
                <NumberField id="b-gross" label="Gross business income" prefix="₹" value={businessParams.grossIncome} onChange={(v) => setBusinessParams((p) => ({ ...p, grossIncome: num(v) }))} />
                <NumberField id="b-exp" label="Business expenses" prefix="₹" value={businessParams.businessExpenses} onChange={(v) => setBusinessParams((p) => ({ ...p, businessExpenses: num(v) }))} />
                <NumberField id="b-dep" label="Depreciation" prefix="₹" value={businessParams.depreciation} onChange={(v) => setBusinessParams((p) => ({ ...p, depreciation: num(v) }))} />
                <NumberField id="b-other" label="Other deductions" prefix="₹" value={businessParams.otherDeductions} onChange={(v) => setBusinessParams((p) => ({ ...p, otherDeductions: num(v) }))} />
                <NumberField id="b-adv" label="Advance tax paid" prefix="₹" value={businessParams.advanceTax} onChange={(v) => setBusinessParams((p) => ({ ...p, advanceTax: num(v) }))} />
              </div>
            </Card>
            <div className="space-y-5 lg:col-span-3">
              {businessTaxResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultStat label="Total tax" value={formatCurrency(businessTaxResult.totalTax)} emphasis />
                    <ResultStat label="Balance tax to pay" value={formatCurrency(businessTaxResult.balanceTax)} />
                    <ResultStat label="Taxable profit" value={formatCurrency(businessTaxResult.netProfit)} />
                    <ResultStat label="Effective rate" value={`${businessTaxResult.effectiveRate.toFixed(2)}%`} />
                  </div>
                  <Card className="p-5">
                    <Row label="Gross income" value={formatCurrency(businessTaxResult.grossIncome)} />
                    <Row label="Total expenses" value={`− ${formatCurrency(businessTaxResult.totalExpenses)}`} />
                    <Row label="Taxable profit" value={formatCurrency(businessTaxResult.netProfit)} />
                    <Row label="Slab tax" value={formatCurrency(businessTaxResult.incomeTax)} />
                    <Row label="Cess (4%)" value={formatCurrency(businessTaxResult.cess)} />
                    <Row label="Advance tax paid" value={`− ${formatCurrency(businessTaxResult.advanceTax)}`} />
                    <div className="mt-1 border-t border-slate-100 pt-1 dark:border-slate-700"><Row label="Balance tax payable" value={formatCurrency(businessTaxResult.balanceTax)} strong /></div>
                  </Card>
                  <Card className="p-5"><PieBreakdownChart title="Tax vs retained profit" items={[{ label: 'Total tax', value: businessTaxResult.totalTax, color: '#ef4444' }, { label: 'Retained profit', value: Math.max(0, businessTaxResult.netProfit - businessTaxResult.totalTax), color: '#10b981' }]} formatter={formatCurrency} /></Card>
                  <ResultActions title="Business tax summary" summaryLines={businessShareLines} fileName="upaman-business-tax.txt" />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tax-comparison' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <div className="space-y-4">
                <NumberField id="c-inc" label="Annual income" prefix="₹" value={comparisonParams.annualIncome} onChange={(v) => setComparisonParams((p) => ({ ...p, annualIncome: num(v) }))} />
                <NumberField id="c-ded" label="Old-regime deductions (80C, 80D, HRA, etc.)" prefix="₹" value={comparisonParams.deductions} onChange={(v) => setComparisonParams((p) => ({ ...p, deductions: num(v) }))} hint="Total deductions you'd claim under the old regime (excludes standard deduction)." />
              </div>
            </Card>
            <div className="space-y-5 lg:col-span-3">
              {comparisonResult && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className={`rounded-2xl border p-4 ${comparisonResult.betterRegime === 'old' ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-900/20' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60'}`}>
                      <p className="text-sm font-semibold text-ink dark:text-slate-100">Old regime {comparisonResult.betterRegime === 'old' && <span className="text-emerald-600">· better</span>}</p>
                      <p className="mt-2 font-display text-xl font-bold text-ink dark:text-white">{formatCurrency(comparisonResult.oldRegimeTax)}</p>
                      <p className="text-sm text-ink-muted dark:text-slate-400">Take-home {formatCurrency(comparisonResult.oldRegimeTakeHome)}</p>
                    </div>
                    <div className={`rounded-2xl border p-4 ${comparisonResult.betterRegime === 'new' ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-900/20' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60'}`}>
                      <p className="text-sm font-semibold text-ink dark:text-slate-100">New regime {comparisonResult.betterRegime === 'new' && <span className="text-emerald-600">· better</span>}</p>
                      <p className="mt-2 font-display text-xl font-bold text-ink dark:text-white">{formatCurrency(comparisonResult.newRegimeTax)}</p>
                      <p className="text-sm text-ink-muted dark:text-slate-400">Take-home {formatCurrency(comparisonResult.newRegimeTakeHome)}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-sm font-semibold text-ink dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-slate-100">
                    {comparisonResult.betterRegime === 'old' ? 'Old' : 'New'} regime saves {formatCurrency(comparisonResult.taxDifference)} in tax.
                  </div>
                  <Card className="p-5"><ComparisonBars title="Tax by regime" items={[{ label: 'Old regime tax', value: comparisonResult.oldRegimeTax, color: '#6366f1' }, { label: 'New regime tax', value: comparisonResult.newRegimeTax, color: '#2563eb' }]} formatter={formatCurrency} /></Card>
                  <ResultActions title="Regime comparison summary" summaryLines={comparisonShareLines} fileName="upaman-regime-comparison.txt" />
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-10">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            reviewedOn="June 28, 2026"
            inputs={['Annual income (salary or business), selected regime, and applicable deductions', 'Old regime deductions include 80C/80D/NPS/HRA/home-loan fields when provided']}
            formulas={['Slab-wise marginal tax computation by regime', 'Health and education cess applied after base tax', 'Section 87A rebate logic applied where eligible']}
            assumptions={['Rates and slab structures are modeled for FY 2026-27 / AY 2027-28; Budget 2026 retained the prior-year slabs', 'Surcharge, special incomes, and complex exemptions are not fully modeled', 'Use results for planning; file taxes using official utilities or a qualified advisor']}
            sources={[{ label: 'Income Tax Department (India)', url: 'https://www.incometax.gov.in/' }, { label: 'Union Budget 2026', url: 'https://www.indiabudget.gov.in/' }, { label: 'CBDT notifications and circulars', url: 'https://incometaxindia.gov.in/' }]}
            guideLinks={[{ label: 'Old vs new regime guide', href: '/guides/income-tax-regime-choice' }, { label: 'CTC to in-hand breakdown guide', href: '/guides/ctc-to-in-hand-salary' }]}
          />
        </div>
      
        <HowToSection
          name="How to use the Income Tax Calculator"
          description="Estimate your Indian income tax under the chosen regime."
          steps={[
            { name: "Enter your annual income", text: "Type your gross salary or total income for the year." },
            { name: "Choose the tax regime", text: "Select the old or new regime to compare your liability." },
            { name: "Add your deductions", text: "Enter eligible deductions such as 80C, 80D, and HRA." },
            { name: "Review your tax", text: "See your taxable income, tax payable, and take-home estimate." }
          ]}
        />

      </CalcLayout>

      <CalculatorArticleLayout
        title="Income Tax Calculator India (FY 2026-27): Old vs New Regime With Worked Examples"
        summary={(<p style={{ margin: 0 }}>Estimate salary and business tax, compare old vs new regime, and review take-home impact quickly. Use the calculator first, then scroll for detailed explanation, examples, FAQ, and methodology.</p>)}
        trustPanel={(
          <EEATPanel author={editorialProfiles.researchTeam} reviewer="Tax Policy Review Desk (Upaman)" reviewedOn="June 28, 2026" scope="Covers slab-based tax planning estimates for salaried and business users under FY 2026-27 / AY 2027-28 assumptions." sources={eeatSources} />
        )}
        intro={(
          <>
            <p>Income tax planning in India is not only about finding the tax amount at the end of the year. For most people, the real decision is how salary, deductions, regime selection, and take-home cash flow fit together month by month. A practical calculator should therefore help you do more than one action: it should estimate salary tax, compare old and new regimes, and show how deductions change taxable income. This page is built with that exact goal.</p>
            <p>The Indian tax framework for FY 2026-27 (AY 2027-28) uses slab-based marginal taxation. Budget 2026 retained the prior-year slab structure. That means each slab of income is taxed at a different rate, not your full income at the top slab. Many taxpayers overestimate their liability because they assume crossing a slab pushes all income into the higher rate. The correct method is incremental and this calculator follows that approach. After base tax, cess is applied and eligible rebate logic is considered so the output reflects a realistic planning estimate.</p>
            <p>You can use this page in three ways. First, salaried users can model standard deduction and old-regime items like 80C, 80D, NPS, HRA, and home-loan interest. Second, business users can estimate tax from net profit after costs and depreciation. Third, the comparison tab highlights which regime currently delivers lower tax and stronger take-home. Together these flows reduce guesswork before payroll planning, advance tax decisions, and investment allocation.</p>
          </>
        )}
        explanation={(
          <>
            <p>The core engine is slab-wise marginal computation. In simple terms, taxable income is split into ranges, and each range is multiplied by its own rate. For example, if a part of your income sits in a 5% band and the next part in a 10% band, the calculator applies those rates only to their respective portions. This is the only accurate way to estimate liability under either regime.</p>
            <p>For salary-tax mode, gross annual salary is the starting point. Under the old regime, eligible deductions are applied based on common sections: 80C, 80D, NPS (80CCD 1B), HRA treatment, and home-loan interest. Under the new regime, deduction availability is different, so the calculator applies the configured standard-deduction logic for that regime and then computes taxable income accordingly. The taxable number is then fed into slab rules and cess is added.</p>
            <p>Rebate treatment is important because it can materially change final outflow at lower-to-middle income levels. The calculator checks rebate eligibility after slab tax plus cess and reduces final payable tax where applicable. This sequencing matters: if rebate is modeled incorrectly, the final tax number can be off by thousands. That is why the output includes separate fields for base tax, cess, rebate, and final payable amount.</p>
            <p>Business-tax mode follows a similar structure but starts from gross business income and subtracts operating expenses, depreciation, and other allowable values to arrive at taxable profit. Advance tax paid is then netted out to estimate balance payable. This is useful for cash-flow planning because many owners only look at annual P&L but not interim tax payments. Comparison mode then allows side-by-side old/new results so you can evaluate whether deduction-heavy or simplified filing paths are currently better.</p>
          </>
        )}
        example={(
          <>
            <p>Suppose a salaried user has annual salary of ₹12,00,000 and expects ₹1,50,000 under 80C, ₹25,000 under 80D, and ₹50,000 under NPS. In old-regime view, the calculator first adjusts salary by standard deduction and eligible deductions, then computes slab tax on remaining taxable income. Cess is added and rebate is checked where relevant. In new-regime view, the tool applies new-regime deduction treatment and runs slab math again.</p>
            <p>For that profile the calculator returns old-regime tax of about ₹1,01,400 (taxable income ₹9,25,000 after ₹2,75,000 of deductions, including cess) and new-regime tax of ₹0, because taxable income of ₹11,25,000 after the ₹75,000 standard deduction falls within the Section 87A rebate limit. The comparison card marks the new regime as better by about ₹1,01,400 and shows the higher take-home. If your deduction plans change, you can rerun quickly and see whether the recommendation flips — this scenario-testing workflow is usually more useful than a one-time static estimate.</p>
          </>
        )}
        tips={(
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            <li>Enter annual numbers consistently; avoid mixing monthly deductions with yearly salary.</li>
            <li>Use comparison mode before locking payroll declarations for the year.</li>
            <li>For HRA, maintain rent and allowance records; missing assumptions can skew old-regime output.</li>
            <li>Re-run calculation when income changes due to bonus, switch, or variable pay revision.</li>
            <li>Treat results as planning estimates and verify filing values with official documents.</li>
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
            <p>Methodology is slab-first and regime-aware: compute taxable income, apply slab rates incrementally, add cess, then apply rebate eligibility. Business mode computes taxable profit from gross income minus selected expenses and deductions, then applies tax logic and advance-tax offset for balance payable estimate.</p>
            <p>Assumptions: rates and regime rules in this app are modeled for FY 2026-27 / AY 2027-28 configuration. Special incomes, surcharge edge cases, and rare exemptions are intentionally simplified for planning use. For return filing, validate with official sources and professional advice where required.</p>
          </>
        )}
      >
        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Use the calculator above to switch between salary tax, business tax, and old-vs-new regime comparison.</p>
      </CalculatorArticleLayout>
    </>
  );
};

export default IncomeTaxCalculator;
