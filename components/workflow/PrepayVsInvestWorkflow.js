import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { ArrowRightLeft, TrendingUp, ShieldCheck, PiggyBank, CheckCircle2 } from 'lucide-react';
import { PieBreakdownChart, ComparisonBars } from '../calculator/ResultVisualizations';
import EEATPanel from '../calculator/EEATPanel';
import SearchLandingSections from '../calculator/SearchLandingSections';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import { NumberField, SelectField } from '../ui/Field';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { WorkflowSteps, HowToNote, DecisionBanner, ActionList } from '../workflow/WorkflowKit';
import { buildBreadcrumbSchema } from '../../utils/schema';
import { editorialProfiles } from '../../utils/editorialProfiles';

const { markets, formatCurrencyFor } = require('../../utils/markets');
const { comparePrepayVsInvest, prepayVsInvestVerdict } = require('../../utils/engines/prepayVsInvest');

const riskHaircut = {
  conservative: 2,
  balanced: 1,
  aggressive: 0
};

const getRegionDefaults = (regionKey) => {
  const defaults = markets[regionKey]?.prepayVsInvestDefaults;
  return {
    outstandingLoan: defaults?.outstandingLoan ?? 0,
    annualLoanRate: defaults?.annualLoanRate ?? 0,
    remainingYears: defaults?.remainingYears ?? 0,
    monthlySurplus: defaults?.monthlySurplus ?? 0,
    expectedReturn: defaults?.expectedReturn ?? 0
  };
};

const recommendationCopy = {
  'prepay-first': {
    label: 'Prepay first, then invest',
    tone: 'positive',
    reason: 'Your debt cost is high relative to expected risk-adjusted return. Reducing guaranteed interest drag is stronger.'
  },
  'invest-first': {
    label: 'Invest surplus first',
    tone: 'info',
    reason: 'Expected risk-adjusted portfolio growth is stronger than loan-cost savings in this setup.'
  },
  hybrid: {
    label: 'Use a hybrid split',
    tone: 'warning',
    reason: 'Both options are close. Split surplus between loan prepayment and disciplined investing to balance certainty and growth.'
  }
};

const recommendationFor = (verdictInputs) => recommendationCopy[prepayVsInvestVerdict(verdictInputs).code];

