import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { CheckCircle2 } from 'lucide-react';
import { PieBreakdownChart, ComparisonBars } from '../calculator/ResultVisualizations';
import EEATPanel from '../calculator/EEATPanel';
import SearchLandingSections from '../calculator/SearchLandingSections';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import { NumberField } from '../ui/Field';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { WorkflowSteps, HowToNote, DecisionBanner, ActionList } from '../workflow/WorkflowKit';
import { buildBreadcrumbSchema } from '../../utils/schema';
import { editorialProfiles } from '../../utils/editorialProfiles';

const { markets, formatCurrencyFor } = require('../../utils/markets');
const {
  assessRetirementReadiness,
  retirementReadinessVerdict
} = require('../../utils/engines/retirementReadiness');

// Verdict copy is market-neutral; everything market-specific (defaults,
// article, FAQs, action plans) lives in the CONTENT map below.
const verdictCopy = {
  'on-track': (o, fmt) => ({
    label: 'You are on track',
    tone: 'positive',
    reason: `Your projected corpus of ${fmt(o.projectedCorpus)} covers the ${fmt(o.requiredCorpus)} your lifestyle requires — a readiness score of ${Math.round(o.readinessRatio * 100)}%. The buffer of ${fmt(o.surplus)} is your margin against weaker markets or higher inflation.`
  }),
  close: (o, fmt) => ({
    label: 'Close — a small course-correction finishes the job',
    tone: 'info',
    reason: `You are ${Math.round(o.readinessRatio * 100)}% funded. Adding roughly ${fmt(o.extraMonthlyNeeded)} a month from now until retirement closes the remaining ${fmt(o.shortfall)} gap.`
  }),
  behind: (o, fmt) => ({
    label: 'Behind — the plan needs a real change',
    tone: 'warning',
    reason: `Projected savings cover only ${Math.round(o.readinessRatio * 100)}% of the requirement. Closing the ${fmt(o.shortfall)} gap needs about ${fmt(o.extraMonthlyNeeded)} more each month — or a later retirement date, or a leaner target lifestyle.`
  }),
  'far-behind': (o, fmt) => ({
    label: 'Seriously underfunded on current settings',
    tone: 'danger',
    reason: `Under half funded (${Math.round(o.readinessRatio * 100)}%). The honest options are structural: save ${fmt(o.extraMonthlyNeeded)} more monthly, push retirement later, or plan around a materially smaller spend of about ${fmt(o.sustainableMonthlyToday)} a month in today's money.`
  })
};

