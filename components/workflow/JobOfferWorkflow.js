import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Briefcase, TrendingUp, PiggyBank, Wallet, CheckCircle2 } from 'lucide-react';
import EEATPanel from '../calculator/EEATPanel';
import SearchLandingSections from '../calculator/SearchLandingSections';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import { NumberField, SelectField } from '../ui/Field';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { WorkflowSteps, HowToNote, DecisionBanner, Panel, ActionList } from '../workflow/WorkflowKit';
import { buildBreadcrumbSchema } from '../../utils/schema';
import { editorialProfiles } from '../../utils/editorialProfiles';

const regionConfigs = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    annualCompLabel: 'Annual CTC',
    fixedCostLabel: 'Monthly Fixed Costs (Rent + Existing EMI + Essentials)',
    taxModelLabel: 'India progressive estimate with cess and professional tax assumptions.',
    employeeContributionRate: 0.12,
    employeeContributionCap: 21600,
    standardDeduction: 0,
    cessRate: 0.04,
    decisionThresholds: {
      realGainLow: 7000,
      monthlySurplusTight: 18000
    },
    taxBrackets: [
      { upTo: 400000, rate: 0 },
      { upTo: 800000, rate: 0.05 },
      { upTo: 1200000, rate: 0.1 },
      { upTo: 1600000, rate: 0.15 },
      { upTo: 2000000, rate: 0.2 },
      { upTo: 2400000, rate: 0.25 },
      { upTo: Infinity, rate: 0.3 }
    ],
    locationTiers: {
      high: {
        label: 'Tier 1 Metro',
        costIndex: 1.0,
        localChargeFixed: 2500,
        localChargeRate: 0
      },
      mid: {
        label: 'Tier 2 City',
        costIndex: 0.82,
        localChargeFixed: 2000,
        localChargeRate: 0
      },
      low: {
        label: 'Tier 3 / Small Town',
        costIndex: 0.7,
        localChargeFixed: 1200,
        localChargeRate: 0
      }
    },
    defaults: {
      currentComp: 800000,
      newComp: 1200000,
      monthlyFixedCosts: 35000,
      currentLocation: 'mid',
      newLocation: 'high'
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    annualCompLabel: 'Annual Gross Pay',
    fixedCostLabel: 'Monthly Fixed Costs (Housing + Debt + Essentials)',
    taxModelLabel: 'Federal-style progressive estimate with payroll and local tax assumptions.',
    employeeContributionRate: 0.0765,
    employeeContributionCap: Infinity,
    standardDeduction: 14600,
    cessRate: 0,
    decisionThresholds: {
      realGainLow: 550,
      monthlySurplusTight: 1800
    },
    taxBrackets: [
      { upTo: 12000, rate: 0.1 },
      { upTo: 48000, rate: 0.12 },
      { upTo: 103000, rate: 0.22 },
      { upTo: 191000, rate: 0.24 },
      { upTo: Infinity, rate: 0.32 }
    ],
    locationTiers: {
      high: {
        label: 'High-Cost Metro',
        costIndex: 1.2,
        localChargeFixed: 0,
        localChargeRate: 0.06
      },
      mid: {
        label: 'Mid-Cost City',
        costIndex: 1.0,
        localChargeFixed: 0,
        localChargeRate: 0.04
      },
      low: {
        label: 'Lower-Cost City',
        costIndex: 0.86,
        localChargeFixed: 0,
        localChargeRate: 0.025
      }
    },
    defaults: {
      currentComp: 90000,
      newComp: 115000,
      monthlyFixedCosts: 4200,
      currentLocation: 'mid',
      newLocation: 'high'
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    annualCompLabel: 'Annual Gross Pay',
    fixedCostLabel: 'Monthly Fixed Costs (Housing + Debt + Essentials)',
    taxModelLabel: 'EU/UK blended progressive estimate with social and local deduction assumptions.',
    employeeContributionRate: 0.09,
    employeeContributionCap: Infinity,
    standardDeduction: 10000,
    cessRate: 0,
    decisionThresholds: {
      realGainLow: 450,
      monthlySurplusTight: 1500
    },
    taxBrackets: [
      { upTo: 15000, rate: 0 },
      { upTo: 40000, rate: 0.2 },
      { upTo: 85000, rate: 0.3 },
      { upTo: 160000, rate: 0.4 },
      { upTo: Infinity, rate: 0.45 }
    ],
    locationTiers: {
      high: {
        label: 'Major Capital / Financial Center',
        costIndex: 1.18,
        localChargeFixed: 0,
        localChargeRate: 0.035
      },
      mid: {
        label: 'Regional City',
        costIndex: 1.0,
        localChargeFixed: 0,
        localChargeRate: 0.025
      },
      low: {
        label: 'Lower-Cost Town',
        costIndex: 0.88,
        localChargeFixed: 0,
        localChargeRate: 0.015
      }
    },
    defaults: {
      currentComp: 68000,
      newComp: 84000,
      monthlyFixedCosts: 3000,
      currentLocation: 'mid',
      newLocation: 'high'
    }
  }
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionConfigs[regionKey]?.defaults;
  return {
    currentCTC: defaults?.currentComp ?? 0,
    newCTC: defaults?.newComp ?? 0,
    monthlyFixedCosts: defaults?.monthlyFixedCosts ?? 0,
    currentCity: defaults?.currentLocation ?? 'mid',
    newCity: defaults?.newLocation ?? 'high'
  };
};

