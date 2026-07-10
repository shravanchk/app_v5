import Head from 'next/head';
import Container from '../../components/ui/Container';
const { calculateIndianIncomeTax } = require('../../utils/taxCalculations');

const NEW_STD = 75000;
const OLD_STD = 50000;
const MIN_LAKH = 5;
const MAX_LAKH = 50;

const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n));
const slugFor = (lakh) => `${lakh}-lakh`;

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

  // ---- level-specific analysis from the same engine ----
  const taxPlusLakh = Math.round(calculateIndianIncomeTax(Math.max(0, salary + 100000 - NEW_STD), 'new').totalTax);
  const keepPerLakh = 100000 - (taxPlusLakh - newTax);
  const taxedSlabs = breakdown.filter((b) => b.tax > 0);
  const marginalSlabRate = taxedSlabs.length ? taxedSlabs[taxedSlabs.length - 1].rate : 0;
  // deductions (beyond the old regime's standard deduction) needed for old to match new
  let breakEvenDeductions = null;
  if (newTax > 0) {
    let lo = 0;
    let hi = salary;
    while (hi - lo > 500) {
      const mid = (lo + hi) / 2;
      const t = calculateIndianIncomeTax(Math.max(0, salary - OLD_STD - mid), 'old').totalTax;
      if (t <= newTax) hi = mid;
      else lo = mid;
    }
    breakEvenDeductions = hi < salary - 500 ? Math.round(hi / 1000) * 1000 : null;
  }

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
      analysis: { keepPerLakh, marginalSlabRate, breakEvenDeductions },
      prevLakh: lakh > MIN_LAKH ? lakh - 1 : null,
      nextLakh: lakh < MAX_LAKH ? lakh + 1 : null
    }
  };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';

