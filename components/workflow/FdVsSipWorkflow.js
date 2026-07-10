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

// FY 2026-27 equity taxation, kept in sync with CapitalGainsCalculator:
// Section 112A LTCG 12.5% above the ₹1.25 lakh annual exemption,
// Section 111A STCG 20%, plus 4% health and education cess on the tax.
const LTCG_RATE = 0.125;
const LTCG_EXEMPTION = 125000;
const STCG_RATE = 0.2;
const CESS = 1.04;

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

// Banks credit FD/RD interest quarterly; convert the card rate to an effective annual yield.
const fdEffectiveAnnual = (cardRate) => Math.pow(1 + cardRate / 100 / 4, 4) - 1;

const annualToMonthly = (annualYield) => Math.pow(1 + annualYield, 1 / 12) - 1;

// Ordinary annuity: deposits at the end of each month.
const fvMonthly = (amount, monthlyRate, months) => {
  if (amount <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return amount * months;
  return amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

const fdOutcome = ({ mode, amount, years, fdRate, slabRate }) => {
  const months = Math.max(1, Math.round(years * 12));
  const grossYield = fdEffectiveAnnual(fdRate);
  // Interest is taxed at slab rate (plus cess) on accrual every year, so the
  // post-tax path compounds at a reduced yield rather than taking one hit at maturity.
  const netYield = grossYield * (1 - (slabRate / 100) * CESS);

  const contributions = mode === 'monthly' ? amount * months : amount;
  const preTax =
    mode === 'monthly'
      ? fvMonthly(amount, annualToMonthly(grossYield), months)
      : amount * Math.pow(1 + grossYield, years);
  const postTax =
    mode === 'monthly'
      ? fvMonthly(amount, annualToMonthly(netYield), months)
      : amount * Math.pow(1 + netYield, years);

  return {
    contributions,
    preTax,
    postTax,
    tax: Math.max(0, preTax - postTax),
    grossYield,
    netYield
  };
};

const sipOutcome = ({ mode, amount, years, expectedReturn }) => {
  const months = Math.max(1, Math.round(years * 12));
  const contributions = mode === 'monthly' ? amount * months : amount;
  const preTax =
    mode === 'monthly'
      ? fvMonthly(amount, expectedReturn / 100 / 12, months)
      : amount * Math.pow(1 + expectedReturn / 100, years);

  const gains = Math.max(0, preTax - contributions);
  const isLongTerm = years >= 1;
  const taxableGain = isLongTerm ? Math.max(0, gains - LTCG_EXEMPTION) : gains;
  const tax = taxableGain * (isLongTerm ? LTCG_RATE : STCG_RATE) * CESS;

  return {
    contributions,
    preTax,
    gains,
    tax,
    postTax: preTax - tax,
    isLongTerm
  };
};

const recommendationFor = ({ fdPost, sipPost, years }) => {
  const sipEdge = fdPost > 0 ? sipPost / fdPost - 1 : 0;

  if (years <= 3 && sipPost > fdPost) {
    return {
      label: 'FD is the safer pick for this horizon',
      tone: 'warning',
      reason: `The SIP path projects ${(sipEdge * 100).toFixed(1)}% more on paper, but at three years or less a single market drawdown can erase that edge. Equity needs time; guaranteed FD interest does not.`
    };
  }

  if (fdPost >= sipPost) {
    return {
      label: 'FD comes out ahead after tax',
      tone: 'positive',
      reason: 'With your return and slab assumptions, the guaranteed FD path beats the projected SIP path even before considering market risk. There is no reason to take equity risk for a lower expected outcome.'
    };
  }

  if (sipEdge > 0.15 && years >= 5) {
    return {
      label: 'SIP has a clear post-tax edge',
      tone: 'info',
      reason: `The SIP path projects ${(sipEdge * 100).toFixed(1)}% more after tax over this horizon. Capital-gains treatment plus the ₹1.25 lakh exemption compounds in its favour — provided you can hold through downturns.`
    };
  }

  return {
    label: 'Use a hybrid split',
    tone: 'warning',
    reason: 'The post-tax outcomes are close. Splitting between an FD (certainty) and a SIP (growth) balances both — and lets you raise the equity share as your comfort grows.'
  };
};

const FdVsSipWorkflow = () => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    mode: 'monthly',
    amount: 10000,
    years: 10,
    fdRate: 7,
    expectedReturn: 12,
    slabRate: '30'
  });

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));
  const fmt = formatCurrency;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'FD vs SIP Workflow', item: 'https://upaman.com/fd-vs-sip-workflow' }
  ]);

  const faqItems = [
    {
      question: 'Is SIP better than FD?',
      answer:
        'Neither is universally better. Over ₹10,000 a month for 10 years at a 7% FD rate versus a 12% equity assumption, the SIP path projects roughly ₹21.7 lakh post-tax against ₹15.4 lakh for the FD at the 30% slab — but the FD figure is guaranteed and the SIP figure is not. For money needed within about three years, the FD usually deserves the win regardless of projections.'
    },
    {
      question: 'How is FD interest taxed?',
      answer:
        'FD and RD interest is added to your income and taxed at your slab rate plus 4% cess — every year on an accrual basis, even for cumulative deposits that only pay out at maturity. Banks may also deduct TDS once your interest crosses the notified threshold. Because tax bites annually, the interest that should be compounding is steadily thinned out.'
    },
    {
      question: 'How are SIP returns taxed?',
      answer:
        'For equity mutual funds in FY 2026-27, gains on units held over 12 months are long-term: taxed at 12.5% (plus cess) only on the amount above the ₹1.25 lakh annual exemption. Units sold within 12 months attract 20% short-term tax. Crucially, nothing is taxed until you redeem — the full corpus keeps compounding in the meantime.'
    },
    {
      question: 'What if the FD and the SIP earned exactly the same return?',
      answer:
        'Tax treatment alone still separates them. At an identical ~7.19% effective annual return on ₹10,000 a month for 10 years, a 30%-slab investor keeps about ₹16.94 lakh via the equity route versus ₹15.39 lakh via the FD — a gap of roughly ₹1.54 lakh created purely by annual slab taxation versus deferred capital-gains taxation.'
    },
    {
      question: 'Why does this tool treat all SIP gains as long-term?',
      answer:
        'Strictly, each SIP installment has its own 12-month clock, so units bought in the final year before redemption are short-term. This tool assumes you redeem at least 12 months after your last installment (or that final-year gains are small, as they usually are). If you plan to redeem immediately after stopping the SIP, expect slightly more tax than shown.'
    },
    {
      question: 'Do FDs have advantages the numbers cannot show?',
      answer:
        'Yes. Bank deposits carry DICGC insurance up to the prescribed limit per depositor per bank, the maturity value is contractual, and senior citizens typically get a higher card rate plus preferential interest-income treatment. A SIP into an equity fund can be down 20–30% exactly when you need the money. This workflow prices the tax drag, not the sleep-at-night value of a guarantee.'
    }
  ];

  const output = useMemo(() => {
    const parsed = {
      mode: inputs.mode,
      amount: Math.max(0, Number(inputs.amount) || 0),
      years: Math.max(0.5, Number(inputs.years) || 0.5),
      fdRate: Math.max(0, Number(inputs.fdRate) || 0),
      expectedReturn: Math.max(0, Number(inputs.expectedReturn) || 0),
      slabRate: Number(inputs.slabRate) || 0
    };

    const fd = fdOutcome(parsed);
    const sip = sipOutcome(parsed);
    const recommendation = recommendationFor({ fdPost: fd.postTax, sipPost: sip.postTax, years: parsed.years });

    return {
      ...parsed,
      fd,
      sip,
      postTaxGap: sip.postTax - fd.postTax,
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
        title="FD vs SIP Benefit Workflow"
        subtitle="Compare a fixed deposit against an equity SIP on post-tax maturity value — the only number that actually reaches you."
      >
        <EEATPanel
          author={editorialProfiles.researchTeam}
          reviewer={editorialProfiles.financeReviewDesk}
          reviewedOn="July 10, 2026"
          scope="This workflow compares guaranteed FD interest (taxed yearly at your slab) with an equity SIP projection (taxed at capital-gains rates on redemption) over the same horizon and contribution pattern."
          sources={[
            { label: 'Income Tax Department', url: 'https://incometaxindia.gov.in/' },
            { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' }
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
                'Use the FD card rate your bank actually offers today, not a promotional teaser.',
                'Use a conservative long-term equity expectation — not last year’s best fund.',
                'Pick the marginal slab your last rupee of income is taxed at; FD interest is taxed at that rate.'
              ]}
            />
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  id="fs-mode"
                  label="Investing style"
                  value={inputs.mode}
                  onChange={(v) => set('mode', v)}
                  options={[
                    { value: 'monthly', label: 'Monthly deposits (RD-style FD vs SIP)' },
                    { value: 'lumpsum', label: 'One-time lump sum (FD vs mutual fund)' }
                  ]}
                />
                <NumberField
                  id="fs-amount"
                  label={inputs.mode === 'monthly' ? 'Monthly Amount (INR)' : 'Lump Sum Amount (INR)'}
                  value={inputs.amount}
                  onChange={(v) => set('amount', v)}
                  hint={
                    inputs.mode === 'monthly'
                      ? 'The same amount goes into both paths every month.'
                      : 'The same amount goes into both paths on day one.'
                  }
                />
                <NumberField
                  id="fs-years"
                  label="Horizon"
                  suffix="yrs"
                  step={0.5}
                  min={0.5}
                  value={inputs.years}
                  onChange={(v) => set('years', v)}
                  hint="When you actually need the money back."
                />
                <NumberField
                  id="fs-fdrate"
                  label="FD Interest Rate"
                  suffix="%/yr"
                  step={0.05}
                  value={inputs.fdRate}
                  onChange={(v) => set('fdRate', v)}
                  hint="Card rate; interest is compounded quarterly."
                />
                <NumberField
                  id="fs-return"
                  label="Expected SIP Return"
                  suffix="%/yr"
                  step={0.1}
                  value={inputs.expectedReturn}
                  onChange={(v) => set('expectedReturn', v)}
                  hint="Equity returns are not guaranteed; use a sober estimate."
                />
                <SelectField
                  id="fs-slab"
                  label="Your Marginal Tax Slab"
                  value={inputs.slabRate}
                  onChange={(v) => set('slabRate', v)}
                  options={[
                    { value: '0', label: '0% (below taxable limit)' },
                    { value: '5', label: '5% slab' },
                    { value: '10', label: '10% slab' },
                    { value: '15', label: '15% slab' },
                    { value: '20', label: '20% slab' },
                    { value: '25', label: '25% slab' },
                    { value: '30', label: '30% slab' }
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
                'Post-tax maturity is the comparison that matters — it is what lands in your account.',
                'FD tax drag is paid year after year at your slab; SIP tax is a one-time hit at redemption.',
                'The FD figures are guaranteed; the SIP figures are projections at your assumed return.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="FD post-tax maturity" value={fmt(output.fd.postTax)} />
              <ResultStat label="SIP post-tax maturity" value={fmt(output.sip.postTax)} emphasis tone={output.postTaxGap >= 0 ? 'positive' : 'default'} />
              <ResultStat label="FD effective net yield" value={`${(output.fd.netYield * 100).toFixed(2)}%/yr`} />
              <ResultStat label="Total invested" value={fmt(output.fd.contributions)} />
            </div>
            <Card className="p-5">
              <ComparisonBars
                title="Post-tax maturity value"
                items={[
                  { label: 'Fixed deposit (guaranteed)', value: output.fd.postTax, color: '#1d4ed8' },
                  { label: 'Equity SIP (projected)', value: output.sip.postTax, color: '#059669' }
                ]}
                formatter={fmt}
              />
            </Card>
            <Card className="p-5">
              <ComparisonBars
                title="Tax paid on the way"
                items={[
                  { label: 'FD: slab tax on interest, every year', value: output.fd.tax, color: '#e11d48' },
                  { label: 'SIP: capital-gains tax at redemption', value: output.sip.tax, color: '#f59e0b' }
                ]}
                formatter={fmt}
              />
            </Card>
            <Card className="p-5">
              <PieBreakdownChart
                title="SIP outcome: what the corpus is made of"
                items={[
                  { label: 'Your contributions', value: output.sip.contributions, color: '#3b82f6' },
                  { label: 'Post-tax gains', value: Math.max(0, output.sip.gains - output.sip.tax), color: '#10b981' },
                  { label: 'Capital-gains tax', value: output.sip.tax, color: '#f59e0b' }
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
                output.postTaxGap >= 0
                  ? 'The SIP path projects the higher post-tax corpus under current assumptions — remember it is a projection, not a promise.'
                  : 'The FD path keeps more after tax under current assumptions, with a guarantee on top.',
                'Re-run this whenever FD rates reset, your slab changes, or your horizon shortens.',
                'Money needed within about three years belongs on the guaranteed side, whatever the projection says.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="FD post-tax corpus" value={fmt(output.fd.postTax)} />
              <ResultStat label="SIP post-tax corpus" value={fmt(output.sip.postTax)} />
              <ResultStat label="Post-tax difference" value={fmt(output.postTaxGap)} emphasis tone={output.postTaxGap >= 0 ? 'positive' : 'default'} />
              <ResultStat label="Lifetime tax: FD vs SIP" value={`${fmt(output.fd.tax)} vs ${fmt(output.sip.tax)}`} />
            </div>
            <Card className="p-5">
              <ActionList
                title="Action checklist"
                items={[
                  'Keep your emergency fund in deposits regardless of this verdict — that money is not for compounding.',
                  'If you choose the SIP path, plan the exit: redeem at least 12 months after the final installment so gains stay long-term, and consider spreading redemption across two financial years to use the ₹1.25 lakh exemption twice.',
                  'If you choose the FD path, ladder maturities so a rate reset never catches the whole corpus at once.',
                  'Unsure? Start with a split (for example 60% SIP, 40% FD) and rebalance yearly.'
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
                  Most FD vs SIP comparisons stop at the headline: a fixed deposit pays around 7% guaranteed, equity SIPs
                  have averaged more over long periods, so the SIP &ldquo;wins&rdquo;. That framing hides the part that
                  actually decides the outcome for a salaried investor — <strong>tax treatment</strong>. FD interest is
                  added to your income and taxed at your slab rate plus cess every single year, even on cumulative
                  deposits where you see no cash until maturity. The interest that should be compounding is thinned out
                  annually. Equity fund gains work the opposite way: nothing is taxed while the money compounds, and at
                  redemption long-term gains are taxed at just 12.5% — and only on the amount above the ₹1.25 lakh annual
                  exemption.
                </p>
                <p>
                  The asymmetry is large enough to flip intuition. At the 30% slab, a 7% FD keeps an effective
                  post-tax yield of roughly 4.94% a year. For the FD to match even a modest equity outcome, it would need
                  a card rate no bank offers. And the effect exists even with no return advantage at all: if both routes
                  earned an identical ~7.19% effective annual return on ₹10,000 a month for 10 years, the equity route
                  would still finish about ₹1.54 lakh ahead for a 30%-slab investor — a gap produced entirely by
                  <em> when</em> and <em>how</em> each is taxed.
                </p>
                <p>
                  What the tax math cannot capture is risk. The FD number is contractual; the SIP number is an assumption
                  about markets that do not owe you 12%. That is why this workflow ends with a horizon-aware verdict
                  rather than a bare comparison: under about three years, sequence risk usually outweighs the projected
                  edge, and the guaranteed side deserves the win.
                </p>
              </>
            )}
            example={(
              <>
                <p>
                  Take the default inputs: <strong>₹10,000 a month for 10 years</strong>, a 7% FD rate (quarterly
                  compounding, so ~7.19% effective), a 12% equity assumption, and the 30% slab. Both paths receive the
                  same ₹12,00,000 of contributions. The FD grows to ₹17,27,001 before tax, but yearly slab taxation
                  claws back ₹1,87,786, leaving <strong>₹15,39,215</strong>. The SIP projects ₹23,00,387, with gains of
                  ₹11,00,387; after the ₹1.25 lakh exemption, 12.5% LTCG plus cess takes ₹1,26,800, leaving{' '}
                  <strong>₹21,73,587</strong> — about ₹6.34 lakh (41%) more, if the return assumption holds.
                </p>
                <p>
                  Shrink the horizon to 3 years and the picture tightens: ₹4,30,769 projected for the SIP (gains fall
                  inside the exemption, so zero tax) versus ₹3,86,584 post-tax for the FD — an 11% paper edge that one
                  bad market year can erase, which is why the verdict flips to the FD side for short horizons.
                </p>
              </>
            )}
            formula={(
              <>
                <p>
                  FD path: the card rate is converted to an effective annual yield using quarterly compounding
                  ((1 + r/4)&sup4; − 1), then reduced by your slab rate × 1.04 cess to model interest being taxed on
                  accrual each year; deposits compound at that net yield. SIP path: standard future-value of monthly
                  contributions at the expected return; at redemption, gains above ₹1,25,000 are taxed at 12.5% plus
                  cess (20% if the horizon is under 12 months).
                </p>
                <p>
                  Simplifications to know: all SIP gains are treated as long-term (see the FAQ on the 12-month clock per
                  installment), the exemption is applied once at redemption, TDS on FD interest is treated as part of
                  the same slab tax rather than separately, and surcharge above ₹50 lakh incomes is not modelled.
                </p>
              </>
            )}
            faqItems={faqItems}
            relatedLinks={[
              { label: 'SIP Calculator', href: '/sip-calculator' },
              { label: 'Capital Gains Tax Calculator', href: '/capital-gains-calculator' },
              { label: 'PPF Calculator', href: '/ppf-calculator' },
              { label: 'Prepay Loan vs Invest Workflow', href: '/prepay-vs-invest-workflow' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default FdVsSipWorkflow;
