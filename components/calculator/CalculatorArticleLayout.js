import React from 'react';

const cardCls =
  'mb-3.5 rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 ' +
  'dark:border-slate-700/70 dark:bg-slate-800/70';
const headingCls = 'font-display text-lg font-semibold text-ink dark:text-white';
const bodyCls = 'mt-2.5 text-[0.94rem] leading-relaxed text-ink-soft dark:text-slate-300 space-y-3';
const linkCls = 'font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200';

// Collapsible section: native <details> keeps content in the DOM for SEO and is
// keyboard-accessible. Now dark-mode aware via Tailwind variants.
const Section = ({ heading, children, defaultOpen = false, id }) => (
  <details id={id} className={cardCls} style={id ? { scrollMarginTop: '90px' } : undefined} {...(defaultOpen ? { open: true } : {})}>
    <summary className="cursor-pointer select-none list-revert">
      <span className={headingCls}>{heading}</span>
    </summary>
    <div className={bodyCls}>{children}</div>
  </details>
);

const CalculatorArticleLayout = ({
  title,
  summary,
  trustPanel = null,
  intro,
  explanation,
  example,
  tips,
  faq,
  methodology,
  relatedGuides = [],
  nextStepTools = [],
  children,
}) => {
  return (
    <article className="mb-4 w-full px-4 pt-1 sm:px-6 lg:px-10 xl:px-16">
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-brand-50 to-slate-100 p-5 dark:from-slate-800 dark:to-slate-800/60">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-white">{title}</h2>
        {summary ? <div className="mt-2.5 text-[0.94rem] font-medium leading-relaxed text-ink-soft dark:text-slate-300">{summary}</div> : null}
      </div>

      {trustPanel}

      <Section heading="Topic overview" defaultOpen>{intro}</Section>
      <Section heading="How this calculation works">{explanation}</Section>
      <Section heading="Example calculation">{example}</Section>
      <Section heading="Tips and common mistakes">{tips}</Section>
      <Section heading="Frequently asked questions" id="faq-section">{faq}</Section>

      {relatedGuides.length ? (
        <section className={cardCls}>
          <h2 className={headingCls}>Related guides</h2>
          <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-[0.94rem] text-ink-soft dark:text-slate-300">
            {relatedGuides.map((guide) => (
              <li key={guide.href}>
                <a href={guide.href} target="_blank" rel="noopener noreferrer" className={linkCls}>{guide.label}</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {nextStepTools.length ? (
        <section className={cardCls}>
          <h2 className={headingCls}>Next step tools</h2>
          <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-[0.94rem] text-ink-soft dark:text-slate-300">
            {nextStepTools.map((tool) => (
              <li key={tool.href}>
                <a href={tool.href} className={linkCls}>{tool.label}</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Section heading="Methodology and assumptions">{methodology}</Section>

      {children ? (
        <section className={`${cardCls} mb-0`}>
          <h2 className={headingCls}>Use the calculator</h2>
          <div className={bodyCls}>{children}</div>
        </section>
      ) : null}
    </article>
  );
};

export default CalculatorArticleLayout;
