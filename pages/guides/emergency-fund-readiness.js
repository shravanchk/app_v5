import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';
import Callout from '../../components/guides/Callout';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Emergency Fund Readiness Guide',
  description: 'How to set your emergency runway, calculate the corpus gap, and build a realistic monthly plan for your household profile.',
  author: { '@type': 'Organization', name: 'Upaman Research Team' },
  publisher: { '@type': 'Organization', name: 'Upaman' },
  datePublished: '2026-07-06',
  dateModified: '2026-07-06',
  mainEntityOfPage: 'https://upaman.com/guides/emergency-fund-readiness'
};

export default function EmergencyFundReadinessGuide() {
  return (
    <GuidePageLayout
      title="Emergency Fund Readiness Guide"
      description="Set a risk-based emergency runway, calculate your corpus gap, and build a realistic monthly plan to close it."
      canonicalPath="/guides/emergency-fund-readiness"
      reviewedOn="July 6, 2026"
      articleSchema={articleSchema}
    >
      <p>
        Emergency funds are not about maximizing returns. They are about buying decision time when income is disrupted or
        expenses spike unexpectedly. Without this buffer, people often liquidate long-term investments at the worst time
        or use high-cost debt for short-term survival. A robust emergency corpus prevents both.
      </p>
      <p>
        This guide explains how to set your target runway, calculate your corpus gap, and build a monthly action plan that
        is realistic for your household profile.
      </p>

      <h2 style={sectionTitleStyle}>Why &ldquo;3 months&rdquo; is not universal</h2>
      <p>
        Generic advice like 3 or 6 months is only a starting point. The right emergency runway depends on your job risk,
        income stability, dependents, health coverage, and whether your household relies on a single income.
      </p>
      <Callout>
        <p><strong>Risk-sensitive approach:</strong> low-risk dual-income households can work with a lower runway;
        variable-income or single-income households usually need a higher runway.</p>
      </Callout>

      <h2 style={sectionTitleStyle}>Core formula</h2>
      <p>
        <strong>Emergency corpus target = monthly essential expenses × target runway months.</strong>
      </p>
      <p>
        Essential expenses should include only non-negotiables: rent/EMI, groceries, utilities, insurance premiums, school
        fees, medicines, and minimum debt obligations. Do not include discretionary spending.
      </p>

      <h2 style={sectionTitleStyle}>How to choose target runway months</h2>
      <ul>
        <li><strong>3 to 4 months:</strong> stable job, low fixed commitments, strong support system.</li>
        <li><strong>5 to 7 months:</strong> moderate uncertainty, dependents, or mixed variable pay.</li>
        <li><strong>8 to 12 months:</strong> high job risk, self-employment, single-income household, or medical uncertainty.</li>
      </ul>
      <p>
        If you are unsure, start with a moderate target and revise yearly rather than waiting for perfect certainty.
      </p>

      <h2 style={sectionTitleStyle}>Illustrative example</h2>
      <p>
        Suppose essential monthly expenses are ₹50,000 and your risk profile suggests 7 months of runway.
      </p>
      <ul>
        <li>Target corpus = ₹50,000 × 7 = ₹3,50,000</li>
        <li>Current corpus = ₹1,40,000</li>
        <li>Gap = ₹2,10,000</li>
      </ul>
      <p>
        If you can allocate ₹21,000 monthly toward emergency savings, you need roughly 10 months to close the gap,
        assuming no major withdrawals.
      </p>

      <h2 style={sectionTitleStyle}>Where to hold emergency money</h2>
      <ul>
        <li>High-liquidity savings instruments (low volatility, easy withdrawal).</li>
        <li>Short-duration low-risk buckets for part of the corpus if withdrawal access remains fast.</li>
        <li>A separate account structure to avoid accidental spending.</li>
      </ul>
      <p>
        The objective is reliability and access, not return optimization.
      </p>

      <h2 style={sectionTitleStyle}>What should not be treated as an emergency fund</h2>
      <ul>
        <li>Retirement corpus meant for long-term goals.</li>
        <li>Illiquid real estate value.</li>
        <li>Volatile equity positions needed for long-term investing.</li>
        <li>Credit card limit (this is borrowing capacity, not emergency savings).</li>
      </ul>

      <h2 style={sectionTitleStyle}>Milestone-based build plan</h2>
      <p>
        Trying to jump directly to 9 or 12 months can feel overwhelming. Use milestone execution:
      </p>
      <Callout>
        <ol>
          <li>Reach 1 month of essentials first (basic shock absorber).</li>
          <li>Then 3 months (meaningful stability).</li>
          <li>Then 6 months (strong baseline for many households).</li>
          <li>Then your final risk-adjusted target.</li>
        </ol>
      </Callout>
      <p>
        Each milestone lowers panic risk and improves decision quality during stress events.
      </p>

      <h2 style={sectionTitleStyle}>How much of monthly surplus should go to the emergency corpus?</h2>
      <ul>
        <li><strong>Very low runway:</strong> allocate a larger share (for example 70% to 80%) until the 3-month target.</li>
        <li><strong>Moderate runway:</strong> allocate a medium share (around 50% to 65%) until the full target.</li>
        <li><strong>At/above target:</strong> maintain the corpus and redirect extra surplus to debt reduction or investing.</li>
      </ul>

      <h2 style={sectionTitleStyle}>Common mistakes</h2>
      <ul>
        <li>Underestimating essential monthly expenses.</li>
        <li>Mixing the emergency corpus with daily spending accounts.</li>
        <li>Pausing contributions after one good month.</li>
        <li>Ignoring profile changes like childbirth, relocation, or career transition.</li>
        <li>Over-investing emergency money in illiquid or high-volatility assets.</li>
      </ul>

      <h2 style={sectionTitleStyle}>Annual emergency readiness review</h2>
      <Callout tone="note">
        <ol>
          <li>Update the essential-expense baseline.</li>
          <li>Reassess job/income risk and dependent count.</li>
          <li>Recalculate target runway months.</li>
          <li>Measure the corpus gap and contribution timeline.</li>
          <li>Automate a monthly top-up and set a quarterly checkpoint.</li>
        </ol>
      </Callout>

      <h2 style={sectionTitleStyle}>Use these tools next</h2>
      <ul>
        <li><a href="/emergency-fund-readiness-workflow">Emergency Fund Readiness Workflow</a> for a risk-based runway target and milestones.</li>
        <li><a href="/prepay-vs-invest-workflow">Prepay vs Invest Workflow</a> to decide surplus allocation after the core safety buffer.</li>
        <li><a href="/loan-calculator">Loan &amp; EMI Calculator</a> for debt stress testing.</li>
        <li><a href="/methodology">Methodology</a> for assumptions and interpretation notes.</li>
      </ul>

      <p>
        This guide is informational and does not replace financial, legal, or tax advice. For complex situations, consult
        qualified professionals.
      </p>
    </GuidePageLayout>
  );
}
