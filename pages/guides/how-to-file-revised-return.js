import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const tableCls = 'w-full border-collapse text-[0.95rem]';
const thCls =
  'border border-slate-200 bg-slate-50 px-3 py-2 text-left align-top font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 align-top dark:border-slate-700';

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to File a Revised Return (Section 139(5), AY 2026-27)',
    description:
      'How to file a revised income tax return under Section 139(5) for AY 2026-27 — the March 31, 2027 deadline, the step-by-step portal flow, what the original acknowledgement number is for, and when to use a rectification or ITR-U instead.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-08-02',
    dateModified: '2026-08-02',
    mainEntityOfPage: 'https://upaman.com/guides/how-to-file-revised-return'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the last date to file a revised return for AY 2026-27?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'March 31, 2027 — the end of the assessment year — or the completion of assessment, whichever is earlier. Budget 2026 extended the revised-return window from December 31 to March 31. Note this is different from the belated return deadline, which remains December 31, 2026.'
        }
      },
      {
        '@type': 'Question',
        name: 'How many times can I revise my income tax return?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'There is no limit on the number of revisions under Section 139(5). Each revised return replaces the previous one, and only the latest revision is processed. Repeated revisions are not penalised, but each one restarts processing, so it is better to fix everything in a single careful revision.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I file a revised return after my ITR has been processed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Generally yes. An intimation under Section 143(1) is processing, not a completed assessment, so you can normally still revise within the time limit. Once a scrutiny assessment is completed, the window closes. If the error is in the department’s processing rather than in your return, file a rectification under Section 154 instead.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I change my tax regime in a revised return?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'If you have no business or professional income, you can generally switch between the old and new regime in a revised return, provided the original return was filed by the due date. Taxpayers with business or professional income cannot — that choice is tied to Form 10-IEA filed by the original due date.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is there a penalty for filing a revised return?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'There is no penalty for correcting an honest mistake through a revised return. If the revision increases your tax liability you pay the additional tax plus interest under Sections 234B and 234C. A revision that reduces refund already received means paying back the excess.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do I need to e-verify a revised return?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes, within 30 days, exactly like the original. An unverified revised return is treated as never filed — which leaves the original return standing with its error intact. This is the most common way a revision silently fails.'
        }
      }
    ]
  }
];