const PrepayVsInvestWorkflow = () => {
  const [step, setStep] = useState(1);
  const baseRegion = 'india';
  const [inputs, setInputs] = useState({
    region: baseRegion,
    ...getRegionDefaults(baseRegion),
    riskProfile: 'balanced'
  });

  const regionConfig = markets[inputs.region];
  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));
  const fmt = formatCurrencyFor(regionConfig);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Prepay Loan vs Invest Workflow', item: 'https://upaman.com/prepay-vs-invest-workflow' }
  ]);
  const faqItems = [
    {
      question: 'When does prepayment usually look stronger?',
      answer: 'Prepayment tends to look stronger when the loan rate is high relative to the risk-adjusted return you can reasonably expect from investing.'
    },
    {
      question: 'Why use risk-adjusted return instead of headline return?',
      answer: 'Headline return can be optimistic. A haircut makes the comparison against guaranteed interest savings more realistic.'
    },
    {
      question: 'Is a hybrid split a valid choice?',
      answer: 'Yes. When the outputs are close, splitting surplus between prepayment and investing can reduce regret and balance certainty with growth.'
    },
    {
      question: 'Does the prepay path account for investing after the loan closes?',
      answer: 'Yes — this is the detail most back-of-envelope comparisons miss. Once prepayment closes the loan early, the model redirects the entire freed-up EMI plus your surplus into investments for every remaining month of the original horizon. In the default scenario that is 103 months of heavy investing, which is why the prepay path’s final corpus is competitive even though it starts investing later.'
    },
    {
      question: 'What about prepayment penalties and tax benefits on the loan?',
      answer: 'The model excludes both, and they pull in opposite directions. Floating-rate home loans in India generally carry no prepayment penalty for individuals, but confirm your loan agreement. Home-loan tax deductions reduce the effective loan cost for some borrowers, which weakens the prepay case slightly — if you claim them, mentally lower the loan rate you enter by your marginal-tax slice of the benefit.'
    },
    {
      question: 'Should the emergency fund come before either option?',
      answer: 'Yes, unambiguously. Prepaid principal cannot be un-prepaid in a crisis, and investments sold in an emergency may be down exactly when you need them. Both paths in this workflow assume the surplus is genuinely spare — run the emergency fund workflow first if that assumption is shaky.'
    }
  ];

  const output = useMemo(() => {
    const outstandingLoan = Number(inputs.outstandingLoan) || 0;
    const annualLoanRate = Number(inputs.annualLoanRate) || 0;
    const remainingMonths = Math.max(1, Math.round((Number(inputs.remainingYears) || 0) * 12));
    const monthlySurplus = Math.max(0, Number(inputs.monthlySurplus) || 0);
    const expectedReturn = Math.max(0, Number(inputs.expectedReturn) || 0);
    const adjustedReturn = Math.max(0, expectedReturn - riskHaircut[inputs.riskProfile]);

    const comparison = comparePrepayVsInvest({
      outstandingLoan,
      annualLoanRate,
      remainingMonths,
      monthlySurplus,
      adjustedReturn
    });

    const recommendation = recommendationFor({
      prepayCorpus: comparison.prepayThenInvestCorpus,
      investCorpus: comparison.investOnlyCorpus,
      loanRate: annualLoanRate,
      adjustedReturn
    });

    return {
      outstandingLoan,
      annualLoanRate,
      remainingMonths,
      monthlySurplus,
      expectedReturn,
      adjustedReturn,
      ...comparison,
      recommendation
    };
  }, [inputs]);

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Decision workflow"
        title="Prepay Loan vs Invest Surplus Workflow"
        subtitle="Compare debt prepayment versus investing your monthly surplus with a risk-adjusted view."
      >
        <EEATPanel
          author={editorialProfiles.researchTeam}
          reviewer={editorialProfiles.financeReviewDesk}
          reviewedOn="June 28, 2026"
          scope="This workflow compares guaranteed interest savings from loan prepayment with a risk-adjusted investment path using the same time horizon."
          sources={[
            { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
            { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/' }
          ]}
        />

        <div className="mt-6">
          <WorkflowSteps steps={['Inputs', 'Comparison', 'Action Plan']} active={step} onChange={setStep} />
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              title="How to fill this quickly"
              items={[
                'Use the current outstanding principal from your latest loan statement.',
                'Use realistic return expectations, not best-case returns.',
                'Enter only repeatable monthly surplus, not one-time windfalls.'
              ]}
            />
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  id="pi-region"
                  label="Region"
                  value={inputs.region}
                  onChange={(v) => setInputs((prev) => ({ ...prev, region: v, ...getRegionDefaults(v) }))}
                  options={Object.entries(markets).map(([value, market]) => ({ value, label: market.label }))}
                />
                <NumberField
                  id="pi-loan"
                  label={`Outstanding Loan (${regionConfig.currency})`}
                  value={inputs.outstandingLoan}
                  onChange={(v) => set('outstandingLoan', v)}
                  hint="Use current principal, not the original sanction amount."
                />
                <NumberField
                  id="pi-rate"
                  label="Loan Interest Rate"
                  suffix="%/yr"
                  step={0.1}
                  value={inputs.annualLoanRate}
                  onChange={(v) => set('annualLoanRate', v)}
                  hint="Use the effective current rate after any reset."
                />
                <NumberField
                  id="pi-years"
                  label="Remaining Tenure"
                  suffix="yrs"
                  step={0.1}
                  min={0.5}
                  value={inputs.remainingYears}
                  onChange={(v) => set('remainingYears', v)}
                  hint="Remaining duration on the current loan, not original tenure."
                />
                <NumberField
                  id="pi-surplus"
                  label={`Monthly Surplus (${regionConfig.currency})`}
                  value={inputs.monthlySurplus}
                  onChange={(v) => set('monthlySurplus', v)}
                  hint="Enter an amount you can sustain every month comfortably."
                />
                <NumberField
                  id="pi-return"
                  label="Expected Return"
                  suffix="%/yr"
                  step={0.1}
                  value={inputs.expectedReturn}
                  onChange={(v) => set('expectedReturn', v)}
                  hint="Use a long-term conservative expectation, not a peak return."
                />
                <SelectField
                  id="pi-risk"
                  label="Risk Profile"
                  value={inputs.riskProfile}
                  onChange={(v) => set('riskProfile', v)}
                  options={[
                    { value: 'conservative', label: 'Conservative (higher return haircut)' },
                    { value: 'balanced', label: 'Balanced' },
                    { value: 'aggressive', label: 'Aggressive' }
                  ]}
                />
              </div>
            </Card>
            <Button onClick={() => setStep(2)}>Continue to Comparison</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              title="How to read this step"
              items={[
                '"Interest saved" and "months saved" show the certainty benefit of prepayment.',
                '"Corpus at baseline horizon" compares the wealth outcome at the same time point.',
                'If values are close, prefer a hybrid split over an all-or-nothing choice.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Current baseline EMI" value={fmt(output.baselineEmi)} />
              <ResultStat label="Interest saved with prepayment" value={fmt(output.interestSaved)} emphasis tone="positive" />
              <ResultStat label="Loan closes earlier by" value={`${output.monthsSaved} months`} />
              <ResultStat label="Risk-adjusted return used" value={`${output.adjustedReturn.toFixed(1)}%`} />
            </div>
            <Card className="p-5">
              <ComparisonBars
                title="Corpus at baseline horizon"
                items={[
                  { label: 'Invest surplus monthly', value: output.investOnlyCorpus, color: '#1d4ed8' },
                  { label: 'Prepay then invest post-closure', value: output.prepayThenInvestCorpus, color: '#059669' }
                ]}
                formatter={fmt}
              />
            </Card>
            <Card className="p-5">
              <PieBreakdownChart
                title="Invest option: contributions vs gains"
                items={[
                  { label: 'Total contributions', value: output.monthlySurplus * output.remainingMonths, color: '#3b82f6' },
                  {
                    label: 'Projected gains',
                    value: Math.max(0, output.investOnlyCorpus - output.monthlySurplus * output.remainingMonths),
                    color: '#10b981'
                  }
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
              title="How to use this recommendation"
              items={[
                output.corpusDelta >= 0
                  ? 'Prepay-first route has the higher projected corpus under current assumptions.'
                  : 'Invest-first route has the higher projected corpus under current assumptions.',
                'Re-run this workflow when rates, income, or risk profile changes.',
                'Do not allocate full surplus until your emergency runway is secure.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Invest option corpus" value={fmt(output.investOnlyCorpus)} />
              <ResultStat label="Prepay-first corpus" value={fmt(output.prepayThenInvestCorpus)} />
              <ResultStat label="Corpus difference" value={fmt(output.corpusDelta)} />
              <ResultStat label="Post-closure investing window" value={`${output.postCloseMonths} months`} />
            </div>
            <Card className="p-5">
              <ActionList
                title="Action checklist"
                items={[
                  'Keep your emergency fund intact before aggressive prepayment or equity-heavy investing.',
                  'Review this decision at every rate reset or yearly portfolio expectation change.',
                  'If unsure, split surplus (for example 60:40) between prepayment and investing.'
                ]}
              />
            </Card>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back to Comparison</Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <SearchLandingSections
            intro={(
              <>
                <p>
                  The better choice for monthly surplus depends on what that surplus can do with certainty versus what it
                  might do with risk. Prepayment reduces guaranteed interest drag. Investing can build more wealth, but only
                  if realistic returns beat loan cost over time.
                </p>
                <p>
                  This workflow compares both paths on the same horizon so you can see months saved, interest saved, and
                  corpus difference before deciding.
                </p>
              </>
            )}
            example={(
              <>
                <p>
                  If your loan costs 8.5% and your realistic risk-adjusted investing return is closer to 9% than 12%, the
                  case for investing may be weaker than headline market-return assumptions suggest. That is why the decision
                  should be modeled, not guessed.
                </p>
                <p>
                  The default scenario makes this concrete. A ₹35 lakh loan at 8.5% with 15 years left carries an EMI of
                  ₹34,466 and, left alone, ₹27,03,859 of remaining interest. Routing the ₹25,000 monthly surplus into
                  prepayment cuts that interest to ₹10,44,486 — a guaranteed saving of ₹16,59,373 — and closes the loan
                  103 months early, after which the freed-up EMI and surplus invest for the remaining years. Investing
                  the surplus instead, at 10% risk-adjusted, builds ₹1,03,61,759 against the prepay path&rsquo;s
                  ₹96,39,534.
                </p>
                <p>
                  So investing &ldquo;wins&rdquo; by about ₹7.2 lakh — roughly 7% of the final corpus — but only if the
                  10% return actually materializes for fifteen straight years, while the prepayment savings are
                  contractual. That is exactly the kind of margin the verdict logic calls a hybrid: close enough that
                  certainty, sleep, and your honest risk tolerance should carry real weight. Switch the risk profile to
                  conservative and the paper gap shrinks to ₹2.7 lakh — near enough to a coin toss that splitting the
                  surplus is a defensible answer, not a compromise.
                </p>
              </>
            )}
            formula={(
              <>
                <p>
                  Core flow: simulate baseline loan interest, simulate a surplus-prepayment path, estimate months shortened and
                  interest saved, then compare that result with monthly investing using a risk-adjusted return over the same
                  horizon.
                </p>
                <p>
                  The critical design choice is that both paths are compared over the <em>same total horizon</em>. The
                  prepay path is not penalized for &ldquo;missing out&rdquo; on investing forever — once the loan closes
                  early, the model immediately redirects the full EMI plus surplus into investments for all the months
                  the baseline loan would still be running. The risk haircut (up to 2 percentage points off your expected
                  return, by risk profile) exists because a guaranteed 8.5% saving and a hoped-for 11% return are not the
                  same kind of number; trimming the optimistic one before comparing is what makes the verdict honest.
                </p>
              </>
            )}
            faqItems={faqItems}
            relatedLinks={[
              { label: 'Prepay vs Invest Decision Guide', href: '/guides/prepay-vs-invest-decision' },
              { label: 'Emergency Fund Readiness Workflow', href: '/emergency-fund-readiness-workflow' },
              { label: 'How Much EMI Is Safe Guide', href: '/guides/how-much-emi-is-safe' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default PrepayVsInvestWorkflow;
