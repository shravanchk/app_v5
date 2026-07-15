import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'APR vs APY: The Difference, and When Each One Misleads You',
  description:
    'APR is the simple annual rate; APY includes compounding. Why banks quote each where they do, the exact conversion math, and worked examples for savings, CDs, and credit cards.',
  author: { '@type': 'Organization', name: 'Upaman Research Team' },
  publisher: { '@type': 'Organization', name: 'Upaman' },
  datePublished: '2026-07-15',
  dateModified: '2026-07-15',
  mainEntityOfPage: 'https://upaman.com/guides/apr-vs-apy'
};

export default function AprVsApyGuidePage() {
  return (
    <GuidePageLayout
      title="APR vs APY: The Difference, and When Each One Misleads You"
      description="APR is the simple annual rate; APY includes compounding. The conversion math, why banks quote each where they do, and worked examples for savings and credit cards."
      canonicalPath="/guides/apr-vs-apy"
      reviewedOn="July 15, 2026"
      articleSchema={articleSchema}
    >
      <p>
        APR and APY answer the same question — "what does a year of this rate do?" — with one crucial difference:{' '}
        <strong>APY includes compounding, APR doesn't.</strong> The gap between them is small on paper and large in
        practice, and financial institutions consistently quote whichever number flatters the product. Once you can
        convert between them, that trick stops working on you.
      </p>

      <h2 style={sectionTitleStyle}>The definitions</h2>
      <ul>
        <li>
          <strong>APR (annual percentage rate)</strong> is the simple annualized rate: the periodic rate multiplied by
          the number of periods. A card charging about 0.0658% per day has a 24% APR. On loans, APR is also the
          legally standardized disclosure that folds in certain fees — which is why it's the number regulators make
          lenders show.
        </li>
        <li>
          <strong>APY (annual percentage yield)</strong> is what you actually earn or pay after interest starts
          earning interest: <em>APY = (1 + APR ÷ n)ⁿ − 1</em>, where n is how many times per year interest
          compounds.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>The gap in real numbers</h2>
      <ul>
        <li>A savings account at <strong>5% APR compounded monthly</strong> yields <strong>5.12% APY</strong>. At 6% APR, 6.17% APY.</li>
        <li>A credit card at <strong>24% APR compounded daily</strong> costs <strong>27.1% APY</strong> if you carry the balance all year — the compounding you were never shown adds three full points.</li>
        <li>At low rates the distinction almost vanishes (2% APR monthly = 2.02% APY). The gap grows with the rate and the compounding frequency — which is exactly where it matters.</li>
      </ul>

      <h2 style={sectionTitleStyle}>Why the quoted number is never an accident</h2>
      <ul>
        <li>
          <strong>Savings, CDs, money market:</strong> quoted in <strong>APY</strong> — the bigger, compounding-included
          number makes the deposit look better. US truth-in-savings rules actually require APY here, which conveniently
          aligns with marketing.
        </li>
        <li>
          <strong>Credit cards, mortgages, auto loans:</strong> quoted in <strong>APR</strong> — the smaller number.
          For a mortgage paid monthly with no revolving balance the APR is a fair description; for a revolving credit
          card balance compounding daily, the effective cost is meaningfully higher than the sticker.
        </li>
        <li>
          <strong>The comparison rule:</strong> never compare an APR against an APY. Convert both to APY (the real
          annual effect) and compare like with like. Two savings accounts at "5.00%" can differ if one compounds daily
          and the other quarterly.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>Three places this changes a decision</h2>
      <ol>
        <li>
          <strong>Choosing between CDs:</strong> a CD quoting a rate with annual compounding can pay less than one with
          a slightly lower rate compounding daily. The APY line on the disclosure settles it — insist on it.
        </li>
        <li>
          <strong>Carrying a card balance vs taking a personal loan:</strong> a 24% APR card compounding daily
          effectively costs ~27% a year, so a 22% APR simple-interest personal loan is a bigger improvement than the
          two-point sticker gap suggests.
        </li>
        <li>
          <strong>Judging "paying off debt vs investing":</strong> debt payoff earns you the debt's <em>APY</em>,
          guaranteed. Compare that — not the APR — against the expected return of investments before deciding where
          extra cash goes.
        </li>
      </ol>

      <h2 style={sectionTitleStyle}>Run your numbers</h2>
      <p>
        See compounding frequency change real outcomes with the{' '}
        <a href="/compound-interest-calculator">Compound Interest Calculator</a> (it lets you switch daily, monthly,
        and annual compounding on the same deposit), compare deposit products with the{' '}
        <a href="/us-savings-cd-calculator">US Savings &amp; CD Calculator</a>, and see what daily compounding does to
        a carried balance with the <a href="/us-credit-card-payoff-calculator">Credit Card Payoff Calculator</a>. This
        is general education, not personalized financial advice.
      </p>
    </GuidePageLayout>
  );
}
