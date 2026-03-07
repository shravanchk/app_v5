import LegalPageLayout, { headingTwoStyle } from '../components/legal/LegalPageLayout';

export default function AboutPage() {
  return (
    <LegalPageLayout
      title="About Upaman"
      description="Learn what Upaman builds, who it helps, and how calculator outputs are structured for practical financial decisions."
      canonicalPath="/about"
    >
        <p>
          Upaman is built as a decision-first financial tools platform. The focus is not just arithmetic output, but
          helping users make high-impact decisions like choosing a tax regime, planning an EMI, comparing job offers,
          and managing credit-card debt.
        </p>
        <h2 style={headingTwoStyle}>What We Optimize For</h2>
        <ul>
          <li>Clear inputs and transparent formula assumptions.</li>
          <li>Fast calculation flows usable on desktop and mobile.</li>
          <li>Practical guidance around common mistakes and edge cases.</li>
          <li>Strong internal linking between calculators, workflows, and guides.</li>
        </ul>
        <h2 style={headingTwoStyle}>Product Scope</h2>
        <p>
          Primary focus is India-oriented financial decisions. Additional US/EU calculators and utility tools are
          provided as supporting modules, not the core product identity.
        </p>
        <h2 style={headingTwoStyle}>Important Note</h2>
        <p>
          Upaman provides educational planning estimates. Results are not legal, tax, or investment advice and should
          be validated against official documents or qualified professionals before final decisions.
        </p>
        <p>
          <a href="/methodology">Methodology</a> {'\u2022'} <a href="/editorial-policy">Editorial Policy</a>{' '}
          {'\u2022'} <a href="/publisher-standards">Publisher Standards</a>
        </p>
        <p style={{ marginBottom: 0 }}>
          <a href="/">← Back to Calculators</a>
        </p>
    </LegalPageLayout>
  );
}
