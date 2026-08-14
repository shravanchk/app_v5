import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const tableStyle = { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '0.95rem' };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#eff6ff', border: '1px solid #dbe2eb', color: '#0f2a43' };
const tdStyle = { padding: '8px 10px', border: '1px solid #dbe2eb' };

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Tax on ₹12 Lakh Salary in FY 2026-27 (New Regime)',
    description:
      'Worked breakdown of income tax on a ₹12 lakh salary under the new regime for FY 2026-27, including the ₹75,000 standard deduction, the Section 87A rebate, and why take-home tax can be ₹0 up to ₹12.75 lakh.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-06-28',
    dateModified: '2026-06-28',
    mainEntityOfPage: 'https://upaman.com/guides/tax-on-12-lakh-salary-fy-2026-27'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is ₹12 lakh salary tax-free in FY 2026-27?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Under the new regime, a salaried person earning ₹12 lakh pays ₹0 income tax. After the ₹75,000 standard deduction the taxable income is ₹11.25 lakh, which is below the ₹12 lakh ceiling for the Section 87A rebate, so the rebate cancels the entire tax.'
        }
      },
      {
        '@type': 'Question',
        name: 'Up to what salary is tax zero under the new regime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Because of the ₹75,000 standard deduction, a salaried individual can earn up to ₹12.75 lakh and still have taxable income of ₹12 lakh or less, which the Section 87A rebate brings down to ₹0 tax.'
        }
      },
      {
        '@type': 'Question',
        name: 'What happens just above ₹12.75 lakh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Above ₹12 lakh taxable income the rebate no longer applies, but marginal relief ensures the extra tax never exceeds the extra income over ₹12 lakh. So the tax rises gradually rather than jumping.'
        }
      }
    ]
  }
];

