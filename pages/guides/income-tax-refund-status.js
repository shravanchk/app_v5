import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const tableCls = 'w-full border-collapse text-[0.95rem]';
const thCls =
  'border border-slate-200 bg-slate-50 px-3 py-2 text-left align-top font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 align-top dark:border-slate-700';

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Income Tax Refund Status: How to Check Your ITR Refund (AY 2026-27)',
    description:
      'How to check income tax refund status online by PAN or acknowledgement number on incometax.gov.in, what every refund status message means, how long an ITR refund takes, and how to fix a failed refund with a refund reissue request.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-08-02',
    dateModified: '2026-08-02',
    mainEntityOfPage: 'https://upaman.com/guides/income-tax-refund-status'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I check my income tax refund status by PAN?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Log in to incometax.gov.in with your PAN as the user ID, then go to e-File > Income Tax Returns > View Filed Returns, pick Assessment Year 2026-27 and click View Details. That screen shows the full refund lifecycle — when the return was processed, when the refund was determined, and when it was sent to the refund banker. Without logging in you can use the Income Tax Return (ITR) Status service with your acknowledgement number and a mobile OTP.'
        }
      },
      {
        '@type': 'Question',
        name: 'How many days does an income tax refund take in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Most straightforward salaried returns are processed within 7 to 45 days of e-verification, and the refund is usually credited within 4 to 5 weeks. The clock starts at e-verification, not at filing — an unverified return is treated as never filed and no refund is processed at all.'
        }
      },
      {
        '@type': 'Question',
        name: 'What does refund failed mean and how do I fix it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Refund Failed means the department released the money but the bank could not accept it — usually because the account is not pre-validated, the name on the account does not match PAN, the IFSC changed after a bank merger, or the account is closed. Fix the bank account under Profile > My Bank Account, pre-validate and nominate it for refund, then raise a Refund Reissue request under Services > Refund Reissue for that assessment year.'
        }
      },
      {
        '@type': 'Question',
        name: 'My ITR is processed but the refund is not credited. Why?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'The three common reasons are: the refund was adjusted against an old outstanding demand under Section 245, the bank credit failed and the status reads Refund Failed, or the refund is still in transit with the refund banker (SBI), which typically takes a few working days after the intimation email. Read the Section 143(1) intimation first — it states the refund actually determined, which can be lower than the refund you claimed.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do I get interest on a delayed income tax refund?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes. Under Section 244A the department pays 0.5% per month (6% a year) on delayed refunds, calculated from April 1 of the assessment year if you filed by the due date. No interest is payable if the refund is less than 10% of the tax determined, and the interest you receive is itself taxable as income from other sources in the year you receive it.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I check income tax refund status without logging in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes. On the e-filing portal home page, open the Income Tax Return (ITR) Status service under Quick Links, enter your 15-digit acknowledgement number and the mobile number given in the return, and verify the OTP. This shows the return status; the detailed refund lifecycle and any reissue option require logging in.'
        }
      }
    ]
  }
];

