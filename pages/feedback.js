import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CalcLayout } from '../components/calculator/CalcLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const FEEDBACK_EMAIL = 'upaman.org@gmail.com';

const CATEGORIES = [
  { value: 'Bug / calculation issue', label: 'Bug or calculation issue' },
  { value: 'Feature request', label: 'Feature request' },
  { value: 'Content correction', label: 'Content correction' },
  { value: 'General feedback', label: 'General feedback' }
];

const labelCls = 'mb-1.5 block text-sm font-medium text-ink-soft dark:text-slate-300';
const controlCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[0.95rem] text-ink shadow-sm outline-none ' +
  'transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

export default function FeedbackPage() {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [page, setPage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  // Pre-fill the "page" field: prefer an explicit ?page= query, otherwise the
  // same-origin referrer the user arrived from (e.g. the calculator they were on).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const queryPage = typeof router.query.page === 'string' ? router.query.page : '';
    if (queryPage) {
      setPage(queryPage);
      return;
    }
    try {
      const ref = document.referrer;
      if (ref && new URL(ref).origin === window.location.origin) {
        const refPath = new URL(ref).pathname;
        // Only prefill a specific page — skip the homepage and this page itself.
        if (refPath !== '/' && refPath !== '/feedback') {
          setPage(refPath);
        }
      }
    } catch (e) {
      /* referrer unavailable — leave blank */
    }
  }, [router.query.page]);

  const mailtoHref = useMemo(() => {
    const subject = `[Upaman Feedback] ${category}`;
    const bodyLines = [
      message.trim(),
      '',
      '—',
      page ? `Page: ${page}` : null,
      email ? `Reply to: ${email}` : null
    ].filter((line) => line !== null);
    const body = bodyLines.join('\n');
    return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [category, message, email, page]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) {
      setError('Please enter a short description before sending.');
      return;
    }
    setError('');
    setSent(true);
    // Opens the user's email app with the message pre-filled to upaman.org@gmail.com.
    window.location.href = mailtoHref;
  };

  return (
    <>
      <Head>
        <title>Send Feedback | Report an Issue or Suggestion | Upaman</title>
        <meta
          name="description"
          content="Found a bug, a wrong calculation, or have a suggestion for Upaman? Send feedback and help us improve the calculators and tools."
        />
        <link rel="canonical" href="https://upaman.com/feedback" />
        <meta property="og:title" content="Send Feedback | Upaman" />
        <meta property="og:description" content="Report an issue or suggest an improvement for Upaman's calculators and tools." />
        <meta property="og:url" content="https://upaman.com/feedback" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Send Feedback | Upaman" />
        <meta name="twitter:description" content="Report an issue or suggest an improvement for Upaman's calculators and tools." />
      </Head>

      <CalcLayout
        eyebrow="Support"
        title="Send Feedback"
        subtitle="Spotted a bug, a wrong number, or have an idea? Tell us and we'll take a look — corrections to finance pages are prioritised."
      >
        <div className="max-w-2xl">
          <Card className="p-5 sm:p-6">
            {sent ? (
              <div className="text-center">
                <div className="mb-2 text-3xl" aria-hidden="true">📬</div>
                <h2 className="font-display text-xl font-bold text-ink dark:text-white">Your email is ready to send</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted dark:text-slate-400">
                  We opened your email app with the message pre-filled — just press send. If nothing opened, email us
                  directly at{' '}
                  <a href={mailtoHref} className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">
                    {FEEDBACK_EMAIL}
                  </a>.
                </p>
                <div className="mt-5">
                  <Button variant="secondary" onClick={() => setSent(false)}>Write another message</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="fb-category" className={labelCls}>What is this about?</label>
                    <select id="fb-category" value={category} onChange={(e) => setCategory(e.target.value)} className={controlCls}>
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="fb-message" className={labelCls}>
                      Your message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="fb-message"
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); if (error) setError(''); }}
                      rows={6}
                      required
                      className={`${controlCls} resize-y`}
                      placeholder="Describe the issue or idea. For calculation problems, include the inputs you used and what you expected."
                    />
                    {error ? <p className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="fb-email" className={labelCls}>Your email <span className="text-ink-muted">(optional)</span></label>
                      <input
                        id="fb-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={controlCls}
                        placeholder="so we can reply"
                      />
                    </div>
                    <div>
                      <label htmlFor="fb-page" className={labelCls}>Page / tool <span className="text-ink-muted">(optional)</span></label>
                      <input
                        id="fb-page"
                        type="text"
                        value={page}
                        onChange={(e) => setPage(e.target.value)}
                        className={controlCls}
                        placeholder="/us-401k-calculator"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <Button type="submit" variant="primary">Send feedback</Button>
                    <p className="text-sm text-ink-muted dark:text-slate-400">
                      Opens your email app — nothing is sent automatically.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </Card>

          <p className="mt-4 text-sm text-ink-muted dark:text-slate-400">
            Prefer to email directly? Reach us at{' '}
            <a href={`mailto:${FEEDBACK_EMAIL}`} className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">
              {FEEDBACK_EMAIL}
            </a>.
          </p>
        </div>
      </CalcLayout>
    </>
  );
}
