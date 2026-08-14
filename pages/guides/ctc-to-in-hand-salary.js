import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const tableStyle = { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '0.95rem' };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#eff6ff', border: '1px solid #dbe2eb', color: '#0f2a43' };
const tdStyle = { padding: '8px 10px', border: '1px solid #dbe2eb' };

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'CTC to In-Hand Salary: How to Calculate (FY 2026-27)',
    description:
      'A step-by-step breakdown of how cost-to-company (CTC) becomes monthly in-hand salary in India — what employer PF, gratuity, employee PF, professional tax, and income tax take out, with a worked ₹12 lakh CTC example for FY 2026-27.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-06-28',
    dateModified: '2026-06-28',
    mainEntityOfPage: 'https://upaman.com/guides/ctc-to-in-hand-salary'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Why is my in-hand salary so much less than my CTC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'CTC includes amounts that never reach your bank account each month — the employer’s PF contribution and gratuity provision. On top of that, your own PF, professional tax, and income tax (TDS) are deducted from your gross salary. Together these can make in-hand 10–20% lower than CTC.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much is the in-hand salary for a ₹12 lakh CTC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'For a typical ₹12 lakh CTC with a 45% basic, the in-hand works out to roughly ₹86,800 per month under the new regime for FY 2026-27, because income tax on a ₹12 lakh salary is ₹0 and the main deductions are employer/employee PF, gratuity, and professional tax.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is employer PF part of CTC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes. The employer’s 12% PF contribution is counted inside CTC but is not paid to you as salary — it goes into your EPF account. That is one reason CTC is always higher than your gross or in-hand salary.'
        }
      }
    ]
  }
];

