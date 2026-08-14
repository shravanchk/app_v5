import React, { useState } from 'react';

// One snippet block per calculator that has a matching widget under /embed.
// Calculators without a widget deliberately don't render this — advertising an
// embed that doesn't exist is worse than not advertising one.
const buildEmbedCode = (slug, height, title) =>
  `<iframe src="https://upaman.com/embed/${slug}" width="100%" height="${height}" style="border:0;max-width:520px" title="${title} by Upaman" loading="lazy"></iframe>`;

const EmbedSnippet = ({ slug = 'emi', height = 520, title = 'EMI Calculator', noun = 'EMI calculator' }) => {
  const [status, setStatus] = useState('');
  const embedCode = buildEmbedCode(slug, height, title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setStatus('Copied!');
    } catch (e) {
      setStatus('Press Ctrl/Cmd+C to copy');
    }
    window.setTimeout(() => setStatus(''), 2200);
  };

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-16" aria-label="Embed this calculator">
      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700/70 dark:bg-slate-800/60">
        <h2 className="font-display text-lg font-semibold text-ink dark:text-white">Embed this {noun} (free)</h2>
        <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink-soft dark:text-slate-300">
          Add this free {noun} to your blog or website. Copy the code below and paste it into your page&rsquo;s HTML.
          Attribution links back to Upaman.
        </p>
        <textarea
          readOnly
          value={embedCode}
          onFocus={(e) => e.target.select()}
          className="mt-3 min-h-[72px] w-full resize-y rounded-xl border border-slate-200 bg-white p-3 font-mono text-[0.82rem] text-ink outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <div className="mt-2.5 flex items-center gap-3">
          <button type="button" onClick={copy} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Copy embed code</button>
          {status && <span className="text-sm text-emerald-600 dark:text-emerald-400">{status}</span>}
        </div>
        <p className="mt-3 text-sm">
          <a href={`/embed/${slug}`} target="_blank" rel="noopener" className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300">Preview the widget →</a>
        </p>
      </div>
    </section>
  );
};

export default EmbedSnippet;
