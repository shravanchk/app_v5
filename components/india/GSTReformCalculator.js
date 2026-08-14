import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { Receipt } from 'lucide-react';
import ResultActions from '../ResultActions';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import CalcShell, { fieldStyles as f, resultStyles as r } from '../calculator/CalcShell';
import CalcFAQ from '../calculator/CalcFAQ';
import { buildFaqSchema } from '../../utils/faqSchema';
import { formatINR } from '../../utils/calculations';
import { useShareableState, restoreValues } from '../../utils/shareableState';

const OLD_RATES = [5, 12, 18, 28];
const NEW_RATES = [0, 5, 18, 40];

const compute = ({ amount, mode, oldRate, newRate }) => {
  const amt = Math.max(0, Number(amount) || 0);
  const o = Number(oldRate) || 0;
  const n = Number(newRate) || 0;
  const base = mode === 'inclusive' ? amt / (1 + o / 100) : amt;
  const oldTotal = base * (1 + o / 100);
  const newTotal = base * (1 + n / 100);
  const savings = oldTotal - newTotal;
  const pctChange = oldTotal > 0 ? (savings / oldTotal) * 100 : 0;
  return { base, oldTotal, newTotal, oldTax: base * (o / 100), newTax: base * (n / 100), savings, pctChange };
};

const comparePanel = (accent) => ({ flex: '1 1 200px', minWidth: 0, padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: `3px solid ${accent}`, background: '#fff' });

const faqItems = [
  { question: 'What changed in GST in 2025?', answer: 'Effective 22 September 2025, India moved to a simplified GST structure with two main slabs of 5% and 18%, a 40% rate for sin and luxury goods, and nil-rated essentials. The earlier 12% and 28% slabs were removed, with most items shifting down to 5% or 18%.' },
  { question: 'How do I find the new price after GST 2.0?', answer: 'Take the base (pre-tax) price and apply the new slab. If you only know the old MRP, this calculator first removes the old GST to find the base, then applies the new rate so you can compare like-for-like.' },
  { question: 'Did all prices fall under GST 2.0?', answer: 'Most goods that moved from 12% to 5% or from 28% to 18% became cheaper. A few items moved into the 40% sin/luxury slab and became more expensive. The direction depends on the specific item’s reclassification.' },
  { question: 'Which slabs were removed in GST 2.0?', answer: 'The 12% and 28% slabs were abolished. The structure is now 0% (nil-rated essentials), 5% (merit goods), 18% (standard), and a 40% rate for sin and luxury items such as tobacco, aerated drinks, and high-end cars.' },
  { question: 'Why can’t I just subtract the rate difference from the price?', answer: 'Because GST applies to the base (pre-tax) price, not the shelf price. To compare fairly you first strip the old GST out of the MRP to recover the base, then apply the new rate. Subtracting “28% minus 18%” from the final price gives the wrong answer.' },
  { question: 'Will shops always pass the GST cut on to me?', answer: 'Not automatically. A lower slab reduces the tax on the base price, but sellers set the final price and may absorb part of the change through margin. The calculator shows the tax-driven change; your actual saving depends on the retailer’s pricing.' },
  { question: 'Does a lower GST rate always mean a big saving?', answer: 'The saving is proportional to both the rate cut and the price. Moving an item from 12% to 5% saves about 6.25% of the old price; moving from 28% to 18% saves about 7.8%. On small purchases the rupee amount is modest, but on big-ticket goods it adds up quickly.' }
];

const DEFAULT_INPUTS = { amount: 1000, mode: 'base', oldRate: 28, newRate: 18 };

const SHARED_OPTIONS = { mode: ['base', 'inclusive'] };

