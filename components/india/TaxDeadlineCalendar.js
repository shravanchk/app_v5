import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { CalendarClock } from 'lucide-react';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import CalcShell, { fieldStyles as f } from '../calculator/CalcShell';
import CalcFAQ from '../calculator/CalcFAQ';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildCalendar, istToday } from '../../utils/engines/taxDeadlines';
import { buildIcsCalendar, downloadIcs } from '../../utils/calendarReminders';
import { useT } from '../../utils/i18n/LanguageProvider';
import LanguageToggle from '../i18n/LanguageToggle';

const LEAD_TIMES = [
  { labelKey: 'deadlines.lead1Day', minutes: 24 * 60 },
  { labelKey: 'deadlines.lead3Days', minutes: 3 * 24 * 60 },
  { labelKey: 'deadlines.lead1Week', minutes: 7 * 24 * 60 },
  { labelKey: 'deadlines.lead2Weeks', minutes: 14 * 24 * 60 }
];

// Deadlines are dates, not instants. A timed 10:00 IST event with a lead-time
// alarm behaves predictably everywhere; all-day events fire their alarms at
// midnight in several clients, which is exactly when nobody reads them.
const EVENT_HOUR_IST = '10:00';

// Urgency colours live in styles/common.css as .deadline-row--<band>. They
// cannot be inline: `body.dark-theme .calculator-card` overrides with
// !important, which inline styles would otherwise beat, leaving these rows
// light-on-dark. Only the modifier name is chosen here.

const formatLongDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

const faqItems = [
  {
    question: 'What is the last date to file ITR for AY 2026-27?',
    answer:
      'July 31, 2026 was the due date for individuals who do not need a tax audit, covering income earned in FY 2025-26. If you missed it, a belated return can still be filed until December 31, 2026 with a late fee of up to ₹5,000, and a return already filed can be revised until March 31, 2027.'
  },
  {
    question: 'What happens if I miss the ITR filing deadline?',
    answer:
      'You can file a belated return until December 31, 2026 with a late fee — ₹1,000 if total income is ₹5 lakh or less, otherwise ₹5,000. Two quieter costs matter more for many people: a belated return must use the new regime, so the old regime is lost even if it would have saved you more, and most losses can no longer be carried forward.'
  },
  {
    question: 'What are the advance tax due dates for FY 2026-27?',
    answer:
      'June 15, September 15, December 15 and March 15, at cumulative 15%, 45%, 75% and 100% of your estimated annual liability. Advance tax applies if your estimated tax for the year, after TDS, is ₹10,000 or more. The instalments are cumulative, not equal quarters.'
  },
  {
    question: 'Is the revised return deadline December 31 or March 31?',
    answer:
      'March 31, 2027 for AY 2026-27. Budget 2026 extended the revised-return window from December 31 to the end of the assessment year. December 31, 2026 is the belated return deadline — a different return for a different situation, which is why the two dates are so often confused.'
  },
  {
    question: 'How do I get a reminder for these tax deadlines?',
    answer:
      'Pick the deadlines that apply to you on this page, choose how far in advance you want the alert, and download the calendar file. It imports into Google Calendar, Apple Calendar, Outlook or any other calendar app, and the alert fires from your own device. There is no sign-up and no email address — nothing about you is sent to or stored by Upaman.'
  },
  {
    question: 'Which tax year do advance tax dates belong to?',
    answer:
      'Advance tax dates belong to the financial year in which the income is being earned — the FY 2026-27 instalments cover income from April 2026 to March 2027. ITR filing deadlines belong to the assessment year that follows the year you earned the income. Mixing the two is the most common date mistake taxpayers make.'
  }
];

