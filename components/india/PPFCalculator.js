import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import { PieBreakdownChart } from '../calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, SelectField } from '../ui/Field';
import Card from '../ui/Card';
import { formatINR } from '../../utils/calculations';
import { useShareableState, restoreValues } from '../../utils/shareableState';
import { buildFaqSchema } from '../../utils/faqSchema';

const PPF_CONTRIBUTION_LIMIT = 150000;

const FAQ = [
  { question: 'Is PPF interest tax-free?', answer: 'Yes. PPF has EEE (exempt-exempt-exempt) status: your contribution qualifies for a Section 80C deduction, the interest accrues tax-free every year, and the maturity amount is fully tax-exempt. This makes its headline rate worth noticeably more than the same rate on a taxable deposit.' },
  { question: 'What is the current PPF interest rate?', answer: 'The rate is 7.1% per annum as of 2026. The government reviews it every quarter, so it can change; interest is calculated monthly on the lowest balance between the 5th and the last day of the month, and credited once a year at year-end.' },
  { question: 'Can I withdraw money before 15 years?', answer: 'PPF has a 15-year lock-in, but it is not fully rigid. Partial withdrawals are allowed from the 7th financial year, and loans against the balance from the 3rd to the 6th year. Full withdrawal before maturity is only permitted in limited situations such as serious illness or higher education.' },
  { question: 'What happens after the 15-year maturity?', answer: 'You can withdraw the full amount tax-free, or extend the account in blocks of 5 years — with or without fresh contributions. Extending lets the tax-free compounding continue, which is why long-held PPF accounts grow so much in their later blocks.' },
  { question: 'Does the date I deposit matter?', answer: 'Yes, more than most people realise. Interest is computed on the minimum balance between the 5th and month-end, so a deposit made on or before the 5th earns that month’s interest, while one made on the 6th effectively loses a month. For lump sums, depositing early in the financial year maximises the interest earned.' },
  { question: 'Is PPF better than a SIP in mutual funds?', answer: 'They answer different needs. PPF offers a sovereign-guaranteed, tax-free, fixed return with no market risk — ideal for the safe portion of a portfolio. Equity SIPs carry market risk but have historically delivered higher long-run returns. Many investors use both: PPF for stability and 80C, SIPs for growth.' }
];

const contributionModes = [
  { value: 'monthly', label: 'Monthly installments' },
  { value: 'yearly-start', label: 'Yearly lump sum (start of year)' },
  { value: 'yearly-end', label: 'Yearly lump sum (end of year)' },
];

const getClampedContribution = (value) => {
  const safeValue = Number(value) || 0;
  return Math.min(Math.max(safeValue, 0), PPF_CONTRIBUTION_LIMIT);
};

const calculatePPFProjection = ({ annualContribution, annualRate, tenureYears, annualStepUp, contributionMode }) => {
  const monthlyRate = (Number(annualRate) || 0) / 100 / 12;
  const years = Math.max(1, Math.floor(Number(tenureYears) || 0));
  const stepUp = Math.max(0, Number(annualStepUp) || 0) / 100;

  let runningBalance = 0;
  let currentContribution = getClampedContribution(annualContribution);
  const projection = [];

  for (let year = 1; year <= years; year += 1) {
    const openingBalance = runningBalance;
    let monthlyBalance = runningBalance;
    let yearlyContribution = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= 12; month += 1) {
      if (contributionMode === 'monthly') {
        const installment = currentContribution / 12;
        monthlyBalance += installment;
        yearlyContribution += installment;
      } else if (contributionMode === 'yearly-start' && month === 1) {
        monthlyBalance += currentContribution;
        yearlyContribution += currentContribution;
      }
      yearlyInterest += monthlyBalance * monthlyRate;
      if (contributionMode === 'yearly-end' && month === 12) {
        monthlyBalance += currentContribution;
        yearlyContribution += currentContribution;
      }
    }

    runningBalance = monthlyBalance + yearlyInterest;
    projection.push({ year, openingBalance, yearlyContribution, yearlyInterest, closingBalance: runningBalance, contributionUsed: currentContribution });
    currentContribution = getClampedContribution(currentContribution * (1 + stepUp));
  }

  const totalInvested = projection.reduce((sum, row) => sum + row.yearlyContribution, 0);
  const maturityValue = projection[projection.length - 1]?.closingBalance || 0;
  const totalInterest = maturityValue - totalInvested;

  return { projection, summary: { totalInvested, maturityValue, totalInterest, finalAnnualContribution: projection[projection.length - 1]?.contributionUsed || 0 } };
};

