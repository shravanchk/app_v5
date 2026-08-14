import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import { PieBreakdownChart, ComparisonBars } from '../calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField } from '../ui/Field';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/calculations';
import { useShareableState, toNumber } from '../../utils/shareableState';

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

// All figures computed with this page's own projection loops on the default
// inputs: savings $10,000 + $500/month at 4.5% for 5 years; CD $15,000 at 5.1% for 12 months.
const SAVINGS_CD_FAQS = [
  {
    q: 'Should I put money in a high-yield savings account or a CD?',
    a: 'They solve different problems. Savings accounts keep the money reachable but the bank can reprice the APY any time; a CD locks the rate for the term but charges a penalty to exit early. Money you might need stays in savings; money with a known date (a car next year, tuition in two) fits a CD matched to that date.'
  },
  {
    q: 'Is my savings APY guaranteed?',
    a: 'No. High-yield savings rates float with the market and banks adjust them without notice — the projection here assumes the rate holds, which is the model’s biggest simplification. On the default plan ($10,000 plus $500 a month for 5 years), the difference between a steady 4.5% and a drop to 3.5% is about $1,479 of interest.'
  },
  {
    q: 'How is CD interest calculated here?',
    a: 'The deposit compounds monthly at APY ÷ 12 for the term: $15,000 at 5.1% for 12 months matures at about $15,783, earning $783. Real banks vary in compounding convention (daily, monthly, at maturity), which shifts the result by a few dollars — the APY is designed to make offers comparable despite that.'
  },
  {
    q: 'What is a CD ladder?',
    a: 'Splitting a deposit across staggered terms — say a $15,000 sum split into 12-, 24-, and 36-month rungs — so a portion matures regularly. Each maturity can be spent or rolled into a new long rung at current rates. You keep periodic access and average through rate cycles instead of betting everything on one term.'
  },
  {
    q: 'Are savings accounts and CDs at banks insured?',
    a: 'Deposits at FDIC-member banks (and NCUA-insured credit unions) are federally insured up to the standard coverage limit per depositor, per institution, per ownership category. Balances above the limit can be spread across institutions or ownership categories to stay fully covered.'
  },
  {
    q: 'Is interest from savings and CDs taxable?',
    a: 'Yes — it is ordinary income in the year it is credited, reported by the bank on Form 1099-INT, even for a CD you have not cashed out. The projections here are pre-tax; your after-tax yield depends on your bracket, which matters when comparing against tax-advantaged alternatives.'
  }
];

const projectSavings = (initialDeposit, monthlyContribution, apy, years) => {
  const months = Math.max(1, Math.floor((Number(years) || 0) * 12));
  const monthlyRate = Math.max(0, Number(apy) || 0) / 100 / 12;
  let balance = Math.max(0, Number(initialDeposit) || 0);
  let totalContributed = balance;

  for (let month = 1; month <= months; month += 1) {
    balance += Math.max(0, Number(monthlyContribution) || 0);
    totalContributed += Math.max(0, Number(monthlyContribution) || 0);
    balance += balance * monthlyRate;
  }

  return {
    months,
    totalContributed,
    endingBalance: balance,
    interestEarned: Math.max(0, balance - totalContributed)
  };
};

const projectCD = (deposit, apy, termMonths) => {
  const principal = Math.max(0, Number(deposit) || 0);
  const months = Math.max(1, Math.floor(Number(termMonths) || 1));
  const monthlyRate = Math.max(0, Number(apy) || 0) / 100 / 12;
  const maturityValue = principal * Math.pow(1 + monthlyRate, months);
  const interestEarned = Math.max(0, maturityValue - principal);
  return { maturityValue, interestEarned };
};

const DEFAULT_INPUTS = {
  savingsInitialDeposit: 10000,
  savingsMonthlyContribution: 500,
  savingsApy: 4.5,
  savingsYears: 5,
  cdDeposit: 15000,
  cdApy: 5.1,
  cdTermMonths: 12
};