const CONTENT = {
  india: {
    path: '/retirement-readiness-workflow',
    breadcrumbName: 'Retirement Readiness Workflow',
    title: 'Retirement Readiness Workflow',
    subtitle:
      'Find the corpus your lifestyle actually needs at retirement, compare it with where your savings are headed, and get a concrete monthly plan.',
    scope:
      'This workflow projects your savings to retirement age, computes the corpus needed to fund inflation-growing expenses through retirement, and reports the gap. EPF/NPS/tax treatment is not modelled; returns are your post-tax assumptions.',
    sources: [
      { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
      { label: 'Income Tax Department', url: 'https://incometaxindia.gov.in/' }
    ],
    howToFill: [
      'Enter household expenses you would still have in retirement — skip EMIs that end and school fees, keep healthcare generous.',
      'Count every earmarked retirement asset in the current corpus: EPF, PPF, NPS, mutual funds.',
      'The step-up is the % by which you raise your monthly saving each year — most salaried savers can match it to increments.'
    ],
    actionItems: [
      'Automate the monthly amount as SIPs/contributions on salary day — readiness plans fail on discipline, not math.',
      'Add a step-up instruction so contributions rise with increments; the worked example shows it is worth more than a lakh a month later.',
      'Rebalance toward safer assets as retirement approaches — the post-retirement return assumption only works if the corpus is not fully in equity at 60.',
      'Re-run this yearly and after every big change: increment, home purchase, or a market crash.'
    ],
    relatedLinks: [
      { label: 'SIP Calculator', href: '/sip-calculator' },
      { label: 'PPF Calculator', href: '/ppf-calculator' },
      { label: 'FD vs SIP Workflow', href: '/fd-vs-sip-workflow' },
      { label: 'Emergency Fund Readiness Workflow', href: '/emergency-fund-readiness-workflow' }
    ],
    intro: (
      <>
        <p>
          Retirement planning in India has a property most people underestimate: there is no meaningful state pension
          to fall back on, and inflation does the compounding against you. At 6% inflation, expenses double roughly
          every 12 years — so a household spending ₹50,000 a month at age 30 will need about <strong>₹2,87,175 a
          month at 60</strong> to live the same life. Whatever corpus you build must then survive 25 or more years of
          those still-growing withdrawals.
        </p>
        <p>
          That is why single-number folklore — &ldquo;₹1 crore is enough&rdquo; — fails. For the 30-year-old above,
          ₹1 crore at 60 sustains only about <strong>₹6,481 a month in today&rsquo;s money</strong>. The honest
          question has two halves: what corpus does <em>your</em> lifestyle require, and what corpus are your current
          savings actually on track to produce? This workflow computes both from the same assumptions and turns the
          difference into a readiness score and a monthly action number.
        </p>
        <p>
          The math runs in two phases. Before retirement, your existing corpus and monthly savings compound at your
          accumulation return. After retirement, the corpus keeps earning a more conservative return while you draw an
          inflation-growing income from it. The required corpus is the amount that lets those withdrawals run all the
          way to your planning age without the money running out first.
        </p>
      </>
    ),
    example: (
      <>
        <p>
          Take the default profile: 30 years old, retiring at 60, planning to 85, spending ₹50,000 a month today,
          with ₹5 lakh already saved and ₹20,000 a month going in, stepped up 5% a year. Assumptions: 6% inflation,
          11% return before retirement, 7% after. Required corpus at 60: <strong>₹7.71 crore</strong> (that funds
          ₹2.87 lakh/month growing with inflation for 25 years). Projected corpus: ₹1.14 crore from the existing
          savings plus ₹8.60 crore from the step-up SIP stream — <strong>₹9.74 crore, a 126% readiness score</strong>,
          enough to sustain about ₹63,157 a month in today&rsquo;s money.
        </p>
        <p>
          Two levers dominate that result. Remove the 5% annual step-up and readiness falls to <strong>87.5%</strong>
          — a ₹96 lakh shortfall needing ₹3,427 more a month. Keep the step-up but start the same plan at 40 instead
          of 30, and readiness collapses to <strong>65.4%</strong>, needing ₹17,230 extra every month. Starting early
          is worth five times more than any later heroics.
        </p>
      </>
    ),
    formula: (
      <>
        <p>
          Required corpus is the present value of a growing annuity-due: first-year retirement expenses (today&rsquo;s
          expenses inflated to retirement age), withdrawn at the start of each year, growing at inflation g while the
          remaining corpus earns the post-retirement return r — corpus = E × (1 − x&#8319;)/(1 − x) with
          x = (1+g)/(1+r). Projected corpus = current corpus compounded to retirement plus the future value of monthly
          savings with the annual step-up applied.
        </p>
        <p>
          Simplifications to know: EPF, NPS, and tax on withdrawals are not modelled — treat your return inputs as
          post-tax; the expense input is assumed to already reflect a retirement lifestyle; and healthcare shocks are
          better handled through insurance than corpus padding.
        </p>
      </>
    ),
    faqItems: [
      {
        question: 'How much corpus do I need to retire in India?',
        answer:
          'It depends on expenses, retirement age, and how long the money must last — not on a universal number. For a 30-year-old spending ₹50,000 a month who retires at 60 and plans to 85 (6% inflation, 7% post-retirement return), the requirement is about ₹7.71 crore. A 40-year-old with the same lifestyle needs about ₹4.31 crore at 60, because 10 fewer years of inflation act on the target.'
      },
      {
        question: 'Is ₹1 crore enough to retire?',
        answer:
          'Usually not for younger savers. For a 30-year-old retiring at 60, ₹1 crore at retirement sustains only about ₹6,481 a month of today’s purchasing power through 25 years of retirement. The same ₹1 crore is far more adequate for someone retiring within a few years — inflation between now and retirement is what shrinks it.'
      },
      {
        question: 'How much difference does a yearly step-up make?',
        answer:
          'In the worked example, a 5% annual step-up on a ₹20,000 monthly saving is the difference between 87.5% and 126.3% readiness — it swings the outcome by roughly ₹3 crore over 30 years. Matching your step-up to salary increments is the cheapest fix available, because it never touches your current lifestyle.'
      },
      {
        question: 'Why are EPF, NPS, and taxes not modelled?',
        answer:
          'Each wrapper has its own contribution rules and its own tax treatment at withdrawal, and modelling them poorly would be worse than not modelling them. Include their balances in your current corpus and their monthly inflows in your saving amount, and use post-tax return assumptions. The engine deliberately compares corpus needed with corpus projected, independent of the wrapper.'
      },
      {
        question: 'What return assumptions are reasonable?',
        answer:
          'The defaults use 11% before retirement (an equity-heavy portfolio’s long-term expectation, not a guarantee) and 7% after (a conservative mixed portfolio). If you prefer more caution, lower the pre-retirement return — a plan that only works at 13% is not a plan. The inflation input matters just as much: test 7% and see how the requirement moves.'
      },
      {
        question: 'What if I am starting late?',
        answer:
          'The math is honest about it: the default plan started at 40 instead of 30 is only 65.4% funded and needs ₹17,230 more each month. The workable levers are the same for everyone — higher savings rate, later retirement age, or a leaner expense target — but each year of delay makes the same outcome cost more.'
      }
    ]
  },

  us: {
    path: '/us-retirement-readiness-workflow',
    breadcrumbName: 'US Retirement Readiness Workflow',
    title: 'US Retirement Readiness Workflow',
    subtitle:
      'Project your savings to retirement, compare them with what your lifestyle actually requires, and get a concrete monthly number to close any gap.',
    scope:
      'This workflow projects savings to retirement age, computes the corpus needed to fund inflation-growing expenses through retirement, and reports the gap. Social Security, account wrappers (401(k)/IRA), and taxes are not modelled; returns are your post-tax assumptions.',
    sources: [
      { label: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/' },
      { label: 'Social Security Administration', url: 'https://www.ssa.gov/' }
    ],
    howToFill: [
      'Enter monthly expenses you would still carry in retirement — drop the mortgage if it will be paid off, keep healthcare generous.',
      'Current savings means every earmarked retirement account combined: 401(k), IRA, HSA earmarked for retirement, brokerage.',
      'The step-up is the % by which you raise your monthly contribution each year — matching it to raises makes it painless.'
    ],
    actionItems: [
      'Automate contributions and capture the full employer 401(k) match before anything else — it is an instant return no market offers.',
      'Add an annual step-up (auto-escalation, which many plans support) so contributions rise with raises.',
      'Check your Social Security estimate at ssa.gov and decide deliberately whether to treat it as a buffer or to reduce the expense input by part of it.',
      'Glide toward safer assets as retirement approaches — the post-retirement return assumption presumes the corpus is no longer fully in stocks.',
      'Re-run this yearly and after every major change: new job, home purchase, or a large market move.'
    ],
    relatedLinks: [
      { label: 'Compound Interest Calculator', href: '/compound-interest-calculator' },
      { label: 'US Savings & CD Calculator', href: '/us-savings-cd-calculator' },
      { label: 'US 401(k) Calculator', href: '/us-401k-calculator' },
      { label: 'Traditional vs Roth 401(k) Guide', href: '/guides/traditional-vs-roth-401k' }
    ],
    intro: (
      <>
        <p>
          Most US retirement rules of thumb compress a hard question into one number — 25× your spending, the 4%
          rule, &ldquo;a million dollars.&rdquo; They hide the two things that actually decide your outcome: inflation
          between now and retirement, and how long the corpus must keep paying you afterward. At 2.5% inflation, a
          $4,000-a-month lifestyle at age 30 costs about <strong>$9,493 a month at 65</strong> — and that number keeps
          growing through 25 years of retirement.
        </p>
        <p>
          This workflow answers the question directly instead. It computes the corpus that funds your
          inflation-growing expenses from retirement to your planning age, projects what your current savings and
          monthly contributions will actually become, and reduces the comparison to one readiness score plus a
          concrete monthly amount that closes any gap. It is deliberately simpler than a financial plan: Social
          Security is left out (treat your ssa.gov estimate as a buffer, or subtract part of it from the expense
          input), and 401(k)/IRA wrappers are treated as one pool — enter combined balances and use post-tax return
          assumptions.
        </p>
        <p>
          Against the familiar 25× rule, this method is more precise in both directions: it inflates your spending to
          retirement age first (the step most people skip), and then sizes the corpus off your actual post-retirement
          return and time horizon rather than a fixed multiple. For the default profile it needs $2.17 million — less
          than the $2.85 million a naive 25× of retirement-age spending implies, because the corpus keeps earning
          above inflation while paying out.
        </p>
      </>
    ),
    example: (
      <>
        <p>
          The default profile: 30 years old, retiring at 65, planning to 90, spending $4,000 a month today, with
          $30,000 saved and $800 a month going in, stepped up 3% a year. Assumptions: 2.5% inflation, 8% return before
          retirement, 5% after. Required corpus at 65: <strong>$2,165,053</strong>. Projected corpus: $443,560 from
          the existing savings plus $2,532,984 from contributions — <strong>$2,976,545, a 137% readiness
          score</strong>, enough to sustain about $5,499 a month in today&rsquo;s money.
        </p>
        <p>
          The two levers that dominate: without the 3% annual step-up the same saver lands at <strong>105%</strong> —
          still funded, but with the safety margin gone. Start the identical plan at 45 instead of 30 and readiness
          collapses to <strong>48.6%</strong>, a $768,609 shortfall that costs $1,305 in extra monthly savings to
          close. Time in the market is doing most of the work; the earlier dollars are simply worth more.
        </p>
      </>
    ),
    formula: (
      <>
        <p>
          Required corpus is the present value of a growing annuity-due: first-year retirement expenses (today&rsquo;s
          expenses inflated to retirement age), withdrawn at the start of each year, growing at inflation g while the
          remaining corpus earns the post-retirement return r — corpus = E × (1 − x&#8319;)/(1 − x) with
          x = (1+g)/(1+r). Projected corpus = current savings compounded to retirement plus the future value of
          monthly contributions with the annual step-up applied.
        </p>
        <p>
          Simplifications to know: Social Security and pensions are excluded (a deliberate buffer, or subtract them
          from expenses); taxes and account wrappers are not modelled, so use post-tax return assumptions; and the
          plan assumes spending grows exactly with inflation, while real retirees often spend more early and less
          late.
        </p>
      </>
    ),
    faqItems: [
      {
        question: 'How much money do I need to retire?',
        answer:
          'It depends on spending, retirement age, and planning horizon — not a universal figure. For a 30-year-old spending $4,000 a month who retires at 65 and plans to 90 (2.5% inflation, 5% post-retirement return), the requirement is about $2.17 million at retirement. The biggest sensitivity is the expense input: every $500 a month of retirement lifestyle moves the requirement by roughly $270,000.'
      },
      {
        question: 'Is $1 million enough to retire on?',
        answer:
          'For someone retiring decades from now, usually not: for the default 30-year-old profile, $1 million at 65 sustains about $1,848 a month in today’s purchasing power through 25 years. For someone retiring soon with a paid-off home and Social Security on top, it can be — the calculator lets you test your own numbers instead of arguing about the folklore.'
      },
      {
        question: 'How does this relate to the 4% rule?',
        answer:
          'The 4% rule (withdraw 4% of the corpus in year one, then adjust for inflation) is a backward-tested heuristic that implies a 25× corpus. This workflow computes the corpus directly from your own post-retirement return, inflation, and horizon — for the defaults it implies an initial withdrawal rate of about 5.3%, higher than 4% because the horizon is a defined 25 years rather than open-ended. If you want 4%-rule conservatism, lower the post-retirement return input.'
      },
      {
        question: 'Where does Social Security fit in?',
        answer:
          'It is deliberately not modelled — benefit amounts depend on your earnings record and claiming age, and the honest source is your own statement at ssa.gov. Two clean ways to use it here: treat the benefit as a safety buffer on top of the plan, or subtract a conservative fraction of the estimated benefit from your monthly expense input.'
      },
      {
        question: 'How do 401(k), IRA, and brokerage accounts fit in?',
        answer:
          'Enter their combined balances as current savings and your total monthly contributions (including any employer match) as the saving amount. The wrappers differ in tax treatment — contribution limits also change year to year, so check current IRS figures — but the corpus math is the same pool of invested money. Use post-tax return assumptions if most of your savings are pre-tax.'
      },
      {
        question: 'What does waiting cost?',
        answer:
          'More than intuition suggests. The default plan started at 45 instead of 30 is only 48.6% funded and needs $1,305 more per month to close the gap — versus $800 total contributions had it started at 30. Each year of delay removes the cheapest, most-compounded dollars from the plan.'
      }
    ]
  }
};

const RetirementReadinessWorkflow = ({ marketKey = 'india' }) => {
  const market = markets[marketKey];
  const content = CONTENT[marketKey];
  const fmt = formatCurrencyFor(market);

  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({ ...market.retirementDefaults });
  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: content.breadcrumbName, item: `https://upaman.com${content.path}` }
  ]);

  const output = useMemo(() => {
    const currentAge = Math.min(80, Math.max(18, Number(inputs.currentAge) || 18));
    const retireAge = Math.min(80, Math.max(currentAge + 1, Number(inputs.retireAge) || currentAge + 1));
    const lifeExpectancy = Math.min(110, Math.max(retireAge + 1, Number(inputs.lifeExpectancy) || retireAge + 1));

    const parsed = {
      currentAge,
      retireAge,
      lifeExpectancy,
      monthlyExpenses: Math.max(0, Number(inputs.monthlyExpenses) || 0),
      inflationPct: Math.max(0, Number(inputs.inflationPct) || 0),
      preRetReturnPct: Math.max(0, Number(inputs.preRetReturnPct) || 0),
      postRetReturnPct: Math.max(0, Number(inputs.postRetReturnPct) || 0),
      currentCorpus: Math.max(0, Number(inputs.currentCorpus) || 0),
      monthlySaving: Math.max(0, Number(inputs.monthlySaving) || 0),
      stepUpPct: Math.max(0, Number(inputs.stepUpPct) || 0)
    };

    const result = assessRetirementReadiness(parsed);
    const verdict = retirementReadinessVerdict(result);
    return { ...parsed, ...result, recommendation: verdictCopy[verdict.code](result, fmt) };
  }, [inputs, fmt]);

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout eyebrow="Decision workflow" title={content.title} subtitle={content.subtitle}>
        <EEATPanel
          author={editorialProfiles.researchTeam}
          reviewer={editorialProfiles.financeReviewDesk}
          reviewedOn="July 10, 2026"
          scope={content.scope}
          sources={content.sources}
        />

        <div className="mt-6">
          <WorkflowSteps steps={['Inputs', 'Projection', 'Action Plan']} active={step} onChange={setStep} />
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <HowToNote title="How to fill this quickly" items={content.howToFill} />
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <NumberField
                  id="rr-age"
                  label="Current Age"
                  suffix="yrs"
                  min={18}
                  value={inputs.currentAge}
                  onChange={(v) => set('currentAge', v)}
                />
                <NumberField
                  id="rr-retire"
                  label="Retirement Age"
                  suffix="yrs"
                  value={inputs.retireAge}
                  onChange={(v) => set('retireAge', v)}
                  hint="When the paychecks stop."
                />
                <NumberField
                  id="rr-life"
                  label="Plan Until Age"
                  suffix="yrs"
                  value={inputs.lifeExpectancy}
                  onChange={(v) => set('lifeExpectancy', v)}
                  hint="Plan long; outliving the money is the failure mode."
                />
                <NumberField
                  id="rr-expenses"
                  label={`Monthly Expenses Today (${market.currency})`}
                  value={inputs.monthlyExpenses}
                  onChange={(v) => set('monthlyExpenses', v)}
                  hint="Only expenses that continue into retirement."
                />
                <NumberField
                  id="rr-corpus"
                  label={`Current Retirement Savings (${market.currency})`}
                  value={inputs.currentCorpus}
                  onChange={(v) => set('currentCorpus', v)}
                  hint="All earmarked retirement accounts combined."
                />
                <NumberField
                  id="rr-saving"
                  label={`Monthly Saving (${market.currency})`}
                  value={inputs.monthlySaving}
                  onChange={(v) => set('monthlySaving', v)}
                  hint="Total going toward retirement each month."
                />
                <NumberField
                  id="rr-stepup"
                  label="Annual Step-up"
                  suffix="%/yr"
                  step={0.5}
                  value={inputs.stepUpPct}
                  onChange={(v) => set('stepUpPct', v)}
                  hint="How much you raise the monthly saving each year."
                />
                <NumberField
                  id="rr-inflation"
                  label="Inflation"
                  suffix="%/yr"
                  step={0.1}
                  value={inputs.inflationPct}
                  onChange={(v) => set('inflationPct', v)}
                />
                <NumberField
                  id="rr-prereturn"
                  label="Return Before Retirement"
                  suffix="%/yr"
                  step={0.1}
                  value={inputs.preRetReturnPct}
                  onChange={(v) => set('preRetReturnPct', v)}
                  hint="Long-term post-tax expectation, not a peak year."
                />
                <NumberField
                  id="rr-postreturn"
                  label="Return After Retirement"
                  suffix="%/yr"
                  step={0.1}
                  value={inputs.postRetReturnPct}
                  onChange={(v) => set('postRetReturnPct', v)}
                  hint="Use a conservative, lower-risk portfolio return."
                />
              </div>
            </Card>
            <Button onClick={() => setStep(2)}>Continue to Projection</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            <HowToNote
              title="How to read this step"
              items={[
                'The required corpus already includes inflation — both before retirement and through every retirement year.',
                'The readiness score is projected ÷ required; 100% means fully funded to your planning age.',
                'Both bars use the same assumptions, so changing any input moves them honestly.'
              ]}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Required corpus at retirement" value={fmt(output.requiredCorpus)} />
              <ResultStat
                label="Projected corpus"
                value={fmt(output.projectedCorpus)}
                emphasis
                tone={output.readinessRatio >= 1 ? 'positive' : 'default'}
              />
              <ResultStat label="Readiness score" value={`${Math.round(output.readinessRatio * 100)}%`} />
              <ResultStat label="Monthly expense at retirement" value={fmt(output.monthlyExpenseAtRetirement)} />
            </div>
            <Card className="p-5">
              <ComparisonBars
                title="Required vs projected corpus at retirement"
                items={[
                  { label: 'Required for your lifestyle', value: output.requiredCorpus, color: '#1d4ed8' },
                  { label: 'Projected from your plan', value: output.projectedCorpus, color: '#059669' }
                ]}
                formatter={fmt}
              />
            </Card>
            <Card className="p-5">
              <PieBreakdownChart
                title="Where the projected corpus comes from"
                items={[
                  { label: 'Growth of what you already have', value: output.projectedFromCorpus, color: '#3b82f6' },
                  { label: 'Future monthly savings', value: output.projectedFromSavings, color: '#10b981' }
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultStat label="Readiness score" value={`${Math.round(output.readinessRatio * 100)}%`} emphasis tone={output.readinessRatio >= 1 ? 'positive' : 'default'} />
              <ResultStat
                label={output.shortfall > 0 ? 'Shortfall at retirement' : 'Surplus at retirement'}
                value={fmt(output.shortfall > 0 ? output.shortfall : output.surplus)}
              />
              <ResultStat label="Extra monthly saving needed" value={fmt(output.extraMonthlyNeeded)} />
              <ResultStat label="Sustainable spend (today's money)" value={`${fmt(output.sustainableMonthlyToday)}/mo`} />
            </div>
            <Card className="p-5">
              <ActionList title="Action checklist" items={content.actionItems} />
            </Card>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back to Projection</Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <SearchLandingSections
            intro={content.intro}
            example={content.example}
            formula={content.formula}
            faqItems={content.faqItems}
            relatedLinks={content.relatedLinks}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default RetirementReadinessWorkflow;
