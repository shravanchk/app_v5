import LegalPageLayout, { headingTwoStyle } from '../components/legal/LegalPageLayout';

export default function ReviewProcessPage() {
  return (
    <LegalPageLayout
      title="Upaman Review Process"
      description="How Upaman reviews calculator pages, workflow logic, and supporting guides before updates go live."
      canonicalPath="/review-process"
      reviewedOn="March 14, 2026"
    >
      <p>
        Upaman uses a simple internal review process before shipping major workflow, guide, and calculator changes.
        The goal is to keep formula logic, decision guidance, and source framing aligned.
      </p>
      <h2 style={headingTwoStyle}>Review Stages</h2>
      <ol>
        <li>Model assumptions are documented and checked against source references.</li>
        <li>User inputs and outputs are tested for common edge cases and unreasonable values.</li>
        <li>Page-level guidance is checked so results are presented as planning support, not formal advice.</li>
        <li>Related tools and guides are linked to reduce isolated, thin-tool pages.</li>
      </ol>
      <h2 style={headingTwoStyle}>When Pages Are Updated</h2>
      <p>
        Pages are updated when major assumptions change, formulas are improved, new supporting guides are added, or a
        correction materially changes what a user should conclude from the tool.
      </p>
      <p>
        Related pages: <a href="/editorial-policy">Editorial Policy</a> {'\u2022'}{' '}
        <a href="/corrections-policy">Corrections Policy</a> {'\u2022'} <a href="/methodology">Methodology</a>
      </p>
    </LegalPageLayout>
  );
}
