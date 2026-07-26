import LegalPageLayout, { headingTwoStyle } from '../../components/legal/LegalPageLayout';
import { SITE_OPERATOR, buildProfileSchema } from '../../utils/editorialProfiles';

const PROFILE_URL = '/authors/upaman-research-team';
const DESCRIPTION =
  'Who researches and writes Upaman’s calculators and guides: Shravan Cherukuri, the software engineer who builds and maintains the site.';

const schema = buildProfileSchema({
  profileUrl: PROFILE_URL,
  headline: 'Upaman Research — Shravan Cherukuri',
  description: DESCRIPTION
});

const OperatorLink = () => (
  <a href={SITE_OPERATOR.linkedin} rel="me noopener" target="_blank">
    <strong>{SITE_OPERATOR.name}</strong>
  </a>
);

export default function UpamanResearchTeamPage() {
  return (
    <LegalPageLayout
      title="Upaman Research"
      description={DESCRIPTION}
      canonicalPath={PROFILE_URL}
      reviewedOn="July 26, 2026"
      schema={schema}
    >
      <h2 style={headingTwoStyle}>Who writes this site</h2>
      <p>
        Research and content on Upaman are the work of one person: <OperatorLink />, a software
        engineer. He builds the calculation engines, writes the guides, and maintains the site. There
        is no separate research department, and this page exists so you know exactly who is
        accountable for what you read here.
      </p>
      <p>
        You can reach him through the <a href={SITE_OPERATOR.contactUrl}>contact page</a>, or read
        more about the project on <a href={SITE_OPERATOR.aboutUrl}>About Upaman</a>.
      </p>

      <h2 style={headingTwoStyle}>What that means for accuracy</h2>
      <p>
        A one-person site cannot lean on institutional authority, so it has to be checkable instead.
        Three things make that possible:
      </p>
      <ul>
        <li>
          <strong>Rules come from primary sources.</strong>{' '}Tax bands, contribution ceilings, and
          statutory charges are taken from published statutes, official rate tables, and government
          or regulator releases &mdash; not from other calculator sites. Each region-specific tool
          states its tax year, jurisdiction, and currency so the assumption set is visible.
        </li>
        <li>
          <strong>Worked examples are generated, not typed.</strong> The numbers in the prose come
          from the same engine the calculator runs. That makes it structurally impossible for the
          explanation to drift away from the result when a rate changes.
        </li>
        <li>
          <strong>The engines are unit-tested.</strong> Calculation logic is covered by automated
          tests that assert documented worked examples, statutory boundaries, and slab edges, so a
          rate update that breaks an assumption fails before it ships.
        </li>
      </ul>

      <h2 style={headingTwoStyle}>What this page is not</h2>
      <p>
        Upaman is educational planning software written by an engineer, not by a chartered
        accountant, tax advisor, or licensed financial professional. Nothing on the site is personal
        financial, tax, or legal advice. For decisions with real money at stake, confirm the output
        against the official source the tool cites, or against a qualified professional.
      </p>

      <h2 style={headingTwoStyle}>Corrections</h2>
      <p>
        If a figure looks wrong, it may well be. Reports are welcome and are treated as bugs:
        reproduce, fix the engine, update the tests. See the{' '}
        <a href="/corrections-policy">Corrections Policy</a> for how issues are logged and
        acknowledged.
      </p>
      <p>
        Related: <a href="/editorial-policy">Editorial Policy</a> {'•'}{' '}
        <a href="/review-process">Review Process</a> {'•'}{' '}
        <a href="/methodology">Methodology</a> {'•'}{' '}
        <a href="/publisher-standards">Publisher Standards</a>
      </p>
    </LegalPageLayout>
  );
}
