import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { ShieldCheck, AlertTriangle, Wallet, Target, CheckCircle2 } from 'lucide-react';
import { PieBreakdownChart, ComparisonBars } from '../calculator/ResultVisualizations';
import EEATPanel from '../calculator/EEATPanel';
import SearchLandingSections from '../calculator/SearchLandingSections';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import { NumberField, SelectField } from '../ui/Field';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { WorkflowSteps, HowToNote, DecisionBanner, Panel, PanelRow, ActionList } from '../workflow/WorkflowKit';
import { buildBreadcrumbSchema } from '../../utils/schema';
import { editorialProfiles } from '../../utils/editorialProfiles';

const regionSettings = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    defaults: {
      monthlyEssentials: 45000,
      currentEmergencyFund: 120000,
      monthlySurplus: 30000
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    defaults: {
      monthlyEssentials: 3500,
      currentEmergencyFund: 6000,
      monthlySurplus: 900
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    defaults: {
      monthlyEssentials: 2600,
      currentEmergencyFund: 5000,
      monthlySurplus: 700
    }
  }
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionSettings[regionKey]?.defaults;
  return {
    monthlyEssentials: defaults?.monthlyEssentials ?? 0,
    currentEmergencyFund: defaults?.currentEmergencyFund ?? 0,
    monthlySurplus: defaults?.monthlySurplus ?? 0
  };
};

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const clamp = (min, value, max) => Math.min(max, Math.max(min, value));

