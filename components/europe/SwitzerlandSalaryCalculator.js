import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { cn } from '../ui/cn';
import { useShareableFields } from '../../utils/shareableState';
import {
  CANTON_NAMES, CANTONS, AGE_BANDS, MIN_GROSS, SWISS_TAX_YEAR, SWISS_DATA_FETCHED, computeSwissSalary, rankCantons
} from '../../utils/swissSalary';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const URL = 'https://upaman.com/switzerland-salary-calculator';
const linkCls = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';
const h2Cls = 'font-display text-xl font-bold text-ink dark:text-white';

const chf = (v) => `CHF ${Math.round(v).toLocaleString('de-CH').replace(/[’']/g, ',')}`;
const pct = (v) => `${v.toFixed(1)}%`;

const CANTON_OPTIONS = [...CANTONS]
  .sort((a, b) => CANTON_NAMES[a].localeCompare(CANTON_NAMES[b]))
  .map((code) => ({ value: code, label: `${CANTON_NAMES[code]} (${code})` }));
const AGE_OPTIONS = AGE_BANDS.map((b) => ({ value: b, label: `${b} years` }));
const FREQUENCIES = [
  { id: 'annual', label: 'Annual' },
  { id: 'monthly', label: 'Monthly' }
];
const PAYMENT_OPTIONS = [
  { value: '12', label: '12 salaries a year' },
  { value: '13', label: '13 salaries (13th month)' }
];

const SHARE_DEFAULTS = { gross: '100000', frequency: 'annual', payments: '13', canton: 'ZH', age: '35-44' };

// Worked figures for the article, computed from the same data at build time.
const EXAMPLE_GROSS = 100000;
const EXAMPLE = (() => {
  const ranked = rankCantons(EXAMPLE_GROSS, '35-44');
  const zh = computeSwissSalary({ gross: EXAMPLE_GROSS, canton: 'ZH', ageBand: '35-44' });
  const young = computeSwissSalary({ gross: EXAMPLE_GROSS, canton: 'ZH', ageBand: '25-34' });
  const old = computeSwissSalary({ gross: EXAMPLE_GROSS, canton: 'ZH', ageBand: '55-65' });
  const high = rankCantons(250000, '35-44');
  return { ranked, best: ranked[0], worst: ranked[ranked.length - 1], zh, young, old, highBest: high[0], highWorst: high[high.length - 1] };
})();

const FAQ = [
  { question: 'How much tax do I pay on CHF 100,000 in Switzerland?', answer: `It depends heavily on where you live. For a single employee aged 35–44 with no church membership, total income tax on CHF 100,000 ranges from about ${chf(EXAMPLE.best.taxes.total)} in ${EXAMPLE.best.city} (${CANTON_NAMES[EXAMPLE.best.canton]}) to about ${chf(EXAMPLE.worst.taxes.total)} in ${EXAMPLE.worst.city} (${CANTON_NAMES[EXAMPLE.worst.canton]}). Social contributions of roughly ${chf(EXAMPLE.zh.social.total)} come on top and are almost the same everywhere.` },
  { question: 'Why does the canton matter so much?', answer: 'Switzerland levies income tax three times: federally, by the canton, and by the commune. The federal tax is the same everywhere. Each canton sets its own tariff, and both the canton and every commune apply their own multiplier (Steuerfuss) to it. The result is that cantonal plus communal tax on the same salary can differ by a factor of two or three between, say, Zug and Geneva.' },
  { question: 'Is health insurance deducted from my salary?', answer: 'No. Basic health insurance (KVG/LAMal) is compulsory but paid directly to your insurer, typically CHF 300–600 a month per adult depending on canton, model and deductible. It is not in this calculator\'s net figure, so subtract it when you budget. Accident insurance (NBU) is deducted through payroll and is included.' },
  { question: 'What is the BVG deduction?', answer: 'BVG (LPP in French) is the occupational pension, Switzerland\'s second pillar. Employee contributions rise with age, because the legal savings credits are 7%, 10%, 15% and 18% of the insured salary for ages 25–34, 35–44, 45–54 and 55–65, with the employer paying at least half. That is why the calculator asks for your age band. Many employers run plans more generous than the legal minimum, which deduct more and save more for you.' },
  { question: 'Does this work for foreigners taxed at source?', answer: 'Employees without a C permit are usually taxed at source (Quellensteuer/impôt à la source): the employer deducts tax monthly using a cantonal withholding table. Withholding tables aim at roughly the same annual tax as an ordinary assessment, so this calculator is a good guide. Above CHF 120,000 a year, an ordinary tax return is mandatory and settles the difference.' },
  { question: 'Is church tax included?', answer: 'No. The figures assume no membership of a recognised church. Members of the Reformed, Roman Catholic or Christian Catholic church pay an additional church tax in most cantons, usually a few percent of the cantonal and communal tax, or roughly 0.5–1.5% of salary.' }
];