const USSavingsCDCalculator = () => {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  useShareableState({
    values: inputs,
    defaults: DEFAULT_INPUTS,
    onRestore: (shared) =>
      setInputs((prev) => {
        const restored = { ...prev };
        Object.entries(shared).forEach(([key, raw]) => {
          restored[key] = toNumber(raw, DEFAULT_INPUTS[key]);
        });
        return restored;
      })
  });

  const savingsResult = useMemo(
    () =>
      projectSavings(
        inputs.savingsInitialDeposit,
        inputs.savingsMonthlyContribution,
        inputs.savingsApy,
        inputs.savingsYears
      ),
    [inputs.savingsInitialDeposit, inputs.savingsMonthlyContribution, inputs.savingsApy, inputs.savingsYears]
  );

  const cdResult = useMemo(
    () => projectCD(inputs.cdDeposit, inputs.cdApy, inputs.cdTermMonths),
    [inputs.cdDeposit, inputs.cdApy, inputs.cdTermMonths]
  );

  const summaryLines = [
    `Savings projection ending balance: ${formatUSD(savingsResult.endingBalance)}`,
    `Savings interest earned: ${formatUSD(savingsResult.interestEarned)}`,
    `CD maturity value: ${formatUSD(cdResult.maturityValue)}`,
    `CD interest earned: ${formatUSD(cdResult.interestEarned)}`
  ];

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <Head>
        <title>US Savings & CD Calculator | APY Growth and Maturity | Upaman</title>
        <meta
          name="description"
          content="Free US savings and CD calculator. Project high-yield savings growth with monthly contributions and estimate CD maturity value by APY and term."
        />
        <meta
          name="keywords"
          content="US savings calculator, CD calculator USA, APY calculator, high yield savings calculator, certificate of deposit maturity calculator"
        />
        <link rel="canonical" href="https://upaman.com/us-savings-cd-calculator" />
        <meta property="og:title" content="US Savings & CD Calculator | Upaman" />
        <meta
          property="og:description"
          content="Estimate savings growth and CD maturity value using APY and contribution assumptions."
        />
        <meta property="og:url" content="https://upaman.com/us-savings-cd-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Savings & CD Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Compare APY-based savings growth and CD maturity outcomes with practical assumptions."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: SAVINGS_CD_FAQS.map((item) => ({
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
        title="US Savings & CD Calculator"
        subtitle="Project high-yield savings growth and CD maturity outcomes side by side."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted dark:text-slate-400">Savings projection</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="s-init" label="Initial deposit" prefix="$" value={inputs.savingsInitialDeposit} onChange={(v) => set('savingsInitialDeposit', v)} />
              <NumberField id="s-mon" label="Monthly contribution" prefix="$" value={inputs.savingsMonthlyContribution} onChange={(v) => set('savingsMonthlyContribution', v)} />
              <NumberField id="s-apy" label="Savings APY" suffix="%" step={0.01} value={inputs.savingsApy} onChange={(v) => set('savingsApy', v)} />
              <NumberField id="s-yrs" label="Horizon" suffix="yrs" min={1} max={40} value={inputs.savingsYears} onChange={(v) => set('savingsYears', v)} />
            </div>
            <p className="mb-3 mt-5 text-xs font-bold uppercase tracking-wide text-ink-muted dark:text-slate-400">Certificate of deposit</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="cd-dep" label="CD deposit" prefix="$" value={inputs.cdDeposit} onChange={(v) => set('cdDeposit', v)} />
              <NumberField id="cd-apy" label="CD APY" suffix="%" step={0.01} value={inputs.cdApy} onChange={(v) => set('cdApy', v)} />
              <NumberField id="cd-term" label="CD term" suffix="mo" min={1} max={120} value={inputs.cdTermMonths} onChange={(v) => set('cdTermMonths', v)} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Savings ending balance" value={formatUSD(savingsResult.endingBalance)} emphasis tone="positive" />
              <ResultStat label="Savings interest earned" value={formatUSD(savingsResult.interestEarned)} />
              <ResultStat label="CD maturity value" value={formatUSD(cdResult.maturityValue)} />
              <ResultStat label="CD interest earned" value={formatUSD(cdResult.interestEarned)} />
            </div>

            <Card className="p-5">
              <div className="space-y-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <p><strong className="font-semibold text-ink dark:text-white">Total savings contributions:</strong> {formatUSD(savingsResult.totalContributed)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">Savings projection period:</strong> {savingsResult.months} months</p>
              </div>
            </Card>

            <div className="grid gap-5 sm:grid-cols-2">
              <Card className="p-5">
                <PieBreakdownChart
                  title="Savings growth composition"
                  items={[
                    { label: 'Total contributed', value: savingsResult.totalContributed, color: '#3b82f6' },
                    { label: 'Interest earned', value: savingsResult.interestEarned, color: '#10b981' }
                  ]}
                  formatter={formatUSD}
                />
              </Card>
              <Card className="p-5">
                <PieBreakdownChart
                  title="CD maturity composition"
                  items={[
                    { label: 'CD principal', value: Math.max(0, Number(inputs.cdDeposit) || 0), color: '#8b5cf6' },
                    { label: 'CD interest', value: cdResult.interestEarned, color: '#f97316' }
                  ]}
                  formatter={formatUSD}
                />
              </Card>
            </div>

            <Card className="p-5">
              <ComparisonBars
                title="Ending value comparison"
                items={[
                  { label: 'Savings ending balance', value: savingsResult.endingBalance, color: '#3b82f6' },
                  { label: 'CD maturity value', value: cdResult.maturityValue, color: '#8b5cf6' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <ResultActions title="US Savings & CD Calculator Summary" summaryLines={summaryLines} fileName="us-savings-cd-calculator-summary.txt" />
          </div>
        </div>

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">What steady saving at a real yield actually produces</h2>
            <p>
              The savings projection answers the unglamorous question that matters most: what does showing up monthly
              do? On the defaults — $10,000 to start, $500 added every month, 4.5% APY held for five years — the
              balance reaches <strong>$46,216.63</strong>. You put in $40,000 of that; compounding contributes
              <strong> $6,216.63</strong> without any market risk. The model compounds monthly at APY ÷ 12, crediting
              interest on the full balance including each fresh deposit.
            </p>
            <p>
              Notice the shape of the curve the table of inputs cannot show: in year one the interest is mostly earned
              by the opening $10,000; by year five, the accumulated contributions dominate. Regular deposits are what
              convert a good rate into a meaningful figure — the rate alone, on the opening $10,000, would have
              produced about $2,517 of interest over the same five years, well under half of the combined result.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">A CD is not a better savings account — it is a rate lock</h2>
            <p>
              The CD side prices a different product. Deposit $15,000 at 5.1% for 12 months and maturity brings
              <strong> $15,783.14</strong> — $783.14 of interest, known to the cent on the day you open it. That
              certainty is the point. The savings account may quote a similar rate today, but the bank can cut it next
              month; the CD cannot be repriced, only exited early at the cost of a penalty (commonly a few months of
              interest — each bank sets its own).
            </p>
            <p>
              So the choice tracks the money&rsquo;s job. An emergency fund belongs in savings, full stop — penalties
              and emergencies mix badly. A known future expense fits a CD maturing just before the date. And a lump
              sum with no fixed date can be laddered: split across staggered terms so a rung matures regularly, rolling
              each maturity into a new long rung. The ladder earns long-term rates on most of the money while keeping
              a portion perpetually close to hand.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Rate risk cuts both ways</h2>
            <p>
              The projection&rsquo;s quiet assumption is that the savings APY survives five years, and it usually will
              not. Re-run the default plan at 3.5% instead of 4.5% and the interest drops from $6,216.63 to
              $4,737.96 — a single percentage point costs <strong>about $1,479</strong> on this modest plan. When rates
              are falling, that is precisely when the CD&rsquo;s lock outperforms; when rates rise, the floating
              savings account quietly wins and the CD holder watches better offers go by. Since nobody times rate
              cycles reliably, the honest play for larger balances is the ladder&rsquo;s average rather than a single
              bet.
            </p>
            <p>
              Model both sides of your own situation: set the savings APY to what your bank pays <em>today</em> (many
              large banks still pay near zero — moving idle cash to a high-yield account is often worth hundreds of
              dollars a year before any optimization), then price the CD your bank actually offers against it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">What this estimate deliberately leaves out</h2>
            <p>
              Taxes: interest is ordinary income (Form 1099-INT), so after-tax yield is lower than the headline —
              relevant when comparing against tax-advantaged accounts. Early-withdrawal penalties on CDs are not
              modeled; neither are tiered APYs, promotional rates that expire, or minimum-balance conditions. Bank
              compounding conventions vary slightly from the monthly model used here, which is exactly the discrepancy
              APY exists to normalize. For growth involving market returns rather than bank yield, the compound
              interest calculator is the right tool.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Frequently asked questions</h2>
            <div className="space-y-3">
              {SAVINGS_CD_FAQS.map((item) => (
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
              <li><a href="/guides/cd-ladder-explained" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">CD ladders explained: lock in rates without locking up cash</a></li>
              <li><a href="/guides/apr-vs-apy" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">APR vs APY: the difference, and when each one misleads you</a></li>
            </ul>
          </section>
        </article>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Savings: initial deposit, monthly contribution, APY, and projection years',
              'CD: deposit amount, APY, and term in months'
            ]}
            formulas={[
              'Savings projection compounds monthly using APY ÷ 12',
              'CD maturity value uses compound growth for selected term',
              'Interest earned = ending value - contributed principal'
            ]}
            assumptions={[
              'Rates are assumed constant for the selected period',
              'Taxes and penalties are not modeled',
              'Actual bank compounding conventions can vary'
            ]}
            sources={[
              { label: 'FDIC - Deposit products and consumer resources', url: 'https://www.fdic.gov/resources/consumers/' },
              { label: 'Consumer Financial Protection Bureau (CFPB) - Savings resources', url: 'https://www.consumerfinance.gov/consumer-tools/' }
            ]}
          />
        </div>
      
        <HowToSection
          name="How to use the Savings & CD Calculator"
          description="Project the growth of a savings deposit or CD."
          steps={[
            { name: "Enter your deposit", text: "Type the initial amount and any regular contributions." },
            { name: "Set the APY", text: "Enter the annual percentage yield." },
            { name: "Choose the term", text: "Set how long the money stays invested." },
            { name: "Review the result", text: "See the maturity value and total interest earned." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default USSavingsCDCalculator;
