import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from '../AffiliateRecommendations';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import EEATPanel from '../calculator/EEATPanel';
import { editorialProfiles } from '../../utils/editorialProfiles';
import { PieBreakdownChart, ComparisonBars } from '../calculator/ResultVisualizations';
import SearchLandingSections from '../calculator/SearchLandingSections';
import ResultActions from '../ResultActions';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';
const { calculateIndianIncomeTax } = require('../../utils/taxCalculations');

const SalaryCalculator = () => {
  const [activeTab, setActiveTab] = useState('ctc-breakdown');
  const [ctcParams, setCTCParams] = useState({ annualCTC: 1200000, city: 'metro', hasHRA: true, pfContribution: 12, gratuityApplicable: true, professionalTax: true });
  const [comparisonParams, setComparisonParams] = useState({ currentSalary: 800000, newSalary: 1200000, currentCity: 'metro', newCity: 'metro' });
  const [ctcResult, setCTCResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  const cityData = useMemo(() => ({
    metro: { name: 'Metro Cities (Mumbai, Delhi, Kolkata, Chennai, Bengaluru, Hyderabad, Pune, Ahmedabad)', hraExemption: 0.5, costMultiplier: 1.0, professionalTax: 2500 },
    nonMetro: { name: 'Non-Metro Cities', hraExemption: 0.4, costMultiplier: 0.7, professionalTax: 2000 },
  }), []);

  const calculateCTCBreakdown = useCallback(() => {
    const { annualCTC, city, hasHRA, pfContribution, gratuityApplicable, professionalTax } = ctcParams;
    if (!annualCTC) return;
    const cityInfo = cityData[city];
    const basicSalary = Math.round(annualCTC * 0.45);
    const hraAmount = hasHRA ? Math.round(basicSalary * 0.5) : 0;
    const pfEmployee = Math.round(basicSalary * (pfContribution / 100));
    const pfEmployer = pfEmployee;
    const esic = annualCTC <= 250000 ? Math.round(annualCTC * 0.0075) : 0;
    const employerEsic = esic > 0 ? Math.round(annualCTC * 0.0325) : 0;
    const professionalTaxAmount = professionalTax ? cityInfo.professionalTax : 0;
    const gratuity = gratuityApplicable ? Math.round(basicSalary * 0.0481) : 0;
    const specialAllowance = Math.round(annualCTC - basicSalary - hraAmount - pfEmployer - gratuity - employerEsic);

    // Tax — FY 2026-27 new regime via the shared engine (slabs + 87A rebate + marginal relief + cess).
    const NEW_REGIME_STANDARD_DEDUCTION = 75000;
    const grossTaxableSalary = basicSalary + hraAmount + specialAllowance - pfEmployee;
    const taxableIncome = Math.max(0, grossTaxableSalary - NEW_REGIME_STANDARD_DEDUCTION);
    const taxResult = calculateIndianIncomeTax(taxableIncome, 'new');
    const totalTax = Math.round(taxResult.totalTax);

    const totalDeductions = pfEmployee + totalTax + professionalTaxAmount + esic;
    const grossMonthlySalary = Math.round((basicSalary + hraAmount + specialAllowance) / 12);
    const netMonthlySalary = Math.round((basicSalary + hraAmount + specialAllowance - totalDeductions) / 12);
    const netAnnualSalary = netMonthlySalary * 12;
    const takeHomePercentage = (netAnnualSalary / annualCTC) * 100;

    setCTCResult({
      annualCTC, basicSalary, hraAmount, specialAllowance, grossMonthlySalary, netMonthlySalary, netAnnualSalary,
      deductions: { pfEmployee, pfEmployer, incomeTax: totalTax, professionalTax: professionalTaxAmount, esic, total: totalDeductions },
      employerContributions: { pfEmployer, gratuity, esic: employerEsic, total: pfEmployer + gratuity + employerEsic },
      takeHomePercentage, cityInfo,
    });
  }, [ctcParams, cityData]);

  const calculateComparison = useCallback(() => {
    const { currentSalary, newSalary, currentCity, newCity } = comparisonParams;
    if (!currentSalary || !newSalary) return;
    const currentCityData = cityData[currentCity];
    const newCityData = cityData[newCity];
    const currentAdjustedSalary = currentSalary * currentCityData.costMultiplier;
    const newAdjustedSalary = newSalary * newCityData.costMultiplier;
    const salaryIncrease = newSalary - currentSalary;
    const realIncrease = newAdjustedSalary - currentAdjustedSalary;
    setComparisonResult({
      currentSalary, newSalary, salaryIncrease,
      percentageIncrease: (salaryIncrease / currentSalary) * 100,
      realIncrease, realPercentageIncrease: (realIncrease / currentAdjustedSalary) * 100,
      currentAdjustedSalary, newAdjustedSalary, currentCityData, newCityData,
    });
  }, [comparisonParams, cityData]);

  useEffect(() => { if (activeTab === 'ctc-breakdown') calculateCTCBreakdown(); }, [ctcParams, activeTab, calculateCTCBreakdown]);
  useEffect(() => { if (activeTab === 'salary-comparison') calculateComparison(); }, [comparisonParams, activeTab, calculateComparison]);

  const formatCurrency = useCallback((amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount), []);
  const num = (v) => Number(v) || 0;

  const ctcShareLines = ctcResult ? [`Annual CTC: ${formatCurrency(ctcResult.annualCTC)}`, `Monthly take-home: ${formatCurrency(ctcResult.netMonthlySalary)}`, `Annual take-home: ${formatCurrency(ctcResult.netAnnualSalary)}`, `Total deductions: ${formatCurrency(ctcResult.deductions.total)}`, `Take-home ratio: ${ctcResult.takeHomePercentage.toFixed(1)}%`] : [];
  const comparisonShareLines = comparisonResult ? [`Current salary: ${formatCurrency(comparisonResult.currentSalary)}`, `New offer: ${formatCurrency(comparisonResult.newSalary)}`, `Nominal change: ${comparisonResult.percentageIncrease.toFixed(1)}%`, `Cost-adjusted change: ${comparisonResult.realPercentageIncrease.toFixed(1)}%`] : [];

  const seoFaqItems = [
    { question: 'How do I estimate 15 LPA or 20 LPA in-hand salary?', answer: 'Enter your annual CTC and review monthly take-home after modeled deductions. Use city and PF settings to approximate your specific payroll context. Under this model’s default metro structure, ₹15 lakh CTC works out to about ₹1,05,940 a month in hand and ₹20 lakh to about ₹1,33,312.' },
    { question: 'Why does the take-home percentage fall as CTC rises?', answer: 'Progressive tax. At ₹12 lakh CTC the model shows an 86.8% take-home ratio because income tax is zero after the new-regime rebate; at ₹15 lakh it is 84.8%, and at ₹20 lakh it is 80.0% as slab tax scales up. PF and professional tax grow roughly in proportion to salary, so the widening gap is almost entirely tax.' },
    { question: 'Where does the rest of my CTC go if it never reaches my bank account?', answer: 'Into employer-side contributions that are part of CTC but not part of gross salary: the employer’s PF match and the gratuity provision. On ₹12 lakh CTC the model books about ₹90,774 a year there. It is not money lost — PF compounds in your name and gratuity pays out after qualifying service — but it explains most of the standing gap between CTC ÷ 12 and your payslip.' },
    { question: 'Why does the calculator show zero income tax at ₹12 lakh CTC?', answer: 'After the component split, employee PF, and the new-regime standard deduction, taxable income lands in the Section 87A rebate zone for FY 2026-27, so computed tax is cancelled in full. The deductions you still see at that level are PF and professional tax, not income tax. See the linked guide on ₹12 lakh salary for the full walkthrough.' },
    { question: 'Why can in-hand salary differ from this calculator?', answer: 'Actual payroll depends on employer structure, allowance policy, tax declarations, and state-specific deductions. Treat outputs as planning estimates.' },
    { question: 'Can I compare two job offers here?', answer: 'Yes. Use the comparison tab to evaluate nominal and cost-adjusted salary difference between two offers and city contexts.' },
  ];
  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Salary Calculator India', url: 'https://upaman.com/salary-calculator',
    description: 'Calculate CTC to in-hand salary with deduction estimates and compare offers across city contexts.',
    featureList: ['CTC to In-hand Salary Calculator', 'Salary Comparison Tool', 'City Cost-Adjusted Salary Comparison', 'Deduction Breakdown'],
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'Salary Calculator', item: 'https://upaman.com/salary-calculator' },
  ]);

  const cityOptions = [{ value: 'metro', label: 'Metro city' }, { value: 'nonMetro', label: 'Non-metro city' }];
  const Row = ({ label, value, strong }) => (
    <div className={`flex justify-between py-1.5 text-sm ${strong ? 'font-semibold' : ''}`}>
      <span className="text-ink-muted dark:text-slate-400">{label}</span>
      <span className="text-ink dark:text-slate-100">{value}</span>
    </div>
  );
  const Check = ({ id, label, checked, onChange }) => (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-soft dark:text-slate-300">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
      {label}
    </label>
  );

  return (
    <>
      <Head>
        <title>Salary Calculator India | CTC to In-hand &amp; Offer Comparison | Upaman</title>
        <meta name="description" content="Free CTC to in-hand salary calculator for India. See monthly take-home after PF, tax and deductions (FY 2026-27), with a full component breakdown and offer comparison." />
        <meta name="keywords" content="salary calculator India, CTC to in hand calculator, take home salary calculator, in hand salary, salary comparison, 15 LPA in hand" />
        <link rel="canonical" href="https://upaman.com/salary-calculator" />
        <meta property="og:title" content="Salary Calculator India (CTC to In-hand) | Upaman" />
        <meta property="og:description" content="CTC to in-hand take-home with deduction breakdown and offer comparison." />
        <meta property="og:url" content="https://upaman.com/salary-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout eyebrow="Salary" title="Salary Calculator" subtitle="Turn your CTC into a realistic monthly take-home with a full deduction breakdown, or compare two offers across cities. Tax modelled on FY 2026-27 new regime.">
        <div className="mb-6">
          <Tabs tabs={[{ id: 'ctc-breakdown', label: 'CTC → in-hand' }, { id: 'salary-comparison', label: 'Compare offers' }]} active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === 'ctc-breakdown' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <div className="space-y-4">
                <NumberField id="ctc-amt" label="Annual CTC" prefix="₹" value={ctcParams.annualCTC} onChange={(v) => setCTCParams((p) => ({ ...p, annualCTC: num(v) }))} />
                <SelectField id="ctc-city" label="City" value={ctcParams.city} onChange={(v) => setCTCParams((p) => ({ ...p, city: v }))} options={cityOptions} />
                <NumberField id="ctc-pf" label="PF contribution" suffix="%" value={ctcParams.pfContribution} onChange={(v) => setCTCParams((p) => ({ ...p, pfContribution: num(v) }))} />
                <div className="space-y-2.5 pt-1">
                  <Check id="ctc-hra" label="Includes HRA" checked={ctcParams.hasHRA} onChange={(c) => setCTCParams((p) => ({ ...p, hasHRA: c }))} />
                  <Check id="ctc-grat" label="Gratuity applicable" checked={ctcParams.gratuityApplicable} onChange={(c) => setCTCParams((p) => ({ ...p, gratuityApplicable: c }))} />
                  <Check id="ctc-pt" label="Professional tax" checked={ctcParams.professionalTax} onChange={(c) => setCTCParams((p) => ({ ...p, professionalTax: c }))} />
                </div>
              </div>
            </Card>

            <div className="space-y-5 lg:col-span-3">
              {ctcResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultStat label="Monthly take-home" value={formatCurrency(ctcResult.netMonthlySalary)} emphasis tone="positive" />
                    <ResultStat label="Annual take-home" value={formatCurrency(ctcResult.netAnnualSalary)} />
                    <ResultStat label="Total deductions" value={formatCurrency(ctcResult.deductions.total)} />
                    <ResultStat label="Take-home ratio" value={`${ctcResult.takeHomePercentage.toFixed(1)}%`} />
                  </div>
                  <Card className="p-5">
                    <p className="mb-1 text-sm font-semibold text-ink dark:text-slate-100">Salary components</p>
                    <Row label="Basic salary" value={formatCurrency(ctcResult.basicSalary)} />
                    <Row label="HRA" value={formatCurrency(ctcResult.hraAmount)} />
                    <Row label="Special allowance" value={formatCurrency(ctcResult.specialAllowance)} />
                    <p className="mb-1 mt-3 text-sm font-semibold text-ink dark:text-slate-100">Deductions</p>
                    <Row label="PF (employee)" value={`− ${formatCurrency(ctcResult.deductions.pfEmployee)}`} />
                    <Row label="Income tax" value={`− ${formatCurrency(ctcResult.deductions.incomeTax)}`} />
                    <Row label="Professional tax" value={`− ${formatCurrency(ctcResult.deductions.professionalTax)}`} />
                    {ctcResult.deductions.esic > 0 && <Row label="ESIC" value={`− ${formatCurrency(ctcResult.deductions.esic)}`} />}
                    <div className="mt-1 border-t border-slate-100 pt-1 dark:border-slate-700"><Row label="Total deductions" value={formatCurrency(ctcResult.deductions.total)} strong /></div>
                    <p className="mt-3 text-xs text-ink-muted dark:text-slate-500">City: {ctcResult.cityInfo.name}. Employer also contributes {formatCurrency(ctcResult.employerContributions.total)} (PF, gratuity, ESIC) within CTC.</p>
                  </Card>
                  <Card className="p-5"><PieBreakdownChart title="Take-home vs deductions" items={[{ label: 'Annual take-home', value: ctcResult.netAnnualSalary, color: '#10b981' }, { label: 'Total deductions', value: ctcResult.deductions.total, color: '#ef4444' }]} formatter={formatCurrency} /></Card>
                  <AffiliateRecommendations calculatorType="salary" result={ctcResult} isDarkMode={false} />
                  <ResultActions title="Salary breakdown summary" summaryLines={ctcShareLines} fileName="upaman-salary-breakdown.txt" />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'salary-comparison' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <div className="space-y-4">
                <NumberField id="cmp-cur" label="Current salary (CTC)" prefix="₹" value={comparisonParams.currentSalary} onChange={(v) => setComparisonParams((p) => ({ ...p, currentSalary: num(v) }))} />
                <SelectField id="cmp-curcity" label="Current city" value={comparisonParams.currentCity} onChange={(v) => setComparisonParams((p) => ({ ...p, currentCity: v }))} options={cityOptions} />
                <NumberField id="cmp-new" label="New offer (CTC)" prefix="₹" value={comparisonParams.newSalary} onChange={(v) => setComparisonParams((p) => ({ ...p, newSalary: num(v) }))} />
                <SelectField id="cmp-newcity" label="New city" value={comparisonParams.newCity} onChange={(v) => setComparisonParams((p) => ({ ...p, newCity: v }))} options={cityOptions} />
              </div>
            </Card>
            <div className="space-y-5 lg:col-span-3">
              {comparisonResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultStat label="Nominal raise" value={`${comparisonResult.percentageIncrease.toFixed(1)}%`} emphasis />
                    <ResultStat label="Cost-adjusted raise" value={`${comparisonResult.realPercentageIncrease.toFixed(1)}%`} tone={comparisonResult.realPercentageIncrease >= 0 ? 'positive' : 'default'} />
                    <ResultStat label="Salary increase" value={formatCurrency(comparisonResult.salaryIncrease)} />
                    <ResultStat label="Real increase (adj.)" value={formatCurrency(Math.round(comparisonResult.realIncrease))} />
                  </div>
                  <Card className="p-5"><ComparisonBars title="Cost-adjusted salary" items={[{ label: 'Current (adjusted)', value: Math.round(comparisonResult.currentAdjustedSalary), color: '#6366f1' }, { label: 'New offer (adjusted)', value: Math.round(comparisonResult.newAdjustedSalary), color: '#2563eb' }]} formatter={formatCurrency} /></Card>
                  <p className="text-sm text-ink-muted dark:text-slate-400">Cost-adjusted figures normalize each salary by city cost of living, so a raise into a pricier city may be smaller in real terms.</p>
                  <ResultActions title="Offer comparison summary" summaryLines={comparisonShareLines} fileName="upaman-offer-comparison.txt" />
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 space-y-6">
          <EEATPanel
            author={editorialProfiles.researchTeam}
            reviewer="Compensation and Payroll Review Desk (Upaman)"
            reviewedOn="June 28, 2026"
            scope="Salary outputs are planning estimates based on modeled structure, deduction assumptions, and city normalization."
            sources={[{ label: 'EPFO', url: 'https://www.epfindia.gov.in/' }, { label: 'Income Tax Department', url: 'https://www.incometax.gov.in/' }, { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' }]}
          />
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            reviewedOn="June 28, 2026"
            inputs={['Annual CTC, city type, PF %, optional HRA/gratuity/professional-tax toggles', 'Salary comparison uses current offer, new offer, and city cost multipliers']}
            formulas={['Component split model: basic + HRA + allowance with deduction roll-up', 'Illustrative tax and statutory deduction estimation for take-home projection', 'City comparison uses normalization multipliers for cost-adjusted change']}
            assumptions={['Salary structures vary by employer; this is a planning model, not payroll output', 'Tax and deduction estimates are simplified for quick decision support', 'Professional tax/benefit treatment can differ by state and payroll policy']}
            sources={[{ label: 'EPFO (Provident Fund basics)', url: 'https://www.epfindia.gov.in/' }, { label: 'Income Tax Department (India)', url: 'https://www.incometax.gov.in/' }]}
            guideLinks={[{ label: 'CTC to in-hand salary breakdown', href: '/guides/ctc-to-in-hand-salary' }, { label: 'Tax on ₹12 lakh salary (why it is ₹0)', href: '/guides/tax-on-12-lakh-salary-fy-2026-27' }, { label: 'Standard deduction ₹75,000 vs ₹50,000', href: '/guides/standard-deduction-fy-2026-27' }, { label: 'Old vs new regime breakeven', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27' }]}
          />
          <SearchLandingSections
            intro={(<><p>Salary decisions are among the highest-impact financial choices for most professionals, especially during job switches. A useful CTC to in-hand salary calculator should do more than just one net number. It should show deduction components, monthly cash flow impact, and salary-comparison context. This page is structured for that decision workflow.</p><p>Use it to estimate take-home from annual CTC, compare offers across city contexts, and review how deduction assumptions influence your real monthly spending capacity.</p></>)}
            example={(
              <>
                <p>
                  Walk through the default: ₹12,00,000 CTC in a metro with the standard 12% PF setup. The model splits
                  that into ₹5,40,000 basic, ₹2,70,000 HRA, and ₹2,99,226 special allowance, with the employer&rsquo;s PF
                  match and gratuity provision absorbing the rest of the CTC. Deductions from gross are modest at this
                  level — ₹64,800 of employee PF and ₹2,500 professional tax, with income tax at zero thanks to the
                  new-regime rebate — leaving about ₹86,827 a month in hand, an 86.8% take-home ratio.
                </p>
                <p>
                  Step the same structure up and watch tax take over: ₹15 lakh CTC yields roughly ₹1,05,940 a month
                  (84.8% of CTC) with ₹31,754 of annual income tax, while ₹20 lakh yields about ₹1,33,312 a month
                  (80.0%) with ₹1,38,468 of tax. The pattern is worth internalizing before any negotiation: each
                  additional lakh of CTC delivers progressively less than the last one to your bank account, so a raise
                  quoted in CTC terms always sounds bigger than it spends.
                </p>
              </>
            )}
            formula={(
              <>
                <p>The model uses component-split estimation for basic, HRA, and allowances, then applies deduction roll-up (PF, tax assumptions, and selected statutory fields) to estimate net annual and monthly salary. Offer comparison mode additionally normalizes outcomes using city cost multipliers for practical purchasing-power context.</p>
                <p>
                  The split assumptions are deliberately typical rather than universal: basic is modeled at 45% of CTC,
                  HRA at half of basic, employee PF at your chosen percentage of basic (matched by the employer inside
                  CTC), and the gratuity provision at 4.81% of basic — the standard actuarial rate payroll teams use.
                  Income tax is computed on the FY 2026-27 new regime through the same engine as the income-tax
                  calculator, including the standard deduction, rebate, and cess. If your offer letter shows a different
                  basic percentage or a flexible-benefits bucket, expect your payslip to differ from this estimate in
                  the same direction — the structure, not the arithmetic, is where real offers diverge.
                </p>
              </>
            )}
            faqItems={seoFaqItems}
            relatedLinks={[{ label: 'Income Tax Calculator (India)', href: '/income-tax-calculator' }, { label: 'Tax Regime Comparison Tool', href: '/tax-regime-comparison' }, { label: 'CTC to In-hand Salary Guide', href: '/guides/ctc-to-in-hand-salary' }]}
          />
        </div>
      
        <HowToSection
          name="How to use the Salary Calculator"
          description="Convert your CTC into a monthly in-hand salary estimate."
          steps={[
            { name: "Enter your CTC", text: "Type your total annual cost-to-company." },
            { name: "Adjust the components", text: "Set basic pay, allowances, and statutory deductions as needed." },
            { name: "Review your in-hand pay", text: "See your estimated monthly and annual take-home salary." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default SalaryCalculator;
