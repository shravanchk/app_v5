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

const MAX_MONTHS = 1200;

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

// All figures computed with this page's own month-by-month simulation on the
// default inputs: $10,000 balance, 24% APR, 2% minimum with $35 floor, $350 fixed plan.
const CC_PAYOFF_FAQS = [
  {
    q: 'Why does paying the minimum take so long?',
    a: 'Because the minimum is designed to barely outrun interest. On $10,000 at 24% APR, the first month adds $200 of interest; a 2% minimum pays $204 — so $4 touches the principal. At that pace the simulation hits its 100-year cap with roughly $190,638 of interest paid and a balance still outstanding. The minimum protects your credit standing; it is not a repayment plan.'
  },
  {
    q: 'How fast does a fixed monthly payment clear the debt?',
    a: 'The same $10,000 at 24% APR with a flat $350 a month is gone in 3 years 7 months, at $4,976 total interest. The trick is that a fixed payment does not shrink as the balance falls — the widening gap between your payment and the accruing interest goes entirely to principal, so the payoff accelerates every month.'
  },
  {
    q: 'What does paying a little extra actually save?',
    a: 'On this balance, raising the fixed payment from $350 to $500 cuts the payoff from 3 years 7 months to 2 years 2 months and the interest from $4,976 to $2,899. Every extra dollar goes 100% to principal, which then stops generating 24% interest — an effective guaranteed return few investments can match.'
  },
  {
    q: 'Should I use a balance transfer instead?',
    a: 'A 0% promotional transfer can genuinely help if the transfer fee is smaller than the interest saved and the balance clears within the promo window — otherwise the deferred APR resumes on whatever remains. This simulator shows your baseline cost at the current APR, which is the number a transfer offer has to beat.'
  },
  {
    q: 'Avalanche or snowball — which payoff order is right?',
    a: 'With several cards, the avalanche (highest APR first) minimizes total interest, while the snowball (smallest balance first) buys quicker wins that help some people stay on plan. Both work only if minimums are paid on every card and the extra amount goes to one target at a time. Run each card here to see its individual timeline.'
  },
  {
    q: 'Does the calculator account for new purchases?',
    a: 'No — it assumes the card is not used during payoff, a constant APR, and an issuer minimum of a percent of the balance with a dollar floor (your cardholder agreement may compute it slightly differently). Continuing to spend on the card while repaying is the most common reason real payoffs run longer than the projection.'
  }
];