export default function TaxOn12LakhSalaryGuide() {
  return (
    <GuidePageLayout
      title="Tax on ₹12 Lakh Salary in FY 2026-27: Why You Pay ₹0 (New Regime)"
      description="A worked, number-by-number breakdown of income tax on a ₹12 lakh salary under the new regime for FY 2026-27 — the ₹75,000 standard deduction, the Section 87A rebate, the ₹12.75 lakh zero-tax ceiling, and what happens just above it."
      canonicalPath="/guides/tax-on-12-lakh-salary-fy-2026-27"
      reviewedOn="June 28, 2026"
      reviewer="Tax Policy Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        &ldquo;I earn ₹12 lakh — how much tax do I pay?&rdquo; is one of the most-searched salary questions in India, and the
        answer surprises most people: under the new regime for FY 2026-27 (assessment year 2027-28), a salaried person on a
        ₹12 lakh salary pays <strong>₹0 income tax</strong>. This guide shows exactly why, with the actual numbers, and where
        the zero-tax band ends.
      </p>

      <h2 style={sectionTitleStyle}>The two things that make ₹12 lakh tax-free</h2>
      <p>
        Two separate provisions stack on top of each other, and confusing them is why so many people get the answer wrong:
      </p>
      <ul>
        <li>
          <strong>Standard deduction of ₹75,000</strong> — a flat reduction from salary income before tax is calculated. It is
          not a rebate; it lowers your taxable income.
        </li>
        <li>
          <strong>Section 87A rebate of up to ₹60,000</strong> — applied <em>after</em> tax is computed, it wipes out the tax
          entirely when your <em>taxable</em> income (after the standard deduction) is ₹12 lakh or less.
        </li>
      </ul>
      <p>
        So the ₹12 lakh threshold is measured on taxable income, while your salary can be a bit higher because the standard
        deduction is subtracted first.
      </p>

      <h2 style={sectionTitleStyle}>Worked example: ₹12 lakh salary</h2>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>Step</th><th style={thStyle}>Amount</th></tr>
          <tr><td style={tdStyle}>Gross salary</td><td style={tdStyle}>₹12,00,000</td></tr>
          <tr><td style={tdStyle}>Less: standard deduction</td><td style={tdStyle}>− ₹75,000</td></tr>
          <tr><td style={tdStyle}>Taxable income</td><td style={tdStyle}>₹11,25,000</td></tr>
          <tr><td style={tdStyle}>Tax before rebate (slab math)</td><td style={tdStyle}>₹52,500</td></tr>
          <tr><td style={tdStyle}>Less: Section 87A rebate</td><td style={tdStyle}>− ₹52,500</td></tr>
          <tr><td style={tdStyle}>Tax after rebate</td><td style={tdStyle}>₹0</td></tr>
          <tr><td style={tdStyle}>Health &amp; education cess (4%)</td><td style={tdStyle}>₹0</td></tr>
          <tr><td style={tdStyle}><strong>Total tax payable</strong></td><td style={tdStyle}><strong>₹0</strong></td></tr>
        </tbody>
      </table>
      <p>
        The slab tax of ₹52,500 is 5% on the ₹4–8 lakh band (₹20,000) plus 10% on ₹8 lakh to ₹11.25 lakh (₹32,500). Because
        taxable income is under ₹12 lakh, the rebate (capped at ₹60,000) is large enough to cancel it completely.
      </p>
      <p>
        <a href="/income-tax-calculator?salary=1200000&regime=new&s80c=0&s80d=0&nps=0">
          Open this example in the income tax calculator
        </a>{' '}
        — then push the salary past ₹12.75 lakh to see the rebate drop away and marginal relief take over.
      </p>

      <h2 style={sectionTitleStyle}>The real ceiling is ₹12.75 lakh, not ₹12 lakh</h2>
      <p>
        Since the ₹75,000 standard deduction comes off first, a salaried person can earn up to <strong>₹12.75 lakh</strong> and
        still land at ₹12 lakh taxable income — which the rebate brings to zero. This is the number to remember: for salary
        income in FY 2026-27, the new regime is effectively tax-free up to ₹12.75 lakh.
      </p>

      <h2 style={sectionTitleStyle}>What happens just above ₹12.75 lakh?</h2>
      <p>
        Cross the line and the rebate disappears — but a provision called <strong>marginal relief</strong> stops your tax from
        jumping suddenly. It caps the extra tax so it can never exceed the extra income above ₹12 lakh taxable. Here is a
        ₹13 lakh salary as an example:
      </p>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>Step</th><th style={thStyle}>Amount</th></tr>
          <tr><td style={tdStyle}>Gross salary</td><td style={tdStyle}>₹13,00,000</td></tr>
          <tr><td style={tdStyle}>Taxable income (after ₹75,000)</td><td style={tdStyle}>₹12,25,000</td></tr>
          <tr><td style={tdStyle}>Slab tax</td><td style={tdStyle}>₹63,750</td></tr>
          <tr><td style={tdStyle}>Income above ₹12L taxable</td><td style={tdStyle}>₹25,000</td></tr>
          <tr><td style={tdStyle}>Marginal relief</td><td style={tdStyle}>− ₹38,750</td></tr>
          <tr><td style={tdStyle}>Tax after relief</td><td style={tdStyle}>₹25,000</td></tr>
          <tr><td style={tdStyle}>Cess (4%)</td><td style={tdStyle}>₹1,000</td></tr>
          <tr><td style={tdStyle}><strong>Total tax</strong></td><td style={tdStyle}><strong>₹26,000</strong></td></tr>
        </tbody>
      </table>
      <p>
        Without marginal relief the tax would have been ₹63,750 plus cess on a salary just ₹25,000 over the cliff — clearly
        unfair. Marginal relief reduces it to ₹25,000 (the size of the extra income), so the effective tax on the amount above
        the threshold is gentle. We cover this mechanism in detail in the{' '}
        <a href="/guides/marginal-relief-new-regime-fy-2026-27">marginal relief guide</a>.
      </p>

      <h2 style={sectionTitleStyle}>Does the old regime ever beat this?</h2>
      <p>
        For a ₹12 lakh salary, almost never — the new regime is already at ₹0. The old regime only becomes competitive at
        higher incomes where you can document very large deductions (80C, 80D, home-loan interest, HRA). We work out the exact
        crossover in the{' '}
        <a href="/guides/old-vs-new-regime-breakeven-fy-2026-27">old vs new regime breakeven guide</a>.
      </p>

      <h2 style={sectionTitleStyle}>Check your own number</h2>
      <p>
        Plug your salary into Upaman&rsquo;s <a href="/income-tax-calculator">Income Tax Calculator</a> to see the slab-by-slab
        breakdown with rebate and cess, or use the <a href="/tax-regime-comparison">Tax Regime Comparison tool</a> to test old
        vs new side by side. For the full slab table see the{' '}
        <a href="/guides/india-income-tax-2026-27">FY 2026-27 income tax slabs guide</a>.
      </p>

      <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '28px' }}>
        This guide is for general information and planning, not tax advice. Surcharge, other income, and special cases can
        change the result. Confirm specifics on the{' '}
        <a href="https://www.incometax.gov.in/" target="_blank" rel="noopener noreferrer">Income Tax Department portal</a> or
        with a qualified professional.
      </p>
    </GuidePageLayout>
  );
}
