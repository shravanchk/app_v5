import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Scale } from 'lucide-react';
import SearchLandingSections from '../calculator/SearchLandingSections';
import EEATPanel from '../calculator/EEATPanel';
import { editorialProfiles } from '../../utils/editorialProfiles';
import { PieBreakdownChart, ComparisonBars } from '../calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, SelectField } from '../ui/Field';
import Card from '../ui/Card';
import { DecisionBanner } from '../workflow/WorkflowKit';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';
const { calculateIndianIncomeTax, INDIA_AGE_BANDS } = require('../../utils/taxCalculations');

const LAST_REVIEWED = 'June 28, 2026';

const TaxRegimeComparisonCalculator = () => {
  const [salary, setSalary] = useState(1500000);
  const [deductions80C, setDeductions80C] = useState(150000);
  const [deductions80D, setDeductions80D] = useState(25000);
  const [hraExemption, setHraExemption] = useState(120000);
  const [otherDeductions, setOtherDeductions] = useState(30000);
  // Only the old regime's exemption moves with age, so this can flip the verdict.
  const [ageBand, setAgeBand] = useState('below60');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const result = useMemo(() => {
    const oldStandardDeduction = Math.min(50000, salary);
    const newStandardDeduction = Math.min(75000, salary);

    const oldDeductions = oldStandardDeduction +
      Math.min(deductions80C, 150000) +
      Math.min(deductions80D, 25000) +
      Math.max(0, hraExemption) +
      Math.max(0, otherDeductions);

    const oldTaxable = Math.max(0, salary - oldDeductions);
    const newTaxable = Math.max(0, salary - newStandardDeduction);

    const oldTotalTax = calculateIndianIncomeTax(oldTaxable, 'old', ageBand).totalTax;
    const newTotalTax = calculateIndianIncomeTax(newTaxable, 'new').totalTax;

    const savings = Math.abs(oldTotalTax - newTotalTax);
    const betterRegime = oldTotalTax <= newTotalTax ? 'Old Regime' : 'New Regime';

    return {
      oldTaxable,
      newTaxable,
      oldTotalTax,
      newTotalTax,
      savings,
      betterRegime
    };
  }, [salary, deductions80C, deductions80D, hraExemption, otherDeductions, ageBand]);

  const oldTakeHome = Math.max(0, salary - result.oldTotalTax);
  const newTakeHome = Math.max(0, salary - result.newTotalTax);
  const recommendedTax = result.betterRegime === 'Old Regime' ? result.oldTotalTax : result.newTotalTax;
  const recommendedTakeHome = result.betterRegime === 'Old Regime' ? oldTakeHome : newTakeHome;
  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Tax Regime Comparison Tool India',
    url: 'https://upaman.com/tax-regime-comparison',
    description: 'Compare old vs new tax regime in India with salary, deductions, cess, and rebate logic.',
    featureList: [
      'Old vs New Regime Comparison',
      'Deduction-aware tax estimate',
      'Take-home and savings comparison'
    ]
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'Tax Regime Comparison', item: 'https://upaman.com/tax-regime-comparison' }
  ]);
  const eeatSources = [
    { label: 'Income Tax Department', url: 'https://www.incometax.gov.in/' },
    { label: 'CBDT', url: 'https://incometaxindia.gov.in/' },
    { label: 'Union Budget 2026', url: 'https://www.indiabudget.gov.in/' }
  ];
  const faqItems = [
    {
      question: 'Which regime is better for high deductions?',
      answer: 'In many cases old regime performs better when eligible deductions are substantial, but exact outcome depends on income and deduction mix.'
    },
    {
      question: 'How much in deductions do I need before the old regime wins?',
      answer: 'More than most people expect. At a ₹15 lakh salary, this tool’s engine finds the crossover at roughly ₹5.4 lakh of combined deductions (80C, 80D, HRA exemption, and others) on top of the old regime’s standard deduction; at ₹25 lakh it is around ₹8 lakh. A full 80C plus typical 80D alone gets nowhere near that — it usually takes a large HRA exemption or home-loan interest to tip the balance.'
    },
    {
      question: 'Why does the new regime show zero tax for my income?',
      answer: 'At lower incomes the Section 87A rebate cancels the computed slab tax entirely under the new regime. For example, a ₹12 lakh salary with the new standard deduction lands in the rebate zone and shows ₹0 payable, while the same profile owes ₹80,600 under the old regime even after a full deduction bundle. The rebate is applied automatically in this comparison.'
    },
    {
      question: 'Can I switch regimes every year?',
      answer: 'Salaried taxpayers can generally choose afresh each year at filing time, so a regime choice is not permanent — re-run this comparison whenever your salary or deductions change materially. Taxpayers with business or professional income face restrictions on switching back once they opt out; confirm the current rules on incometax.gov.in before deciding.'
    },
    {
      question: 'Does this include cess and rebate?',
      answer: 'Yes. The calculator applies cess and basic rebate logic after slab computation for practical planning output.'
    },
    {
      question: 'Can this replace return filing?',
      answer: 'No. Use this for planning decisions. Final filing values should be validated with official documents and rules.'
    }
  ];
  const relatedLinks = [
    { label: 'FY 2026-27 Income Tax Slabs Guide', href: '/guides/india-income-tax-2026-27' },
    { label: 'Old vs New Regime Breakeven (how much in deductions?)', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27' },
    { label: 'Marginal Relief Explained', href: '/guides/marginal-relief-new-regime-fy-2026-27' },
    { label: 'How to File Your ITR (regime is locked at filing)', href: '/guides/how-to-file-itr' },
    { label: 'Income Tax Calculator India', href: '/income-tax-calculator' },
    { label: 'Salary Calculator (CTC to In-hand)', href: '/salary-calculator' },
    { label: 'PPF Calculator for 80C planning', href: '/ppf-calculator' }
  ];

  return (
    <>
      <Head>
        <title>Tax Regime Comparison Tool India (FY 2026-27) | Upaman</title>
        <meta
          name="description"
          content="Compare old vs new tax regime for India FY 2026-27 (AY 2027-28) with deductions, section 87A rebate, marginal relief, and cess."
        />
        <link rel="canonical" href="https://upaman.com/tax-regime-comparison" />
        <meta property="og:title" content="Tax Regime Comparison Tool India (FY 2026-27) | Upaman" />
        <meta property="og:description" content="Compare old vs new tax regime for India FY 2026-27 with deductions, rebate, marginal relief, and cess." />
        <meta property="og:url" content="https://upaman.com/tax-regime-comparison" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tax Regime Comparison Tool India | Upaman" />
        <meta name="twitter:description" content="Old vs new regime comparison for FY 2026-27 with your deductions." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="India · Tax"
        title="Tax Regime Comparison Tool (India)"
        subtitle="Compare old vs new regime with deduction-aware inputs and an instant tax-savings recommendation."
        ratesFor="FY 2026-27"
        reviewedOn={LAST_REVIEWED}
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <NumberField id="trc-salary" label="Annual Salary (INR)" prefix="₹" value={salary} onChange={(v) => setSalary(Number(v) || 0)} />
              <NumberField id="trc-80c" label="80C Deductions" prefix="₹" value={deductions80C} onChange={(v) => setDeductions80C(Number(v) || 0)} />
              <NumberField id="trc-80d" label="80D Deductions" prefix="₹" value={deductions80D} onChange={(v) => setDeductions80D(Number(v) || 0)} />
              <NumberField id="trc-hra" label="HRA Exemption (Old Regime)" prefix="₹" value={hraExemption} onChange={(v) => setHraExemption(Number(v) || 0)} />
              <NumberField id="trc-other" label="Other Deductions" prefix="₹" value={otherDeductions} onChange={(v) => setOtherDeductions(Number(v) || 0)} />
              <SelectField
                id="trc-age"
                label="Age group"
                value={ageBand}
                onChange={setAgeBand}
                options={INDIA_AGE_BANDS.map(({ value, label }) => ({ value, label }))}
                hint="The old regime's basic exemption rises to ₹3,00,000 at 60 and ₹5,00,000 at 80. The new regime does not change with age."
              />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <DecisionBanner
              tone="positive"
              label={`${result.betterRegime} is better`}
              reason={`It saves you ${formatCurrency(result.savings)} based on current inputs.`}
              icon={<Scale size={18} />}
            />
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Old regime tax" value={formatCurrency(result.oldTotalTax)} emphasis={result.betterRegime === 'Old Regime'} />
              <ResultStat label="New regime tax" value={formatCurrency(result.newTotalTax)} emphasis={result.betterRegime === 'New Regime'} />
              <ResultStat label="Old taxable income" value={formatCurrency(result.oldTaxable)} />
              <ResultStat label="New taxable income" value={formatCurrency(result.newTaxable)} />
            </div>

            <Card className="p-5">
              <PieBreakdownChart
                title={`${result.betterRegime}: take-home vs tax`}
                items={[
                  { label: 'Take-home income', value: recommendedTakeHome, color: '#10b981' },
                  { label: 'Tax outflow', value: recommendedTax, color: '#f97316' }
                ]}
                formatter={formatCurrency}
              />
            </Card>

            <Card className="p-5">
              <ComparisonBars
                title="Regime-wise tax and take-home comparison"
                items={[
                  { label: 'Old regime tax', value: result.oldTotalTax, color: '#1d4e89' },
                  { label: 'New regime tax', value: result.newTotalTax, color: '#0f766e' },
                  { label: 'Old regime take-home', value: oldTakeHome, color: '#60a5fa' },
                  { label: 'New regime take-home', value: newTakeHome, color: '#34d399' }
                ]}
                formatter={formatCurrency}
              />
            </Card>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <EEATPanel
            author={editorialProfiles.researchTeam}
            reviewer="Tax Policy Review Desk (Upaman)"
            reviewedOn={LAST_REVIEWED}
            scope="This tool compares old vs new Indian tax regime for FY 2026-27 using slab math, standard deductions, cess, rebate, and marginal-relief checks."
            sources={eeatSources}
          />

          <SearchLandingSections
            intro={(
              <>
                <p>
                  Choosing between old and new tax regime is a high-value decision for salaried professionals. This tool
                  helps you compare both regimes using salary, deductions, and rebate logic so you can choose the regime
                  that minimizes annual tax outflow for your current profile.
                </p>
                <p>
                  The choice is really a trade: the old regime lets you shrink taxable income with deductions — 80C
                  investments, health insurance under 80D, HRA exemption, home-loan interest — while the new regime
                  offers lower slab rates, a larger standard deduction, and a more generous rebate, but takes most
                  deduction doors away. Which side wins is pure arithmetic on your specific numbers, and the answer
                  changes at different income levels even for the same deduction habits. That is why this page asks for
                  your actual deduction amounts instead of offering a rule of thumb.
                </p>
                <p>
                  One habit worth building: run this comparison at declaration time <em>and</em> again before filing.
                  Deductions people plan in April (a full 80C, rent receipts for HRA) do not always materialize by
                  March, and a regime chosen on optimistic assumptions can quietly become the wrong one.
                </p>
              </>
            )}
            example={(
              <>
                <p>
                  Take the defaults: ₹15 lakh salary with ₹1.5 lakh in 80C, ₹25,000 in 80D, ₹1.2 lakh of HRA exemption,
                  and ₹30,000 of other deductions. That is a fairly disciplined deduction profile — ₹3.75 lakh trimmed
                  off taxable income including the standard deduction — yet the new regime still wins: ₹97,500 against
                  ₹1,56,000, a saving of ₹58,500 a year. With no deductions at all, the gap widens to ₹1,59,900.
                </p>
                <p>
                  So where is the crossover? Using this same engine, the old regime only pulls ahead at a ₹15 lakh
                  salary once combined deductions (beyond its ₹50,000 standard deduction) exceed roughly ₹5.4 lakh —
                  territory usually reached only with a substantial HRA exemption in a metro or large home-loan
                  interest. At ₹25 lakh, the bar rises to around ₹8 lakh. And at ₹12 lakh, the comparison is not close:
                  the new regime&rsquo;s rebate takes the bill to zero while the old regime, even fully loaded with the
                  default deduction bundle, still owes ₹80,600.
                </p>
              </>
            )}
            formula={(
              <>
                <p>
                  Both regimes use slab-wise marginal tax computation. Old regime applies standard deduction plus eligible
                  deduction buckets before slab tax. New regime applies its configured standard deduction and slab rates.
                  Cess and rebate checks are applied after base slab tax to derive final payable tax.
                </p>
                <p>
                  The deduction inputs are capped where the law caps them — 80C at ₹1.5 lakh and the 80D field at the
                  standard individual limit — so overtyping a larger number will not flatter the old regime. HRA
                  exemption is taken as you enter it because the exempt amount depends on your rent, salary structure,
                  and city; compute it first with the HRA calculator and paste the result here. The comparison covers
                  salary income only — capital gains are taxed separately under their own rules regardless of regime,
                  so they belong in the capital gains calculator, not in this salary field.
                </p>
              </>
            )}
            faqItems={faqItems}
            relatedLinks={relatedLinks}
          />
        </div>
      
        <HowToSection
          name="How to use the Tax Regime Comparison Calculator"
          description="Compare the old and new Indian tax regimes side by side."
          steps={[
            { name: "Enter your gross salary", text: "Type your total annual income." },
            { name: "Add your deductions", text: "Enter 80C, 80D, HRA, and any other eligible deductions." },
            { name: "Compare both regimes", text: "See the tax payable under the old and new regimes side by side." },
            { name: "Pick the better option", text: "Use the recommended regime and savings figure to decide." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default TaxRegimeComparisonCalculator;
