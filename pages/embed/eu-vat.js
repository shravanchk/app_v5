import React, { useState, useMemo } from 'react';
import Head from 'next/head';

const box = { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', maxWidth: '480px', margin: '0 auto', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxSizing: 'border-box' };
const label = { display: 'block', fontWeight: 600, fontSize: '0.82rem', margin: '10px 0 4px', color: '#0f2a43' };
const input = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' };
const resultRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', borderBottom: '1px dashed #e2e8f0' };

// Standard rates only — the full calculator carries the reduced-rate bands.
const VAT_RATES = {
  UK: { rate: 20, name: 'United Kingdom', symbol: '£' },
  DE: { rate: 19, name: 'Germany', symbol: '€' },
  FR: { rate: 20, name: 'France', symbol: '€' },
  IT: { rate: 22, name: 'Italy', symbol: '€' },
  ES: { rate: 21, name: 'Spain', symbol: '€' },
  NL: { rate: 21, name: 'Netherlands', symbol: '€' },
  BE: { rate: 21, name: 'Belgium', symbol: '€' },
  AT: { rate: 20, name: 'Austria', symbol: '€' },
  IE: { rate: 23, name: 'Ireland', symbol: '€' },
  PT: { rate: 23, name: 'Portugal', symbol: '€' },
  DK: { rate: 25, name: 'Denmark', symbol: 'kr' },
  SE: { rate: 25, name: 'Sweden', symbol: 'kr' },
  NO: { rate: 25, name: 'Norway', symbol: 'kr' },
  FI: { rate: 25.5, name: 'Finland', symbol: '€' },
  CH: { rate: 8.1, name: 'Switzerland', symbol: 'CHF' }
};

const money = (symbol, n) =>
  `${symbol}${new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)}`;

export default function EUVatEmbedWidget() {
  const [amount, setAmount] = useState(100);
  const [country, setCountry] = useState('UK');
  const [mode, setMode] = useState('exclusive');

  const res = useMemo(() => {
    const { rate } = VAT_RATES[country];
    const value = Math.max(0, Number(amount) || 0);
    // "exclusive" means the figure entered is pre-VAT; "inclusive" strips the
    // VAT already inside a shelf price.
    const net = mode === 'inclusive' ? value / (1 + rate / 100) : value;
    const vat = mode === 'inclusive' ? value - net : value * (rate / 100);
    return { rate, net, vat, gross: net + vat };
  }, [amount, country, mode]);

  const symbol = VAT_RATES[country].symbol;

  return (
    <>
      <Head>
        <title>EU VAT Calculator Widget | Upaman</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: '8px', background: 'transparent' }}>
        <div style={box}>
          <div style={{ fontWeight: 700, color: '#1d4e89', fontSize: '1.05rem' }}>VAT Calculator</div>

          <label style={label}>Amount</label>
          <input style={input} type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Country</label>
              <select style={input} value={country} onChange={(e) => setCountry(e.target.value)}>
                {Object.entries(VAT_RATES).map(([code, c]) => (
                  <option key={code} value={code}>{c.name} ({c.rate}%)</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>This amount is…</label>
              <select style={input} value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="exclusive">Before VAT</option>
                <option value="inclusive">VAT included</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>Total including VAT ({res.rate}%)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f2a43' }}>{money(symbol, res.gross)}</div>
            <div style={{ marginTop: '8px' }}>
              <div style={resultRow}><span>Net (before VAT)</span><span>{money(symbol, res.net)}</span></div>
              <div style={{ ...resultRow, borderBottom: 'none', fontWeight: 700 }}><span>VAT</span><span>{money(symbol, res.vat)}</span></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#6b7280' }}>
            Powered by{' '}
            <a href="https://upaman.com/eu-vat-calculator" target="_blank" rel="noopener" style={{ color: '#1d4e89', fontWeight: 600 }}>
              Upaman EU VAT Calculator
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
