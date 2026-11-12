import React, { useState, useMemo } from 'react';
import Head from 'next/head';
const { calculateIndianIncomeTax } = require('../../utils/taxCalculations');

const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n || 0));

const box = { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', maxWidth: '480px', margin: '0 auto', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxSizing: 'border-box' };
const label = { display: 'block', fontWeight: 600, fontSize: '0.82rem', margin: '10px 0 4px', color: '#0f2a43' };
const input = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' };
const resultRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', borderBottom: '1px dashed #e2e8f0' };

const NEW_STD = 75000;
const OLD_STD = 50000;

// Both regimes side by side for a salaried individual below 60, FY 2026-27.
export default function IncomeTaxEmbedWidget() {
  const [salary, setSalary] = useState(1500000);
  const [deductions, setDeductions] = useState(150000);
  const res = useMemo(() => {
    const s = Number(salary) || 0;
    const d = Number(deductions) || 0;
    const n = calculateIndianIncomeTax(Math.max(0, s - NEW_STD), 'new');
    const o = calculateIndianIncomeTax(Math.max(0, s - OLD_STD - d), 'old');
    return { newTax: n.totalTax, oldTax: o.totalTax, better: n.totalTax <= o.totalTax ? 'New regime' : 'Old regime', monthly: (s - Math.min(n.totalTax, o.totalTax)) / 12 };
  }, [salary, deductions]);

  return (
    <>
      <Head>
        <title>Income Tax Calculator Widget | Upaman</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: '8px', background: 'transparent' }}>
        <div style={box}>
          <div style={{ fontWeight: 700, color: '#1d4e89', fontSize: '1.05rem' }}>Income Tax Calculator FY 2026-27</div>

          <label style={label}>Annual salary (₹)</label>
          <input style={input} type="number" min="0" step="50000" value={salary} onChange={(e) => setSalary(e.target.value)} />

          <label style={label}>Old-regime deductions: 80C, 80D, HRA, home loan (₹)</label>
          <input style={input} type="number" min="0" step="10000" value={deductions} onChange={(e) => setDeductions(e.target.value)} />

          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Lower tax with the {res.better.toLowerCase()}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2a43' }}>{inr(Math.min(res.newTax, res.oldTax))} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#475569' }}>per year</span></div>
            <div style={{ marginTop: '8px' }}>
              <div style={resultRow}><span>New regime (₹75,000 standard deduction)</span><span>{inr(res.newTax)}</span></div>
              <div style={resultRow}><span>Old regime (₹50,000 + your deductions)</span><span>{inr(res.oldTax)}</span></div>
              <div style={{ ...resultRow, borderBottom: 'none', fontWeight: 700 }}><span>Monthly in hand after tax</span><span>{inr(res.monthly)}</span></div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '6px' }}>Resident below 60, includes 4% cess, excludes surcharge and EPF.</div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#6b7280' }}>
            Powered by{' '}
            <a href="https://upaman.com/income-tax-calculator" target="_blank" rel="noopener" style={{ color: '#1d4e89', fontWeight: 600 }}>
              Upaman Income Tax Calculator
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
