import React from 'react';

const cardStyle = {
  marginTop: '1rem',
  padding: 'clamp(0.8rem, 2.8vw, 1rem)',
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
  boxShadow: '0 1px 2px rgba(15, 42, 67, 0.04)'
};

const titleStyle = {
  margin: '0 0 0.8rem',
  color: '#0f2a43',
  fontSize: 'clamp(0.92rem, 2.6vw, 1rem)',
  fontWeight: 700
};

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
};

export const PieBreakdownChart = ({ title, items, formatter = (value) => `${Math.round(value)}` }) => {
  const sanitizedItems = items
    .filter((item) => item && Number.isFinite(item.value))
    .map((item) => ({ ...item, value: Math.max(0, item.value) }))
    .filter((item) => item.value > 0);
  const total = sanitizedItems.reduce((sum, item) => sum + item.value, 0);

  if (!total) return null;

  let cursor = 0;
  const segments = sanitizedItems.map((item) => {
    const share = (item.value / total) * 100;
    const start = (cursor / 100) * 360;
    const end = ((cursor + share) / 100) * 360;
    cursor += share;
    return { ...item, share, start, end };
  });

  return (
    <section style={cardStyle}>
      <h4 style={titleStyle}>{title}</h4>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.9rem',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg
          viewBox="0 0 120 120"
          width="160"
          height="160"
          role="img"
          aria-label={title}
          style={{ width: 'clamp(132px, 36vw, 168px)', height: 'auto', flex: '0 0 auto' }}
        >
          {segments.map((segment) => (
            <path
              key={segment.label}
              d={describeArc(60, 60, 52, segment.start, segment.end)}
              fill={segment.color}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}
          <circle cx="60" cy="60" r="28" fill="#ffffff" />
          <text x="60" y="55" textAnchor="middle" fontSize="9" fill="#475569">
            Total
          </text>
          <text x="60" y="68" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f2a43">
            {formatter(total)}
          </text>
        </svg>
        <ul
          style={{
            margin: 0,
            paddingLeft: 0,
            listStyle: 'none',
            color: '#334155',
            fontSize: '0.86rem',
            lineHeight: 1.55,
            flex: 1,
            minWidth: '220px'
          }}
        >
          {segments.map((segment) => (
            <li
              key={segment.label}
              style={{
                marginBottom: '0.45rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.6rem',
                padding: '0.45rem 0.6rem',
                background: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '999px',
                      background: segment.color,
                      marginRight: '0.45rem',
                      flex: '0 0 auto'
                    }}
                  />
                  <strong style={{ color: '#0f2a43' }}>{segment.label}</strong>
                </div>
                <strong style={{ color: '#334155', whiteSpace: 'nowrap' }}>{segment.share.toFixed(1)}%</strong>
              </div>
              <div style={{ marginTop: '0.2rem', color: '#475569', fontSize: '0.82rem' }}>{formatter(segment.value)}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export const ComparisonBars = ({ title, items, formatter = (value) => `${Math.round(value)}` }) => {
  const normalizedItems = items
    .filter((item) => item && Number.isFinite(item.value))
    .map((item) => ({ ...item, absValue: Math.abs(item.value) }));
  const max = Math.max(...normalizedItems.map((item) => item.absValue), 0);
  if (!max || !normalizedItems.length) return null;

  return (
    <section style={cardStyle}>
      <h4 style={titleStyle}>{title}</h4>
      <div style={{ display: 'grid', gap: '0.65rem' }}>
        {normalizedItems.map((item) => {
          const width = `${Math.max(6, (item.absValue / max) * 100)}%`;
          return (
            <div key={item.label}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.84rem',
                  color: '#334155',
                  gap: '0.6rem',
                  flexWrap: 'wrap'
                }}
              >
                <strong style={{ color: '#0f2a43' }}>{item.label}</strong>
                <span style={{ whiteSpace: 'nowrap' }}>{formatter(item.value)}</span>
              </div>
              <div style={{ marginTop: '0.28rem', background: '#e2e8f0', borderRadius: '999px', height: '12px' }}>
                <div
                  style={{
                    width,
                    height: '12px',
                    borderRadius: '999px',
                    background: item.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
