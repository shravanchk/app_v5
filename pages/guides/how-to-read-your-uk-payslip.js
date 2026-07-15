import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Read Your UK Payslip (2026-27)',
  description:
    'Every line of a UK payslip explained: what tax code 1257L means, how PAYE and National Insurance are calculated, student loan plans, and pension contributions.',
  author: { '@type': 'Organization', name: 'Upaman Research Team' },
  publisher: { '@type': 'Organization', name: 'Upaman' },
  datePublished: '2026-07-15',
  dateModified: '2026-07-15',
  mainEntityOfPage: 'https://upaman.com/guides/how-to-read-your-uk-payslip'
};

export default function UkPayslipGuidePage() {
  return (
    <GuidePageLayout
      title="How to Read Your UK Payslip (2026-27)"
      description="Every payslip line explained: tax code 1257L, how PAYE and National Insurance are worked out, student loan plans, pension contributions, and errors to check for."
      canonicalPath="/guides/how-to-read-your-uk-payslip"
      reviewedOn="July 15, 2026"
      reviewer="UK Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        A UK payslip compresses four different systems — income tax, National Insurance, student loans, and workplace
        pensions — into a dozen cryptic lines. Each one follows different rules on different thresholds, which is why
        the deductions never quite move together when your pay changes. Here is what each line means and how to spot
        when one is wrong.
      </p>

      <h2 style={sectionTitleStyle}>Your tax code — the line that controls everything</h2>
      <p>
        The standard code for 2026-27 is <strong>1257L</strong>: multiply the number by 10 and you get your tax-free
        Personal Allowance, £12,570. PAYE spreads that allowance evenly across the year — about £1,048 per month is
        untaxed, and the rest is taxed through the bands. Codes worth a second look:
      </p>
      <ul>
        <li><strong>BR / D0 / D1</strong> — all income taxed at 20% / 40% / 45% with <em>no</em> allowance. Normal for a second job; a costly error on your only job.</li>
        <li><strong>K codes</strong> — negative allowance: untaxed income (often a company benefit) exceeds the allowance, so extra is added to taxable pay.</li>
        <li><strong>W1/M1 suffix</strong> — emergency, non-cumulative code, common after a job change; each month taxed in isolation. Usually self-corrects, but check it doesn't linger.</li>
        <li><strong>S prefix</strong> — Scottish bands, which differ meaningfully from the rest of the UK — see our <a href="/guides/uk-tax-rates-2026-27">UK tax rates 2026-27</a> guide for both sets.</li>
      </ul>

      <h2 style={sectionTitleStyle}>Income tax (PAYE)</h2>
      <p>
        In England, Wales and Northern Ireland: 20% on taxable income up to £37,700 above the allowance, 40% up to
        £125,140, 45% beyond. Two traps hide in there: above <strong>£100,000</strong> the allowance itself erodes
        (£1 lost per £2 of income), producing a ~60% effective rate on the £100,000–£125,140 slice; and PAYE is
        cumulative, so a bonus month is taxed as if you earn that much every month — overpaid tax then unwinds across
        later payslips rather than being lost.
      </p>

      <h2 style={sectionTitleStyle}>National Insurance</h2>
      <p>
        Employee (Class 1, category A) NI for 2026-27: <strong>8%</strong> of pay between £12,570 and £50,270 a year,
        then <strong>2%</strong> above that. Unlike PAYE, NI is calculated <strong>per pay period, not
        cumulatively</strong> — a one-off spike month pays more NI that never averages back out. That's also why NI
        and income tax react differently to the same bonus.
      </p>

      <h2 style={sectionTitleStyle}>Student loan</h2>
      <p>
        The deduction is <strong>9%</strong> of pay above your plan's threshold (<strong>6%</strong> for the
        Postgraduate Loan), taken per pay period. 2026-27 thresholds: Plan 1 £26,900, Plan 2 £29,385, Plan 4 £33,795,
        Plan 5 £25,000, Postgraduate £21,000. The most common payslip error in this section is being put on the wrong
        plan — Plan 2 vs Plan 5 changes the threshold by over £4,000, so check the letter, not just the presence, of
        the deduction.
      </p>

      <h2 style={sectionTitleStyle}>Pension</h2>
      <p>
        Auto-enrolment makes a workplace pension the default, with a minimum of 8% of a band of qualifying earnings
        (at least 3% from your employer). Check <em>how</em> yours is taken: "net pay" and salary-sacrifice
        arrangements reduce taxable pay on the payslip itself, while "relief at source" takes contributions after tax
        and adds relief inside the pension. If your employer offers <strong>salary sacrifice</strong>, it's usually
        the most efficient of the three — our <a href="/guides/salary-sacrifice-explained">salary sacrifice guide</a>{' '}
        shows the exact saving.
      </p>

      <h2 style={sectionTitleStyle}>The 60-second monthly check</h2>
      <ol>
        <li>Tax code says 1257L (or you know why it doesn't).</li>
        <li>No W1/M1 suffix more than a couple of months after a job change.</li>
        <li>Student loan plan letter is correct.</li>
        <li>Pension percentage matches what you elected, and the employer share appears.</li>
        <li>Year-to-date figures grow consistently — they're what your P60 and any HMRC refund are built from.</li>
      </ol>

      <h2 style={sectionTitleStyle}>Run your numbers</h2>
      <p>
        Check what your payslip <em>should</em> say with the{' '}
        <a href="/uk-income-tax-calculator">UK Income Tax Calculator</a> (PAYE, NI, and student loan together), or
        look your salary up directly in the <a href="/uk/take-home">UK take-home pay tables</a> (£20,000–£150,000).
        Rates and thresholds are on <a href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027" target="_blank" rel="noopener noreferrer">GOV.UK</a>.
        This is general education, not personalized tax advice.
      </p>
    </GuidePageLayout>
  );
}
