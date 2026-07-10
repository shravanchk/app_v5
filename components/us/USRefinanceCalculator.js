import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import { ComparisonBars } from '../calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField } from '../ui/Field';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/calculations';

const getMonthlyPayment = (principal, annualRate, months) => {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
};

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

// All figures computed with this page's own amortization math on the default
// inputs: $320,000 balance, 7.25% with 300 months left, 6.25% offer, $5,500 costs.
const REFINANCE_FAQS = [
  {
    q: 'When is refinancing a mortgage worth it?',
    a: 'When you will keep the loan past the break-even point. On a $320,000 balance, dropping from 7.25% to 6.25% over the same 300-month term saves $202.04 a month; with $5,500 in closing costs, the refinance pays for itself in about 2 years 4 months. If you might sell or refinance again before then, the deal loses money no matter how good the rate sounds.'
  },
  {
    q: 'Why does restarting a 30-year term cost so much?',
    a: 'Because you re-spread the balance over more years at the point where your payments were finally attacking principal. Taking the same 6.25% offer over 360 months instead of the remaining 300 drops the payment to $1,970.30 — but lifetime interest rises to $389,306 versus $313,283 if you match your remaining term. The "lower payment" quietly costs about $76,000 extra.'
  },
  {
    q: 'What do refinance closing costs include?',
    a: 'Lender origination fees, appraisal, title search and insurance, recording fees, and prepaid escrow items. They commonly run a few percent of the loan amount. Ask for the standardized Loan Estimate from each lender — it makes the fee lines directly comparable.'
  },
  {
    q: 'Is a "no-closing-cost" refinance really free?',
    a: 'No — the costs are either rolled into the loan balance (you pay interest on them for decades) or absorbed through a higher rate. It can still make sense if you expect to move soon, because you avoid the upfront hit; run this calculator with the higher rate to see the trade honestly.'
  },
  {
    q: 'How big a rate cut justifies refinancing?',
    a: 'The old "one percent rule" is a decent starting point but the break-even math is the real test. On this example, a half-point cut to 6.75% saves only $102.07 a month, pushing break-even to about 54 months — fine if you will stay 10 years, poor if you will not. Larger balances justify smaller cuts because the same percentage saves more dollars.'
  }
];

const formatMonths = (months) => {
  if (!months || months < 1) return 'N/A';
  const whole = Math.ceil(months);
  const years = Math.floor(whole / 12);
  const remaining = whole % 12;
  if (!years) return `${whole} months`;
  if (!remaining) return `${years} years`;
  return `${years} years ${remaining} months`;
};

