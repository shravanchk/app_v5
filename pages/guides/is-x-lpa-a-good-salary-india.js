import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const tableStyle = { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '0.95rem' };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#eff6ff', border: '1px solid #dbe2eb', color: '#0f2a43' };
const tdStyle = { padding: '8px 10px', border: '1px solid #dbe2eb' };

const articleSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Is ₹10, ₹15 or ₹25 LPA a Good Salary in India?',
    description:
      'What each CTC band actually pays per month after PF, professional tax and FY 2026-27 income tax, what it affords in metro versus non-metro cities, and how to judge an offer properly.',
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-08-14',
    dateModified: '2026-08-14',
    mainEntityOfPage: 'https://upaman.com/guides/is-x-lpa-a-good-salary-india'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is 15 LPA a good salary in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'A ₹15 LPA CTC pays roughly ₹1,05,900 a month in hand under the FY 2026-27 new regime. That is comfortably above the national median and supports a good standard of living in any Indian city, though in Mumbai or Bengaluru rent will take a large share of it.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much in-hand salary comes from a 20 LPA CTC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'About ₹1,33,300 a month, or roughly 80% of CTC, after employee PF, professional tax and income tax under the new regime. The share retained falls as CTC rises because more income is taxed at higher slabs.'
        }
      },
      {
        '@type': 'Question',
        name: 'Why is my in-hand salary so much lower than my CTC?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'CTC includes items you never receive as monthly cash — the employer PF contribution and the gratuity provision — and then employee PF, professional tax and income tax come out of what remains. Expect to keep 71–87% of CTC depending on the band.'
        }
      }
    ]
  }
];

