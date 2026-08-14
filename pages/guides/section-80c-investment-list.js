import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const tableStyle = { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '0.95rem' };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#eff6ff', border: '1px solid #dbe2eb', color: '#0f2a43' };
const tdStyle = { padding: '8px 10px', border: '1px solid #dbe2eb' };

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Section 80C: The Full Investment List for FY 2026-27',
    description:
      'Every investment and expense that qualifies for the ₹1.5 lakh Section 80C deduction in FY 2026-27, with lock-in periods, returns, and the reason 80C only matters under the old regime.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-08-14',
    dateModified: '2026-08-14',
    mainEntityOfPage: 'https://upaman.com/guides/section-80c-investment-list'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the Section 80C limit for FY 2026-27?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'The Section 80C deduction is capped at ₹1,50,000 per financial year. This is a combined ceiling across every qualifying investment and expense, not a separate limit for each one.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I claim Section 80C under the new tax regime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No. Section 80C is only available under the old regime. If you are on the new regime — the default from FY 2023-24 onwards — an 80C investment gives you no tax deduction at all, though the investment itself may still be worth making on its own merits.'
        }
      },
      {
        '@type': 'Question',
        name: 'Which 80C option has the shortest lock-in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'ELSS mutual funds, at three years. Every other 80C route locks money up for at least five years, and PPF for fifteen.'
        }
      }
    ]
  }
];

