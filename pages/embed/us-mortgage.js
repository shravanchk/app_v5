import React, { useState, useMemo } from 'react';
import Head from 'next/head';

const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n || 0));

const box = { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', maxWidth: '480px', margin: '0 auto', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxSizing: 'border-box' };
const label = { display: 'block', fontWeight: 600, fontSize: '0.82rem', margin: '10px 0 4px', color: '#0f2a43' };
const input = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' };
const resultRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', borderBottom: '1px dashed #e2e8f0' };

// Same amortisation the full calculator uses, with PMI dropping off at 20% down.
const project = (price, down, annualRate, years, taxRate, insuranceAnnual) => {
  const p = Math.max(0, Number(price) || 0);
  const d = Math.max(0, Number(down) || 0);
  const principal = Math.max(0, p - d);
  const months = Math.max(1, Math.round((Number(years) || 0) * 12));
  const r = (Number(annualRate) || 0) / 100 / 12;

  const principalAndInterest = r === 0
    ? principal / months
    : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

  const taxMonthly = (p * (Number(taxRate) || 0)) / 100 / 12;
  const insuranceMonthly = (Number(insuranceAnnual) || 0) / 12;
  const downPercent = p > 0 ? (d / p) * 100 : 0;
  const pmiMonthly = downPercent < 20 ? (principal * 0.6) / 100 / 12 : 0;

  return {
    principalAndInterest,
    taxMonthly,
    insuranceMonthly,
    pmiMonthly,
    total: principalAndInterest + taxMonthly + insuranceMonthly + pmiMonthly,
    totalInterest: Math.max(0, principalAndInterest * months - principal)
  };
};

export default function USMortgageEmbedWidget() {
  const [price, setPrice] = useState(450000);
  const [down, setDown] = useState(90000);
  const [rate, setRate] = useState(6.75);
  const [years, setYears] = useState(30);
  const [taxRate, setTaxRate] = useState(1.1);
  const [insurance, setInsurance] = useState(1800);

  const res = useMemo(
    () => project(price, down, rate, years, taxRate, insurance),
    [price, down, rate, years, taxRate, insurance]
  );

  return (
    <>
      <Head>
        <title>US Mortgage Calculator Widget | Upaman</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: '8px', background: 'transparent' }}>
        <div style={box}>
          <div style={{ fontWeight: 700, color: '#1d4e89', fontSize: '1.05rem' }}>Mortgage Payment Calculator</div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Home price ($)</label>
              <input style={input} type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Down payment ($)</label>
              <input style={input} type="number" min="0" value={down} onChange={(e) => setDown(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Interest rate (%)</label>
              <input style={input} type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Term (years)</label>
              <input style={input} type="number" min="1" value={years} onChange={(e) => setYears(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Property tax (%/yr)</label>
              <input style={input} type="number" min="0" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Insurance ($/yr)</label>
              <input style={input} type="number" min="0" value={insurance} onChange={(e) => setInsurance(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Estimated monthly payment</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2a43' }}>{usd(res.total)}</div>
            <div style={{ marginTop: '8px' }}>
              <div style={resultRow}><span>Principal &amp; interest</span><span>{usd(res.principalAndInterest)}</span></div>
              <div style={resultRow}><span>Property tax</span><span>{usd(res.taxMonthly)}</span></div>
              <div style={resultRow}><span>Insurance</span><span>{usd(res.insuranceMonthly)}</span></div>
              {res.pmiMonthly > 0 && (
                <div style={resultRow}><span>PMI (under 20% down)</span><span>{usd(res.pmiMonthly)}</span></div>
              )}
              <div style={{ ...resultRow, borderBottom: 'none', fontWeight: 700 }}><span>Lifetime interest</span><span>{usd(res.totalInterest)}</span></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#6b7280' }}>
            Powered by{' '}
            <a href="https://upaman.com/us-mortgage-calculator" target="_blank" rel="noopener" style={{ color: '#1d4e89', fontWeight: 600 }}>
              Upaman US Mortgage Calculator
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
