import { useState } from 'react';
import Head from 'next/head';
import Container from '../components/ui/Container';

const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

const WIDGETS = [
  {
    name: 'Compound Interest Calculator',
    slug: 'compound-interest',
    height: 430,
    desc: 'Initial deposit, monthly contributions, and monthly compounding — future value, total contributed, and interest earned.',
    fullTool: '/compound-interest-calculator'
  },
  {
    name: 'Hourly to Salary Calculator',
    slug: 'hourly-to-salary',
    height: 430,
    desc: 'Converts an hourly rate into annual, monthly, bi-weekly, and weekly pay with adjustable hours and weeks.',
    fullTool: '/hourly'
  },
  {
    name: 'SIP Calculator (₹)',
    slug: 'sip',
    height: 400,
    desc: 'Projects a monthly SIP into a corpus with invested amount and estimated gains, using the standard annuity-due formula.',
    fullTool: '/sip-calculator'
  },
  {
    name: 'EMI Calculator (₹)',
    slug: 'emi',
    height: 430,
    desc: 'Monthly EMI, total interest, and total payable for any loan amount, rate, and tenure.',
    fullTool: '/loan-calculator'
  }
];

const snippetFor = (w) =>
  `<iframe src="https://upaman.com/embed/${w.slug}" width="100%" height="${w.height}" style="border:0;max-width:520px" title="${w.name}" loading="lazy"></iframe>`;

const faqItems = [
  {
    q: 'Are these widgets really free?',
    a: 'Yes — free for any website, commercial or personal, with no signup, API key, or usage limit. The only requirement is that the small "Powered by Upaman" attribution link inside the widget stays visible.'
  },
  {
    q: 'Will the widget slow my page down?',
    a: 'No. Each widget is a small static page served from a global CDN, contains no ads and no analytics, and the snippet uses loading="lazy" so the iframe only loads when it scrolls into view.'
  },
  {
    q: 'Can I change the size or styling?',
    a: 'You can set any width and height on the iframe — the widget is responsive up to 520px wide. The internal styling is fixed so the numbers always render correctly; if you need a custom-branded version, reach out via the contact page.'
  },
  {
    q: 'Do the calculators stay up to date?',
    a: 'Yes — the widgets are maintained alongside the full calculators on this site, so formula changes and fixes apply to your embedded copy automatically. Pure-math widgets like these have no yearly tax data to go stale.'
  }
];

export default function WidgetsPage() {
  const [copied, setCopied] = useState('');

  const copy = async (w) => {
    const text = snippetFor(w);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch (e) {
      // Fallback for contexts where the async clipboard API is unavailable
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand('copy');
      } catch (e2) {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    if (ok) {
      setCopied(w.slug);
      setTimeout(() => setCopied(''), 2000);
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };

  return (
    <>
      <Head>
        <title>Free Embeddable Calculator Widgets for Your Website | Upaman</title>
        <meta name="description" content="Add a free financial calculator to your website or blog with one line of HTML: compound interest, hourly to salary, SIP, and EMI widgets — no signup, no ads, no tracking." />
        <link rel="canonical" href="https://upaman.com/widgets" />
        <meta property="og:title" content="Free Embeddable Calculator Widgets | Upaman" />
        <meta property="og:description" content="Copy-paste financial calculator widgets for any website — free, fast, no ads or tracking." />
        <meta property="og:url" content="https://upaman.com/widgets" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <section className="py-8 sm:py-12">
        <Container>
          <article className="mx-auto max-w-[860px] text-[1.02rem] leading-relaxed text-ink-soft dark:text-slate-300">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              Free Calculator Widgets for Your Website
            </h1>
            <p className="mt-3">
              Writing about money? Add a working calculator to your article with <strong>one line of HTML</strong>.
              The widgets below are free for any site, load lazily from a global CDN, and contain no ads, no
              tracking, and no signup — just the calculator and a small attribution link.
            </p>

            <div className="mt-8 space-y-10">
              {WIDGETS.map((w) => (
                <div key={w.slug} className="rounded-2xl border border-slate-200/70 bg-white p-5 dark:border-slate-700/70 dark:bg-slate-800/70">
                  <h2 className="font-display text-xl font-bold text-ink dark:text-white">{w.name}</h2>
                  <p className="mt-1.5 text-[0.95rem]">{w.desc} Full version: <a href={w.fullTool} className={linkCls}>{`upaman.com${w.fullTool}`}</a></p>

                  <div className="mt-4 grid gap-5 lg:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">Live preview</div>
                      <iframe
                        src={`/embed/${w.slug}`}
                        width="100%"
                        height={w.height}
                        style={{ border: 0, maxWidth: '520px' }}
                        title={w.name}
                        loading="lazy"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">Embed code — paste anywhere HTML is allowed</div>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{snippetFor(w)}</pre>
                      <button
                        type="button"
                        onClick={() => copy(w)}
                        className="mt-2 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
                      >
                        {copied === w.slug ? '✓ Copied' : 'Copy code'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl font-bold text-ink dark:text-white">Frequently asked questions</h2>
              <div className="mt-4 grid gap-3">
                {faqItems.map(({ q, a }) => (
                  <details key={q} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                    <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{q}</summary>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted dark:text-slate-400">{a}</p>
                  </details>
                ))}
              </div>
            </div>

            <p className="mt-8 text-sm text-ink-muted dark:text-slate-500">
              Want a calculator that isn&rsquo;t here yet as a widget — mortgage, debt payoff, income tax? Ask via the{' '}
              <a href="/contact" className={linkCls}>contact page</a> and we&rsquo;ll consider it for the next batch.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
