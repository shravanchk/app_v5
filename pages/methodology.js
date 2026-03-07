import LegalPageLayout, { headingTwoStyle } from '../components/legal/LegalPageLayout';

export default function MethodologyPage() {
  return (
    <LegalPageLayout
      title="Methodology"
      description="Methodology behind Upaman calculators: formula logic, assumptions, rounding, update process, and model limits."
      canonicalPath="/methodology"
    >
        <p>
          Upaman calculators use deterministic formulas based on published frameworks (tax slabs, amortization math,
          compounding logic, and contribution models). Each calculator page includes assumptions and context notes.
        </p>
        <h2 style={headingTwoStyle}>How We Calculate</h2>
        <ul>
          <li>Loan/EMI tools: reducing-balance amortization formulas.</li>
          <li>Tax tools: slab-wise marginal tax progression with configured rebates/cess logic.</li>
          <li>Investment tools: periodic compounding with user-defined contribution/return assumptions.</li>
          <li>Debt payoff tools: month-wise simulation with interest-first payment allocation.</li>
        </ul>
        <h2 style={headingTwoStyle}>Assumptions and Limits</h2>
        <ul>
          <li>Rates remain constant unless a tool explicitly supports rate changes.</li>
          <li>Complex legal/tax edge cases are simplified for planning utility.</li>
          <li>Rounding may vary from official systems due to platform-specific policies.</li>
          <li>Outputs should be validated for filing, contracting, and compliance actions.</li>
        </ul>
        <h2 style={headingTwoStyle}>Model Review</h2>
        <p>
          Model assumptions are reviewed during major regulatory/market updates and product releases. Last
          methodology review date is shown in calculator trust panels where available.
        </p>
        <p>
          <a href="/about">About Upaman</a> {'\u2022'} <a href="/editorial-policy">Editorial Policy</a> {'\u2022'}{' '}
          <a href="/corrections-policy">Corrections Policy</a>
        </p>
        <p style={{ marginBottom: 0 }}>
          <a href="/">← Back to Calculators</a>
        </p>
    </LegalPageLayout>
  );
}