const TaxDeadlineCalendar = () => {
  const t = useT();
  // Rendered at build time as a static export, so "days left" must be computed
  // after mount — otherwise every visitor sees the countdown as it stood on the
  // day the site was built, and the server/client markup disagrees on hydration.
  const [today, setToday] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [leadMinutes, setLeadMinutes] = useState(7 * 24 * 60);
  const [hideAuditOnly, setHideAuditOnly] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const now = istToday();
    setToday(now);
    // Pre-select what is still ahead and applies to most people.
    const { upcoming } = buildCalendar(now);
    setSelected(new Set(upcoming.filter((d) => d.who !== 'Audit cases only').map((d) => d.id)));
  }, []);

  const calendar = useMemo(() => buildCalendar(today || undefined), [today]);

  const visible = useMemo(() => {
    const rows = today ? [...calendar.upcoming, ...calendar.passed] : calendar.all;
    return hideAuditOnly ? rows.filter((d) => d.who !== 'Audit cases only') : rows;
  }, [calendar, hideAuditOnly, today]);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedCount = selected.size;

  const handleDownload = () => {
    const events = calendar.all
      .filter((d) => selected.has(d.id))
      .map((d) => ({
        title: `${d.title} (${d.year})`,
        startWallIst: `${d.date}T${EVENT_HOUR_IST}`,
        durationMinutes: 30,
        description: d.detail,
        url: 'https://upaman.com/income-tax-due-dates',
        alarmMinutesBefore: [leadMinutes],
        uid: `${d.id}@upaman.com`
      }));
    const ics = buildIcsCalendar(events, { calendarName: 'Income tax deadlines — Upaman' });
    if (downloadIcs(ics, 'income-tax-deadlines.ics')) {
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    }
  };

  return (
    <>
      <Head>
        <title>ITR Filing Last Date & Income Tax Due Dates AY 2026-27 | Upaman</title>
        <meta
          name="description"
          content="Every income tax deadline for AY 2026-27 and FY 2026-27 in one calendar: ITR filing last date, belated and revised return deadlines, and advance tax due dates. Add the ones that apply to you to your own calendar — no sign-up."
        />
        <meta
          name="keywords"
          content="itr filing last date, income tax due dates, itr last date ay 2026-27, advance tax due dates fy 2026-27, belated return last date, revised return last date, tax calendar india, income tax deadline"
        />
        <link rel="canonical" href="https://upaman.com/income-tax-due-dates" />
        <meta property="og:title" content="ITR Filing Last Date & Income Tax Due Dates AY 2026-27 | Upaman" />
        <meta
          property="og:description"
          content="Every income tax deadline for AY 2026-27 in one place, with calendar reminders you can add yourself. No sign-up."
        />
        <meta property="og:url" content="https://upaman.com/income-tax-due-dates" />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Income Tax Deadline Calendar - Upaman',
              url: 'https://upaman.com/income-tax-due-dates',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
            })
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(faqItems)) }} />
      </Head>

      <CalcShell
        icon={CalendarClock}
        title="Income Tax Due Dates (AY 2026-27)"
        subtitle="Every filing and payment deadline that still applies, with the option to put the ones you care about in your own calendar."
      >
        <LanguageToggle className="mb-6" />

        <label style={f.checkboxRow} htmlFor="d-audit">
          <input
            id="d-audit"
            type="checkbox"
            checked={hideAuditOnly}
            onChange={(e) => setHideAuditOnly(e.target.checked)}
          />
          {t('deadlines.hideAuditOnly')}
        </label>

        <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visible.map((d) => (
            <div key={d.id} className={`deadline-row deadline-row--${d.status ? d.status.band : 'upcoming'}`}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  id={`d-${d.id}`}
                  checked={selected.has(d.id)}
                  onChange={() => toggle(d.id)}
                  style={{ marginTop: '4px', flexShrink: 0 }}
                  aria-label={`Add ${d.title} to calendar`}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'baseline' }}>
                    <label htmlFor={`d-${d.id}`} className="deadline-title">
                      {d.title}
                    </label>
                    {d.status ? <span className="deadline-status">{d.status.label}</span> : null}
                  </div>
                  <p className="deadline-meta">
                    {formatLongDate(d.date)} · {d.year} · {d.who}
                  </p>
                  <p className="deadline-detail">
                    {d.detail}
                    {d.guideHref ? (
                      <>
                        {' '}
                        <a href={d.guideHref} style={{ fontWeight: 600 }}>
                          Read the guide →
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={f.group}>
          <label style={f.label} htmlFor="d-lead">
            {t('deadlines.remindMe')}
          </label>
          <select
            style={f.input}
            id="d-lead"
            value={leadMinutes}
            onChange={(e) => setLeadMinutes(Number(e.target.value))}
          >
            {LEAD_TIMES.map((l) => (
              <option key={l.minutes} value={l.minutes}>
                {t(l.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={selectedCount === 0}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: 'none',
            background: selectedCount === 0 ? '#94a3b8' : '#1d4e89',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.98rem',
            cursor: selectedCount === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          {downloaded
            ? t('deadlines.downloaded')
            : t(selectedCount === 1 ? 'deadlines.addOne' : 'deadlines.addMany').replace('{count}', selectedCount)}
        </button>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px', lineHeight: 1.55 }}>
          Downloads an <code>.ics</code> file that imports into Google Calendar, Apple Calendar, Outlook, or any
          calendar app. Generated entirely in your browser — no sign-up, no email address, nothing sent to or stored
          by Upaman.
        </p>

        <section className="calc-prose">
          <h2>ITR filing last date for AY 2026-27</h2>
          <p>
            The main deadline was <strong>July 31, 2026</strong>, covering income earned in{' '}
            <strong>FY 2025-26</strong> (April 2025 to March 2026), which the portal calls{' '}
            <strong>Assessment Year 2026-27</strong>. That date applies to salaried individuals and anyone else whose
            accounts do not require a tax audit. Audit cases file by October 31, 2026.
          </p>
          <p>
            Missing it is not the end of the process, but it costs more than the late fee suggests. A{' '}
            <strong>belated return</strong> is allowed until <strong>December 31, 2026</strong> with a fee of up to
            ₹5,000 — and two quieter penalties: the <strong>new regime becomes compulsory</strong>, so if the old
            regime would have saved you money that saving is simply gone, and most losses can no longer be carried
            forward. For anyone with meaningful deductions, filing on time is worth real rupees rather than just
            tidiness.
          </p>

          <h2>The two years running at once</h2>
          <p>
            The single most common mistake on this page&rsquo;s topic is not missing a date but reading the wrong one,
            because two tax years are always live simultaneously:
          </p>
          <ul>
            <li>
              <strong>Assessment Year 2026-27</strong> governs <em>filing</em> deadlines — the ITR due date, belated
              and revised windows — all for income you <em>already earned</em> in FY 2025-26.
            </li>
            <li>
              <strong>Financial Year 2026-27</strong> governs <em>payment</em> deadlines — advance tax instalments and
              the tax-saving investment cutoff — for income you are <em>earning right now</em>.
            </li>
          </ul>
          <p>
            So in the same week you might owe an advance tax instalment for this year&rsquo;s income and still be able
            to revise last year&rsquo;s return. Every row above is labelled with the year it belongs to for exactly
            this reason.
          </p>

          <h2>Belated, revised, and updated returns</h2>
          <p>
            These three get confused constantly, and the confusion has been made worse by a recent change:{' '}
            <strong>Budget 2026 moved the revised-return deadline from December 31 to March 31</strong>, so a great
            many articles still quote a date that is no longer right.
          </p>
          <ul>
            <li>
              <strong>Belated return — December 31, 2026.</strong> For people who never filed at all.
            </li>
            <li>
              <strong>Revised return — March 31, 2027.</strong> For people who filed and then found a mistake. No
              penalty, no limit on how many times.{' '}
              <a href="/guides/how-to-file-revised-return">How to file a revised return →</a>
            </li>
            <li>
              <strong>Updated return (ITR-U) — up to 48 months.</strong> The last resort once both windows have
              closed, at 25–70% additional tax.
            </li>
          </ul>

          <h2>Advance tax due dates for FY 2026-27</h2>
          <p>
            Advance tax applies to anyone whose estimated liability for the year, after TDS, is{' '}
            <strong>₹10,000 or more</strong> — which catches far more salaried people than expected once freelance
            income, capital gains, or large FD interest enter the picture, because TDS alone rarely covers those. The
            instalments are <strong>cumulative</strong>, not four equal quarters: by September 15 you should have paid
            45% of the year&rsquo;s total, counting whatever you paid in June. Shortfalls attract interest under
            Section 234C.
          </p>

          <h2>Why a calendar file instead of an email reminder</h2>
          <p>
            Sending you reminders would mean Upaman holding your email address and running a scheduler — a mailing
            list you would later need to unsubscribe from, in exchange for a notification you can already generate
            yourself. A calendar event is better on the merits: it fires from your own device even without a network
            connection, it travels with the rest of your calendar, and it appears in the app you already check. The
            file is built in your browser and never touches a server.
          </p>
        </section>

        <CalcFAQ items={faqItems} />

        <CalculatorInfoPanel
          reviewedOn="August 2, 2026"
          credibilityScope="Deadlines follow the Income Tax Department's published due dates for AY 2026-27 and FY 2026-27. Calendar reminders are .ics events generated in your browser; Upaman neither sends nor stores them."
          assumptions={[
            'Dates shown are the statutory deadlines for individual taxpayers. The department occasionally extends specific deadlines by circular within a season.',
            'Advance tax instalments are cumulative percentages of the estimated annual liability, not equal quarterly payments.',
            'Audit-case deadlines are hidden by default because they do not apply to salaried taxpayers.'
          ]}
          sources={[
            { label: 'Income Tax Department — e-filing portal', href: 'https://www.incometax.gov.in' }
          ]}
          guideLinks={[
            { label: 'How to file your ITR (AY 2026-27)', href: '/guides/how-to-file-itr' },
            { label: 'How to file a revised return (Section 139(5))', href: '/guides/how-to-file-revised-return' },
            { label: 'Income tax refund status: how to check and fix delays', href: '/guides/income-tax-refund-status' }
          ]}
        />
      </CalcShell>
    </>
  );
};

export default TaxDeadlineCalendar;