const GSTReformCalculator = () => {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  useShareableState({
    values: inputs,
    defaults: DEFAULT_INPUTS,
    onRestore: (shared) => setInputs((prev) => restoreValues(prev, shared, DEFAULT_INPUTS, SHARED_OPTIONS))
  });
  const res = useMemo(() => compute(inputs), [inputs]);
  const set = (k, v) => setInputs((p) => ({ ...p, [k]: v }));
  const cheaper = res.savings >= 0;

  const shareLines = [
    `Base price: ${formatINR(res.base)}`,
    `Old price (GST ${inputs.oldRate}%): ${formatINR(res.oldTotal)}`,
    `New price (GST ${inputs.newRate}%): ${formatINR(res.newTotal)}`,
    `${cheaper ? 'You save' : 'Extra cost'}: ${formatINR(Math.abs(res.savings))} (${Math.abs(res.pctChange).toFixed(1)}%)`
  ];

  return (
    <>
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

      <CalcShell icon={Receipt} title="GST 2.0 Price Calculator" subtitle="How the 22 September 2025 GST reform changed an item’s price — old and new slabs side by side.">
        <div style={f.group}>
          <label style={f.label} htmlFor="g2-amount">Amount</label>
          <input style={f.input} id="g2-amount" type="number" min="0" value={inputs.amount} onChange={(e) => set('amount', e.target.value)} />
        </div>
        <div style={f.group}>
          <label style={f.label} htmlFor="g2-mode">This amount is…</label>
          <select style={f.input} id="g2-mode" value={inputs.mode} onChange={(e) => set('mode', e.target.value)}>
            <option value="base">Base price (before GST)</option>
            <option value="inclusive">Old MRP (including old GST)</option>
          </select>
        </div>
        <div style={{ ...f.row, ...f.group }}>
          <div style={f.col}>
            <label style={f.label} htmlFor="g2-old">Old GST rate</label>
            <select style={f.input} id="g2-old" value={inputs.oldRate} onChange={(e) => set('oldRate', e.target.value)}>
              {OLD_RATES.map((rt) => <option key={rt} value={rt}>{rt}%</option>)}
            </select>
          </div>
          <div style={f.col}>
            <label style={f.label} htmlFor="g2-new">New GST rate</label>
            <select style={f.input} id="g2-new" value={inputs.newRate} onChange={(e) => set('newRate', e.target.value)}>
              {NEW_RATES.map((rt) => <option key={rt} value={rt}>{rt}%</option>)}
            </select>
          </div>
        </div>

        <div className="result-card" style={r.card}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={comparePanel('#94a3b8')}>
              <p style={r.kicker}>Old price · GST {inputs.oldRate}%</p>
              <p style={{ ...r.figure, fontSize: '1.4rem' }}>{formatINR(res.oldTotal)}</p>
              <p style={r.note}>incl. tax {formatINR(res.oldTax)}</p>
            </div>
            <div style={comparePanel('#1d4e89')}>
              <p style={r.kicker}>New price · GST {inputs.newRate}%</p>
              <p style={{ ...r.figure, fontSize: '1.4rem' }}>{formatINR(res.newTotal)}</p>
              <p style={r.note}>incl. tax {formatINR(res.newTax)}</p>
            </div>
          </div>
          <div style={{ ...r.rowLast, marginTop: '12px', borderTop: '1px solid #e7edf3', paddingTop: '12px' }}>
            <span>{cheaper ? 'Cheaper by' : 'Costlier by'}</span>
            <span>{formatINR(Math.abs(res.savings))} ({Math.abs(res.pctChange).toFixed(1)}%)</span>
          </div>
        </div>

        <ResultActions title="GST 2.0 price comparison" summaryLines={shareLines} />

        <section className="calc-prose">
          <h2>What GST 2.0 changed on 22 September 2025</h2>
          <p>
            India&rsquo;s Goods and Services Tax was simplified from a four-slab structure (5%, 12%, 18%, 28%) into a
            leaner one: <strong>0%, 5%, 18%, and a new 40% rate for sin and luxury goods</strong>. The awkward middle
            slabs of 12% and 28% were removed, with most items reclassified downward — 12% goods largely moving to 5%,
            and 28% goods to 18%. For everyday shopping the practical question is simple: for a given item, did its slab
            fall (cheaper) or rise into the 40% bracket (costlier)? This tool answers exactly that, one item at a time.
          </p>

          <h3>Why you divide before you compare</h3>
          <p>
            The one bit of arithmetic people get wrong is comparing an old price to a new rate directly. GST is charged
            on the <strong>base</strong> (pre-tax) price, so to compare fairly you must first remove the old tax to
            recover that base, then apply the new rate. If you know only the old MRP, switch the calculator to
            &ldquo;old MRP&rdquo; mode and it strips the old GST out for you before re-taxing at the new slab —
            otherwise the comparison is apples to oranges.
          </p>

          <h3>Worked examples</h3>
          <ul>
            <li>
              <strong>28% → 18% (e.g. a small appliance).</strong> On a ₹1,000 base price, the old price was ₹1,280 and
              the new price is ₹1,180 — <strong>₹100 cheaper, about 7.8%</strong> off the old price.
            </li>
            <li>
              <strong>12% → 5% (e.g. many packaged goods).</strong> A ₹1,000 base moves from ₹1,120 to ₹1,050 —{' '}
              <strong>₹70 cheaper, 6.25%</strong>.
            </li>
            <li>
              <strong>18% → 40% (an item reclassified as luxury/sin).</strong> A ₹1,000 base jumps from ₹1,180 to
              ₹1,400 — <strong>₹220 costlier</strong>. Not everything got cheaper.
            </li>
          </ul>
          <p>
            Notice the saving scales with the price: 7.8% is nothing on a ₹200 purchase but real money on a ₹40,000
            television. That is why the reform&rsquo;s impact is felt most on big-ticket goods.
          </p>

          <h2>What this comparison does and doesn&rsquo;t capture</h2>
          <p>
            The figure here isolates the <strong>GST component only</strong>. Whether a shop actually passes the full
            cut through to you depends on its pricing and margin — a lower slab reduces the tax, not necessarily the
            sticker price. The correct slab for any specific item also depends on its official classification, which is
            occasionally disputed. For routine billing where you simply need to add, remove, or reverse-extract GST at
            the current rates, the <a href="/gst-calculator">GST calculator</a>{' '}handles all three flows with the
            CGST/SGST/IGST split; this page is the one to use when you want to see how the reform itself moved a
            price.
          </p>
        </section>

        <CalcFAQ items={faqItems} title="GST 2.0 FAQ" />

        <CalculatorInfoPanel
          title="Methodology, assumptions, and source references"
          reviewedOn="June 28, 2026"
          inputs={['Amount (base price or old GST-inclusive MRP)', 'Old GST rate (5/12/18/28%)', 'New GST rate (0/5/18/40%)']}
          formulas={['Base = inclusive ÷ (1 + old rate) when an old MRP is entered', 'Old price = base × (1 + old rate); New price = base × (1 + new rate)', 'Savings = old price − new price']}
          assumptions={['Compares only the GST component; ignores discounts, cess, and dealer margin changes', 'New GST 2.0 structure effective 22 September 2025: 5%, 18%, 40% plus nil-rated', 'The correct slab for a specific item depends on its official classification']}
          sources={[{ label: 'CBIC GST portal', url: 'https://www.cbic-gst.gov.in/' }]}
          guideLinks={[{ label: 'GST calculator (add/remove/reverse)', href: '/gst-calculator' }]}
        />

        <p style={r.note}>Estimate for comparison only. Final invoice prices depend on item classification and seller pricing.</p>
      </CalcShell>
    </>
  );
};

export default GSTReformCalculator;
