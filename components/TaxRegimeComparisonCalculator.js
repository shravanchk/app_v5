import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Scale } from 'lucide-react';
import SearchLandingSections from './calculator/SearchLandingSections';
import EEATPanel from './calculator/EEATPanel';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import { NumberField } from './ui/Field';
import Card from './ui/Card';
import { DecisionBanner } from './workflow/WorkflowKit';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/schema';
const { calculateIndianIncomeTax } = require('../utils/taxCalculations');

const TaxRegimeComparisonCalculator = () => {
  const [salary, setSalary] = useState(1500000);
  const [deductions80C, setDeductions80C] = useState(150000);
  const [deductions80D, setDeductions80D] = useState(25000);
  const [hraExemption, setHraExemption] = useState(120000);
  const [otherDeductions, setOtherDeductions] = useState(30000);

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

    const oldTotalTax = calculateIndianIncomeTax(oldTaxable, 'old').totalTax;
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
  }, [salary, deductions80C, deductions80D, hraExemption, otherDeductions]);

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="India · Tax"
        title="Tax Regime Comparison Tool (India)"
        subtitle="Compare old vs new regime with deduction-aware inputs and an instant tax-savings recommendation."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <NumberField id="trc-salary" label="Annual Salary (INR)" prefix="₹" value={salary} onChange={(v) => setSalary(Number(v) || 0)} />
              <NumberField id="trc-80c" label="80C Deductions" prefix="₹" value={deductions80C} onChange={(v) => setDeductions80C(Number(v) || 0)} />
              <NumberField id="trc-80d" label="80D Deductions" prefix="₹" value={deductions80D} onChange={(v) => setDeductions80D(Number(v) || 0)} />
              <NumberField id="trc-hra" label="HRA Exemption (Old Regime)" prefix="₹" value={hraExemption} onChange={(v) => setHraExemption(Number(v) || 0)} />
              <NumberField id="trc-other" label="Other Deductions" prefix="₹" value={otherDeductions} onChange={(v) => setOtherDeductions(Number(v) || 0)} />
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
            author="Upaman Research Team"
            reviewer="Tax Policy Review Desk (Upaman)"
            reviewedOn="June 28, 2026"
            scope="This tool compares old vs new Indian tax regime for FY 2026-27 using slab math, standard deductions, cess, rebate, and marginal-relief checks."
            sources={eeatSources}
          />

          <SearchLandingSections
            intro={(
              <p>
                Choosing between old and new tax regime is a high-value decision for salaried professionals. This tool
                helps you compare both regimes using salary, deductions, and rebate logic so you can choose the regime
                that minimizes annual tax outflow for your current profile.
              </p>
            )}
            example={(
              <p>
                For example, with ₹18,00,000 salary and moderate deductions, the comparison can show whether old regime
                deduction benefits outweigh simplified slab treatment in the new regime. Update deductions to test best
                and worst-case filing scenarios before declaration deadlines.
              </p>
            )}
            formula={(
              <p>
                Both regimes use slab-wise marginal tax computation. Old regime applies standard deduction plus eligible
                deduction buckets before slab tax. New regime applies its configured standard deduction and slab rates.
                Cess and rebate checks are applied after base slab tax to derive final payable tax.
              </p>
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