const USRefinanceCalculator = () => {
  const [inputs, setInputs] = useState({
    currentBalance: 320000,
    currentRate: 7.25,
    remainingTermMonths: 300,
    newRate: 6.25,
    newTermMonths: 300,
    closingCosts: 5500
  });

  const results = useMemo(() => {
    const currentBalance = Math.max(0, Number(inputs.currentBalance) || 0);
    const currentRate = Math.max(0, Number(inputs.currentRate) || 0);
    const remainingTermMonths = Math.max(1, Math.floor(Number(inputs.remainingTermMonths) || 1));
    const newRate = Math.max(0, Number(inputs.newRate) || 0);
    const newTermMonths = Math.max(1, Math.floor(Number(inputs.newTermMonths) || 1));
    const closingCosts = Math.max(0, Number(inputs.closingCosts) || 0);

    const currentPayment = getMonthlyPayment(currentBalance, currentRate, remainingTermMonths);
    const newPayment = getMonthlyPayment(currentBalance, newRate, newTermMonths);
    const monthlySavings = currentPayment - newPayment;
    const breakEvenMonths = monthlySavings > 0 ? closingCosts / monthlySavings : null;

    const interestRemainingCurrent = Math.max(0, currentPayment * remainingTermMonths - currentBalance);
    const interestNewLoan = Math.max(0, newPayment * newTermMonths - currentBalance);
    const lifetimeSavingsAfterCosts = interestRemainingCurrent - interestNewLoan - closingCosts;

    return {
      currentPayment,
      newPayment,
      monthlySavings,
      breakEvenMonths,
      interestRemainingCurrent,
      interestNewLoan,
      lifetimeSavingsAfterCosts
    };
  }, [inputs]);

  const summaryLines = [
    `Current estimated payment: ${formatUSD(results.currentPayment)}`,
    `Refinance estimated payment: ${formatUSD(results.newPayment)}`,
    `Monthly savings: ${formatUSD(results.monthlySavings)}`,
    `Estimated break-even: ${results.breakEvenMonths ? formatMonths(results.breakEvenMonths) : 'No break-even with current inputs'}`,
    `Lifetime savings after costs: ${formatUSD(results.lifetimeSavingsAfterCosts)}`
  ];

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <Head>
        <title>US Refinance Break-even Calculator | Mortgage Refi Savings | Upaman</title>
        <meta
          name="description"
          content="Free US refinance calculator to estimate new payment, break-even months, and potential lifetime savings after closing costs."
        />
        <meta
          name="keywords"
          content="refinance break-even calculator, mortgage refinance calculator USA, refinance savings calculator, mortgage refi closing costs"
        />
        <link rel="canonical" href="https://upaman.com/us-refinance-calculator" />
        <meta property="og:title" content="US Refinance Break-even Calculator | Upaman" />
        <meta
          property="og:description"
          content="Compare current mortgage vs refinance scenario with break-even and savings estimates."
        />
        <meta property="og:url" content="https://upaman.com/us-refinance-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Refinance Break-even Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Estimate refinance break-even timeline and net savings after closing costs."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: REFINANCE_FAQS.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a }
              }))
            })
          }}
        />
      </Head>

      <CalcLayout
        eyebrow="United States"
        title="US Refinance Break-even Calculator"
        subtitle="Compare your current mortgage with a refinance offer and estimate when the closing costs are recovered."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="r-bal" label="Current loan balance" prefix="$" value={inputs.currentBalance} onChange={(v) => set('currentBalance', v)} />
              <NumberField id="r-crate" label="Current rate (APR)" suffix="%" step={0.01} value={inputs.currentRate} onChange={(v) => set('currentRate', v)} />
              <NumberField id="r-cterm" label="Remaining term" suffix="mo" min={1} value={inputs.remainingTermMonths} onChange={(v) => set('remainingTermMonths', v)} />
              <NumberField id="r-nrate" label="New refinance rate (APR)" suffix="%" step={0.01} value={inputs.newRate} onChange={(v) => set('newRate', v)} />
              <NumberField id="r-nterm" label="New loan term" suffix="mo" min={1} value={inputs.newTermMonths} onChange={(v) => set('newTermMonths', v)} />
              <NumberField id="r-close" label="Closing costs" prefix="$" value={inputs.closingCosts} onChange={(v) => set('closingCosts', v)} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="New payment" value={formatUSD(results.newPayment)} emphasis tone={results.monthlySavings > 0 ? 'positive' : 'default'} />
              <ResultStat label="Current payment" value={formatUSD(results.currentPayment)} />
              <ResultStat label="Monthly savings" value={formatUSD(results.monthlySavings)} tone={results.monthlySavings > 0 ? 'positive' : 'default'} />
              <ResultStat label="Break-even" value={results.breakEvenMonths ? formatMonths(results.breakEvenMonths) : 'No break-even'} />
            </div>

            <Card className="p-5">
              <div className="space-y-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <p><strong className="font-semibold text-ink dark:text-white">Current remaining interest:</strong> {formatUSD(results.interestRemainingCurrent)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">New loan interest:</strong> {formatUSD(results.interestNewLoan)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">Lifetime savings after costs:</strong> {formatUSD(results.lifetimeSavingsAfterCosts)}</p>
              </div>
            </Card>

            <Card className="p-5">
              <ComparisonBars
                title="Current vs refinance payment"
                items={[
                  { label: 'Current payment', value: results.currentPayment, color: '#ef4444' },
                  { label: 'Refinance payment', value: results.newPayment, color: '#10b981' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <Card className="p-5">
              <ComparisonBars
                title="Remaining interest comparison"
                items={[
                  { label: 'Current remaining interest', value: results.interestRemainingCurrent, color: '#f97316' },
                  { label: 'Refinance interest', value: results.interestNewLoan, color: '#3b82f6' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <ResultActions title="US Refinance Calculator Summary" summaryLines={summaryLines} fileName="us-refinance-calculator-summary.txt" />
          </div>
        </div>

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">The whole decision is one number: break-even</h2>
            <p>
              A refinance is a purchase. You spend real money today — closing costs — to buy a lower monthly payment,
              and the deal only turns profitable once the accumulated savings pass what you paid. On the default
              example, a $320,000 balance at 7.25% with 25 years remaining costs $2,312.98 a month. Refinancing to
              6.25% over the same remaining term drops that to $2,110.94 — a saving of <strong>$202.04 every
              month</strong>. Against $5,500 in closing costs, the break-even lands at about
              <strong> 2 years 4 months</strong>.
            </p>
            <p>
              That single number carries the whole decision. Stay in the home for seven more years and the deal earns
              roughly $55,000 after costs. Sell in year two and the same &ldquo;great rate&rdquo; loses money. Before
              anything else, be honest about how long you expect to keep this loan — not this house, this <em>loan</em>,
              because a future refinance restarts the clock too.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">The term-reset trap</h2>
            <p>
              Most refinance offers quote a fresh 30-year term, and that is where the marketing does its work. Take the
              same 6.25% offer, but spread over 360 months instead of the 300 you have left: the payment falls to a
              seductive <strong>$1,970.30</strong>. The cost hides in the total: lifetime interest of
              <strong> $389,306</strong>, versus $313,283 when you match your remaining 25 years — about
              <strong> $76,000 more</strong> for the privilege of a payment that looks $140 cheaper.
            </p>
            <p>
              The fix is simple: when you refinance, ask for a term that matches what you had left, or keep the new
              30-year loan but pay the old amount every month. Both capture the rate cut without re-renting the
              amortization curve&rsquo;s expensive early years. This calculator lets you set the new term to anything,
              so run both versions before signing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">How big a cut is actually worth it</h2>
            <p>
              The folk rule says refinance when rates drop a full point. The math is more nuanced, and the break-even
              line tells you why. A half-point cut to 6.75% on this balance saves <strong>$102.07 a month</strong> and
              needs about <strong>54 months</strong> to recover the same $5,500 in costs — nearly double the wait of
              the full-point cut. Whether that is fine depends entirely on your horizon.
            </p>
            <p>
              Balance size bends the rule too: the same half-point on a $600,000 loan saves roughly twice the dollars,
              halving the break-even. Big balances justify small cuts; small balances need big ones. And shop the
              closing costs as hard as the rate — every $1,000 shaved off costs cuts this example&rsquo;s break-even by
              about five months.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">What this estimate deliberately leaves out</h2>
            <p>
              The comparison isolates principal and interest. Escrowed property taxes and homeowners insurance move
              with your home, not your loan, so they are excluded from the payment difference. Discount points, lender
              credits, cash-out amounts, and the tax treatment of mortgage interest are not modeled — each can tilt a
              close decision. And the payment on a new loan can be estimated to the cent, but qualifying for the quoted
              rate depends on your credit profile, equity, and documentation. Treat the output as the decision
              framework and your lender&rsquo;s Loan Estimate as the contract-grade numbers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Frequently asked questions</h2>
            <div className="space-y-3">
              {REFINANCE_FAQS.map((item) => (
                <details key={item.q} className="group rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <summary className="cursor-pointer font-semibold text-ink dark:text-white">{item.q}</summary>
                  <p className="mt-2">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </article>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Current balance, current APR, remaining term, new APR, new term, and closing costs'
            ]}
            formulas={[
              'Current/new payment: amortization formula on same current balance',
              'Monthly savings = current payment - new payment',
              'Break-even months = closing costs ÷ monthly savings (if savings are positive)',
              'Lifetime savings = current remaining interest - new interest - closing costs'
            ]}
            assumptions={[
              'Escrow/tax/insurance changes are not included in payment difference',
              'Rate lock, lender credits, and tax effects are not modeled',
              'Use lender loan estimate for final refinance decision'
            ]}
            sources={[
              { label: 'Consumer Financial Protection Bureau (CFPB) - Refinance resources', url: 'https://www.consumerfinance.gov/owning-a-home/explore-rates/' },
              { label: 'Federal Housing Finance Agency (FHFA) - Mortgage market and refinance context', url: 'https://www.fhfa.gov/' }
            ]}
          />
        </div>
      
        <HowToSection
          name="How to use the Refinance Calculator"
          description="Check whether refinancing your mortgage saves money."
          steps={[
            { name: "Enter your current loan", text: "Type your current balance, rate, and remaining term." },
            { name: "Enter the new loan terms", text: "Add the new interest rate and term you are offered." },
            { name: "Add closing costs", text: "Enter the costs of refinancing." },
            { name: "Review the savings", text: "See your new payment, monthly savings, and break-even point." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default USRefinanceCalculator;
