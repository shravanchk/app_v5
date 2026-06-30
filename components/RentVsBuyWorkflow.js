import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Wallet, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';
import EEATPanel from './calculator/EEATPanel';
import SearchLandingSections from './calculator/SearchLandingSections';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import { NumberField, SelectField } from './ui/Field';
import Button from './ui/Button';
import Card from './ui/Card';
import { WorkflowSteps, HowToNote, DecisionBanner, Panel, PanelRow } from './workflow/WorkflowKit';
import { buildBreadcrumbSchema } from '../utils/schema';
import { editorialProfiles } from '../utils/editorialProfiles';

const regionSettings = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    ownershipCostRate: 0.015,
    closingCostRate: 0.07,
    comfortRatio: 0.35,
    safetyBuffer: 15000,
    defaults: {
      monthlyInHand: 150000,
      monthlyFixedExpenses: 50000,
      homePrice: 10000000,
      downPaymentPct: 20,
      loanRate: 8.5,
      loanYears: 20,
      monthlyRent: 35000,
      rentIncrease: 6,
      homeAppreciation: 5,
      plannedStayYears: 8
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    ownershipCostRate: 0.022,
    closingCostRate: 0.03,
    comfortRatio: 0.32,
    safetyBuffer: 800,
    defaults: {
      monthlyInHand: 9000,
      monthlyFixedExpenses: 3200,
      homePrice: 550000,
      downPaymentPct: 20,
      loanRate: 6.5,
      loanYears: 30,
      monthlyRent: 2600,
      rentIncrease: 4,
      homeAppreciation: 4,
      plannedStayYears: 7
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    ownershipCostRate: 0.018,
    closingCostRate: 0.04,
    comfortRatio: 0.33,
    safetyBuffer: 700,
    defaults: {
      monthlyInHand: 5200,
      monthlyFixedExpenses: 2100,
      homePrice: 360000,
      downPaymentPct: 20,
      loanRate: 4.6,
      loanYears: 25,
      monthlyRent: 1650,
      rentIncrease: 3,
      homeAppreciation: 3,
      plannedStayYears: 7
    }
  }
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionSettings[regionKey]?.defaults;
  return {
    monthlyInHand: defaults?.monthlyInHand ?? 0,
    monthlyFixedExpenses: defaults?.monthlyFixedExpenses ?? 0,
    homePrice: defaults?.homePrice ?? 0,
    downPaymentPct: defaults?.downPaymentPct ?? 0,
    loanRate: defaults?.loanRate ?? 0,
    loanYears: defaults?.loanYears ?? 0,
    monthlyRent: defaults?.monthlyRent ?? 0,
    rentIncrease: defaults?.rentIncrease ?? 0,
    homeAppreciation: defaults?.homeAppreciation ?? 0,
    plannedStayYears: defaults?.plannedStayYears ?? 0
  };
};

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const monthlyEmi = (principal, annualRate, years) => {
  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  if (!principal || !months) return 0;
  if (monthlyRate === 0) return principal / months;
  const growth = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * growth) / (growth - 1);
};

const principalFromPayment = (payment, annualRate, years) => {
  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  if (!payment || !months) return 0;
  if (monthlyRate === 0) return payment * months;
  const growth = Math.pow(1 + monthlyRate, months);
  return (payment * (growth - 1)) / (monthlyRate * growth);
};

const round = (value) => Math.round(value);

