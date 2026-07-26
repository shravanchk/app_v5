import LegalPageLayout, { headingTwoStyle } from '../../components/legal/LegalPageLayout';
import { SITE_OPERATOR, buildProfileSchema } from '../../utils/editorialProfiles';

const PROFILE_URL = '/authors/travel-utility-review-desk';
const DESCRIPTION =
  'How Upaman’s IRCTC and travel planning tools are reviewed against published railway rules — and who does it: Shravan Cherukuri.';

const schema = buildProfileSchema({
  profileUrl: PROFILE_URL,
  headline: 'Travel Utility Review — Shravan Cherukuri',
  description: DESCRIPTION
});

const OperatorLink = () => (
  <a href={SITE_OPERATOR.linkedin} rel="me noopener" target="_blank">
    <strong>{SITE_OPERATOR.name}</strong>
  </a>
);

export default function TravelUtilityReviewDeskPage() {
  return (
    <LegalPageLayout
      title="Travel Utility Review"
      description={DESCRIPTION}
      canonicalPath={PROFILE_URL}
      reviewedOn="July 26, 2026"
      schema={schema}
    >
      <h2 style={headingTwoStyle}>Who reviews these pages</h2>
      <p>
        Upaman&apos;s travel tools &mdash; IRCTC cancellation and Tatkal charges, TDR refund
        eligibility, berth position, and booking-window planning &mdash; are reviewed by{' '}
        <OperatorLink />, the software engineer who builds and maintains the site. One person, not a
        desk. This page says so rather than implying a team that does not exist.
      </p>

      <h2 style={headingTwoStyle}>Why these tools are reviewed differently</h2>
      <p>
        Financial calculators model rules that are published once a year and change slowly. Railway
        rules do not behave that way: charge slabs, quota behaviour, chart-preparation timing, and
        refund eligibility are operational, revised without much notice, and applied with local
        variation. A tool that is correct in April can be wrong in September without anything on the
        site having changed.
      </p>
      <p>The review pass is shaped around that:</p>
      <ul>
        <li>
          <strong>Slabs are traced to the published circular</strong> that set them, with the flat
          charge, clerkage, and GST treatment checked per class rather than assumed uniform.
        </li>
        <li>
          <strong>Time boundaries get explicit test cases.</strong>{' '}The 72-hour, 24-hour and 8-hour
          confirmed-ticket cut-offs &mdash; and the half-hour limit on RAC and waitlisted tickets
          &mdash; are exactly where a refund estimate goes wrong, so each edge is asserted as an
          inclusive or exclusive boundary rather than approximated.
        </li>
        <li>
          <strong>Operational variability is surfaced, not hidden.</strong> Where outcome depends on
          chart status, quota, or the discretion of the booking system, the tool says so instead of
          presenting a single confident number.
        </li>
        <li>
          <strong>The official portal is always named</strong>{' '}as the authority, with a link, so a
          time-critical decision is never taken on this site&apos;s estimate alone.
        </li>
      </ul>

      <h2 style={headingTwoStyle}>What this review does not mean</h2>
      <p>
        These tools are planning estimates, not a booking or refund service, and they have no
        connection to IRCTC or Indian Railways. They cannot see your PNR, your chart status, or your
        refund queue. For anything time-sensitive or money-bearing, the official IRCTC portal is the
        only authoritative source.
      </p>

      <h2 style={headingTwoStyle}>When pages get re-reviewed</h2>
      <p>
        Travel tools are revisited when a charge circular or refund rule is amended, and whenever a
        reader reports an outcome that differs from the tool. Because these rules change with little
        notice, discrepancy reports are the most useful signal available &mdash; please send them
        via the <a href={SITE_OPERATOR.contactUrl}>contact page</a>.
      </p>
      <p>
        Related: <a href="/review-process">Review Process</a> {'•'}{' '}
        <a href="/methodology">Methodology</a> {'•'}{' '}
        <a href="/corrections-policy">Corrections Policy</a> {'•'}{' '}
        <a href={SITE_OPERATOR.aboutUrl}>About Upaman</a>
      </p>
    </LegalPageLayout>
  );
}
