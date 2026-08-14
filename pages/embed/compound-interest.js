import React, { useState, useMemo } from 'react';
import Head from 'next/head';

const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n || 0));

const box = { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', maxWidth: '480px', margin: '0 auto', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxSizing: 'border-box' };
const label = { display: 'block', fontWeight: 600, fontSize: '0.82rem', margin: '10px 0 4px', color: '#0f2a43' };
const input = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' };
const resultRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', borderBottom: '1px dashed #e2e8f0' };

// Monthly compounding; contributions added at the end of each month.
const project = (initial, monthly, annualRate, years) => {
  const p = Number(initial) || 0;
  const c = Number(monthly) || 0;
  const r = (Number(annualRate) || 0) / 100 / 12;
  const n = Math.max(0, Math.round((Number(years) || 0) * 12));
  let balance = p;
  for (let i = 0; i < n; i++) balance = balance * (1 + r) + c;
  const contributed = p + c * n;
  return { balance, contributed, interest: balance - contributed };
};

export default function CompoundInterestEmbedWidget() {
  const [initial, setInitial] = useState(5000);
  const [monthly, setMonthly] = useState(200);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);
  const res = useMemo(() => project(initial, monthly, rate, years), [initial, monthly, rate, years]);

  return (
    <>
      <Head>
        <title>Compound Interest Calculator Widget | Upaman</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: '8px', background: 'transparent' }}>
        <div style={box}>
          <div style={{ fontWeight: 700, color: '#1d4e89', fontSize: '1.05rem' }}>Compound Interest Calculator</div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Initial deposit ($)</label>
              <input style={input} type="number" min="0" value={initial} onChange={(e) => setInitial(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Monthly contribution ($)</label>
              <input style={input} type="number" min="0" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Annual return (%)</label>
              <input style={input} type="number" min="0" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Years</label>
              <input style={input} type="number" min="0" value={years} onChange={(e) => setYears(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Future value ({years || 0} years, compounded monthly)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2a43' }}>{usd(res.balance)}</div>
            <div style={{ marginTop: '8px' }}>
              <div style={resultRow}><span>Total contributed</span><span>{usd(res.contributed)}</span></div>
              <div style={{ ...resultRow, borderBottom: 'none', fontWeight: 700 }}><span>Interest earned</span><span>{usd(res.interest)}</span></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#6b7280' }}>
            Powered by{' '}
            <a href="https://upaman.com/compound-interest-calculator" target="_blank" rel="noopener" style={{ color: '#1d4e89', fontWeight: 600 }}>
              Upaman Compound Interest Calculator
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
