import React from 'react';

const sectionCardStyle = {
  background: '#ffffff',
  border: '1px solid #dbe2eb',
  borderRadius: '1rem',
  padding: '1.1rem 1.2rem',
  marginBottom: '0.9rem'
};

const sectionTitleStyle = {
  margin: '0 0 0.55rem',
  color: '#0f2a43',
  fontSize: '1.08rem'
};

const bodyTextStyle = {
  color: '#334155',
  lineHeight: 1.68,
  fontSize: '0.94rem'
};

const CalculatorArticleLayout = ({
  title,
  intro,
  explanation,
  example,
  tips,
  faq,
  methodology,
  relatedGuides = [],
  children
}) => {
  return (
    <article
      style={{
        maxWidth: '1120px',
        margin: '0 auto 1rem',
        padding: '0.3rem 0.3rem 0'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0f2a43, #1d4e89)',
          color: '#f8fafc',
          borderRadius: '1rem',
          padding: '1.2rem 1.2rem 1rem',
          marginBottom: '0.95rem'
        }}
      >
        <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>{title}</h1>
      </div>

      <section style={sectionCardStyle}>
        <div style={bodyTextStyle}>{intro}</div>
      </section>

      <section style={sectionCardStyle}>
        <h2 style={sectionTitleStyle}>How this calculation works</h2>
        <div style={bodyTextStyle}>{explanation}</div>
      </section>

      <section style={sectionCardStyle}>
        <h2 style={sectionTitleStyle}>Example calculation</h2>
        <div style={bodyTextStyle}>{example}</div>
      </section>

      <section style={{ ...sectionCardStyle, borderStyle: 'dashed' }}>
        <h2 style={sectionTitleStyle}>Calculator tool</h2>
        {children}
      </section>

      <section style={sectionCardStyle}>
        <h2 style={sectionTitleStyle}>Tips and common mistakes</h2>
        <div style={bodyTextStyle}>{tips}</div>
      </section>

      <section style={sectionCardStyle}>
        <h2 style={sectionTitleStyle}>Frequently asked questions</h2>
        <div style={bodyTextStyle}>{faq}</div>
      </section>

      {relatedGuides.length ? (
        <section style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>Related guides</h2>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', ...bodyTextStyle }}>
            {relatedGuides.map((guide) => (
              <li key={guide.href} style={{ marginBottom: '0.35rem' }}>
                <a href={guide.href} style={{ color: '#1d4e89', fontWeight: 600 }}>
                  {guide.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section style={sectionCardStyle}>
        <h2 style={sectionTitleStyle}>Methodology and assumptions</h2>
        <div style={bodyTextStyle}>{methodology}</div>
      </section>
    </article>
  );
};

export default CalculatorArticleLayout;
