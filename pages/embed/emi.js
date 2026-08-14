import React, { useState, useMemo } from 'react';
import Head from 'next/head';

const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n || 0));

const box = { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', maxWidth: '480px', margin: '0 auto', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxSizing: 'border-box' };
const label = { display: 'block', fontWeight: 600, fontSize: '0.82rem', margin: '10px 0 4px', color: '#0f2a43' };
const input = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' };
const resultRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', borderBottom: '1px dashed #e2e8f0' };

const calcEMI = (P, annualRate, years) => {
  const r = (Number(annualRate) || 0) / 12 / 100;
  const n = (Number(years) || 0) * 12;
  const p = Number(P) || 0;
  if (n <= 0) return { emi: 0, total: 0, interest: 0, principal: p, n };
  if (r === 0) return { emi: p / n, total: p, interest: 0, principal: p, n };
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  return { emi, total, interest: total - p, principal: p, n };
};

export default function EmiEmbedWidget() {
  const [amount, setAmount] = useState(3000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const res = useMemo(() => calcEMI(amount, rate, years), [amount, rate, years]);

  return (
    <>
      <Head>
        <title>EMI Calculator Widget | Upaman</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: '8px', background: 'transparent' }}>
        <div style={box}>
          <div style={{ fontWeight: 700, color: '#1d4e89', fontSize: '1.05rem' }}>EMI Calculator</div>

          <label style={label}>Loan amount (₹)</label>
          <input style={input} type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Interest rate (% p.a.)</label>
              <input style={input} type="number" min="0" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Tenure (years)</label>
              <input style={input} type="number" min="0" value={years} onChange={(e) => setYears(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Monthly EMI</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2a43' }}>{inr(res.emi)}</div>
            <div style={{ marginTop: '8px' }}>
              <div style={resultRow}><span>Principal</span><span>{inr(res.principal)}</span></div>
              <div style={resultRow}><span>Total interest</span><span>{inr(res.interest)}</span></div>
              <div style={{ ...resultRow, borderBottom: 'none', fontWeight: 700 }}><span>Total payable</span><span>{inr(res.total)}</span></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#6b7280' }}>
            Powered by{' '}
            <a href="https://upaman.com/loan-calculator" target="_blank" rel="noopener" style={{ color: '#1d4e89', fontWeight: 600 }}>
              Upaman EMI Calculator
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
