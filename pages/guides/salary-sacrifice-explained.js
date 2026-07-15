import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Salary Sacrifice Explained: The UK\'s Most Underused Pay Rise',
  description:
    'How salary sacrifice works, the exact tax and National Insurance saving with a £40,000 worked example, which schemes qualify, and the catches to check first.',
  author: { '@type': 'Organization', name: 'Upaman Research Team' },
  publisher: { '@type': 'Organization', name: 'Upaman' },
  datePublished: '2026-07-15',
  dateModified: '2026-07-15',
  mainEntityOfPage: 'https://upaman.com/guides/salary-sacrifice-explained'
};

export default function SalarySacrificeGuidePage() {
  return (
    <GuidePageLayout
      title="Salary Sacrifice Explained: The UK's Most Underused Pay Rise"
      description="How salary sacrifice works, the exact tax and NI saving with a £40,000 worked example, which schemes qualify (pension, EVs, cycling), and the catches."
      canonicalPath="/guides/salary-sacrifice-explained"
      reviewedOn="July 15, 2026"
      reviewer="UK Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        Salary sacrifice is a formal agreement to <strong>reduce your contractual salary</strong> in exchange for
        your employer providing something of equal value — most commonly pension contributions. Because the
        sacrificed amount never counts as pay, it escapes both income tax <em>and</em> National Insurance. A regular
        pension contribution only escapes the first; the NI saving is what makes sacrifice the most efficient way to
        fund a pension from employment income.
      </p>

      <h2 style={sectionTitleStyle}>Worked example: £2,000 into a pension on a £40,000 salary</h2>
      <ul>
        <li>
          <strong>Via salary sacrifice:</strong> salary drops to £38,000; £2,000 goes to the pension. You avoid 20%
          income tax (£400) and 8% employee NI (£160) on that slice — take-home falls by only{' '}
          <strong>£1,440</strong> for £2,000 invested.
        </li>
        <li>
          <strong>Via a normal (relief-at-source) contribution:</strong> the same £2,000 in the pension costs £1,600
          from taxed pay — the NI is already gone. Sacrifice beats it by <strong>£160 a year</strong>, every year,
          for filling in one form.
        </li>
        <li>
          <strong>Higher-rate earners</strong> save 40% tax + 2% NI up front (relief-at-source users must claim the
          extra 20% via self-assessment — many never do, which makes sacrifice's automatic relief worth even more).
          And an employer NI saving arises on the sacrificed amount too — some employers pass part of it into your
          pension; always ask.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>What can be sacrificed</h2>
      <ul>
        <li><strong>Pension contributions</strong> — the flagship use, biggest amounts, clearest win.</li>
        <li><strong>Electric vehicles</strong> — lease an EV from gross salary; you pay Benefit-in-Kind tax on a deliberately low rate for EVs, usually far less than the tax saved.</li>
        <li><strong>Cycle-to-work</strong> — a bike and kit from gross pay, repaid over 12–18 months.</li>
        <li><strong>Additional holiday, workplace nurseries</strong> — offered by some employers.</li>
        <li>Cash, regular childcare costs, and most other spending <strong>cannot</strong> be sacrificed — HMRC restricts the list precisely because the NI leakage is real money.</li>
      </ul>

      <h2 style={sectionTitleStyle}>The catches — check these before signing</h2>
      <ul>
        <li>
          <strong>Your contractual salary genuinely falls.</strong> Anything calculated from it can fall too:
          mortgage affordability multiples, statutory maternity/paternity pay, some death-in-service and sick-pay
          benefits, and future raises if they're percentage-based. Good employers calculate these on a "notional"
          pre-sacrifice salary — confirm yours does.
        </li>
        <li>
          <strong>Minimum wage floor:</strong> sacrifice cannot take your pay below the National Minimum Wage, which
          caps how much lower earners can use it.
        </li>
        <li>
          <strong>The £100,000 cliff works in reverse for you:</strong> sacrificing pay that would fall in the
          £100,000–£125,140 band restores Personal Allowance at the same time, producing effective relief of around
          60% — the single most tax-efficient pound most high earners can save. See{' '}
          <a href="/guides/how-to-read-your-uk-payslip">how your payslip is taxed</a> for why.
        </li>
        <li>
          <strong>Pension money is locked</strong> until pension access age — sacrifice what your budget can genuinely
          spare, not what the tax math tempts you to.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>Is it worth it for you?</h2>
      <p>
        If your employer offers it for pensions and none of the catches above bite, salary sacrifice is close to free
        money: same pension contribution, smaller take-home reduction. The people who should pause are those near the
        minimum-wage floor, planning parental leave soon, or about to apply for a mortgage where every pound of
        headline salary matters.
      </p>

      <h2 style={sectionTitleStyle}>Run your numbers</h2>
      <p>
        Model your take-home before and after a sacrifice with the{' '}
        <a href="/uk-income-tax-calculator">UK Income Tax Calculator</a> — run it at your current salary, then at the
        reduced salary, and compare the drop in take-home against the amount landing in your pension. The full
        2026-27 bands and thresholds are in our <a href="/guides/uk-tax-rates-2026-27">UK tax rates guide</a>, or
        look up any salary in the <a href="/uk/take-home">take-home pay tables</a>. This is general education, not
        personalized tax advice.
      </p>
    </GuidePageLayout>
  );
}