const profileAllocations = {
  conservative: { sip: 0.3, emergency: 0.45, emiRatio: 0.25 },
  balanced: { sip: 0.4, emergency: 0.25, emiRatio: 0.35 },
  aggressive: { sip: 0.5, emergency: 0.1, emiRatio: 0.4 }
};

const round = (value) => Math.round(value);

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const progressiveTax = (taxableIncome, taxBrackets) => {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let lowerBound = 0;

  for (const bracket of taxBrackets) {
    if (taxableIncome <= lowerBound) break;
    const upperBound = bracket.upTo;
    const taxableAtThisRate = Math.min(taxableIncome, upperBound) - lowerBound;
    if (taxableAtThisRate > 0) {
      tax += taxableAtThisRate * bracket.rate;
    }
    lowerBound = upperBound;
  }

  return round(tax);
};

const calculateTakeHome = (annualComp, regionConfig, locationKey) => {
  const locationTier = regionConfig.locationTiers[locationKey] || regionConfig.locationTiers.mid;
  const contributionCap = regionConfig.employeeContributionCap ?? Infinity;
  const employeeContribution = round(Math.min(annualComp * regionConfig.employeeContributionRate, contributionCap));
  const taxableIncome = Math.max(0, annualComp - employeeContribution - (regionConfig.standardDeduction || 0));
  const baseTax = progressiveTax(taxableIncome, regionConfig.taxBrackets);
  const annualTax = round(baseTax * (1 + (regionConfig.cessRate || 0)));
  const localCharge = round(annualComp * (locationTier.localChargeRate || 0) + (locationTier.localChargeFixed || 0));
  const annualNet = round(annualComp - employeeContribution - annualTax - localCharge);
  const monthlyNet = round(annualNet / 12);
  const realValueMonthly = round(monthlyNet / locationTier.costIndex);

  return {
    employeeContribution,
    annualTax,
    localCharge,
    monthlyNet,
    annualNet,
    realValueMonthly
  };
};

const recommendationFor = (monthlyGain, realGain, monthlySurplus, thresholds) => {
  if (monthlyGain <= 0) {
    return {
      label: 'Do not switch yet',
      reason: 'Your estimated monthly in-hand does not improve after deductions.',
      tone: 'danger'
    };
  }

  if (realGain < thresholds.realGainLow) {
    return {
      label: 'Negotiate before accepting',
      reason: 'Offer improves cash flow, but cost-of-living adjusted gain is still limited.',
      tone: 'warning'
    };
  }

  if (monthlySurplus < thresholds.monthlySurplusTight) {
    return {
      label: 'Accept with a tighter budget',
      reason: 'Income improves, but discretionary headroom remains tight after fixed costs.',
      tone: 'info'
    };
  }

  return {
    label: 'Accept offer',
    reason: 'The offer improves both take-home and monthly planning flexibility.',
    tone: 'positive'
  };
};

