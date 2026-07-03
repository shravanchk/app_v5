import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'UK Income Tax and National Insurance Rates 2026-27',
  description: 'Current UK personal allowance, PAYE bands, Scottish tax bands, employee National Insurance, and student-loan thresholds for 2026-27.',
  author: { '@type': 'Organization', name: 'Upaman Research Team' },
  publisher: { '@type': 'Organization', name: 'Upaman' },
  datePublished: '2026-06-14',
  dateModified: '2026-06-14',
  mainEntityOfPage: 'https://upaman.com/guides/uk-tax-rates-2026-27'
};

export default function UKTaxRatesGuidePage() {
  return (
    <GuidePageLayout
      title="UK Income Tax and National Insurance Rates 2026-27"
      description="Review UK Personal Allowance, PAYE bands, Scottish rates, employee National Insurance, and student-loan thresholds for 6 April 2026 to 5 April 2027."
      canonicalPath="/guides/uk-tax-rates-2026-27"
      reviewedOn="June 14, 2026"
      reviewer="UK Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        The 2026-27 UK tax year runs from April 6, 2026 to April 5, 2027. The standard Personal Allowance is £12,570.
        It reduces by £1 for every £2 of adjusted net income above £100,000 and reaches zero at £125,140.
      </p>

      <h2 style={sectionTitleStyle}>England, Wales and Northern Ireland</h2>
      <ul>
        <li>Basic rate: 20% on taxable income up to £37,700 above the allowance</li>
        <li>Higher rate: 40% from £37,701 to £125,140</li>
        <li>Additional rate: 45% above £125,140</li>
      </ul>

      <h2 style={sectionTitleStyle}>Scotland</h2>
      <ul>
        <li>Starter rate: 19% from £12,571 to £16,537</li>
        <li>Basic rate: 20% from £16,538 to £29,526</li>
        <li>Intermediate rate: 21% from £29,527 to £43,662</li>
        <li>Higher rate: 42% from £43,663 to £75,000</li>
        <li>Advanced rate: 45% from £75,001 to £125,140</li>
        <li>Top rate: 48% above £125,140</li>
      </ul>

      <h2 style={sectionTitleStyle}>Employee National Insurance</h2>
      <p>
        For standard category A employees, the primary threshold is £12,570 and the upper earnings limit is £50,270.
        The main employee rate is 8% between those thresholds and 2% above the upper earnings limit.
      </p>

      <h2 style={sectionTitleStyle}>Student-Loan Thresholds</h2>
      <ul>
        <li>Plan 1: £26,900</li>
        <li>Plan 2: £29,385</li>
        <li>Plan 4: £33,795</li>
        <li>Plan 5: £25,000</li>
        <li>Postgraduate Loan: £21,000</li>
      </ul>

      <h2 style={sectionTitleStyle}>Official Sources and Calculator</h2>
      <p>
        Verify details with <a href="https://www.gov.uk/income-tax-rates" target="_blank" rel="noopener noreferrer">GOV.UK Income Tax rates</a>,{' '}
        <a href="https://www.gov.uk/scottish-income-tax" target="_blank" rel="noopener noreferrer">Scottish Income Tax</a>, and{' '}
        <a href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027" target="_blank" rel="noopener noreferrer">HMRC payroll thresholds</a>.
        Then use the <a href="/uk-income-tax-calculator">UK Income Tax Calculator</a> for an estimate, or look up
        your salary directly in the <a href="/uk/take-home">UK take-home pay tables</a> (£20,000–£150,000).
      </p>
    </GuidePageLayout>
  );
}
