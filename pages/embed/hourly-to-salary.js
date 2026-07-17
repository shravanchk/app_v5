import React, { useState, useMemo } from 'react';
import Head from 'next/head';

const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n || 0));

const box = { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', maxWidth: '480px', margin: '0 auto', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxSizing: 'border-box' };
const label = { display: 'block', fontWeight: 600, fontSize: '0.82rem', margin: '10px 0 4px', color: '#0f2a43' };
const input = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' };
const resultRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', borderBottom: '1px dashed #e2e8f0' };

export default function HourlyToSalaryEmbedWidget() {
  const [rate, setRate] = useState(25);
  const [hours, setHours] = useState(40);
  const [weeks, setWeeks] = useState(52);

  const res = useMemo(() => {
    const annual = (Number(rate) || 0) * (Number(hours) || 0) * (Number(weeks) || 0);
    return { annual, monthly: annual / 12, biweekly: (Number(rate) || 0) * (Number(hours) || 0) * 2, weekly: (Number(rate) || 0) * (Number(hours) || 0) };
  }, [rate, hours, weeks]);

  return (
    <>
      <Head>
        <title>Hourly to Salary Calculator Widget | Upaman</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: '8px', background: 'transparent' }}>
        <div style={box}>
          <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '1.05rem' }}>Hourly to Salary Calculator</div>

          <label style={label}>Hourly rate ($)</label>
          <input style={input} type="number" min="0" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Hours per week</label>
              <input style={input} type="number" min="1" max="80" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Paid weeks per year</label>
              <input style={input} type="number" min="1" max="52" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Annual salary, before taxes</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2a43' }}>{usd(res.annual)} / year</div>
            <div style={{ marginTop: '8px' }}>
              <div style={resultRow}><span>Per month</span><span>{usd(res.monthly)}</span></div>
              <div style={resultRow}><span>Bi-weekly paycheck</span><span>{usd(res.biweekly)}</span></div>
              <div style={{ ...resultRow, borderBottom: 'none' }}><span>Per week</span><span>{usd(res.weekly)}</span></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#6b7280' }}>
            Powered by{' '}
            <a href="https://upaman.com/hourly" target="_blank" rel="noopener" style={{ color: '#2563eb', fontWeight: 600 }}>
              Upaman Hourly to Salary Converter
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