const JobOfferWorkflow = () => {
  const [step, setStep] = useState(1);
  const baseRegion = 'india';
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion),
    riskProfile: 'balanced'
  });

  const regionConfig = regionConfigs[inputs.region];
  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));
  const fmt = (value) => formatCurrency(value, regionConfig);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Job Offer Decision Workflow', item: 'https://upaman.com/job-offer-workflow' }
  ]);
  const faqItems = [
    {
      question: 'Why compare job offers using take-home instead of CTC?',
      answer: 'Take-home pay is what actually reaches your budget. CTC or gross pay can overstate the practical benefit of switching jobs.'
    },
    {
      question: 'Why does location matter in this workflow?',
      answer: 'A higher offer in a more expensive city may not improve real monthly flexibility as much as the headline number suggests.'
    },
    {
      question: 'What should I do if the real gain is small?',
      answer: 'That usually means you should negotiate harder, delay the switch, or compare non-cash factors more carefully before deciding.'
    },
    {
      question: 'How can a 50% raise translate into a much smaller real improvement?',
      answer: 'Three leaks between the headline and your wallet: progressive tax takes a larger share of the higher package, deductions scale with pay, and a move to a costlier city dilutes every rupee’s purchasing power. In the India default here, an ₹8 lakh to ₹12 lakh jump — 50% on paper — improves monthly in-hand by about ₹29,900, but the cost-adjusted gain after moving from a Tier-2 city to a metro is roughly ₹16,000. Real, but nearly half the raise evaporates before it improves your life.'
    },
    {
      question: 'What does the workflow’s tax model include, and what should I not rely on it for?',
      answer: 'It applies a simplified progressive bracket estimate with employee contributions and location-linked charges — enough to compare two offers on a like-for-like basis, which is its job. It is not a filing-grade computation: it ignores your personal deductions, regime choice, and employer-specific structure. Use the salary calculator and income tax calculator for those; use this page for the switch/negotiate/decline decision.'
    },
    {
      question: 'Should non-cash factors override the number?',
      answer: 'Sometimes, and the workflow deliberately leaves room for that. A small real gain plus better learning, title, or stability can be a good trade — the danger is making that trade unknowingly. Get the cash-flow answer first, then decide consciously how much career upside you are buying with it.'
    }
  ];
  const locationOptions = Object.entries(regionConfig.locationTiers).map(([key, config]) => ({
    value: key,
    label: config.label
  }));

  const current = useMemo(
    () => calculateTakeHome(Number(inputs.currentCTC) || 0, regionConfig, inputs.currentCity),
    [inputs.currentCTC, inputs.currentCity, regionConfig]
  );
  const offer = useMemo(
    () => calculateTakeHome(Number(inputs.newCTC) || 0, regionConfig, inputs.newCity),
    [inputs.newCTC, inputs.newCity, regionConfig]
  );

  const deltas = useMemo(() => {
    const monthlyGain = offer.monthlyNet - current.monthlyNet;
    const realGain = offer.realValueMonthly - current.realValueMonthly;
    const taxDelta = offer.annualTax - current.annualTax;
    const contributionDelta = offer.employeeContribution - current.employeeContribution;
    const localChargeDelta = offer.localCharge - current.localCharge;
    const monthlySurplus = Math.max(0, offer.monthlyNet - (Number(inputs.monthlyFixedCosts) || 0));
    const allocation = profileAllocations[inputs.riskProfile];
    const sipSuggestion = round(monthlySurplus * allocation.sip);
    const emergencySuggestion = round(monthlySurplus * allocation.emergency);
    const emiCap = round(offer.monthlyNet * allocation.emiRatio);

    return {
      monthlyGain,
      realGain,
      taxDelta,
      contributionDelta,
      localChargeDelta,
      monthlySurplus,
      sipSuggestion,
      emergencySuggestion,
      emiCap,
      recommendation: recommendationFor(monthlyGain, realGain, monthlySurplus, regionConfig.decisionThresholds)
    };
  }, [offer, current, inputs.monthlyFixedCosts, inputs.riskProfile, regionConfig.decisionThresholds]);

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Decision workflow"
        title="Job Offer Decision Workflow"
        subtitle="One flow: compare take-home, stress-test your monthly budget, then decide."
      >
        <EEATPanel
          author={editorialProfiles.researchTeam}
          reviewer={editorialProfiles.financeReviewDesk}
          reviewedOn="June 28, 2026"
          scope="This workflow compares modeled take-home impact, city-adjusted spending power, and monthly surplus guidance. It supports planning, not formal compensation advice."
          sources={[
            { label: 'Income Tax Department of India', url: 'https://incometaxindia.gov.in/' },
            { label: 'IRS', url: 'https://www.irs.gov/' },
            { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' }
          ]}
        />

        <div className="mt-6">
          <WorkflowSteps steps={['Inputs', 'In-hand Impact', 'Decision Plan']} active={step} onChange={setStep} />
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              items={[
                'Enter current and new package values from actual offer letters.',
                'Choose location types honestly to avoid inflated gain estimates.',
                'Keep fixed costs realistic so the monthly surplus calculation is useful.'
              ]}
            />
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  id="jo-region"
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
                  id="jo-current"
                  label={`Current ${regionConfig.annualCompLabel} (${regionConfig.currency})`}
                  value={inputs.currentCTC}
                  onChange={(v) => set('currentCTC', v)}
                  hint="Use your current effective annual package, not an outdated salary."
                />
                <NumberField
                  id="jo-new"
                  label={`New ${regionConfig.annualCompLabel} (${regionConfig.currency})`}
                  value={inputs.newCTC}
                  onChange={(v) => set('newCTC', v)}
                  hint="If the offer has variable pay, use a conservative expected value."
                />
                <SelectField
                  id="jo-curcity"
                  label="Current Location Type"
                  value={inputs.currentCity}
                  onChange={(v) => set('currentCity', v)}
                  options={locationOptions}
                />
                <SelectField
                  id="jo-newcity"
                  label="New Location Type"
                  value={inputs.newCity}
                  onChange={(v) => set('newCity', v)}
                  options={locationOptions}
                />
                <NumberField
                  id="jo-fixed"
                  label={`${regionConfig.fixedCostLabel} (${regionConfig.currency})`}
                  value={inputs.monthlyFixedCosts}
                  onChange={(v) => set('monthlyFixedCosts', v)}
                  hint="Include rent, EMIs, and recurring essentials only."
                />
                <SelectField
                  id="jo-risk"
                  label="Risk Profile"
                  value={inputs.riskProfile}
                  onChange={(v) => set('riskProfile', v)}
                  options={[
                    { value: 'conservative', label: 'Conservative' },
                    { value: 'balanced', label: 'Balanced' },
                    { value: 'aggressive', label: 'Aggressive' }
                  ]}
                />
              </div>
              <p className="mt-4 text-sm text-ink-muted dark:text-slate-400">
                Model assumptions: {regionConfig.taxModelLabel}
              </p>
            </Card>
            <Button onClick={() => setStep(2)}>Continue to In-hand Impact</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              title="How to read this step"
              items={[
                'Monthly gain is the raw cash difference after modeled deductions.',
                'Cost-of-living adjusted gain shows the real spending-power change.',
                'If adjusted gain is low, negotiate or revise expectations before switching.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ResultStat label="Current in-hand (monthly)" value={fmt(current.monthlyNet)} />
              <ResultStat label="New in-hand (monthly)" value={fmt(offer.monthlyNet)} emphasis tone="positive" />
              <ResultStat label="Monthly gain (actual)" value={fmt(deltas.monthlyGain)} />
              <ResultStat label="Annual tax difference" value={fmt(deltas.taxDelta)} />
              <ResultStat label="Employee contribution difference" value={fmt(deltas.contributionDelta)} />
              <ResultStat label="Local deduction difference" value={fmt(deltas.localChargeDelta)} />
            </div>
            <Panel>
              <p className="text-sm text-ink-soft dark:text-slate-300">
                Cost-of-living adjusted monthly gain:{' '}
                <strong className="font-semibold text-ink dark:text-white">{fmt(deltas.realGain)}</strong>
              </p>
            </Panel>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>Back to Inputs</Button>
              <Button onClick={() => setStep(3)}>Continue to Decision Plan</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-5">
            <DecisionBanner
              tone={deltas.recommendation.tone}
              label={deltas.recommendation.label}
              reason={deltas.recommendation.reason}
              icon={<CheckCircle2 size={18} />}
            />
            <HowToNote
              title="How to use this plan"
              items={[
                'Treat this as first-month allocation guidance after switching.',
                'Protect emergency runway first, then scale investing and EMI commitments.',
                'Re-run after 2-3 salary cycles with actual cash-flow data.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Free monthly surplus" value={fmt(deltas.monthlySurplus)} />
              <ResultStat label="Suggested monthly investing" value={fmt(deltas.sipSuggestion)} />
              <ResultStat label="Emergency fund bucket" value={fmt(deltas.emergencySuggestion)} />
              <ResultStat label="Max EMI cap (profile-based)" value={fmt(deltas.emiCap)} />
            </div>
            <Card className="p-5">
              <ActionList
                title="Action checklist"
                items={[
                  'Keep total EMIs under the suggested cap before accepting bigger liabilities.',
                  'Automate monthly investing on salary day to maintain discipline.',
                  'Build 4-6 months emergency runway from the monthly emergency bucket.'
                ]}
              />
            </Card>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back to In-hand Impact</Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <SearchLandingSections
            intro={(
              <>
                <p>
                  Job offers should be compared using real cash-flow improvement, not just the package headline. The more
                  useful question is how much more money reaches your monthly budget after deductions and location-linked costs.
                </p>
                <p>
                  This workflow combines take-home comparison, city-adjusted spending power, and a first-month action plan
                  so the decision is grounded in actual affordability.
                </p>
              </>
            )}
            example={(
              <>
                <p>
                  If one role increases take-home by 18,000 per month but rent and fixed costs rise by 12,000 after a move,
                  the practical gain is much smaller than the offer headline suggests. That is exactly the kind of mismatch
                  this workflow is designed to expose.
                </p>
                <p>
                  The India defaults show the full anatomy. Moving from ₹8 lakh in a Tier-2 city to ₹12 lakh in a metro is
                  a 50% raise on paper. Modeled monthly in-hand rises from about ₹63,060 to ₹92,979 — a gain of ₹29,919,
                  meaningfully less than the headline because tax on the new package more than triples. Then the location
                  adjustment does its work: the Tier-2 salary was stretching further (the model prices that city at 82%
                  of metro costs), so in like-for-like purchasing power the improvement is roughly ₹16,000 a month.
                  Still a clear &ldquo;accept&rdquo; on these inputs — the surplus after ₹35,000 of fixed costs is
                  healthy — but the negotiation should be anchored on ₹16,000, not on &ldquo;50%&rdquo;.
                </p>
                <p>
                  Try the reversal too: the same switch with the cities swapped often produces a startlingly good real
                  gain, which is why remote roles and Tier-2 relocations at modest raises can beat metro offers with
                  bigger numbers on them.
                </p>
              </>
            )}
            formula={(
              <>
                <p>
                  Core flow: estimate monthly net pay after modeled tax, employee contribution, and local charges; adjust the
                  output by cost-of-living assumptions; subtract fixed expenses; then translate the remaining surplus into a
                  simple recommendation and allocation plan.
                </p>
                <p>
                  The recommendation tiers are deliberately blunt. A negative in-hand change says do not switch on money
                  grounds at all. A positive change with a thin cost-adjusted gain says negotiate — you are being paid in
                  headline, not in purchasing power. A good real gain with tight leftover surplus flags budget risk
                  before you commit to the new city&rsquo;s rents. Only when both the real gain and the monthly surplus
                  clear their thresholds does the workflow say accept outright — and then the allocation plan puts the
                  new surplus to work across investing, emergency buffer, and debt according to your risk profile,
                  because the first three months after a raise are when lifestyle inflation locks in.
                </p>
              </>
            )}
            faqItems={faqItems}
            relatedLinks={[
              { label: 'How to Compare Job Offers Guide', href: '/guides/how-to-compare-job-offers' },
              { label: 'Salary Calculator', href: '/salary-calculator' },
              { label: 'CTC to In-hand Breakdown Guide', href: '/guides/ctc-to-in-hand-salary' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default JobOfferWorkflow;
