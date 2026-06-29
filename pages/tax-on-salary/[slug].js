import Head from 'next/head';
import HomeButton from '../../components/HomeButton';
const { calculateIndianIncomeTax } = require('../../utils/taxCalculations');

const NEW_STD = 75000;
const OLD_STD = 50000;
const MIN_LAKH = 5;
const MAX_LAKH = 50;

const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n));
const slugFor = (lakh) => `${lakh}-lakh`;

const wrap = { maxWidth: '820px', margin: '0 auto', padding: '24px 20px 64px', fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', lineHeight: 1.7 };
const tableStyle = { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '0.95rem' };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#eff6ff', border: '1px solid #dbe2eb', color: '#0f2a43' };
const tdStyle = { padding: '8px 10px', border: '1px solid #dbe2eb' };
const heroBox = { padding: '18px', borderRadius: '12px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '1px solid #dbe2eb', margin: '12px 0' };

export async function getStaticPaths() {
  const paths = [];
  for (let l = MIN_LAKH; l <= MAX_LAKH; l += 1) paths.push({ params: { slug: slugFor(l) } });
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const lakh = parseInt(String(params.slug).replace(/[^0-9]/g, ''), 10);
  const salary = lakh * 100000;

  const newTaxable = Math.max(0, salary - NEW_STD);
  const newRes = calculateIndianIncomeTax(newTaxable, 'new');
  const oldTaxable = Math.max(0, salary - OLD_STD);
  const oldRes = calculateIndianIncomeTax(oldTaxable, 'old');

  const newTax = Math.round(newRes.totalTax);
  const oldTaxNoInvest = Math.round(oldRes.totalTax);

  const breakdown = newRes.breakdown.map((b) => ({
    from: b.min,
    to: b.max === null || b.max === Infinity || !isFinite(b.max) ? null : b.max,
    rate: b.rate,
    tax: Math.round(b.tax)
  }));

  return {
    props: {
      lakh,
      salary,
      newTaxable,
      newTax,
      newSlabTax: Math.round(newRes.slabTax),
      newRebate: Math.round(newRes.rebate),
      newRelief: Math.round(newRes.marginalRelief),
      newCess: Math.round(newRes.cess),
      oldTaxNoInvest,
      breakdown,
      prevLakh: lakh > MIN_LAKH ? lakh - 1 : null,
      nextLakh: lakh < MAX_LAKH ? lakh + 1 : null
    }
  };
}

export default function TaxOnSalaryPage(props) {
  const { lakh, salary, newTaxable, newTax, newSlabTax, newRebate, newRelief, newCess, oldTaxNoInvest, breakdown, prevLakh, nextLakh } = props;
  const monthlyTakeHome = (salary - newTax) / 12;
  const effRate = salary > 0 ? (newTax / salary) * 100 : 0;
  const canonical = `https://upaman.com/tax-on-salary/${slugFor(lakh)}`;
  const title = `Tax on ₹${lakh} Lakh Salary FY 2026-27 (New Regime) | Upaman`;
  const desc = `How much income tax on a ₹${lakh} lakh salary in FY 2026-27? New-regime tax is ${inr(newTax)} after the ₹75,000 standard deduction, with ${inr(monthlyTakeHome)} monthly take-home. Full slab breakdown.`;

  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: `Tax on ₹${lakh} Lakh Salary FY 2026-27`,
    description: desc,
    author: { '@type': 'Organization', name: 'Upaman Research Team' },
    publisher: { '@type': 'Organization', name: 'Upaman' },
    datePublished: '2026-06-28', dateModified: '2026-06-28', mainEntityOfPage: canonical
  };
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question', name: `How much tax on ₹${lakh} lakh salary in FY 2026-27?`,
      acceptedAnswer: { '@type': 'Answer', text: `Under the new regime, a ₹${lakh} lakh salary has ${inr(newTax)} income tax for FY 2026-27 after the ₹75,000 standard deduction (taxable income ${inr(newTaxable)}). Monthly take-home is about ${inr(monthlyTakeHome)}.` }
    }]
  };

  return (
    <main>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      <HomeButton />

      <article style={wrap}>
        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          <a href="/">Home</a> &rsaquo; <a href="/tax-on-salary">Tax on salary</a> &rsaquo; ₹{lakh} lakh
        </p>
        <h1 style={{ color: '#2563eb' }}>Tax on ₹{lakh} Lakh Salary in FY 2026-27 (New Regime)</h1>

        <div style={heroBox}>
          <div style={{ fontSize: '0.85rem', color: '#475569' }}>Income tax (new regime, FY 2026-27)</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f2a43' }}>{inr(newTax)}</div>
          <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '6px' }}>
            Monthly take-home ≈ <strong>{inr(monthlyTakeHome)}</strong> &nbsp;•&nbsp; Effective rate {effRate.toFixed(2)}%
          </div>
        </div>

        <p>
          On a gross salary of <strong>{inr(salary)}</strong>, the new regime applies a ₹75,000 standard deduction, leaving a
          taxable income of <strong>{inr(newTaxable)}</strong>. The income tax for FY 2026-27 (AY 2027-28) works out to{' '}
          <strong>{inr(newTax)}</strong> including 4% cess.
        </p>

        <h2 style={{ color: '#1e40af' }}>Slab-by-slab breakdown (new regime)</h2>
        <table style={tableStyle}>
          <tbody>
            <tr><th style={thStyle}>Income slab</th><th style={thStyle}>Rate</th><th style={thStyle}>Tax</th></tr>
            {breakdown.filter((b) => b.tax > 0).map((b, i) => (
              <tr key={i}>
                <td style={tdStyle}>{inr(b.from)} – {b.to ? inr(b.to) : 'above'}</td>
                <td style={tdStyle}>{b.rate}%</td>
                <td style={tdStyle}>{inr(b.tax)}</td>
              </tr>
            ))}
            <tr><td style={tdStyle}>Slab tax</td><td style={tdStyle}></td><td style={tdStyle}>{inr(newSlabTax)}</td></tr>
            {newRebate > 0 && <tr><td style={tdStyle}>Less: Section 87A rebate</td><td style={tdStyle}></td><td style={tdStyle}>− {inr(newRebate)}</td></tr>}
            {newRelief > 0 && <tr><td style={tdStyle}>Less: marginal relief</td><td style={tdStyle}></td><td style={tdStyle}>− {inr(newRelief)}</td></tr>}
            <tr><td style={tdStyle}>Health &amp; education cess (4%)</td><td style={tdStyle}></td><td style={tdStyle}>{inr(newCess)}</td></tr>
            <tr><td style={{ ...tdStyle, fontWeight: 700 }}>Total tax</td><td style={tdStyle}></td><td style={{ ...tdStyle, fontWeight: 700 }}>{inr(newTax)}</td></tr>
          </tbody>
        </table>

        <h2 style={{ color: '#1e40af' }}>New vs old regime</h2>
        <p>
          Under the old regime, with only the ₹50,000 standard deduction and no other deductions claimed, the tax on a ₹{lakh}{' '}
          lakh salary would be about <strong>{inr(oldTaxNoInvest)}</strong>. The old regime only becomes cheaper if you claim
          substantial deductions (80C, 80D, HRA, home-loan interest) — see the{' '}
          <a href="/guides/old-vs-new-regime-breakeven-fy-2026-27">breakeven guide</a> for how much you would need.
        </p>

        <div style={heroBox}>
          <strong>Check your exact number:</strong> use the{' '}
          <a href="/income-tax-calculator">Income Tax Calculator</a> with your real deductions, or the{' '}
          <a href="/salary-calculator">Salary Calculator</a> for monthly take-home. Related:{' '}
          <a href="/guides/standard-deduction-fy-2026-27">standard deduction</a> and{' '}
          <a href="/guides/marginal-relief-new-regime-fy-2026-27">marginal relief</a>.
        </div>

        <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
          {prevLakh ? <a href={`/tax-on-salary/${slugFor(prevLakh)}`}>← Tax on ₹{prevLakh} lakh</a> : <span />}
          {nextLakh ? <a href={`/tax-on-salary/${slugFor(nextLakh)}`}>Tax on ₹{nextLakh} lakh →</a> : <span />}
        </p>

        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '24px' }}>
          Reviewed June 28, 2026. Planning estimate for salaried individuals under the new regime; excludes surcharge and
          special income. Not tax advice. Verify on the{' '}
          <a href="https://www.incometax.gov.in/" target="_blank" rel="noopener noreferrer">Income Tax Department portal</a>.
        </p>
      </article>
    </main>
  );
}