const RentVsBuyWorkflow = () => {
  const baseRegion = 'india';
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion)
  });

  const regionConfig = regionSettings[inputs.region];
  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));
  const fmt = (value) => formatCurrency(value, regionConfig);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Rent vs Buy Decision Workflow', item: 'https://upaman.com/rent-vs-buy-workflow' }
  ]);
  const faqItems = [
    {
      question: 'What usually decides rent versus buy more than anything else?',
      answer: 'Planned stay duration is often the biggest factor because buying has upfront and ownership costs that need time to be recovered.'
    },
    {
      question: 'Why does this workflow use effective cost instead of just EMI versus rent?',
      answer: 'EMI alone misses down payment, closing costs, ownership overhead, and equity built over time. Effective cost is a better decision view.'
    },
    {
      question: 'What if buying is cheaper on paper but my monthly buffer looks weak?',
      answer: 'That usually means buying may still be financially stressful despite a long-run advantage. Monthly resilience still matters.'
    }
  ];

  const output = useMemo(() => {
    const monthlyInHand = Math.max(0, Number(inputs.monthlyInHand) || 0);
    const monthlyFixedExpenses = Math.max(0, Number(inputs.monthlyFixedExpenses) || 0);
    const homePrice = Math.max(0, Number(inputs.homePrice) || 0);
    const downPaymentPct = Math.max(0, Number(inputs.downPaymentPct) || 0);
    const loanRate = Math.max(0, Number(inputs.loanRate) || 0);
    const loanYears = Math.max(1, Number(inputs.loanYears) || 1);
    const monthlyRent = Math.max(0, Number(inputs.monthlyRent) || 0);
    const rentIncrease = Math.max(0, Number(inputs.rentIncrease) || 0);
    const homeAppreciation = Math.max(0, Number(inputs.homeAppreciation) || 0);
    const plannedStayYears = Math.max(1, Number(inputs.plannedStayYears) || 1);

    const downPayment = homePrice * downPaymentPct / 100;
    const closingCosts = homePrice * regionConfig.closingCostRate;
    const loanPrincipal = Math.max(0, homePrice - downPayment);
    const emi = monthlyEmi(loanPrincipal, loanRate, loanYears);
    const baseOwnershipMonthly = (homePrice * regionConfig.ownershipCostRate) / 12;
    const totalBuyMonthly = emi + baseOwnershipMonthly;
    const comfortableHousingBudget = Math.max(
      0,
      Math.min(monthlyInHand * regionConfig.comfortRatio, monthlyInHand - monthlyFixedExpenses - regionConfig.safetyBuffer)
    );
    const monthlyBufferIfBuy = monthlyInHand - monthlyFixedExpenses - totalBuyMonthly;
    const monthlyBufferIfRent = monthlyInHand - monthlyFixedExpenses - monthlyRent;
    const affordabilityGap = Math.max(0, totalBuyMonthly - comfortableHousingBudget);

    const affordableLoan = principalFromPayment(
      Math.max(0, comfortableHousingBudget - baseOwnershipMonthly),
      loanRate,
      loanYears
    );
    const requiredTotalDownPayment = Math.max(0, homePrice - affordableLoan);
    const additionalDownPaymentNeeded = Math.max(0, requiredTotalDownPayment - downPayment);

    const analysisMonths = Math.max(plannedStayYears * 12, loanYears * 12);
    const plannedStayMonth = plannedStayYears * 12;
    const monthlyRate = loanRate / 12 / 100;
    let outstanding = loanPrincipal;
    let cumulativeBuyOutflow = downPayment + closingCosts;
    let cumulativeRentOutflow = 0;
    let breakEvenYear = null;
    let plannedBuyOutflow = downPayment + closingCosts;
    let plannedRentOutflow = 0;
    let plannedHomeValue = homePrice;
    let plannedOutstanding = loanPrincipal;
    const yearlySnapshots = [];

    for (let month = 1; month <= analysisMonths; month += 1) {
      const interest = outstanding * monthlyRate;
      const principalPaid = Math.min(outstanding, Math.max(0, emi - interest));
      outstanding = Math.max(0, outstanding - principalPaid);

      const yearIndex = Math.ceil(month / 12);
      const currentRent = monthlyRent * Math.pow(1 + rentIncrease / 100, yearIndex - 1);
      const currentHomeValue = homePrice * Math.pow(1 + homeAppreciation / 100, yearIndex - 1);
      const maintenanceMonthly = (currentHomeValue * regionConfig.ownershipCostRate) / 12;

      cumulativeBuyOutflow += emi + maintenanceMonthly;
      cumulativeRentOutflow += currentRent;

      const currentEquity = currentHomeValue - outstanding;
      const buyEffectiveCost = cumulativeBuyOutflow - currentEquity;

      if (!breakEvenYear && month % 12 === 0 && buyEffectiveCost <= cumulativeRentOutflow) {
        breakEvenYear = yearIndex;
      }

      if (month === plannedStayMonth) {
        plannedBuyOutflow = cumulativeBuyOutflow;
        plannedRentOutflow = cumulativeRentOutflow;
        plannedHomeValue = currentHomeValue;
        plannedOutstanding = outstanding;
      }

      if (month % 12 === 0 && yearIndex <= Math.max(plannedStayYears, 10)) {
        yearlySnapshots.push({
          year: yearIndex,
          rentOutflow: round(cumulativeRentOutflow),
          buyEffectiveCost: round(buyEffectiveCost)
        });
      }
    }

    const plannedEquity = Math.max(0, plannedHomeValue - plannedOutstanding);
    const plannedBuyEffectiveCost = Math.max(0, plannedBuyOutflow - plannedEquity);
    const monthlyFlexibilityGain = monthlyBufferIfRent - monthlyBufferIfBuy;

    let decision;
    if (monthlyBufferIfBuy < regionConfig.safetyBuffer || affordabilityGap > 0) {
      decision = {
        label: 'Rent for now',
        tone: 'danger',
        reason: 'Buying strains your monthly cash buffer under current assumptions.'
      };
    } else if (breakEvenYear && breakEvenYear <= plannedStayYears) {
      decision = {
        label: 'Buying looks stronger',
        tone: 'positive',
        reason: 'Your planned stay is long enough for buying to beat renting on effective cost.'
      };
    } else {
      decision = {
        label: 'Renting fits better',
        tone: 'warning',
        reason: 'Your planned stay is shorter than the financial break-even timeline.'
      };
    }

    const actionItems = [
      affordabilityGap > 0 || monthlyBufferIfBuy < regionConfig.safetyBuffer
        ? `To make buying comfortable, increase down payment by about ${formatCurrency(additionalDownPaymentNeeded, regionConfig)} or lower target home price.`
        : `Your current monthly cash flow can support a buy path while preserving about ${formatCurrency(monthlyBufferIfBuy, regionConfig)} as monthly buffer.`,
      breakEvenYear
        ? `Buying becomes more favorable around year ${breakEvenYear} under current assumptions.`
        : 'Break-even is not reached within the modeled horizon, so renting stays cheaper on effective cost.',
      monthlyFlexibilityGain > 0
        ? `Renting preserves about ${formatCurrency(monthlyFlexibilityGain, regionConfig)} more monthly flexibility than buying right now.`
        : `Buying uses less monthly cash than renting by about ${formatCurrency(Math.abs(monthlyFlexibilityGain), regionConfig)} under current assumptions.`
    ];

    return {
      downPayment: round(downPayment),
      closingCosts: round(closingCosts),
      loanPrincipal: round(loanPrincipal),
      emi: round(emi),
      baseOwnershipMonthly: round(baseOwnershipMonthly),
      totalBuyMonthly: round(totalBuyMonthly),
      monthlyBufferIfBuy: round(monthlyBufferIfBuy),
      monthlyBufferIfRent: round(monthlyBufferIfRent),
      comfortableHousingBudget: round(comfortableHousingBudget),
      affordabilityGap: round(affordabilityGap),
      affordableLoan: round(affordableLoan),
      additionalDownPaymentNeeded: round(additionalDownPaymentNeeded),
      breakEvenYear,
      plannedRentOutflow: round(plannedRentOutflow),
      plannedBuyOutflow: round(plannedBuyOutflow),
      plannedEquity: round(plannedEquity),
      plannedBuyEffectiveCost: round(plannedBuyEffectiveCost),
      monthlyFlexibilityGain: round(monthlyFlexibilityGain),
      plannedStayYears,
      decision,
      actionItems,
      yearlySnapshots
    };
  }, [inputs, regionConfig]);

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Decision workflow"
        title="Rent vs Buy Decision Workflow"
        subtitle="Compare monthly affordability, break-even timeline, and flexibility before committing to buying a home."
      >
        <EEATPanel
          author={editorialProfiles.researchTeam}
          reviewer={editorialProfiles.financeReviewDesk}
          reviewedOn="June 28, 2026"
          scope="This workflow compares renting and buying using affordability, effective cost, ownership overhead, and planned stay assumptions."
          sources={[
            { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
            { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/owning-a-home/' },
            { label: 'National Housing Bank', url: 'https://nhb.org.in/' }
          ]}
        />

        <div className="mt-6">
          <WorkflowSteps steps={['Inputs', 'Comparison', 'Action Plan']} active={step} onChange={setStep} />
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              items={[
                'Use in-hand or net monthly income, not gross salary.',
                'Keep only non-negotiable expenses in fixed expenses.',
                'Enter a realistic stay duration. This matters more than most people assume.'
              ]}
            />
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  id="rb-region"
                  label="Region"
                  value={inputs.region}
                  onChange={(v) => setInputs((prev) => ({ ...prev, region: v, ...getRegionDefaults(v) }))}
                  options={[
                    { value: 'india', label: 'India' },
                    { value: 'us', label: 'United States' },
                    { value: 'eu', label: 'EU/UK (Generic)' }
                  ]}
                />
                <NumberField
                  id="rb-income"
                  label={`Monthly In-hand Income (${regionConfig.currency})`}
                  value={inputs.monthlyInHand}
                  onChange={(v) => set('monthlyInHand', v)}
                  hint="Use post-tax income available for actual spending."
                />
                <NumberField
                  id="rb-expenses"
                  label={`Monthly Fixed Expenses (${regionConfig.currency})`}
                  value={inputs.monthlyFixedExpenses}
                  onChange={(v) => set('monthlyFixedExpenses', v)}
                  hint="Exclude current rent here; rent is entered separately."
                />
                <NumberField
                  id="rb-price"
                  label={`Target Home Price (${regionConfig.currency})`}
                  value={inputs.homePrice}
                  onChange={(v) => set('homePrice', v)}
                  hint="The purchase price you are seriously considering."
                />
                <NumberField
                  id="rb-down"
                  label="Down Payment"
                  suffix="%"
                  max={100}
                  value={inputs.downPaymentPct}
                  onChange={(v) => set('downPaymentPct', v)}
                  hint="Percent of home price you can put down immediately."
                />
                <NumberField
                  id="rb-rate"
                  label="Loan Rate"
                  suffix="%"
                  step={0.1}
                  value={inputs.loanRate}
                  onChange={(v) => set('loanRate', v)}
                  hint="Use a realistic borrowing rate, not a best-case quote."
                />
                <NumberField
                  id="rb-years"
                  label="Loan Tenure"
                  suffix="yrs"
                  min={1}
                  value={inputs.loanYears}
                  onChange={(v) => set('loanYears', v)}
                  hint="Longer tenure lowers EMI but can delay break-even."
                />
                <NumberField
                  id="rb-rent"
                  label={`Current Monthly Rent (${regionConfig.currency})`}
                  value={inputs.monthlyRent}
                  onChange={(v) => set('monthlyRent', v)}
                  hint="Your realistic current or expected rent for a similar home."
                />
                <NumberField
                  id="rb-rentinc"
                  label="Annual Rent Increase"
                  suffix="%"
                  step={0.1}
                  value={inputs.rentIncrease}
                  onChange={(v) => set('rentIncrease', v)}
                  hint="Use a conservative rent growth assumption."
                />
                <NumberField
                  id="rb-appr"
                  label="Home Appreciation"
                  suffix="%"
                  step={0.1}
                  value={inputs.homeAppreciation}
                  onChange={(v) => set('homeAppreciation', v)}
                  hint="Expected annual property value growth, not a guaranteed return."
                />
                <NumberField
                  id="rb-stay"
                  label="Planned Stay"
                  suffix="yrs"
                  min={1}
                  value={inputs.plannedStayYears}
                  onChange={(v) => set('plannedStayYears', v)}
                  hint="Critical input. Buying often fails for short holding periods."
                />
              </div>
            </Card>
            <Button onClick={() => setStep(2)}>Continue to comparison</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            <DecisionBanner tone={output.decision.tone} label={output.decision.label} reason={output.decision.reason} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Estimated EMI" value={fmt(output.emi)} />
              <ResultStat label="Monthly buy cost" value={fmt(output.totalBuyMonthly)} emphasis />
              <ResultStat label="Monthly rent cost" value={fmt(Number(inputs.monthlyRent) || 0)} />
              <ResultStat label="Break-even" value={output.breakEvenYear ? `Year ${output.breakEvenYear}` : 'Not reached'} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Panel title="Monthly flexibility" icon={<Wallet size={18} />}>
                <div className="space-y-1">
                  <PanelRow label="Renting buffer" value={fmt(output.monthlyBufferIfRent)} />
                  <PanelRow label="Buying buffer" value={fmt(output.monthlyBufferIfBuy)} />
                </div>
              </Panel>
              <Panel title="Affordability check" icon={<ShieldCheck size={18} />}>
                <div className="space-y-1">
                  <PanelRow label="Comfortable housing budget" value={fmt(output.comfortableHousingBudget)} />
                  <PanelRow label="Extra down payment needed" value={fmt(output.additionalDownPaymentNeeded)} />
                </div>
              </Panel>
            </div>
            <Card className="p-5">
              <ComparisonBars
                title="Monthly housing comparison"
                items={[
                  { label: 'Current rent', value: Number(inputs.monthlyRent) || 0, color: '#0f766e' },
                  { label: 'Buy monthly cost', value: output.totalBuyMonthly, color: '#1d4e89' },
                  { label: 'Comfortable housing budget', value: output.comfortableHousingBudget, color: '#b45309' }
                ]}
                formatter={fmt}
              />
            </Card>
            <Card className="p-5">
              <ComparisonBars
                title={`Effective cost over planned ${output.plannedStayYears}-year stay`}
                items={[
                  { label: 'Rent total outflow', value: output.plannedRentOutflow, color: '#0f766e' },
                  { label: 'Buy effective cost', value: output.plannedBuyEffectiveCost, color: '#1d4e89' }
                ]}
                formatter={fmt}
              />
            </Card>
            <Card className="p-5">
              <PieBreakdownChart
                title="Buying path at planned stay end"
                items={[
                  { label: 'Home equity built', value: output.plannedEquity, color: '#22c55e' },
                  { label: 'Net buy cost', value: output.plannedBuyEffectiveCost, color: '#f97316' }
                ]}
                formatter={fmt}
              />
            </Card>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>Back to Inputs</Button>
              <Button onClick={() => setStep(3)}>Continue to action plan</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-5">
            <DecisionBanner
              tone={output.decision.tone}
              label={`Recommended direction: ${output.decision.label}`}
              reason={output.decision.reason}
              icon={<CheckCircle2 size={18} />}
            >
              <ul className="mt-2.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-soft marker:text-slate-400 dark:text-slate-300">
                {output.actionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DecisionBanner>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Panel title="Cash readiness" icon={<Wallet size={18} />}>
                <div className="space-y-1">
                  <PanelRow label="Down payment" value={fmt(output.downPayment)} />
                  <PanelRow label="Closing costs" value={fmt(output.closingCosts)} />
                  <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
                    If buying, keep separate emergency cash beyond these amounts.
                  </p>
                </div>
              </Panel>
              <Panel title="Stay-duration rule" icon={<Clock size={18} />}>
                <div className="space-y-1">
                  <PanelRow label="Planned stay" value={`${output.plannedStayYears} years`} />
                  <PanelRow label="Break-even" value={output.breakEvenYear ? `Year ${output.breakEvenYear}` : 'Not reached in model'} />
                </div>
              </Panel>
              <Panel title="Buffer protection" icon={<ShieldCheck size={18} />}>
                <div className="space-y-1">
                  <PanelRow label="Safe monthly buffer target" value={fmt(regionConfig.safetyBuffer)} />
                  <PanelRow label="Buy-path buffer after fixed costs" value={fmt(output.monthlyBufferIfBuy)} />
                </div>
              </Panel>
            </div>

            <Panel title="Year-by-year effective cost checkpoints">
              <div className="-mx-1 overflow-x-auto">
                <table className="w-full min-w-[24rem] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-ink-muted dark:border-slate-700 dark:text-slate-400">
                      <th className="px-2 py-2 font-semibold">Year</th>
                      <th className="px-2 py-2 font-semibold">Rent outflow</th>
                      <th className="px-2 py-2 font-semibold">Buy effective cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {output.yearlySnapshots.map((snapshot) => (
                      <tr key={snapshot.year} className="text-ink-soft dark:text-slate-300">
                        <td className="px-2 py-2">{snapshot.year}</td>
                        <td className="px-2 py-2">{fmt(snapshot.rentOutflow)}</td>
                        <td className="px-2 py-2">{fmt(snapshot.buyEffectiveCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back to comparison</Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <SearchLandingSections
            intro={(
              <>
                <p>
                  Rent versus buy is not an EMI comparison. The real decision depends on stay duration, upfront cash,
                  ownership costs, and whether the buy path still leaves enough monthly flexibility after fixed expenses.
                </p>
                <p>
                  This workflow combines those pieces into one housing decision view so you can see when buying becomes
                  stronger and when renting still protects cash flow better.
                </p>
              </>
            )}
            example={(
              <p>
                A household may find that buying beats renting after year seven, but if the expected stay is only four years
                or the buy path leaves too little monthly buffer, renting can still be the safer decision today.
              </p>
            )}
            formula={(
              <p>
                Core flow: estimate total buy outflow using EMI, down payment, closing costs, and ownership overhead; compare
                it with cumulative rent outflow; subtract built home equity to estimate effective buy cost; then evaluate the
                result against planned stay and monthly buffer protection.
              </p>
            )}
            faqItems={faqItems}
            relatedLinks={[
              { label: 'Buy vs Rent Calculator', href: '/buy-vs-rent-calculator' },
              { label: 'Home Loan Readiness Workflow', href: '/home-loan-readiness-workflow' },
              { label: 'How Much EMI Is Safe Guide', href: '/guides/how-much-emi-is-safe' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default RentVsBuyWorkflow;
