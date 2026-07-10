import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CheckCircle2 } from 'lucide-react';
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

const usDefaults = markets.us.prepayVsInvestDefaults;

const recommendationCopy = {
  'prepay-first': {
    label: 'Pay down the mortgage first',
    tone: 'positive',
    reason: 'Your mortgage rate is high relative to the risk-adjusted return you expect. The guaranteed interest savings win.'
  },
  'invest-first': {
    label: 'Invest the extra money first',
    tone: 'info',
    reason: 'Expected risk-adjusted portfolio growth outpaces the interest your mortgage costs in this setup.'
  },
  hybrid: {
    label: 'Split between both',
    tone: 'warning',
    reason: 'The two paths land close together. Splitting the extra payment balances guaranteed savings with market growth.'
  }
};

const UsMortgagePayoffVsInvestWorkflow = () => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    outstandingLoan: usDefaults.outstandingLoan,
    annualLoanRate: usDefaults.annualLoanRate,
    remainingYears: usDefaults.remainingYears,
    monthlySurplus: usDefaults.monthlySurplus,
    expectedReturn: usDefaults.expectedReturn,
    riskProfile: 'balanced'
  });

  const regionConfig = markets.us;
  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));
  const fmt = formatCurrencyFor(regionConfig);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'US Calculators', item: 'https://upaman.com/us-calculators' },
    { name: 'Mortgage Payoff vs Invest Workflow', item: 'https://upaman.com/us-mortgage-payoff-vs-invest-workflow' }
  ]);

  const faqItems = [
    {
      question: 'Should I get my 401(k) match before paying extra on the mortgage?',
      answer: 'Yes, and it is not close. An employer match is an immediate return on contribution that neither mortgage prepayment nor ordinary investing can approach. This workflow assumes the money you enter is surplus after capturing any available match — if you are skipping match dollars to prepay a mortgage, redirect them first.'
    },
    {
      question: 'Does the mortgage interest deduction change this decision?',
      answer: 'Only if you itemize, and most filers take the standard deduction instead, which makes their effective mortgage rate exactly the stated rate. If you do itemize, the deduction refunds part of each interest dollar, lowering the effective cost of keeping the mortgage — mentally shave your marginal-rate slice off the loan rate you enter. Prepaying also shrinks future deductions, which softens its benefit for itemizers.'
    },
    {
      question: 'Will extra principal payments lower my monthly payment?',
      answer: 'No — on a standard US mortgage, extra principal shortens the term but leaves the required payment unchanged. If a lower payment is the goal, ask your servicer about a recast: after a lump-sum principal reduction, the loan is re-amortized over the remaining term for a fee, keeping your rate. This workflow models the term-shortening route, which is what maximizes interest saved.'
    },
    {
      question: 'Do US mortgages have prepayment penalties?',
      answer: 'Most do not — penalties on standard conforming mortgages are heavily restricted, and where they exist at all they are typically limited to the first few years of the loan. Check your note or ask your servicer once; after that, every extra dollar goes straight to principal. Make sure payments are flagged as principal-only so they are not applied as an early next-month payment.'
    },
    {
      question: 'Why does the verdict change when I switch risk profiles?',
      answer: 'Because the comparison is genuinely close at typical mortgage rates. With the default inputs, a balanced profile (7% risk-adjusted) shows the invest path ahead by about $11,000 over 20 years, an aggressive profile (8%) widens that to roughly $36,000, and a conservative profile (6%) actually puts the prepay path ahead. The mortgage rate is the fixed pole; your honest return expectation decides which side of it you land on.'
    },
    {
      question: 'Where does an emergency fund fit into this?',
      answer: 'Before both options. Extra principal is the least reversible move in personal finance — the money becomes home equity you can only retrieve by borrowing or selling — and investments sold during an emergency may be down when you need them. Fund your emergency runway first; this workflow assumes the monthly amount you enter survives a bad month.'
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

    const recommendation = recommendationCopy[
      prepayVsInvestVerdict({
        prepayCorpus: comparison.prepayThenInvestCorpus,
        investCorpus: comparison.investOnlyCorpus,
        loanRate: annualLoanRate,
        adjustedReturn
      }).code
    ];

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
        title="Pay Off Mortgage Early vs Invest Workflow"
        subtitle="Compare extra mortgage principal payments against investing the same money, on the same timeline, with a risk-adjusted view."
      >
        <EEATPanel
          author={editorialProfiles.researchTeam}
          reviewer={editorialProfiles.financeReviewDesk}
          reviewedOn="July 10, 2026"
          scope="This workflow compares guaranteed interest savings from extra mortgage principal payments with a risk-adjusted investment path over the same horizon. It models principal-only extra payments on a fixed-rate amortizing mortgage; taxes and employer-match effects are discussed but not computed."
          sources={[
            { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/' },
            { label: 'Investor.gov (SEC)', url: 'https://www.investor.gov/' }
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
                'Use the current principal balance from your mortgage statement, not the original loan amount.',
                'Capture any employer 401(k) match before counting money as surplus here.',
                'Enter a repeatable monthly amount, not a one-time windfall.'
              ]}
            />
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <NumberField
                  id="mp-balance"
                  label="Mortgage Balance (USD)"
                  value={inputs.outstandingLoan}
                  onChange={(v) => set('outstandingLoan', v)}
                  hint="Current principal balance from your latest statement."
                />
                <NumberField
                  id="mp-rate"
                  label="Mortgage Rate"
                  suffix="%/yr"
                  step={0.1}
                  value={inputs.annualLoanRate}
                  onChange={(v) => set('annualLoanRate', v)}
                  hint="Your note rate. For ARMs, use the current rate."
                />
                <NumberField
                  id="mp-years"
                  label="Years Remaining"
                  suffix="yrs"
                  step={0.5}
                  min={0.5}
                  value={inputs.remainingYears}
                  onChange={(v) => set('remainingYears', v)}
                  hint="Time left on the loan, not the original term."
                />
                <NumberField
                  id="mp-extra"
                  label="Extra Monthly Amount (USD)"
                  value={inputs.monthlySurplus}
                  onChange={(v) => set('monthlySurplus', v)}
                  hint="What you could sustainably add every month."
                />
                <NumberField
                  id="mp-return"
                  label="Expected Investment Return"
                  suffix="%/yr"
                  step={0.1}
                  value={inputs.expectedReturn}
                  onChange={(v) => set('expectedReturn', v)}
                  hint="Long-term expectation for where this money would go."
                />
                <SelectField
                  id="mp-risk"
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
                '"Interest saved" and "months saved" show the certainty benefit of extra principal payments.',
                '"Portfolio at baseline horizon" compares the wealth outcome at the same point in time.',
                'If the bars are close, a split between both paths is a legitimate answer.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Monthly principal & interest" value={fmt(output.baselineEmi)} />
              <ResultStat label="Interest saved with extra payments" value={fmt(output.interestSaved)} emphasis tone="positive" />
              <ResultStat label="Mortgage-free earlier by" value={`${output.monthsSaved} months`} />
              <ResultStat label="Risk-adjusted return used" value={`${output.adjustedReturn.toFixed(1)}%`} />
            </div>
            <Card className="p-5">
              <ComparisonBars
                title="Portfolio at baseline horizon"
                items={[
                  { label: 'Invest the extra monthly', value: output.investOnlyCorpus, color: '#1d4ed8' },
                  { label: 'Pay off first, then invest', value: output.prepayThenInvestCorpus, color: '#059669' }
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
                  ? 'The pay-off-first route has the higher projected portfolio under current assumptions.'
                  : 'The invest-first route has the higher projected portfolio under current assumptions.',
                'Re-run this workflow after a refinance, a rate change on an ARM, or a shift in your return expectations.',
                'Keep your emergency fund and any employer match ahead of both options.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Invest option portfolio" value={fmt(output.investOnlyCorpus)} />
              <ResultStat label="Pay-off-first portfolio" value={fmt(output.prepayThenInvestCorpus)} />
              <ResultStat label="Portfolio difference" value={fmt(output.corpusDelta)} />
              <ResultStat label="Post-payoff investing window" value={`${output.postCloseMonths} months`} />
            </div>
            <Card className="p-5">
              <ActionList
                title="Action checklist"
                items={[
                  'Confirm with your servicer that extra payments are applied as principal-only, not as an early next payment.',
                  'If you itemize deductions, factor the after-tax mortgage rate into the rate you enter here.',
                  'If the result is close, split the extra amount (for example 50:50) rather than agonizing over precision the future does not offer.'
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
                  &ldquo;Should I pay off my mortgage early or invest?&rdquo; is one of the most argued questions in
                  personal finance, and most of the arguing happens without numbers. The honest answer is that it is a
                  race between two rates: the mortgage rate you save with certainty by prepaying, and the market return
                  you might earn by investing. When those rates sit close together — as they do for many American
                  households — the details decide it, and details are what this workflow computes.
                </p>
                <p>
                  Both paths are compared over the same horizon: the extra payment either goes to principal (and, once
                  the loan dies early, the freed-up payment plus the extra invests for the remaining years) or goes
                  straight into investments from day one. A risk haircut trims your expected return before the
                  comparison, because a contractual 6.6% saving and a hoped-for 8% return are not the same kind of
                  number.
                </p>
              </>
            )}
            example={(
              <>
                <p>
                  Walk through the defaults: a $260,000 balance at 6.6% with 20 years left carries a principal-and-interest
                  payment of $1,954 and, left alone, $208,919 of remaining interest. Adding $500 a month to principal cuts
                  that interest to $131,054 — a guaranteed $77,865 saved — and retires the mortgage 80 months early, after
                  which the whole $2,454 invests monthly for those remaining six-plus years. Investing the $500 from day
                  one instead, at a balanced 7% risk-adjusted return, builds $260,463 against the payoff path&rsquo;s
                  $249,243.
                </p>
                <p>
                  An $11,000 edge for investing, on a quarter-million-dollar outcome, over twenty years — that is what the
                  great mortgage debate actually amounts to at these inputs, and it is well within the error bars of any
                  return assumption. Move the risk profile and watch the answer follow: conservative (6% adjusted) puts
                  the payoff path ahead by about $9,600, while aggressive (8%) stretches the invest edge to roughly
                  $36,000. Your mortgage rate is the one number in this comparison that is guaranteed; which side of it
                  your honest return expectation falls on is the entire decision.
                </p>
                <p>
                  Two US-specific notes belong in the mental math. If you itemize, the mortgage interest deduction lowers
                  your effective loan rate, nudging the case toward investing; most households take the standard
                  deduction, for whom the sticker rate is the real rate. And nothing here outranks an employer 401(k)
                  match — capture that first, then bring what remains to this page.
                </p>
              </>
            )}
            formula={(
              <>
                <p>
                  Core flow: simulate the baseline amortization to find remaining interest, simulate the same mortgage
                  with the extra monthly principal, record months and interest saved, then compare final portfolios —
                  investing from day one versus investing the freed-up payment after early payoff — at the original
                  loan&rsquo;s end date.
                </p>
                <p>
                  The engine treats extra payments as principal-only reductions on a fixed-rate amortizing loan, which is
                  how US servicers apply properly flagged extra payments. It deliberately omits tax effects in the math —
                  the interest deduction only applies to itemizers and varies with bracket, so it is discussed in the FAQ
                  rather than silently assumed — and it uses the same risk-haircut discipline as our other workflows: up
                  to two percentage points off your expected return depending on profile, so optimism is trimmed before
                  it can flatter the market path.
                </p>
              </>
            )}
            faqItems={faqItems}
            relatedLinks={[
              { label: 'US Mortgage Calculator', href: '/us-mortgage-calculator' },
              { label: 'US Refinance Calculator', href: '/us-refinance-calculator' },
              { label: 'US Retirement Readiness Workflow', href: '/us-retirement-readiness-workflow' },
              { label: 'Emergency Fund Readiness Workflow', href: '/emergency-fund-readiness-workflow' }
            ]}
            softwareSchema={{
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'US Mortgage Payoff vs Invest Workflow',
              url: 'https://upaman.com/us-mortgage-payoff-vs-invest-workflow',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
            }}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default UsMortgagePayoffVsInvestWorkflow;
