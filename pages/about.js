import Head from 'next/head';

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)',
  padding: '2rem 1rem',
  fontFamily: 'var(--app-font)'
};

const cardStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  background: '#ffffff',
  border: '1px solid #dbe2eb',
  borderRadius: '12px',
  padding: '1.6rem'
};

export default function AboutPage() {
  return (
    <main style={pageStyle}>
      <Head>
        <title>About Upaman | Decision-First Financial Tools</title>
        <meta
          name="description"
          content="Learn what Upaman builds, who it helps, and how calculator outputs are structured for practical financial decisions."
        />
        <link rel="canonical" href="https://upaman.com/about" />
      </Head>
      <article style={cardStyle}>
        <h1 style={{ marginTop: 0, color: '#0f2a43' }}>About Upaman</h1>
        <p style={{ color: '#334155', lineHeight: 1.65 }}>
          Upaman is built as a decision-first financial tools platform. The focus is not just arithmetic output, but
          helping users make high-impact decisions like choosing a tax regime, planning an EMI, comparing job offers,
          and managing credit-card debt.
        </p>
        <h2 style={{ color: '#0f2a43', fontSize: '1.12rem' }}>What We Optimize For</h2>
        <ul style={{ color: '#334155', lineHeight: 1.65 }}>
          <li>Clear inputs and transparent formula assumptions.</li>
          <li>Fast calculation flows usable on desktop and mobile.</li>
          <li>Practical guidance around common mistakes and edge cases.</li>
          <li>Strong internal linking between calculators, workflows, and guides.</li>
        </ul>
        <h2 style={{ color: '#0f2a43', fontSize: '1.12rem' }}>Product Scope</h2>
        <p style={{ color: '#334155', lineHeight: 1.65 }}>
          Primary focus is India-oriented financial decisions. Additional US/EU calculators and utility tools are
          provided as supporting modules, not the core product identity.
        </p>
        <h2 style={{ color: '#0f2a43', fontSize: '1.12rem' }}>Important Note</h2>
        <p style={{ color: '#334155', lineHeight: 1.65, marginBottom: 0 }}>
          Upaman provides educational planning estimates. Results are not legal, tax, or investment advice and should
          be validated against official documents or qualified professionals before final decisions.
        </p>
      </article>
    </main>
  );
}

