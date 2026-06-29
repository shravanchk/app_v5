import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import { buildFaqSchema } from '../utils/faqSchema';
import { formatINR } from '../utils/calculations';

const wrap = { maxWidth: '860px', margin: '0 auto', padding: '24px 20px 64px', fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937' };
const card = { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(15,42,67,0.05)' };
const label = { display: 'block', fontWeight: 600, fontSize: '0.9rem', margin: '12px 0 6px', color: '#0f2a43' };
const input = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' };
const compareWrap = { display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' };
const compareCol = { flex: '1 1 200px', padding: '16px', borderRadius: '12px', border: '1px solid #dbe2eb' };
const big = { fontSize: '1.5rem', fontWeight: 700, color: '#0f2a43' };

const OLD_RATES = [5, 12, 18, 28];
const NEW_RATES = [0, 5, 18, 40];

const compute = ({ amount, mode, oldRate, newRate }) => {
  const amt = Math.max(0, Number(amount) || 0);
  const o = Number(oldRate) || 0;
  const n = Number(newRate) || 0;
  // Derive the base (pre-tax) price depending on what the user entered.
  const base = mode === 'inclusive' ? amt / (1 + o / 100) : amt;
  const oldTotal = base * (1 + o / 100);
  const newTotal = base * (1 + n / 100);
  const savings = oldTotal - newTotal;
  const pctChange = oldTotal > 0 ? (savings / oldTotal) * 100 : 0;
  return { base, oldTotal, newTotal, oldTax: base * (o / 100), newTax: base * (n / 100), savings, pctChange };
};

const faqItems = [
  { question: 'What changed in GST in 2025?', answer: 'Effective 22 September 2025, India moved to a simplified GST structure with two main slabs of 5% and 18%, a 40% rate for sin and luxury goods, and nil-rated essentials. The earlier 12% and 28% slabs were removed, with most items shifting down to 5% or 18%.' },
  { question: 'How do I find the new price after GST 2.0?', answer: 'Take the base (pre-tax) price and apply the new slab. If you only know the old MRP, this calculator first removes the old GST to find the base, then applies the new rate so you can compare like-for-like.' },
  { question: 'Did all prices fall under GST 2.0?', answer: 'Most goods that moved from 12% to 5% or from 28% to 18% became cheaper. A few items moved into the 40% sin/luxury slab and became more expensive. The direction depends on the specific item’s reclassification.' }
];

const GSTReformCalculator = () => {
  const [inputs, setInputs] = useState({ amount: 1000, mode: 'base', oldRate: 28, newRate: 18 });
  const r = useMemo(() => compute(inputs), [inputs]);
  const set = (k, v) => setInputs((p) => ({ ...p, [k]: v }));
  const cheaper = r.savings >= 0;

  const shareLines = [
    `Base price: ${formatINR(r.base)}`,
    `Old price (GST ${inputs.oldRate}%): ${formatINR(r.oldTotal)}`,
    `New price (GST ${inputs.newRate}%): ${formatINR(r.newTotal)}`,
    `${cheaper ? 'You save' : 'Extra cost'}: ${formatINR(Math.abs(r.savings))} (${Math.abs(r.pctChange).toFixed(1)}%)`
  ];

  return (
    <div>
      <Head>
        <title>GST 2.0 Price Calculator | Old vs New GST Rate (5/18/40) | Upaman</title>
        <meta name="description" content="Compare an item's price before and after the September 2025 GST 2.0 reform. Enter the price and old/new GST rates to see how much cheaper or costlier it is under the new 5%, 18%, and 40% slabs." />
        <meta name="keywords" content="GST 2.0 calculator, new GST rate calculator, old vs new GST price, GST reform calculator, GST 5 18 40, GST price change calculator" />
        <link rel="canonical" href="https://upaman.com/gst-reform-calculator" />
        <meta property="og:title" content="GST 2.0 Old vs New Price Calculator | Upaman" />
        <meta property="og:description" content="See how the September 2025 GST reform changed an item's price." />
        <meta property="og:url" content="https://upaman.com/gst-reform-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebApplication', name: 'GST 2.0 Price Calculator - Upaman',
          url: 'https://upaman.com/gst-reform-calculator', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(faqItems)) }} />
      </Head>
      <HomeButton />

      <div style={wrap}>
        <h1 style={{ color: '#2563eb', marginBottom: '4px' }}>GST 2.0 Price Calculator</h1>
        <p style={{ color: '#6b7280', marginTop: 0 }}>See how the 22 September 2025 GST reform changed an item&rsquo;s price — compare the old and new slabs side by side.</p>

        <div style={card}>
          <label style={label}>Amount</label>
          <input style={input} type="number" min="0" value={inputs.amount} onChange={(e) => set('amount', e.target.value)} />

          <label style={label}>This amount is…</label>
          <select style={input} value={inputs.mode} onChange={(e) => set('mode', e.target.value)}>
            <option value="base">Base price (before GST)</option>
            <option value="inclusive">Old MRP (including old GST)</option>
          </select>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Old GST rate</label>
              <select style={input} value={inputs.oldRate} onChange={(e) => set('oldRate', e.target.value)}>
                {OLD_RATES.map((rt) => <option key={rt} value={rt}>{rt}%</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>New GST rate</label>
              <select style={input} value={inputs.newRate} onChange={(e) => set('newRate', e.target.value)}>
                {NEW_RATES.map((rt) => <option key={rt} value={rt}>{rt}%</option>)}
              </select>
            </div>
          </div>

          <div style={compareWrap}>
            <div style={{ ...compareCol, background: '#fef2f2' }}>
              <div style={{ fontSize: '0.8rem', color: '#991b1b' }}>Old price (GST {inputs.oldRate}%)</div>
              <div style={big}>{formatINR(r.oldTotal)}</div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>incl. tax {formatINR(r.oldTax)}</div>
            </div>
            <div style={{ ...compareCol, background: '#f0fdf4' }}>
              <div style={{ fontSize: '0.8rem', color: '#166534' }}>New price (GST {inputs.newRate}%)</div>
              <div style={big}>{formatINR(r.newTotal)}</div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>incl. tax {formatINR(r.newTax)}</div>
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '14px', borderRadius: '10px', background: cheaper ? '#ecfdf5' : '#fff7ed', border: '1px solid #dbe2eb', fontWeight: 600, color: '#0f2a43' }}>
            {cheaper
              ? `Cheaper by ${formatINR(r.savings)} (${r.pctChange.toFixed(1)}% lower)`
              : `Costlier by ${formatINR(Math.abs(r.savings))} (${Math.abs(r.pctChange).toFixed(1)}% higher)`}
          </div>

          <ResultActions title="GST 2.0 price comparison" summaryLines={shareLines} />
        </div>

        <CalculatorInfoPanel
          title="Methodology, assumptions, and source references"
          reviewedOn="June 28, 2026"
          inputs={['Amount (base price or old GST-inclusive MRP)', 'Old GST rate (5/12/18/28%)', 'New GST rate (0/5/18/40%)']}
          formulas={['Base = inclusive ÷ (1 + old rate) when an old MRP is entered', 'Old price = base × (1 + old rate); New price = base × (1 + new rate)', 'Savings = old price − new price']}
          assumptions={['Compares only the GST component; ignores discounts, cess, and dealer margin changes', 'New GST 2.0 structure effective 22 September 2025: 5%, 18%, 40% plus nil-rated', 'The correct slab for a specific item depends on its official classification']}
          sources={[{ label: 'CBIC GST portal', url: 'https://www.cbic-gst.gov.in/' }]}
          guideLinks={[{ label: 'GST calculator (add/remove/reverse)', href: '/gst-calculator' }]}
        />

        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '20px' }}>
          Estimate for comparison only. Final invoice prices depend on item classification and seller pricing.
        </p>
      </div>
    </div>
  );
};

export default GSTReformCalculator;
