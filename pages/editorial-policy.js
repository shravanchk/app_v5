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

export default function EditorialPolicyPage() {
  return (
    <main style={pageStyle}>
      <Head>
        <title>Editorial Policy | Upaman</title>
        <meta
          name="description"
          content="Editorial standards for Upaman calculators and guides: sourcing, updates, corrections, and conflict-of-interest principles."
        />
        <link rel="canonical" href="https://upaman.com/editorial-policy" />
      </Head>
      <article style={cardStyle}>
        <h1 style={{ marginTop: 0, color: '#0f2a43' }}>Editorial Policy</h1>
        <p style={{ color: '#334155', lineHeight: 1.65 }}>
          Upaman content is written for clarity, practical utility, and verifiable assumptions. Calculator outputs are
          paired with explanatory notes so users can understand what is included and what is out of scope.
        </p>
        <h2 style={{ color: '#0f2a43', fontSize: '1.12rem' }}>Source Standards</h2>
        <ul style={{ color: '#334155', lineHeight: 1.65 }}>
          <li>Use official government/regulator references where applicable.</li>
          <li>Prefer primary-source documentation for rates and formula rules.</li>
          <li>Flag assumptions clearly when official treatment is context-dependent.</li>
        </ul>
        <h2 style={{ color: '#0f2a43', fontSize: '1.12rem' }}>Updates and Corrections</h2>
        <ul style={{ color: '#334155', lineHeight: 1.65 }}>
          <li>High-impact pages are reviewed during regulatory and fiscal updates.</li>
          <li>Material errors are corrected with priority and reflected in page updates.</li>
          <li>Where relevant, pages include “last reviewed” or equivalent update markers.</li>
        </ul>
        <h2 style={{ color: '#0f2a43', fontSize: '1.12rem' }}>Independence</h2>
        <p style={{ color: '#334155', lineHeight: 1.65, marginBottom: 0 }}>
          Content intent is educational. Monetization (ads/affiliates where present) does not change methodology
          rules, formula assumptions, or recommendation logic.
        </p>
      </article>
    </main>
  );
}

