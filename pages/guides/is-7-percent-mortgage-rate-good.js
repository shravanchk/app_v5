import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const tableStyle = { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '0.95rem' };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#eff6ff', border: '1px solid #dbe2eb', color: '#0f2a43' };
const tdStyle = { padding: '8px 10px', border: '1px solid #dbe2eb' };

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Is a 7% Mortgage Rate Good in 2026?',
    description:
      'What a 7% mortgage rate costs against historical averages, what it does to your monthly payment and lifetime interest, and when waiting for a lower rate is worth it.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-08-14',
    dateModified: '2026-08-14',
    mainEntityOfPage: 'https://upaman.com/guides/is-7-percent-mortgage-rate-good'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is 7% a good mortgage rate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Against the 50-year average of roughly 7.7%, a 7% rate is slightly below normal. Against the 2020-21 lows near 3%, it feels punishing. Whether it is good for you depends on the payment it produces, not on how it compares to rates you cannot get.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does 1% on a mortgage rate cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'On a $400,000 30-year loan, moving from 6% to 7% raises the monthly payment from about $2,398 to $2,661 — roughly $263 a month, or about $95,000 in extra interest over the full term.'
        }
      },
      {
        '@type': 'Question',
        name: 'Should I wait for mortgage rates to fall?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Waiting only pays if prices stay flat while rates fall. Falling rates usually bring buyers back and push prices up, so the payment you were waiting to improve can end up unchanged. You can refinance a rate later; you cannot renegotiate the purchase price.'
        }
      }
    ]
  }
];

