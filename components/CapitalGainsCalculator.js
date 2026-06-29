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
const resultBox = { marginTop: '16px', padding: '18px', borderRadius: '12px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb' };
const big = { fontSize: '1.8rem', fontWeight: 700, color: '#0f2a43' };
const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.92rem' };

const EQUITY_LTCG_EXEMPTION = 125000;

const resolve = ({ asset, term, gain, slabRate }) => {
  // Returns { rate, exemption, label }
  if (asset === 'equity') {
    return term === 'long'
      ? { rate: 12.5, exemption: EQUITY_LTCG_EXEMPTION, law: 'Section 112A (LTCG on listed equity)' }
      : { rate: 20, exemption: 0, law: 'Section 111A (STCG on listed equity)' };
  }
  // property or other
  if (term === 'long') return { rate: 12.5, exemption: 0, law: 'Section 112 (LTCG, without indexation)' };
  return { rate: Math.max(0, Number(slabRate) || 0), exemption: 0, law: 'Taxed at your income slab rate (STCG)' };
};

const compute = ({ asset, term, saleValue, cost, expenses, slabRate }) => {
  const sale = Math.max(0, Number(saleValue) || 0);
  const c = Math.max(0, Number(cost) || 0);
  const exp = Math.max(0, Number(expenses) || 0);
  const gain = Math.max(0, sale - c - exp);
  const { rate, exemption, law } = resolve({ asset, term, gain, slabRate });
  const taxableGain = Math.max(0, gain - exemption);
  const tax = taxableGain * (rate / 100);
  const cess = tax * 0.04;
  const total = tax + cess;
  const netGain = gain - total;
  return { gain, rate, exemption, taxableGain, tax, cess, total, netGain, law };
};

const faqItems = [
  { question: 'What is the capital gains tax on shares in FY 2026-27?', answer: 'For listed equity and equity mutual funds, short-term gains (holding up to 12 months) are taxed at 20%, and long-term gains (over 12 months) at 12.5% on the amount above the ₹1.25 lakh annual exemption. A 4% health and education cess applies on the tax.' },
  { question: 'How is property capital gains tax calculated now?', answer: 'Long-term capital gains on property (held over 24 months) are taxed at 12.5% without indexation. For property acquired before 23 July 2024, resident individuals may instead choose 20% with indexation if that is lower. Short-term property gains are taxed at your income slab rate.' },
  { question: 'Is there an exemption on equity long-term gains?', answer: 'Yes. Long-term capital gains on listed equity and equity mutual funds are exempt up to ₹1.25 lakh per financial year; only the excess is taxed at 12.5%.' },
  { question: 'Does indexation still apply?', answer: 'For most assets acquired on or after 23 July 2024, indexation was removed and the LTCG rate set at 12.5%. Pre-23 July 2024 property retains an optional 20%-with-indexation route.' }
];

