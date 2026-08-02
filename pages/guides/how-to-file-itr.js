import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to File Your Income Tax Return (AY 2026-27)',
  description:
    'Filing your ITR for FY 2025-26 income: which ITR form applies to you, choosing your regime at filing time, what to reconcile against AIS before submitting, and the e-verification deadline that voids returns.',
  author: { '@type': 'Organization', name: 'Upaman Research Team' },
  publisher: { '@type': 'Organization', name: 'Upaman' },
  datePublished: '2026-07-17',
  dateModified: '2026-07-17',
  mainEntityOfPage: 'https://upaman.com/guides/how-to-file-itr'
};

export default function HowToFileItrGuidePage() {
  return (
    <GuidePageLayout
      title="How to File Your Income Tax Return (AY 2026-27)"
      description="Filing ITR for FY 2025-26 income: which form applies to you, picking your regime at filing time, reconciling AIS and Form 16, and the e-verification step that voids returns if missed."
      canonicalPath="/guides/how-to-file-itr"
      reviewedOn="July 17, 2026"
      reviewer="India Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        This filing season you are reporting <strong>FY 2025-26 income</strong> (April 2025 – March 2026), which the
        portal calls <strong>Assessment Year 2026-27</strong> — the single most common dropdown mistake is picking the
        wrong one of these. For salaried taxpayers the due date is <strong>July 31, 2026</strong>; extensions get
        announced some years, but a plan built on one isn't a plan. Filing itself takes under an hour on{' '}
        <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer">incometax.gov.in</a> — the
        real work is three decisions you should make <em>before</em> you log in.
      </p>

      <h2 style={sectionTitleStyle}>Step 0 — gather these before you start</h2>
      <ul>
        <li><strong>Form 16</strong> from every employer you had during FY 2025-26 (issued by mid-June).</li>
        <li><strong>AIS/TIS and Form 26AS</strong> — download both from the portal; this is what the department already knows about you.</li>
        <li><strong>Interest certificates</strong> for savings accounts and FDs (or pull the figures from AIS).</li>
        <li><strong>Capital gains statements</strong> from your broker/fund house if you sold anything.</li>
        <li><strong>Rent receipts and landlord PAN</strong> if you'll claim HRA under the old regime.</li>
        <li>A <strong>pre-validated bank account</strong> on the portal — refunds only go to validated accounts.</li>
      </ul>

      <h2 style={sectionTitleStyle}>Decision 1 — which ITR form</h2>
      <p>The wrong form gets you a "defective return" notice and a re-file. For individuals it usually comes down to:</p>
      <ul>
        <li>
          <strong>ITR-1 (Sahaj):</strong> resident individual, total income up to ₹50 lakh, from salary/pension +{' '}
          <em>one</em> house property + other sources like interest. The simplest form, pre-filled almost entirely.
          Recent-year forms also admit small listed-equity LTCG within the exempt-ish band — check the current form's
          instructions if that's your only capital gain.
        </li>
        <li>
          <strong>ITR-2:</strong> everything ITR-1 excludes but still no business income — capital gains, more than
          one house property, income above ₹50 lakh, foreign assets or ESOPs/RSUs of a foreign employer (these force
          ITR-2 even if tiny), NRI status.
        </li>
        <li>
          <strong>ITR-3 / ITR-4:</strong>{' '}business or professional income — ITR-4 (Sugam) if you use presumptive
          taxation, ITR-3 otherwise (including F&amp;O trading, which counts as business income).
        </li>
      </ul>
      <p>
        Rule of thumb for salaried people: <strong>sold any shares or mutual funds beyond the ITR-1 allowance, or own
        two properties → ITR-2; otherwise ITR-1.</strong>
      </p>

      <h2 style={sectionTitleStyle}>Decision 2 — your regime, locked at filing</h2>
      <p>
        The new regime is the default, but salaried taxpayers can choose the old regime <strong>fresh each year,
        inside the return itself</strong> — no separate form needed (business income holders face a stickier
        once-in-a-lifetime switch rule). Two things people miss:
      </p>
      <ul>
        <li>
          <strong>Your employer's TDS choice doesn't bind you.</strong> If payroll deducted tax under the new regime
          all year but the old regime (HRA + 80C + home-loan interest) computes lower, claim the old regime in the
          return and take the difference as a refund — and vice versa.
        </li>
        <li>
          <strong>File late and the choice disappears:</strong> a belated return must use the new regime. If the old
          regime saves you money, the July 31 deadline is worth real rupees, not just penalty avoidance.
        </li>
      </ul>
      <p>
        Run both regimes on your actual FY 2025-26 numbers with the{' '}
        <a href="/tax-regime-comparison">regime comparison calculator</a> before filing — and note that for this
        return year, the HRA metro list is still the old four-city one (the{' '}
        <a href="/guides/hra-exemption-calculation">eight-city expansion</a> applies from FY 2026-27 income onward).
      </p>

      <h2 style={sectionTitleStyle}>Decision 3 — trust but reconcile the pre-fill</h2>
      <p>
        The portal pre-fills your return from AIS. Don't accept it blindly, and don't contradict it silently — either
        path invites a notice. Check:
      </p>
      <ul>
        <li><strong>Every employer appears.</strong> Job-switchers: two Form 16s often both apply the standard deduction and full slabs — combining them usually produces tax <em>due</em>, and skipping the old employer is the classic notice trigger, since their TDS filing already told the department.</li>
        <li><strong>Interest income matches AIS</strong> — savings and FD interest is fully visible to the department now; "forgot the FD" is the most common mismatch.</li>
        <li><strong>TDS credits in 26AS match what you're claiming</strong> — a missing credit means your deductor mis-filed; chase them, don't just claim it.</li>
        <li><strong>Dividends, share sales, foreign remittances</strong> in AIS are reflected in the right schedules.</li>
      </ul>

      <h2 style={sectionTitleStyle}>File — then e-verify within 30 days, or none of it happened</h2>
      <p>
        Submitting the return is not the end. An unverified return is treated as <strong>never filed</strong>. E-verify
        immediately — Aadhaar OTP is the fastest route; net banking and bank-EVC also work — rather than leaving it
        for "later." This is the highest-stakes low-effort step in the entire process: thirty seconds, or your
        on-time return silently becomes a non-filing.
      </p>

      <h2 style={sectionTitleStyle}>After filing, and if you missed the deadline</h2>
      <ul>
        <li><strong>Processing and refund:</strong> most salaried returns process within days to a few weeks; the refund lands in your pre-validated account. Track it under "View Filed Returns" — see <a href="/guides/income-tax-refund-status">how to check your income tax refund status</a> for what each status message means and how to fix a failed refund.</li>
        <li><strong>Found a mistake?</strong> A <strong>revised return</strong> can replace the original until <strong>March 31, 2027</strong> — Budget 2026 extended this window from the old December 31 cut-off — with no penalty for correcting honestly. See <a href="/guides/how-to-file-revised-return">how to file a revised return</a>.</li>
        <li><strong>Missed July 31?</strong> A <strong>belated return</strong> is allowed until December 31, 2026, with a late fee (up to ₹5,000; capped at ₹1,000 for small incomes) — plus the two quieter costs: new regime becomes compulsory, and most losses can't be carried forward.</li>
      </ul>

      <h2 style={sectionTitleStyle}>Run your numbers</h2>
      <p>
        Estimate your FY 2025-26 liability with the <a href="/income-tax-calculator">Income Tax Calculator</a>, settle
        the regime question with the <a href="/tax-regime-comparison">regime comparison</a>, and check your HRA
        exemption with the <a href="/hra-calculator">HRA calculator</a> before claiming the old regime. The regime
        decision framework is covered in depth in{' '}
        <a href="/guides/income-tax-regime-choice">old vs new regime choice</a>, and every filing deadline is listed on the <a href="/income-tax-due-dates">income tax due dates</a> page. Procedural specifics (portal flows,
        exact form applicability) can change within a season — when in doubt,{' '}
        <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer">incometax.gov.in</a> is the
        authority. This is general education, not personalized tax advice.
      </p>
    </GuidePageLayout>
  );
}
