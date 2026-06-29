import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { Home } from 'lucide-react';
import ResultActions from './ResultActions';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import CalcShell, { fieldStyles as f, resultStyles as r } from './calculator/CalcShell';
import { buildFaqSchema } from '../utils/faqSchema';
import { formatINR } from '../utils/calculations';

const computeHRA = ({ basic, da, hraReceived, rentPaid, metro }) => {
  const salary = Math.max(0, Number(basic) || 0) + Math.max(0, Number(da) || 0);
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
    <>
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

      <CalcShell icon={Home} title="HRA Exemption Calculator" subtitle="How much House Rent Allowance is tax-exempt under the old regime, using the least-of-three rule. All amounts are annual.">
        <div style={{ ...f.row, ...f.group }}>
          <div style={f.col}>
            <label style={f.label} htmlFor="hra-basic">Basic salary (annual)</label>
            <input style={f.input} id="hra-basic" type="number" min="0" value={inputs.basic} onChange={(e) => set('basic', e.target.value)} />
          </div>
          <div style={f.col}>
            <label style={f.label} htmlFor="hra-da">Dearness allowance (annual)</label>
            <input style={f.input} id="hra-da" type="number" min="0" value={inputs.da} onChange={(e) => set('da', e.target.value)} />
          </div>
        </div>
        <div style={{ ...f.row, ...f.group }}>
          <div style={f.col}>
            <label style={f.label} htmlFor="hra-recd">HRA received (annual)</label>
            <input style={f.input} id="hra-recd" type="number" min="0" value={inputs.hraReceived} onChange={(e) => set('hraReceived', e.target.value)} />
          </div>
          <div style={f.col}>
            <label style={f.label} htmlFor="hra-rent">Rent paid (annual)</label>
            <input style={f.input} id="hra-rent" type="number" min="0" value={inputs.rentPaid} onChange={(e) => set('rentPaid', e.target.value)} />
          </div>
        </div>
        <label style={f.checkboxRow} htmlFor="hra-metro">
          <input id="hra-metro" type="checkbox" checked={inputs.metro} onChange={(e) => set('metro', e.target.checked)} />
          Metro city (Delhi, Mumbai, Kolkata, Chennai)
        </label>

        <div className="result-card" style={r.card}>
          <p style={r.kicker}>Exempt HRA</p>
          <p style={r.figure}>{formatINR(result.exemption)}</p>
          <div style={{ marginTop: '12px' }}>
            <div style={r.row}><span>1. Actual HRA received</span><span>{formatINR(result.optionActual)}</span></div>
            <div style={r.row}><span>2. Rent paid − 10% of salary</span><span>{formatINR(result.optionRent)}</span></div>
            <div style={r.row}><span>3. {result.metro ? '50%' : '40%'} of salary</span><span>{formatINR(result.optionPercent)}</span></div>
            <div style={r.row}><span><strong>Exempt (least of the three)</strong></span><span><strong>{formatINR(result.exemption)}</strong></span></div>
            <div style={r.rowLast}><span>Taxable HRA</span><span>{formatINR(result.taxable)}</span></div>
          </div>
        </div>

        <ResultActions title="HRA exemption estimate" summaryLines={shareLines} />

        <CalculatorInfoPanel
          title="Methodology, assumptions, and source references"
          reviewedOn="June 28, 2026"
          inputs={['Annual basic salary and dearness allowance', 'Annual HRA received and rent paid', 'Whether you live in a metro city']}
          formulas={['Exempt HRA = least of: actual HRA; rent paid − 10% of salary; 50% (metro) or 40% (non-metro) of salary', 'Salary = basic + dearness allowance that forms part of salary', 'Taxable HRA = HRA received − exempt HRA']}
          assumptions={['HRA exemption applies under the old tax regime only', 'Metro cities are limited to Delhi, Mumbai, Kolkata, and Chennai', 'Rent receipts (and landlord PAN above ₹1 lakh annual rent) are required to claim']}
          sources={[{ label: 'Income Tax Department (India)', url: 'https://www.incometax.gov.in/' }]}
          guideLinks={[{ label: 'Old vs new regime breakeven', href: '/guides/old-vs-new-regime-breakeven-fy-2026-27' }, { label: 'Standard deduction FY 2026-27', href: '/guides/standard-deduction-fy-2026-27' }]}
        />

        <p style={r.note}>Planning estimate, not tax advice. Confirm specifics with your employer or a professional.</p>
      </CalcShell>
    </>
  );
};

export default HRACalculator;
