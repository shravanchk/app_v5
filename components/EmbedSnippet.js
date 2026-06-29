import React, { useState } from 'react';

const EMBED_CODE = '<iframe src="https://upaman.com/embed/emi" width="100%" height="520" style="border:0;max-width:520px" title="EMI Calculator by Upaman" loading="lazy"></iframe>';

const wrap = { maxWidth: '860px', margin: '24px auto', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '14px', background: '#f8fafc', fontFamily: "'Source Sans 3','Segoe UI',sans-serif" };
const codeBox = { width: '100%', minHeight: '70px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box', color: '#0f2a43', background: '#fff' };
const btn = { marginTop: '10px', padding: '9px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' };

const EmbedSnippet = () => {
  const [status, setStatus] = useState('');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMBED_CODE);
      setStatus('Copied!');
    } catch (e) {
      setStatus('Press Ctrl/Cmd+C to copy');
    }
    window.setTimeout(() => setStatus(''), 2200);
  };

  return (
    <section style={wrap} aria-label="Embed this calculator">
      <h2 style={{ margin: '0 0 6px', color: '#0f2a43', fontSize: '1.15rem' }}>Embed this EMI calculator (free)</h2>
      <p style={{ margin: '0 0 12px', color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
        Add this free EMI calculator to your blog or website. Just copy the code below and paste it into your page&rsquo;s HTML.
        Attribution links back to Upaman.
      </p>
      <textarea style={codeBox} readOnly value={EMBED_CODE} onFocus={(e) => e.target.select()} />
      <div>
        <button style={btn} onClick={copy} type="button">Copy embed code</button>
        {status && <span style={{ marginLeft: '12px', color: '#166534', fontSize: '0.9rem' }}>{status}</span>}
      </div>
      <p style={{ margin: '12px 0 0', fontSize: '0.85rem' }}>
        <a href="/embed/emi" target="_blank" rel="noopener">Preview the widget →</a>
      </p>
    </section>
  );
};

export default EmbedSnippet;
