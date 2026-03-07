import React from 'react';

const defaultSources = [
  { label: 'Methodology', href: '/methodology' },
  { label: 'Editorial policy', href: '/editorial-policy' },
  { label: 'Publisher standards', href: '/publisher-standards' },
  { label: 'About Upaman', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

const CredibilityPanel = ({
  reviewedOn = 'March 5, 2026',
  scope = 'This calculator provides planning estimates based on the assumptions shown on this page.',
  sources = defaultSources
}) => {
  return (
    <section
      style={{
        marginTop: '1rem',
        border: '1px solid #dbe2eb',
        background: 'linear-gradient(135deg, #f8fafc, #eef2ff)',
        borderRadius: '0.9rem',
        padding: '0.9rem 1rem'
      }}
      aria-label="Trust and methodology details"
    >
      <h4 style={{ margin: '0 0 0.5rem', color: '#0f2a43', fontSize: '0.95rem' }}>Trust and methodology</h4>
      <p style={{ margin: 0, color: '#334155', fontSize: '0.84rem', lineHeight: 1.55 }}>
        <strong>Last reviewed:</strong> {reviewedOn}
      </p>
      <p style={{ margin: '0.35rem 0 0', color: '#334155', fontSize: '0.84rem', lineHeight: 1.55 }}>
        {scope}
      </p>
      <div style={{ marginTop: '0.55rem', display: 'flex', flexWrap: 'wrap', gap: '0.45rem 0.8rem' }}>
        {sources.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              color: '#1d4e89',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </section>
  );
};

export default CredibilityPanel;
