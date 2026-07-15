import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'HRA Exemption: How It\'s Calculated (FY 2026-27)',
  description:
    'The least-of-three HRA exemption rule with a full worked example, the new eight-city metro list for FY 2026-27, and the documentation rules that trip people up.',
  author: { '@type': 'Organization', name: 'Upaman Research Team' },
  publisher: { '@type': 'Organization', name: 'Upaman' },
  datePublished: '2026-07-15',
  dateModified: '2026-07-15',
  mainEntityOfPage: 'https://upaman.com/guides/hra-exemption-calculation'
};

export default function HraExemptionGuidePage() {
  return (
    <GuidePageLayout
      title="HRA Exemption: How It's Calculated (FY 2026-27)"
      description="The least-of-three HRA rule worked out step by step, the new eight-city metro list for FY 2026-27, old-regime-only status, and the documentation rules."
      canonicalPath="/guides/hra-exemption-calculation"
      reviewedOn="July 15, 2026"
      reviewer="India Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        House Rent Allowance is a component of salary, and part of it can be exempt from tax — but only under the{' '}
        <strong>old tax regime</strong>, and only if you actually pay rent. The exemption is the <strong>least of
        three amounts</strong>, which means one weak leg caps the whole benefit. Understanding which leg binds you is
        the difference between structuring it well and quietly losing money.
      </p>

      <h2 style={sectionTitleStyle}>The least-of-three rule</h2>
      <p>Your exempt HRA is the <strong>smallest</strong> of:</p>
      <ol>
        <li><strong>Actual HRA received</strong> from your employer for the year;</li>
        <li><strong>Rent paid minus 10% of salary</strong> (salary = basic pay + dearness allowance that forms part of salary);</li>
        <li><strong>50% of salary</strong> if you live in a metro city, <strong>40%</strong> otherwise.</li>
      </ol>
      <p>Whatever HRA remains above the exempt amount is taxed as ordinary salary income.</p>

      <h2 style={sectionTitleStyle}>The metro list changed for FY 2026-27</h2>
      <p>
        From FY 2026-27, <strong>eight cities</strong> qualify for the 50% limit: Delhi, Mumbai, Kolkata, Chennai,{' '}
        <strong>Bengaluru, Hyderabad, Pune, and Ahmedabad</strong>. This is a long-overdue fix — Bengaluru rents at
        Mumbai levels were capped at the 40% non-metro limit for decades. Note the timing carefully:{' '}
        <strong>for FY 2025-26 income (returns filed in 2026), the old four-city list still applies</strong>; the
        expanded list applies to income earned from April 2026 onward.
      </p>

      <h2 style={sectionTitleStyle}>Worked example</h2>
      <p>Basic salary ₹6,00,000, no DA; HRA received ₹3,00,000; rent paid ₹2,40,000 (₹20,000/month) in a metro city:</p>
      <ol>
        <li>Actual HRA: <strong>₹3,00,000</strong></li>
        <li>Rent − 10% of salary: ₹2,40,000 − ₹60,000 = <strong>₹1,80,000</strong></li>
        <li>50% of salary: <strong>₹3,00,000</strong></li>
      </ol>
      <p>
        The least is <strong>₹1,80,000 exempt</strong>; the remaining ₹1,20,000 of HRA is taxable. Leg 2 binds here —
        as it does for most people — which yields the practical insight: <strong>every extra rupee of rent adds a
        rupee of exemption</strong> (until another leg binds), while a higher basic salary <em>cuts</em> the
        exemption through the 10% subtraction.
      </p>

      <h2 style={sectionTitleStyle}>Rules that trip people up</h2>
      <ul>
        <li>
          <strong>New regime = no HRA exemption.</strong> If you're on the default new regime, HRA is fully taxable.
          A large exemption (high rent in a metro) is one of the few things that can still tip the scales toward the
          old regime — run it before choosing; see{' '}
          <a href="/guides/income-tax-regime-choice">old vs new regime choice</a>.
        </li>
        <li>
          <strong>Landlord's PAN is required</strong> if annual rent exceeds ₹1,00,000, and rent above ₹50,000/month
          requires you to deduct TDS. No rent receipts or agreement = an exemption that dies in scrutiny.
        </li>
        <li>
          <strong>Paying rent to parents is legal</strong> — if it's real: actual bank transfers, a rent agreement,
          and the parent declaring the rent as income. Paper-only arrangements are a classic notice-trigger.
        </li>
        <li>
          <strong>You own a house?</strong> You can still claim HRA for a rented home in your city of work while
          claiming home-loan benefits on a property elsewhere — genuinely occupying the rented home is the test.
        </li>
        <li>
          <strong>No HRA component in your salary?</strong> The HRA exemption doesn't apply at all — the (much
          smaller) Section 80GG deduction is the fallback for rent payers without HRA.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>Run your numbers</h2>
      <p>
        The <a href="/hra-calculator">HRA Exemption Calculator</a> applies the least-of-three rule to your exact
        salary structure and shows which leg binds you — then feed the result into the{' '}
        <a href="/income-tax-calculator">Income Tax Calculator</a> and the{' '}
        <a href="/tax-regime-comparison">regime comparison</a> to see whether the exemption changes your regime
        decision. This is general education, not personalized tax advice.
      </p>
    </GuidePageLayout>
  );
}