const CapitalGainsCalculator = () => {
  const [inputs, setInputs] = useState({ asset: 'equity', term: 'long', saleValue: 800000, cost: 500000, expenses: 0, slabRate: 30 });
  const r = useMemo(() => compute(inputs), [inputs]);
  const set = (k, v) => setInputs((p) => ({ ...p, [k]: v }));
  const isEquityShort = inputs.asset === 'equity' && inputs.term === 'short';
  const showSlab = inputs.asset !== 'equity' && inputs.term === 'short';

  const shareLines = [
    `Capital gain: ${formatINR(r.gain)}`,
    `Taxable gain: ${formatINR(r.taxableGain)} @ ${r.rate}%`,
    `Tax + 4% cess: ${formatINR(r.total)}`,
    `Net gain after tax: ${formatINR(r.netGain)}`
  ];

  return (
    <div>
      <Head>
        <title>Capital Gains Tax Calculator FY 2026-27 | LTCG &amp; STCG India | Upaman</title>
        <meta name="description" content="Calculate capital gains tax for FY 2026-27 on shares, mutual funds, and property. Includes 20% equity STCG, 12.5% LTCG, the ₹1.25 lakh equity exemption, and 4% cess." />
        <meta name="keywords" content="capital gains tax calculator, LTCG calculator, STCG calculator, capital gains india 2026, equity capital gains tax, property capital gains tax, 12.5 percent LTCG" />
        <link rel="canonical" href="https://upaman.com/capital-gains-calculator" />
        <meta property="og:title" content="Capital Gains Tax Calculator FY 2026-27 | Upaman" />
        <meta property="og:description" content="LTCG and STCG on shares, mutual funds, and property for FY 2026-27." />
        <meta property="og:url" content="https://upaman.com/capital-gains-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Capital Gains Tax Calculator - Upaman',
          url: 'https://upaman.com/capital-gains-calculator', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(faqItems)) }} />
      </Head>
      <HomeButton />

      <div style={wrap}>
        <h1 style={{ color: '#2563eb', marginBottom: '4px' }}>Capital Gains Tax Calculator (FY 2026-27)</h1>
        <p style={{ color: '#6b7280', marginTop: 0 }}>Estimate LTCG and STCG on listed equity, mutual funds, and property under the rules effective for FY 2026-27.</p>

        <div style={card}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Asset type</label>
              <select style={input} value={inputs.asset} onChange={(e) => set('asset', e.target.value)}>
                <option value="equity">Listed equity / equity mutual fund</option>
                <option value="property">Property (land / building)</option>
                <option value="other">Other (gold, unlisted, debt fund, etc.)</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Holding term</label>
              <select style={input} value={inputs.term} onChange={(e) => set('term', e.target.value)}>
                <option value="long">Long-term</option>
                <option value="short">Short-term</option>
              </select>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '6px 0 0' }}>
            Long-term threshold: 12 months for listed equity/equity funds, 24 months for property and most other assets.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Sale value</label>
              <input style={input} type="number" min="0" value={inputs.saleValue} onChange={(e) => set('saleValue', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Purchase cost</label>
              <input style={input} type="number" min="0" value={inputs.cost} onChange={(e) => set('cost', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Transfer / improvement expenses</label>
              <input style={input} type="number" min="0" value={inputs.expenses} onChange={(e) => set('expenses', e.target.value)} />
            </div>
            {showSlab && (
              <div style={{ flex: 1 }}>
                <label style={label}>Your income slab rate (%)</label>
                <input style={input} type="number" min="0" max="30" value={inputs.slabRate} onChange={(e) => set('slabRate', e.target.value)} />
              </div>
            )}
          </div>

          <div style={resultBox}>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Total tax payable (incl. 4% cess)</div>
            <div style={big}>{formatINR(r.total)}</div>
            <div style={{ marginTop: '14px' }}>
              <div style={rowStyle}><span>Capital gain</span><span>{formatINR(r.gain)}</span></div>
              {r.exemption > 0 && <div style={rowStyle}><span>Less: exemption</span><span>− {formatINR(r.exemption)}</span></div>}
              <div style={rowStyle}><span>Taxable gain @ {r.rate}%</span><span>{formatINR(r.taxableGain)}</span></div>
              <div style={rowStyle}><span>Tax</span><span>{formatINR(r.tax)}</span></div>
              <div style={rowStyle}><span>Health &amp; education cess (4%)</span><span>{formatINR(r.cess)}</span></div>
              <div style={{ ...rowStyle, fontWeight: 700, borderBottom: 'none', color: '#0f2a43' }}><span>Net gain after tax</span><span>{formatINR(r.netGain)}</span></div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '8px' }}>{r.law}</div>
          </div>

          {isEquityShort && (
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '10px' }}>
              Equity STCG under Section 111A is taxed at a flat 20% (plus cess), regardless of your slab.
            </p>
          )}
          {inputs.asset === 'property' && inputs.term === 'long' && (
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '10px' }}>
              For property bought before 23 July 2024, you may alternatively choose 20% <em>with</em> indexation if it gives a
              lower tax. This tool shows the 12.5% without-indexation route.
            </p>
          )}

          <ResultActions title="Capital gains tax estimate" summaryLines={shareLines} />
        </div>

        <CalculatorInfoPanel
          title="Methodology, assumptions, and source references"
          reviewedOn="June 28, 2026"
          inputs={['Asset type and holding term', 'Sale value, purchase cost, and transfer/improvement expenses', 'Income slab rate for short-term property/other gains']}
          formulas={['Capital gain = sale value − purchase cost − expenses', 'Equity LTCG: 12.5% on gain above ₹1,25,000; Equity STCG: 20%', 'Property/other LTCG: 12.5% without indexation; STCG: slab rate', 'Total tax = tax + 4% health and education cess']}
          assumptions={['Rules effective for FY 2026-27 (post 23 July 2024 regime)', 'Indexation removed for most assets acquired on/after 23 July 2024', 'Surcharge for very high incomes and set-off of losses are not modelled']}
          sources={[{ label: 'Income Tax Department — Capital Gains', url: 'https://www.incometax.gov.in/' }]}
          guideLinks={[{ label: 'FY 2026-27 income tax slabs', href: '/guides/india-income-tax-2026-27' }]}
        />

        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '20px' }}>
          Planning estimate, not tax advice. Surcharge, indexation choices, exemptions (54/54F/54EC), and loss set-off can change
          the result. Confirm with a professional.
        </p>
      </div>
    </div>
  );
};

export default CapitalGainsCalculator;
