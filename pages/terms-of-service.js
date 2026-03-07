import LegalPageLayout, { headingTwoStyle } from '../components/legal/LegalPageLayout';

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description="Terms of service for using Upaman calculators, including limitations, liability, and user responsibilities."
      canonicalPath="/terms-of-service"
    >
      <p>
        By using Upaman calculators and guides, you agree to these terms. If you do not agree, discontinue use of the
        website and tools.
      </p>

      <h2 style={headingTwoStyle}>Service Scope</h2>
      <p>
        Upaman provides informational calculators and educational decision-support content. Outputs are estimates and
        are not legal, tax, investment, or accounting advice.
      </p>

      <h2 style={headingTwoStyle}>User Responsibilities</h2>
      <ul>
        <li>Use tools lawfully and responsibly.</li>
        <li>Verify important results independently before financial commitments.</li>
        <li>Consult qualified professionals for regulated or high-risk decisions.</li>
      </ul>

      <h2 style={headingTwoStyle}>Accuracy and Availability</h2>
      <p>
        We aim for accurate formulas and timely updates, but do not guarantee uninterrupted access or error-free
        results at all times.
      </p>

      <h2 style={headingTwoStyle}>Limitation of Liability</h2>
      <p>
        Upaman is not liable for direct or indirect losses arising from reliance on calculator outputs or related
        content.
      </p>

      <h2 style={headingTwoStyle}>Changes to Terms</h2>
      <p>We may update these terms periodically. Continued use of the site implies acceptance of updated terms.</p>

      <h2 style={headingTwoStyle}>Contact</h2>
      <p>
        For terms-related questions, email{' '}
        <a href="mailto:terms@upaman.com" style={{ color: '#1d4e89', fontWeight: 700, textDecoration: 'none' }}>
          terms@upaman.com
        </a>.
      </p>

      <p>
        <a href="/methodology">Methodology</a> {'\u2022'} <a href="/editorial-policy">Editorial Policy</a>{' '}
        {'\u2022'} <a href="/advertising-policy">Advertising Policy</a>
      </p>
      <p style={{ marginBottom: 0 }}>
        <a href="/">← Back to Calculators</a>
      </p>
    </LegalPageLayout>
  );
}
