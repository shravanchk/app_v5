import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { TrendingUp } from 'lucide-react';
import ResultActions from '../ResultActions';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import CalcShell, { fieldStyles as f, resultStyles as r } from '../calculator/CalcShell';
import { buildFaqSchema } from '../../utils/faqSchema';
import { formatINR } from '../../utils/calculations';

const EQUITY_LTCG_EXEMPTION = 125000;

const resolve = ({ asset, term, slabRate }) => {
  if (asset === 'equity') {
    return term === 'long'
      ? { rate: 12.5, exemption: EQUITY_LTCG_EXEMPTION, law: 'Section 112A — LTCG on listed equity' }
      : { rate: 20, exemption: 0, law: 'Section 111A — STCG on listed equity' };
  }
  if (term === 'long') return { rate: 12.5, exemption: 0, law: 'Section 112 — LTCG, without indexation' };
  return { rate: Math.max(0, Number(slabRate) || 0), exemption: 0, law: 'Taxed at your income slab rate (STCG)' };
};

const compute = ({ asset, term, saleValue, cost, expenses, slabRate }) => {
  const sale = Math.max(0, Number(saleValue) || 0);
  const c = Math.max(0, Number(cost) || 0);
  const exp = Math.max(0, Number(expenses) || 0);
  const gain = Math.max(0, sale - c - exp);
  const { rate, exemption, law } = resolve({ asset, term, slabRate });
  const taxableGain = Math.max(0, gain - exemption);
  const tax = taxableGain * (rate / 100);
  const cess = tax * 0.04;
  const total = tax + cess;
  return { gain, rate, exemption, taxableGain, tax, cess, total, netGain: gain - total, law };
};

const faqItems = [
  { question: 'What is the capital gains tax on shares in FY 2026-27?', answer: 'For listed equity and equity mutual funds, short-term gains (holding up to 12 months) are taxed at 20%, and long-term gains (over 12 months) at 12.5% on the amount above the ₹1.25 lakh annual exemption. A 4% health and education cess applies on the tax.' },
  { question: 'How is property capital gains tax calculated now?', answer: 'Long-term capital gains on property (held over 24 months) are taxed at 12.5% without indexation. For property acquired before 23 July 2024, resident individuals may instead choose 20% with indexation if that is lower. Short-term property gains are taxed at your income slab rate.' },
  { question: 'Is there an exemption on equity long-term gains?', answer: 'Yes. Long-term capital gains on listed equity and equity mutual funds are exempt up to ₹1.25 lakh per financial year; only the excess is taxed at 12.5%.' },
  { question: 'Does indexation still apply?', answer: 'For most assets acquired on or after 23 July 2024, indexation was removed and the LTCG rate set at 12.5%. Pre-23 July 2024 property retains an optional 20%-with-indexation route.' }
];

