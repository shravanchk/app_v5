import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import { PieBreakdownChart } from '../calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField } from '../ui/Field';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/calculations';
import { useShareableState, toNumber } from '../../utils/shareableState';

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

// All figures computed with this page's own projection loop on the default
// inputs: age 32→65, $45,000 balance, $90,000 salary, 10% contribution,
// 50% match up to 6%, 7% return, 3% salary growth.
const K401_FAQS = [
  {
    q: 'How much will my 401(k) be worth at retirement?',
    a: 'It depends on contribution rate, match, return, and above all time. The default profile here — a 32-year-old with $45,000 saved, earning $90,000, contributing 10% with a 50%-up-to-6% match at a 7% return — projects about $2.44 million at 65. Of that, only $495,701 is the saver’s own money; growth contributes $1.75 million.'
  },
  {
    q: 'How does a 401(k) employer match work?',
    a: 'A common design is "50% of what you contribute, up to 6% of salary" — the default here. On a $90,000 salary, contributing at least 6% earns the full $2,700 a year of employer money in year one, rising with salary. It is a guaranteed 50% first-year return on those dollars, before any market growth.'
  },
  {
    q: 'What happens if I contribute below the match cap?',
    a: 'You permanently forfeit free money. Cutting the default contribution to 3% halves the match to $1,350 in year one, and the projected balance falls from $1.82 million (at 6%) to $1.12 million — the widening gap is both the missing dollars and their decades of lost compounding. Whatever else your budget does, contributing to the match cap is the priority.'
  },
  {
    q: 'Does this calculator enforce IRS contribution limits?',
    a: 'No — deliberately. Annual employee deferral limits and age-50 catch-up amounts change from year to year, so the model applies your chosen percentage without a cap and leaves the current figures to irs.gov. High earners with high contribution rates should check whether the modeled contribution exceeds the current limit.'
  },
  {
    q: 'What annual return should I assume?',
    a: 'The 7% default reflects a diversified, equity-heavy portfolio’s long-run expectation, not a promise — and not a smooth path. Fees come straight out of return, so a fund charging 1% more costs you exactly 1% of compounding per year. If your plan’s funds are expensive, model a lower return and consider the cheapest broad-index options available.'
  },
  {
    q: 'What is the 4% rule shown under the projection?',
    a: 'A rough sustainability heuristic: withdrawing 4% of the starting balance in the first retirement year (then adjusting for inflation) has historically survived most 30-year retirements. On the projected $2.44 million, that is about $97,592 a year. Treat it as a sanity check, not a plan — the retirement readiness workflow models the withdrawal phase properly.'
  }
];

const DEFAULT_INPUTS = {
  currentAge: 32,
  retirementAge: 65,
  currentBalance: 45000,
  annualSalary: 90000,
  employeeContributionPercent: 10,
  employerMatchPercent: 50,
  employerMatchCapPercent: 6,
  annualReturn: 7,
  annualSalaryGrowth: 3
};

