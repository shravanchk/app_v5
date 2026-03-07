import LegalPageLayout, { headingTwoStyle } from '../components/legal/LegalPageLayout';

export default function AffiliateDisclosurePage() {
  return (
    <LegalPageLayout
      title="Affiliate Disclosure"
      description="Affiliate disclosure for Upaman explaining referral links, compensation, and editorial independence standards."
      canonicalPath="/affiliate-disclosure"
    >
      <p>
        Some pages may include affiliate links to third-party products or services. If you use those links and take
        action, Upaman may receive a commission at no additional cost to you.
      </p>

      <h2 style={headingTwoStyle}>How Affiliate Links Are Used</h2>
      <ul>
        <li>Affiliate links are used only when relevant to the topic of a calculator or guide.</li>
        <li>Availability of affiliate links can vary by page, region, and provider eligibility.</li>
        <li>Compensation does not change the underlying formula logic of calculators.</li>
      </ul>

      <h2 style={headingTwoStyle}>Editorial Independence</h2>
      <ul>
        <li>Calculator assumptions and methodology are defined independently of affiliate relationships.</li>
        <li>No partner can directly edit outputs, formula assumptions, or final recommendations.</li>
        <li>Disclosures are shown on pages where affiliate recommendations are displayed.</li>
      </ul>

      <h2 style={headingTwoStyle}>Your Responsibility</h2>
      <p>
        Third-party products should be evaluated on their own terms, pricing, and suitability. Always read provider
        disclosures and official terms before purchasing.
      </p>

      <p>
        <a href="/editorial-policy">Editorial Policy</a> {'\u2022'} <a href="/methodology">Methodology</a> {'\u2022'}{' '}
        <a href="/advertising-policy">Advertising Policy</a>
      </p>
      <p style={{ marginBottom: 0 }}>
        <a href="/">← Back to Calculators</a>
      </p>
    </LegalPageLayout>
  );
}
