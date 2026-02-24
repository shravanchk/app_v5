import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
import { formatCurrency } from '../utils/calculations';

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('dark-theme', localStorage.getItem('theme') === 'dark');
    }
  }, []);

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

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="calculator-container sip-container">
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

      <div className="calculator-card">
        <div className="calculator-header sip-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <h1 className="header-title">US 401(k) Calculator</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Project retirement balance with employee contribution, employer match, and long-term growth assumptions.
          </p>
        </div>

        <div className="mobile-card-content">
          <div className="input-section" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">Retirement Inputs</h2>
            <div className="responsive-grid" style={{ alignItems: 'end' }}>
              <div>
                <label className="input-label">Current Age</label>
                <input className="calculator-input" type="number" min="18" max="80" value={inputs.currentAge} onChange={(e) => handleInputChange('currentAge', Number(e.target.value) || 18)} />
              </div>
              <div>
                <label className="input-label">Retirement Age</label>
                <input className="calculator-input" type="number" min="19" max="85" value={inputs.retirementAge} onChange={(e) => handleInputChange('retirementAge', Number(e.target.value) || 65)} />
              </div>
              <div>
                <label className="input-label">Current 401(k) Balance ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.currentBalance} onChange={(e) => handleInputChange('currentBalance', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Annual Salary ($)</label>
                <input className="calculator-input" type="number" min="0" value={inputs.annualSalary} onChange={(e) => handleInputChange('annualSalary', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Your Contribution (% of salary)</label>
                <input className="calculator-input" type="number" min="0" step="0.1" value={inputs.employeeContributionPercent} onChange={(e) => handleInputChange('employeeContributionPercent', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Employer Match (% of your contribution)</label>
                <input className="calculator-input" type="number" min="0" step="1" value={inputs.employerMatchPercent} onChange={(e) => handleInputChange('employerMatchPercent', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Employer Match Cap (% salary)</label>
                <input className="calculator-input" type="number" min="0" step="0.1" value={inputs.employerMatchCapPercent} onChange={(e) => handleInputChange('employerMatchCapPercent', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Expected Annual Return (%)</label>
                <input className="calculator-input" type="number" min="0" step="0.1" value={inputs.annualReturn} onChange={(e) => handleInputChange('annualReturn', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Expected Salary Growth (%/year)</label>
                <input className="calculator-input" type="number" min="0" step="0.1" value={inputs.annualSalaryGrowth} onChange={(e) => handleInputChange('annualSalaryGrowth', Number(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div className="results-container" style={{ borderColor: '#1d4e89', background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)' }}>
            <h2 className="results-title" style={{ color: '#0f2a43' }}>Retirement Projection</h2>
            <div className="responsive-grid" style={{ marginBottom: '1.2rem' }}>
              <div className="result-item">
                <div className="result-label">Projected Balance</div>
                <div className="result-value total">{formatUSD(results.projectedBalance)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Your Contributions</div>
                <div className="result-value emi">{formatUSD(results.totalEmployeeContrib)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Employer Contributions</div>
                <div className="result-value principal">{formatUSD(results.totalEmployerContrib)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Estimated Growth</div>
                <div className="result-value interest">{formatUSD(results.investmentGrowth)}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 0.35rem 0' }}>
                <strong>4% rule estimate:</strong> {formatUSD(results.fourPercentRuleAnnual)} per year
              </p>
              <p style={{ margin: 0 }}>
                <strong>4% rule monthly equivalent:</strong> {formatUSD(results.fourPercentRuleMonthly)}
              </p>
            </div>
          </div>

          {!!rows.length && (
            <div className="responsive-table-container" style={{ marginBottom: '1.5rem' }}>
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Age</th>
                    <th>Salary</th>
                    <th>Employee</th>
                    <th>Employer</th>
                    <th>Growth</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.age}>
                      <td>{row.age}</td>
                      <td>{formatUSD(row.salary)}</td>
                      <td>{formatUSD(row.employeeContrib)}</td>
                      <td>{formatUSD(row.employerContrib)}</td>
                      <td>{formatUSD(row.growth)}</td>
                      <td>{formatUSD(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {results.projection.length > 12 && (
            <button
              type="button"
              className="result-action-button"
              onClick={() => setShowFullProjection((prev) => !prev)}
              style={{ marginBottom: '1rem' }}
            >
              {showFullProjection ? 'Show first 12 years' : `Show full ${results.projection.length}-year projection`}
            </button>
          )}

          <ResultActions title="US 401(k) Calculator Summary" summaryLines={summaryLines} fileName="us-401k-calculator-summary.txt" />

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
      </div>
    </div>
  );
};

export default US401kCalculator;