export default function IncomeTaxRefundStatusGuide() {
  return (
    <GuidePageLayout
      title="Income Tax Refund Status: How to Check Your ITR Refund (AY 2026-27)"
      description="Check income tax refund status online by PAN or acknowledgement number on incometax.gov.in. What every refund status means — refund awaited, processed with refund due, refund failed, refund adjusted — how long an ITR refund takes in 2026, and how to raise a refund reissue request."
      canonicalPath="/guides/income-tax-refund-status"
      reviewedOn="August 2, 2026"
      reviewer="India Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        You filed your return for <strong>FY 2025-26 (Assessment Year 2026-27)</strong>, the portal said a refund was due,
        and now nothing has landed. This guide covers <strong>how to check your income tax refund status online</strong> —
        by PAN after logging in, or by acknowledgement number without logging in — what each refund status message actually
        means, how long an <strong>ITR refund</strong> normally takes, and the exact fix when the status says{' '}
        <strong>refund failed</strong> or when your <strong>ITR is processed but the refund is not credited</strong>.
      </p>
      <p>
        One thing to settle before anything else: <strong>refund processing only starts when you e-verify.</strong> If you
        submitted the return and never completed e-verification within 30 days, the return is treated as never filed, and
        there is no refund status to check because there is no return to process. Everything below assumes an e-verified
        return.
      </p>

      <h2 style={sectionTitleStyle}>The fastest way: check refund status by PAN (after login)</h2>
      <p>
        This is the authoritative route, and the only one that shows the full refund lifecycle with dates:
      </p>
      <ol>
        <li>
          Go to{' '}
          <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer">incometax.gov.in</a> and log in.
          Your <strong>user ID is your PAN</strong>.
        </li>
        <li>Open <strong>e-File → Income Tax Returns → View Filed Returns</strong>.</li>
        <li>Find <strong>AY 2026-27</strong> in the list and click <strong>View Details</strong>.</li>
        <li>
          You now see the return's timeline: return filed, e-verified, <strong>processed</strong>, refund determined, refund
          issued, and the date the refund was <strong>sent to the refund banker</strong>, along with the mode of payment and
          the last four digits of the credited account.
        </li>
      </ol>
      <p>
        The same screen is where you download the <strong>intimation under Section 143(1)</strong> — the document that tells
        you the refund the department actually computed, which is not always the refund you claimed. Read it before
        concluding a refund is "missing." The PDF opens with a password: your <strong>PAN in lowercase followed by your date
        of birth as DDMMYYYY</strong> (for example, <em>abcde1234f01011990</em>).
      </p>

      <h2 style={sectionTitleStyle}>Check ITR refund status without logging in</h2>
      <p>
        If you don't have portal credentials handy, use the <strong>Income Tax Return (ITR) Status</strong> service under{' '}
        <strong>Quick Links</strong> on the e-filing home page. Enter your <strong>15-digit acknowledgement number</strong>{' '}
        (on the ITR-V and in your filing confirmation email) and the <strong>mobile number given in the return</strong>, then
        verify the 6-digit OTP. This confirms whether the return is verified and processed — it does not expose refund
        reissue or bank details, so a genuine refund problem still needs a login.
      </p>
      <p>
        A note on the old route: a large number of articles still tell you to check refund status on the{' '}
        <strong>TIN-NSDL (now Protean) refund tracking page</strong> using PAN and assessment year. Refund tracking has been
        consolidated into the e-filing portal, so treat <strong>incometax.gov.in</strong> as the single source of truth —
        if the two ever disagree, the portal is right. And no legitimate refund check ever requires a fee, a card number, or
        a link sent over SMS or WhatsApp; refund-themed phishing peaks in exactly this part of the year.
      </p>

      <h2 style={sectionTitleStyle}>What each refund status message means</h2>
      <div className="mt-4 overflow-x-auto">
        <table className={tableCls}>
          <thead>
            <tr>
              <th className={thCls}>Status you see</th>
              <th className={thCls}>What it actually means</th>
              <th className={thCls}>What to do</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}><strong>Return submitted, not e-verified</strong></td>
              <td className={tdCls}>Nothing is in the queue. The return is legally treated as not filed.</td>
              <td className={tdCls}>E-verify now via Aadhaar OTP, net banking, or bank EVC — within 30 days of filing.</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Successfully e-verified / Under processing</strong></td>
              <td className={tdCls}>CPC has your return and is matching it against AIS, Form 26AS, and TDS credits.</td>
              <td className={tdCls}>Wait. This is the normal state for the first few weeks.</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Processed with refund due</strong></td>
              <td className={tdCls}>Assessment is complete and a refund has been determined in your favour.</td>
              <td className={tdCls}>Nothing — payment follows. Check the 143(1) intimation for the exact amount.</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Refund awaited</strong></td>
              <td className={tdCls}>A refund is due but has not yet been released — usually a pending bank validation or a queue delay.</td>
              <td className={tdCls}>Confirm your bank account is pre-validated and nominated for refund.</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Refund determined and sent to refund banker</strong></td>
              <td className={tdCls}>Money has gone to SBI, the government's refund banker, for credit to your account.</td>
              <td className={tdCls}>Expect credit in roughly 3–7 working days.</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Refund issued</strong></td>
              <td className={tdCls}>Paid. The screen shows the date, mode, and masked account number.</td>
              <td className={tdCls}>Match it against your bank statement; the credit narration mentions ITR/CPC.</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Refund failed</strong></td>
              <td className={tdCls}>The credit was rejected by the bank — bad IFSC, unvalidated or closed account, name–PAN mismatch, or an inoperative PAN.</td>
              <td className={tdCls}>Fix the bank account, then raise a <strong>refund reissue</strong> request (steps below).</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Refund partially adjusted / fully adjusted</strong></td>
              <td className={tdCls}>An old outstanding demand was set off against this year's refund under Section 245.</td>
              <td className={tdCls}>Open <strong>Pending Actions → Response to Outstanding Demand</strong> and check whether the demand is even valid.</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>No demand, no refund</strong></td>
              <td className={tdCls}>CPC computed your tax as exactly settled — often because a claim you made was disallowed.</td>
              <td className={tdCls}>Compare the 143(1) columns line by line; if it's wrong, file a rectification under Section 154.</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Demand determined</strong></td>
              <td className={tdCls}>The opposite of a refund — the department says you owe tax, typically from a mismatched TDS or income claim.</td>
              <td className={tdCls}>Respond within the window given; don't ignore it, interest accrues.</td>
            </tr>
            <tr>
              <td className={tdCls}><strong>Refund expired / returned</strong></td>
              <td className={tdCls}>An issued refund was never encashed or was returned unpaid.</td>
              <td className={tdCls}>Raise a refund reissue request against a validated account.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 style={sectionTitleStyle}>How long does an income tax refund take?</h2>
      <p>
        There is no statutory turnaround, but the practical pattern for AY 2026-27 is stable: <strong>most simple salaried
        returns are processed within 7 to 45 days of e-verification</strong>, and refunds typically land{' '}
        <strong>within 4 to 5 weeks</strong>. Some ITR-1 returns are processed in under a week. Returns with capital gains,
        foreign income, multiple Form 16s, or large deduction claims take longer, and returns picked for scrutiny take much
        longer.
      </p>
      <p>
        Two structural points worth knowing. Refund issuance is now effectively <strong>fully electronic</strong> — which
        makes it fast but also unforgiving of any data mismatch, so a single wrong digit in an IFSC stalls the whole thing.
        And <strong>refunds below ₹100 are not issued</strong>; they are carried in your account rather than paid out, so a
        tiny refund that never arrives is usually not an error.
      </p>

      <h2 style={sectionTitleStyle}>Refund failed? The reissue request, step by step</h2>
      <p>
        A failed refund is almost never a problem with your return — it is a banking data problem. Fix the cause first,
        because a reissue against the same broken account fails again.
      </p>
      <ol>
        <li>
          <strong>Check your PAN is operative.</strong> A PAN not linked with Aadhaar is inoperative, and refunds are
          withheld while it stays that way (no interest accrues for that period either).
        </li>
        <li>
          <strong>Fix the bank account:</strong> go to <strong>Profile → My Bank Account</strong>. Add or re-validate the
          account, confirm the IFSC is current (bank mergers silently invalidate old IFSC codes), and make sure the{' '}
          <strong>account holder name matches your PAN exactly</strong>.
        </li>
        <li>
          <strong>Wait for validation to succeed</strong> — status must read <em>Validated</em>, and you must also{' '}
          <strong>nominate the account for refund</strong>. These are two separate switches, and missing the second one is
          the most common reason a "fixed" account still doesn't receive money.
        </li>
        <li>
          <strong>Raise the reissue:</strong> <strong>Services → Refund Reissue → Create Refund Reissue Request</strong>,
          select AY 2026-27, pick the validated account, and e-verify the request.
        </li>
        <li>Track it under the same menu; a successful reissue usually credits within a few weeks.</li>
      </ol>
      <p>
        Only accounts of these types work: savings or current accounts held in your own name and linked to your PAN. A
        joint account where you are not the primary holder, an NRO account that isn't validated, or a relative's account
        will never receive your refund.
      </p>

      <h2 style={sectionTitleStyle}>Refund adjusted against an old demand (Section 245)</h2>
      <p>
        If your refund silently shrank or vanished, check for a <strong>Section 245 adjustment</strong>: the department can
        set off a refund against tax demands from earlier years. It must give you prior intimation and a response window
        (typically 30 days) before doing so — and those emails are widely missed. Go to{' '}
        <strong>Pending Actions → Response to Outstanding Demand</strong>, and if the demand is stale, already paid, or
        plainly wrong, disagree with it and give the reason. Many of these old demands trace back to TDS credits that were
        never matched, and they persist until someone contests them.
      </p>

      <h2 style={sectionTitleStyle}>Interest on a delayed refund — and the part people forget</h2>
      <p>
        Under <strong>Section 244A</strong>, the department pays <strong>0.5% per month (6% a year)</strong> on delayed
        refunds. If you filed by the due date, interest runs from <strong>April 1 of the assessment year</strong> to the
        date the refund is granted; file late and it runs only from your filing date. No interest is payable when the
        refund is less than <strong>10% of the tax determined</strong>.
      </p>
      <p>
        The forgotten part: <strong>this interest is taxable</strong> as income from other sources, in the year you receive
        it. So a 244A interest credit received now belongs in next year's return — and it will already be sitting in your
        AIS, waiting to become a mismatch if you leave it out.
      </p>

      <h2 style={sectionTitleStyle}>Still nothing? Escalation order</h2>
      <ul>
        <li>
          <strong>Read the 143(1) intimation first.</strong> Most "missing refund" cases are actually a reduced or nil
          refund the taxpayer never opened the email about.
        </li>
        <li>
          <strong>Rectification (Section 154)</strong> — use it when the intimation itself is wrong, such as a TDS credit
          the system ignored: <strong>Services → Rectification</strong>.
        </li>
        <li>
          <strong>Grievance</strong> — <strong>Services → Grievances</strong> on the portal, tagged to CPC-ITR, for a
          refund that is stuck with no explanation.
        </li>
        <li>
          <strong>Helpdesk</strong> — the e-filing helpline (1800 103 0025 / 1800 419 0025) for portal and processing
          issues; SBI's CPC refund banker desk handles credit failures once the refund has been issued. Current numbers
          are listed on the portal's Contact Us page.
        </li>
        <li>
          <strong>Condonation of delay</strong> — if you missed e-verifying within 30 days and the return lapsed, you can
          request condonation under <strong>Services → Condonation Request</strong> rather than losing the refund entirely.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>Frequently asked questions</h2>
      <h3>Can I check refund status by PAN alone, without an acknowledgement number?</h3>
      <p>
        Yes — logging in with your PAN and going to <strong>View Filed Returns</strong> needs no acknowledgement number.
        The acknowledgement number is only needed for the pre-login ITR status check.
      </p>
      <h3>Why does my refund show as issued but my bank shows no credit?</h3>
      <p>
        Give it 3–7 working days from the "sent to refund banker" date. After that, verify the masked account number on the
        portal is the account you expect — refunds often go to an older validated account people have stopped using.
      </p>
      <h3>Can I change the bank account for a refund after filing?</h3>
      <p>
        Yes. Add and pre-validate the new account under <strong>My Bank Account</strong>, nominate it for refund, and raise a
        refund reissue request. You do not need to revise the return for this.
      </p>
      <h3>Does a revised return restart the refund clock?</h3>
      <p>
        Yes. Processing shifts to the revised return, so a revision filed while the original was still under processing
        resets the timeline. Revised returns for AY 2026-27 are allowed until December 31, 2026.
      </p>
      <h3>Is my income tax refund taxable?</h3>
      <p>
        The refund itself is not — it is your own excess tax coming back. Only the Section 244A interest paid along with it
        is taxable.
      </p>

      <h2 style={sectionTitleStyle}>Related tools and guides</h2>
      <p>
        Work out whether a refund was even due with the <a href="/income-tax-calculator">Income Tax Calculator</a>, settle
        the regime question using the <a href="/tax-regime-comparison">regime comparison tool</a>, and check your exemption
        with the <a href="/hra-calculator">HRA calculator</a>. For the filing process itself, see{' '}
        <a href="/guides/how-to-file-itr">how to file your ITR (AY 2026-27)</a>; for the regime decision,{' '}
        <a href="/guides/income-tax-regime-choice">old vs new regime choice</a> and the{' '}
        <a href="/guides/old-vs-new-regime-breakeven-fy-2026-27">breakeven analysis</a>.
      </p>
      <p>
        Portal menus and processing timelines change between filing seasons — when something here doesn't match what you
        see on screen,{' '}
        <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer">incometax.gov.in</a> is the
        authority. This is general education, not personalized tax advice.
      </p>
    </GuidePageLayout>
  );
}