const formatDuration = (months) => {
  if (!months || months < 1) return '0 months';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
  if (remainingMonths === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
};

const getMinimumDue = (balanceAfterInterest, minPercent, minFloor) => {
  const percentagePayment = (balanceAfterInterest * minPercent) / 100;
  return Math.min(balanceAfterInterest, Math.max(percentagePayment, minFloor));
};

const simulatePayoff = ({ balance, apr, minPercent, minFloor, fixedPayment, mode }) => {
  let outstanding = Math.max(0, Number(balance) || 0);
  const monthlyRate = Math.max(0, Number(apr) || 0) / 100 / 12;

  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule = [];

  while (outstanding > 0.01 && month < MAX_MONTHS) {
    month += 1;
    const openingBalance = outstanding;
    const interest = openingBalance * monthlyRate;
    const balanceAfterInterest = openingBalance + interest;
    const minimumDue = getMinimumDue(balanceAfterInterest, minPercent, minFloor);
    const payment = Math.min(
      balanceAfterInterest,
      mode === 'fixed' ? Math.max(minimumDue, fixedPayment || 0) : minimumDue
    );
    const principal = payment - interest;

    if (principal <= 0) {
      return {
        months: month,
        totalInterest,
        totalPaid,
        schedule,
        isUnpayable: true
      };
    }

    outstanding = Math.max(0, balanceAfterInterest - payment);
    totalInterest += interest;
    totalPaid += payment;

    if (month <= 240) {
      schedule.push({
        month,
        openingBalance,
        payment,
        minimumDue,
        interest,
        principal,
        closingBalance: outstanding
      });
    }
  }

  return {
    months: month,
    totalInterest,
    totalPaid,
    schedule,
    isUnpayable: outstanding > 0.01,
    isCappedByLimit: month >= MAX_MONTHS
  };
};

const USCreditCardPayoffCalculator = () => {
  const [inputs, setInputs] = useState({
    balance: 10000,
    apr: 24,
    minPercent: 2,
    minFloor: 35,
    fixedPayment: 350
  });

  const minimumPlan = useMemo(
    () =>
      simulatePayoff({
        ...inputs,
        mode: 'minimum'
      }),
    [inputs]
  );

  const fixedPlan = useMemo(
    () =>
      simulatePayoff({
        ...inputs,
        mode: 'fixed'
      }),
    [inputs]
  );

  const interestSaved = Math.max(0, minimumPlan.totalInterest - fixedPlan.totalInterest);
  const monthsSaved = Math.max(0, minimumPlan.months - fixedPlan.months);

  const summaryLines = [
    `Minimum payment payoff: ${formatDuration(minimumPlan.months)}`,
    `Minimum payment interest: ${formatUSD(minimumPlan.totalInterest)}`,
    `Your fixed-payment payoff: ${formatDuration(fixedPlan.months)}`,
    `Your fixed-payment interest: ${formatUSD(fixedPlan.totalInterest)}`,
    `Interest saved: ${formatUSD(interestSaved)}`,
    `Time saved: ${formatDuration(monthsSaved)}`
  ];

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  const previewRows = fixedPlan.schedule.slice(0, 24);

  return (
    <>
      <Head>
        <title>US Credit Card Payoff Calculator | Minimum vs Fixed Payment | Upaman</title>
        <meta
          name="description"
          content="Compare US credit card minimum payment vs fixed monthly payment. Estimate payoff time, interest paid, and potential savings."
        />
        <meta
          name="keywords"
          content="US credit card payoff calculator, credit card minimum payment calculator, debt payoff planner USA, APR payoff calculator"
        />
        <link rel="canonical" href="https://upaman.com/us-credit-card-payoff-calculator" />
        <meta property="og:title" content="US Credit Card Payoff Calculator | Upaman" />
        <meta
          property="og:description"
          content="Estimate payoff timeline and interest impact of minimum payment vs fixed payment strategy."
        />
        <meta property="og:url" content="https://upaman.com/us-credit-card-payoff-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Credit Card Payoff Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Compare minimum due and fixed payment strategies to get out of credit card debt faster."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: CC_PAYOFF_FAQS.map((item) => ({
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
        title="US Credit Card Payoff Calculator"
        subtitle="Compare the minimum payment with a fixed monthly payment plan to clear card debt faster."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="c-bal" label="Current balance" prefix="$" value={inputs.balance} onChange={(v) => set('balance', v)} />
              <NumberField id="c-apr" label="APR" suffix="%" step={0.1} value={inputs.apr} onChange={(v) => set('apr', v)} />
              <NumberField id="c-minp" label="Minimum payment" suffix="%" step={0.1} value={inputs.minPercent} onChange={(v) => set('minPercent', v)} />
              <NumberField id="c-floor" label="Minimum payment floor" prefix="$" step={1} value={inputs.minFloor} onChange={(v) => set('minFloor', v)} />
              <NumberField id="c-fixed" label="Your fixed monthly payment" prefix="$" step={1} value={inputs.fixedPayment} onChange={(v) => set('fixedPayment', v)} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Fixed payment timeline" value={formatDuration(fixedPlan.months)} emphasis tone="positive" />
              <ResultStat label="Minimum payment timeline" value={formatDuration(minimumPlan.months)} />
              <ResultStat label="Interest saved" value={formatUSD(interestSaved)} tone="positive" />
              <ResultStat label="Time saved" value={formatDuration(monthsSaved)} />
            </div>

            <Card className="p-5">
              <div className="space-y-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <p><strong className="font-semibold text-ink dark:text-white">Total interest (minimum plan):</strong> {formatUSD(minimumPlan.totalInterest)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">Total interest (fixed plan):</strong> {formatUSD(fixedPlan.totalInterest)}</p>
              </div>
            </Card>

            <Card className="p-5">
              <ComparisonBars
                title="Total interest by payoff strategy"
                items={[
                  { label: 'Minimum plan', value: minimumPlan.totalInterest, color: '#ef4444' },
                  { label: 'Fixed plan', value: fixedPlan.totalInterest, color: '#10b981' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <Card className="p-5">
              <ComparisonBars
                title="Payoff timeline by strategy"
                items={[
                  { label: 'Minimum plan', value: minimumPlan.months, color: '#f97316' },
                  { label: 'Fixed plan', value: fixedPlan.months, color: '#3b82f6' }
                ]}
                formatter={(value) => `${Math.round(value)} mo`}
              />
            </Card>

            {!!previewRows.length && (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-muted dark:bg-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Month</th>
                        <th className="px-3 py-2 font-semibold">Opening</th>
                        <th className="px-3 py-2 font-semibold">Payment</th>
                        <th className="px-3 py-2 font-semibold">Interest</th>
                        <th className="px-3 py-2 font-semibold">Principal</th>
                        <th className="px-3 py-2 font-semibold">Closing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-ink-soft dark:divide-slate-700 dark:text-slate-300">
                      {previewRows.map((row) => (
                        <tr key={row.month}>
                          <td className="px-3 py-2">{row.month}</td>
                          <td className="px-3 py-2">{formatUSD(row.openingBalance)}</td>
                          <td className="px-3 py-2">{formatUSD(row.payment)}</td>
                          <td className="px-3 py-2">{formatUSD(row.interest)}</td>
                          <td className="px-3 py-2">{formatUSD(row.principal)}</td>
                          <td className="px-3 py-2 font-medium text-ink dark:text-white">{formatUSD(row.closingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <ResultActions title="US Credit Card Payoff Summary" summaryLines={summaryLines} fileName="us-credit-card-payoff-summary.txt" />
          </div>
        </div>

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Anatomy of the minimum-payment trap</h2>
            <p>
              Follow one month of the default example closely, because the whole trap is visible in it. A $10,000
              balance at 24% APR accrues <strong>$200 of interest</strong> in month one. The minimum due — 2% of the
              balance — comes to <strong>$204</strong>. Of the money you sent, <strong>$4</strong> reached the
              principal. Next month the balance is $9,996 and the arithmetic repeats, fractionally smaller each time.
            </p>
            <p>
              Run that forward and the simulation hits its 100-year cap still carrying a balance, with roughly
              <strong> $190,638 of interest</strong> paid along the way — nineteen times the original debt. That is
              not a bug in the card; it is the design. The minimum payment exists to keep the account current, and its
              percentage is set low precisely because slow payoff is the issuer&rsquo;s revenue. Any plan that follows
              the minimum line is renting the debt, not repaying it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">A fixed payment changes the physics</h2>
            <p>
              The escape is almost embarrassingly simple: stop letting the payment shrink. The same $10,000 at the
              same 24% APR, attacked with a flat <strong>$350 every month</strong>, is finished in
              <strong> 3 years 7 months</strong> at $4,976 of interest. Nothing about the debt changed — only the
              payment&rsquo;s refusal to decline with the balance.
            </p>
            <p>
              The mechanism is worth seeing: in month one, $200 of the $350 covers interest and $150 hits principal.
              As the balance falls, the interest share falls with it, so the principal share grows automatically —
              $150 becomes $200, then $300, and the payoff accelerates toward the end like a ball rolling downhill.
              Minimum-style payments cancel that acceleration by shrinking in step with the balance; fixed payments
              harvest it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">The marginal dollar is the best-paid dollar you have</h2>
            <p>
              Once a fixed plan exists, each extra dollar performs spectacularly. Raising the payment from $350 to
              <strong> $500</strong> shortens the payoff from 3 years 7 months to <strong>2 years 2 months</strong> and
              cuts interest from $4,976 to $2,899 — <strong>$2,077 saved</strong> for $150 a month of additional
              effort. Every marginal dollar goes entirely to principal, and each dollar of principal retired stops
              compounding against you at 24% forever. As a guaranteed, tax-free return on spare cash, paying down a
              24%-APR balance is nearly impossible to beat — which is why clearing card debt generally comes before
              investing, right after keeping a small emergency buffer so a surprise expense does not land back on the
              card.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Reading the projection honestly</h2>
            <p>
              The simulation assumes a constant APR, no new purchases, and an issuer minimum computed as a percentage
              of the balance with a dollar floor — your cardholder agreement may differ in detail, and most real APRs
              are variable. The single biggest divergence in practice is continued spending on the card during payoff;
              the model assumes the card is resting in a drawer. If you are juggling several cards, run each one here
              separately, keep every minimum current, and send the extra to one target at a time — highest APR first
              for the cheapest total, smallest balance first if early wins keep you going.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Frequently asked questions</h2>
            <div className="space-y-3">
              {CC_PAYOFF_FAQS.map((item) => (
                <details key={item.q} className="group rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <summary className="cursor-pointer font-semibold text-ink dark:text-white">{item.q}</summary>
                  <p className="mt-2">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Related guides</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li><a href="/guides/apr-vs-apy" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">APR vs APY: what daily compounding does to a carried balance</a></li>
              <li><a href="/guides/50-30-20-rule" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">The 50/30/20 rule — finding the money to flip at the debt</a></li>
            </ul>
          </section>
        </article>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Current balance, APR, minimum payment percentage/floor, and fixed monthly payment',
              'Minimum due is estimated as max(% of balance, floor amount)'
            ]}
            formulas={[
              'Interest accrues monthly at APR ÷ 12',
              'Payment first covers interest, then principal',
              'Simulation runs month-by-month until payoff'
            ]}
            assumptions={[
              'No additional purchases or fees are added during payoff period',
              'APR is assumed constant',
              'Card issuer minimum-due formula may differ from this estimate'
            ]}
            sources={[
              { label: 'Consumer Financial Protection Bureau (CFPB) - Credit cards', url: 'https://www.consumerfinance.gov/consumer-tools/credit-cards/' },
              { label: 'Federal Reserve - Credit card basics and costs', url: 'https://www.federalreserve.gov/consumerscommunities/credit-cards.htm' }
            ]}
          />
        </div>
      
        <HowToSection
          name="How to use the Credit Card Payoff Calculator"
          description="See how long it takes to clear a credit card balance."
          steps={[
            { name: "Enter your balance", text: "Type the outstanding balance on your card." },
            { name: "Set the APR", text: "Enter the card annual percentage rate." },
            { name: "Set your monthly payment", text: "Enter how much you can pay each month." },
            { name: "Review the payoff", text: "See the months to payoff and total interest paid." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default USCreditCardPayoffCalculator;