const CapitalGainsCalculator = () => {
  const [inputs, setInputs] = useState({ asset: 'equity', term: 'long', saleValue: 800000, cost: 500000, expenses: 0, slabRate: 30 });
  const res = useMemo(() => compute(inputs), [inputs]);
  const set = (k, v) => setInputs((p) => ({ ...p, [k]: v }));
  const isEquityShort = inputs.asset === 'equity' && inputs.term === 'short';
  const showSlab = inputs.asset !== 'equity' && inputs.term === 'short';

  const shareLines = [
    `Capital gain: ${formatINR(res.gain)}`,
    `Taxable gain: ${formatINR(res.taxableGain)} @ ${res.rate}%`,
    `Tax + 4% cess: ${formatINR(res.total)}`,
    `Net gain after tax: ${formatINR(res.netGain)}`
  ];

  return (
    <>
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

      <CalcShell icon={TrendingUp} title="Capital Gains Tax Calculator" subtitle="LTCG and STCG on listed equity, mutual funds, and property under FY 2026-27 rules.">
        <div style={{ ...f.row, ...f.group }}>
          <div style={f.col}>
            <label style={f.label} htmlFor="cg-asset">Asset type</label>
            <select style={f.input} id="cg-asset" value={inputs.asset} onChange={(e) => set('asset', e.target.value)}>
              <option value="equity">Listed equity / equity mutual fund</option>
              <option value="property">Property (land / building)</option>
              <option value="other">Other (gold, unlisted, debt fund, etc.)</option>
            </select>
          </div>
          <div style={f.col}>
            <label style={f.label} htmlFor="cg-term">Holding term</label>
            <select style={f.input} id="cg-term" value={inputs.term} onChange={(e) => set('term', e.target.value)}>
              <option value="long">Long-term</option>
              <option value="short">Short-term</option>
            </select>
          </div>
        </div>
        <p style={{ ...r.note, marginTop: '6px' }}>
          Long-term threshold: 12 months for listed equity/equity funds, 24 months for property and most other assets.
        </p>

        <div style={{ ...f.row, ...f.group }}>
          <div style={f.col}>
            <label style={f.label} htmlFor="cg-sale">Sale value</label>
            <input style={f.input} id="cg-sale" type="number" min="0" value={inputs.saleValue} onChange={(e) => set('saleValue', e.target.value)} />
          </div>
          <div style={f.col}>
            <label style={f.label} htmlFor="cg-cost">Purchase cost</label>
            <input style={f.input} id="cg-cost" type="number" min="0" value={inputs.cost} onChange={(e) => set('cost', e.target.value)} />
          </div>
        </div>
        <div style={{ ...f.row, ...f.group }}>
          <div style={f.col}>
            <label style={f.label} htmlFor="cg-exp">Transfer / improvement expenses</label>
            <input style={f.input} id="cg-exp" type="number" min="0" value={inputs.expenses} onChange={(e) => set('expenses', e.target.value)} />
          </div>
          {showSlab && (
            <div style={f.col}>
              <label style={f.label} htmlFor="cg-slab">Your income slab rate (%)</label>
              <input style={f.input} id="cg-slab" type="number" min="0" max="30" value={inputs.slabRate} onChange={(e) => set('slabRate', e.target.value)} />
            </div>
          )}
        </div>

        <div className="result-card" style={r.card}>
          <p style={r.kicker}>Total tax payable (incl. 4% cess)</p>
          <p style={r.figure}>{formatINR(res.total)}</p>
          <div style={{ marginTop: '12px' }}>
            <div style={r.row}><span>Capital gain</span><span>{formatINR(res.gain)}</span></div>
            {res.exemption > 0 && <div style={r.row}><span>Less: exemption</span><span>− {formatINR(res.exemption)}</span></div>}
            <div style={r.row}><span>Taxable gain @ {res.rate}%</span><span>{formatINR(res.taxableGain)}</span></div>
            <div style={r.row}><span>Tax</span><span>{formatINR(res.tax)}</span></div>
            <div style={r.row}><span>Health &amp; education cess (4%)</span><span>{formatINR(res.cess)}</span></div>
            <div style={r.rowLast}><span>Net gain after tax</span><span>{formatINR(res.netGain)}</span></div>
          </div>
          <p style={r.note}>{res.law}</p>
        </div>

        {isEquityShort && (
          <p style={r.note}>Equity STCG under Section 111A is taxed at a flat 20% (plus cess), regardless of your slab.</p>
        )}
        {inputs.asset === 'property' && inputs.term === 'long' && (
          <p style={r.note}>
            For property bought before 23 July 2024, you may alternatively choose 20% <em>with</em> indexation if it gives a
            lower tax. This tool shows the 12.5% without-indexation route.
          </p>
        )}

        <ResultActions title="Capital gains tax estimate" summaryLines={shareLines} />

        <CalculatorInfoPanel
          title="Methodology, assumptions, and source references"
          reviewedOn="June 28, 2026"
          inputs={['Asset type and holding term', 'Sale value, purchase cost, and transfer/improvement expenses', 'Income slab rate for short-term property/other gains']}
          formulas={['Capital gain = sale value − purchase cost − expenses', 'Equity LTCG: 12.5% on gain above ₹1,25,000; Equity STCG: 20%', 'Property/other LTCG: 12.5% without indexation; STCG: slab rate', 'Total tax = tax + 4% health and education cess']}
          assumptions={['Rules effective for FY 2026-27 (post 23 July 2024 regime)', 'Indexation removed for most assets acquired on/after 23 July 2024', 'Surcharge for very high incomes and set-off of losses are not modelled']}
          sources={[{ label: 'Income Tax Department — Capital Gains', url: 'https://www.incometax.gov.in/' }]}
          guideLinks={[{ label: 'FY 2026-27 income tax slabs', href: '/guides/india-income-tax-2026-27' }]}
        />

        <p style={r.note}>
          Planning estimate, not tax advice. Surcharge, indexation choices, exemptions (54/54F/54EC), and loss set-off can change
          the result. Confirm with a professional.
        </p>
      </CalcShell>
    </>
  );
};

export default CapitalGainsCalculator;