const softwareSchema = {
  '@context': 'https://schema.org', '@type': 'WebApplication', name: 'PPF Calculator India - Upaman',
  url: 'https://upaman.com/ppf-calculator', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  featureList: ['PPF maturity calculator', 'Year-wise projection table', 'Interest breakdown', 'Annual step-up option'],
};

const DEFAULT_INPUTS = { annualContribution: 150000, annualRate: 7.1, tenureYears: 15, annualStepUp: 0, contributionMode: 'monthly' };

const SHARED_OPTIONS = { contributionMode: contributionModes.map((mode) => mode.value) };

const PPFCalculator = () => {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  useShareableState({
    values: inputs,
    defaults: DEFAULT_INPUTS,
    onRestore: (shared) => setInputs((prev) => restoreValues(prev, shared, DEFAULT_INPUTS, SHARED_OPTIONS))
  });
  const [showFullProjection, setShowFullProjection] = useState(false);
  const results = useMemo(() => calculatePPFProjection(inputs), [inputs]);

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));
  const num = (v) => parseFloat(v) || 0;

  const projectionRows = showFullProjection ? results.projection : results.projection.slice(0, 15);
  const hasContributionCap = Number(inputs.annualContribution) > PPF_CONTRIBUTION_LIMIT;
  const ppfShareLines = [
    `Total investment: ${formatINR(results.summary.totalInvested)}`,
    `Estimated maturity value: ${formatINR(results.summary.maturityValue)}`,
    `Estimated total interest: ${formatINR(results.summary.totalInterest)}`,
    `Final annual contribution used: ${formatINR(results.summary.finalAnnualContribution)}`,
  ];

  return (
    <>
      <Head>
        <title>PPF Calculator India 2026 | Maturity &amp; Interest Projection | Upaman</title>
        <meta name="description" content="Free PPF calculator for India. Estimate maturity value, yearly interest accrual and full contribution projection with annual step-up and contribution mode options." />
        <meta name="keywords" content="PPF calculator India, PPF maturity calculator, public provident fund interest calculator, PPF yearly projection, PPF 15 year calculation" />
        <link rel="canonical" href="https://upaman.com/ppf-calculator" />
        <meta property="og:title" content="PPF Calculator India | Upaman" />
        <meta property="og:description" content="Calculate Public Provident Fund maturity value, total investment and interest with a detailed year-wise projection." />
        <meta property="og:url" content="https://upaman.com/ppf-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(FAQ)) }} />
      </Head>

      <CalcLayout eyebrow="Investing" title="PPF Calculator" subtitle="Estimate your Public Provident Fund maturity value and interest, with a full year-by-year projection. Current rate: 7.1% p.a.">
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <NumberField id="ppf-amt" label="Annual contribution" prefix="₹" value={inputs.annualContribution} onChange={(v) => set('annualContribution', num(v))} hint={hasContributionCap ? 'Capped at ₹1,50,000 per year in the projection.' : 'Maximum eligible: ₹1,50,000 per year.'} />
              <NumberField id="ppf-rate" label="Interest rate (p.a.)" suffix="%" step={0.1} value={inputs.annualRate} onChange={(v) => set('annualRate', num(v))} />
              <NumberField id="ppf-yrs" label="Tenure" suffix="yrs" value={inputs.tenureYears} onChange={(v) => set('tenureYears', num(v))} hint="PPF has a 15-year lock-in, extendable in 5-year blocks." />
              <NumberField id="ppf-step" label="Annual step-up (optional)" suffix="%" step={1} value={inputs.annualStepUp} onChange={(v) => set('annualStepUp', num(v))} />
              <SelectField id="ppf-mode" label="Contribution mode" value={inputs.contributionMode} onChange={(v) => set('contributionMode', v)} options={contributionModes} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Maturity value" value={formatINR(results.summary.maturityValue)} emphasis tone="positive" />
              <ResultStat label="Total invested" value={formatINR(results.summary.totalInvested)} />
              <ResultStat label="Total interest" value={formatINR(results.summary.totalInterest)} />
              <ResultStat label="Final annual contribution" value={formatINR(results.summary.finalAnnualContribution)} />
            </div>
            <Card className="p-5">
              <PieBreakdownChart title="Investment vs interest" items={[{ label: 'Total invested', value: results.summary.totalInvested, color: '#3b82f6' }, { label: 'Total interest', value: results.summary.totalInterest, color: '#10b981' }]} formatter={formatINR} />
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-ink dark:border-slate-700 dark:text-slate-100">Year-by-year projection</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted dark:bg-slate-800/60">
                      <th className="px-4 py-2 font-semibold">Year</th>
                      <th className="px-4 py-2 font-semibold">Contribution</th>
                      <th className="px-4 py-2 font-semibold">Interest</th>
                      <th className="px-4 py-2 font-semibold">Closing balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectionRows.map((row) => (
                      <tr key={row.year} className="border-t border-slate-100 dark:border-slate-700/60">
                        <td className="px-4 py-2">{row.year}</td>
                        <td className="px-4 py-2">{formatINR(row.yearlyContribution)}</td>
                        <td className="px-4 py-2 text-emerald-600 dark:text-emerald-400">{formatINR(row.yearlyInterest)}</td>
                        <td className="px-4 py-2 font-medium">{formatINR(row.closingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {results.projection.length > 15 && (
                <button type="button" onClick={() => setShowFullProjection((s) => !s)} className="w-full border-t border-slate-100 px-5 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:bg-slate-800">
                  {showFullProjection ? 'Show first 15 years' : 'Show full projection'}
                </button>
              )}
            </Card>

            <ResultActions title="PPF projection summary" summaryLines={ppfShareLines} fileName="upaman-ppf-summary.txt" />
          </div>
        </div>

        <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Why a &ldquo;boring&rdquo; 7.1% is worth more than it looks</h2>
          <p className="mt-3">
            The Public Provident Fund pays a modest-sounding 7.1% a year, and every few months someone points out
            that equities have done better. What that comparison misses is <strong className="text-ink dark:text-white">what
            kind of 7.1% this is</strong>. PPF is backed by the Government of India — as close to zero default risk
            as a rupee investment gets — and it carries EEE tax status: the contribution is deductible under
            Section 80C, the interest is tax-free as it accrues, and the maturity amount is tax-free too. For
            someone in the 30% bracket, a tax-free 7.1% is roughly equivalent to a taxable fixed deposit paying
            about 10%, with none of the credit risk. That is the lens through which PPF should be judged: not
            against equity&rsquo;s upside, but against other <em>safe</em> money.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">What 15 years of the full limit builds</h3>
          <p className="mt-3">
            Take the calculator&rsquo;s default: ₹1,50,000 a year — the annual maximum — for the full 15-year term
            at 7.1%, paid in monthly instalments. You contribute <strong className="text-ink dark:text-white">₹22,50,000</strong>
            of your own money and finish with a maturity value of about <strong className="text-ink dark:text-white">₹39,44,599</strong>,
            of which roughly <strong className="text-ink dark:text-white">₹16,94,599 is tax-free interest</strong> —
            more than three-quarters of your total contributions, earned simply by leaving the money alone. The
            growth is back-loaded: the first year adds under ₹6,000 of interest, but because each year&rsquo;s
            interest itself earns interest tax-free, the later years do the heavy lifting. That is compounding with
            the tax drag removed.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">The rule that quietly costs people interest</h3>
          <p className="mt-3">
            PPF interest is calculated each month on the <strong className="text-ink dark:text-white">lowest balance
            between the 5th and the last day of the month</strong>. A deposit landing on or before the 5th earns
            that month&rsquo;s interest; one made on the 6th effectively sits idle for a month. Over a lump-sum
            year the timing compounds into real money. In this calculator, switching the contribution mode from
            &ldquo;yearly lump sum at the start of the year&rdquo; to &ldquo;yearly lump sum at the end&rdquo;
            changes the 15-year maturity from about ₹40,68,209 to ₹37,98,514 — a gap of roughly{' '}
            <strong className="text-ink dark:text-white">₹2,69,695</strong> on identical contributions, decided
            purely by <em>when</em> in the year the money went in. If you invest a lump sum, do it in early April;
            if monthly, before the 5th.
          </p>

          <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">The lock-in is firmer than a savings account, softer than you think</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink dark:text-white">Loans from year 3.</strong> Between the 3rd and 6th
              financial years you can borrow against the balance — useful liquidity without breaking the account.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Partial withdrawals from year 7.</strong> After six
              complete years you may withdraw up to a capped share of the balance, once a year.
            </li>
            <li>
              <strong className="text-ink dark:text-white">Extension in 5-year blocks.</strong> At maturity you can
              extend indefinitely, with or without fresh deposits. Run the tenure out to 25 years at the same
              ₹1.5 lakh and the corpus reaches nearly <strong className="text-ink dark:text-white">₹1 crore
              (~₹99,94,812)</strong> — the extension blocks are where PPF becomes a serious retirement asset.
            </li>
          </ul>

          <h2 className="mt-8 font-display text-xl font-bold text-ink dark:text-white">Where PPF fits in a portfolio</h2>
          <p className="mt-3">
            PPF is the anchor for the safe, tax-free portion of a long-term plan — the money you never want to see
            fall. It pairs naturally with market-linked growth rather than competing with it: many investors run a
            PPF alongside equity <a href="/sip-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">SIPs</a>,
            using PPF to lock in ₹1.5 lakh of Section 80C benefit and steady compounding while the SIPs chase
            higher long-run returns. To see the same tax-free compounding math on any rate or horizon, the{' '}
            <a href="/compound-interest-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">compound interest calculator</a>{' '}
            is a useful companion. One caveat worth remembering: the 80C deduction that makes PPF so efficient
            applies under the old tax regime — if you have moved to the new regime, you keep the tax-free interest
            and maturity but lose the up-front deduction, which shifts the comparison.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">PPF Calculator FAQ</h2>
          <div className="mt-4 grid gap-3">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            reviewedOn="June 28, 2026"
            inputs={['Annual contribution, annual interest rate, tenure, contribution mode, and optional annual step-up', 'Contribution cap applied as per current PPF annual limit']}
            formulas={['Monthly accrual approximation with annual interest crediting', 'Year-wise rolling balance: opening + contribution + accrued interest']}
            assumptions={['Yearly contribution used for projection is capped at ₹1,50,000', 'Interest rate is assumed constant for the selected tenure', 'This is a planning projection and may differ from official passbook posting logic']}
            sources={[{ label: 'National Savings Institute (PPF scheme)', url: 'https://www.nsiindia.gov.in/' }, { label: 'India Post - Public Provident Fund', url: 'https://www.indiapost.gov.in/' }]}
            guideLinks={[{ label: 'PPF vs SIP choice guide', href: '/guides/ppf-vs-sip-choice' }, { label: 'SIP step-up planning guide', href: '/guides/sip-step-up-planning' }]}
          />
        </div>
      
        <HowToSection
          name="How to use the PPF Calculator"
          description="Project the maturity value of your Public Provident Fund account."
          steps={[
            { name: "Enter your yearly deposit", text: "Type the amount you plan to invest each financial year." },
            { name: "Confirm the interest rate", text: "Use the current PPF rate or adjust it for your scenario." },
            { name: "Set the duration", text: "Choose the number of years (15 or extended in blocks of 5)." },
            { name: "Review the maturity value", text: "See your total deposits, interest earned, and final corpus." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default PPFCalculator;