const US401kCalculator = () => {
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

  const [showFullProjection, setShowFullProjection] = useState(false);

  const results = useMemo(() => {
    const currentAge = Math.max(18, Math.floor(Number(inputs.currentAge) || 18));
    const retirementAge = Math.max(currentAge + 1, Math.floor(Number(inputs.retirementAge) || currentAge + 1));
    const currentBalance = Math.max(0, Number(inputs.currentBalance) || 0);
    let salary = Math.max(0, Number(inputs.annualSalary) || 0);
    const employeeContributionPercent = Math.max(0, Number(inputs.employeeContributionPercent) || 0);
    const employerMatchPercent = Math.max(0, Number(inputs.employerMatchPercent) || 0);
    const employerMatchCapPercent = Math.max(0, Number(inputs.employerMatchCapPercent) || 0);
    const annualReturn = Math.max(0, Number(inputs.annualReturn) || 0) / 100;
    const annualSalaryGrowth = Math.max(0, Number(inputs.annualSalaryGrowth) || 0) / 100;

    const projection = [];
    let balance = currentBalance;
    let totalEmployeeContrib = 0;
    let totalEmployerContrib = 0;

    for (let age = currentAge; age < retirementAge; age += 1) {
      const openingBalance = balance;
      const employeeContrib = salary * (employeeContributionPercent / 100);
      const matchedEligiblePercent = Math.min(employeeContributionPercent, employerMatchCapPercent);
      const employerContrib = salary * (matchedEligiblePercent / 100) * (employerMatchPercent / 100);
      const annualContrib = employeeContrib + employerContrib;

      // Approximate growth assuming contributions happen through the year.
      const growth = (openingBalance + annualContrib * 0.5) * annualReturn;
      const closingBalance = openingBalance + annualContrib + growth;

      totalEmployeeContrib += employeeContrib;
      totalEmployerContrib += employerContrib;

      projection.push({
        age: age + 1,
        salary,
        openingBalance,
        employeeContrib,
        employerContrib,
        growth,
        closingBalance
      });

      balance = closingBalance;
      salary *= (1 + annualSalaryGrowth);
    }

    const projectedBalance = projection[projection.length - 1]?.closingBalance || currentBalance;
    const totalContrib = totalEmployeeContrib + totalEmployerContrib;
    const investmentGrowth = Math.max(0, projectedBalance - currentBalance - totalContrib);
    const fourPercentRuleAnnual = projectedBalance * 0.04;
    const fourPercentRuleMonthly = fourPercentRuleAnnual / 12;

    return {
      projection,
      projectedBalance,
      totalEmployeeContrib,
      totalEmployerContrib,
      totalContrib,
      investmentGrowth,
      fourPercentRuleAnnual,
      fourPercentRuleMonthly
    };
  }, [inputs]);

  const summaryLines = [
    `Projected balance at retirement: ${formatUSD(results.projectedBalance)}`,
    `Your contributions: ${formatUSD(results.totalEmployeeContrib)}`,
    `Employer contributions: ${formatUSD(results.totalEmployerContrib)}`,
    `Estimated investment growth: ${formatUSD(results.investmentGrowth)}`,
    `4% rule estimate (annual): ${formatUSD(results.fourPercentRuleAnnual)}`
  ];

  const rows = showFullProjection ? results.projection : results.projection.slice(0, 12);

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <Head>
        <title>US 401(k) Calculator | Retirement Projection with Employer Match | Upaman</title>
        <meta
          name="description"
          content="Free US 401(k) calculator to estimate retirement balance using salary growth, contribution rate, annual return and employer match assumptions."
        />
        <meta
          name="keywords"
          content="401k calculator USA, retirement calculator 401k, employer match calculator, 401k growth projection, US retirement planning"
        />
        <link rel="canonical" href="https://upaman.com/us-401k-calculator" />
        <meta property="og:title" content="US 401(k) Calculator | Upaman" />
        <meta
          property="og:description"
          content="Project your US 401(k) retirement balance with salary growth and employer match."
        />
        <meta property="og:url" content="https://upaman.com/us-401k-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US 401(k) Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Estimate retirement balance and contribution impact with a 401(k) projection model."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: K401_FAQS.map((item) => ({
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
        title="US 401(k) Calculator"
        subtitle="Project your retirement balance with employee contributions, employer match, and long-term growth assumptions."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="k-cage" label="Current age" min={18} max={80} value={inputs.currentAge} onChange={(v) => set('currentAge', v)} />
              <NumberField id="k-rage" label="Retirement age" min={19} max={85} value={inputs.retirementAge} onChange={(v) => set('retirementAge', v)} />
              <NumberField id="k-bal" label="Current 401(k) balance" prefix="$" value={inputs.currentBalance} onChange={(v) => set('currentBalance', v)} />
              <NumberField id="k-sal" label="Annual salary" prefix="$" value={inputs.annualSalary} onChange={(v) => set('annualSalary', v)} />
              <NumberField id="k-econ" label="Your contribution" suffix="%" step={0.1} value={inputs.employeeContributionPercent} onChange={(v) => set('employeeContributionPercent', v)} />
              <NumberField id="k-match" label="Employer match (of your %)" suffix="%" step={1} value={inputs.employerMatchPercent} onChange={(v) => set('employerMatchPercent', v)} />
              <NumberField id="k-cap" label="Employer match cap" suffix="%" step={0.1} value={inputs.employerMatchCapPercent} onChange={(v) => set('employerMatchCapPercent', v)} />
              <NumberField id="k-ret" label="Expected annual return" suffix="%" step={0.1} value={inputs.annualReturn} onChange={(v) => set('annualReturn', v)} />
              <NumberField id="k-grow" label="Salary growth" suffix="%/yr" step={0.1} value={inputs.annualSalaryGrowth} onChange={(v) => set('annualSalaryGrowth', v)} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Projected balance" value={formatUSD(results.projectedBalance)} emphasis tone="positive" />
              <ResultStat label="Your contributions" value={formatUSD(results.totalEmployeeContrib)} />
              <ResultStat label="Employer contributions" value={formatUSD(results.totalEmployerContrib)} />
              <ResultStat label="Estimated growth" value={formatUSD(results.investmentGrowth)} />
            </div>

            <Card className="p-5">
              <PieBreakdownChart
                title="Projected balance composition"
                items={[
                  { label: 'Starting balance', value: Math.max(0, Number(inputs.currentBalance) || 0), color: '#334155' },
                  { label: 'Your contributions', value: results.totalEmployeeContrib, color: '#3b82f6' },
                  { label: 'Employer contributions', value: results.totalEmployerContrib, color: '#14b8a6' },
                  { label: 'Investment growth', value: results.investmentGrowth, color: '#f97316' }
                ]}
                formatter={formatUSD}
              />
              <div className="mt-4 space-y-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <p><strong className="font-semibold text-ink dark:text-white">4% rule estimate:</strong> {formatUSD(results.fourPercentRuleAnnual)} per year</p>
                <p><strong className="font-semibold text-ink dark:text-white">4% rule monthly equivalent:</strong> {formatUSD(results.fourPercentRuleMonthly)}</p>
              </div>
            </Card>

            {!!rows.length && (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-muted dark:bg-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Age</th>
                        <th className="px-3 py-2 font-semibold">Salary</th>
                        <th className="px-3 py-2 font-semibold">Employee</th>
                        <th className="px-3 py-2 font-semibold">Employer</th>
                        <th className="px-3 py-2 font-semibold">Growth</th>
                        <th className="px-3 py-2 font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-ink-soft dark:divide-slate-700 dark:text-slate-300">
                      {rows.map((row) => (
                        <tr key={row.age}>
                          <td className="px-3 py-2">{row.age}</td>
                          <td className="px-3 py-2">{formatUSD(row.salary)}</td>
                          <td className="px-3 py-2">{formatUSD(row.employeeContrib)}</td>
                          <td className="px-3 py-2">{formatUSD(row.employerContrib)}</td>
                          <td className="px-3 py-2">{formatUSD(row.growth)}</td>
                          <td className="px-3 py-2 font-medium text-ink dark:text-white">{formatUSD(row.closingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {results.projection.length > 12 && (
                  <div className="border-t border-slate-100 p-3 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setShowFullProjection((prev) => !prev)}
                      className="text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300"
                    >
                      {showFullProjection ? 'Show first 12 years' : `Show full ${results.projection.length}-year projection`}
                    </button>
                  </div>
                )}
              </Card>
            )}

            <ResultActions title="US 401(k) Calculator Summary" summaryLines={summaryLines} fileName="us-401k-calculator-summary.txt" />
          </div>
        </div>

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Three engines build the balance — and one does most of the work</h2>
            <p>
              Run the default profile — 32 years old, $45,000 already saved, $90,000 salary, contributing 10% with a
              50%-up-to-6% employer match, 7% return, 3% raises — and the projection lands at about
              <strong> $2.44 million at 65</strong>. Decompose it and the hierarchy is striking: the saver&rsquo;s own
              paycheck deferrals total $495,701 over 33 years, the employer adds $148,710, and investment growth
              contributes <strong>$1.75 million — roughly 72% of the ending balance</strong>.
            </p>
            <p>
              That decomposition is the strategy. Contributions are the seed, but time invested is the fertilizer, and
              the early dollars matter disproportionately because they compound longest. It is also why cashing out a
              401(k) when changing jobs is so expensive: a mid-career withdrawal doesn&rsquo;t just remove dollars, it
              removes decades from those dollars.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">The match is the best return you will ever get</h2>
            <p>
              An employer match is a 50% (or 100%) first-year return handed out for participating. On the default
              salary, contributing at least 6% collects <strong>$2,700 of employer money in year one</strong>, and the
              amount rises with every raise. Contribute only 3% and the match halves to $1,350 — and the projection
              shows what the combination costs over a career: the balance at 65 falls from $1.82 million (contributing
              exactly to the 6% cap) to <strong>$1.12 million</strong>, a $700,000 gap built from the smaller paycheck
              deferrals, the forfeited match, and 33 years of compounding on both.
            </p>
            <p>
              The order of operations for most savers is therefore: contribute to the match cap before anything else,
              then raise the rate as the budget allows. Between the 6%-cap plan and the 10% default plan lies another
              $620,000 of projected balance — about $155,000 at retirement for every extra percentage point of salary
              contributed, on these assumptions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Reading the projection honestly</h2>
            <p>
              The year-by-year table applies your return to the opening balance plus half of each year&rsquo;s
              contributions — a standard approximation for money arriving through the year. Reality will be lumpier:
              7% is a long-run average that arrives as +20% years and −15% years, and the sequence matters more as the
              balance grows. Salary growth compounds quietly too; at 3% raises, the $90,000 salary is about $233,000
              by the final working year, which is why later-career contribution dollars look so large in the table.
            </p>
            <p>
              What the model deliberately omits: IRS deferral limits and catch-up amounts (they change yearly — check
              irs.gov if you contribute aggressively), plan fees (subtract them from your return assumption), employer
              vesting schedules, loans, and the traditional-versus-Roth tax question, which deserves its own decision
              and has a dedicated guide on this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">From balance to retirement income</h2>
            <p>
              A projected balance only matters as the income it can produce. The 4% heuristic shown with the results
              translates the default projection into roughly $97,592 of first-year withdrawals. That is a sanity
              check, not a plan: it ignores Social Security, taxes on withdrawals, and your actual expenses. To test
              whether the projected balance funds <em>your</em> lifestyle — inflated to retirement age and drawn down
              over your actual horizon — run the US retirement readiness workflow with this calculator&rsquo;s output
              as the starting corpus.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Frequently asked questions</h2>
            <div className="space-y-3">
              {K401_FAQS.map((item) => (
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
              <li><a href="/guides/traditional-vs-roth-401k" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">Traditional vs Roth 401(k): how to choose</a></li>
              <li><a href="/guides/how-much-saved-by-30-40-50" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">How much should you have saved by 30, 40, and 50?</a></li>
            </ul>
          </section>
        </article>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Age range, current balance, salary, employee contribution %, employer match, return, and salary growth',
              'Employer match applies only up to configured match cap percentage'
            ]}
            formulas={[
              'Employee contribution = salary × employee contribution %',
              'Employer contribution = salary × min(employee %, match cap %) × employer match %',
              'Annual growth estimated on opening balance plus half-year contribution timing'
            ]}
            assumptions={[
              'Contribution limits and catch-up rules are not enforced in this simplified model',
              'Returns and salary growth are constant assumptions',
              'Investment allocation and plan fees are not separately modeled'
            ]}
            sources={[
              { label: 'IRS - 401(k) retirement topics', url: 'https://www.irs.gov/retirement-plans/401k-plans' },
              { label: 'U.S. Department of Labor - Saving matters', url: 'https://www.dol.gov/general/topic/retirement/savingmatters' }
            ]}
          />
        </div>
      
        <HowToSection
          name="How to use the 401(k) Calculator"
          description="Project your 401(k) balance at retirement."
          steps={[
            { name: "Enter your salary and contribution", text: "Type your annual salary and the percentage you contribute." },
            { name: "Set the employer match", text: "Enter your employer match rate and limit." },
            { name: "Set return and timeframe", text: "Choose an expected annual return and years until retirement." },
            { name: "Review the projection", text: "See your estimated balance and total contributions at retirement." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default US401kCalculator;
