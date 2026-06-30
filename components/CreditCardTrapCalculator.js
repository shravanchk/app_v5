import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { TrendingDown, Clock } from 'lucide-react';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import EEATPanel from './calculator/EEATPanel';
import ResultActions from './ResultActions';
import { ComparisonBars } from './calculator/ResultVisualizations';
import SearchLandingSections from './calculator/SearchLandingSections';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import { NumberField } from './ui/Field';
import Card from './ui/Card';
import { HowToNote, Panel } from './workflow/WorkflowKit';
import { formatINR } from '../utils/calculations';
import { buildFaqSchema } from '../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/schema';

const MAX_MONTHS = 1200;

const formatDuration = (months) => {
  if (!months || months < 1) return '0 months';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
  if (remainingMonths === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
};

const getEstimatedPayoffDate = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

const getMinimumDue = ({ balanceAfterInterest, interest, minPercent, minFloor }) => {
  const percentageBased = (balanceAfterInterest * minPercent) / 100;
  const floorBased = Math.max(minFloor, 0);
  const principalGuard = interest + Math.max(balanceAfterInterest * 0.01, 50);
  return Math.min(balanceAfterInterest, Math.max(percentageBased, floorBased, principalGuard));
};

const simulatePayoff = ({ outstandingBalance, annualRate, minPercent, minFloor, fixedMonthlyPayment, mode }) => {
  let balance = Math.max(0, Number(outstandingBalance) || 0);
  const monthlyRate = Math.max(0, Number(annualRate) || 0) / 100 / 12;

  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule = [];

  while (balance > 0.01 && months < MAX_MONTHS) {
    months += 1;

    const openingBalance = balance;
    const interest = openingBalance * monthlyRate;
    const balanceAfterInterest = openingBalance + interest;
    const minimumDue = getMinimumDue({ balanceAfterInterest, interest, minPercent, minFloor });

    let payment = minimumDue;

    if (mode === 'accelerated') {
      payment = Math.max(fixedMonthlyPayment || 0, minimumDue);
    }

    payment = Math.min(payment, balanceAfterInterest);

    const principal = payment - interest;
    if (principal <= 0) {
      return {
        months,
        totalInterest,
        totalPaid,
        schedule,
        isUnpayable: true
      };
    }

    balance = Math.max(0, balanceAfterInterest - payment);
    totalInterest += interest;
    totalPaid += payment;

    if (months <= 240) {
      schedule.push({
        month: months,
        openingBalance,
        minimumDue,
        payment,
        interest,
        principal,
        closingBalance: balance
      });
    }
  }

  return {
    months,
    totalInterest,
    totalPaid,
    schedule,
    isUnpayable: balance > 0.01,
    isCappedByLimit: months >= MAX_MONTHS
  };
};

const PlanRow = ({ label, value, valueClass }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400">{label}</p>
    <p className={`font-display text-lg font-bold ${valueClass}`}>{value}</p>
  </div>
);

const CreditCardTrapCalculator = () => {
  const [inputs, setInputs] = useState({
    outstandingBalance: 250000,
    annualRate: 36,
    minPercent: 5,
    minFloor: 500,
    fixedMonthlyPayment: 15000
  });

  const minimumPlan = useMemo(() => simulatePayoff({ ...inputs, mode: 'minimum' }), [inputs]);
  const acceleratedPlan = useMemo(() => simulatePayoff({ ...inputs, mode: 'accelerated' }), [inputs]);

  const interestSaved = Math.max(0, minimumPlan.totalInterest - acceleratedPlan.totalInterest);
  const monthsSaved = Math.max(0, minimumPlan.months - acceleratedPlan.months);
  const shareLines = [
    `Minimum-due payoff: ${formatDuration(minimumPlan.months)}`,
    `Minimum-due interest: ${formatINR(minimumPlan.totalInterest)}`,
    `Your-plan payoff: ${formatDuration(acceleratedPlan.months)}`,
    `Your-plan interest: ${formatINR(acceleratedPlan.totalInterest)}`,
    `Interest saved: ${formatINR(interestSaved)}`,
    `Time saved: ${formatDuration(monthsSaved)}`
  ];
  const faqItems = [
    {
      question: 'Why is minimum due repayment expensive?',
      answer: 'Minimum due often covers a large interest component and a small principal component, which extends payoff period and increases total interest.'
    },
    {
      question: 'How should I choose my fixed monthly payment?',
      answer: 'Pick a sustainable amount above minimum due, keep it consistent, and increase it whenever income improves to reduce total borrowing cost.'
    },
    {
      question: 'Can this calculator replace lender statements?',
      answer: 'No. Use it for planning and habit correction. Final repayment and billing values should be validated with official card statements.'
    }
  ];
  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Credit Card Trap Calculator',
    url: 'https://upaman.com/credit-card-trap-calculator',
    description: 'Compare minimum-due repayment vs accelerated monthly payment and estimate payoff time and interest savings.',
    featureList: [
      'Minimum due payoff simulation',
      'Accelerated repayment simulation',
      'Interest saved analysis',
      'Month-wise debt schedule'
    ]
  });
  const faqSchema = buildFaqSchema(faqItems);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'Credit Card Trap Calculator', item: 'https://upaman.com/credit-card-trap-calculator' }
  ]);

  const scheduleRows = acceleratedPlan.schedule.slice(0, 24);

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Head>
        <title>Credit Card Trap Calculator India | Payoff Time & Interest Saved | Upaman</title>
        <meta
          name="description"
          content="Find out how long credit card debt will take to clear on minimum due and compare with a fixed monthly payment plan."
        />
        <meta
          name="keywords"
          content="credit card payoff calculator India, minimum due trap calculator, credit card interest calculator, debt payoff planner"
        />
        <link rel="canonical" href="https://upaman.com/credit-card-trap-calculator" />
        <meta property="og:title" content="Credit Card Trap Calculator | Upaman" />
        <meta
          property="og:description"
          content="Compare minimum due vs higher payment to see payoff months and total interest impact."
        />
        <meta property="og:url" content="https://upaman.com/credit-card-trap-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <meta property="og:image:alt" content="Credit Card Trap Calculator - Upaman" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Credit Card Trap Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Estimate payoff time and interest impact with minimum due vs fixed monthly payment."
        />
        <meta name="twitter:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="India · Debt"
        title="Credit Card Trap Calculator"
        subtitle="Compare minimum due repayment vs a fixed monthly payment and see how much interest you can save."
      >
        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-bold text-ink dark:text-white">Debt inputs</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField id="cc-balance" label="Outstanding Balance" prefix="₹" value={inputs.outstandingBalance} onChange={(v) => handleInputChange('outstandingBalance', Number(v) || 0)} />
            <NumberField id="cc-apr" label="Annual Interest Rate" suffix="% APR" step={0.1} value={inputs.annualRate} onChange={(v) => handleInputChange('annualRate', Number(v) || 0)} />
            <NumberField id="cc-minpct" label="Minimum Due (% of balance)" suffix="%" step={0.1} value={inputs.minPercent} onChange={(v) => handleInputChange('minPercent', Number(v) || 0)} />
            <NumberField id="cc-floor" label="Minimum Due Floor" prefix="₹" value={inputs.minFloor} onChange={(v) => handleInputChange('minFloor', Number(v) || 0)} />
            <NumberField id="cc-fixed" label="Your Monthly Payment Plan" prefix="₹" value={inputs.fixedMonthlyPayment} onChange={(v) => handleInputChange('fixedMonthlyPayment', Number(v) || 0)} hint="If this is lower than minimum due, minimum due will be used." />
          </div>
        </Card>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Card className="border-rose-200/70 bg-rose-50/50 p-5 dark:border-rose-800/60 dark:bg-rose-900/15">
            <h3 className="mb-3 font-display text-base font-bold text-rose-700 dark:text-rose-300">Minimum Due Path</h3>
            <div className="space-y-3">
              <PlanRow label="Payoff Time" value={formatDuration(minimumPlan.months)} valueClass="text-rose-700 dark:text-rose-300" />
              <PlanRow label="Total Interest" value={formatINR(minimumPlan.totalInterest)} valueClass="text-amber-700 dark:text-amber-300" />
              <PlanRow label="Estimated Debt Free By" value={getEstimatedPayoffDate(minimumPlan.months)} valueClass="text-ink dark:text-white" />
            </div>
          </Card>

          <Card className="border-emerald-200/70 bg-emerald-50/50 p-5 dark:border-emerald-800/60 dark:bg-emerald-900/15">
            <h3 className="mb-3 font-display text-base font-bold text-emerald-700 dark:text-emerald-300">Your Payment Plan</h3>
            <div className="space-y-3">
              <PlanRow label="Payoff Time" value={formatDuration(acceleratedPlan.months)} valueClass="text-emerald-700 dark:text-emerald-300" />
              <PlanRow label="Total Interest" value={formatINR(acceleratedPlan.totalInterest)} valueClass="text-amber-700 dark:text-amber-300" />
              <PlanRow label="Estimated Debt Free By" value={getEstimatedPayoffDate(acceleratedPlan.months)} valueClass="text-ink dark:text-white" />
            </div>
          </Card>
        </div>

        <Panel title="Trap impact" icon={<TrendingDown size={18} />} className="mt-5">
          <div className="grid grid-cols-2 gap-3">
            <ResultStat label="Interest saved" value={formatINR(interestSaved)} emphasis tone="positive" />
            <ResultStat label="Time saved" value={formatDuration(monthsSaved)} />
          </div>
          <div className="mt-4 space-y-4">
            <ComparisonBars
              title="Interest comparison"
              items={[
                { label: 'Minimum due interest', value: minimumPlan.totalInterest, color: '#ef4444' },
                { label: 'Your plan interest', value: acceleratedPlan.totalInterest, color: '#10b981' }
              ]}
              formatter={formatINR}
            />
            <ComparisonBars
              title="Payoff timeline comparison"
              items={[
                { label: 'Minimum due months', value: minimumPlan.months, color: '#f97316' },
                { label: 'Your plan months', value: acceleratedPlan.months, color: '#3b82f6' }
              ]}
              formatter={(value) => `${Math.round(value)} mo`}
            />
          </div>
        </Panel>

        {(minimumPlan.isUnpayable || acceleratedPlan.isUnpayable) && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
            Current assumptions produced an unstable payoff path. Increase minimum due settings or monthly payment.
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
            <Clock size={18} /> First 24 months (your payment plan)
          </h3>
          <Panel className="!p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-ink-muted dark:border-slate-700 dark:text-slate-400">
                    <th className="px-3 py-2.5 font-semibold">Month</th>
                    <th className="px-3 py-2.5 font-semibold">Opening</th>
                    <th className="px-3 py-2.5 font-semibold">Min due</th>
                    <th className="px-3 py-2.5 font-semibold">Payment</th>
                    <th className="px-3 py-2.5 font-semibold">Interest</th>
                    <th className="px-3 py-2.5 font-semibold">Principal</th>
                    <th className="px-3 py-2.5 font-semibold">Closing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scheduleRows.map((row) => (
                    <tr key={row.month} className="text-ink-soft dark:text-slate-300">
                      <td className="px-3 py-2.5">{row.month}</td>
                      <td className="px-3 py-2.5">{formatINR(row.openingBalance)}</td>
                      <td className="px-3 py-2.5">{formatINR(row.minimumDue)}</td>
                      <td className="px-3 py-2.5">{formatINR(row.payment)}</td>
                      <td className="px-3 py-2.5">{formatINR(row.interest)}</td>
                      <td className="px-3 py-2.5">{formatINR(row.principal)}</td>
                      <td className="px-3 py-2.5">{formatINR(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="mt-5">
          <HowToNote
            title="How to use this"
            items={[
              'Use your actual card APR and current outstanding balance.',
              'Set your monthly payment target and compare with the minimum due path.',
              'Paying more early usually reduces both payoff time and interest sharply.'
            ]}
          />
        </div>

        <div className="mt-6 space-y-6">
          <ResultActions
            title="Credit card payoff comparison summary"
            summaryLines={shareLines}
            fileName="upaman-credit-card-trap-summary.txt"
          />

          <EEATPanel
            author="Upaman Research Team"
            reviewer="Debt and Credit Behavior Review Desk (Upaman)"
            reviewedOn="June 28, 2026"
            scope="Models revolving credit payoff scenarios with fixed APR assumptions and no new spending."
            sources={[
              { label: 'RBI Financial Education', url: 'https://www.rbi.org.in/financialeducation/' },
              { label: 'RBI FAQs', url: 'https://rbi.org.in/' }
            ]}
          />
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Outstanding balance, APR, minimum due %, minimum floor amount, and your fixed monthly payment',
              'Each month recalculates minimum due after adding monthly interest'
            ]}
            formulas={[
              'Monthly interest = opening balance × (APR / 12)',
              'Payment applied = max(minimum due, fixed plan payment) for accelerated mode',
              'Balance progression is simulated month-by-month until payoff'
            ]}
            assumptions={[
              'APR remains constant through the simulation period',
              'No new card spends, fees, penalties, or rate revisions are included',
              'Schedule is capped at a high month limit to flag unstable payoff patterns'
            ]}
            sources={[
              { label: 'RBI financial literacy resources', url: 'https://www.rbi.org.in/financialeducation/' }
            ]}
            guideLinks={[
              { label: 'Credit card minimum due trap guide', href: '/guide-credit-card-minimum-due-trap.html' },
              { label: 'EMI prepayment strategy guide', href: '/guide-emi-prepayment-strategy.html' }
            ]}
          />
          <SearchLandingSections
            intro={(
              <p>
                Credit card debt grows quickly when repayments stay near minimum due. This page compares minimum-due
                payoff vs a fixed repayment plan so you can choose a practical monthly strategy before interest costs
                compound further.
              </p>
            )}
            example={(
              <p>
                For a ₹2.5 lakh balance at high APR, minimum due can stretch payoff over years with heavy interest.
                Increasing monthly payment to a fixed target shortens payoff horizon and reduces total interest. Use the
                side-by-side result cards to set an achievable but aggressive payment plan.
              </p>
            )}
            formula={(
              <p>
                Month loop: add interest on opening balance, compute minimum due, apply either minimum due or selected
                fixed payment (whichever is higher in accelerated mode), then update closing balance. Repeat until
                payoff and track cumulative interest.
              </p>
            )}
            faqItems={faqItems}
            relatedLinks={[
              { label: 'Loan EMI Calculator', href: '/loan-calculator' },
              { label: 'Prepay vs Invest Workflow', href: '/prepay-vs-invest-workflow' },
              { label: 'Credit card minimum due trap guide', href: '/guide-credit-card-minimum-due-trap.html' }
            ]}
          />
        </div>
      
        <HowToSection
          name="How to use the Credit Card Trap Calculator"
          description="See how long minimum payments take and what they really cost."
          steps={[
            { name: "Enter your outstanding balance", text: "Type the amount currently owed on your card." },
            { name: "Set the interest rate", text: "Enter your card APR (monthly or annual)." },
            { name: "Choose a monthly payment", text: "Compare minimum-only versus a fixed higher payment." },
            { name: "Review the payoff", text: "See the payoff time, total interest, and how much faster you clear the debt." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default CreditCardTrapCalculator;
