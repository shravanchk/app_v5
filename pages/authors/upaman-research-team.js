import LegalPageLayout, { headingTwoStyle } from '../../components/legal/LegalPageLayout';

export default function UpamanResearchTeamPage() {
  return (
    <LegalPageLayout
      title="Upaman Research Team"
      description="Editorial profile for the Upaman Research Team covering calculator assumptions, workflow guides, and source synthesis."
      canonicalPath="/authors/upaman-research-team"
      reviewedOn="March 14, 2026"
    >
      <p>
        The Upaman Research Team prepares planning content, calculation assumptions, and supporting guides for the
        site&apos;s finance and utility tools. The team focuses on simplifying high-impact decisions into practical,
        transparent models. It is led by <strong>Shravan Cherukuri</strong>, the software engineer who builds and
        maintains Upaman (see <a href="/about">About Upaman</a>).
      </p>
      <h2 style={headingTwoStyle}>Scope of Work</h2>
      <ul>
        <li>Translate official rules, public references, and standard formulas into usable calculator assumptions.</li>
        <li>Draft supporting guides that explain decisions behind salary, loan, tax, savings, and transport tools.</li>
        <li>Flag known limitations so users understand where official confirmation is still required.</li>
      </ul>
      <h2 style={headingTwoStyle}>Editorial Standards</h2>
      <p>
        Research content is written for educational planning use. It is reviewed before publication and updated when
        core assumptions, public rates, or workflow logic materially changes.
      </p>
      <p>
        Related pages: <a href="/editorial-policy">Editorial Policy</a> {'\u2022'}{' '}
        <a href="/review-process">Review Process</a> {'\u2022'} <a href="/methodology">Methodology</a>
      </p>
    </LegalPageLayout>
  );
}
