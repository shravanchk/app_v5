import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Home, Wallet, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import EEATPanel from '../calculator/EEATPanel';
import SearchLandingSections from '../calculator/SearchLandingSections';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import { NumberField, SelectField } from '../ui/Field';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { WorkflowSteps, HowToNote, DecisionBanner, Panel, PanelRow } from '../workflow/WorkflowKit';
import { buildBreadcrumbSchema } from '../../utils/schema';
import { editorialProfiles } from '../../utils/editorialProfiles';

const regionSettings = {
  india: {
    label: 'India',
    locale: 'en-IN',
    currency: 'INR',
    defaultInterestRate: 8.5,
    defaultTenureYears: 20,
    housingOverheadRate: 0.05,
    fiorAdjustment: 0,
    almostReadyGapMonthly: 7000,
    minPostPaymentBuffer: 10000,
    monthlyIncomeLabel: 'Monthly In-hand Income',
    monthlyExpensesLabel: 'Monthly Fixed Expenses',
    existingDebtLabel: 'Existing EMI Commitments',
    downPaymentLabel: 'Available Down Payment',
    propertyCostLabel: 'Target Property Cost',
    assumptions: 'Includes an estimated 5% housing overhead for taxes, maintenance, and ownership costs.',
    defaults: {
      monthlyInHand: 100000,
      monthlyFixedExpenses: 40000,
      existingEMI: 7000,
      downPayment: 1500000,
      targetPropertyCost: 7000000
    }
  },
  us: {
    label: 'United States',
    locale: 'en-US',
    currency: 'USD',
    defaultInterestRate: 6.7,
    defaultTenureYears: 30,
    housingOverheadRate: 0.25,
    fiorAdjustment: -0.02,
    almostReadyGapMonthly: 450,
    minPostPaymentBuffer: 700,
    monthlyIncomeLabel: 'Monthly Net Income',
    monthlyExpensesLabel: 'Monthly Fixed Expenses',
    existingDebtLabel: 'Existing Monthly Debt Payments',
    downPaymentLabel: 'Available Down Payment',
    propertyCostLabel: 'Target Home Price',
    assumptions: 'Includes an estimated 25% overhead for taxes, insurance, HOA, and ownership costs.',
    defaults: {
      monthlyInHand: 7500,
      monthlyFixedExpenses: 3200,
      existingEMI: 600,
      downPayment: 80000,
      targetPropertyCost: 450000
    }
  },
  eu: {
    label: 'EU/UK (Generic)',
    locale: 'en-IE',
    currency: 'EUR',
    defaultInterestRate: 4.6,
    defaultTenureYears: 25,
    housingOverheadRate: 0.17,
    fiorAdjustment: -0.01,
    almostReadyGapMonthly: 380,
    minPostPaymentBuffer: 600,
    monthlyIncomeLabel: 'Monthly Net Income',
    monthlyExpensesLabel: 'Monthly Fixed Expenses',
    existingDebtLabel: 'Existing Monthly Debt Payments',
    downPaymentLabel: 'Available Down Payment',
    propertyCostLabel: 'Target Property Cost',
    assumptions: 'Includes an estimated 17% overhead for taxes, service charges, insurance, and ownership costs.',
    defaults: {
      monthlyInHand: 5200,
      monthlyFixedExpenses: 2200,
      existingEMI: 400,
      downPayment: 60000,
      targetPropertyCost: 350000
    }
  }
};

const getRegionDefaults = (regionKey) => {
  const defaults = regionSettings[regionKey]?.defaults;
  return {
    monthlyInHand: defaults?.monthlyInHand ?? 0,
    monthlyFixedExpenses: defaults?.monthlyFixedExpenses ?? 0,
    existingEMI: defaults?.existingEMI ?? 0,
    downPayment: defaults?.downPayment ?? 0,
    targetPropertyCost: defaults?.targetPropertyCost ?? 0
  };
};

const riskProfiles = {
  conservative: { label: 'Conservative', fiorCap: 0.35, buffer: 0.3 },
  balanced: { label: 'Balanced', fiorCap: 0.4, buffer: 0.2 },
  aggressive: { label: 'Aggressive', fiorCap: 0.45, buffer: 0.1 }
};

