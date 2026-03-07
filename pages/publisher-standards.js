import LegalPageLayout, { headingTwoStyle } from '../components/legal/LegalPageLayout';

export default function PublisherStandardsPage() {
  return (
    <LegalPageLayout
      title="Publisher Standards"
      description="Upaman publisher standards covering content quality, ad integrity, transparency, and crawlability expectations for trust-focused publishing."
      canonicalPath="/publisher-standards"
    >
      <p>
        This page describes the publishing standards we apply across calculators, workflows, and guides to maintain
        useful content quality, transparent assumptions, and ad-safe user experience.
      </p>

      <h2 style={headingTwoStyle}>Content Quality Standards</h2>
      <ul>
        <li>Pages must provide unique, practical value beyond a raw formula output.</li>
        <li>Major calculator pages include explanatory content, examples, and FAQs.</li>
        <li>Thin, duplicative, or auto-generated pages are avoided for core decision topics.</li>
      </ul>

      <h2 style={headingTwoStyle}>Transparency Standards</h2>
      <ul>
        <li>Methodology assumptions and limits are documented and linked clearly.</li>
        <li>Policy pages are accessible from primary navigation and footer areas.</li>
        <li>Commercial relationships are disclosed where relevant.</li>
      </ul>

      <h2 style={headingTwoStyle}>Advertising Integrity Standards</h2>
      <ul>
        <li>Ad placement must not obscure content or mimic product controls.</li>
        <li>No click manipulation, incentivized clicks, or invalid traffic practices.</li>
        <li>If a page cannot meet policy expectations, ads should be limited or disabled.</li>
      </ul>

      <h2 style={headingTwoStyle}>Technical and Crawlability Standards</h2>
      <ul>
        <li>Important text content should be server-rendered and indexable.</li>
        <li>Sitemap and robots directives are maintained for key content and trust pages.</li>
        <li>Broken routes and major rendering failures are treated as release blockers.</li>
      </ul>

      <h2 style={headingTwoStyle}>Review Cadence</h2>
      <p>
        Trust and compliance pages are reviewed periodically and during major product, policy, or monetization
        changes.
      </p>

      <p>
        <a href="/advertising-policy">Advertising Policy</a> {'\u2022'} <a href="/editorial-policy">Editorial Policy</a>{' '}
        {'\u2022'} <a href="/corrections-policy">Corrections Policy</a>
      </p>
      <p style={{ marginBottom: 0 }}>
        <a href="/">← Back to Calculators</a>
      </p>
    </LegalPageLayout>
  );
}
