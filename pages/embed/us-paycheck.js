import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { computePaycheck, US_STATES, FILING_STATUSES, PAY_FREQUENCIES } from '../../utils/usPaycheckCalculations';

const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n || 0));

const box = { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', maxWidth: '480px', margin: '0 auto', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxSizing: 'border-box' };
const label = { display: 'block', fontWeight: 600, fontSize: '0.82rem', margin: '10px 0 4px', color: '#0f2a43' };
const input = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' };
const resultRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', borderBottom: '1px dashed #e2e8f0' };

// Shares computePaycheck with the full calculator so the widget cannot drift
// from the rates published on the site.
export default function USPaycheckEmbedWidget() {
  const [salary, setSalary] = useState(75000);
  const [stateCode, setStateCode] = useState('TX');
  const [filingStatus, setFilingStatus] = useState('single');
  const [frequency, setFrequency] = useState('monthly');

  const periods = PAY_FREQUENCIES.find((f) => f.value === frequency).periods;
  // computePaycheck returns null for a zero or blank salary, which is a normal
  // state while the visitor is retyping the field.
  const res = useMemo(
    () => computePaycheck({ grossAnnual: Number(salary) || 0, stateCode, filingStatus, retirementPct: 0 }),
    [salary, stateCode, filingStatus]
  );

  return (
    <>
      <Head>
        <title>US Paycheck Calculator Widget | Upaman</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: '8px', background: 'transparent' }}>
        <div style={box}>
          <div style={{ fontWeight: 700, color: '#1d4e89', fontSize: '1.05rem' }}>Paycheck Calculator (2026)</div>

          <label style={label}>Annual salary ($)</label>
          <input style={input} type="number" min="0" value={salary} onChange={(e) => setSalary(e.target.value)} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>State</label>
              <select style={input} value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
                {Object.entries(US_STATES).map(([code, st]) => (
                  <option key={code} value={code}>{st.name || code}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Filing status</label>
              <select style={input} value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)}>
                {FILING_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <label style={label}>Show pay per</label>
          <select style={input} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            {PAY_FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Take-home pay ({frequency})</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2a43' }}>{res ? usd(res.netAnnual / periods) : '—'}</div>
            {res && (
              <div style={{ marginTop: '8px' }}>
                <div style={resultRow}><span>Gross ({frequency})</span><span>{usd(res.grossAnnual / periods)}</span></div>
                <div style={resultRow}><span>Federal tax</span><span>{usd(res.federalTax / periods)}</span></div>
                <div style={resultRow}><span>FICA</span><span>{usd((res.socialSecurity + res.medicare) / periods)}</span></div>
                <div style={{ ...resultRow, borderBottom: 'none', fontWeight: 700 }}><span>State tax</span><span>{usd(res.stateTax / periods)}</span></div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#6b7280' }}>
            Powered by{' '}
            <a href="https://upaman.com/us-paycheck-calculator" target="_blank" rel="noopener" style={{ color: '#1d4e89', fontWeight: 600 }}>
              Upaman US Paycheck Calculator
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
