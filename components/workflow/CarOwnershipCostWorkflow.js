import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Car, Fuel, Wallet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PieBreakdownChart, ComparisonBars } from '../calculator/ResultVisualizations';
import EEATPanel from '../calculator/EEATPanel';
import SearchLandingSections from '../calculator/SearchLandingSections';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import { NumberField, SelectField } from '../ui/Field';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { WorkflowSteps, HowToNote, DecisionBanner, Panel, ActionList } from '../workflow/WorkflowKit';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';
import { editorialProfiles } from '../../utils/editorialProfiles';

const regionSettings = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    distanceUnit: 'km',
    fuelUnit: 'litre',
    efficiencyLabel: 'Fuel efficiency (km/litre)',
    fuelPriceLabel: 'Fuel price per litre',
    transportRatio: 0.16,
    safetyBuffer: 15000,
    defaults: {
      monthlyInHand: 120000,
      monthlyFixedExpenses: 45000,
      carEmi: 18000,
      roundTripDistance: 36,
      officeDays: 22,
      fuelEfficiency: 16,
      fuelPrice: 105,
      monthlyTolls: 2200,
      monthlyParking: 1800,
      monthlyMaintenance: 2500,
      annualInsurance: 28000,
      carValue: 1200000,
      annualDepreciationPct: 12,
      alternativeCommuteMonthly: 5500
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    distanceUnit: 'miles',
    fuelUnit: 'gallon',
    efficiencyLabel: 'Fuel efficiency (miles/gallon)',
    fuelPriceLabel: 'Fuel price per gallon',
    transportRatio: 0.15,
    safetyBuffer: 800,
    defaults: {
      monthlyInHand: 6500,
      monthlyFixedExpenses: 2800,
      carEmi: 450,
      roundTripDistance: 24,
      officeDays: 20,
      fuelEfficiency: 28,
      fuelPrice: 3.8,
      monthlyTolls: 75,
      monthlyParking: 140,
      monthlyMaintenance: 120,
      annualInsurance: 1800,
      carValue: 28000,
      annualDepreciationPct: 15,
      alternativeCommuteMonthly: 240
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    distanceUnit: 'km',
    fuelUnit: 'litre',
    efficiencyLabel: 'Fuel efficiency (km/litre)',
    fuelPriceLabel: 'Fuel price per litre',
    transportRatio: 0.15,
    safetyBuffer: 700,
    defaults: {
      monthlyInHand: 4600,
      monthlyFixedExpenses: 2100,
      carEmi: 320,
      roundTripDistance: 28,
      officeDays: 20,
      fuelEfficiency: 17,
      fuelPrice: 1.9,
      monthlyTolls: 45,
      monthlyParking: 70,
      monthlyMaintenance: 95,
      annualInsurance: 900,
      carValue: 22000,
      annualDepreciationPct: 13,
      alternativeCommuteMonthly: 180
    }
  }
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionSettings[regionKey]?.defaults;
  return {
    monthlyInHand: defaults?.monthlyInHand ?? 0,
    monthlyFixedExpenses: defaults?.monthlyFixedExpenses ?? 0,
    carEmi: defaults?.carEmi ?? 0,
    roundTripDistance: defaults?.roundTripDistance ?? 0,
    officeDays: defaults?.officeDays ?? 0,
    fuelEfficiency: defaults?.fuelEfficiency ?? 0,
    fuelPrice: defaults?.fuelPrice ?? 0,
    monthlyTolls: defaults?.monthlyTolls ?? 0,
    monthlyParking: defaults?.monthlyParking ?? 0,
    monthlyMaintenance: defaults?.monthlyMaintenance ?? 0,
    annualInsurance: defaults?.annualInsurance ?? 0,
    carValue: defaults?.carValue ?? 0,
    annualDepreciationPct: defaults?.annualDepreciationPct ?? 0,
    alternativeCommuteMonthly: defaults?.alternativeCommuteMonthly ?? 0
  };
};

