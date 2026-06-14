import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'India Income Tax Slabs FY 2026-27 and AY 2027-28',
  description: 'Current India income-tax slabs, standard deductions, section 87A rebate, and old-vs-new regime planning notes for FY 2026-27.',
  author: { '@type': 'Organization', name: 'Upaman Research Team' },
  publisher: { '@type': 'Organization', name: 'Upaman' },
  datePublished: '2026-06-14',
  dateModified: '2026-06-14',
  mainEntityOfPage: 'https://upaman.com/guides/india-income-tax-2026-27'
};

export default function IndiaIncomeTaxGuidePage() {
  return (
    <GuidePageLayout
      title="India Income Tax Slabs FY 2026-27 (AY 2027-28)"
      description="Review current India tax slabs, standard deductions, section 87A rebate, marginal relief, and regime-selection considerations for FY 2026-27."
      canonicalPath="/guides/india-income-tax-2026-27"
      reviewedOn="June 14, 2026"
      reviewer="Tax Policy Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        Union Budget 2026 retained the individual income-tax slab structure used in the previous financial year. For
        FY 2026-27, the corresponding assessment year is AY 2027-28. The new regime remains the default regime, while
        eligible taxpayers can compare it with the old regime where applicable.
      </p>

      <h2 style={sectionTitleStyle}>New Regime Slabs</h2>
      <ul>
        <li>Up to ₹4,00,000: nil</li>
        <li>₹4,00,001 to ₹8,00,000: 5%</li>
        <li>₹8,00,001 to ₹12,00,000: 10%</li>
        <li>₹12,00,001 to ₹16,00,000: 15%</li>
        <li>₹16,00,001 to ₹20,00,000: 20%</li>
        <li>₹20,00,001 to ₹24,00,000: 25%</li>
        <li>Above ₹24,00,000: 30%</li>
      </ul>
      <p>
        Salaried taxpayers receive a ₹75,000 standard deduction. Section 87A can reduce tax by up to ₹60,000 when
        eligible taxable income does not exceed ₹12 lakh. Marginal relief may apply just above that threshold.
      </p>

      <h2 style={sectionTitleStyle}>Old Regime Slabs</h2>
      <ul>
        <li>Up to ₹2,50,000: nil</li>
        <li>₹2,50,001 to ₹5,00,000: 5%</li>
        <li>₹5,00,001 to ₹10,00,000: 20%</li>
        <li>Above ₹10,00,000: 30%</li>
      </ul>
      <p>
        The old regime retains a ₹50,000 standard deduction for salary income and allows eligible deductions and
        exemptions such as 80C, 80D, NPS, HRA, and qualifying home-loan interest. Eligibility and limits vary.
      </p>

      <h2 style={sectionTitleStyle}>How to Compare Regimes</h2>
      <p>
        Compare both regimes using deductions you can actually document. Do not choose the old regime based on planned
        investments that may not happen. Also account for the 4% health and education cess and any surcharge or special
        income that a simplified calculator may not model.
      </p>

      <h2 style={sectionTitleStyle}>Official Sources and Tools</h2>
      <p>
        Review the <a href="https://www.indiabudget.gov.in/" target="_blank" rel="noopener noreferrer">Union Budget portal</a> and{' '}
        <a href="https://www.incometax.gov.in/" target="_blank" rel="noopener noreferrer">Income Tax Department portal</a> for official updates.
        Use Upaman’s <a href="/income-tax-calculator">Income Tax Calculator</a> and{' '}
        <a href="/tax-regime-comparison">Tax Regime Comparison Tool</a> for planning scenarios.
      </p>
    </GuidePageLayout>
  );
}
