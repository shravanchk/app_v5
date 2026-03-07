import LegalPageLayout, { headingTwoStyle } from '../components/legal/LegalPageLayout';

export default function ContactPage() {
  return (
    <LegalPageLayout
      title="Contact Upaman"
      description="Contact Upaman for corrections, calculator feedback, partnership requests, and product support."
      canonicalPath="/contact"
    >
        <p>
          For correction requests, methodology questions, or product feedback, please email:
        </p>
        <p style={{ marginTop: 0 }}>
          <a href="mailto:upaman.org@gmail.com" style={{ color: '#1d4e89', fontWeight: 700, textDecoration: 'none' }}>
            upaman.org@gmail.com
          </a>
        </p>
        <h2 style={headingTwoStyle}>Please Include</h2>
        <ul>
          <li>Page URL and calculator/tool name.</li>
          <li>Issue summary or requested change.</li>
          <li>Input example and expected vs observed output (for calculation issues).</li>
        </ul>
        <p>
          We prioritize corrections for high-impact finance pages and regulatory-sensitive calculators.
        </p>
        <p>
          <a href="/methodology">Methodology</a> {'\u2022'} <a href="/editorial-policy">Editorial Policy</a> {'\u2022'}{' '}
          <a href="/corrections-policy">Corrections Policy</a>
        </p>
        <p style={{ marginBottom: 0 }}>
          <a href="/">← Back to Calculators</a>
        </p>
    </LegalPageLayout>
  );
}
