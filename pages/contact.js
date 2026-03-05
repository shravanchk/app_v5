import Head from 'next/head';

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)',
  padding: '2rem 1rem',
  fontFamily: 'var(--app-font)'
};

const cardStyle = {
  maxWidth: '760px',
  margin: '0 auto',
  background: '#ffffff',
  border: '1px solid #dbe2eb',
  borderRadius: '12px',
  padding: '1.6rem'
};

export default function ContactPage() {
  return (
    <main style={pageStyle}>
      <Head>
        <title>Contact Upaman</title>
        <meta
          name="description"
          content="Contact Upaman for corrections, calculator feedback, partnership requests, and product support."
        />
        <link rel="canonical" href="https://upaman.com/contact" />
      </Head>
      <article style={cardStyle}>
        <h1 style={{ marginTop: 0, color: '#0f2a43' }}>Contact Upaman</h1>
        <p style={{ color: '#334155', lineHeight: 1.65 }}>
          For correction requests, methodology questions, or product feedback, please email:
        </p>
        <p style={{ marginTop: 0 }}>
          <a href="mailto:upaman.org@gmail.com" style={{ color: '#1d4e89', fontWeight: 700, textDecoration: 'none' }}>
            upaman.org@gmail.com
          </a>
        </p>
        <h2 style={{ color: '#0f2a43', fontSize: '1.12rem' }}>Please Include</h2>
        <ul style={{ color: '#334155', lineHeight: 1.65 }}>
          <li>Page URL and calculator/tool name.</li>
          <li>Issue summary or requested change.</li>
          <li>Input example and expected vs observed output (for calculation issues).</li>
        </ul>
        <p style={{ color: '#334155', lineHeight: 1.65, marginBottom: 0 }}>
          We prioritize corrections for high-impact finance pages and regulatory-sensitive calculators.
        </p>
      </article>
    </main>
  );
}