const round = (value) => Math.round(value);

const formatCurrency = (amount, regionConfig) =>
  new Intl.NumberFormat(regionConfig.locale, {
    style: 'currency',
    currency: regionConfig.currency,
    maximumFractionDigits: 0
  }).format(amount);

const emiForLoan = (principal, annualRate, tenureMonths) => {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const multiplier = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * multiplier) / (multiplier - 1);
};

const loanFromEmi = (emi, annualRate, tenureMonths) => {
  if (emi <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const multiplier = Math.pow(1 + monthlyRate, tenureMonths);
  return (emi * (multiplier - 1)) / (monthlyRate * multiplier);
};

const HomeLoanReadinessWorkflow = () => {
  const [step, setStep] = useState(1);
  const baseRegion = 'india';
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion),
    annualInterestRate: 8.5,
    tenureYears: 20,
    riskProfile: 'balanced'
  });

  const regionConfig = regionSettings[inputs.region];
  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));
  const fmt = (value) => formatCurrency(value, regionConfig);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Home Loan Readiness Workflow', item: 'https://upaman.com/home-loan-readiness-workflow' }
  ]);
  const faqItems = [
    {
      question: 'Is lender approval the same as safe affordability?',
      answer: 'No. A lender can approve a higher amount than what feels safe in your monthly budget. This workflow focuses on practical affordability.'
    },
    {
      question: 'Why does the workflow include ownership overhead?',
      answer: 'Property costs do not end at EMI. Taxes, insurance, maintenance, and related charges change the true monthly burden.'
    },
    {
      question: 'Why does tenure sensitivity matter?',
      answer: 'A longer tenure can reduce EMI pressure but usually increases total interest. You need both the monthly view and the cost-over-time view.'
    },
    {
      question: 'The bank offered me a bigger loan than this workflow says is safe. Who is right?',
      answer: 'You are asking different questions. The lender assesses whether you can repay them — often approving housing ratios well above what leaves a household comfortable. This workflow assesses whether you can repay them and still absorb a car repair, a fee hike, and a bad month, which is why its caps are deliberately tighter. When the two disagree, the disagreement itself is the information.'
    },
    {
      question: 'What should I do with an “almost ready” verdict?',
      answer: 'Treat it as a shopping-phase answer, not a rejection. The gap shown is monthly and specific: a somewhat larger down payment, a slightly cheaper property, or a modest tenure extension each close it. Run the tenure table and the down-payment number before assuming you need a higher income — most near-misses are solved on the property side, not the salary side.'
    },
    {
      question: 'Why does the safe EMI get reduced by an overhead percentage?',
      answer: 'Because the EMI is not the cost of owning — it is the cost of borrowing. Maintenance, property tax, society or HOA charges, and insurance land on the same monthly budget, so the workflow reserves a region-appropriate slice of your housing capacity for them before sizing the loan. Skipping this step is how buyers end up house-poor on paper-affordable EMIs.'
    }
  ];

  const output = useMemo(() => {
    const inHand = Number(inputs.monthlyInHand) || 0;
    const fixed = Number(inputs.monthlyFixedExpenses) || 0;
    const existingEmi = Number(inputs.existingEMI) || 0;
    const downPayment = Number(inputs.downPayment) || 0;
    const targetPropertyCost = Number(inputs.targetPropertyCost) || 0;
    const annualInterestRate = Number(inputs.annualInterestRate) || 0;
    const tenureMonths = (Number(inputs.tenureYears) || 0) * 12;
    const profile = riskProfiles[inputs.riskProfile];
    const effectiveFiorCap = Math.max(0.25, profile.fiorCap + regionConfig.fiorAdjustment);
    const housingOverheadRate = regionConfig.housingOverheadRate;

    const disposableBeforeLoan = Math.max(0, inHand - fixed - existingEmi);
    const emiByFior = Math.max(0, inHand * effectiveFiorCap - existingEmi);
    const emiByBuffer = Math.max(0, disposableBeforeLoan * (1 - profile.buffer));
    const safeHousingBudget = round(Math.min(emiByFior, emiByBuffer));
    const safeNewEmi = round(safeHousingBudget / (1 + housingOverheadRate));

    const maxAffordableLoan = round(loanFromEmi(safeNewEmi, annualInterestRate, tenureMonths));
    const maxPropertyBudget = maxAffordableLoan + downPayment;

    const neededLoan = Math.max(0, targetPropertyCost - downPayment);
    const requiredEmi = round(emiForLoan(neededLoan, annualInterestRate, tenureMonths));
    const requiredHousingPayment = round(requiredEmi * (1 + housingOverheadRate));

    const monthlyStress = round(inHand - fixed - existingEmi - requiredHousingPayment);
    const emiGap = Math.max(0, requiredHousingPayment - safeHousingBudget);
    const loanGap = Math.max(0, neededLoan - maxAffordableLoan);
    const extraDownPaymentNeeded = loanGap;
    const almostReadyGapMonthly = regionConfig.almostReadyGapMonthly;
    const minPostPaymentBuffer = regionConfig.minPostPaymentBuffer;

    const readiness =
      loanGap <= 0 && monthlyStress >= minPostPaymentBuffer
        ? {
            label: 'Ready to proceed',
            tone: 'positive',
            reason: 'Your current budget supports the target property at the selected tenure.'
          }
        : emiGap <= almostReadyGapMonthly && monthlyStress >= 0
          ? {
              label: 'Almost ready',
              tone: 'warning',
              reason: 'You are close. Slightly higher down payment or lower property budget will make this comfortable.'
            }
          : {
              label: 'Not ready yet',
              tone: 'danger',
              reason: 'Current affordability is below the required EMI. Improve savings or reduce target budget.'
            };

    const tenureScenarios = [15, 20, 25, 30].map((years) => ({
      years,
      affordableLoan: round(loanFromEmi(safeNewEmi, annualInterestRate, years * 12)),
      requiredEmi: round(emiForLoan(neededLoan, annualInterestRate, years * 12)),
      requiredHousingPayment: round(emiForLoan(neededLoan, annualInterestRate, years * 12) * (1 + housingOverheadRate))
    }));

    return {
      profile,
      effectiveFiorCap,
      housingOverheadRate,
      safeHousingBudget,
      safeNewEmi,
      maxAffordableLoan,
      maxPropertyBudget,
      neededLoan,
      requiredEmi,
      requiredHousingPayment,
      monthlyStress,
      emiGap,
      loanGap,
      extraDownPaymentNeeded,
      readiness,
      tenureScenarios
    };
  }, [inputs, regionConfig]);

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Decision workflow"
        title="Home Loan Readiness Workflow"
        subtitle="Validate affordability before you commit to a property budget — across India, US, and EU/UK assumptions."
      >
        <EEATPanel
          author={editorialProfiles.researchTeam}
          reviewer={editorialProfiles.financeReviewDesk}
          reviewedOn="June 28, 2026"
          scope="This workflow estimates a safe home-loan budget using in-hand income, fixed obligations, tenure assumptions, and a buffer-aware affordability model."
          sources={[
            { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
            { label: 'National Housing Bank', url: 'https://nhb.org.in/' },
            { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/owning-a-home/' }
          ]}
        />

        <div className="mt-6">
          <WorkflowSteps steps={['Inputs', 'Affordability', 'Action Plan']} active={step} onChange={setStep} />
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              items={[
                'Enter only reliable monthly net income and essential fixed costs.',
                'Use realistic interest rate and tenure from lender terms.',
                'This step checks affordability, not loan approval guarantee.'
              ]}
            />
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  id="hl-region"
                  label="Region"
                  value={inputs.region}
                  onChange={(v) => {
                    const defaults = regionSettings[v];
                    setInputs((prev) => ({
                      ...prev,
                      region: v,
                      ...getRegionDefaults(v),
                      annualInterestRate: defaults.defaultInterestRate,
                      tenureYears: defaults.defaultTenureYears
                    }));
                  }}
                  options={[
                    { value: 'india', label: 'India' },
                    { value: 'us', label: 'United States' },
                    { value: 'eu', label: 'EU/UK (Generic)' }
                  ]}
                />
                <NumberField
                  id="hl-income"
                  label={`${regionConfig.monthlyIncomeLabel} (${regionConfig.currency})`}
                  value={inputs.monthlyInHand}
                  onChange={(v) => set('monthlyInHand', v)}
                  hint="Use after-tax monthly income, not gross salary."
                />
                <NumberField
                  id="hl-expenses"
                  label={`${regionConfig.monthlyExpensesLabel} (${regionConfig.currency})`}
                  value={inputs.monthlyFixedExpenses}
                  onChange={(v) => set('monthlyFixedExpenses', v)}
                  hint="Include only unavoidable expenses and subscriptions."
                />
                <NumberField
                  id="hl-debt"
                  label={`${regionConfig.existingDebtLabel} (${regionConfig.currency})`}
                  value={inputs.existingEMI}
                  onChange={(v) => set('existingEMI', v)}
                  hint="Existing EMIs reduce your safe room for a new housing payment."
                />
                <NumberField
                  id="hl-down"
                  label={`${regionConfig.downPaymentLabel} (${regionConfig.currency})`}
                  value={inputs.downPayment}
                  onChange={(v) => set('downPayment', v)}
                  hint="A higher down payment lowers the required loan size."
                />
                <NumberField
                  id="hl-property"
                  label={`${regionConfig.propertyCostLabel} (${regionConfig.currency})`}
                  value={inputs.targetPropertyCost}
                  onChange={(v) => set('targetPropertyCost', v)}
                  hint="Used to test whether your target property fits a safe budget."
                />
                <NumberField
                  id="hl-rate"
                  label="Interest Rate"
                  suffix="%/yr"
                  step={0.1}
                  value={inputs.annualInterestRate}
                  onChange={(v) => set('annualInterestRate', v)}
                  hint="Current effective borrowing rate expected for your loan."
                />
                <NumberField
                  id="hl-tenure"
                  label="Loan Tenure"
                  suffix="yrs"
                  min={1}
                  value={inputs.tenureYears}
                  onChange={(v) => set('tenureYears', v)}
                  hint="Longer tenure lowers EMI but increases total interest paid."
                />
                <SelectField
                  id="hl-risk"
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
                Model assumptions: {regionConfig.assumptions}
              </p>
            </Card>
            <Button onClick={() => setStep(2)}>Continue to Affordability</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              title="How to read this step"
              items={[
                'Safe EMI and housing budget represent a conservative comfort zone.',
                'Compare required housing payment vs safe budget to see stress risk.',
                'Use this before committing to a down payment or booking amount.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ResultStat label="Safe new EMI" value={fmt(output.safeNewEmi)} emphasis tone="positive" />
              <ResultStat label="Safe total housing budget" value={fmt(output.safeHousingBudget)} />
              <ResultStat label="Max affordable loan" value={fmt(output.maxAffordableLoan)} />
              <ResultStat label="Max property budget (incl. down payment)" value={fmt(output.maxPropertyBudget)} />
              <ResultStat label="Required EMI for target" value={fmt(output.requiredEmi)} />
              <ResultStat label="Required total housing payment" value={fmt(output.requiredHousingPayment)} />
            </div>
            <Panel>
              <p className="text-sm text-ink-soft dark:text-slate-300">
                Monthly balance after required housing payment:{' '}
                <strong className="font-semibold text-ink dark:text-white">{fmt(output.monthlyStress)}</strong>
              </p>
              <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
                Effective FIOR cap used: {(output.effectiveFiorCap * 100).toFixed(0)}% · Estimated overhead:{' '}
                {(output.housingOverheadRate * 100).toFixed(0)}%
              </p>
            </Panel>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>Back to Inputs</Button>
              <Button onClick={() => setStep(3)}>Continue to Action Plan</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-5">
            <DecisionBanner
              tone={output.readiness.tone}
              label={output.readiness.label}
              reason={output.readiness.reason}
              icon={<CheckCircle2 size={18} />}
            />
            <HowToNote
              title="How to use this plan"
              items={[
                'If labeled "Almost ready", close the smallest gap first (EMI or down payment).',
                'Check the tenure sensitivity cards before final tenure selection.',
                'Re-run with a lender-confirmed rate before final agreement.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Required loan" value={fmt(output.neededLoan)} />
              <ResultStat label="Loan affordability gap" value={fmt(output.loanGap)} />
              <ResultStat label="Housing payment gap" value={fmt(output.emiGap)} />
              <ResultStat label="Extra down payment needed" value={fmt(output.extraDownPaymentNeeded)} />
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
                <Home size={18} /> Tenure sensitivity
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {output.tenureScenarios.map((scenario) => (
                  <Panel key={scenario.years} title={`${scenario.years}-year tenure`}>
                    <div className="space-y-1">
                      <PanelRow label="Affordable loan" value={fmt(scenario.affordableLoan)} />
                      <PanelRow label="Required EMI" value={fmt(scenario.requiredEmi)} />
                      <PanelRow label="Total housing payment" value={fmt(scenario.requiredHousingPayment)} />
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back to Affordability</Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <SearchLandingSections
            intro={(
              <>
                <p>
                  A safe EMI is not the highest EMI a lender will approve. It is the EMI your household can carry while
                  still protecting fixed expenses, upkeep costs, and a post-payment cash buffer.
                </p>
                <p>
                  This workflow turns that idea into a practical readiness check by comparing your target property budget
                  against a buffer-aware monthly affordability model.
                </p>
              </>
            )}
            example={(
              <>
                <p>
                  If your in-hand income is strong but fixed commitments are already high, the workflow may still show that
                  the target property is not comfortably affordable. In that case the issue is not income alone, but the
                  remaining room after existing obligations and ownership overhead.
                </p>
                <p>
                  The India defaults are a deliberately realistic near-miss. On ₹1,00,000 monthly in-hand with ₹40,000 of
                  fixed expenses and a ₹7,000 existing EMI, the balanced profile caps safe housing spend at ₹33,000 a
                  month — the 40% income ratio binds before the buffer rule does. After setting aside the 5% ownership
                  overhead, that funds a safe EMI of about ₹31,429, which at 8.5% over 20 years services a ₹36.2 lakh
                  loan. Add the ₹15 lakh down payment and the comfortable property budget is roughly ₹51 lakh — but the
                  target is ₹70 lakh. That property needs a ₹55 lakh loan with a ₹47,730 EMI, leaving ₹2,883 a month
                  after everything. The verdict: not ready yet, short by about ₹18.8 lakh of loan headroom.
                </p>
                <p>
                  What makes the workflow useful is that the gap is specific. ₹18.8 lakh more down payment closes it; so
                  does a target closer to ₹51 lakh; the tenure table shows how much (and how little) stretching to 25 or
                  30 years buys. A lender, checking income ratios alone, might well approve this loan — which is
                  precisely the difference between approval and affordability this page exists to show.
                </p>
              </>
            )}
            formula={(
              <>
                <p>
                  Core flow: estimate disposable income after fixed expenses and existing debt, cap housing exposure using
                  a profile-based affordability ratio, adjust for ownership overhead, then compare that safe payment against
                  the payment required for the selected property, rate, and tenure.
                </p>
                <p>
                  Two guardrails run in parallel and the stricter one wins: a cap on housing payments as a share of income
                  (35–45% depending on risk profile), and a rule that preserves a slice of your current disposable income
                  as breathing room (10–30%, again by profile). The ownership overhead is added on top of the EMI because
                  maintenance, property tax, and insurance arrive whether or not the spreadsheet included them. The
                  readiness verdict then requires both conditions — the loan fits within safe capacity <em>and</em> the
                  month-end leftover clears a minimum buffer — before it says proceed; &ldquo;almost ready&rdquo; means
                  the monthly gap is small enough that a modest down-payment increase or price adjustment closes it.
                </p>
              </>
            )}
            faqItems={faqItems}
            relatedLinks={[
              { label: 'How Much EMI Is Safe Guide', href: '/guides/how-much-emi-is-safe' },
              { label: 'Loan and EMI Calculator', href: '/loan-calculator' },
              { label: 'Rent vs Buy Decision Workflow', href: '/rent-vs-buy-workflow' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default HomeLoanReadinessWorkflow;
