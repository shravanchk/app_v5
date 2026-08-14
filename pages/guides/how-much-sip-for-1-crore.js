import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const tableStyle = { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '0.95rem' };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#eff6ff', border: '1px solid #dbe2eb', color: '#0f2a43' };
const tdStyle = { padding: '8px 10px', border: '1px solid #dbe2eb' };

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How Much SIP Do You Need to Reach ₹1 Crore?',
    description:
      'The monthly SIP required to reach ₹1 crore at 10, 15, 20, 25 and 30 years, why time matters more than the amount, and what ₹1 crore will actually be worth when you get there.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-08-14',
    dateModified: '2026-08-14',
    mainEntityOfPage: 'https://upaman.com/guides/how-much-sip-for-1-crore'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much SIP is needed for 1 crore in 20 years?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'About ₹10,100 a month, assuming a 12% annual return. Over 20 years you would invest roughly ₹24.3 lakh of your own money; the remaining ₹75.7 lakh comes from compounding.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much SIP is needed for 1 crore in 10 years?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'About ₹43,500 a month at a 12% annual return — more than four times the 20-year figure, because half the target has to come from your own contributions rather than growth.'
        }
      },
      {
        '@type': 'Question',
        name: 'Will ₹1 crore be enough in 20 years?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'At 6% inflation, ₹1 crore in 20 years buys roughly what ₹31 lakh buys today. It is a meaningful sum but not a retirement on its own — set the target in today\'s money and inflate it, rather than anchoring on the round number.'
        }
      }
    ]
  }
];

