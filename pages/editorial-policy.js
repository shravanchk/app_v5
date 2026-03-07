import LegalPageLayout, { headingTwoStyle } from '../components/legal/LegalPageLayout';

export default function EditorialPolicyPage() {
  return (
    <LegalPageLayout
      title="Editorial Policy"
      description="Editorial standards for Upaman calculators and guides: sourcing, updates, corrections, and conflict-of-interest principles."
      canonicalPath="/editorial-policy"
    >
        <p>
          Upaman content is written for clarity, practical utility, and verifiable assumptions. Calculator outputs are
          paired with explanatory notes so users can understand what is included and what is out of scope.
        </p>
        <h2 style={headingTwoStyle}>Source Standards</h2>
        <ul>
          <li>Use official government/regulator references where applicable.</li>
          <li>Prefer primary-source documentation for rates and formula rules.</li>
          <li>Flag assumptions clearly when official treatment is context-dependent.</li>
        </ul>
        <h2 style={headingTwoStyle}>Updates and Corrections</h2>
        <ul>
          <li>High-impact pages are reviewed during regulatory and fiscal updates.</li>
          <li>Material errors are corrected with priority and reflected in page updates.</li>
          <li>Where relevant, pages include “last reviewed” or equivalent update markers.</li>
        </ul>
        <h2 style={headingTwoStyle}>Independence</h2>
        <p>
          Content intent is educational. Monetization (ads/affiliates where present) does not change methodology
          rules, formula assumptions, or recommendation logic.
        </p>
        <h2 style={headingTwoStyle}>Quality and Compliance</h2>
        <p>
          Core calculator pages are expected to include useful explanatory content, examples, and transparent
          assumptions. We avoid thin or misleading pages and maintain clear separation between content and ads.
        </p>
        <p>
          <a href="/methodology">Methodology</a> {'\u2022'} <a href="/publisher-standards">Publisher Standards</a>{' '}
          {'\u2022'} <a href="/corrections-policy">Corrections Policy</a>
        </p>
        <p style={{ marginBottom: 0 }}>
          <a href="/">← Back to Calculators</a>
        </p>
    </LegalPageLayout>
  );
}
