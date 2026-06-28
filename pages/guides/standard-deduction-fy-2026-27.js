import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const tableStyle = { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '0.95rem' };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#eff6ff', border: '1px solid #dbe2eb', color: '#0f2a43' };
const tdStyle = { padding: '8px 10px', border: '1px solid #dbe2eb' };

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Standard Deduction in FY 2026-27: ₹75,000 vs ₹50,000',
    description:
      'How the standard deduction works in FY 2026-27 — ₹75,000 in the new regime, ₹50,000 in the old regime — who is eligible, and how it changes your take-home pay.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-06-28',
    dateModified: '2026-06-28',
    mainEntityOfPage: 'https://upaman.com/guides/standard-deduction-fy-2026-27'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much is the standard deduction in FY 2026-27?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'The standard deduction is ₹75,000 under the new regime and ₹50,000 under the old regime for salaried individuals and pensioners in FY 2026-27. No bills or proof are required to claim it.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do I need to submit proof to claim the standard deduction?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No. The standard deduction is a flat, automatic reduction from salary or pension income. Unlike 80C or HRA, it needs no investment, rent receipts, or documentation.'
        }
      }
    ]
  }
];

export default function StandardDeductionGuide() {
  return (
    <GuidePageLayout
      title="Standard Deduction in FY 2026-27: ₹75,000 vs ₹50,000 Explained"
      description="The standard deduction is the easiest tax break in India — flat, automatic, and proof-free. This guide covers the ₹75,000 (new regime) and ₹50,000 (old regime) amounts for FY 2026-27, who qualifies, and the real effect on take-home pay."
      canonicalPath="/guides/standard-deduction-fy-2026-27"
      reviewedOn="June 28, 2026"
      reviewer="Tax Policy Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        The standard deduction is the simplest tax benefit a salaried person gets: a flat amount knocked off your salary income
        before tax is calculated, with no bills, receipts, or investments required. For FY 2026-27 it is{' '}
        <strong>₹75,000 under the new regime</strong> and <strong>₹50,000 under the old regime</strong>.
      </p>

      <h2 style={sectionTitleStyle}>New vs old regime at a glance</h2>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>Feature</th><th style={thStyle}>New regime</th><th style={thStyle}>Old regime</th></tr>
          <tr><td style={tdStyle}>Standard deduction</td><td style={tdStyle}>₹75,000</td><td style={tdStyle}>₹50,000</td></tr>
          <tr><td style={tdStyle}>Proof required</td><td style={tdStyle}>None</td><td style={tdStyle}>None</td></tr>
          <tr><td style={tdStyle}>Available to pensioners</td><td style={tdStyle}>Yes</td><td style={tdStyle}>Yes</td></tr>
          <tr><td style={tdStyle}>Other deductions (80C, HRA, etc.)</td><td style={tdStyle}>Mostly not allowed</td><td style={tdStyle}>Allowed</td></tr>
        </tbody>
      </table>
      <p>
        The extra ₹25,000 in the new regime is one reason it has become the default choice for most salaried taxpayers — you
        get a bigger flat deduction <em>and</em> lower slab rates, without having to lock money into tax-saving investments.
      </p>

      <h2 style={sectionTitleStyle}>Who can claim it</h2>
      <ul>
        <li><strong>Salaried employees</strong> — claimed automatically by employers in TDS calculations.</li>
        <li><strong>Pensioners</strong> — pension is taxed as salary, so the standard deduction applies.</li>
        <li>
          <strong>Family pension recipients</strong> get a separate, smaller standard deduction (a fixed amount or a portion of
          the pension, whichever is lower) rather than the salaried figure.
        </li>
      </ul>
      <p>
        Business and professional income does <em>not</em> get the salary standard deduction — it is specifically for salary
        and pension.
      </p>

      <h2 style={sectionTitleStyle}>What it actually saves you</h2>
      <p>
        The cash benefit equals the deduction multiplied by your marginal tax rate. In the new regime, ₹75,000 off your taxable
        income saves:
      </p>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>Your marginal rate</th><th style={thStyle}>Tax saved by ₹75,000 deduction</th></tr>
          <tr><td style={tdStyle}>5%</td><td style={tdStyle}>₹3,750</td></tr>
          <tr><td style={tdStyle}>10%</td><td style={tdStyle}>₹7,500</td></tr>
          <tr><td style={tdStyle}>20%</td><td style={tdStyle}>₹15,000</td></tr>
          <tr><td style={tdStyle}>30%</td><td style={tdStyle}>₹22,500</td></tr>
        </tbody>
      </table>
      <p>
        Add the 4% health and education cess and the benefit is slightly higher again. For someone in the 30% band the standard
        deduction alone is worth about ₹23,400 a year — for doing nothing.
      </p>

      <h2 style={sectionTitleStyle}>Why ₹75,000 matters at the ₹12 lakh threshold</h2>
      <p>
        The standard deduction is also what pushes the new regime&rsquo;s zero-tax point from ₹12 lakh of taxable income to{' '}
        <strong>₹12.75 lakh of salary</strong>. Because ₹75,000 comes off first, a ₹12.75 lakh salary becomes ₹12 lakh taxable,
        which the Section 87A rebate then reduces to ₹0. We walk through that in{' '}
        <a href="/guides/tax-on-12-lakh-salary-fy-2026-27">tax on a ₹12 lakh salary</a>.
      </p>

      <h2 style={sectionTitleStyle}>See it in your numbers</h2>
      <p>
        The <a href="/income-tax-calculator">Income Tax Calculator</a> applies the correct standard deduction for each regime,
        and the <a href="/salary-calculator">Salary Calculator</a> shows the effect on monthly take-home. To choose a regime,
        see the <a href="/guides/old-vs-new-regime-breakeven-fy-2026-27">breakeven guide</a> and the full{' '}
        <a href="/guides/india-income-tax-2026-27">FY 2026-27 slabs guide</a>.
      </p>

      <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '28px' }}>
        General information for planning, not tax advice. Eligibility for the family-pension deduction and special cases vary;
        confirm on the{' '}
        <a href="https://www.incometax.gov.in/" target="_blank" rel="noopener noreferrer">Income Tax Department portal</a>.
      </p>
    </GuidePageLayout>
  );
}
