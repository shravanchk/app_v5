import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Read Your US Paycheck (2026)',
  description: 'What every line on a US pay stub means: federal income tax, Social Security, Medicare, pre-tax deductions, and state withholding — with a worked $70,000 example.',
  author: { '@type': 'Organization', name: 'Upaman Research Team' },
  publisher: { '@type': 'Organization', name: 'Upaman' },
  datePublished: '2026-07-03',
  dateModified: '2026-07-03',
  mainEntityOfPage: 'https://upaman.com/guides/how-to-read-your-paycheck'
};

export default function ReadYourPaycheckGuidePage() {
  return (
    <GuidePageLayout
      title="How to Read Your US Paycheck (2026)"
      description="Understand every deduction on your US pay stub: federal income tax brackets, Social Security, Medicare, 401(k) and other pre-tax items, and state withholding — with a worked $70,000 example."
      canonicalPath="/guides/how-to-read-your-paycheck"
      reviewedOn="July 3, 2026"
      reviewer="US Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        The gap between your salary and your bank deposit comes from four buckets: federal income tax, FICA
        (Social Security and Medicare), state income tax, and your own pre-tax elections such as a 401(k) or health
        premiums. Once you can place every pay-stub line into one of those buckets, no paycheck is confusing.
      </p>

      <h2 style={sectionTitleStyle}>1. Gross pay vs taxable wages</h2>
      <p>
        <strong>Gross pay</strong> is your salary for the period. <strong>Federal taxable wages</strong> are usually
        smaller: pre-tax deductions — traditional 401(k)/403(b) contributions, most health, dental and vision premiums,
        HSA and FSA contributions — come out before income tax is calculated. Note that 401(k) contributions reduce
        income tax but <em>not</em> Social Security or Medicare, which are charged on your full wages.
      </p>

      <h2 style={sectionTitleStyle}>2. Federal income tax</h2>
      <p>
        For tax year 2026, a single filer's standard deduction is <strong>$16,100</strong> ($32,200 married filing
        jointly, $24,150 head of household). Income above it is taxed in brackets — for a single filer:
      </p>
      <ul>
        <li>10% on taxable income up to $12,400</li>
        <li>12% from $12,400 to $50,400</li>
        <li>22% from $50,400 to $105,700</li>
        <li>24% from $105,700 to $201,775</li>
        <li>32%, 35% and 37% above that</li>
      </ul>
      <p>
        Only the income <em>inside</em> each bracket is taxed at that bracket's rate. A raise into a higher bracket
        never reduces your take-home pay — only the extra dollars are taxed at the higher rate.
      </p>

      <h2 style={sectionTitleStyle}>3. FICA: Social Security and Medicare</h2>
      <ul>
        <li><strong>Social Security:</strong> 6.2% of wages, up to the 2026 wage base of $184,500. Above that, the deduction stops for the year.</li>
        <li><strong>Medicare:</strong> 1.45% of all wages, with no cap.</li>
        <li><strong>Additional Medicare:</strong> an extra 0.9% on wages above $200,000 (single) or $250,000 (married filing jointly).</li>
      </ul>
      <p>Your employer pays a matching 6.2% + 1.45% on top — it just never appears on your stub.</p>

      <h2 style={sectionTitleStyle}>4. State income tax</h2>
      <p>
        Nine states — Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and
        Wyoming — charge no state income tax on wages. The rest use flat rates or progressive brackets, and a few
        cities and counties add local tax. See{' '}
        <a href="/paycheck">take-home pay in every state</a> for how much this varies.
      </p>

      <h2 style={sectionTitleStyle}>Worked example: $70,000, single, no-tax state</h2>
      <ul>
        <li>Federal income tax: <strong>$6,570</strong> (on $53,900 taxable after the standard deduction)</li>
        <li>Social Security: <strong>$4,340</strong> (6.2% of $70,000)</li>
        <li>Medicare: <strong>$1,015</strong> (1.45% of $70,000)</li>
        <li>Take-home: <strong>$58,075/year</strong> ≈ $4,840/month — an effective tax rate of 17%</li>
      </ul>
      <p>
        In a state with income tax the same salary lands lower — around $55,458 in California. See the full 50-state
        table for <a href="/after-taxes/70000">$70,000 after taxes</a>, or pick{' '}
        <a href="/after-taxes">any salary from $30k to $250k</a>.
      </p>

      <h2 style={sectionTitleStyle}>Checking your own numbers</h2>
      <p>
        If your withholding looks off, the usual causes are an outdated W-4, a second job, or bonus withholding at the
        flat supplemental rate. Estimate what your paycheck <em>should</em> be with the{' '}
        <a href="/us-paycheck-calculator">US Paycheck Calculator</a> (filing status, state, and 401(k) included), and
        verify the official figures at <a href="https://www.irs.gov/newsroom" target="_blank" rel="noopener noreferrer">IRS.gov</a>{' '}
        and <a href="https://www.ssa.gov/cola/" target="_blank" rel="noopener noreferrer">SSA.gov</a>.
      </p>
    </GuidePageLayout>
  );
}
