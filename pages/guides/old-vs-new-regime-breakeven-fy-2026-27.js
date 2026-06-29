import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const scrollWrap = { overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '16px 0' };
const tableStyle = { width: '100%', minWidth: '480px', borderCollapse: 'collapse', fontSize: '0.95rem' };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#eff6ff', border: '1px solid #dbe2eb', color: '#0f2a43' };
const tdStyle = { padding: '8px 10px', border: '1px solid #dbe2eb' };

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Old vs New Tax Regime Breakeven for FY 2026-27',
    description:
      'How much in deductions you need before the old regime beats the new regime in FY 2026-27, with a worked breakeven table across salary levels from ₹14 lakh to ₹25 lakh.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-06-28',
    dateModified: '2026-06-28',
    mainEntityOfPage: 'https://upaman.com/guides/old-vs-new-regime-breakeven-fy-2026-27'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'When is the old tax regime better than the new regime in FY 2026-27?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'The old regime only wins when your documented deductions are very large. At ₹16 lakh salary you need roughly ₹6.2 lakh of total deductions (including the ₹50,000 standard deduction) to match the new regime; below that, the new regime costs less.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does the breakeven deduction change with income?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes. The higher your salary, the more deductions you need to make the old regime worthwhile — about ₹5.7 lakh at ₹14 lakh income, rising to around ₹8.5 lakh at ₹25 lakh income.'
        }
      }
    ]
  }
];

export default function OldVsNewRegimeBreakevenGuide() {
  return (
    <GuidePageLayout
      title="Old vs New Tax Regime: Where Is the Breakeven in FY 2026-27?"
      description="The new regime is the default for FY 2026-27 and wins for most salaried people. This guide shows exactly how much in old-regime deductions you need before it pays to switch back — with a worked breakeven table from ₹14 lakh to ₹25 lakh."
      canonicalPath="/guides/old-vs-new-regime-breakeven-fy-2026-27"
      reviewedOn="June 28, 2026"
      reviewer="Tax Policy Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        Since the new regime added a ₹75,000 standard deduction and a Section 87A rebate that makes income up to ₹12 lakh
        tax-free, it has become the default and the cheaper option for most salaried taxpayers in FY 2026-27. The old regime
        only wins if you can claim enough deductions to overcome the new regime&rsquo;s lower rates. The practical question is
        therefore: <strong>how big do my deductions need to be?</strong>
      </p>

      <h2 style={sectionTitleStyle}>The breakeven, by salary level</h2>
      <p>
        For each salary below, we computed the new-regime tax, then found the level of old-regime deductions that produces an
        equal tax bill. If your real, documentable deductions exceed the &ldquo;deductions needed&rdquo; figure, the old regime
        is cheaper; otherwise stay on the new regime.
      </p>
      <div style={scrollWrap}>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <th style={thStyle}>Gross salary</th>
            <th style={thStyle}>New-regime tax (incl. cess)</th>
            <th style={thStyle}>Deductions needed to match (old regime)</th>
          </tr>
          <tr><td style={tdStyle}>₹14,00,000</td><td style={tdStyle}>₹81,900</td><td style={tdStyle}>≈ ₹5,68,750</td></tr>
          <tr><td style={tdStyle}>₹16,00,000</td><td style={tdStyle}>₹1,13,100</td><td style={tdStyle}>≈ ₹6,18,750</td></tr>
          <tr><td style={tdStyle}>₹20,00,000</td><td style={tdStyle}>₹1,92,400</td><td style={tdStyle}>≈ ₹7,58,333</td></tr>
          <tr><td style={tdStyle}>₹25,00,000</td><td style={tdStyle}>₹3,19,800</td><td style={tdStyle}>≈ ₹8,50,000</td></tr>
        </tbody>
      </table>
      </div>
      <p>
        The pattern is clear: the more you earn, the larger the deduction pile you need before the old regime is worth it. That
        is because the new regime&rsquo;s rate advantage grows with income.
      </p>

      <h2 style={sectionTitleStyle}>Can you realistically reach those numbers?</h2>
      <p>
        Add up what a typical salaried person can actually claim under the old regime:
      </p>
      <div style={scrollWrap}>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>Deduction</th><th style={thStyle}>Typical maximum</th></tr>
          <tr><td style={tdStyle}>Standard deduction</td><td style={tdStyle}>₹50,000</td></tr>
          <tr><td style={tdStyle}>Section 80C (EPF, ELSS, PPF, insurance, etc.)</td><td style={tdStyle}>₹1,50,000</td></tr>
          <tr><td style={tdStyle}>Section 80D (health insurance)</td><td style={tdStyle}>₹25,000</td></tr>
          <tr><td style={tdStyle}>Section 80CCD(1B) — NPS</td><td style={tdStyle}>₹50,000</td></tr>
          <tr><td style={tdStyle}>Home-loan interest (Section 24b)</td><td style={tdStyle}>₹2,00,000</td></tr>
          <tr><td style={tdStyle}><strong>Subtotal (without HRA)</strong></td><td style={tdStyle}><strong>₹4,75,000</strong></td></tr>
        </tbody>
      </table>
      </div>
      <p>
        Without HRA, most people top out around ₹4.75 lakh — below the breakeven at every salary in the table. The taxpayers
        for whom the old regime still wins almost always have <strong>two things together</strong>: a home loan (₹2 lakh
        interest) <em>and</em> meaningful HRA exemption from renting in a metro. If you have only one of those, the new regime
        usually wins.
      </p>

      <h2 style={sectionTitleStyle}>Worked example: ₹16 lakh salary</h2>
      <p>
        Under the new regime, a ₹16 lakh salary has taxable income of ₹15.25 lakh and a tax of ₹1,13,100 including cess. To
        match that under the old regime you would need taxable income of about ₹9.81 lakh — meaning roughly{' '}
        <strong>₹6.19 lakh of deductions</strong>. Even claiming the full ₹4.75 lakh above, you would still need about ₹1.44
        lakh of HRA exemption on top just to break even. Anything less and the new regime is cheaper.
      </p>

      <h2 style={sectionTitleStyle}>Two cautions before you choose the old regime</h2>
      <ul>
        <li>
          <strong>Only count deductions you will actually make and can prove.</strong> Choosing the old regime on the
          assumption that you will invest ₹1.5 lakh in 80C — and then not doing it — leaves you worse off.
        </li>
        <li>
          <strong>The new regime is automatic.</strong> It applies unless you actively opt for the old regime, and salaried
          taxpayers can switch each year.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>Run your own comparison</h2>
      <p>
        Enter your real deductions in the <a href="/tax-regime-comparison">Tax Regime Comparison tool</a> or the{' '}
        <a href="/income-tax-calculator">Income Tax Calculator</a> to see both regimes side by side. For the underlying slabs
        see the <a href="/guides/india-income-tax-2026-27">FY 2026-27 slabs guide</a>, and for why ₹12 lakh is tax-free read{' '}
        <a href="/guides/tax-on-12-lakh-salary-fy-2026-27">tax on a ₹12 lakh salary</a>.
      </p>

      <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '28px' }}>
        Figures are rounded planning estimates and exclude surcharge and special-income cases. This is general information, not
        tax advice. Verify on the{' '}
        <a href="https://www.incometax.gov.in/" target="_blank" rel="noopener noreferrer">Income Tax Department portal</a>.
      </p>
    </GuidePageLayout>
  );
}