export default function HowToFileRevisedReturnGuide() {
  return (
    <GuidePageLayout
      title="How to File a Revised Return (Section 139(5), AY 2026-27)"
      description="Filed your ITR and spotted a mistake? A revised return under Section 139(5) replaces the original with no penalty, up to March 31, 2027 for AY 2026-27. The portal steps, the acknowledgement number that trips people up, and when a rectification or ITR-U is the right tool instead."
      canonicalPath="/guides/how-to-file-revised-return"
      reviewedOn="August 2, 2026"
      reviewer="India Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        You filed on time, and then found the problem: an FD interest entry you forgot, a second Form 16 you never
        combined, a deduction you could have claimed, a bank account with a typo. A{' '}
        <strong>revised return under Section 139(5)</strong> fixes it. It fully replaces the return you filed, carries{' '}
        <strong>no penalty for correcting an honest mistake</strong>, and can be filed as many times as you need.
      </p>
      <p>
        The one thing to get right first is the deadline, because it changed. For{' '}
        <strong>AY 2026-27 (FY 2025-26 income)</strong> you can revise until <strong>March 31, 2027</strong> — Budget
        2026 extended the window from the old December 31 cut-off to the end of the assessment year. Do not confuse
        this with the <strong>belated return</strong> deadline, which is still <strong>December 31, 2026</strong>.
        Different returns, different dates, and plenty of articles still quote the old December date for both.
      </p>

      <h2 style={sectionTitleStyle}>Revised, belated, rectification, or ITR-U — pick the right one</h2>
      <p>Using the wrong instrument is the most common way people waste a filing season. The short version:</p>
      <div className="mt-4 overflow-x-auto">
        <table className={tableCls}>
          <thead>
            <tr>
              <th className={thCls}>Use this</th>
              <th className={thCls}>When</th>
              <th className={thCls}>Deadline for AY 2026-27</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}><strong>Revised return</strong><br />Section 139(5)</td>
              <td className={tdCls}>You filed a return and it contains a mistake or omission — yours to fix.</td>
              <td className={tdCls}><strong>March 31, 2027</strong>, or completion of assessment if earlier</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Belated return</strong><br />Section 139(4)</td>
              <td className={tdCls}>You never filed at all and the July 31 due date has passed.</td>
              <td className={tdCls}>December 31, 2026, with a late fee up to ₹5,000</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Rectification</strong><br />Section 154</td>
              <td className={tdCls}>Your return was right but CPC processed it wrong — an ignored TDS credit, an arithmetic mismatch in the 143(1).</td>
              <td className={tdCls}>Within 4 years from the end of the year the intimation was passed</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Updated return</strong><br />ITR-U, Section 139(8A)</td>
              <td className={tdCls}>The revised and belated windows have both closed and you need to declare additional income.</td>
              <td className={tdCls}>Up to 48 months from the end of the AY, with additional tax of 25–70%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The distinction that matters most: <strong>a revised return corrects your mistake; a rectification corrects
        the department's.</strong> Filing a revision when you needed a rectification leaves the original problem
        untouched, and vice versa.
      </p>

      <h2 style={sectionTitleStyle}>Before you revise — three checks</h2>
      <ul>
        <li>
          <strong>Was the original e-verified?</strong> If it was never verified, it is legally not filed, so there is
          nothing to revise. In that case you e-verify it (or file fresh) rather than revising.
        </li>
        <li>
          <strong>Have your original acknowledgement number and filing date ready.</strong> The revised return form
          asks for both, and it will not accept the return without them. Find them on the ITR-V, in your filing
          confirmation email, or under <strong>e-File → Income Tax Returns → View Filed Returns</strong>.
        </li>
        <li>
          <strong>Re-download your AIS/TIS and Form 26AS.</strong> They are updated continuously — deductors file late,
          and the data that was there in July often is not the data that is there now. Reconciling against a stale
          download is how a second mistake gets introduced while fixing the first.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>How to file a revised return — step by step</h2>
      <ol>
        <li>
          Log in to{' '}
          <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer">incometax.gov.in</a> and go
          to <strong>e-File → Income Tax Returns → File Income Tax Return</strong>.
        </li>
        <li>Select <strong>Assessment Year 2026-27</strong> and the online or offline mode you prefer.</li>
        <li>
          When asked for the filing type, choose <strong>Revised return under Section 139(5)</strong> — not "original".
        </li>
        <li>
          Enter the <strong>acknowledgement number and date of the original return</strong>. This is the step that
          links the revision to what you filed before; get it wrong and the return is treated as an unlinked filing.
        </li>
        <li>
          <strong>Correct the actual error</strong> — and file the return complete, not just the changed part. A
          revised return is a full replacement, so every schedule must be right, including the ones you are not
          changing.
        </li>
        <li>
          Recompute the tax. If more is payable, <strong>pay the self-assessment tax first</strong> and enter the
          challan details before submitting, or the return files with a demand attached.
        </li>
        <li>
          Submit, then <strong>e-verify within 30 days</strong> — Aadhaar OTP is fastest. This is not optional; see
          below.
        </li>
      </ol>

      <h2 style={sectionTitleStyle}>The step where revisions quietly fail</h2>
      <p>
        <strong>An unverified revised return is treated as never filed.</strong> The consequence is worse than it
        sounds: your original return, with the error still in it, remains the operative return and gets processed as
        is. People submit the revision, feel the problem is handled, skip verification, and find out months later that
        nothing changed. Verify immediately, and confirm the status reads{' '}
        <em>Successfully e-verified</em> under View Filed Returns before you close the tab.
      </p>

      <h2 style={sectionTitleStyle}>What a revision does to your refund</h2>
      <ul>
        <li>
          <strong>Processing restarts.</strong> The original stops being processed and the clock begins again on the
          revised return, so a refund in progress is delayed. If the original was nearly processed, weigh whether the
          correction is worth resetting the queue.
        </li>
        <li>
          <strong>Refund already received?</strong> If the revision reduces your refund, you repay the excess. If it
          increases it, the difference is paid out on the revised computation.
        </li>
        <li>
          <strong>Extra tax payable</strong> comes with interest under Sections 234B and 234C — interest, not penalty.
          Correcting voluntarily is still far cheaper than being found out.
        </li>
      </ul>
      <p>
        Once the revised return is processed, track the outcome the same way as any other — see{' '}
        <a href="/guides/income-tax-refund-status">how to check your income tax refund status</a>.
      </p>

      <h2 style={sectionTitleStyle}>Can you change your tax regime in a revised return?</h2>
      <p>
        This is the highest-value revision for a lot of salaried people, and the answer depends on your income type:
      </p>
      <ul>
        <li>
          <strong>No business or professional income:</strong> you can generally switch between old and new regime in
          a revised return, as long as the <strong>original was filed by the due date</strong>. If payroll deducted
          under one regime and the other computes lower, this is real money back.
        </li>
        <li>
          <strong>Business or professional income:</strong> you cannot. That choice is locked to{' '}
          <strong>Form 10-IEA filed by the original due date</strong>, and a revised return does not reopen it.
        </li>
        <li>
          <strong>Original filed late?</strong> A belated return must use the new regime, and revising it does not
          unlock the old one.
        </li>
      </ul>
      <p>
        Run both regimes on your actual numbers with the{' '}
        <a href="/tax-regime-comparison">regime comparison calculator</a> before revising — the switch is only worth
        the effort if the difference is real.
      </p>

      <h2 style={sectionTitleStyle}>Mistakes worth revising for</h2>
      <ul>
        <li><strong>Missed interest income</strong> — savings and FD interest is fully visible in AIS; the mismatch will surface.</li>
        <li><strong>A second Form 16</strong> from a job switch that was never combined with the first.</li>
        <li><strong>Deductions you were entitled to</strong> but did not claim — 80C, 80D, home-loan interest, HRA under the old regime.</li>
        <li><strong>Capital gains</strong> from share or fund sales left out, or reported in the wrong schedule.</li>
        <li><strong>The wrong ITR form</strong> — revising with the correct form is the fix for a defective-return notice.</li>
        <li><strong>Wrong bank details.</strong> Worth knowing: if the only problem is a failed refund, you do not need to revise at all — fix the account and raise a refund reissue request instead.</li>
      </ul>

      <h2 style={sectionTitleStyle}>Related tools and guides</h2>
      <p>
        Recompute your liability with the <a href="/income-tax-calculator">Income Tax Calculator</a> before revising,
        settle the regime question with the <a href="/tax-regime-comparison">regime comparison tool</a>, and check
        your exemption with the <a href="/hra-calculator">HRA calculator</a>. See also{' '}
        <a href="/guides/how-to-file-itr">how to file your ITR (AY 2026-27)</a> and{' '}
        <a href="/guides/income-tax-refund-status">income tax refund status</a>. Every deadline in one place, with calendar reminders, is on the <a href="/income-tax-due-dates">income tax due dates</a> page.
      </p>
      <p>
        Deadlines and portal flows change between seasons — the revised-return window itself moved in Budget 2026, so
        when something here doesn't match what you see,{' '}
        <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer">incometax.gov.in</a> is the
        authority. This is general education, not personalized tax advice.
      </p>
    </GuidePageLayout>
  );
}