const SwitzerlandSalaryCalculator = () => {
  const [gross, setGross] = useState('100000');
  const [frequency, setFrequency] = useState('annual');
  const [payments, setPayments] = useState('13');
  const [canton, setCanton] = useState('ZH');
  const [age, setAge] = useState('35-44');

  useShareableFields(
    SHARE_DEFAULTS,
    { gross: [gross, setGross], frequency: [frequency, setFrequency], payments: [payments, setPayments], canton: [canton, setCanton], age: [age, setAge] },
    { frequency: ['annual', 'monthly'], payments: ['12', '13'], canton: CANTONS, age: AGE_BANDS }
  );

  const paysPerYear = Number(payments);
  const entered = Number(gross) || 0;
  // A monthly salary is per payment, so 13 x monthly when there is a 13th.
  const annual = frequency === 'monthly' ? entered * paysPerYear : entered;

  const result = useMemo(() => computeSwissSalary({ gross: annual, canton, ageBand: age }), [annual, canton, age]);
  const ranking = useMemo(() => (annual > 0 ? rankCantons(annual, age) : []), [annual, age]);
  const position = ranking.findIndex((r) => r.canton === canton) + 1;
  const best = ranking[0];

  const summaryLines = result ? [
    `${chf(annual)} gross in ${result.city} (${CANTON_NAMES[canton]}), age ${age}`,
    `Net: ${chf(result.net)} a year, ${chf(result.net / paysPerYear)} per payment (${paysPerYear} a year)`,
    `Social contributions: ${chf(result.social.total)}; income tax: ${chf(result.taxes.total)}; effective rate ${pct(result.effectiveRate)}`,
    `Rank ${position} of 26 cantonal capitals for take-home pay at this salary`
  ] : [];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Switzerland Salary Calculator',
    url: URL,
    description: 'Swiss net salary by canton: federal, cantonal and communal tax plus AHV, ALV, accident insurance and BVG, from official ESTV figures, with all 26 cantons compared.',
    applicationCategory: 'FinanceApplication',
    priceCurrency: 'CHF',
    featureList: ['All 26 cantons', 'Federal, cantonal and communal tax', 'AHV/IV/EO, ALV, NBU and BVG by age', '12 or 13 salaries', 'Canton ranking at your salary']
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'EU Calculators', item: 'https://upaman.com/eu-calculators' },
    { name: 'Switzerland Salary Calculator', item: URL }
  ]);

  const rows = result ? [
    ['AHV/IV/EO (old-age, disability, income compensation)', result.social.ahv],
    ['ALV (unemployment insurance)', result.social.alv],
    ['NBU (non-occupational accident insurance)', result.social.nbu],
    ['BVG pension fund', result.social.bvg],
    ['Federal income tax', result.taxes.federal],
    ['Cantonal income tax', result.taxes.cantonal],
    [`Communal tax (${result.city})${result.taxes.personal ? ' incl. personal tax' : ''}`, result.taxes.communal + result.taxes.personal]
  ] : [];

  return (
    <>
      <Head>
        <title>{`Switzerland Salary Calculator ${SWISS_TAX_YEAR} | Net Pay by Canton | Upaman`}</title>
        <meta name="description" content={`Swiss gross-to-net salary calculator for all 26 cantons: federal, cantonal and communal tax, AHV, ALV, NBU and BVG by age, from official ESTV ${SWISS_TAX_YEAR} figures. Compare every canton at your salary.`} />
        <meta name="keywords" content="Switzerland salary calculator, Swiss net salary calculator, Brutto Netto Rechner Schweiz, salaire net Suisse, Swiss tax by canton, take home pay Switzerland, Zurich salary after tax" />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="Switzerland Salary Calculator by Canton | Upaman" />
        <meta property="og:description" content="Net pay in all 26 cantons from official ESTV tax figures." />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Switzerland Salary Calculator | Upaman" />
        <meta name="twitter:description" content="Swiss take-home pay by canton, with every canton ranked at your salary." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(FAQ)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Europe · Switzerland"
        title="Switzerland Salary Calculator"
        subtitle={`Net pay after federal, cantonal and communal tax and social contributions, for all 26 cantons. Based on official ESTV ${SWISS_TAX_YEAR} tax figures.`}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <Tabs tabs={FREQUENCIES} active={frequency} onChange={setFrequency} />
              <NumberField
                id="ch-gross"
                label={frequency === 'monthly' ? 'Gross salary per payment' : 'Gross annual salary'}
                prefix="CHF"
                value={gross}
                onChange={setGross}
                step={1000}
              />
              <SelectField id="ch-payments" label="Paid as" value={payments} onChange={setPayments} options={PAYMENT_OPTIONS} />
              <SelectField id="ch-canton" label="Canton (tax in its capital)" value={canton} onChange={setCanton} options={CANTON_OPTIONS} />
              <SelectField id="ch-age" label="Age (sets the BVG pension rate)" value={age} onChange={setAge} options={AGE_OPTIONS} />
              <p className="text-xs text-ink-muted dark:text-slate-500">
                Single, no children, no church tax. Health insurance is paid separately and is not deducted.
              </p>
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {result ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Net per year" value={chf(result.net)} emphasis tone="positive" />
                  <ResultStat label={`Net per payment (${paysPerYear}×)`} value={chf(result.net / paysPerYear)} />
                  <ResultStat label="Income tax" value={`${chf(result.taxes.total)} (${pct(result.taxRate)})`} />
                  <ResultStat label="All deductions" value={`${chf(result.social.total + result.taxes.total)} (${pct(result.effectiveRate)})`} />
                </div>
                {result.belowModelledRange && (
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                    Below {chf(MIN_GROSS)} the tax shown is the {chf(MIN_GROSS)} figure, so it overstates tax at this salary.
                  </p>
                )}
                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Where {chf(annual)} goes in {result.city}</h3>
                  <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-700">
                    {rows.map(([label, value]) => (
                      <li key={label} className="flex justify-between gap-3 py-1.5">
                        <span className="text-ink-soft dark:text-slate-300">{label}</span>
                        <span className="whitespace-nowrap tabular-nums text-ink dark:text-white">−{chf(value)}</span>
                      </li>
                    ))}
                    <li className="flex justify-between gap-3 py-2 font-semibold">
                      <span className="text-ink dark:text-white">Take-home pay</span>
                      <span className="whitespace-nowrap tabular-nums text-emerald-700 dark:text-emerald-300">{chf(result.net)}</span>
                    </li>
                  </ul>
                </Card>
                <ResultActions title="Swiss salary calculation" summaryLines={summaryLines} fileName="upaman-swiss-salary.txt" />
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter a gross salary to see your take-home pay.
              </Card>
            )}
          </div>
        </div>

        {ranking.length > 0 && result && (
          <section className="mt-10">
            <h2 className={h2Cls}>{chf(annual)} in all 26 cantons</h2>
            <p className="mt-2 text-sm text-ink-muted dark:text-slate-400">
              Take-home pay in each cantonal capital at this salary, best first.{' '}
              {CANTON_NAMES[canton]} ranks {position} of 26
              {position > 1 ? `, ${chf(best.net - result.net)} a year behind ${CANTON_NAMES[best.canton]}` : ', the highest take-home of any canton'}.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200/70 bg-white p-3 dark:border-slate-700/70 dark:bg-slate-800/70">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {['#', 'Canton (capital)', 'Income tax', 'Tax rate', 'Net per year', 'vs. yours'].map((h) => (
                      <th key={h} className="border-b border-slate-200 px-2 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:text-white">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r, i) => {
                    const mine = r.canton === canton;
                    const diff = r.net - result.net;
                    return (
                      <tr key={r.canton} className={cn(mine && 'bg-brand-50 font-semibold dark:bg-brand-900/30')}>
                        <td className="border-b border-slate-100 px-2 py-1.5 dark:border-slate-700/60">{i + 1}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 dark:border-slate-700/60">
                          <button type="button" onClick={() => setCanton(r.canton)} className="text-left hover:text-brand-700 dark:hover:text-brand-300">
                            {CANTON_NAMES[r.canton]} <span className="text-ink-muted dark:text-slate-500">({r.city})</span>
                          </button>
                        </td>
                        <td className="border-b border-slate-100 px-2 py-1.5 tabular-nums dark:border-slate-700/60">{chf(r.taxes.total)}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 tabular-nums dark:border-slate-700/60">{pct(r.taxRate)}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5 tabular-nums dark:border-slate-700/60">{chf(r.net)}</td>
                        <td className={cn('border-b border-slate-100 px-2 py-1.5 tabular-nums dark:border-slate-700/60', diff > 0 ? 'text-emerald-700 dark:text-emerald-300' : diff < 0 ? 'text-rose-700 dark:text-rose-300' : '')}>
                          {mine ? '—' : `${diff > 0 ? '+' : '−'}${chf(Math.abs(diff)).replace('CHF ', '')}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <HowToSection
          name="How to calculate Swiss net salary"
          description="Work out take-home pay in any canton in three steps."
          steps={[
            { name: 'Enter your gross salary', text: 'Use the annual figure from your contract, or switch to monthly and say whether you get a 13th salary.' },
            { name: 'Choose canton and age band', text: 'The canton sets cantonal and communal tax; your age band sets the BVG pension contribution.' },
            { name: 'Compare', text: 'Read the breakdown, then check the 26-canton table to see what the same salary leaves you elsewhere.' }
          ]}
        />

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className={h2Cls}>Three taxes, set in three places</h2>
            <p>
              Swiss income tax has three parts. The <strong className="text-ink dark:text-white">direct federal tax</strong>{' '}
              is the same in every canton and rises to a top rate of 11.5%. The <strong className="text-ink dark:text-white">cantonal
              tax</strong> uses each canton&rsquo;s own tariff and a cantonal multiplier. The{' '}
              <strong className="text-ink dark:text-white">communal tax</strong> applies the commune&rsquo;s own
              multiplier (<em>Steuerfuss</em>/<em>coefficient</em>) to that same base. Cantonal and communal tax are the
              big items, and because both are set locally the spread is wide. On CHF 100,000, a single 35-to-44-year-old
              pays about {chf(EXAMPLE.best.taxes.total)} in total income tax in {EXAMPLE.best.city} but about{' '}
              {chf(EXAMPLE.worst.taxes.total)} in {EXAMPLE.worst.city}. That is{' '}
              {chf(EXAMPLE.worst.taxes.total - EXAMPLE.best.taxes.total)} a year, or{' '}
              {chf((EXAMPLE.worst.taxes.total - EXAMPLE.best.taxes.total) / 12)} a month, for the same job.
            </p>
            <p>
              The gap widens with income. At CHF 250,000 the difference between {CANTON_NAMES[EXAMPLE.highBest.canton]} and{' '}
              {CANTON_NAMES[EXAMPLE.highWorst.canton]} is {chf(EXAMPLE.highBest.net - EXAMPLE.highWorst.net)} a year of take-home
              pay. Moving a few kilometres across a cantonal border can be worth more than a raise, and many
              people working in Zürich or Geneva choose where to live with this in mind.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Social contributions: almost the same everywhere</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-ink dark:text-white">AHV/IV/EO</strong> (old-age, disability and income-compensation insurance): 5.3% of all salary, with no ceiling. The employer pays another 5.3%.</li>
              <li><strong className="text-ink dark:text-white">ALV</strong> (unemployment insurance): 1.1% of salary up to the insured maximum, matched by the employer.</li>
              <li><strong className="text-ink dark:text-white">NBU</strong> (non-occupational accident insurance): set by your employer&rsquo;s insurer. The figures here use ESTV&rsquo;s standard assumption.</li>
              <li>
                <strong className="text-ink dark:text-white">BVG</strong> (pension fund, second pillar): rises with age. On CHF 100,000 in Zürich it is about{' '}
                {chf(EXAMPLE.young.social.bvg)} a year at 25–34 and {chf(EXAMPLE.old.social.bvg)} at 55–65. That money goes to
                your own retirement account, so it is saving rather than cost, but it doesn&rsquo;t reach your bank account.
                The figures assume a minimum plan; generous employer plans deduct more.
              </li>
            </ul>
            <p>
              Compulsory <strong className="text-ink dark:text-white">health insurance is not deducted from pay</strong>.
              You pay the premium yourself, typically CHF 300–600 a month per adult. When comparing a Swiss offer with one
              elsewhere in Europe, subtract it from the net figure here. Our{' '}
              <Link href="/blog/60000-across-europe-2026" className={linkCls}>€60,000 across Europe comparison</Link>{' '}
              explains why that matters, and the{' '}
              <Link href="/european-salary-calculator" className={linkCls}>European salary calculator</Link>{' '}
              puts Switzerland next to eight other systems.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>The 13th salary, and gross vs net per month</h2>
            <p>
              Many Swiss employers pay a 13th salary in November or December, so an annual salary of CHF 104,000 often
              arrives as 13 payments of CHF 8,000 rather than 12 of CHF 8,667. The annual tax is the same either way, but
              the monthly figure you budget with is not. Choose &ldquo;13 salaries&rdquo; and the calculator shows net per
              regular payment. Enter a monthly salary and it multiplies by 12 or 13 before working out tax.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Where the numbers come from, and what they leave out</h2>
            <p>
              Every figure is derived from the Swiss Federal Tax Administration&rsquo;s (ESTV/AFC) own tax calculator for the{' '}
              {SWISS_TAX_YEAR} tax year. We queried it for a single employee with no children, no church membership and no
              wealth, living in each cantonal capital, at 18 salary levels from {chf(MIN_GROSS)} to CHF 500,000 and for each
              BVG age band. The calculator interpolates between those points. Data was retrieved on {SWISS_DATA_FETCHED}.
            </p>
            <p>
              Not modelled: married couples and children (both reduce tax considerably), church tax, other communes
              within a canton (communal multipliers vary, so a suburb can be cheaper or dearer than the capital), extra
              deductions such as pillar 3a contributions (up to about CHF 7,000 a year for employees with a pension fund),
              commuting and training costs, and wealth tax. Employees taxed at source pay through withholding tables
              that aim at roughly the same annual result.
            </p>
          </section>
        </article>

        <div className="mt-10">
          <h2 className={h2Cls}>Switzerland salary FAQ</h2>
          <div className="mt-4 grid gap-3">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Method"
            inputs={['Gross salary (annual, or per payment × 12 or 13)', 'Canton', 'Age band (for BVG)']}
            formulas={[
              'Net = gross − (AHV/IV/EO + ALV + NBU + BVG) − (federal + cantonal + communal + personal tax)',
              `Each component is read from the ESTV ${SWISS_TAX_YEAR} calculator at 18 salary points per canton and age band, and interpolated linearly between them`
            ]}
            assumptions={[
              'Single, no children, no church membership, no wealth; resident in the cantonal capital',
              'Standard ESTV deductions for an employee (social contributions, BVG, professional expenses, insurance premiums)',
              'Health insurance premiums are paid privately and not deducted'
            ]}
            sources={[
              { label: 'ESTV — Swiss tax calculator', url: 'https://swisstaxcalculator.estv.admin.ch/' },
              { label: 'AHV/IV — Contributions for employees', url: 'https://www.ahv-iv.ch/en/Social-insurances/Old-age-and-survivors-insurance-OASI/Contributions' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default SwitzerlandSalaryCalculator;