export default function TaxOnSalaryPage(props) {
  const { lakh, salary, newTaxable, newTax, newSlabTax, newRebate, newRelief, newCess, oldTaxNoInvest, breakdown, analysis, prevLakh, nextLakh } = props;
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
  const faqItems = [
    {
      q: `How much tax on ₹${lakh} lakh salary in FY 2026-27?`,
      a: `Under the new regime, a ₹${lakh} lakh salary has ${inr(newTax)} income tax for FY 2026-27 after the ₹75,000 standard deduction (taxable income ${inr(newTaxable)}). Monthly take-home is about ${inr(monthlyTakeHome)}.`
    },
    {
      q: `Is a ₹${lakh} lakh salary tax-free under the new regime?`,
      a: newTax === 0
        ? `Yes. After the ₹75,000 standard deduction and the Section 87A rebate, the tax on a ₹${lakh} lakh salary is nil under the new regime for FY 2026-27.`
        : `No. The Section 87A rebate makes salaries up to ₹12 lakh taxable income effectively tax-free, but a ₹${lakh} lakh salary is above that, so ${inr(newTax)} of tax applies for FY 2026-27${newRebate > 0 ? ` even after a partial rebate of ${inr(newRebate)}` : ''}.`
    },
    {
      q: `Is the old or new regime better for a ₹${lakh} lakh salary?`,
      a: `With no deductions beyond the standard deduction, the old regime tax on a ₹${lakh} lakh salary is about ${inr(oldTaxNoInvest)} versus ${inr(newTax)} under the new regime. The old regime only wins once your 80C, 80D, HRA and home-loan deductions are large enough to close that gap.`
    },
    {
      q: `How much of a raise do I keep at ₹${lakh} lakh?`,
      a: newRelief > 0
        ? `Less than usual — ₹${lakh} lakh sits in the marginal-relief zone just above the rebate threshold, where each extra rupee of income can add nearly a rupee of tax until the relief phases out. A ₹1 lakh raise from here keeps about ${inr(analysis.keepPerLakh)}. Once income clears the relief zone, normal slab arithmetic resumes.`
        : `A ₹1 lakh raise from ₹${lakh} lakh keeps about ${inr(analysis.keepPerLakh)} under the new regime — the new income lands in the ${analysis.marginalSlabRate}% slab (plus cess)${newTax === 0 ? ', though at this level the Section 87A rebate still wipes the total tax to nil' : ''}. Only the new income is taxed at that slab rate; crossing a slab never re-taxes what you already earn.`
    },
    {
      q: `How much in deductions would make the old regime win at ₹${lakh} lakh?`,
      a: newTax === 0
        ? `None can — the new regime is already nil at ₹${lakh} lakh after the rebate, and no amount of 80C or HRA paperwork beats zero. The old regime only becomes interesting at higher salaries with very large deductions.`
        : analysis.breakEvenDeductions
          ? `Roughly ${inr(analysis.breakEvenDeductions)} of deductions beyond the old regime's ₹50,000 standard deduction — the point where old-regime tax falls to the new regime's ${inr(newTax)}. That typically takes a full 80C plus substantial HRA exemption or home-loan interest; run your actual numbers in the regime comparison tool before deciding.`
          : `A very large amount — at this level the gap is wide enough that realistic deductions rarely close it. Run your actual numbers in the regime comparison tool if you have unusually large HRA or home-loan interest.`
    }
  ];
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };

  return (
    <>
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

      <section className="py-8 sm:py-12">
        <Container>
          <article className="mx-auto max-w-[820px] text-[1.02rem] leading-relaxed text-ink-soft dark:text-slate-300 [&_p]:mt-4 [&_a]:font-medium [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-700 dark:[&_a]:text-brand-300 [&_strong]:font-semibold [&_strong]:text-ink dark:[&_strong]:text-white">
            <p className="text-sm text-ink-muted dark:text-slate-500">
              <a href="/">Home</a> &rsaquo; <a href="/tax-on-salary">Tax on salary</a> &rsaquo; ₹{lakh} lakh
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              Tax on ₹{lakh} Lakh Salary in FY 2026-27 (New Regime)
            </h1>

            <div className="mt-5 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-5 dark:border-brand-800/60 dark:from-brand-900/30 dark:to-emerald-900/20">
              <div className="text-sm text-ink-muted dark:text-slate-400">Income tax (new regime, FY 2026-27)</div>
              <div className="mt-1 font-display text-3xl font-bold text-ink dark:text-white">{inr(newTax)}</div>
              <div className="mt-1.5 text-sm text-ink-soft dark:text-slate-300">
                Monthly take-home ≈ <strong>{inr(monthlyTakeHome)}</strong> &nbsp;•&nbsp; Effective rate {effRate.toFixed(2)}%
              </div>
            </div>

            <p>
              On a gross salary of <strong>{inr(salary)}</strong>, the new regime applies a ₹75,000 standard deduction, leaving a
              taxable income of <strong>{inr(newTaxable)}</strong>. The income tax for FY 2026-27 (AY 2027-28) works out to{' '}
              <strong>{inr(newTax)}</strong> including 4% cess.
            </p>

            <h2 className="mt-9 font-display text-xl font-bold tracking-tight text-ink dark:text-white">Slab-by-slab breakdown (new regime)</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-[0.95rem]">
                <tbody>
                  <tr><th className={thCls}>Income slab</th><th className={thCls}>Rate</th><th className={thCls}>Tax</th></tr>
                  {breakdown.filter((b) => b.tax > 0).map((b, i) => (
                    <tr key={i}>
                      <td className={tdCls}>{inr(b.from)} – {b.to ? inr(b.to) : 'above'}</td>
                      <td className={tdCls}>{b.rate}%</td>
                      <td className={tdCls}>{inr(b.tax)}</td>
                    </tr>
                  ))}
                  <tr><td className={tdCls}>Slab tax</td><td className={tdCls}></td><td className={tdCls}>{inr(newSlabTax)}</td></tr>
                  {newRebate > 0 && <tr><td className={tdCls}>Less: Section 87A rebate</td><td className={tdCls}></td><td className={tdCls}>− {inr(newRebate)}</td></tr>}
                  {newRelief > 0 && <tr><td className={tdCls}>Less: marginal relief</td><td className={tdCls}></td><td className={tdCls}>− {inr(newRelief)}</td></tr>}
                  <tr><td className={tdCls}>Health &amp; education cess (4%)</td><td className={tdCls}></td><td className={tdCls}>{inr(newCess)}</td></tr>
                  <tr><td className={`${tdCls} font-bold text-ink dark:text-white`}>Total tax</td><td className={tdCls}></td><td className={`${tdCls} font-bold text-ink dark:text-white`}>{inr(newTax)}</td></tr>
                </tbody>
              </table>
            </div>

            <h2 className="mt-9 font-display text-xl font-bold tracking-tight text-ink dark:text-white">What happens to the next rupee at ₹{lakh} lakh</h2>
            {newRelief > 0 ? (
              <p>
                ₹{lakh} lakh sits in the most unusual stretch of the new-regime schedule: the{' '}
                <strong>marginal-relief zone</strong> just above the rebate threshold. Marginal relief caps the tax at
                the amount by which income exceeds the threshold — that is the {inr(newRelief)} credit in the table —
                but it also means each additional rupee of salary adds nearly a rupee of tax until the relief phases
                out. A ₹1 lakh raise from here keeps only about <strong>{inr(analysis.keepPerLakh)}</strong>. If you can
                steer income into deductions (employer NPS, for instance) at this level, the effective return is
                exceptional; once you clear the zone, normal slab arithmetic resumes.
              </p>
            ) : newTax === 0 ? (
              <p>
                At ₹{lakh} lakh, the Section 87A rebate cancels the slab tax entirely — the effective rate is zero, and
                that remains true for every salary up to the rebate threshold. A ₹1 lakh raise from here keeps about{' '}
                <strong>{inr(analysis.keepPerLakh)}</strong>. The number worth internalizing before the next appraisal:
                tax-free today does not mean tax-free after the raise, and salaries just past the threshold enter a
                marginal-relief zone where raises are taxed unusually heavily for a stretch.
              </p>
            ) : (
              <p>
                The top slice of a ₹{lakh} lakh salary falls in the <strong>{analysis.marginalSlabRate}% slab</strong>,
                so a ₹1 lakh raise keeps about <strong>{inr(analysis.keepPerLakh)}</strong> after slab tax and cess.
                Marginal is not average: the {effRate.toFixed(2)}% effective rate blends this top slice with the
                tax-free and lower slabs beneath it, which is why the two numbers look so different. Crossing into a
                higher slab never re-taxes income below it — only the new rupees pay the new rate.
              </p>
            )}

            <h2 className="mt-9 font-display text-xl font-bold tracking-tight text-ink dark:text-white">New vs old regime</h2>
            <p>
              Under the old regime, with only the ₹50,000 standard deduction and no other deductions claimed, the tax on a ₹{lakh}{' '}
              lakh salary would be about <strong>{inr(oldTaxNoInvest)}</strong>. The old regime only becomes cheaper if you claim
              substantial deductions (80C, 80D, HRA, home-loan interest) — see the{' '}
              <a href="/guides/old-vs-new-regime-breakeven-fy-2026-27">breakeven guide</a> for how much you would need.
            </p>

            <div className="mt-5 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-5 dark:border-brand-800/60 dark:from-brand-900/30 dark:to-emerald-900/20">
              <strong>Check your exact number:</strong> use the{' '}
              <a href="/income-tax-calculator">Income Tax Calculator</a> with your real deductions, or the{' '}
              <a href="/salary-calculator">Salary Calculator</a> for monthly take-home. Related:{' '}
              <a href="/guides/standard-deduction-fy-2026-27">standard deduction</a> and{' '}
              <a href="/guides/marginal-relief-new-regime-fy-2026-27">marginal relief</a>.
            </div>

            <h2 className="mt-9 font-display text-xl font-bold tracking-tight text-ink dark:text-white">Frequently asked questions</h2>
            <div className="mt-4 grid gap-3">
              {faqItems.map(({ q, a }) => (
                <details key={q} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                  <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{q}</summary>
                  <p className="text-[0.95rem] leading-relaxed text-ink-muted dark:text-slate-400">{a}</p>
                </details>
              ))}
            </div>

            <p className="mt-6 flex justify-between text-[0.95rem]">
              {prevLakh ? <a href={`/tax-on-salary/${slugFor(prevLakh)}`}>← Tax on ₹{prevLakh} lakh</a> : <span />}
              {nextLakh ? <a href={`/tax-on-salary/${slugFor(nextLakh)}`}>Tax on ₹{nextLakh} lakh →</a> : <span />}
            </p>

            <p className="mt-6 text-sm text-ink-muted dark:text-slate-500">
              Reviewed June 28, 2026. Planning estimate for salaried individuals under the new regime; excludes surcharge and
              special income. Not tax advice. Verify on the{' '}
              <a href="https://www.incometax.gov.in/" target="_blank" rel="noopener noreferrer">Income Tax Department portal</a>.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}