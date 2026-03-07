import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import HomeButton from './HomeButton';
import SearchLandingSections from './calculator/SearchLandingSections';
import EEATPanel from './calculator/EEATPanel';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/schema';

const oldSlabs = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Number.POSITIVE_INFINITY, rate: 30 }
];

const newSlabs = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 5 },
  { min: 800000, max: 1200000, rate: 10 },
  { min: 1200000, max: 1600000, rate: 15 },
  { min: 1600000, max: 2000000, rate: 20 },
  { min: 2000000, max: 2400000, rate: 25 },
  { min: 2400000, max: Number.POSITIVE_INFINITY, rate: 30 }
];

const calculateSlabTax = (income, slabs) => {
  let tax = 0;
  for (const slab of slabs) {
    if (income > slab.min) {
      const taxable = Math.min(income, slab.max) - slab.min;
      tax += (taxable * slab.rate) / 100;
    }
  }
  return tax;
};

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

    const oldBase = calculateSlabTax(oldTaxable, oldSlabs);
    const newBase = calculateSlabTax(newTaxable, newSlabs);

    const oldCess = oldBase * 0.04;
    const newCess = newBase * 0.04;

    const oldTotalBeforeRebate = oldBase + oldCess;
    const newTotalBeforeRebate = newBase + newCess;

    const oldRebate = oldTaxable <= 500000 ? Math.min(12500, oldTotalBeforeRebate) : 0;
    const newRebate = newTaxable <= 1200000 ? Math.min(60000, newTotalBeforeRebate) : 0;

    const oldTotalTax = Math.max(0, oldTotalBeforeRebate - oldRebate);
    const newTotalTax = Math.max(0, newTotalBeforeRebate - newRebate);

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

  const maxTax = Math.max(result.oldTotalTax, result.newTotalTax, 1);
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
    { label: 'Ministry of Finance', url: 'https://www.finmin.gov.in/' }
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
    { label: 'Income Tax Calculator India', href: '/income-tax-calculator' },
    { label: 'Salary Calculator (CTC to In-hand)', href: '/salary-calculator' },
    { label: 'PPF Calculator for 80C planning', href: '/ppf-calculator' },
    { label: 'Old vs New Regime Guide', href: '/guide-income-tax-regime-choice.html' }
  ];

  return (
    <div className="calculator-container" style={{ background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)' }}>
      <Head>
        <title>Tax Regime Comparison Tool India (FY 2025-26) | Upaman</title>
        <meta
          name="description"
          content="Compare old vs new tax regime in India with salary, deductions, and rebate logic to identify which regime saves more tax."
        />
        <link rel="canonical" href="https://upaman.com/tax-regime-comparison" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />
      </Head>

      <div className="calculator-card">
        <div className="calculator-header tax-header">
          <div className="header-nav">
            <HomeButton style={{ position: 'static', top: 'auto', left: 'auto', zIndex: 'auto' }} />
            <div className="flex-spacer" />
          </div>
          <h1 className="header-title">Tax Regime Comparison Tool (India)</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Compare old vs new regime with deduction-aware inputs and instant tax savings recommendation.
          </p>
        </div>

        <div className="mobile-card-content">
          <section style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#f8fafc', padding: '1rem', marginBottom: '1rem' }}>
            <div className="responsive-grid">
              <div>
                <label className="input-label">Annual Salary (INR)</label>
                <input className="calculator-input mobile-input" type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">80C Deductions</label>
                <input className="calculator-input mobile-input" type="number" value={deductions80C} onChange={(e) => setDeductions80C(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">80D Deductions</label>
                <input className="calculator-input mobile-input" type="number" value={deductions80D} onChange={(e) => setDeductions80D(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">HRA Exemption (Old Regime)</label>
                <input className="calculator-input mobile-input" type="number" value={hraExemption} onChange={(e) => setHraExemption(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Other Deductions</label>
                <input className="calculator-input mobile-input" type="number" value={otherDeductions} onChange={(e) => setOtherDeductions(Number(e.target.value) || 0)} />
              </div>
            </div>
          </section>

          <section style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#ffffff', padding: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ marginTop: 0, color: '#0f2a43', fontSize: '1.05rem' }}>Comparison Result</h2>
            <p style={{ marginTop: 0, color: '#334155' }}>
              <strong>{result.betterRegime}</strong> saves you <strong>{formatCurrency(result.savings)}</strong> based on current inputs.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: '#eff6ff', borderRadius: '0.75rem', padding: '0.8rem' }}>
                <div style={{ color: '#0f2a43', fontWeight: 700, marginBottom: '0.25rem' }}>Old Regime Tax</div>
                <div style={{ color: '#1d4e89', fontSize: '1.1rem', fontWeight: 700 }}>{formatCurrency(result.oldTotalTax)}</div>
                <div style={{ color: '#475569', fontSize: '0.82rem' }}>Taxable: {formatCurrency(result.oldTaxable)}</div>
              </div>
              <div style={{ background: '#ecfeff', borderRadius: '0.75rem', padding: '0.8rem' }}>
                <div style={{ color: '#0f766e', fontWeight: 700, marginBottom: '0.25rem' }}>New Regime Tax</div>
                <div style={{ color: '#0f766e', fontSize: '1.1rem', fontWeight: 700 }}>{formatCurrency(result.newTotalTax)}</div>
                <div style={{ color: '#475569', fontSize: '0.82rem' }}>Taxable: {formatCurrency(result.newTaxable)}</div>
              </div>
            </div>

            <div style={{ marginTop: '0.9rem' }}>
              <div style={{ marginBottom: '0.45rem', color: '#334155', fontSize: '0.86rem' }}>Visual tax comparison</div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.2rem' }}>Old Regime</div>
                  <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${(result.oldTotalTax / maxTax) * 100}%`, height: '100%', background: '#1d4e89' }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.2rem' }}>New Regime</div>
                  <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${(result.newTotalTax / maxTax) * 100}%`, height: '100%', background: '#0f766e' }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <PieBreakdownChart
            title={`${result.betterRegime}: take-home vs tax`}
            items={[
              { label: 'Take-home income', value: recommendedTakeHome, color: '#10b981' },
              { label: 'Tax outflow', value: recommendedTax, color: '#f97316' }
            ]}
            formatter={formatCurrency}
          />

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

          <EEATPanel
            author="Upaman Research Team"
            reviewer="Tax Policy Review Desk (Upaman)"
            reviewedOn="March 7, 2026"
            scope="This tool compares old vs new Indian tax regime using slab math, standard deductions, cess, and rebate checks."
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
      </div>
    </div>
  );
};

export default TaxRegimeComparisonCalculator;
