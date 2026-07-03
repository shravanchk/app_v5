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

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

const US401kCalculator = () => {
  const [inputs, setInputs] = useState({
    currentAge: 32,
    retirementAge: 65,
    currentBalance: 45000,
    annualSalary: 90000,
    employeeContributionPercent: 10,
    employerMatchPercent: 50,
    employerMatchCapPercent: 6,
    annualReturn: 7,
    annualSalaryGrowth: 3
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
      </Head>

      <CalcLayout
        eyebrow="United States"
        title="US 401(k) Calculator"
        subtitle="Project your retirement balance with employee contributions, employer match, and long-term growth assumptions."
      >
        <div className="grid gap-5 lg:grid-cols-5">
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