export default function IsXLpaGoodSalaryGuide() {
  return (
    <GuidePageLayout
      title="Is ₹10, ₹15 or ₹25 LPA a Good Salary in India?"
      description="What each CTC band really pays per month after PF, professional tax and FY 2026-27 income tax — plus what it buys in metro versus non-metro cities, and the questions that matter more than the headline number."
      canonicalPath="/guides/is-x-lpa-a-good-salary-india"
      reviewedOn="August 14, 2026"
      reviewer="India Tax Review Desk"
      articleSchema={articleSchema}
    >
      <p>
        &ldquo;Is ₹15 LPA a good salary?&rdquo; cannot be answered by the number alone, because the number is a{' '}
        <strong>CTC</strong> — and CTC is not what reaches your account. The useful version of the question is: what does
        this pay monthly, and what does that buy where I live?
      </p>

      <h2 style={sectionTitleStyle}>What each band actually pays</h2>
      <p>
        Under the FY 2026-27 <strong>new regime</strong>, assuming a standard structure (45% basic, HRA, 12% employee PF,
        gratuity, metro professional tax):
      </p>

      <table style={tableStyle}>
        <tbody>
          <tr>
            <th style={thStyle}>CTC</th>
            <th style={thStyle}>In-hand per month</th>
            <th style={thStyle}>Income tax for the year</th>
            <th style={thStyle}>% of CTC retained</th>
          </tr>
          <tr><td style={tdStyle}>₹8 LPA</td><td style={tdStyle}>₹57,824</td><td style={tdStyle}>₹0</td><td style={tdStyle}>86.7%</td></tr>
          <tr><td style={tdStyle}>₹10 LPA</td><td style={tdStyle}>₹72,330</td><td style={tdStyle}>₹0</td><td style={tdStyle}>86.8%</td></tr>
          <tr><td style={tdStyle}>₹12 LPA</td><td style={tdStyle}>₹86,836</td><td style={tdStyle}>₹0</td><td style={tdStyle}>86.8%</td></tr>
          <tr><td style={tdStyle}>₹15 LPA</td><td style={tdStyle}><strong>₹1,05,948</strong></td><td style={tdStyle}>₹31,754</td><td style={tdStyle}>84.8%</td></tr>
          <tr><td style={tdStyle}>₹20 LPA</td><td style={tdStyle}>₹1,33,320</td><td style={tdStyle}>₹1,38,468</td><td style={tdStyle}>80.0%</td></tr>
          <tr><td style={tdStyle}>₹25 LPA</td><td style={tdStyle}>₹1,61,605</td><td style={tdStyle}>₹2,34,231</td><td style={tdStyle}>77.6%</td></tr>
          <tr><td style={tdStyle}>₹30 LPA</td><td style={tdStyle}>₹1,87,851</td><td style={tdStyle}>₹3,54,452</td><td style={tdStyle}>75.1%</td></tr>
          <tr><td style={tdStyle}>₹40 LPA</td><td style={tdStyle}>₹2,37,751</td><td style={tdStyle}>₹6,26,003</td><td style={tdStyle}>71.3%</td></tr>
        </tbody>
      </table>

      <p>
        <a href="/salary-calculator?ctc=1500000&city=metro">Open the ₹15 LPA case in the salary calculator</a> to change
        the structure and see your own split.
      </p>

      <p>
        The pattern in the last column matters more than any single row. Up to about ₹12 LPA you keep roughly{' '}
        <strong>87%</strong> of CTC, because the Section 87A rebate wipes out the income tax entirely. Past that the
        retained share falls steadily — by ₹40 LPA you keep just over <strong>71%</strong>. A jump from ₹20 LPA to
        ₹25 LPA adds ₹5 lakh of CTC but only about ₹3.4 lakh of take-home.
      </p>

      <h2 style={sectionTitleStyle}>Where the gap between CTC and cash goes</h2>
      <ul>
        <li>
          <strong>Employer PF and gratuity</strong> — counted in CTC but never paid to you monthly. Real money, and yours
          eventually, but not spendable now.
        </li>
        <li><strong>Your own PF</strong> — 12% of basic, deducted before you see it. Savings rather than a loss.</li>
        <li><strong>Professional tax</strong> — a flat state levy, typically ₹2,400 a year in metros.</li>
        <li><strong>Income tax</strong> — nil up to ₹12 lakh taxable under the new regime, then rising with the slabs.</li>
      </ul>
      <p>
        The <a href="/guides/ctc-to-in-hand-salary">CTC to in-hand guide</a> walks the full chain line by line.
      </p>

      <h2 style={sectionTitleStyle}>Is it a good salary? It depends on the city</h2>
      <p>
        Take the ₹15 LPA case — ₹1,05,948 a month. A common benchmark is that rent should stay near 30% of take-home:
      </p>
      <table style={tableStyle}>
        <tbody>
          <tr><th style={thStyle}>City</th><th style={thStyle}>Typical 2BHK rent</th><th style={thStyle}>Share of ₹1.06 lakh take-home</th></tr>
          <tr><td style={tdStyle}>Mumbai</td><td style={tdStyle}>₹55,000–₹80,000</td><td style={tdStyle}>52–75% — the constraint</td></tr>
          <tr><td style={tdStyle}>Bengaluru / Delhi NCR</td><td style={tdStyle}>₹35,000–₹55,000</td><td style={tdStyle}>33–52% — tight but workable</td></tr>
          <tr><td style={tdStyle}>Hyderabad / Pune / Chennai</td><td style={tdStyle}>₹25,000–₹40,000</td><td style={tdStyle}>24–38% — comfortable</td></tr>
          <tr><td style={tdStyle}>Tier-2 cities</td><td style={tdStyle}>₹12,000–₹22,000</td><td style={tdStyle}>11–21% — very comfortable</td></tr>
        </tbody>
      </table>
      <p>
        The same ₹15 LPA is a stretch in Mumbai and generous in Indore. This is why comparing offers across cities on CTC
        alone is close to meaningless — and why a 30% raise to move to a more expensive city can leave you worse off.
        The <a href="/job-offer-workflow">job offer workflow</a> compares two offers on what is left after rent and tax.
      </p>

      <h2 style={sectionTitleStyle}>Context: where these bands sit nationally</h2>
      <p>
        India&rsquo;s median salary is far below the numbers in this guide — most salaried workers earn under ₹5 LPA, and
        only a small minority of the workforce files a return declaring income above ₹10 lakh. By national standards
        every band in the table is a high income.
      </p>
      <p>
        That is rarely the comparison people are actually making. Within the metro tech, finance and consulting market a
        rough shape is: ₹6–12 LPA entry level, ₹15–25 LPA at three to six years, ₹30–50 LPA at senior level. Judging your
        ₹15 LPA against a Bengaluru product-engineering peer group is a completely different exercise from judging it
        against the country — and it is worth being clear with yourself about which one you mean.
      </p>

      <h2 style={sectionTitleStyle}>Better questions than &ldquo;is it good?&rdquo;</h2>
      <ol>
        <li>
          <strong>What is the fixed component?</strong> A ₹20 LPA CTC with ₹5 lakh of variable pay is a ₹15 LPA salary
          with a bonus attached. Ask what percentage of the variable actually paid out over the last two years.
        </li>
        <li>
          <strong>Is ESOP counted in the CTC?</strong> Illiquid equity in a private company is not salary. If it is in
          the CTC number, mentally remove it and re-evaluate.
        </li>
        <li>
          <strong>What is the rent-adjusted figure?</strong> Take-home minus rent is the number that determines how you
          actually live. Compare offers on that.
        </li>
        <li>
          <strong>What does it save?</strong> At ₹15 LPA in a tier-2 city you might save ₹40,000 a month; the same CTC in
          Mumbai might save ₹10,000. Over five years that difference is larger than most raises.
        </li>
        <li>
          <strong>What does it lead to?</strong> A lower offer with a steeper trajectory beats a higher one that plateaus.
          Three years of compounding raises usually outweighs the starting gap.
        </li>
      </ol>

      <h2 style={sectionTitleStyle}>Run your numbers</h2>
      <p>
        Convert any CTC into a monthly figure with the{' '}
        <a href="/salary-calculator?ctc=1500000&city=metro">Salary Calculator</a>, check the tax under both regimes in the{' '}
        <a href="/income-tax-calculator?salary=1500000&regime=new">Income Tax Calculator</a>, and compare two offers
        properly with the <a href="/job-offer-workflow">Job Offer Workflow</a>. Rent ranges above are indicative market
        estimates, not survey data. This is general education, not personalized financial advice.
      </p>
    </GuidePageLayout>
  );
}
