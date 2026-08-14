import React, { useState, useMemo } from 'react';
import Head from 'next/head';

const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n || 0));

const box = { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', maxWidth: '480px', margin: '0 auto', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxSizing: 'border-box' };
const label = { display: 'block', fontWeight: 600, fontSize: '0.82rem', margin: '10px 0 4px', color: '#0f2a43' };
const input = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' };
const resultRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', borderBottom: '1px dashed #e2e8f0' };

// Standard SIP future value: instalments at the start of each month (annuity due).
const projectSip = (monthly, annualRate, years) => {
  const c = Number(monthly) || 0;
  const i = (Number(annualRate) || 0) / 100 / 12;
  const n = Math.max(0, Math.round((Number(years) || 0) * 12));
  const corpus = i === 0 ? c * n : c * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const invested = c * n;
  return { corpus, invested, gains: corpus - invested };
};

export default function SipEmbedWidget() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const res = useMemo(() => projectSip(monthly, rate, years), [monthly, rate, years]);

  return (
    <>
      <Head>
        <title>SIP Calculator Widget | Upaman</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: '8px', background: 'transparent' }}>
        <div style={box}>
          <div style={{ fontWeight: 700, color: '#1d4e89', fontSize: '1.05rem' }}>SIP Calculator</div>

          <label style={label}>Monthly SIP amount (₹)</label>
          <input style={input} type="number" min="0" step="500" value={monthly} onChange={(e) => setMonthly(e.target.value)} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Expected return (% p.a.)</label>
              <input style={input} type="number" min="0" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Tenure (years)</label>
              <input style={input} type="number" min="0" value={years} onChange={(e) => setYears(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Projected corpus ({years || 0} years)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2a43' }}>{inr(res.corpus)}</div>
            <div style={{ marginTop: '8px' }}>
              <div style={resultRow}><span>Total invested</span><span>{inr(res.invested)}</span></div>
              <div style={{ ...resultRow, borderBottom: 'none', fontWeight: 700 }}><span>Estimated gains</span><span>{inr(res.gains)}</span></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#6b7280' }}>
            Powered by{' '}
            <a href="https://upaman.com/sip-calculator" target="_blank" rel="noopener" style={{ color: '#1d4e89', fontWeight: 600 }}>
              Upaman SIP Calculator
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
