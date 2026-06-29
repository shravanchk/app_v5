import React from 'react';
import { DEFAULT_REVIEW_DATE } from '../../utils/siteMeta';

const defaultSources = [
  { label: 'Methodology', href: '/methodology' },
  { label: 'Editorial policy', href: '/editorial-policy' },
  { label: 'Publisher standards', href: '/publisher-standards' },
  { label: 'About Upaman', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const CredibilityPanel = ({
  reviewedOn = DEFAULT_REVIEW_DATE,
  scope = 'This calculator provides planning estimates based on the assumptions shown on this page.',
  sources = defaultSources,
}) => {
  return (
    <section
      className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700/70 dark:bg-slate-800/60"
      aria-label="Trust and methodology details"
    >
      <h4 className="mb-2 text-[0.95rem] font-semibold text-ink dark:text-white">Trust and methodology</h4>
      <p className="text-[0.84rem] leading-relaxed text-ink-soft dark:text-slate-300">
        <strong>Last reviewed:</strong> {reviewedOn}
      </p>
      <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-soft dark:text-slate-300">{scope}</p>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2">
        {sources.map((item) => (
          <a key={item.href} href={item.href} className="text-[0.82rem] font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">
            {item.label}
          </a>
        ))}
      </div>
    </section>
  );
};

export default CredibilityPanel;