const round = (value) => Math.round(value);

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const CarOwnershipCostWorkflow = () => {
  const baseRegion = 'india';
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion)
  });

  const regionConfig = regionSettings[inputs.region];
  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));
  const fmt = (value) => formatCurrency(value, regionConfig);

  const output = useMemo(() => {
    const monthlyInHand = Math.max(0, Number(inputs.monthlyInHand) || 0);
    const monthlyFixedExpenses = Math.max(0, Number(inputs.monthlyFixedExpenses) || 0);
    const carEmi = Math.max(0, Number(inputs.carEmi) || 0);
    const roundTripDistance = Math.max(0, Number(inputs.roundTripDistance) || 0);
    const officeDays = Math.max(0, Number(inputs.officeDays) || 0);
    const fuelEfficiency = Math.max(0.1, Number(inputs.fuelEfficiency) || 0.1);
    const fuelPrice = Math.max(0, Number(inputs.fuelPrice) || 0);
    const monthlyTolls = Math.max(0, Number(inputs.monthlyTolls) || 0);
    const monthlyParking = Math.max(0, Number(inputs.monthlyParking) || 0);
    const monthlyMaintenance = Math.max(0, Number(inputs.monthlyMaintenance) || 0);
    const annualInsurance = Math.max(0, Number(inputs.annualInsurance) || 0);
    const carValue = Math.max(0, Number(inputs.carValue) || 0);
    const annualDepreciationPct = Math.max(0, Number(inputs.annualDepreciationPct) || 0);
    const alternativeCommuteMonthly = Math.max(0, Number(inputs.alternativeCommuteMonthly) || 0);

    const monthlyDistance = round(roundTripDistance * officeDays);
    const monthlyFuelUnits = monthlyDistance / fuelEfficiency;
    const monthlyFuelCost = round(monthlyFuelUnits * fuelPrice);
    const insuranceMonthly = round(annualInsurance / 12);
    const monthlyDepreciation = round((carValue * annualDepreciationPct / 100) / 12);
    const commuteOnlyCost = round(monthlyFuelCost + monthlyTolls + monthlyParking);
    const trueOwnershipCost = round(
      monthlyFuelCost +
      monthlyTolls +
      monthlyParking +
      monthlyMaintenance +
      insuranceMonthly +
      monthlyDepreciation +
      carEmi
    );
    const transportBudgetTarget = round(
      Math.max(
        0,
        Math.min(
          monthlyInHand * regionConfig.transportRatio,
          monthlyInHand - monthlyFixedExpenses - regionConfig.safetyBuffer
        )
      )
    );
    const postOwnershipBuffer = round(monthlyInHand - monthlyFixedExpenses - trueOwnershipCost);
    const postAlternativeBuffer = round(monthlyInHand - monthlyFixedExpenses - alternativeCommuteMonthly);
    const monthlyGapVsAlternative = round(trueOwnershipCost - alternativeCommuteMonthly);
    const annualOwnershipCost = round(trueOwnershipCost * 12);
    const annualAlternativeCost = round(alternativeCommuteMonthly * 12);
    const annualSavingsWithAlternative = round(Math.max(0, annualOwnershipCost - annualAlternativeCost));
    const costSharePct = monthlyInHand > 0 ? (trueOwnershipCost / monthlyInHand) * 100 : 0;
    const oneOfficeDayDriveCost = round(
      (roundTripDistance / fuelEfficiency) * fuelPrice +
      (officeDays > 0 ? monthlyTolls / officeDays : 0) +
      (officeDays > 0 ? monthlyParking / officeDays : 0)
    );
    const fourDaysHybridSavings = round(oneOfficeDayDriveCost * 4);

    let recommendation;
    if (postOwnershipBuffer < 0 || trueOwnershipCost > monthlyInHand * 0.25) {
      recommendation = {
        label: 'Car cost is too heavy',
        tone: 'danger',
        reason: 'Transport is consuming too much of monthly income after essential expenses.'
      };
    } else if (trueOwnershipCost > transportBudgetTarget || postOwnershipBuffer < regionConfig.safetyBuffer) {
      recommendation = {
        label: 'Manageable, but tight',
        tone: 'warning',
        reason: 'You can carry this cost, but it leaves less room for savings, emergencies, and future goals.'
      };
    } else if (alternativeCommuteMonthly > 0 && monthlyGapVsAlternative > transportBudgetTarget * 0.35) {
      recommendation = {
        label: 'Use a hybrid commute',
        tone: 'info',
        reason: 'Owning and driving is workable, but the cheaper commute option saves enough to matter.'
      };
    } else {
      recommendation = {
        label: 'Current car budget is reasonable',
        tone: 'positive',
        reason: 'Your monthly transport cost fits the modeled budget without stressing cash flow.'
      };
    }

    const actionItems = [
      `Fuel alone costs about ${formatCurrency(monthlyFuelCost, regionConfig)} per month across ${monthlyDistance} ${regionConfig.distanceUnit}.`,
      `Keep total transport cost near ${formatCurrency(transportBudgetTarget, regionConfig)} or below to protect other goals.`,
      alternativeCommuteMonthly > 0
        ? `A cheaper commute option saves about ${formatCurrency(Math.max(0, monthlyGapVsAlternative), regionConfig)} per month and ${formatCurrency(annualSavingsWithAlternative, regionConfig)} per year.`
        : 'Compare this against a public transport or car-pool alternative if you want a true decision view.',
      `Cutting four office commute days per month saves about ${formatCurrency(fourDaysHybridSavings, regionConfig)} without changing the car itself.`
    ];

    return {
      monthlyDistance,
      monthlyFuelUnits: round(monthlyFuelUnits * 10) / 10,
      monthlyFuelCost,
      insuranceMonthly,
      monthlyDepreciation,
      commuteOnlyCost,
      trueOwnershipCost,
      transportBudgetTarget,
      postOwnershipBuffer,
      postAlternativeBuffer,
      monthlyGapVsAlternative,
      annualOwnershipCost,
      annualAlternativeCost,
      annualSavingsWithAlternative,
      costSharePct,
      oneOfficeDayDriveCost,
      fourDaysHybridSavings,
      recommendation,
      actionItems
    };
  }, [inputs, regionConfig]);

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Car Ownership Cost Workflow',
    url: 'https://upaman.com/car-ownership-cost-workflow',
    description: 'Transport budgeting workflow with fuel expense, EMI, insurance, maintenance, depreciation, and cheaper-commute comparison.',
    applicationCategory: 'FinanceApplication',
    featureList: [
      'Fuel Expense Calculator',
      'Monthly Car Cost Breakdown',
      'Alternative Commute Comparison',
      'Transport Budget Check'
    ]
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'Car Ownership Cost Workflow', item: 'https://upaman.com/car-ownership-cost-workflow' }
  ]);

  const seoFaqItems = [
    {
      question: 'Why is fuel cost alone not enough to budget for a car?',
      answer: 'Fuel is only the running-cost layer. EMI, insurance, maintenance, parking, tolls, and depreciation usually change the real monthly affordability picture much more than people expect.'
    },
    {
      question: 'What transport budget is considered safe?',
      answer: 'This workflow uses a conservative share of monthly in-hand income and leaves a safety buffer after fixed expenses. The exact number depends on region and existing obligations.'
    },
    {
      question: 'When does a cheaper commute option become worth considering?',
      answer: 'If the cheaper option saves a meaningful amount every month and your current car budget is crowding out savings, emergency funds, or debt reduction, it is worth testing.'
    },
    {
      question: 'Why does the workflow count depreciation when it never leaves my bank account?',
      answer: 'Because it leaves your net worth instead. On the default ₹12 lakh car depreciating 12% a year, ₹12,000 a month of value quietly disappears — more than the fuel, tolls, and parking combined. You feel it all at once at resale time rather than monthly, which is exactly why budgets that ignore it look healthier than they are. Counting it monthly is what makes the ownership number honest.'
    },
    {
      question: 'Does “sell the car” follow from a bad number here?',
      answer: 'Not necessarily — the workflow is a measurement, not a mandate. A car can be worth a genuine premium for safety, family logistics, or time. The question it forces is whether you know the size of the premium you are paying: if the true monthly cost is double your safe transport budget, that is a decision to make deliberately, not a default to drift into. Partial fixes — driving fewer days, a cheaper vehicle at replacement time, or restructuring the loan — often close most of the gap.'
    },
    {
      question: 'How should I use the per-day drive cost?',
      answer: 'It converts a monthly abstraction into a daily choice. The model divides your variable costs — fuel, tolls, parking — across office days, so you can price a single decision like “drive today or take the metro”. Hybrid work makes this concrete: each home-working day saves one day of variable cost, and the workflow shows the monthly effect of a four-day saving directly.'
    }
  ];

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Decision workflow"
        title="Car Ownership Cost Workflow"
        subtitle="Estimate the true monthly driving cost with fuel, EMI, insurance, upkeep, and a cheaper-commute comparison."
      >
        <EEATPanel
          author={editorialProfiles.researchTeam}
          reviewer={editorialProfiles.financeReviewDesk}
          reviewedOn="June 28, 2026"
          scope="This workflow estimates transport affordability using user-entered driving, loan, and upkeep assumptions. It is for planning, not insurer or lender validation."
          sources={[
            { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
            { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/' },
            { label: 'NHTSA Vehicle Ownership Resources', url: 'https://www.nhtsa.gov/road-safety' }
          ]}
        />

        <div className="mt-6">
          <WorkflowSteps steps={['Inputs', 'Cost View', 'Action Plan']} active={step} onChange={setStep} />
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              items={[
                'Use net monthly income and only essential fixed expenses.',
                'Enter realistic commute distance and office days, not best-case estimates.',
                'Include EMI and upkeep even if fuel feels like the main expense — that is where transport budgets usually get distorted.'
              ]}
            />
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  id="co-region"
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
                  id="co-income"
                  label={`Monthly in-hand income (${regionConfig.currency})`}
                  value={inputs.monthlyInHand}
                  onChange={(v) => set('monthlyInHand', v)}
                  hint="Use post-tax income available for actual spending."
                />
                <NumberField
                  id="co-expenses"
                  label={`Monthly fixed expenses (${regionConfig.currency})`}
                  value={inputs.monthlyFixedExpenses}
                  onChange={(v) => set('monthlyFixedExpenses', v)}
                  hint="Rent, EMIs, groceries, utilities, and other non-negotiable bills."
                />
                <NumberField
                  id="co-emi"
                  label={`Car EMI (${regionConfig.currency})`}
                  value={inputs.carEmi}
                  onChange={(v) => set('carEmi', v)}
                  hint="Set to zero if the vehicle is already fully paid off."
                />
                <NumberField
                  id="co-distance"
                  label={`Daily round-trip commute (${regionConfig.distanceUnit})`}
                  value={inputs.roundTripDistance}
                  onChange={(v) => set('roundTripDistance', v)}
                  hint="Distance for one workday there-and-back travel."
                />
                <NumberField
                  id="co-days"
                  label="Office days per month"
                  value={inputs.officeDays}
                  onChange={(v) => set('officeDays', v)}
                  hint="Use expected office or driving days, not calendar days."
                />
                <NumberField
                  id="co-eff"
                  label={regionConfig.efficiencyLabel}
                  value={inputs.fuelEfficiency}
                  onChange={(v) => set('fuelEfficiency', v)}
                  hint="Average real-world efficiency is better than brochure numbers."
                />
                <NumberField
                  id="co-fuel"
                  label={`${regionConfig.fuelPriceLabel} (${regionConfig.currency})`}
                  value={inputs.fuelPrice}
                  onChange={(v) => set('fuelPrice', v)}
                  hint="Use the regular fuel price you actually pay."
                />
                <NumberField
                  id="co-tolls"
                  label={`Monthly tolls (${regionConfig.currency})`}
                  value={inputs.monthlyTolls}
                  onChange={(v) => set('monthlyTolls', v)}
                  hint="Fastag, toll roads, congestion charges, or similar recurring charges."
                />
                <NumberField
                  id="co-parking"
                  label={`Monthly parking (${regionConfig.currency})`}
                  value={inputs.monthlyParking}
                  onChange={(v) => set('monthlyParking', v)}
                  hint="Office parking, building parking, or public parking passes."
                />
                <NumberField
                  id="co-maint"
                  label={`Monthly maintenance reserve (${regionConfig.currency})`}
                  value={inputs.monthlyMaintenance}
                  onChange={(v) => set('monthlyMaintenance', v)}
                  hint="Tyres, servicing, minor repairs, washing, and misc upkeep reserve."
                />
                <NumberField
                  id="co-ins"
                  label={`Annual insurance (${regionConfig.currency})`}
                  value={inputs.annualInsurance}
                  onChange={(v) => set('annualInsurance', v)}
                  hint="Full-year premium; the model converts this to monthly cost."
                />
                <NumberField
                  id="co-value"
                  label={`Current car value (${regionConfig.currency})`}
                  value={inputs.carValue}
                  onChange={(v) => set('carValue', v)}
                  hint="Approximate resale or current market value for depreciation estimate."
                />
                <NumberField
                  id="co-dep"
                  label="Annual depreciation"
                  suffix="%"
                  value={inputs.annualDepreciationPct}
                  onChange={(v) => set('annualDepreciationPct', v)}
                  hint="Approximate annual drop in car value. Use a conservative estimate."
                />
                <NumberField
                  id="co-alt"
                  label={`Alternative monthly commute cost (${regionConfig.currency})`}
                  value={inputs.alternativeCommuteMonthly}
                  onChange={(v) => set('alternativeCommuteMonthly', v)}
                  hint="Public transport, car-pool, taxi budget, or hybrid commute benchmark."
                />
              </div>
            </Card>
            <Button onClick={() => setStep(2)}>Continue to Cost View</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              title="How to read this"
              items={[
                'Fuel cost is only one part of total transport spending.',
                'The all-in car number is what matters for budgeting decisions.',
                'Compare car cost with the cheaper commute option before treating driving as a fixed necessity.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ResultStat label="Monthly fuel cost" value={fmt(output.monthlyFuelCost)} />
              <ResultStat label="Commute distance / month" value={`${output.monthlyDistance} ${regionConfig.distanceUnit}`} />
              <ResultStat label="Commute-only cost" value={fmt(output.commuteOnlyCost)} />
              <ResultStat label="True car ownership cost" value={fmt(output.trueOwnershipCost)} emphasis />
              <ResultStat label="Suggested transport budget" value={fmt(output.transportBudgetTarget)} />
              <ResultStat label="Cost vs alternative" value={fmt(output.monthlyGapVsAlternative)} />
            </div>
            <Panel>
              <p className="text-sm text-ink-soft dark:text-slate-300">
                Transport cost share of income:{' '}
                <strong className="font-semibold text-ink dark:text-white">{output.costSharePct.toFixed(1)}%</strong>
              </p>
            </Panel>
            <Card className="p-5">
              <ComparisonBars
                title="Monthly transport comparison"
                items={[
                  { label: 'Fuel only', value: output.monthlyFuelCost, color: '#0f766e' },
                  { label: 'Commute-only cost', value: output.commuteOnlyCost, color: '#1d4e89' },
                  { label: 'True car cost', value: output.trueOwnershipCost, color: '#b45309' },
                  { label: 'Alternative commute', value: Number(inputs.alternativeCommuteMonthly) || 0, color: '#7c3aed' },
                  { label: 'Suggested budget', value: output.transportBudgetTarget, color: '#475569' }
                ]}
                formatter={fmt}
              />
            </Card>
            <Card className="p-5">
              <PieBreakdownChart
                title="Where the car budget goes"
                items={[
                  { label: 'Fuel', value: output.monthlyFuelCost, color: '#0f766e' },
                  { label: 'Tolls + parking', value: (Number(inputs.monthlyTolls) || 0) + (Number(inputs.monthlyParking) || 0), color: '#1d4e89' },
                  { label: 'EMI', value: Number(inputs.carEmi) || 0, color: '#b45309' },
                  { label: 'Maintenance', value: Number(inputs.monthlyMaintenance) || 0, color: '#7c3aed' },
                  { label: 'Insurance', value: output.insuranceMonthly, color: '#14b8a6' },
                  { label: 'Depreciation', value: output.monthlyDepreciation, color: '#f97316' }
                ]}
                formatter={fmt}
              />
            </Card>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>Back to Inputs</Button>
              <Button onClick={() => setStep(3)}>Continue to Action Plan</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-5">
            <DecisionBanner
              tone={output.recommendation.tone}
              label={output.recommendation.label}
              reason={output.recommendation.reason}
              icon={<CheckCircle2 size={18} />}
            />
            <HowToNote
              title="How to use this plan"
              items={[
                'Focus on all-in monthly cost, not just fuel savings.',
                'If the budget is tight, first attack the commute pattern before changing the car itself.',
                'Re-run this when fuel price, office frequency, or EMI changes.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Buffer after car cost" value={fmt(output.postOwnershipBuffer)} />
              <ResultStat label="Buffer with cheaper commute" value={fmt(output.postAlternativeBuffer)} />
              <ResultStat label="One office-day driving cost" value={fmt(output.oneOfficeDayDriveCost)} />
              <ResultStat label="4-day hybrid saving" value={fmt(output.fourDaysHybridSavings)} />
            </div>
            <Card className="p-5">
              <ActionList title="Action checklist" items={output.actionItems} />
            </Card>
            <Panel title="Annual view">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ResultStat label="Annual car cost" value={fmt(output.annualOwnershipCost)} />
                <ResultStat label="Annual alternative cost" value={fmt(output.annualAlternativeCost)} />
                <ResultStat label="Annual saving if you switch" value={fmt(output.annualSavingsWithAlternative)} tone="positive" />
              </div>
            </Panel>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back to Cost View</Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <SearchLandingSections
            intro={(
              <>
                <p>
                  A fuel expense calculator is useful, but it usually understates what a car actually costs each month.
                  The bigger budgeting mistake is ignoring EMI, insurance, maintenance, and depreciation when deciding
                  whether a vehicle is comfortably affordable.
                </p>
                <p>
                  This workflow treats fuel as one part of a wider transport-budget decision. That makes it more useful
                  for monthly planning, offer evaluation, and commute optimization than a fuel-only tool.
                </p>
              </>
            )}
            example={(
              <>
                <p>
                  Suppose you drive a 36 km round trip for 22 office days, your car returns 16 km per litre, and fuel is
                  priced at 105 per litre. That gives a monthly fuel bill of roughly 5,200. Once EMI, parking, tolls,
                  insurance, and depreciation are added, the true transport cost becomes much higher than the fuel number
                  alone.
                </p>
                <p>
                  Stack the default numbers and watch the picture invert. The commute itself — 792 km of driving — costs
                  ₹9,198 a month in fuel, tolls, and parking. But the car costs ₹44,031: add ₹2,500 maintenance, ₹2,333
                  of monthly insurance, ₹12,000 of depreciation on a ₹12 lakh vehicle losing 12% a year, and the ₹18,000
                  EMI. The commute is barely a fifth of the total; the two biggest line items — EMI and depreciation —
                  have nothing to do with how far you drive. Against a safe transport budget of ₹19,200 (16% of a ₹1.2
                  lakh income), this owner is spending 36.7% of in-hand pay on mobility.
                </p>
                <p>
                  The alternative-commute comparison completes the story: at ₹5,500 a month for cabs and metro, the car
                  costs ₹38,531 more every month — about ₹4.6 lakh a year. That number is not an instruction to sell;
                  it is the honest price tag of the convenience, and the per-day view (₹418 per office day of variable
                  cost) shows what each individual drive-vs-metro choice is worth.
                </p>
              </>
            )}
            formula={(
              <>
                <p>
                  Core flow: monthly commute distance = round-trip distance multiplied by office days. Fuel cost =
                  monthly distance divided by fuel efficiency, multiplied by fuel price. True ownership cost = fuel +
                  tolls + parking + maintenance + monthly insurance + monthly depreciation + EMI. The tool then compares
                  this against a safer transport-budget target and an alternative commute benchmark.
                </p>
                <p>
                  The safe budget takes the lower of two limits: a regional share of in-hand income, and whatever room
                  remains after fixed expenses and a safety buffer — so a high earner with heavy rent does not get told a
                  big car is fine just because the percentage works. Depreciation is annualized straight-line on the
                  car&rsquo;s current value; it slightly overstates the loss on an old car and understates it on a new
                  one, but it keeps the model transparent and errs toward caution. Costs that do not vary with driving
                  (EMI, insurance, depreciation) stay in the monthly total but out of the per-day figure, which is why
                  driving less saves less than people hope — and why the biggest savings decisions happen at purchase
                  time, not at the fuel pump.
                </p>
              </>
            )}
            faqItems={seoFaqItems}
            relatedLinks={[
              { label: 'Car Ownership Cost Guide', href: '/guides/car-ownership-cost-guide' },
              { label: 'Loan and EMI calculator', href: '/loan-calculator' },
              { label: 'Job offer decision workflow', href: '/job-offer-workflow' },
              { label: 'Emergency fund readiness workflow', href: '/emergency-fund-readiness-workflow' }
            ]}
            softwareSchema={softwareSchema}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default CarOwnershipCostWorkflow;
