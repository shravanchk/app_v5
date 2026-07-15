import GuidePageLayout, { sectionTitleStyle } from '../../components/guides/GuidePageLayout';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How Much House Can You Afford? The 28/36 Rule, Worked Out',
  description:
    'How lenders size your mortgage with the 28/36 rule and DTI, a full worked example on a $100,000 salary, and why your own ceiling should sit below the bank\'s.',
  author: { '@type': 'Organization', name: 'Upaman Research Team' },
  publisher: { '@type': 'Organization', name: 'Upaman' },
  datePublished: '2026-07-15',
  dateModified: '2026-07-15',
  mainEntityOfPage: 'https://upaman.com/guides/how-much-house-can-i-afford'
};

export default function HowMuchHouseGuidePage() {
  return (
    <GuidePageLayout
      title="How Much House Can You Afford? The 28/36 Rule, Worked Out"
      description="How lenders decide what you can borrow — the 28/36 rule, DTI, and PITI — with a worked example on a $100,000 salary and the reasons to set your own ceiling lower."
      canonicalPath="/guides/how-much-house-can-i-afford"
      reviewedOn="July 15, 2026"
      articleSchema={articleSchema}
    >
      <p>
        There are two answers to this question: what a lender will approve, and what you can carry without the house
        owning you. Lenders answer with the <strong>28/36 rule</strong>: housing costs up to <strong>28% of gross
        monthly income</strong>, and all debt payments combined up to <strong>36%</strong>. Your own answer should
        usually sit below both numbers — this guide works through why, with real arithmetic.
      </p>

      <h2 style={sectionTitleStyle}>The number lenders actually check: DTI</h2>
      <p>
        Debt-to-income ratio (DTI) is your monthly debt obligations divided by gross (pre-tax) monthly income. It
        comes in two flavors:
      </p>
      <ul>
        <li>
          <strong>Front-end DTI (the 28):</strong> just the housing payment — and that means the full{' '}
          <strong>PITI</strong>: principal, interest, property taxes, and homeowners insurance, plus HOA dues and PMI
          if they apply. Not just the loan payment.
        </li>
        <li>
          <strong>Back-end DTI (the 36):</strong> PITI plus every other required payment — car loans, student loans,
          credit-card minimums, personal loans. Utilities, groceries, and subscriptions don't count here, which is
          exactly why the lender's ceiling can exceed your real-life comfort.
        </li>
      </ul>
      <p>
        In practice many loans close above 36% — conventional underwriting can stretch toward the mid-40s with strong
        credit and reserves. Treat that flexibility as the lender protecting their downside, not endorsing your
        budget.
      </p>

      <h2 style={sectionTitleStyle}>Worked example: $100,000 salary</h2>
      <p>Gross monthly income: <strong>$8,333</strong>. Suppose you carry a $400 car payment and $150 in student-loan minimums.</p>
      <ol>
        <li><strong>Front-end cap:</strong> 28% × $8,333 = <strong>$2,333</strong> for total housing (PITI).</li>
        <li><strong>Back-end cap:</strong> 36% × $8,333 = $3,000 for all debts; minus the $550 of existing payments leaves <strong>$2,450</strong> for housing. The binding limit is the smaller one: <strong>$2,333</strong>.</li>
        <li><strong>Strip out taxes and insurance:</strong> assume roughly $550/month for property tax and insurance (this varies enormously by state — Texas and New Jersey property taxes can double it). That leaves about <strong>$1,780 for principal and interest</strong>.</li>
        <li><strong>Convert to a loan amount:</strong> at an illustrative 6.5% rate on a 30-year fixed, every $100,000 borrowed costs about $632/month, so $1,780 supports roughly a <strong>$280,000 loan</strong>.</li>
        <li><strong>Add your down payment:</strong> with $70,000 down (20%), that's about a <strong>$350,000 house</strong> with no PMI. With 10% down instead, the price ceiling drops toward $310,000 <em>and</em> PMI eats part of the budget until you reach 20% equity.</li>
      </ol>
      <p>
        Two things to notice. First, <strong>existing debt directly shrinks the house</strong>: every $100 of monthly
        payments removes roughly $16,000 of loan at these rates — paying off a $400 car payment "buys" about $63,000
        of house. Second, <strong>rates dominate</strong>: a one-point rate move shifts what the same payment buys by
        roughly 10%, dwarfing most price negotiations.
      </p>

      <h2 style={sectionTitleStyle}>Why your ceiling should be lower than the bank's</h2>
      <ul>
        <li>
          <strong>The 28% is on gross, but you live on net.</strong> A $2,333 housing payment is 28% of gross on a
          $100,000 salary — but closer to <strong>38% of take-home</strong> after taxes and a 401(k) contribution. Run
          your actual paycheck before anchoring on the lender's number.
        </li>
        <li>
          <strong>Ownership costs don't stop at PITI.</strong> Budget roughly 1–2% of the home's value per year for
          maintenance and repairs, plus utilities that typically run higher than a rental's.
        </li>
        <li>
          <strong>Cash at closing goes beyond the down payment.</strong> Closing costs run about 2–5% of the loan, and
          you still want an intact emergency fund on the other side of the purchase — a house is the worst possible
          reason to start homeownership with $0 in reserves.
        </li>
        <li>
          <strong>A simple personal test:</strong> if the full PITI fits inside the "needs" half of a{' '}
          <a href="/guides/50-30-20-rule">50/30/20 budget</a> alongside your other essentials, the house fits your
          life, not just your application.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>How to raise what you can afford</h2>
      <ul>
        <li><strong>Clear a monthly payment</strong> before applying — it helps DTI far more than the same cash sitting in savings.</li>
        <li><strong>Improve the rate:</strong> credit score, shopping 3+ lenders, and points all move the payment-per-$100k; even 0.25% matters over 30 years.</li>
        <li><strong>Reach 20% down</strong> to drop PMI — or if you can't, price the PMI honestly into the budget rather than ignoring it.</li>
        <li><strong>Don't stretch the term casually:</strong> a longer or interest-heavy structure raises the price you "afford" today at the cost of decades of interest.</li>
      </ul>

      <h2 style={sectionTitleStyle}>Run your numbers</h2>
      <p>
        Model the full payment — P&amp;I, taxes, insurance, PMI, and HOA — with the{' '}
        <a href="/us-mortgage-calculator">US Mortgage Calculator</a>, and get your true take-home for the net-income
        test with the <a href="/us-paycheck-calculator">US Paycheck Calculator</a>. If you already own and rates have
        moved, the <a href="/us-refinance-calculator">Refinance Calculator</a> shows whether a new rate frees up
        budget. This is general education, not personalized financial advice.
      </p>
    </GuidePageLayout>
  );
}
