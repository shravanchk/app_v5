import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from '../AffiliateRecommendations';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import CalculatorArticleLayout from '../calculator/CalculatorArticleLayout';
import { PieBreakdownChart } from '../calculator/ResultVisualizations';
import ResultActions from '../ResultActions';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { buildFaqSchema } from '../../utils/faqSchema';
import { formatINR } from '../../utils/calculations';

// GST 2.0 rate structure effective 22 September 2025: two main slabs (5%, 18%)
// plus a 40% rate for sin/luxury goods. The 12% and 28% slabs were abolished.
const commonGSTRates = [
  { value: 0, label: '0% — Nil-rated / exempt' },
  { value: 5, label: '5% — Merit / essential goods' },
  { value: 18, label: '18% — Standard (most goods/services)' },
  { value: 40, label: '40% — Sin / luxury goods' },
];

const breakdownOf = (gstAmount) => ({ cgst: gstAmount / 2, sgst: gstAmount / 2, igst: gstAmount });

const GSTCalculator = () => {
  const [activeTab, setActiveTab] = useState('add-gst');
  const [addGSTParams, setAddGSTParams] = useState({ amount: 10000, gstRate: 18 });
  const [removeGSTParams, setRemoveGSTParams] = useState({ amount: 11800, gstRate: 18 });
  const [reverseGSTParams, setReverseGSTParams] = useState({ inclusiveAmount: 11800, gstRate: 18 });

  const [addGSTResult, setAddGSTResult] = useState(null);
  const [removeGSTResult, setRemoveGSTResult] = useState(null);
  const [reverseGSTResult, setReverseGSTResult] = useState(null);

  const calculateAddGST = useCallback(() => {
    const { amount, gstRate } = addGSTParams;
    if (!amount || gstRate === null) return;
    const gstAmount = (amount * gstRate) / 100;
    setAddGSTResult({ originalAmount: amount, gstRate, gstAmount, totalAmount: amount + gstAmount, breakdown: breakdownOf(gstAmount) });
  }, [addGSTParams]);

  const calculateRemoveGST = useCallback(() => {
    const { amount, gstRate } = removeGSTParams;
    if (!amount || !gstRate) return;
    const baseAmount = (amount * 100) / (100 + gstRate);
    const gstAmount = amount - baseAmount;
    setRemoveGSTResult({ inclusiveAmount: amount, gstRate, baseAmount, gstAmount, breakdown: breakdownOf(gstAmount) });
  }, [removeGSTParams]);

  const calculateReverseGST = useCallback(() => {
    const { inclusiveAmount, gstRate } = reverseGSTParams;
    if (!inclusiveAmount || !gstRate) return;
    const baseAmount = (inclusiveAmount * 100) / (100 + gstRate);
    const gstAmount = inclusiveAmount - baseAmount;
    setReverseGSTResult({ inclusiveAmount, gstRate, baseAmount, gstAmount, breakdown: breakdownOf(gstAmount) });
  }, [reverseGSTParams]);

  useEffect(() => { calculateAddGST(); }, [calculateAddGST]);
  useEffect(() => { calculateRemoveGST(); }, [calculateRemoveGST]);
  useEffect(() => { calculateReverseGST(); }, [calculateReverseGST]);

  const num = (v) => parseFloat(v) || 0;

  const addShareLines = addGSTResult ? [`Base amount: ${formatINR(addGSTResult.originalAmount)}`, `GST (${addGSTResult.gstRate}%): ${formatINR(addGSTResult.gstAmount)}`, `Total amount: ${formatINR(addGSTResult.totalAmount)}`] : [];
  const removeShareLines = removeGSTResult ? [`GST-inclusive amount: ${formatINR(removeGSTResult.inclusiveAmount)}`, `GST (${removeGSTResult.gstRate}%): ${formatINR(removeGSTResult.gstAmount)}`, `Base amount: ${formatINR(removeGSTResult.baseAmount)}`] : [];
  const reverseShareLines = reverseGSTResult ? [`GST-inclusive amount: ${formatINR(reverseGSTResult.inclusiveAmount)}`, `GST (${reverseGSTResult.gstRate}%): ${formatINR(reverseGSTResult.gstAmount)}`, `Base amount: ${formatINR(reverseGSTResult.baseAmount)}`] : [];

  const faqItems = [
    { question: 'What is the difference between add GST and remove GST?', answer: 'Add GST computes total invoice value from base amount. Remove GST starts from inclusive invoice and extracts tax portion to find base value.' },
    { question: 'Does this tool show CGST, SGST, and IGST?', answer: 'Yes. The output provides split for CGST/SGST (intra-state concept) and references IGST amount for inter-state interpretation.' },
    { question: 'Can I use this for invoice drafting?', answer: 'Yes for quick estimation. Final invoices should still follow classification, place-of-supply, and compliance details in your accounting workflow.' },
    { question: 'Why can final GST differ from business books?', answer: 'Differences usually come from product classification, discounts, composite treatment, rounding policy, or mixed-rate invoices.' },
  ];
  const faqSchema = buildFaqSchema(faqItems);
  const softwareSchema = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Free GST Calculator India - Upaman',
    url: 'https://upaman.com/gst-calculator', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser',
    description: 'Free online GST calculator for India with add GST, remove GST, and reverse GST calculations including CGST, SGST, IGST breakdown.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    featureList: ['Add GST Calculator', 'Remove GST Calculator', 'Reverse GST Calculator', 'GST Breakdown'],
  };
  const relatedGuides = [
    { label: 'GST calculation decisions in context', href: '/guides/income-tax-regime-choice' },
    { label: 'EMI prepayment strategy guide', href: '/guides/emi-prepayment-strategy' },
    { label: 'Credit card minimum due trap guide', href: '/guides/credit-card-minimum-due-trap' },
  ];

  const rateOptions = commonGSTRates;

  const Breakdown = ({ b }) => (
    <Card className="p-4">
      <p className="mb-2 text-sm font-semibold text-ink dark:text-slate-100">Tax split</p>
      <div className="space-y-1.5 text-sm">
        <p className="flex justify-between text-ink-muted dark:text-slate-400">CGST (Central) <span className="font-medium text-ink dark:text-slate-100">{formatINR(b.cgst)}</span></p>
        <p className="flex justify-between text-ink-muted dark:text-slate-400">SGST (State) <span className="font-medium text-ink dark:text-slate-100">{formatINR(b.sgst)}</span></p>
        <p className="flex justify-between border-t border-slate-100 pt-1.5 text-ink-muted dark:border-slate-700 dark:text-slate-400">IGST (inter-state) <span className="font-medium text-ink dark:text-slate-100">{formatINR(b.igst)}</span></p>
      </div>
    </Card>
  );

  return (
    <>
      <Head>
        <title>GST Calculator India | Add, Remove &amp; Reverse GST (5/18/40) | Upaman</title>
        <meta name="description" content="Free GST Calculator India by Upaman. Calculate GST online - add, remove, reverse GST with CGST, SGST, IGST breakdown. Current GST 2.0 rates 5%, 18% and 40%." />
        <meta name="keywords" content="GST calculator India, add GST calculator, remove GST calculator, reverse GST calculator, GST breakdown, CGST SGST IGST calculator" />
        <link rel="canonical" href="https://upaman.com/gst-calculator" />
        <meta property="og:title" content="Free GST Calculator India | Upaman" />
        <meta property="og:description" content="Add, remove & reverse GST with complete CGST, SGST, IGST breakdown." />
        <meta property="og:url" content="https://upaman.com/gst-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <CalcLayout eyebrow="Taxes" title="GST Calculator" subtitle="Add GST to a base price, remove GST from an inclusive amount, or reverse-extract the base — with CGST/SGST/IGST split. GST 2.0 rates (5%, 18%, 40%).">
        <div className="mb-6">
          <Tabs tabs={[{ id: 'add-gst', label: 'Add GST' }, { id: 'remove-gst', label: 'Remove GST' }, { id: 'reverse-gst', label: 'Reverse GST' }]} active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === 'add-gst' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <div className="space-y-4">
                <NumberField id="add-amt" label="Base amount (before GST)" prefix="₹" value={addGSTParams.amount} onChange={(v) => setAddGSTParams((p) => ({ ...p, amount: num(v) }))} />
                <SelectField id="add-rate" label="GST rate" value={addGSTParams.gstRate} onChange={(v) => setAddGSTParams((p) => ({ ...p, gstRate: num(v) }))} options={rateOptions} />
              </div>
            </Card>
            <div className="space-y-5 lg:col-span-3">
              {addGSTResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultStat label="Total (incl. GST)" value={formatINR(addGSTResult.totalAmount)} emphasis tone="positive" />
                    <ResultStat label="Base amount" value={formatINR(addGSTResult.originalAmount)} />
                    <ResultStat label={`GST (${addGSTResult.gstRate}%)`} value={formatINR(addGSTResult.gstAmount)} />
                    <ResultStat label="Rate" value={`${addGSTResult.gstRate}%`} />
                  </div>
                  <Breakdown b={addGSTResult.breakdown} />
                  <Card className="p-5"><PieBreakdownChart title="Base vs GST" items={[{ label: 'Base amount', value: addGSTResult.originalAmount, color: '#3b82f6' }, { label: 'GST', value: addGSTResult.gstAmount, color: '#f59e0b' }]} formatter={formatINR} /></Card>
                  <AffiliateRecommendations calculatorType="gst" result={addGSTResult} isDarkMode={false} />
                  <ResultActions title="Add GST summary" summaryLines={addShareLines} fileName="upaman-gst-add.txt" />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'remove-gst' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <div className="space-y-4">
                <NumberField id="rem-amt" label="GST-inclusive amount" prefix="₹" value={removeGSTParams.amount} onChange={(v) => setRemoveGSTParams((p) => ({ ...p, amount: num(v) }))} />
                <SelectField id="rem-rate" label="GST rate" value={removeGSTParams.gstRate} onChange={(v) => setRemoveGSTParams((p) => ({ ...p, gstRate: num(v) }))} options={rateOptions} />
              </div>
            </Card>
            <div className="space-y-5 lg:col-span-3">
              {removeGSTResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultStat label="Base amount" value={formatINR(removeGSTResult.baseAmount)} emphasis tone="positive" />
                    <ResultStat label="Inclusive amount" value={formatINR(removeGSTResult.inclusiveAmount)} />
                    <ResultStat label={`GST (${removeGSTResult.gstRate}%)`} value={formatINR(removeGSTResult.gstAmount)} />
                    <ResultStat label="Rate" value={`${removeGSTResult.gstRate}%`} />
                  </div>
                  <Breakdown b={removeGSTResult.breakdown} />
                  <ResultActions title="Remove GST summary" summaryLines={removeShareLines} fileName="upaman-gst-remove.txt" />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reverse-gst' && (
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <div className="space-y-4">
                <NumberField id="rev-amt" label="Final amount received" prefix="₹" value={reverseGSTParams.inclusiveAmount} onChange={(v) => setReverseGSTParams((p) => ({ ...p, inclusiveAmount: num(v) }))} />
                <SelectField id="rev-rate" label="GST rate" value={reverseGSTParams.gstRate} onChange={(v) => setReverseGSTParams((p) => ({ ...p, gstRate: num(v) }))} options={rateOptions} />
              </div>
            </Card>
            <div className="space-y-5 lg:col-span-3">
              {reverseGSTResult && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultStat label="Original taxable value" value={formatINR(reverseGSTResult.baseAmount)} emphasis tone="positive" />
                    <ResultStat label="Final amount" value={formatINR(reverseGSTResult.inclusiveAmount)} />
                    <ResultStat label={`GST (${reverseGSTResult.gstRate}%)`} value={formatINR(reverseGSTResult.gstAmount)} />
                    <ResultStat label="Rate" value={`${reverseGSTResult.gstRate}%`} />
                  </div>
                  <Breakdown b={reverseGSTResult.breakdown} />
                  <ResultActions title="Reverse GST summary" summaryLines={reverseShareLines} fileName="upaman-gst-reverse.txt" />
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-10">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            reviewedOn="June 28, 2026"
            inputs={['Base amount or GST-inclusive amount and selected GST rate', 'Breakdown shows CGST/SGST split for intra-state and IGST reference for inter-state']}
            formulas={['Add GST: GST = amount × rate / 100; total = amount + GST', 'Remove GST: base = inclusive × 100 / (100 + rate); GST = inclusive - base']}
            assumptions={['Rate is applied uniformly to the full amount entered', 'Complex classification/composition-scheme scenarios are out of scope', 'Use official filing portals and professional advice for compliance decisions']}
            sources={[{ label: 'CBIC GST portal', url: 'https://www.cbic-gst.gov.in/' }, { label: 'GST common portal', url: 'https://www.gst.gov.in/' }]}
            guideLinks={[{ label: 'Income tax regime choice guide', href: '/guides/income-tax-regime-choice' }]}
          />
        </div>
      
        <HowToSection
          name="How to use the GST Calculator"
          description="Add or remove GST from any amount with the correct slab."
          steps={[
            { name: "Enter the amount", text: "Type the base or total amount you want to work with." },
            { name: "Pick the GST rate", text: "Select the applicable slab (5%, 12%, 18%, or 28%)." },
            { name: "Choose inclusive or exclusive", text: "Decide whether GST should be added to or extracted from the amount." },
            { name: "Review the result", text: "See the GST amount, CGST/SGST split, and net or gross total." }
          ]}
        />

      </CalcLayout>

      <CalculatorArticleLayout
        title="GST Calculator India: Add, Remove, and Reverse GST With Practical Breakdown"
        summary={(<p style={{ margin: 0 }}>Calculate GST-inclusive totals, extract GST from inclusive amounts, and verify CGST/SGST/IGST split in a few clicks. Educational explanation and practical guidance are available below the tool.</p>)}
        intro={(
          <>
            <p>GST calculation is one of the most repeated tasks for Indian businesses, freelancers, and billing teams. Yet confusion still appears in day-to-day operations because people switch between base-price quoting, inclusive pricing, and reverse extraction from customer-paid totals. A reliable GST page should therefore support all three flows: adding GST to a net amount, removing GST from an inclusive value, and reverse extraction for reconciliation checks. This page is designed to support those practical scenarios.</p>
            <p>The biggest source of errors is mixing pricing context. If a vendor quote is tax-exclusive, you add GST. If a marketplace payout is already GST-inclusive, you remove GST to know the base component. If you only know final billed total and tax rate, reverse calculation helps reconstruct taxable amount. Using the wrong mode can lead to under-collection or over-reporting. That is why this calculator separates each operation clearly and shows tax split outputs instead of only one final number.</p>
            <p>Another common pain point is communication across teams. Sales may think in final price, operations in taxable value, and finance in ledger tax buckets. By showing base, GST, and total in one place, this page becomes a shared reference during invoice drafting, quotation validation, and sanity checks before return preparation. It is not a filing engine, but it reduces routine arithmetic errors that create compliance friction later.</p>
          </>
        )}
        explanation={(
          <>
            <p>Core formulas are simple but must be applied in the right order. For add-GST mode, GST amount equals base amount multiplied by rate divided by 100. Total invoice value is base plus GST. For remove-GST mode, you cannot subtract percentage directly from inclusive total. Instead, first derive base as: inclusive × 100 / (100 + rate). Then GST equals inclusive minus base.</p>
            <p>Reverse mode follows the same extraction logic as remove mode, but the interface emphasizes reconciliation: you enter a final amount and recover original taxable value. This helps when reviewing payment messages, gross receipts, settlement files, or manually shared totals without detailed invoice lines. The page then displays both tax component and original amount to support bookkeeping decisions.</p>
            <p>CGST and SGST are shown as equal halves of GST amount for the common intra-state interpretation. IGST is shown as full GST reference for inter-state context. This representation is intentionally transparent for quick review. Complex legal treatment can vary by supply type, product classification, and jurisdictional rules, so operational teams should still validate edge cases in their official workflow.</p>
            <p>Using a structured calculator also helps standardize rounding behavior. Manual spreadsheet formulas often differ across teams because of inconsistent decimal handling. Here, one consistent method is applied across all three modes so the logic remains stable when rate or amount changes. This is especially useful for high-volume quoting, recurring billing, and audit-prep spot checks.</p>
          </>
        )}
        example={(
          <>
            <p>Assume your taxable service amount is ₹10,000 and GST rate is 18%. In add-GST mode, tax is ₹1,800 and total invoice becomes ₹11,800. Now imagine you receive only final amount ₹11,800 from a partner statement and need base value for accounting. In remove-GST or reverse mode, base becomes ₹10,000 and GST is recovered as ₹1,800. The same number set validates that both forward and reverse operations align.</p>
            <p>If a team member incorrectly subtracts 18% from ₹11,800 directly, they may get ₹9,676 as base, which is wrong for inclusive extraction. The denominator method (100 + rate) avoids this mistake. This example is why mode selection matters as much as formula accuracy.</p>
          </>
        )}
        tips={(
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            <li>Always confirm whether the amount you entered is GST-inclusive or tax-exclusive.</li>
            <li>Use remove/reverse mode for settlement files and payout reports that provide final values only.</li>
            <li>Keep rate selection aligned with product/service classification before invoice generation.</li>
            <li>Do not use direct percentage subtraction to extract base from inclusive totals.</li>
            <li>Reconcile with official GST returns and accounting books before submission deadlines.</li>
          </ul>
        )}
        faq={(
          <>
            {faqItems.map((item) => (
              <div key={item.question} style={{ marginBottom: '0.65rem' }}>
                <h3 style={{ margin: '0 0 0.15rem', fontSize: '0.95rem', color: '#0f2a43' }}>{item.question}</h3>
                <p style={{ margin: 0 }}>{item.answer}</p>
              </div>
            ))}
          </>
        )}
        relatedGuides={relatedGuides}
        methodology={(
          <>
            <p>Methodology is deterministic arithmetic with three explicit pathways: add-GST, remove-GST, and reverse extraction. CGST/SGST split is represented as half-half for display and IGST as full-tax reference. The model assumes single-rate application over the entered amount.</p>
            <p>Assumptions and limits: mixed-rate invoices, exemptions, classification disputes, and composition-scheme scenarios are outside this quick calculator scope. Treat output as operational estimate and verify against your compliance process and official GST portal guidance.</p>
          </>
        )}
      >
        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Choose the appropriate GST operation above based on whether your amount is exclusive or inclusive of tax.</p>
      </CalculatorArticleLayout>
    </>
  );
};

export default GSTCalculator;
