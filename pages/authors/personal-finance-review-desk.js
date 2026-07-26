import LegalPageLayout, { headingTwoStyle } from '../../components/legal/LegalPageLayout';
import { SITE_OPERATOR, buildProfileSchema } from '../../utils/editorialProfiles';

const PROFILE_URL = '/authors/personal-finance-review-desk';
const DESCRIPTION =
  'How Upaman’s loan, salary, tax, savings and debt tools are reviewed before publication — and who does it: Shravan Cherukuri.';

const schema = buildProfileSchema({
  profileUrl: PROFILE_URL,
  headline: 'Personal Finance Review — Shravan Cherukuri',
  description: DESCRIPTION
});

const OperatorLink = () => (
  <a href={SITE_OPERATOR.linkedin} rel="me noopener" target="_blank">
    <strong>{SITE_OPERATOR.name}</strong>
  </a>
);

export default function PersonalFinanceReviewDeskPage() {
  return (
    <LegalPageLayout
      title="Personal Finance Review"
      description={DESCRIPTION}
      canonicalPath={PROFILE_URL}
      reviewedOn="July 26, 2026"
      schema={schema}
    >
      <h2 style={headingTwoStyle}>Who reviews these pages</h2>
      <p>
        Loan, salary, tax, savings, debt, and household cash-flow tools on Upaman are reviewed by{' '}
        <OperatorLink />, the software engineer who builds and maintains the site. This is a review
        function performed by one person, not a panel &mdash; there is no separate desk and no
        anonymous team behind it. Saying so plainly matters more than the alternative.
      </p>

      <h2 style={headingTwoStyle}>What the review actually checks</h2>
      <p>
        Review here is a pre-publication pass over the engine and its explanation, in this order:
      </p>
      <ul>
        <li>
          <strong>The rule matches the source.</strong> Every rate, slab, threshold, cess, and cap is
          traced back to the statute or official rate table it came from, for the stated tax year.
        </li>
        <li>
          <strong>The boundaries are right.</strong> Slab edges, rebate cut-offs, marginal-relief
          bands, and minimum/maximum caps are the places calculators break. Each gets an explicit
          test case at the boundary, not just in the middle of the range.
        </li>
        <li>
          <strong>The prose matches the maths.</strong> Because worked examples are generated from
          the same engine the tool runs, this is verified structurally rather than by re-reading.
        </li>
        <li>
          <strong>Assumptions are stated where the user can see them</strong> &mdash; tax year,
          jurisdiction, currency, and anything the tool had to assume on the user&apos;s behalf.
        </li>
        <li>
          <strong>Results are framed as planning estimates</strong>, with the official source named
          so the number can be confirmed independently.
        </li>
      </ul>

      <h2 style={headingTwoStyle}>What this review does not mean</h2>
      <p>
        It is an internal quality-control step on educational software. It is not professional
        advice, and it does not substitute for a chartered accountant, tax advisor, lender, or
        fiduciary financial professional. Where a decision carries real financial consequence &mdash;
        filing, borrowing, prepaying, switching tax regime &mdash; confirm against the official
        source or a qualified professional before acting.
      </p>

      <h2 style={headingTwoStyle}>When pages get re-reviewed</h2>
      <p>
        A tool is revisited when the underlying rates change (typically at the start of a financial
        year), when a rule it depends on is amended mid-year, or when a reader reports a
        discrepancy. Each page shows its own last-reviewed date. Errors are handled under the{' '}
        <a href="/corrections-policy">Corrections Policy</a>.
      </p>
      <p>
        Related: <a href="/review-process">Review Process</a> {'•'}{' '}
        <a href="/publisher-standards">Publisher Standards</a> {'•'}{' '}
        <a href="/methodology">Methodology</a> {'•'}{' '}
        <a href={SITE_OPERATOR.aboutUrl}>About Upaman</a>
      </p>
    </LegalPageLayout>
  );
}
