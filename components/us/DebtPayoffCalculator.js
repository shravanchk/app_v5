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
import { useShareableState, encodeRows, decodeRows, toNumber } from '../../utils/shareableState';

const MAX_MONTHS = 600;

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

const formatDuration = (months) => {
  if (!months || months < 1) return '0 months';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} month${rem === 1 ? '' : 's'}`;
  if (rem === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'} ${rem} month${rem === 1 ? '' : 's'}`;
};

// All figures computed with this page's own simulation on the default inputs:
// $9,000 card @ 24% (min $220), $3,000 personal loan @ 11% (min $90),
// $14,000 car loan @ 7% (min $320), $250/month extra.
const DEBT_PAYOFF_FAQS = [
  {
    q: 'What is the debt avalanche method?',
    a: 'Pay the minimum on every debt, and send every extra dollar to the debt with the highest interest rate. When it clears, its entire payment rolls into the next-highest rate. Because expensive debt dies first, the avalanche always produces the lowest total interest — on the default example here it costs $4,853 in interest versus $5,455 for the snowball, a $602 saving on the same monthly budget.'
  },
  {
    q: 'What is the debt snowball method?',
    a: 'Pay the minimum on every debt, and send every extra dollar to the smallest balance. On the default example the $3,000 personal loan is gone in 10 months — a fast, visible win — while the avalanche user waits 25 months for their first cleared debt. The cost of that motivation is modest extra interest, because the high-APR card waits longer.'
  },
  {
    q: 'Avalanche or snowball — which should I choose?',
    a: 'Mathematically, avalanche — it always minimizes interest. Behaviorally, the snowball has a real track record: research on debt repayment finds people are more likely to persist when they clear accounts early. The honest rule: if you are confident you will stick to the plan, take the avalanche; if past attempts fizzled, the snowball\'s early wins are cheap insurance. On this page\'s defaults the difference is $602 over three years — staying on any plan matters far more than which one.'
  },
  {
    q: 'Why does the payoff accelerate over time?',
    a: 'Two reasons. Within each debt, a fixed payment covers less interest each month as the balance falls, so more hits principal. Across debts, every payoff rolls its full payment into the next target — the plan\'s total monthly outlay never shrinks. On the defaults, the final debt is attacked with the entire $880 a month, which is why all three debts clear in 3 years despite $26,000 of starting balances.'
  },
  {
    q: 'Should I save or invest before paying off debt?',
    a: 'Keep a small emergency buffer first (even $1,000) so a surprise expense does not become new debt, and capture any employer retirement match — that is an instant 50–100% return. Beyond those two, paying down a 24% APR card is a guaranteed, tax-free 24% return; almost no investment beats it. Low-rate debt (a 3% car loan) is a closer call, and many people reasonably invest instead.'
  },
  {
    q: 'What if my minimum payments barely cover the interest?',
    a: 'The simulator flags this: if a debt\'s payment cannot outrun its monthly interest, the balance grows and the plan never completes. The fixes are structural, not motivational — negotiate a lower APR or hardship plan, consolidate at a lower rate, or increase the extra payment until every balance trends down.'
  }
];

const DEFAULT_DEBTS = [
  { id: 1, name: 'Credit card', balance: 9000, apr: 24, minPayment: 220 },
  { id: 2, name: 'Personal loan', balance: 3000, apr: 11, minPayment: 90 },
  { id: 3, name: 'Car loan', balance: 14000, apr: 7, minPayment: 320 }
];

const simulateStrategy = (debts, extraPayment, strategy) => {
  const state = debts
    .map((d) => ({
      id: d.id,
      name: d.name || 'Debt',
      bal: Math.max(0, Number(d.balance) || 0),
      apr: Math.max(0, Number(d.apr) || 0),
      minPayment: Math.max(0, Number(d.minPayment) || 0),
      paidOffMonth: null,
      interestPaid: 0
    }))
    .filter((d) => d.bal > 0);
  if (!state.length) return { months: 0, totalInterest: 0, order: [], isUnpayable: false };

  const totalBudget = state.reduce((s, d) => s + d.minPayment, 0) + Math.max(0, Number(extraPayment) || 0);
  let month = 0;
  let totalInterest = 0;

  while (state.some((d) => d.bal > 0.01) && month < MAX_MONTHS) {
    month += 1;
    let budget = totalBudget;

    // 1) interest accrues on every open balance
    for (const d of state) {
      if (d.bal > 0.01) {
        const interest = (d.bal * d.apr) / 100 / 12;
        d.bal += interest;
        d.interestPaid += interest;
        totalInterest += interest;
      }
    }
    // 2) minimums on every open debt
    for (const d of state) {
      if (d.bal > 0.01) {
        const pay = Math.min(d.bal, d.minPayment, budget);
        d.bal -= pay;
        budget -= pay;
        if (d.bal <= 0.01 && d.paidOffMonth === null) d.paidOffMonth = month;
      }
    }
    // 3) everything left goes to the strategy's target, then the next
    const targets = state
      .filter((d) => d.bal > 0.01)
      .sort((a, b) => (strategy === 'avalanche' ? b.apr - a.apr : a.bal - b.bal));
    for (const d of targets) {
      if (budget <= 0.005) break;
      const pay = Math.min(d.bal, budget);
      d.bal -= pay;
      budget -= pay;
      if (d.bal <= 0.01 && d.paidOffMonth === null) d.paidOffMonth = month;
    }
  }

  const isUnpayable = state.some((d) => d.bal > 0.01);
  return {
    months: month,
    totalInterest,
    isUnpayable,
    order: state
      .filter((d) => d.paidOffMonth !== null)
      .sort((a, b) => a.paidOffMonth - b.paidOffMonth)
      .map((d) => ({ name: d.name, month: d.paidOffMonth, interestPaid: d.interestPaid }))
  };
};

