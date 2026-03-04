import React from 'react';

const cardStyle = {
  marginTop: '0.95rem',
  padding: '0.9rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.9rem',
  background: 'linear-gradient(135deg, #f8fafc, #ffffff)'
};

const titleStyle = {
  margin: '0 0 0.7rem',
  color: '#0f2a43',
  fontSize: '0.95rem',
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
  const sanitizedItems = items.filter((item) => item.value > 0);
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
        <svg viewBox="0 0 120 120" width="150" height="150" role="img" aria-label={title}>
          {segments.map((segment) => (
            <path
              key={segment.label}
              d={describeArc(60, 60, 52, segment.start, segment.end)}
              fill={segment.color}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}
          <circle cx="60" cy="60" r="26" fill="#ffffff" />
          <text x="60" y="56" textAnchor="middle" fontSize="9" fill="#475569">
            Total
          </text>
          <text x="60" y="68" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f2a43">
            {formatter(total)}
          </text>
        </svg>
        <ul style={{ margin: 0, paddingLeft: '1rem', color: '#334155', fontSize: '0.86rem', lineHeight: 1.55, flex: 1, minWidth: '200px' }}>
          {segments.map((segment) => (
            <li key={segment.label} style={{ marginBottom: '0.35rem' }}>
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '999px',
                  background: segment.color,
                  marginRight: '0.45rem'
                }}
              />
              <strong>{segment.label}</strong>: {formatter(segment.value)} ({segment.share.toFixed(1)}%)
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export const ComparisonBars = ({ title, items, formatter = (value) => `${Math.round(value)}` }) => {
  const max = Math.max(...items.map((item) => item.value), 0);
  if (!max) return null;

  return (
    <section style={cardStyle}>
      <h4 style={titleStyle}>{title}</h4>
      <div style={{ display: 'grid', gap: '0.65rem' }}>
        {items.map((item) => {
          const width = `${Math.max(6, (item.value / max) * 100)}%`;
          return (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#334155' }}>
                <strong>{item.label}</strong>
                <span>{formatter(item.value)}</span>
              </div>
              <div style={{ marginTop: '0.25rem', background: '#e2e8f0', borderRadius: '999px', height: '11px' }}>
                <div
                  style={{
                    width,
                    height: '11px',
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
