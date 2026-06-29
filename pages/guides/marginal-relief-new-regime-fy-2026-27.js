import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const scrollWrap = { overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '16px 0' };
const tableStyle = { width: '100%', minWidth: '520px', borderCollapse: 'collapse', fontSize: '0.95rem' };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#eff6ff', border: '1px solid #dbe2eb', color: '#0f2a43' };
const tdStyle = { padding: '8px 10px', border: '1px solid #dbe2eb' };

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Marginal Relief in the New Tax Regime (FY 2026-27)',
    description:
      'How marginal relief works just above the ₹12 lakh rebate threshold in the new regime for FY 2026-27, the exact income band it covers, and a worked table of tax in that zone.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-06-28',
    dateModified: '2026-06-28',
    mainEntityOfPage: 'https://upaman.com/guides/marginal-relief-new-regime-fy-2026-27'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is marginal relief in the new tax regime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Marginal relief ensures that when your taxable income crosses ₹12 lakh and you lose the Section 87A rebate, the extra tax never exceeds the extra income above ₹12 lakh. Inside the relief band your income tax equals the amount by which taxable income exceeds ₹12 lakh.'
        }
      },
      {
        '@type': 'Question',
        name: 'Up to what income does marginal relief apply?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Marginal relief applies for taxable income between ₹12,00,000 and approximately ₹12,70,588. Above that point the normal slab tax is lower than the relief cap, so you simply pay the regular tax.'
        }
      }
    ]
  }
];

export default function MarginalReliefGuide() {
  return (
    <GuidePageLayout
      title="Marginal Relief in the New Regime (FY 2026-27): The ₹12 Lakh Cliff Explained"
      description="When taxable income crosses ₹12 lakh you lose the Section 87A rebate — but marginal relief stops your tax from jumping. This guide shows the exact income band it covers, the simple rule inside it, and a worked tax table for FY 2026-27."
      canonicalPath="/guides/marginal-relief-new-regime-fy-2026-27"
      reviewedOn="June 28, 2026"
      reviewer="Tax Policy Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        In the new regime for FY 2026-27, taxable income up to ₹12 lakh pays no tax thanks to the Section 87A rebate. The moment
        you go even ₹1 over, the rebate vanishes. Without a safeguard, someone at ₹12,00,100 taxable would owe roughly ₹60,000
        in tax on ₹100 of extra income — absurd. <strong>Marginal relief</strong> is the rule that prevents exactly this.
      </p>

      <h2 style={sectionTitleStyle}>The rule, in one sentence</h2>
      <p>
        Inside the relief band, your income tax (before cess) is capped at the amount by which your taxable income exceeds
        ₹12 lakh. Earn ₹25,000 over the line and your tax is ₹25,000 — not a rupee more. The extra income is effectively taxed
        at 100% at the very edge and then tapers, which sounds harsh but is far better than losing the whole rebate at once.
      </p>

      <h2 style={sectionTitleStyle}>Where does the relief band end?</h2>
      <p>
        Marginal relief applies only while the normal slab tax is larger than the &ldquo;excess over ₹12 lakh&rdquo;. Solving
        for the point where they are equal gives a band of:
      </p>
      <p style={{ textAlign: 'center', fontWeight: 600, color: '#0f2a43' }}>
        ₹12,00,000 &nbsp;to&nbsp; ≈ ₹12,70,588 (taxable income)
      </p>
      <p>
        Below ₹12 lakh: zero tax (rebate). Inside the band: tax equals the excess over ₹12 lakh. Above ≈ ₹12.71 lakh: ordinary
        slab tax, because by then the regular tax is the smaller number.
      </p>

      <h2 style={sectionTitleStyle}>Worked table inside the relief band</h2>
      <div style={scrollWrap}>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <th style={thStyle}>Taxable income</th>
            <th style={thStyle}>Excess over ₹12L</th>
            <th style={thStyle}>Tax after relief</th>
            <th style={thStyle}>Cess (4%)</th>
            <th style={thStyle}>Total</th>
          </tr>
          <tr><td style={tdStyle}>₹12,10,000</td><td style={tdStyle}>₹10,000</td><td style={tdStyle}>₹10,000</td><td style={tdStyle}>₹400</td><td style={tdStyle}>₹10,400</td></tr>
          <tr><td style={tdStyle}>₹12,25,000</td><td style={tdStyle}>₹25,000</td><td style={tdStyle}>₹25,000</td><td style={tdStyle}>₹1,000</td><td style={tdStyle}>₹26,000</td></tr>
          <tr><td style={tdStyle}>₹12,50,000</td><td style={tdStyle}>₹50,000</td><td style={tdStyle}>₹50,000</td><td style={tdStyle}>₹2,000</td><td style={tdStyle}>₹52,000</td></tr>
          <tr><td style={tdStyle}>₹12,70,000</td><td style={tdStyle}>₹70,000</td><td style={tdStyle}>₹70,000</td><td style={tdStyle}>₹2,800</td><td style={tdStyle}>₹72,800</td></tr>
        </tbody>
      </table>
      </div>
      <p>
        Notice the &ldquo;tax after relief&rdquo; column simply mirrors the excess column — that is the whole mechanism. Once
        taxable income passes ≈ ₹12,70,588, the normal slab tax (which keeps rising at 15%) becomes the lower figure and relief
        stops mattering.
      </p>

      <h2 style={sectionTitleStyle}>Don&rsquo;t forget the ₹75,000 standard deduction</h2>
      <p>
        These figures are on <em>taxable</em> income. For salaried people, subtract the ₹75,000 standard deduction from salary
        first. So a ₹13 lakh salary becomes ₹12.25 lakh taxable, landing inside the relief band with ₹26,000 total tax. This is
        why the practical zero-tax salary ceiling is ₹12.75 lakh — covered in{' '}
        <a href="/guides/tax-on-12-lakh-salary-fy-2026-27">tax on a ₹12 lakh salary</a>.
      </p>

      <h2 style={sectionTitleStyle}>See it for your income</h2>
      <p>
        The <a href="/income-tax-calculator">Income Tax Calculator</a> applies the rebate, marginal relief, and cess
        automatically and shows each step. For the full slab structure see the{' '}
        <a href="/guides/india-income-tax-2026-27">FY 2026-27 slabs guide</a>; to decide between regimes use the{' '}
        <a href="/guides/old-vs-new-regime-breakeven-fy-2026-27">breakeven guide</a>.
      </p>

      <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '28px' }}>
        The ≈ ₹12,70,588 boundary is derived from the FY 2026-27 slab rates and rounds slightly depending on how the department
        applies relief. This is general information, not tax advice. Confirm on the{' '}
        <a href="https://www.incometax.gov.in/" target="_blank" rel="noopener noreferrer">Income Tax Department portal</a>.
      </p>
    </GuidePageLayout>
  );
}
