import LegalPageLayout, { headingTwoStyle } from '../components/legal/LegalPageLayout';

export default function CorrectionsPolicyPage() {
  return (
    <LegalPageLayout
      title="Corrections Policy"
      description="Corrections policy for Upaman covering issue reporting, review priority, update process, and publication standards."
      canonicalPath="/corrections-policy"
    >
      <p>
        Accuracy is critical for financial calculators and decision workflows. This page explains how Upaman receives,
        reviews, and corrects factual or formula-related issues.
      </p>

      <h2 style={headingTwoStyle}>What Qualifies for Correction</h2>
      <ul>
        <li>Formula implementation errors or incorrect assumption handling.</li>
        <li>Outdated regulatory references, rates, slabs, or thresholds.</li>
        <li>Misleading explanatory content that can materially affect user understanding.</li>
      </ul>

      <h2 style={headingTwoStyle}>How to Report an Issue</h2>
      <p>
        Send a report through <a href="/contact">Contact</a> and include page URL, inputs used, expected behavior, and
        observed behavior.
      </p>

      <h2 style={headingTwoStyle}>Review and Update Process</h2>
      <ul>
        <li>High-impact issues are reviewed first (tax, debt, and high-value planning pages).</li>
        <li>Confirmed issues are corrected and pushed in the next available release cycle.</li>
        <li>Where appropriate, pages are marked with updated review date.</li>
      </ul>

      <h2 style={headingTwoStyle}>Limitations</h2>
      <p>
        Some complex legal or tax edge cases may not be fully modeled. Users should validate mission-critical
        decisions with official sources or licensed professionals.
      </p>

      <p>
        <a href="/editorial-policy">Editorial Policy</a> {'\u2022'} <a href="/methodology">Methodology</a> {'\u2022'}{' '}
        <a href="/publisher-standards">Publisher Standards</a>
      </p>
      <p style={{ marginBottom: 0 }}>
        <a href="/">← Back to Calculators</a>
      </p>
    </LegalPageLayout>
  );
}