export default function Section80CGuide() {
  return (
    <GuidePageLayout
      title="Section 80C: The Full Investment List for FY 2026-27"
      description="Every investment and expense that counts toward the ₹1.5 lakh Section 80C deduction in FY 2026-27 — with lock-in periods, expected returns, and the one question to settle before you invest a rupee."
      canonicalPath="/guides/section-80c-investment-list"
      reviewedOn="August 14, 2026"
      reviewer="India Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        Section 80C lets you deduct up to <strong>₹1,50,000</strong> a year from your taxable income by putting money into
        certain investments or spending it on certain things. It is the most used tax break in India and the most
        misunderstood, because two facts about it are usually left out: the limit is a{' '}
        <strong>single shared ceiling</strong>, not ₹1.5 lakh per option, and it only exists in the{' '}
        <strong>old regime</strong>.
      </p>

      <h2 style={sectionTitleStyle}>Settle this before you invest anything</h2>
      <p>
        If you are on the new regime, Section 80C does nothing for you. Not a reduced benefit — nothing. The new regime
        has been the default since FY 2023-24, so unless you actively opted out, this is probably you.
      </p>
      <p>
        That does not automatically make the old regime better. The new regime charges lower rates in exchange for
        removing deductions, and for most salaried people the lower rates win. The question is arithmetic, not
        preference: work out your tax both ways with the{' '}
        <a href="/income-tax-calculator?salary=1600000&regime=old&s80c=150000">income tax calculator</a>, or read the{' '}
        <a href="/guides/old-vs-new-regime-breakeven-fy-2026-27">old vs new regime breakeven guide</a> for the deduction
        total you would need to make the old regime pay.
      </p>
      <p>
        The rough shape of the answer: on a ₹16 lakh salary you need roughly <strong>₹6.19 lakh of deductions</strong> before
        the old regime beats the new one. A full ₹1.5 lakh of 80C is less than a quarter of the way there. 80C alone is
        almost never enough to justify the old regime — it has to arrive alongside a large HRA exemption or a home-loan
        interest claim.
      </p>

      <h2 style={sectionTitleStyle}>The full list of what qualifies</h2>
      <p>
        Everything below shares the same ₹1.5 lakh ceiling. Fill it with one option or ten — the deduction stops at
        ₹1.5 lakh either way.
      </p>

      <table style={tableStyle}>
        <tbody>
          <tr>
            <th style={thStyle}>Option</th>
            <th style={thStyle}>Lock-in</th>
            <th style={thStyle}>Return (FY 2026-27)</th>
            <th style={thStyle}>Taxed on exit?</th>
          </tr>
          <tr><td style={tdStyle}>ELSS mutual funds</td><td style={tdStyle}>3 years</td><td style={tdStyle}>Market-linked</td><td style={tdStyle}>LTCG at 12.5% above ₹1.25 lakh</td></tr>
          <tr><td style={tdStyle}>PPF (Public Provident Fund)</td><td style={tdStyle}>15 years</td><td style={tdStyle}>7.1%</td><td style={tdStyle}>Fully exempt</td></tr>
          <tr><td style={tdStyle}>EPF (your own contribution)</td><td style={tdStyle}>Until you leave service</td><td style={tdStyle}>8.25%</td><td style={tdStyle}>Exempt after 5 years</td></tr>
          <tr><td style={tdStyle}>Sukanya Samriddhi (daughter under 10)</td><td style={tdStyle}>21 years</td><td style={tdStyle}>8.2%</td><td style={tdStyle}>Fully exempt</td></tr>
          <tr><td style={tdStyle}>NSC (National Savings Certificate)</td><td style={tdStyle}>5 years</td><td style={tdStyle}>7.7%</td><td style={tdStyle}>Interest taxable</td></tr>
          <tr><td style={tdStyle}>5-year tax-saving bank FD</td><td style={tdStyle}>5 years</td><td style={tdStyle}>~6.5–7.5%</td><td style={tdStyle}>Interest fully taxable</td></tr>
          <tr><td style={tdStyle}>Senior Citizens Savings Scheme</td><td style={tdStyle}>5 years</td><td style={tdStyle}>8.2%</td><td style={tdStyle}>Interest taxable</td></tr>
          <tr><td style={tdStyle}>Life insurance premium</td><td style={tdStyle}>Policy term</td><td style={tdStyle}>Varies widely</td><td style={tdStyle}>Usually exempt under 10(10D)</td></tr>
          <tr><td style={tdStyle}>ULIP premium</td><td style={tdStyle}>5 years</td><td style={tdStyle}>Market-linked</td><td style={tdStyle}>Taxable if premium &gt; ₹2.5 lakh/yr</td></tr>
          <tr><td style={tdStyle}>NPS Tier I (within 80C)</td><td style={tdStyle}>Until 60</td><td style={tdStyle}>Market-linked</td><td style={tdStyle}>60% exempt, 40% annuitised</td></tr>
        </tbody>
      </table>

      <p>
        Three things count toward 80C that are not investments at all, and people routinely forget them:
      </p>
      <ul>
        <li>
          <strong>Home loan principal repayment</strong> — the principal portion of your EMI, not the interest (interest
          goes under Section 24(b), a separate ₹2 lakh limit). On a large home loan this alone can consume most of your
          ₹1.5 lakh without you investing a rupee. Check your amortisation split in the{' '}
          <a href="/loan-calculator">EMI calculator</a> before buying anything else for 80C.
        </li>
        <li>
          <strong>Children&rsquo;s tuition fees</strong> — full-time education at an Indian school, college, or
          university, for up to two children. Tuition only: no donations, development fees, or transport.
        </li>
        <li>
          <strong>Stamp duty and registration</strong> on a house purchase, claimable in the year you paid it. A one-off,
          but often a large one.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>What ₹1.5 lakh of 80C is actually worth</h2>
      <p>
        The deduction saves you tax at your marginal rate — the rate on your highest slab, not your average rate. That
        makes the same ₹1.5 lakh worth very different amounts to different people:
      </p>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>Your marginal rate (old regime)</th><th style={thStyle}>Tax saved by a full ₹1.5 lakh</th></tr>
          <tr><td style={tdStyle}>5%</td><td style={tdStyle}>₹7,800 (including 4% cess)</td></tr>
          <tr><td style={tdStyle}>20%</td><td style={tdStyle}>₹31,200</td></tr>
          <tr><td style={tdStyle}>30%</td><td style={tdStyle}>₹46,800</td></tr>
        </tbody>
      </table>
      <p>
        Note what this means at the bottom of the table. If your marginal rate is 5%, locking ₹1.5 lakh away for five
        years to save ₹7,800 is a poor trade — you would almost certainly do better on the new regime with the money
        free. <strong>80C rewards high earners and penalises low ones</strong>, which is the opposite of how it is usually
        marketed.
      </p>

      <h2 style={sectionTitleStyle}>Where the ₹1.5 lakh should go</h2>
      <p>
        Assuming you have established the old regime is right for you, fill the limit in this order:
      </p>
      <ol>
        <li>
          <strong>Count what you are already paying.</strong> EPF deductions, home-loan principal, tuition fees, and
          insurance premiums are already in the bucket. Many people discover the limit is half full before they invest
          anything, then over-invest and get no deduction for the excess.
        </li>
        <li>
          <strong>Fill the rest with ELSS if your horizon is long.</strong> Three-year lock-in — the shortest available —
          and equity returns. The trade is volatility: a three-year window can end badly, and you cannot exit early.
        </li>
        <li>
          <strong>Use PPF if you want certainty.</strong> 7.1%, tax-free on the way out, sovereign-backed. The cost is a
          fifteen-year lock-in, which is a long time to be certain about anything. Model it in the{' '}
          <a href="/ppf-calculator?annualContribution=150000&tenureYears=15">PPF calculator</a>.
        </li>
        <li>
          <strong>Treat tax-saving FDs as a last resort.</strong> Five-year lock-in and the interest is fully taxable at
          your slab — so a 7% FD returns under 5% after tax at the 30% rate. It is the weakest option on the list and
          the most heavily sold.
        </li>
      </ol>

      <h2 style={sectionTitleStyle}>Beyond the ₹1.5 lakh</h2>
      <p>
        Two deductions sit outside the 80C ceiling and are worth knowing because they extend your total:
      </p>
      <ul>
        <li><strong>Section 80CCD(1B)</strong> — an extra ₹50,000 for NPS Tier I, on top of 80C.</li>
        <li><strong>Section 80D</strong> — health insurance premiums, ₹25,000 for yourself and family, plus ₹50,000 more for senior-citizen parents.</li>
      </ul>
      <p>
        Stack all three and a taxpayer with senior parents can reach ₹2.75 lakh of deductions before HRA or home-loan
        interest enter the picture. That is the point at which the old regime starts to become genuinely competitive.
      </p>

      <h2 style={sectionTitleStyle}>The mistake to avoid</h2>
      <p>
        Every March, people buy insurance policies they do not need because a deadline is approaching and the tax saving
        feels urgent. A bad thirty-year product bought to save ₹46,800 once is not a good trade. The deduction is a
        discount on an investment you should want anyway — if you would not buy it without the tax break, the tax break
        is not a reason to buy it.
      </p>

      <h2 style={sectionTitleStyle}>Run your numbers</h2>
      <p>
        Compare both regimes with your own salary and deduction figures in the{' '}
        <a href="/income-tax-calculator?salary=1600000&regime=old&s80c=150000&s80d=25000&nps=50000">Income Tax Calculator</a>,
        project a PPF balance in the <a href="/ppf-calculator">PPF Calculator</a>, or check what your home-loan principal
        is contributing with the <a href="/loan-calculator">EMI Calculator</a>. This is general education, not
        personalized financial advice.
      </p>
    </GuidePageLayout>
  );
}