const EmergencyFundReadinessWorkflow = () => {
  const [step, setStep] = useState(1);
  const baseRegion = 'india';
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion),
    dependents: 1,
    jobRisk: 'medium',
    incomeType: 'salaried',
    hasHealthInsurance: 'yes',
    singleIncomeHousehold: 'no'
  });

  const regionConfig = regionSettings[inputs.region];
  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));
  const fmt = (value) => formatCurrency(value, regionConfig);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Emergency Fund Readiness Workflow', item: 'https://upaman.com/emergency-fund-readiness-workflow' }
  ]);
  const faqItems = [
    {
      question: 'How many months should an emergency fund cover?',
      answer: 'It depends on income stability, dependents, insurance coverage, and whether the household relies on one income source. That is why this workflow adjusts the target instead of forcing one rule.'
    },
    {
      question: 'Where should an emergency fund be kept?',
      answer: 'Emergency funds are usually strongest in high-liquidity, low-volatility instruments rather than long-lock investments. The test is simple: could you access most of it within a day or two, without a penalty and without selling something at a loss? Instruments that fail that test — equity funds, long-lock deposits, property — can be excellent investments while being poor emergency vehicles. It is also worth keeping the fund in a separate account from daily spending, purely so it stays psychologically off-limits.'
    },
    {
      question: 'Should I invest or prepay debt before building emergency savings?',
      answer: 'In most cases, a thin emergency buffer increases risk. Build a basic safety layer first, then optimize debt or investing decisions.'
    },
    {
      question: 'Why does the workflow cap the target at 12 months?',
      answer: 'Beyond roughly a year of expenses, additional cash stops buying meaningful safety and starts costing real returns — money parked in liquid instruments lags what long-term investments earn. If your risk factors push the raw target past the cap, the better response is usually addressing the risk itself (insurance, income diversification) rather than hoarding more cash.'
    },
    {
      question: 'What counts as “monthly essentials”?',
      answer: 'The number you could not avoid spending in a bad month: rent or EMI, groceries, utilities, insurance premiums, school fees, minimum debt payments, and transport. It deliberately excludes discretionary spending — an emergency budget is not your normal budget. Most people find their essentials are 60–75% of what they actually spend, which meaningfully shrinks the target corpus.'
    },
    {
      question: 'Why does the recommended contribution change as my fund grows?',
      answer: 'The workflow allocates your surplus in phases: 80% of surplus while coverage is under three months (the danger zone), 65% while you are between three months and your target, and 35% for topping up beyond it. The idea is to front-load safety when you are most exposed and release money back toward investing as the buffer matures.'
    }
  ];

  const output = useMemo(() => {
    const monthlyEssentials = Math.max(1, Number(inputs.monthlyEssentials) || 1);
    const currentEmergencyFund = Math.max(0, Number(inputs.currentEmergencyFund) || 0);
    const monthlySurplus = Math.max(0, Number(inputs.monthlySurplus) || 0);
    const dependents = Math.max(0, Number(inputs.dependents) || 0);

    const jobRiskAdjustment = {
      low: 0.5,
      medium: 1.5,
      high: 3
    }[inputs.jobRisk];

    const incomeTypeAdjustment = {
      salaried: 0.5,
      variable: 1.2,
      selfEmployed: 2
    }[inputs.incomeType];

    const insuranceAdjustment = inputs.hasHealthInsurance === 'yes' ? -0.5 : 0.75;
    const householdAdjustment = inputs.singleIncomeHousehold === 'yes' ? 1 : 0;
    const dependentAdjustment = Math.min(3, dependents * 0.5);

    const targetMonthsRaw =
      4 + jobRiskAdjustment + incomeTypeAdjustment + insuranceAdjustment + householdAdjustment + dependentAdjustment;
    const targetMonths = clamp(3, Math.round(targetMonthsRaw * 10) / 10, 12);

    const targetCorpus = targetMonths * monthlyEssentials;
    const currentCoverageMonths = currentEmergencyFund / monthlyEssentials;
    const gap = Math.max(0, targetCorpus - currentEmergencyFund);

    const allocationRate =
      currentCoverageMonths < 3 ? 0.8 : currentCoverageMonths < targetMonths ? 0.65 : 0.35;
    const recommendedMonthlyContribution = Math.round(monthlySurplus * allocationRate);
    const monthsToTarget =
      gap > 0 && recommendedMonthlyContribution > 0
        ? Math.ceil(gap / recommendedMonthlyContribution)
        : null;

    const status =
      currentCoverageMonths >= targetMonths
        ? {
            label: 'Ready',
            tone: 'positive',
            reason: 'Your emergency runway meets your current risk profile.'
          }
        : currentCoverageMonths >= targetMonths * 0.6
          ? {
              label: 'Progressing',
              tone: 'warning',
              reason: 'You have a base cushion. Close the remaining gap to reduce stress risk.'
            }
          : {
              label: 'At risk',
              tone: 'danger',
              reason: 'Current runway is thin for your profile. Prioritize emergency corpus build-up.'
            };

    const milestoneMonths = Array.from(
      new Set([1, 3, 6, Math.ceil(targetMonths)].filter((m) => m <= Math.ceil(targetMonths)))
    );
    const milestones = milestoneMonths.map((months) => {
      const required = months * monthlyEssentials;
      return {
        months,
        required,
        achieved: currentEmergencyFund >= required,
        shortfall: Math.max(0, required - currentEmergencyFund)
      };
    });

    return {
      monthlyEssentials,
      currentEmergencyFund,
      monthlySurplus,
      targetMonths,
      targetCorpus,
      currentCoverageMonths,
      gap,
      recommendedMonthlyContribution,
      monthsToTarget,
      status,
      milestones
    };
  }, [inputs]);

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Decision workflow"
        title="Emergency Fund Readiness Workflow"
        subtitle="Estimate your target corpus, coverage runway, and timeline to become financially resilient."
      >
        <EEATPanel
          author={editorialProfiles.researchTeam}
          reviewer={editorialProfiles.financeReviewDesk}
          reviewedOn="June 28, 2026"
          scope="This workflow estimates emergency-fund runway based on fixed expenses, household risk, and current liquid reserves."
          sources={[
            { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
            { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/' }
          ]}
        />

        <div className="mt-6">
          <WorkflowSteps steps={['Inputs', 'Readiness', 'Milestones']} active={step} onChange={setStep} />
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              title="How to fill this quickly"
              items={[
                'Use only essential monthly expenses, not lifestyle spending.',
                'Use immediately available emergency money, not long-term investments.',
                'Select job risk honestly; this drives the recommended runway months.'
              ]}
            />
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  id="ef-region"
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
                  id="ef-essentials"
                  label={`Monthly Essentials (${regionConfig.currency})`}
                  value={inputs.monthlyEssentials}
                  onChange={(v) => set('monthlyEssentials', v)}
                  hint="Include rent/EMI, food, utilities, insurance, and minimum debt only."
                />
                <NumberField
                  id="ef-fund"
                  label={`Current Emergency Fund (${regionConfig.currency})`}
                  value={inputs.currentEmergencyFund}
                  onChange={(v) => set('currentEmergencyFund', v)}
                  hint="Use cash and highly liquid balances only."
                />
                <NumberField
                  id="ef-surplus"
                  label={`Available Monthly Surplus (${regionConfig.currency})`}
                  value={inputs.monthlySurplus}
                  onChange={(v) => set('monthlySurplus', v)}
                  hint="Keep this conservative so the plan stays executable."
                />
                <NumberField
                  id="ef-dependents"
                  label="Dependents"
                  max={8}
                  value={inputs.dependents}
                  onChange={(v) => set('dependents', v)}
                  hint="More dependents usually require a larger emergency runway."
                />
                <SelectField
                  id="ef-jobrisk"
                  label="Job risk"
                  value={inputs.jobRisk}
                  onChange={(v) => set('jobRisk', v)}
                  options={[
                    { value: 'low', label: 'Low (stable role/industry)' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High (volatile income/job risk)' }
                  ]}
                />
                <SelectField
                  id="ef-income"
                  label="Income type"
                  value={inputs.incomeType}
                  onChange={(v) => set('incomeType', v)}
                  options={[
                    { value: 'salaried', label: 'Salaried (fixed)' },
                    { value: 'variable', label: 'Variable bonus/commission' },
                    { value: 'selfEmployed', label: 'Self-employed/business' }
                  ]}
                />
                <SelectField
                  id="ef-insurance"
                  label="Health insurance"
                  value={inputs.hasHealthInsurance}
                  onChange={(v) => set('hasHealthInsurance', v)}
                  options={[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' }
                  ]}
                />
                <SelectField
                  id="ef-single"
                  label="Single-income household"
                  value={inputs.singleIncomeHousehold}
                  onChange={(v) => set('singleIncomeHousehold', v)}
                  options={[
                    { value: 'no', label: 'No' },
                    { value: 'yes', label: 'Yes' }
                  ]}
                />
              </div>
            </Card>
            <Button onClick={() => setStep(2)}>Continue to Readiness</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              title="How to read this step"
              items={[
                'Target runway is your recommended emergency months for the current risk profile.',
                'Funding gap is the exact shortfall to close before being fully ready.',
                'Use the gap chart to decide how much monthly surplus to allocate first.'
              ]}
            />
            <DecisionBanner
              tone={output.status.tone}
              label={output.status.label}
              reason={output.status.reason}
              icon={<CheckCircle2 size={18} />}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Target runway" value={`${output.targetMonths.toFixed(1)} months`} />
              <ResultStat label="Current runway" value={`${output.currentCoverageMonths.toFixed(1)} months`} />
              <ResultStat label="Target corpus" value={fmt(output.targetCorpus)} />
              <ResultStat label="Funding gap" value={fmt(output.gap)} emphasis />
            </div>
            <Card className="p-5">
              <ComparisonBars
                title="Emergency corpus gap view"
                items={[
                  { label: 'Current fund', value: output.currentEmergencyFund, color: '#1d4ed8' },
                  { label: 'Target corpus', value: output.targetCorpus, color: '#0f766e' },
                  { label: 'Gap', value: output.gap, color: '#f97316' }
                ]}
                formatter={fmt}
              />
            </Card>
            <Card className="p-5">
              <PieBreakdownChart
                title="Target corpus composition"
                items={[
                  { label: 'Already funded', value: output.currentEmergencyFund, color: '#22c55e' },
                  { label: 'Remaining gap', value: output.gap, color: '#ef4444' }
                ]}
                formatter={fmt}
              />
            </Card>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>Back to Inputs</Button>
              <Button onClick={() => setStep(3)}>Continue to Milestones</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              title="How to use this plan"
              items={[
                'Automate the recommended monthly contribution first.',
                output.monthsToTarget === null
                  ? 'No timeline shown because there is no gap or the contribution is zero.'
                  : `At the current pace, the target runway is expected in about ${output.monthsToTarget} months.`,
                'Recalculate whenever expenses, dependents, or job risk changes.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ResultStat label="Recommended monthly contribution" value={fmt(output.recommendedMonthlyContribution)} emphasis tone="positive" />
              <ResultStat label="Estimated months to full target" value={output.monthsToTarget === null ? 'N/A' : `${output.monthsToTarget} months`} />
              <ResultStat label="Surplus left after contribution" value={fmt(Math.max(0, output.monthlySurplus - output.recommendedMonthlyContribution))} />
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
                <Target size={18} /> Runway milestones
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {output.milestones.map((milestone) => (
                  <Panel key={milestone.months} title={`${milestone.months}-month corpus target`}>
                    <div className="space-y-1">
                      <PanelRow label="Required" value={fmt(milestone.required)} />
                      <p className={milestone.achieved ? 'text-sm font-medium text-emerald-600 dark:text-emerald-400' : 'text-sm font-medium text-amber-600 dark:text-amber-400'}>
                        {milestone.achieved ? 'Achieved' : `Shortfall: ${fmt(milestone.shortfall)}`}
                      </p>
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
            <Card className="p-5">
              <ActionList
                title="Action checklist"
                items={[
                  'Keep your emergency corpus in high-liquidity, low-volatility instruments.',
                  'Automate the recommended monthly contribution right after salary credit.',
                  'Recalculate target runway after major life changes or income shifts.'
                ]}
              />
            </Card>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back to Readiness</Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <SearchLandingSections
            intro={(
              <>
                <p>
                  Emergency funds are not just about a fixed number of months. The right runway depends on job stability,
                  income variability, dependents, insurance coverage, and whether your household relies on one income stream.
                </p>
                <p>
                  This workflow converts those risk factors into a clearer runway target and a practical monthly funding plan.
                </p>
                <p>
                  The popular &ldquo;six months of expenses&rdquo; rule is a median dressed up as advice. Six months is
                  generous for a dual-income salaried couple with good health insurance, and dangerously thin for a
                  self-employed single earner supporting parents. The interesting question is never the average — it is
                  which side of it your household sits on, and each step in this workflow exists to answer exactly that.
                </p>
              </>
            )}
            example={(
              <>
                <p>
                  Two households with the same monthly expenses can need very different buffers. A salaried dual-income
                  household with insurance needs less runway than a variable-income single-earner household supporting dependents.
                </p>
                <p>
                  Trace the default inputs to see the mechanics. Monthly essentials of ₹45,000 with a salaried job at
                  medium market risk, health insurance in place, a second household income, and one dependent lands on a
                  target of 6 months — ₹2,70,000. An existing fund of ₹1,20,000 covers 2.7 months, which is below the
                  three-month danger line, so the plan allocates 80% of the ₹30,000 monthly surplus — ₹24,000 — and closes
                  the ₹1,50,000 gap in about 7 months. Flip two answers — self-employed instead of salaried, no health
                  insurance — and the same expenses demand a materially longer runway; the workflow recomputes the whole
                  plan instantly.
                </p>
              </>
            )}
            formula={(
              <>
                <p>
                  Core flow: start from monthly essentials, adjust target months using job risk, income stability, insurance,
                  household structure, and dependents, then compare the target corpus with current liquid reserves to estimate
                  gap and timeline to target.
                </p>
                <p>
                  The target begins at a four-month base and moves with each risk answer — higher for volatile income,
                  layoff-prone industries, single-income households, and dependents; lower when health insurance already
                  absorbs the most common financial shock. The result is clamped between 3 and 12 months: never less
                  than a quarter of runway, never more than a year of idle cash. The funding plan then splits your
                  surplus by phase — aggressive while coverage is critical, moderate while building, light once the
                  target is met — so the recommendation stays realistic instead of demanding your entire surplus forever.
                </p>
              </>
            )}
            faqItems={faqItems}
            relatedLinks={[
              { label: 'Emergency Fund Readiness Guide', href: '/guides/emergency-fund-readiness' },
              { label: 'Prepay vs Invest Workflow', href: '/prepay-vs-invest-workflow' },
              { label: 'Car Ownership Cost Guide', href: '/guides/car-ownership-cost-guide' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default EmergencyFundReadinessWorkflow;
