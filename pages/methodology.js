import Head from 'next/head';

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)',
  padding: '2rem 1rem',
  fontFamily: 'var(--app-font)'
};

const cardStyle = {
  maxWidth: '920px',
  margin: '0 auto',
  background: '#ffffff',
  border: '1px solid #dbe2eb',
  borderRadius: '12px',
  padding: '1.6rem'
};

export default function MethodologyPage() {
  return (
    <main style={pageStyle}>
      <Head>
        <title>Methodology | Upaman Calculator Formulas and Assumptions</title>
        <meta
          name="description"
          content="Methodology behind Upaman calculators: formula logic, assumptions, rounding, update process, and model limits."
        />
        <link rel="canonical" href="https://upaman.com/methodology" />
      </Head>
      <article style={cardStyle}>
        <h1 style={{ marginTop: 0, color: '#0f2a43' }}>Methodology</h1>
        <p style={{ color: '#334155', lineHeight: 1.65 }}>
          Upaman calculators use deterministic formulas based on published frameworks (tax slabs, amortization math,
          compounding logic, and contribution models). Each calculator page includes assumptions and context notes.
        </p>
        <h2 style={{ color: '#0f2a43', fontSize: '1.12rem' }}>How We Calculate</h2>
        <ul style={{ color: '#334155', lineHeight: 1.65 }}>
          <li>Loan/EMI tools: reducing-balance amortization formulas.</li>
          <li>Tax tools: slab-wise marginal tax progression with configured rebates/cess logic.</li>
          <li>Investment tools: periodic compounding with user-defined contribution/return assumptions.</li>
          <li>Debt payoff tools: month-wise simulation with interest-first payment allocation.</li>
        </ul>
        <h2 style={{ color: '#0f2a43', fontSize: '1.12rem' }}>Assumptions and Limits</h2>
        <ul style={{ color: '#334155', lineHeight: 1.65 }}>
          <li>Rates remain constant unless a tool explicitly supports rate changes.</li>
          <li>Complex legal/tax edge cases are simplified for planning utility.</li>
          <li>Rounding may vary from official systems due to platform-specific policies.</li>
          <li>Outputs should be validated for filing, contracting, and compliance actions.</li>
        </ul>
        <h2 style={{ color: '#0f2a43', fontSize: '1.12rem' }}>Model Review</h2>
        <p style={{ color: '#334155', lineHeight: 1.65, marginBottom: 0 }}>
          Model assumptions are reviewed during major regulatory/market updates and product releases. Last
          methodology review date is shown in calculator trust panels where available.
        </p>
      </article>
    </main>
  );
}