const textInputCls =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
const labelCls = 'block text-xs font-medium text-ink-muted dark:text-slate-400';

const DEBT_FIELDS = ['name', 'balance', 'apr', 'minPayment'];
const MAX_SHARED_DEBTS = 12;

const SHARE_DEFAULTS = { debts: encodeRows(DEFAULT_DEBTS, DEBT_FIELDS), extra: 250 };

const DebtPayoffCalculator = () => {
  const [debts, setDebts] = useState(DEFAULT_DEBTS);
  const [extraPayment, setExtraPayment] = useState(250);
  const [nextId, setNextId] = useState(4);

  useShareableState({
    values: { debts: encodeRows(debts, DEBT_FIELDS), extra: extraPayment },
    defaults: SHARE_DEFAULTS,
    onRestore: (shared) => {
      if ('extra' in shared) setExtraPayment(toNumber(shared.extra, 250));
      if (!('debts' in shared)) return;

      const rows = decodeRows(shared.debts, DEBT_FIELDS, MAX_SHARED_DEBTS);
      if (!rows.length) return;

      // Ids are positional and only used as React keys and row handles, so they
      // are reissued here rather than carried through the URL.
      setDebts(
        rows.map((row, index) => ({
          id: index + 1,
          name: row.name || `Debt ${index + 1}`,
          balance: toNumber(row.balance, 0),
          apr: toNumber(row.apr, 0),
          minPayment: toNumber(row.minPayment, 0)
        }))
      );
      setNextId(rows.length + 1);
    }
  });

  const setDebt = (id, field, value) =>
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  const addDebt = () => {
    setDebts((prev) => [...prev, { id: nextId, name: `Debt ${prev.length + 1}`, balance: 5000, apr: 10, minPayment: 100 }]);
    setNextId((n) => n + 1);
  };
  const removeDebt = (id) => setDebts((prev) => prev.filter((d) => d.id !== id));

  const avalanche = useMemo(() => simulateStrategy(debts, extraPayment, 'avalanche'), [debts, extraPayment]);
  const snowball = useMemo(() => simulateStrategy(debts, extraPayment, 'snowball'), [debts, extraPayment]);

  const totalBalance = debts.reduce((s, d) => s + (Number(d.balance) || 0), 0);
  const totalBudget = debts.reduce((s, d) => s + (Number(d.minPayment) || 0), 0) + (Number(extraPayment) || 0);
  const interestDelta = Math.max(0, snowball.totalInterest - avalanche.totalInterest);
  const unpayable = avalanche.isUnpayable || snowball.isUnpayable;

  const summaryLines = [
    `Total debt: ${formatUSD(totalBalance)} across ${debts.length} debts, ${formatUSD(totalBudget)}/month budget`,
    `Avalanche (highest APR first): debt-free in ${formatDuration(avalanche.months)}, ${formatUSD(avalanche.totalInterest)} interest`,
    `Snowball (smallest balance first): debt-free in ${formatDuration(snowball.months)}, ${formatUSD(snowball.totalInterest)} interest`,
    `Avalanche saves ${formatUSD(interestDelta)} vs snowball`
  ];

  return (
    <>
      <Head>
        <title>Debt Payoff Calculator | Snowball vs Avalanche Planner | Upaman</title>
        <meta
          name="description"
          content="Plan your way out of multiple debts: compare the snowball and avalanche methods on your actual balances, see your debt-free date, payoff order, and the interest each strategy costs."
        />
        <meta
          name="keywords"
          content="debt payoff calculator, debt snowball calculator, debt avalanche calculator, debt free date calculator, pay off debt planner"
        />
        <link rel="canonical" href="https://upaman.com/debt-payoff-calculator" />
        <meta property="og:title" content="Debt Payoff Calculator: Snowball vs Avalanche | Upaman" />
        <meta property="og:description" content="Enter your debts once and see both payoff strategies side by side — debt-free date, payoff order, and total interest." />
        <meta property="og:url" content="https://upaman.com/debt-payoff-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Debt Payoff Calculator: Snowball vs Avalanche | Upaman" />
        <meta name="twitter:description" content="Compare debt snowball and avalanche on your real balances." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: DEBT_PAYOFF_FAQS.map((item) => ({
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
        title="Debt Payoff Calculator: Snowball vs Avalanche"
        subtitle="List your debts once and compare both payoff strategies — debt-free date, payoff order, and what each costs in interest."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              {debts.map((d) => (
                <div key={d.id} className="rounded-xl border border-slate-200/70 p-3 dark:border-slate-700/70">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className={labelCls} htmlFor={`name-${d.id}`}>Debt name</label>
                      <input id={`name-${d.id}`} type="text" value={d.name} onChange={(e) => setDebt(d.id, 'name', e.target.value)} className={textInputCls} />
                    </div>
                    {debts.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeDebt(d.id)}
                        aria-label={`Remove ${d.name}`}
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-900/20"
                      >
                        ✕
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <NumberField id={`bal-${d.id}`} label="Balance" prefix="$" value={d.balance} onChange={(v) => setDebt(d.id, 'balance', v)} />
                    <NumberField id={`apr-${d.id}`} label="APR" suffix="%" step={0.1} value={d.apr} onChange={(v) => setDebt(d.id, 'apr', v)} />
                    <NumberField id={`min-${d.id}`} label="Min / month" prefix="$" step={5} value={d.minPayment} onChange={(v) => setDebt(d.id, 'minPayment', v)} />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addDebt}
                className="w-full rounded-lg border border-dashed border-brand-300 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/20"
              >
                + Add another debt
              </button>
              <NumberField id="extra" label="Extra payment per month (on top of minimums)" prefix="$" step={25} value={extraPayment} onChange={setExtraPayment} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {unpayable ? (
              <Card className="border-rose-300 p-5 dark:border-rose-800">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                  This plan never finishes: at least one balance grows faster than its payments. Increase the extra
                  payment or the minimums until every debt trends down — or see the consolidation note below.
                </p>
              </Card>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Debt-free (avalanche)" value={formatDuration(avalanche.months)} emphasis tone="positive" />
              <ResultStat label="Debt-free (snowball)" value={formatDuration(snowball.months)} />
              <ResultStat label="Interest — avalanche" value={formatUSD(avalanche.totalInterest)} tone="positive" />
              <ResultStat label="Interest — snowball" value={formatUSD(snowball.totalInterest)} />
            </div>

            <Card className="p-5">
              <p className="text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <strong className="font-semibold text-ink dark:text-white">
                  Avalanche saves {formatUSD(interestDelta)} in interest
                </strong>{' '}
                on your numbers, on the same {formatUSD(totalBudget)}/month budget. The snowball clears its first debt{' '}
                {snowball.order.length && avalanche.order.length
                  ? `in month ${snowball.order[0].month} (vs month ${avalanche.order[0].month} for the avalanche)`
                  : 'sooner'}{' '}
                — choose it if early wins keep you on the plan.
              </p>
            </Card>

            <div className="grid gap-5 sm:grid-cols-2">
              {[{ label: 'Avalanche payoff order', plan: avalanche }, { label: 'Snowball payoff order', plan: snowball }].map(({ label, plan }) => (
                <Card key={label} className="p-5">
                  <h3 className="text-sm font-semibold text-ink dark:text-white">{label}</h3>
                  <ol className="mt-2 space-y-1.5 text-sm text-ink-soft dark:text-slate-300">
                    {plan.order.map((d, i) => (
                      <li key={`${d.name}-${i}`}>
                        {i + 1}. <strong className="text-ink dark:text-white">{d.name}</strong> — cleared month {d.month}{' '}
                        ({formatUSD(d.interestPaid)} interest)
                      </li>
                    ))}
                  </ol>
                </Card>
              ))}
            </div>

            <Card className="p-5">
              <ComparisonBars
                title="Total interest by strategy"
                items={[
                  { label: 'Snowball', value: snowball.totalInterest, color: '#f97316' },
                  { label: 'Avalanche', value: avalanche.totalInterest, color: '#10b981' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <ResultActions title="Debt Payoff Plan Summary" summaryLines={summaryLines} fileName="debt-payoff-plan.txt" />
          </div>
        </div>

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">One budget, two orders of attack</h2>
            <p>
              Every serious payoff plan starts the same way: pay the minimum on everything, then concentrate all
              remaining firepower on <em>one</em> debt at a time. The only disagreement is the order. The{' '}
              <strong>avalanche</strong> targets the highest APR first because expensive debt does the most damage per
              month it survives. The <strong>snowball</strong> targets the smallest balance first because a debt you
              can actually watch die keeps you on the plan. Both roll each cleared debt&rsquo;s payment into the next
              target — the total monthly outlay never drops, which is where the acceleration comes from.
            </p>
            <p>
              On this page&rsquo;s default example — a $9,000 card at 24%, a $3,000 personal loan at 11%, and a
              $14,000 car loan at 7%, with $250 extra on top of $630 in minimums — both plans finish in{' '}
              <strong>3 years</strong>. The avalanche pays <strong>$4,853</strong> of interest, the snowball{' '}
              <strong>$5,455</strong>. That $602 gap is the entire mathematical debate; everything else is psychology.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Why the snowball survives contact with real life</h2>
            <p>
              The snowball&rsquo;s pitch is visible in the payoff-order panels above: on the defaults it kills the
              personal loan in <strong>month 10</strong>, while the avalanche user stares at three open balances until{' '}
              <strong>month 25</strong>. Fifteen months without a single win is where plans quietly die — the research
              on debt repayment consistently finds that closing accounts early predicts finishing the whole program.
              If your history says motivation is the binding constraint, $602 over three years is a cheap price for a
              plan you complete. If the math alone keeps you going, take the avalanche and bank the difference.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">The two moves that beat both strategies</h2>
            <p>
              Payoff order optimizes the interest you&rsquo;ve agreed to pay; two structural moves shrink it instead.
              First, <strong>rate reduction</strong>: a 0% balance-transfer window or a consolidation loan at half the
              APR outperforms any ordering trick — provided the fee is smaller than the interest saved and the freed-up
              card doesn&rsquo;t refill (see the <a href="/us-credit-card-payoff-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">single-card payoff calculator</a>{' '}
              for what your current APR costs as the baseline any offer must beat). Second, <strong>raising the
              extra payment</strong>: on the defaults, moving from $250 to $350 extra saves more interest than switching
              strategies ever could. The strategy choice is worth minutes of thought; the budget line deserves the
              hours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Reading the projection honestly</h2>
            <p>
              The simulation assumes constant APRs, no new borrowing, and minimum payments that stay at today&rsquo;s
              dollar amounts (real card minimums shrink with the balance — which stretches payoff further, so treating
              them as fixed is the conservative, plan-friendly reading). It also assumes the extra payment shows up
              every single month, which is the real test of any debt plan. If the unpayable warning appears, no
              ordering fixes it — the budget or the rates have to change first.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Frequently asked questions</h2>
            <div className="space-y-3">
              {DEBT_PAYOFF_FAQS.map((item) => (
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
              <li><a href="/guides/50-30-20-rule" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">The 50/30/20 rule — finding the extra payment</a></li>
              <li><a href="/guides/credit-card-minimum-due-trap" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">The credit card minimum due trap</a></li>
            </ul>
          </section>
        </article>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Each debt: balance, APR, and fixed monthly minimum payment',
              'One extra monthly payment applied on top of all minimums'
            ]}
            formulas={[
              'Interest accrues monthly at APR ÷ 12 per debt',
              'Each month: minimums on every debt, then the full remainder to the strategy target (highest APR for avalanche, smallest balance for snowball)',
              'Cleared debts roll their payment into the pool — total monthly outlay stays constant until debt-free'
            ]}
            assumptions={[
              'APRs constant; no new borrowing or fees during payoff',
              'Minimum payments modeled as fixed dollar amounts',
              'Simulation caps at 50 years and flags plans whose balances grow'
            ]}
            sources={[
              { label: 'CFPB — How to reduce your debt', url: 'https://www.consumerfinance.gov/ask-cfpb/what-are-some-strategies-to-pay-down-or-pay-off-debt-en-1298/' },
              { label: 'Federal Trade Commission — Getting out of debt', url: 'https://consumer.ftc.gov/articles/getting-out-debt' }
            ]}
          />
        </div>

        <HowToSection
          name="How to use the Debt Payoff Calculator"
          description="Compare snowball and avalanche payoff plans on your real debts."
          steps={[
            { name: 'List every debt', text: 'Enter each balance, its APR, and the monthly minimum payment.' },
            { name: 'Set your extra payment', text: 'Add what you can pay above the combined minimums each month.' },
            { name: 'Compare the strategies', text: 'Review debt-free dates, payoff order, and total interest side by side.' },
            { name: 'Pick and automate', text: 'Choose the order you will actually stick to and automate the payments.' }
          ]}
        />
      </CalcLayout>
    </>
  );
};

export default DebtPayoffCalculator;
