import React, { useState, useMemo } from 'react';
import Head from 'next/head';

const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n || 0));

const box = { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', maxWidth: '480px', margin: '0 auto', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxSizing: 'border-box' };
const label = { display: 'block', fontWeight: 600, fontSize: '0.82rem', margin: '10px 0 4px', color: '#0f2a43' };
const input = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' };
const resultRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', borderBottom: '1px dashed #e2e8f0' };

// Contributions and match go in monthly; salary grows once a year. The match is
// capped as a percentage of salary, which is what makes "contribute to the cap"
// the standard advice.
const project = ({ currentAge, retirementAge, balance, salary, employeePct, matchPct, matchCapPct, annualReturn, salaryGrowth }) => {
  const years = Math.max(0, Math.round((Number(retirementAge) || 0) - (Number(currentAge) || 0)));
  const monthlyReturn = (Number(annualReturn) || 0) / 100 / 12;

  let total = Math.max(0, Number(balance) || 0);
  let pay = Math.max(0, Number(salary) || 0);
  let employeeTotal = 0;
  let employerTotal = 0;

  for (let year = 0; year < years; year += 1) {
    const employeeAnnual = pay * ((Number(employeePct) || 0) / 100);
    const matchedPct = Math.min(Number(employeePct) || 0, Number(matchCapPct) || 0);
    const employerAnnual = pay * (matchedPct / 100) * ((Number(matchPct) || 0) / 100);

    for (let month = 0; month < 12; month += 1) {
      total = total * (1 + monthlyReturn) + employeeAnnual / 12 + employerAnnual / 12;
    }

    employeeTotal += employeeAnnual;
    employerTotal += employerAnnual;
    pay *= 1 + (Number(salaryGrowth) || 0) / 100;
  }

  return { total, employeeTotal, employerTotal, growth: Math.max(0, total - employeeTotal - employerTotal - (Number(balance) || 0)) };
};

export default function US401kEmbedWidget() {
  const [currentAge, setCurrentAge] = useState(32);
  const [retirementAge, setRetirementAge] = useState(65);
  const [balance, setBalance] = useState(45000);
  const [salary, setSalary] = useState(90000);
  const [employeePct, setEmployeePct] = useState(10);
  const [matchCapPct, setMatchCapPct] = useState(6);

  const res = useMemo(
    () => project({
      currentAge, retirementAge, balance, salary, employeePct,
      matchPct: 50, matchCapPct, annualReturn: 7, salaryGrowth: 3
    }),
    [currentAge, retirementAge, balance, salary, employeePct, matchCapPct]
  );

  return (
    <>
      <Head>
        <title>401(k) Calculator Widget | Upaman</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: '8px', background: 'transparent' }}>
        <div style={box}>
          <div style={{ fontWeight: 700, color: '#1d4e89', fontSize: '1.05rem' }}>401(k) Growth Calculator</div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Current age</label>
              <input style={input} type="number" min="16" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Retirement age</label>
              <input style={input} type="number" min="17" value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Current balance ($)</label>
              <input style={input} type="number" min="0" value={balance} onChange={(e) => setBalance(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Annual salary ($)</label>
              <input style={input} type="number" min="0" value={salary} onChange={(e) => setSalary(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>You contribute (%)</label>
              <input style={input} type="number" min="0" step="0.5" value={employeePct} onChange={(e) => setEmployeePct(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Match cap (% of pay)</label>
              <input style={input} type="number" min="0" step="0.5" value={matchCapPct} onChange={(e) => setMatchCapPct(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Balance at age {retirementAge || 0} (7% return, 3% raises)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2a43' }}>{usd(res.total)}</div>
            <div style={{ marginTop: '8px' }}>
              <div style={resultRow}><span>Your contributions</span><span>{usd(res.employeeTotal)}</span></div>
              <div style={resultRow}><span>Employer match (50% up to cap)</span><span>{usd(res.employerTotal)}</span></div>
              <div style={{ ...resultRow, borderBottom: 'none', fontWeight: 700 }}><span>Investment growth</span><span>{usd(res.growth)}</span></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#6b7280' }}>
            Powered by{' '}
            <a href="https://upaman.com/us-401k-calculator" target="_blank" rel="noopener" style={{ color: '#1d4e89', fontWeight: 600 }}>
              Upaman 401(k) Calculator
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
