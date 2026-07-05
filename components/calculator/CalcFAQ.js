import React from 'react';

// Visible FAQ list for CalcShell calculator pages. Renders the same
// faqItems array that feeds buildFaqSchema(), so the FAQPage structured
// data always matches on-page content. Styling lives in .calc-faq
// (styles/common.css), which handles dark mode.
const CalcFAQ = ({ items = [], title = 'Frequently asked questions' }) => {
  if (!items.length) return null;
  return (
    <section className="calc-faq">
      <h2 className="calc-faq-title">{title}</h2>
      {items.map(({ question, answer }) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </section>
  );
};

export default CalcFAQ;
