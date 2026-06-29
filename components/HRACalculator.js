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

const computeHRA = ({ basic, da, hraReceived, rentPaid, metro }) => {
  const b = Math.max(0, Number(basic) || 0);
  const d = Math.max(0, Number(da) || 0); // DA forming part of salary for retirement benefits
  const salary = b + d;
  const hra = Math.max(0, Number(hraReceived) || 0);
  const rent = Math.max(0, Number(rentPaid) || 0);

  const optionActual = hra;
  const optionRent = Math.max(0, rent - 0.1 * salary);
  const optionPercent = (metro ? 0.5 : 0.4) * salary;

  const exemption = Math.max(0, Math.min(optionActual, optionRent, optionPercent));
  const taxable = Math.max(0, hra - exemption);

  return { salary, hra, rent, optionActual, optionRent, optionPercent, exemption, taxable, metro };
};

const faqItems = [
  { question: 'How is HRA exemption calculated?', answer: 'HRA exemption is the least of three amounts: (1) actual HRA received, (2) rent paid minus 10% of salary, and (3) 50% of salary in metro cities or 40% in non-metro cities. Salary here means basic pay plus dearness allowance that forms part of salary.' },
  { question: 'Which cities count as metro for HRA?', answer: 'Only Delhi, Mumbai, Kolkata, and Chennai are treated as metro cities for HRA, qualifying for the 50% limit. All other cities use 40%.' },
  { question: 'Can I claim HRA under the new tax regime?', answer: 'No. The HRA exemption is available only under the old tax regime. If you opt for the new regime you cannot claim it, which is one factor in the regime decision.' },
  { question: 'Do I need rent receipts?', answer: 'Yes. To claim HRA you generally need rent receipts, and your landlord’s PAN if annual rent exceeds ₹1 lakh.' }
];

const HRACalculator = () => {
  const [inputs, setInputs] = useState({ basic: 600000, da: 0, hraReceived: 300000, rentPaid: 240000, metro: true });
  const result = useMemo(() => computeHRA(inputs), [inputs]);
  const set = (k, v) => setInputs((p) => ({ ...p, [k]: v }));

  const shareLines = [
    `Salary (Basic + DA): ${formatINR(result.salary)}`,
    `HRA received: ${formatINR(result.hra)}`,
    `Exempt HRA: ${formatINR(result.exemption)}`,
    `Taxable HRA: ${formatINR(result.taxable)}`
  ];

  return (
    <div>
      <Head>
        <title>HRA Exemption Calculator 2026 | House Rent Allowance Tax | Upaman</title>
        <meta name="description" content="Calculate your HRA exemption under the old tax regime. Enter basic salary, HRA received, rent paid, and city type to see the exempt and taxable HRA using the least-of-three rule." />
        <meta name="keywords" content="HRA calculator, HRA exemption calculator, house rent allowance calculator, HRA tax exemption, HRA metro non-metro, HRA old regime" />
        <link rel="canonical" href="https://upaman.com/hra-calculator" />
        <meta property="og:title" content="HRA Exemption Calculator | Upaman" />
        <meta property="og:description" content="See your exempt and taxable HRA using the least-of-three rule." />
        <meta property="og:url" content="https://upaman.com/hra-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebApplication', name: 'HRA Exemption Calculator - Upaman',
          url: 'https://upaman.com/hra-calculator', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(faqItems)) }} />
      </Head>
      <HomeButton />

      <div style={wrap}>
        <h1 style={{ color: '#2563eb', marginBottom: '4px' }}>HRA Exemption Calculator</h1>
        <p style={{ color: '#6b7280', marginTop: 0 }}>Find how much House Rent Allowance is tax-exempt under the old regime, using the least-of-three rule. All amounts are annual.</p>

        <div style={card}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Basic salary (annual)</label>
              <input style={input} type="number" min="0" value={inputs.basic} onChange={(e) => set('basic', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Dearness allowance (annual)</label>
              <input style={input} type="number" min="0" value={inputs.da} onChange={(e) => set('da', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>HRA received (annual)</label>
              <input style={input} type="number" min="0" value={inputs.hraReceived} onChange={(e) => set('hraReceived', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Rent paid (annual)</label>
              <input style={input} type="number" min="0" value={inputs.rentPaid} onChange={(e) => set('rentPaid', e.target.value)} />
            </div>
          </div>
          <label style={{ ...label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={inputs.metro} onChange={(e) => set('metro', e.target.checked)} />
            Metro city (Delhi, Mumbai, Kolkata, Chennai)
          </label>

          <div style={resultBox}>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Exempt HRA</div>
            <div style={big}>{formatINR(result.exemption)}</div>
            <div style={{ marginTop: '14px' }}>
              <div style={rowStyle}><span>1. Actual HRA received</span><span>{formatINR(result.optionActual)}</span></div>
              <div style={rowStyle}><span>2. Rent paid − 10% of salary</span><span>{formatINR(result.optionRent)}</span></div>
              <div style={rowStyle}><span>3. {result.metro ? '50%' : '40%'} of salary</span><span>{formatINR(result.optionPercent)}</span></div>
              <div style={{ ...rowStyle, fontWeight: 700, borderBottom: 'none', color: '#0f2a43' }}><span>Exempt (least of the three)</span><span>{formatINR(result.exemption)}</span></div>
              <div style={{ ...rowStyle, borderBottom: 'none', color: '#b91c1c' }}><span>Taxable HRA</span><span>{formatINR(result.taxable)}</span></div>
            </div>
          </div>

          <ResultActions title="HRA exemption estimate" summaryLines={shareLines} />
        </div>

        <CalculatorInfoPanel
          title="Methodology, assumptions, and source references"
          reviewedOn="June 28, 2026"
          inputs={['Annual basic salary and dearness allowance', 'Annual HRA received and rent paid', 'Whether you live in a metro city']}
          formulas={['Exempt HRA = least of: actual HRA; rent paid − 10% of salary; 50% (metro) or 40% (non-metro) of salary', 'Salary = basic + dearness allowance that forms part of salary', 'Taxable HRA = HRA received − exempt HRA']}
          assumptions={['HRA exemption applies under the old tax regime only', 'Metro cities are limited to Delhi, Mumbai, Kolkata, and Chennai', 'Rent receipts (and landlord PAN above ₹1 lakh annual rent) are required to claim']}
          sources={[{ label: 'Income Tax Department (India)', url: 'https://www.incometax.gov.in/' }]}
          guideLinks={[{ label: 'Old vs new regime breakeven', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27' }, { label: 'Standard deduction FY 2026-27', href: '/guides/standard-deduction-fy-2026-27' }]}
        />

        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '20px' }}>
          Planning estimate, not tax advice. Confirm specifics with your employer or a professional.
        </p>
      </div>
    </div>
  );
};

export default HRACalculator;