export default function CtcToInHandSalaryGuide() {
  return (
    <GuidePageLayout
      title="CTC to In-Hand Salary: How to Calculate (FY 2026-27)"
      description="A clear, number-by-number breakdown of how CTC becomes monthly in-hand salary in India — employer PF, gratuity, employee PF, professional tax, and income tax — with a worked ₹12 lakh CTC example for FY 2026-27."
      canonicalPath="/guides/ctc-to-in-hand-salary"
      reviewedOn="June 28, 2026"
      reviewer="Personal Finance Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        The number on your offer letter (the CTC) is almost never the number that lands in your bank account. A ₹12 lakh CTC
        does not mean ₹1 lakh a month in-hand — it is usually closer to ₹87,000. This guide explains <strong>exactly where the
        gap goes</strong>, step by step, with a full worked example for FY 2026-27, so you can estimate your own take-home before
        you accept an offer.
      </p>

      <h2 style={sectionTitleStyle}>The three salary numbers, and how they differ</h2>
      <ul>
        <li>
          <strong>CTC (Cost to Company)</strong> — everything the employer spends on you in a year, including parts you never
          receive as cash, like their PF contribution and gratuity provision.
        </li>
        <li>
          <strong>Gross salary</strong> — CTC minus the employer&rsquo;s own contributions. This is the figure shown at the top
          of your payslip, before deductions.
        </li>
        <li>
          <strong>In-hand (net) salary</strong> — gross salary minus your own PF, professional tax, and income tax. This is what
          actually reaches your account.
        </li>
      </ul>
      <p>
        So there are two shrink steps: <em>CTC → gross</em> (employer contributions removed) and <em>gross → in-hand</em> (your
        deductions removed).
      </p>

      <h2 style={sectionTitleStyle}>What sits inside a typical CTC</h2>
      <p>
        Most Indian salary structures split CTC roughly like this. The exact percentages vary by employer, but a 45% basic is a
        common benchmark:
      </p>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>Component</th><th style={thStyle}>Annual amount</th><th style={thStyle}>Reaches you monthly?</th></tr>
          <tr><td style={tdStyle}>Basic salary (45% of CTC)</td><td style={tdStyle}>₹5,40,000</td><td style={tdStyle}>Yes</td></tr>
          <tr><td style={tdStyle}>HRA (50% of basic)</td><td style={tdStyle}>₹2,70,000</td><td style={tdStyle}>Yes</td></tr>
          <tr><td style={tdStyle}>Special allowance (balancing figure)</td><td style={tdStyle}>₹2,99,226</td><td style={tdStyle}>Yes</td></tr>
          <tr><td style={tdStyle}>Employer PF (12% of basic)</td><td style={tdStyle}>₹64,800</td><td style={tdStyle}>No — goes to EPF</td></tr>
          <tr><td style={tdStyle}>Gratuity provision (4.81% of basic)</td><td style={tdStyle}>₹25,974</td><td style={tdStyle}>No — paid on exit</td></tr>
          <tr><td style={tdStyle}><strong>Total CTC</strong></td><td style={tdStyle}><strong>₹12,00,000</strong></td><td style={tdStyle}></td></tr>
        </tbody>
      </table>
      <p>
        The last two rows are the surprise for most people: <strong>₹90,774 of a ₹12 lakh CTC is never paid to you as monthly
        salary.</strong> The employer PF builds your retirement corpus, and gratuity is only paid out when you leave (after 5
        years of service).
      </p>

      <h2 style={sectionTitleStyle}>Step 1: CTC → Gross salary</h2>
      <p>Remove the employer&rsquo;s own contributions:</p>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>Step</th><th style={thStyle}>Amount</th></tr>
          <tr><td style={tdStyle}>CTC</td><td style={tdStyle}>₹12,00,000</td></tr>
          <tr><td style={tdStyle}>Less: employer PF</td><td style={tdStyle}>− ₹64,800</td></tr>
          <tr><td style={tdStyle}>Less: gratuity provision</td><td style={tdStyle}>− ₹25,974</td></tr>
          <tr><td style={tdStyle}><strong>Gross salary</strong></td><td style={tdStyle}><strong>₹11,09,226</strong></td></tr>
        </tbody>
      </table>

      <h2 style={sectionTitleStyle}>Step 2: Gross → In-hand salary</h2>
      <p>Now remove your own deductions. Under the new regime for FY 2026-27, income tax on a ₹12 lakh salary is ₹0:</p>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>Step</th><th style={thStyle}>Amount</th></tr>
          <tr><td style={tdStyle}>Gross salary</td><td style={tdStyle}>₹11,09,226</td></tr>
          <tr><td style={tdStyle}>Less: employee PF (12% of basic)</td><td style={tdStyle}>− ₹64,800</td></tr>
          <tr><td style={tdStyle}>Less: professional tax (metro, ₹2,500/yr cap)</td><td style={tdStyle}>− ₹2,500</td></tr>
          <tr><td style={tdStyle}>Less: income tax / TDS (new regime)</td><td style={tdStyle}>− ₹0</td></tr>
          <tr><td style={tdStyle}><strong>In-hand (annual)</strong></td><td style={tdStyle}><strong>₹10,41,926</strong></td></tr>
          <tr><td style={tdStyle}><strong>In-hand (per month)</strong></td><td style={tdStyle}><strong>≈ ₹86,827</strong></td></tr>
        </tbody>
      </table>
      <p>
        So a ₹12 lakh CTC becomes about <strong>₹86,800 a month</strong> — roughly 87% of CTC reaches you, with the rest going
        into your PF (which is still your money) and a small professional tax. Because the new-regime tax is ₹0 here, tax is not
        the thing eating your salary at this level — PF is. We explain why the tax is zero in the{' '}
        <a href="/guides/tax-on-12-lakh-salary-fy-2026-27">tax on ₹12 lakh salary guide</a>.
      </p>

      <h2 style={sectionTitleStyle}>Why the gap widens at higher salaries</h2>
      <p>
        At ₹12 lakh the tax was ₹0, so the CTC-to-in-hand gap was small. As salary rises past the rebate ceiling, income tax
        starts to apply and the gap grows. At ₹20–25 lakh CTC, in-hand can fall to 70–75% of CTC once tax, PF, and a larger
        special-allowance structure are accounted for. This is where choosing the right tax regime matters — compare them in the{' '}
        <a href="/tax-regime-comparison">Tax Regime Comparison tool</a>.
      </p>

      <h2 style={sectionTitleStyle}>What changes the result for you</h2>
      <ul>
        <li><strong>Basic percentage</strong> — a higher basic means more PF and gratuity (more goes to retirement, less to monthly cash).</li>
        <li><strong>Variable pay / bonus</strong> — if part of CTC is a performance bonus, it is not guaranteed and is paid annually, not monthly.</li>
        <li><strong>Professional tax</strong> — varies by state (₹0 in some, up to ₹2,500/year in others).</li>
        <li><strong>Tax regime and deductions</strong> — old vs new changes the TDS, which directly changes in-hand.</li>
        <li><strong>Other CTC items</strong> — insurance premiums, meal cards, or NPS can also sit inside CTC.</li>
      </ul>

      <h2 style={sectionTitleStyle}>Estimate your own in-hand</h2>
      <p>
        Use Upaman&rsquo;s <a href="/salary-calculator?ctc=1200000&city=metro">Salary Calculator</a> — opened on the
        ₹12 lakh CTC from this guide — to convert your CTC into a monthly in-hand figure
        with the PF, professional tax, and tax deductions worked out for you. To see how the tax piece changes your take-home,
        run your number through the <a href="/income-tax-calculator?salary=1200000&regime=new">Income Tax Calculator</a>, and read the{' '}
        <a href="/guides/standard-deduction-fy-2026-27">standard deduction guide</a> to understand the flat ₹75,000 that lowers
        your taxable salary first.
      </p>

      <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '28px' }}>
        This guide is for general planning, not tax or financial advice. Actual salary structures, state professional tax, and
        deductions vary by employer and location. Confirm specifics with your HR/payroll team or a qualified professional.
      </p>
    </GuidePageLayout>
  );
}
