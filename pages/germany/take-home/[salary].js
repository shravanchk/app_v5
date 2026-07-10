import Head from 'next/head';
import Container from '../../../components/ui/Container';
import { SALARY_SYSTEMS, computeEuropeanSalary } from '../../../utils/europeanSalaryCalculations';
const { DE_SALARY_LEVELS } = require('../../../utils/salaryLevels');

const eur = (n) => `€${Math.round(n).toLocaleString('en-US')}`;

export async function getStaticPaths() {
  return {
    paths: DE_SALARY_LEVELS.map((s) => ({ params: { salary: String(s) } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const salary = Number(params.salary);
  const idx = DE_SALARY_LEVELS.indexOf(salary);
  const r = computeEuropeanSalary('DE', salary);

  // Split the social-insurance lump into its four components using the same
  // rates and ceilings the engine uses, so the table always sums correctly.
  const de = SALARY_SYSTEMS.DE;
  const pensionBase = Math.min(salary, de.ceilings.pensionUnemployment);
  const healthBase = Math.min(salary, de.ceilings.healthCare);

  // ---- marginal analysis from the same engine ----
  const plus = computeEuropeanSalary('DE', salary + 1000);
  const keepPer1000 = Math.round(plus.netAnnual - r.netAnnual);
  const aboveHealthCeiling = salary > de.ceilings.healthCare;
  const abovePensionCeiling = salary > de.ceilings.pensionUnemployment;
  const ladder = { prevLevel: null, nextLevel: null };
  if (idx > 0) {
    const p = DE_SALARY_LEVELS[idx - 1];
    ladder.prevLevel = { salary: p, netGain: Math.round(r.netAnnual - computeEuropeanSalary('DE', p).netAnnual), grossGain: salary - p };
  }
  if (idx < DE_SALARY_LEVELS.length - 1) {
    const n = DE_SALARY_LEVELS[idx + 1];
    ladder.nextLevel = { salary: n, netGain: Math.round(computeEuropeanSalary('DE', n).netAnnual - r.netAnnual), grossGain: n - salary };
  }

  return {
    props: {
      salary,
      net: Math.round(r.netAnnual),
      monthly: Math.round(r.netMonthly),
      incomeTax: Math.round(r.breakdown.incomeTax),
      soli: Math.round(r.breakdown.solidarityTax),
      pension: Math.round(pensionBase * (de.socialSecurity.pension / 100)),
      unemployment: Math.round(pensionBase * (de.socialSecurity.unemployment / 100)),
      health: Math.round(healthBase * (de.socialSecurity.health / 100)),
      care: Math.round(healthBase * (de.socialSecurity.care / 100)),
      social: Math.round(r.breakdown.socialSecurity),
      effectiveRate: Number(r.effectiveRate.toFixed(1)),
      hourly: Number((salary / 2080).toFixed(2)),
      analysis: {
        keepPer1000,
        aboveHealthCeiling,
        abovePensionCeiling,
        healthCeiling: de.ceilings.healthCare,
        pensionCeiling: de.ceilings.pensionUnemployment,
        ladder
      },
      prev: idx > 0 ? DE_SALARY_LEVELS[idx - 1] : null,
      next: idx < DE_SALARY_LEVELS.length - 1 ? DE_SALARY_LEVELS[idx + 1] : null
    }
  };
}

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

export default function GermanyTakeHomePage({ salary, net, monthly, incomeTax, soli, pension, unemployment, health, care, social, effectiveRate, hourly, analysis, prev, next }) {
  const canonical = `https://upaman.com/germany/take-home/${salary}`;
  const title = `${eur(salary)} After Tax Germany 2026 | Net Salary (Brutto/Netto) | Upaman`;
  const desc = `How much is ${eur(salary)} after tax in Germany? In 2026 a single employee nets ${eur(net)} a year (${eur(monthly)} a month) after ${eur(incomeTax)} income tax and ${eur(social)} social insurance. Full brutto-to-netto breakdown.`;

  const rows = [
    { label: 'Gross salary (Brutto)', annual: salary },
    { label: 'Income tax (Lohnsteuer)', annual: -incomeTax },
    { label: 'Solidarity surcharge', annual: soli > 0 ? -soli : 0 },
    { label: 'Pension insurance (9.3%)', annual: -pension },
    { label: 'Unemployment insurance (1.3%)', annual: -unemployment },
    { label: 'Health insurance (8.75%)', annual: -health },
    { label: 'Care insurance (2.4%)', annual: -care },
    { label: 'Net salary (Netto)', annual: net, strong: true }
  ];

  const faqItems = [
    {
      q: `How much is ${eur(salary)} after tax in Germany?`,
      a: `In 2026, a single employee (tax class I, childless, statutory insurance, no church tax) earning ${eur(salary)} gross takes home about ${eur(net)} per year — ${eur(monthly)} per month. Deductions are ${eur(incomeTax)} income tax${soli > 0 ? `, ${eur(soli)} solidarity surcharge,` : ' and'} ${eur(social)} social insurance (pension, unemployment, health, and care), an overall deduction rate of ${effectiveRate}%.`
    },
    {
      q: `What is ${eur(salary)} brutto in netto per month?`,
      a: `${eur(salary)} brutto per year is about ${eur(monthly)} netto per month in 2026 for a single employee in tax class I with statutory health insurance and no church tax.`
    },
    {
      q: `What is ${eur(salary)} per hour in Germany?`,
      a: `${eur(salary)} a year is €${hourly.toFixed(2)} per hour before tax, based on a 40-hour week (2,080 working hours per year).`
    },
    {
      q: `How much of a raise do I keep at ${eur(salary)} in Germany?`,
      a: `About ${eur(analysis.keepPer1000)} of each additional €1,000 at this level. ${analysis.ladder.nextLevel ? `Moving from ${eur(salary)} to ${eur(analysis.ladder.nextLevel.salary)} would add roughly ${eur(analysis.ladder.nextLevel.netGain)} of annual netto out of the ${eur(analysis.ladder.nextLevel.grossGain)} gross increase.` : ''} The §32a tariff is a continuous formula, so the marginal rate creeps up smoothly with income — there is no cliff where a raise suddenly costs you money.`
    },
    {
      q: `Do the solidarity surcharge and contribution ceilings apply at ${eur(salary)}?`,
      a: `${soli > 0 ? `Yes on the surcharge: this level pays ${eur(soli)} of solidarity surcharge, since it sits above the exemption zone that spares most earners.` : `No solidarity surcharge — at this level the exemption zone covers it entirely, as it does for the large majority of employees.`} ${analysis.abovePensionCeiling ? `Both social-insurance ceilings are passed (health/care at ${eur(analysis.healthCeiling)}, pension/unemployment at ${eur(analysis.pensionCeiling)}), so contributions are capped at their maximums.` : analysis.aboveHealthCeiling ? `The health/care ceiling (${eur(analysis.healthCeiling)}) is passed, so those contributions are capped; pension and unemployment continue until ${eur(analysis.pensionCeiling)}.` : `Salary is below both contribution ceilings, so all four social-insurance contributions apply to the full gross.`}`
    }
  ];
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upaman.com/' },
      { '@type': 'ListItem', position: 2, name: 'Germany Take-Home Pay', item: 'https://upaman.com/germany/take-home' },
      { '@type': 'ListItem', position: 3, name: `${eur(salary)} after tax`, item: canonical }
    ]
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
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <section className="py-8 sm:py-12">
        <Container>
          <article className="mx-auto max-w-[820px] text-[1.02rem] leading-relaxed text-ink-soft dark:text-slate-300">
            <p className="text-sm text-ink-muted dark:text-slate-500">
              <a href="/" className={linkCls}>Home</a> &rsaquo; <a href="/germany/take-home" className={linkCls}>Germany take-home pay</a> &rsaquo; {eur(salary)}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
              {eur(salary)} After Tax in Germany (2026)
            </h1>

            <div className="mt-5 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-5 dark:border-brand-800/60 dark:from-brand-900/30 dark:to-emerald-900/20">
              <div className="text-sm text-ink-muted dark:text-slate-400">{eur(salary)} gross, single employee, tax class I (2026)</div>
              <div className="mt-1 font-display text-3xl font-bold text-ink dark:text-white">{eur(net)} / year netto</div>
              <div className="mt-1.5 text-sm text-ink-soft dark:text-slate-300">
                ≈ <strong>{eur(monthly)}</strong>/month · effective deduction rate {effectiveRate}%
              </div>
            </div>

            <p className="mt-4">
              A {eur(salary)} salary works out to <strong>€{hourly.toFixed(2)}/hour</strong> before tax (40-hour
              week). For a single employee in tax class I with statutory insurance, 2026 deductions are{' '}
              <strong>{eur(incomeTax)}</strong> income tax{soli > 0 && <>, <strong>{eur(soli)}</strong> solidarity surcharge,</>}{' '}
              and <strong>{eur(social)}</strong> social insurance, leaving <strong>{eur(net)}</strong> netto.
              Income tax uses the official 2026 tariff (§32a EStG) on taxable income after deductible insurance
              contributions and the employee allowance.
            </p>

            {salary > 69750 && (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-[0.95rem] dark:border-amber-800/50 dark:bg-amber-900/20">
                <strong className="text-ink dark:text-white">Contribution ceilings:</strong> health and care
                contributions stop at €69,750 of income{salary > 101400 ? ', and pension and unemployment contributions stop at €101,400' : ''} —
                above the ceilings, extra salary is only subject to income tax, so your marginal keep-rate improves.
              </p>
            )}

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-[0.95rem]">
                <tbody>
                  <tr>
                    <th className={thCls}>Item</th>
                    <th className={thCls}>Annual</th>
                    <th className={thCls}>Monthly</th>
                  </tr>
                  {rows.map((r) => (
                    <tr key={r.label}>
                      <td className={`${tdCls} ${r.strong ? 'font-semibold text-ink dark:text-white' : ''}`}>{r.label}</td>
                      <td className={`${tdCls} ${r.strong ? 'font-semibold text-emerald-700 dark:text-emerald-400' : r.annual < 0 ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                        {r.annual < 0 ? `−${eur(-r.annual)}` : eur(r.annual)}
                      </td>
                      <td className={`${tdCls} ${r.strong ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}`}>
                        {r.annual < 0 ? `−${eur(-r.annual / 12)}` : eur(r.annual / 12)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              These figures assume no church tax (Kirchensteuer adds 8–9% of your income tax in most states) and
              the childless care-insurance rate; employees with children pay 0.6 percentage points less. Married
              couples with unequal incomes usually do better in tax classes III/V. The{' '}
              <a href="/germany-salary-calculator" className={linkCls}>Germany Salary Calculator</a> lets you try
              your own gross amount.
            </p>

            <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">What happens to the next euro at {eur(salary)}</h2>
            <p className="mt-3">
              German income tax has no bracket table — the §32a tariff is a continuous formula, so the marginal rate
              rises smoothly with income instead of jumping at thresholds. At {eur(salary)}, a €1,000 raise keeps about{' '}
              <strong>{eur(analysis.keepPer1000)}</strong> after income tax
              {soli > 0 ? ', solidarity surcharge,' : ''} and social insurance.
              {analysis.abovePensionCeiling
                ? ` Both contribution ceilings are behind you at this level — health and care stopped at ${eur(analysis.healthCeiling)}, pension and unemployment at ${eur(analysis.pensionCeiling)} — so raises here face income tax${soli > 0 ? ' and soli' : ''} only, and keep more than they did on the way up.`
                : analysis.aboveHealthCeiling
                  ? ` Health and care contributions stopped at the ${eur(analysis.healthCeiling)} ceiling, but pension and unemployment still apply until ${eur(analysis.pensionCeiling)} — a middle zone where each raise keeps a little more than the last.`
                  : ` All four social-insurance contributions still apply at this level, which is why the marginal keep-rate is lower than at salaries past the contribution ceilings.`}
            </p>
            {analysis.ladder.prevLevel || analysis.ladder.nextLevel ? (
              <p className="mt-3">
                {analysis.ladder.prevLevel
                  ? `Stepping up from ${eur(analysis.ladder.prevLevel.salary)} to ${eur(salary)} added ${eur(analysis.ladder.prevLevel.netGain)} of annual netto out of a ${eur(analysis.ladder.prevLevel.grossGain)} gross increase. `
                  : ''}
                {analysis.ladder.nextLevel
                  ? `The next step, to ${eur(analysis.ladder.nextLevel.salary)}, would keep about ${eur(analysis.ladder.nextLevel.netGain)} of the ${eur(analysis.ladder.nextLevel.grossGain)} raise. `
                  : ''}
                Because the tariff is progressive per slice, a raise never lowers the netto on income you already earn —
                the &ldquo;higher bracket&rdquo; fear has no mechanism here.
              </p>
            ) : null}

            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
              <strong className="text-ink dark:text-white">Keep exploring:</strong> browse{' '}
              <a href="/germany/take-home" className={linkCls}>other German salary levels</a>, compare with{' '}
              <a href="/uk/take-home" className={linkCls}>UK take-home pay</a> or{' '}
              <a href="/european-salary-calculator" className={linkCls}>seven other European countries</a>, or see
              all <a href="/eu-calculators" className={linkCls}>UK &amp; Europe calculators</a>.
            </div>

            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-ink dark:text-white">Frequently asked questions</h2>
              <div className="mt-4 grid gap-3">
                {faqItems.map(({ q, a }) => (
                  <details key={q} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                    <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{q}</summary>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted dark:text-slate-400">{a}</p>
                  </details>
                ))}
              </div>
            </div>

            <p className="mt-6 flex justify-between text-[0.95rem]">
              {prev ? <a href={`/germany/take-home/${prev}`} className={linkCls}>← {eur(prev)} after tax</a> : <span />}
              {next ? <a href={`/germany/take-home/${next}`} className={linkCls}>{eur(next)} after tax →</a> : <span />}
            </p>

            <p className="mt-6 text-sm text-ink-muted dark:text-slate-500">
              Planning estimates for 2026 using the official §32a EStG tariff, 2026 contribution rates and
              assessment ceilings, the average 2.9% health-insurance additional contribution, and the solidarity
              surcharge exemption. Assumes a single employee, tax class I, childless, statutory insurance, no
              church tax. Actual payroll varies by health fund, state, and personal situation. Not tax advice.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
