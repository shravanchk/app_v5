import React from 'react';
import { getAutoUpdatedLabel } from '../../utils/siteMeta';

const labelStyle = {
  fontSize: '0.78rem',
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  color: '#0f766e',
  fontWeight: 700,
  marginBottom: '0.45rem'
};

const itemTitleStyle = {
  margin: 0,
  color: '#0f2a43',
  fontSize: '0.84rem',
  fontWeight: 700
};

const itemValueStyle = {
  margin: '0.2rem 0 0',
  color: '#334155',
  fontSize: '0.84rem',
  lineHeight: 1.55
};

const EEATPanel = ({
  author,
  reviewer,
  reviewedOn,
  scope,
  sources = []
}) => {
  const updatedLabel = getAutoUpdatedLabel();

  return (
    <section
      style={{
        border: '1px solid #dbe2eb',
        borderRadius: '0.95rem',
        background: 'linear-gradient(135deg, #f8fafc, #eef2ff)',
        padding: '0.95rem 1rem',
        marginBottom: '0.9rem'
      }}
      aria-label="Editorial trust and source panel"
    >
      <p style={labelStyle}>Editorial Trust Panel</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.7rem 0.9rem'
        }}
      >
        <div>
          <p style={itemTitleStyle}>Author</p>
          <p style={itemValueStyle}>{author}</p>
        </div>
        <div>
          <p style={itemTitleStyle}>Reviewed by</p>
          <p style={itemValueStyle}>{reviewer}</p>
        </div>
        <div>
          <p style={itemTitleStyle}>Last reviewed</p>
          <p style={itemValueStyle}>{reviewedOn}</p>
        </div>
        <div>
          <p style={itemTitleStyle}>Content update</p>
          <p style={itemValueStyle}>{updatedLabel}</p>
        </div>
      </div>

      {scope ? (
        <p style={{ ...itemValueStyle, marginTop: '0.65rem' }}>
          <strong style={{ color: '#0f2a43' }}>Scope:</strong> {scope}
        </p>
      ) : null}

      {sources.length ? (
        <div style={{ marginTop: '0.6rem' }}>
          <p style={itemTitleStyle}>Primary references</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 0.8rem', marginTop: '0.35rem' }}>
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1d4e89',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                {source.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default EEATPanel;
