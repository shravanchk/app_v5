import React from 'react';
import Head from 'next/head';
import { buildFaqSchema } from '../../utils/faqSchema';

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #dbe2eb',
  borderRadius: '1rem',
  padding: '1rem 1.1rem',
  marginBottom: '0.85rem'
};

const headingStyle = {
  margin: '0 0 0.5rem',
  color: '#0f2a43',
  fontSize: '1.02rem'
};

const bodyStyle = {
  color: '#334155',
  lineHeight: 1.65,
  fontSize: '0.92rem'
};

const SearchLandingSections = ({
  intro,
  example,
  formula,
  faqItems = [],
  relatedLinks = [],
  softwareSchema = null
}) => {
  const faqSchema = faqItems.length ? buildFaqSchema(faqItems) : null;
  const shouldOpenInNewTab = (href = '') => href.startsWith('http') || href.endsWith('.html');

  return (
    <div style={{ marginTop: '1rem' }}>
      {softwareSchema || faqSchema ? (
        <Head>
          {softwareSchema ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
          ) : null}
          {faqSchema ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
          ) : null}
        </Head>
      ) : null}

      <section style={cardStyle}>
        <h2 style={headingStyle}>Intro</h2>
        <div style={bodyStyle}>{intro}</div>
      </section>

      <section style={cardStyle}>
        <h2 style={headingStyle}>Example Calculation</h2>
        <div style={bodyStyle}>{example}</div>
      </section>

      <section style={cardStyle}>
        <h2 style={headingStyle}>How the Formula Works</h2>
        <div style={bodyStyle}>{formula}</div>
      </section>

      {faqItems.length ? (
        <section style={cardStyle}>
          <h2 style={headingStyle}>FAQ</h2>
          <div style={bodyStyle}>
            {faqItems.map((item) => (
              <div key={item.question} style={{ marginBottom: '0.55rem' }}>
                <h3 style={{ margin: '0 0 0.18rem', fontSize: '0.92rem', color: '#0f2a43' }}>{item.question}</h3>
                <p style={{ margin: 0 }}>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {relatedLinks.length ? (
        <section style={cardStyle}>
          <h2 style={headingStyle}>Related Tools</h2>
          <ul style={{ margin: 0, paddingLeft: '1rem', ...bodyStyle }}>
            {relatedLinks.map((link) => (
              <li key={link.href} style={{ marginBottom: '0.3rem' }}>
                <a
                  href={link.href}
                  style={{ color: '#1d4e89', fontWeight: 600 }}
                  target={shouldOpenInNewTab(link.href) ? '_blank' : undefined}
                  rel={shouldOpenInNewTab(link.href) ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

export default SearchLandingSections;
