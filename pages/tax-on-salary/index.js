import Head from 'next/head';
import HomeButton from '../../components/HomeButton';
const { calculateIndianIncomeTax } = require('../../utils/taxCalculations');

const NEW_STD = 75000;
const MIN_LAKH = 5;
const MAX_LAKH = 50;
const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n));

const wrap = { maxWidth: '860px', margin: '0 auto', padding: '24px 20px 64px', fontFamily: "'Source Sans 3','Segoe UI',sans-serif", color: '#1f2937', lineHeight: 1.7 };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', margin: '18px 0' };
const cardLink = { display: 'block', padding: '12px 14px', borderRadius: '10px', border: '1px solid #dbe2eb', textDecoration: 'none', color: '#0f2a43', background: '#fff' };

export async function getStaticProps() {
  const rows = [];
  for (let l = MIN_LAKH; l <= MAX_LAKH; l += 1) {
    const taxable = Math.max(0, l * 100000 - NEW_STD);
    const tax = Math.round(calculateIndianIncomeTax(taxable, 'new').totalTax);
    rows.push({ lakh: l, tax });
  }
  return { props: { rows } };
}

export default function TaxOnSalaryIndex({ rows }) {
  const canonical = 'https://upaman.com/tax-on-salary';
  return (
    <main>
      <Head>
        <title>Tax on Salary FY 2026-27 — Income Tax by Salary (₹5L–₹50L) | Upaman</title>
        <meta name="description" content="New-regime income tax for every salary from ₹5 lakh to ₹50 lakh in FY 2026-27. Pick your salary for a full slab breakdown, rebate, cess, and monthly take-home." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Tax on Salary FY 2026-27 by Income | Upaman" />
        <meta property="og:description" content="Income tax for every salary from ₹5 lakh to ₹50 lakh, new regime FY 2026-27." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
      </Head>
      <HomeButton />

      <div style={wrap}>
        <h1 style={{ color: '#2563eb' }}>Income Tax on Salary — FY 2026-27</h1>
        <p>
          Select your salary to see the exact new-regime income tax for FY 2026-27, with a full slab-by-slab breakdown, the
          Section 87A rebate, marginal relief, 4% cess, and your monthly take-home. All figures use the ₹75,000 standard
          deduction. For a custom calculation with your own deductions, use the{' '}
          <a href="/income-tax-calculator">Income Tax Calculator</a>.
        </p>

        <div style={grid}>
          {rows.map((r) => (
            <a key={r.lakh} style={cardLink} href={`/tax-on-salary/${r.lakh}-lakh`}>
              <div style={{ fontWeight: 700 }}>₹{r.lakh} lakh salary</div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>Tax: {inr(r.tax)}</div>
            </a>
          ))}
        </div>

        <p style={{ fontSize: '0.9rem' }}>
          Related guides:{' '}
          <a href="/guides/tax-on-12-lakh-salary-fy-2026-27">why ₹12 lakh is tax-free</a>,{' '}
          <a href="/guides/old-vs-new-regime-breakeven-fy-2026-27">old vs new breakeven</a>,{' '}
          <a href="/guides/standard-deduction-fy-2026-27">standard deduction</a>.
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Reviewed June 28, 2026. Planning estimates, not tax advice.</p>
      </div>
    </main>
  );
}