export default function SipForOneCroreGuide() {
  return (
    <GuidePageLayout
      title="How Much SIP Do You Need to Reach ₹1 Crore?"
      description="The exact monthly SIP required to reach ₹1 crore over 10 to 30 years, why starting earlier beats investing more, and an honest look at what ₹1 crore will be worth when you get there."
      canonicalPath="/guides/how-much-sip-for-1-crore"
      reviewedOn="August 14, 2026"
      reviewer="Personal Finance Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        ₹1 crore is the number almost every Indian investor picks first. The monthly SIP it takes to get there depends
        far more on <strong>how long you give it</strong> than on how much you can spare — and the gap between those two
        levers is much larger than most people expect.
      </p>

      <h2 style={sectionTitleStyle}>The answer, at 12% a year</h2>
      <p>
        Assuming a 12% annual return compounded monthly, here is the SIP required to reach ₹1 crore, and how much of that
        crore is your own money versus growth:
      </p>

      <table style={tableStyle}>
        <tbody>
          <tr>
            <th style={thStyle}>Time</th>
            <th style={thStyle}>Monthly SIP</th>
            <th style={thStyle}>You invest</th>
            <th style={thStyle}>Growth provides</th>
          </tr>
          <tr><td style={tdStyle}>10 years</td><td style={tdStyle}><strong>₹43,471</strong></td><td style={tdStyle}>₹52.2 lakh</td><td style={tdStyle}>₹47.8 lakh (48%)</td></tr>
          <tr><td style={tdStyle}>15 years</td><td style={tdStyle}><strong>₹20,017</strong></td><td style={tdStyle}>₹36.0 lakh</td><td style={tdStyle}>₹64.0 lakh (64%)</td></tr>
          <tr><td style={tdStyle}>20 years</td><td style={tdStyle}><strong>₹10,109</strong></td><td style={tdStyle}>₹24.3 lakh</td><td style={tdStyle}>₹75.7 lakh (76%)</td></tr>
          <tr><td style={tdStyle}>25 years</td><td style={tdStyle}><strong>₹5,322</strong></td><td style={tdStyle}>₹16.0 lakh</td><td style={tdStyle}>₹84.0 lakh (84%)</td></tr>
          <tr><td style={tdStyle}>30 years</td><td style={tdStyle}><strong>₹2,861</strong></td><td style={tdStyle}>₹10.3 lakh</td><td style={tdStyle}>₹89.7 lakh (90%)</td></tr>
        </tbody>
      </table>

      <p>
        <a href="/sip-calculator?tab=goal&goalTarget=10000000&goalYears=20&goalReturn=12">
          Open the 20-year case in the SIP calculator
        </a>{' '}
        and change the horizon to watch the required amount move.
      </p>

      <h2 style={sectionTitleStyle}>Ten extra years is worth more than quadrupling the SIP</h2>
      <p>
        Read the first and third rows together. Going from 10 years to 20 years cuts the required monthly amount from
        ₹43,471 to ₹10,109 — you need <strong>77% less per month</strong> for the same ₹1 crore. You also end up putting
        in less than half as much of your own money in total: ₹24.3 lakh instead of ₹52.2 lakh.
      </p>
      <p>
        The reason is visible in the last column. Over 10 years compounding supplies less than half the target, so most
        of the crore has to come out of your salary. Over 30 years it supplies 90%, and your job is mainly to keep
        feeding it. <strong>Time does the work that money otherwise has to do</strong> — which is why the single most
        expensive investing decision is waiting to start.
      </p>

      <h2 style={sectionTitleStyle}>What if returns aren&rsquo;t 12%?</h2>
      <p>
        12% is the conventional planning assumption for Indian equity, roughly matching long-run Nifty returns. It is
        not a promise. Over a 20-year horizon:
      </p>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>Annual return</th><th style={thStyle}>Monthly SIP for ₹1 crore in 20 years</th></tr>
          <tr><td style={tdStyle}>8%</td><td style={tdStyle}>₹16,977</td></tr>
          <tr><td style={tdStyle}>10%</td><td style={tdStyle}>₹13,169</td></tr>
          <tr><td style={tdStyle}>12%</td><td style={tdStyle}>₹10,109</td></tr>
          <tr><td style={tdStyle}>14%</td><td style={tdStyle}>₹7,685</td></tr>
        </tbody>
      </table>
      <p>
        A four-point miss on returns raises the required SIP by two-thirds. Plan at 10–12%, and treat anything above that
        as a bonus rather than an assumption you have built a retirement on.
      </p>

      <h2 style={sectionTitleStyle}>The uncomfortable part: what ₹1 crore will buy</h2>
      <p>
        ₹1 crore is a fixed nominal number, and twenty years of inflation will not leave it alone. At 6% inflation,
        ₹1 crore in 2046 has roughly the purchasing power of <strong>₹31 lakh today</strong>. At 7% it is closer to
        ₹26 lakh.
      </p>
      <p>
        That does not make the goal pointless — it makes the round number a poor target. The better method is to decide
        what you need <em>in today&rsquo;s money</em>, then inflate it. If you want the equivalent of ₹1 crore of
        today&rsquo;s purchasing power in 20 years, you are actually aiming at roughly ₹3.2 crore, which at 12% needs
        about <strong>₹32,000 a month</strong>, not ₹10,109. Check the erosion for your own horizon in the{' '}
        <a href="/inflation-calculator">inflation calculator</a>.
      </p>

      <h2 style={sectionTitleStyle}>Step-up SIP: the realistic version</h2>
      <p>
        A flat ₹10,109 for twenty years assumes your income never rises, which is rarely true. Raising the SIP by 10% a
        year — roughly in line with salary growth — gets to ₹1 crore substantially faster, or lets you start much
        smaller. Someone who begins at ₹5,000 and steps up 10% annually reaches ₹1 crore in about the same time as
        someone paying a flat ₹10,000 throughout, without ever feeling the squeeze at the start.
      </p>
      <p>
        Model it in the <a href="/sip-calculator?tab=sip&sipMonthly=5000&sipStepUp=10&sipYears=20">step-up SIP
        calculator</a>, or read the <a href="/guides/sip-step-up-planning">step-up SIP guide</a> for how to set the
        annual increase.
      </p>

      <h2 style={sectionTitleStyle}>Practical notes before you start</h2>
      <ul>
        <li>
          <strong>Equity needs the full horizon.</strong> These numbers assume you stay invested through every drawdown.
          A SIP stopped during a crash converts a paper loss into a real one, and that is where most of the shortfall in
          real-world portfolios comes from.
        </li>
        <li>
          <strong>Gains are taxed on exit.</strong> Long-term capital gains on equity are 12.5% above ₹1.25 lakh a year,
          so ₹1 crore of corpus is not ₹1 crore in hand. Redeeming in tranches across financial years uses the annual
          exemption more than once.
        </li>
        <li>
          <strong>Don&rsquo;t skip the emergency fund.</strong> Three to six months of expenses in something liquid is
          what stops you from redeeming the SIP at the worst possible moment. Size it with the{' '}
          <a href="/emergency-fund-readiness-workflow">emergency fund workflow</a>.
        </li>
        <li>
          <strong>One fund is usually enough to start.</strong> A broad index fund does the job. Owning six overlapping
          funds is diversification in name only, and it makes rebalancing harder later.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>Run your numbers</h2>
      <p>
        Work out your own required SIP in the{' '}
        <a href="/sip-calculator?tab=goal&goalTarget=10000000&goalYears=20&goalReturn=12">SIP Calculator</a>, compare a
        lump sum against a staged entry with the{' '}
        <a href="/guides/sip-vs-lumpsum">SIP vs lumpsum guide</a>, and check what your target is worth in today&rsquo;s
        money with the <a href="/inflation-calculator">Inflation Calculator</a>. This is general education, not
        personalized investment advice.
      </p>
    </GuidePageLayout>
  );
}
