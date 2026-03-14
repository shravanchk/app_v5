import LegalPageLayout, { headingTwoStyle } from '../../components/legal/LegalPageLayout';

export default function PersonalFinanceReviewDeskPage() {
  return (
    <LegalPageLayout
      title="Personal Finance Review Desk"
      description="Review profile for Upaman pages covering loans, salary, tax, savings, debt, and household cash-flow workflows."
      canonicalPath="/authors/personal-finance-review-desk"
      reviewedOn="March 14, 2026"
    >
      <p>
        The Personal Finance Review Desk checks whether workflow outputs, formulas, and narrative guidance are coherent
        for real-world budgeting decisions. This review layer focuses on consistency, assumption clarity, and user risk.
      </p>
      <h2 style={headingTwoStyle}>What This Review Covers</h2>
      <ul>
        <li>Whether assumptions are stated clearly and applied consistently.</li>
        <li>Whether outputs are framed as planning guidance, not professional advice.</li>
        <li>Whether related tools and guides are linked so users can validate decisions more deeply.</li>
      </ul>
      <h2 style={headingTwoStyle}>What This Review Does Not Mean</h2>
      <p>
        Review does not replace advice from a chartered accountant, tax advisor, lender, or fiduciary financial
        professional. It is an internal quality-control function for educational content.
      </p>
      <p>
        Related pages: <a href="/review-process">Review Process</a> {'\u2022'}{' '}
        <a href="/publisher-standards">Publisher Standards</a> {'\u2022'} <a href="/corrections-policy">Corrections Policy</a>
      </p>
    </LegalPageLayout>
  );
}
