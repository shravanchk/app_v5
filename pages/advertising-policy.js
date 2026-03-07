import LegalPageLayout, { headingTwoStyle } from '../components/legal/LegalPageLayout';

export default function AdvertisingPolicyPage() {
  return (
    <LegalPageLayout
      title="Advertising Policy"
      description="Advertising policy for Upaman, including ad placement rules, invalid traffic controls, and publisher-policy compliance principles."
      canonicalPath="/advertising-policy"
    >
      <p>
        Upaman uses advertising to support calculator development and free access. Ads must never reduce clarity,
        mislead users, or interfere with core calculator workflows.
      </p>

      <h2 style={headingTwoStyle}>Policy Baseline</h2>
      <p>
        We align ad implementation with Google Publisher Policies, AdSense Program Policies, and applicable local
        laws. Where policy interpretation is unclear, we take the more conservative implementation approach.
      </p>

      <h2 style={headingTwoStyle}>Ad Placement Rules</h2>
      <ul>
        <li>No deceptive ad labels, fake buttons, or ad units disguised as calculator controls.</li>
        <li>No forced interaction patterns that increase accidental clicks.</li>
        <li>Primary content and calculator utility remain accessible without ad interaction.</li>
        <li>High-impact content pages must remain readable on mobile and desktop.</li>
      </ul>

      <h2 style={headingTwoStyle}>Invalid Traffic and Click Quality</h2>
      <ul>
        <li>No incentivized clicks, paid click schemes, or self-clicking behavior.</li>
        <li>No artificial traffic generation through bots, auto-refresh loops, or misleading redirects.</li>
        <li>Traffic and engagement patterns are reviewed for abnormal behavior.</li>
      </ul>

      <h2 style={headingTwoStyle}>Restricted and Sensitive Content</h2>
      <p>
        We avoid monetizing content categories that conflict with publisher policies. Tools and guides are educational
        and do not promote harmful, deceptive, or illegal activity.
      </p>

      <h2 style={headingTwoStyle}>Reporting and Enforcement</h2>
      <p>
        Suspected ad-policy issues can be reported via <a href="/contact">Contact</a>. Material violations are
        prioritized for immediate correction or ad-disablement on affected pages.
      </p>

      <p>
        <a href="/publisher-standards">Publisher Standards</a> {'\u2022'} <a href="/editorial-policy">Editorial Policy</a>{' '}
        {'\u2022'} <a href="/affiliate-disclosure">Affiliate Disclosure</a>
      </p>
      <p style={{ marginBottom: 0 }}>
        <a href="/">← Back to Calculators</a>
      </p>
    </LegalPageLayout>
  );
}
