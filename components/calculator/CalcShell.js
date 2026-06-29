import React from 'react';
import HomeButton from '../HomeButton';

// Shared editorial-fintech shell for calculator pages. Uses the site's
// .calculator-container / .calculator-card classes so pages inherit the
// established card chrome and dark-theme rules (which target
// .calculator-card input/select/label/h1-h6 and .result-card).

const cardStyle = {
  maxWidth: '760px',
  padding: 'clamp(20px, 4vw, 34px)',
  background: '#fff'
};

const headerRow = { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' };
const badge = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '44px', height: '44px', borderRadius: '12px',
  border: '1px solid #dbe2eb', background: '#f8fafc', color: '#1d4e89', flexShrink: 0
};
const titleStyle = { margin: 0, fontSize: 'clamp(1.3rem, 3.4vw, 1.75rem)', fontWeight: 700, color: '#0f2a43', lineHeight: 1.2 };
const subtitleStyle = { margin: '6px 0 0', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.55 };

// Exported field styles (kept neutral so dark-theme .calculator-card rules win).
export const fieldStyles = {
  group: { marginTop: '14px' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.86rem', margin: '0 0 6px', color: '#334155' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box', background: '#fff' },
  row: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
  col: { flex: '1 1 160px', minWidth: 0 },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0 0', fontWeight: 600, fontSize: '0.86rem', color: '#334155', cursor: 'pointer' }
};

// Result panel — restrained: single subtle surface, 1px border, thin accent rule.
// Text colour is left to inherit so .result-card dark-theme rules apply cleanly.
export const resultStyles = {
  card: { marginTop: '20px', padding: '18px 20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderTop: '3px solid #1d4e89' },
  kicker: { fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', margin: 0 },
  figure: { fontSize: 'clamp(1.6rem, 5vw, 2rem)', fontWeight: 700, margin: '4px 0 0', lineHeight: 1.1 },
  row: { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '7px 0', borderBottom: '1px solid #e7edf3', fontSize: '0.92rem' },
  rowLast: { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '7px 0', fontSize: '0.95rem', fontWeight: 700 },
  note: { fontSize: '0.82rem', color: '#64748b', marginTop: '10px', lineHeight: 1.55 }
};

export const sectionTitle = { fontSize: '1.05rem', fontWeight: 700, color: '#0f2a43', margin: '24px 0 4px' };

export function CalcShell({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="calculator-container">
      <HomeButton />
      <div className="calculator-card" style={cardStyle}>
        <div style={headerRow}>
          {Icon ? <span style={badge}><Icon size={22} strokeWidth={1.9} /></span> : null}
          <h1 style={titleStyle}>{title}</h1>
        </div>
        {subtitle ? <p style={subtitleStyle}>{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
}

export default CalcShell;