export default function SevenPercentMortgageGuide() {
  return (
    <GuidePageLayout
      title="Is a 7% Mortgage Rate Good in 2026?"
      description="How a 7% mortgage rate compares to five decades of history, exactly what each percentage point costs per month and over the full term, and the honest case for and against waiting."
      canonicalPath="/guides/is-7-percent-mortgage-rate-good"
      reviewedOn="August 14, 2026"
      reviewer="US Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        Whether 7% is a good mortgage rate depends entirely on what you compare it to. Against the pandemic-era lows near
        3% it looks brutal. Against the last fifty years of US mortgage history — where the average 30-year fixed rate is
        roughly <strong>7.7%</strong> — it is slightly better than normal. Neither comparison decides anything, because
        you cannot buy a house at a historical average.
      </p>

      <h2 style={sectionTitleStyle}>What 7% actually costs</h2>
      <p>
        The useful way to hold mortgage rates in your head is <strong>monthly cost per $100,000 borrowed</strong>, on a
        30-year fixed:
      </p>

      <table style={tableStyle}>
        <tbody>
          <tr>
            <th style={thStyle}>Rate</th>
            <th style={thStyle}>Per $100k borrowed</th>
            <th style={thStyle}>On a $400k loan</th>
            <th style={thStyle}>Lifetime interest</th>
          </tr>
          <tr><td style={tdStyle}>3%</td><td style={tdStyle}>$422</td><td style={tdStyle}>$1,686</td><td style={tdStyle}>$207,110</td></tr>
          <tr><td style={tdStyle}>5%</td><td style={tdStyle}>$537</td><td style={tdStyle}>$2,147</td><td style={tdStyle}>$373,023</td></tr>
          <tr><td style={tdStyle}>6%</td><td style={tdStyle}>$600</td><td style={tdStyle}>$2,398</td><td style={tdStyle}>$463,353</td></tr>
          <tr><td style={tdStyle}><strong>7%</strong></td><td style={tdStyle}><strong>$665</strong></td><td style={tdStyle}><strong>$2,661</strong></td><td style={tdStyle}><strong>$558,036</strong></td></tr>
          <tr><td style={tdStyle}>8%</td><td style={tdStyle}>$734</td><td style={tdStyle}>$2,935</td><td style={tdStyle}>$656,621</td></tr>
        </tbody>
      </table>

      <p>
        Two numbers are worth memorising. Each percentage point costs roughly <strong>$65 a month per $100,000</strong>{' '}
        borrowed. And at 7%, a $400,000 loan pays back <strong>more in interest than the house cost</strong> — $558,036
        of interest on $400,000 borrowed. That is not a scandal, it is what a 30-year term does; but it is the number
        that should make you interested in the term length and in prepayment.
      </p>
      <p>
        <a href="/us-mortgage-calculator?homePrice=500000&downPayment=100000&interestRate=7&loanTermYears=30">
          Open the $400k-at-7% case in the mortgage calculator
        </a>{' '}
        and move the rate to see your own version of this table.
      </p>

      <h2 style={sectionTitleStyle}>Where 7% sits historically</h2>
      <ul>
        <li><strong>1981:</strong> above 18% — the all-time peak.</li>
        <li><strong>1990s:</strong> mostly 7–9%.</li>
        <li><strong>2000s:</strong> mostly 5.5–6.5%.</li>
        <li><strong>2020–21:</strong> 2.7–3.5%, the lowest in the series and the product of extraordinary policy.</li>
        <li><strong>2023 onwards:</strong> back to 6–8%.</li>
      </ul>
      <p>
        The distortion is that anyone who bought or refinanced in 2020–21 anchored on a rate that had never existed
        before and may not again. <strong>7% is not an aberration; 3% was.</strong> Treating the pandemic lows as the
        baseline is the single most common reason people conclude that today&rsquo;s market is impossible.
      </p>

      <h2 style={sectionTitleStyle}>The rate is not the thing that decides affordability</h2>
      <p>
        Rates move the payment, but so do price, term, and down payment — and unlike the rate, you control those. On the
        same $500,000 house at 7%:
      </p>
      <ul>
        <li>
          <strong>20% down instead of 10%</strong> cuts about $332 a month of principal and interest — and removes PMI
          on top of that, which is a further $200-odd at typical rates.
        </li>
        <li><strong>Negotiating $20,000 off the price</strong> saves about $133 a month, permanently.</li>
        <li>
          <strong>A 15-year term</strong> raises the payment sharply but roughly halves lifetime interest — worth
          modelling before dismissing.
        </li>
      </ul>
      <p>
        And the payment is only part of the cost: property tax, insurance, PMI and HOA can add 25–35% on top of principal
        and interest. Size the whole thing against your income with the{' '}
        <a href="/guides/how-much-house-can-i-afford">28/36 rule guide</a>.
      </p>

      <h2 style={sectionTitleStyle}>Should you wait for rates to fall?</h2>
      <p>
        This is the real question behind &ldquo;is 7% good&rdquo;, and the honest answer is that waiting is a bet with
        two sides.
      </p>
      <p>
        <strong>The case for buying now:</strong> you can refinance a rate later, but you can never renegotiate the
        purchase price. Falling rates reliably bring sidelined buyers back into the market, and that competition pushes
        prices up — often enough to cancel the payment saving. A cheaper rate on a more expensive house is not a win.
        Meanwhile you are building equity instead of paying rent.
      </p>
      <p>
        <strong>The case for waiting:</strong> if 7% means stretching past the 28% housing ratio, buying anyway is how
        people end up house-poor. There is no prize for owning early if it consumes the budget that should be funding
        retirement and an emergency fund. Waiting also lets you grow the down payment, which reduces the loan regardless
        of where rates go.
      </p>
      <p>
        The deciding test is not the rate. It is whether the full monthly payment fits comfortably inside your take-home
        pay. Check that against your actual net income with the{' '}
        <a href="/us-paycheck-calculator?salary=120000">paycheck calculator</a> rather than against gross.
      </p>

      <h2 style={sectionTitleStyle}>If you buy at 7%</h2>
      <ul>
        <li>
          <strong>Shop at least three lenders.</strong> Quotes on the same day for the same borrower routinely differ by
          0.25–0.5%, which is $16–$33 a month per $100,000 for the life of the loan.
        </li>
        <li>
          <strong>Price points properly.</strong> Paying to buy the rate down is worth it only if you keep the loan past
          the breakeven — usually five to seven years. If you might move or refinance sooner, points are a loss.
        </li>
        <li>
          <strong>Keep the refinance option live.</strong> Avoid prepayment penalties, and watch for the point where a
          new rate covers its closing costs. The <a href="/us-refinance-calculator">refinance calculator</a> gives the
          breakeven month.
        </li>
        <li>
          <strong>One extra payment a year</strong> on a 30-year loan at 7% removes roughly six years and a six-figure
          sum of interest. It is the highest-certainty return available to most households.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>Run your numbers</h2>
      <p>
        Model the full payment including tax, insurance and PMI in the{' '}
        <a href="/us-mortgage-calculator?homePrice=500000&downPayment=100000&interestRate=7&loanTermYears=30">US Mortgage Calculator</a>,
        test a refinance breakeven in the <a href="/us-refinance-calculator">Refinance Calculator</a>, and check the
        payment against your take-home in the <a href="/us-paycheck-calculator">Paycheck Calculator</a>. This is general
        education, not personalized financial advice.
      </p>
    </GuidePageLayout>
  );
}
