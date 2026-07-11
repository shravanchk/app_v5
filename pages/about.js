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
          helping users make high-impact decisions like estimating take-home pay, planning a loan, growing long-term
          savings, comparing job offers, and managing credit-card debt.
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
          Upaman serves a global audience. Coverage includes US paycheck and tax tools, European salary and VAT
          calculators, India-specific tax and loan planners, and universal finance and health calculators such as
          compound interest, inflation, and calorie/BMI tools. Region-specific calculators state their assumptions
          (tax year, jurisdiction, currency) so results stay verifiable.
        </p>
        <h2 style={headingTwoStyle}>Who Runs Upaman</h2>
        <p>
          Upaman is built and maintained by{' '}
          <a href="https://www.linkedin.com/in/ch-shravan-kumar-b6a89974/" rel="me noopener" target="_blank">
            <strong>Shravan Cherukuri</strong>
          </a>, a software engineer, together with
          the <a href="/authors/upaman-research-team">Upaman Research Team</a>. Calculation engines are written
          against official sources (tax statutes, published rate tables, CPI data), and the worked examples across
          the site are generated from the same engines the calculators run — not typed in by hand — so the prose
          cannot drift from the results. Corrections and questions are welcome via the{' '}
          <a href="/contact">contact page</a>.
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
