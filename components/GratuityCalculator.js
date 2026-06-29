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

const GRATUITY_CAP = 2000000;

const computeGratuity = ({ lastSalary, years, months, coveredByAct }) => {
  const salary = Math.max(0, Number(lastSalary) || 0);
  const y = Math.max(0, Number(years) || 0);
  const m = Math.max(0, Math.min(11, Number(months) || 0));
  // Payment of Gratuity Act rounding: service of > 6 months counts as a full year.
  const roundedYears = coveredByAct ? (m > 6 ? y + 1 : y) : y + (m >= 6 ? 1 : 0);
  const divisor = coveredByAct ? 26 : 30;
  const raw = (15 * salary * roundedYears) / divisor;
  const capped = Math.min(raw, GRATUITY_CAP);
  return { salary, roundedYears, raw, capped, divisor, exceedsCap: raw > GRATUITY_CAP };
};

const faqItems = [
  { question: 'How is gratuity calculated in India?', answer: 'For employees covered by the Payment of Gratuity Act, gratuity = (15 × last drawn salary × years of service) / 26, where salary means basic pay plus dearness allowance. Service beyond 6 months in the final year is rounded up to a full year.' },
  { question: 'What is the maximum tax-free gratuity?', answer: 'Gratuity is exempt from tax up to ₹20 lakh in a lifetime for covered employees. Amounts above the ₹20 lakh statutory ceiling are taxable as per your slab.' },
  { question: 'Do I need 5 years of service to get gratuity?', answer: 'Generally yes — gratuity is payable after 5 years of continuous service, except in cases of death or disablement, where the 5-year condition is waived.' },
  { question: 'Is the divisor always 26?', answer: 'For employees covered by the Act the divisor is 26 (working days in a month). For employees not covered by the Act, employers typically use 30 days.' }
];

const GratuityCalculator = () => {
  const [inputs, setInputs] = useState({ lastSalary: 80000, years: 10, months: 7, coveredByAct: true });
  const result = useMemo(() => computeGratuity(inputs), [inputs]);

  const set = (k, v) => setInputs((p) => ({ ...p, [k]: v }));

  const shareLines = [
    `Last drawn salary (Basic + DA): ${formatINR(result.salary)}`,
    `Service counted: ${result.roundedYears} years`,
    `Estimated gratuity: ${formatINR(result.capped)}`
  ];

  return (
    <div>
      <Head>
        <title>Gratuity Calculator India 2026 | Estimate Your Gratuity | Upaman</title>
        <meta name="description" content="Free gratuity calculator for India. Estimate your gratuity using the Payment of Gratuity Act formula (15/26 rule), with the ₹20 lakh tax-free ceiling and service rounding." />
        <meta name="keywords" content="gratuity calculator, gratuity calculator india, gratuity formula, payment of gratuity act calculator, gratuity eligibility, tax free gratuity limit" />
        <link rel="canonical" href="https://upaman.com/gratuity-calculator" />
        <meta property="og:title" content="Gratuity Calculator India | Upaman" />
        <meta property="og:description" content="Estimate gratuity using the 15/26 formula with the ₹20 lakh tax-free ceiling." />
        <meta property="og:url" content="https://upaman.com/gratuity-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Gratuity Calculator India - Upaman',
          url: 'https://upaman.com/gratuity-calculator', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(faqItems)) }} />
      </Head>
      <HomeButton />

      <div style={wrap}>
        <h1 style={{ color: '#2563eb', marginBottom: '4px' }}>Gratuity Calculator (India)</h1>
        <p style={{ color: '#6b7280', marginTop: 0 }}>Estimate gratuity using the Payment of Gratuity Act formula, with the ₹20 lakh tax-free ceiling.</p>

        <div style={card}>
          <label style={label}>Last drawn monthly salary (Basic + DA)</label>
          <input style={input} type="number" min="0" value={inputs.lastSalary}
            onChange={(e) => set('lastSalary', e.target.value)} />

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Completed years of service</label>
              <input style={input} type="number" min="0" value={inputs.years}
                onChange={(e) => set('years', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Additional months</label>
              <input style={input} type="number" min="0" max="11" value={inputs.months}
                onChange={(e) => set('months', e.target.value)} />
            </div>
          </div>

          <label style={{ ...label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={inputs.coveredByAct}
              onChange={(e) => set('coveredByAct', e.target.checked)} />
            Covered by the Payment of Gratuity Act (divisor 26)
          </label>

          <div style={resultBox}>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Estimated gratuity</div>
            <div style={big}>{formatINR(result.capped)}</div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '10px', lineHeight: 1.6 }}>
              Formula: (15 × {formatINR(result.salary)} × {result.roundedYears} years) ÷ {result.divisor} = {formatINR(result.raw)}
              {result.exceedsCap && (
                <><br /><strong>Capped at the ₹20,00,000 statutory ceiling</strong> for tax-free gratuity.</>
              )}
            </div>
          </div>

          <ResultActions title="Gratuity estimate" summaryLines={shareLines} />
        </div>

        <CalculatorInfoPanel
          title="Methodology, assumptions, and source references"
          reviewedOn="June 28, 2026"
          inputs={['Last drawn monthly salary (Basic + DA)', 'Completed years and additional months of service', 'Whether the employer is covered by the Payment of Gratuity Act']}
          formulas={['Covered by Act: gratuity = (15 × last salary × years) / 26', 'Not covered: gratuity = (15 × last salary × years) / 30', 'Service of more than 6 months in the final year rounds up to a full year']}
          assumptions={['Salary means basic pay plus dearness allowance', 'Tax-free ceiling of ₹20,00,000 applies to covered employees', 'Eligibility generally requires 5 years of continuous service (waived for death/disablement)']}
          sources={[{ label: 'Payment of Gratuity Act (India Code)', url: 'https://www.indiacode.nic.in/' }, { label: 'Income Tax Department (India)', url: 'https://www.incometax.gov.in/' }]}
          guideLinks={[{ label: 'CTC to in-hand breakdown guide', href: '/guides/ctc-to-in-hand-salary' }, { label: 'Standard deduction FY 2026-27', href: '/guides/standard-deduction-fy-2026-27' }]}
        />

        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '20px' }}>
          This is a planning estimate, not legal or tax advice. Actual gratuity depends on your employment terms and statutory rules.
        </p>
      </div>
    </div>
  );
};

export default GratuityCalculator;
