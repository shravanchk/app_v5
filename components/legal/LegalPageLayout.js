import React from 'react';
import Head from 'next/head';

const pageStyle = {
  minHeight: '100vh',
  background: '#ffffff',
  fontFamily: "'Source Sans 3', 'Manrope', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const contentStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
  lineHeight: 1.6,
  color: '#1f2937'
};

const homeLinkStyle = {
  position: 'sticky',
  top: '0.75rem',
  zIndex: 40,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '38px',
  height: '38px',
  borderRadius: '999px',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f2a43',
  textDecoration: 'none',
  boxShadow: '0 2px 8px rgba(15, 42, 67, 0.1)',
  marginBottom: '0.8rem'
};

const headingOneStyle = { marginTop: 0, color: '#2563eb' };
const headingTwoStyle = { color: '#1e40af', marginTop: '30px' };
const reviewedStyle = { color: '#6b7280', fontStyle: 'italic' };

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const LegalPageLayout = ({
  title,
  description,
  canonicalPath,
  reviewedOn = 'March 5, 2026',
  children
}) => {
  return (
    <main style={pageStyle}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://upaman.com${canonicalPath}`} />
      </Head>
      <article style={contentStyle}>
        <a style={homeLinkStyle} href="/" aria-label="Back to home">
          <HomeIcon />
        </a>
        <h1 style={headingOneStyle}>{title}</h1>
        <p style={reviewedStyle}>Last reviewed: {reviewedOn}</p>
        {children}
      </article>
    </main>
  );
};

export { headingTwoStyle };
export default LegalPageLayout;
