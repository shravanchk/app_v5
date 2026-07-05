import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import { PieBreakdownChart } from '../calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField } from '../ui/Field';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/calculations';

const getMonthlyPayment = (principal, annualRate, months) => {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
};

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

const MORTGAGE_FAQS = [
  {
    q: 'Why is most of my early mortgage payment interest?',
    a: 'Interest is charged on the outstanding balance, and the balance is at its largest in month one. On a $360,000 loan at 6.75%, the first $2,334.95 payment splits into $2,025.00 interest and only $309.95 principal. Each month the balance falls slightly, so the interest share shrinks and the principal share grows — slowly at first, then faster in the final decade.'
  },
  {
    q: 'How do I avoid paying PMI?',
    a: 'Conventional lenders typically require private mortgage insurance when your down payment is below 20% of the purchase price. Putting 20% down avoids it entirely. If you buy with less down, PMI can usually be cancelled once you reach 20% equity through payments or appreciation — this calculator shows the PMI cost but does not model the cancellation date.'
  },
  {
    q: 'What is the 28% housing ratio guideline?',
    a: 'A common lender rule of thumb says your total monthly housing payment should stay at or below 28% of gross monthly income. It is a screening guideline, not a law — lenders also weigh your other debts, credit history, and reserves. The calculator shows your ratio so you can see how a specific price and rate compare to that benchmark.'
  },
  {
    q: 'Will my monthly payment stay the same for 30 years?',
    a: 'On a fixed-rate loan the principal-and-interest portion never changes. The rest of the payment can: property taxes are reassessed, insurance premiums rise, and HOA dues increase. That is why a payment quoted as "fixed" still drifts upward over the years if you escrow taxes and insurance.'
  },
  {
    q: 'What is the difference between interest rate and APR?',
    a: 'The interest rate is what the amortization math uses to compute your payment. APR bundles the rate with certain lender fees and points to give a standardized cost-comparison number, so APR is normally a little higher than the rate. When comparing two loan offers with different fees, APR is the fairer yardstick; when estimating your payment, use the note rate.'
  },
  {
    q: 'Is a 15-year mortgage worth the higher payment?',
    a: 'On a $360,000 loan at 6.75%, the 15-year payment is $3,185.67 versus $2,334.95 for 30 years — about $850 more each month. In exchange, lifetime interest falls from $480,583 to $213,421, a saving of roughly $267,000. Whether that trade is worth it depends on whether the higher payment crowds out retirement savings or an emergency fund.'
  }
];

const USMortgageCalculator = () => {
  const [inputs, setInputs] = useState({
    homePrice: 450000,
    downPayment: 90000,
    interestRate: 6.75,
    loanTermYears: 30,
    propertyTaxRate: 1.1,
    homeInsuranceAnnual: 1800,
    hoaMonthly: 150,
    pmiRate: 0.6,
    monthlyGrossIncome: 9000
  });

  const results = useMemo(() => {
    const homePrice = Math.max(0, Number(inputs.homePrice) || 0);
    const downPayment = Math.max(0, Number(inputs.downPayment) || 0);
    const rate = Math.max(0, Number(inputs.interestRate) || 0);
    const years = Math.max(1, Math.floor(Number(inputs.loanTermYears) || 0));
    const taxRate = Math.max(0, Number(inputs.propertyTaxRate) || 0);
    const insuranceAnnual = Math.max(0, Number(inputs.homeInsuranceAnnual) || 0);
    const hoaMonthly = Math.max(0, Number(inputs.hoaMonthly) || 0);
    const pmiRate = Math.max(0, Number(inputs.pmiRate) || 0);
    const monthlyGrossIncome = Math.max(0, Number(inputs.monthlyGrossIncome) || 0);

    const loanAmount = Math.max(0, homePrice - downPayment);
    const termMonths = years * 12;
    const principalAndInterest = getMonthlyPayment(loanAmount, rate, termMonths);
    const propertyTaxMonthly = (homePrice * taxRate) / 100 / 12;
    const insuranceMonthly = insuranceAnnual / 12;
    const downPaymentPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
    const pmiMonthly = downPaymentPercent < 20 ? (loanAmount * pmiRate) / 100 / 12 : 0;
    const totalMonthlyPayment = principalAndInterest + propertyTaxMonthly + insuranceMonthly + hoaMonthly + pmiMonthly;

    const totalPrincipalAndInterestPaid = principalAndInterest * termMonths;
    const totalInterest = Math.max(0, totalPrincipalAndInterestPaid - loanAmount);
    const housingRatio = monthlyGrossIncome > 0 ? (totalMonthlyPayment / monthlyGrossIncome) * 100 : 0;
    const firstMonthInterest = loanAmount * (rate / 100 / 12);
    const firstMonthPrincipal = Math.max(0, principalAndInterest - firstMonthInterest);

    return {
      loanAmount,
      principalAndInterest,
      propertyTaxMonthly,
      insuranceMonthly,
      hoaMonthly,
      pmiMonthly,
      totalMonthlyPayment,
      totalInterest,
      downPaymentPercent,
      housingRatio,
      firstMonthPrincipal,
      firstMonthInterest
    };
  }, [inputs]);

  const summaryLines = [
    `Loan amount: ${formatUSD(results.loanAmount)}`,
    `Estimated monthly payment (PITI + HOA + PMI): ${formatUSD(results.totalMonthlyPayment)}`,
    `Principal & interest: ${formatUSD(results.principalAndInterest)}`,
    `Estimated total interest over term: ${formatUSD(results.totalInterest)}`,
    `Down payment: ${results.downPaymentPercent.toFixed(2)}%`,
    `Housing ratio (payment / gross income): ${results.housingRatio.toFixed(1)}%`
  ];

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <Head>
        <title>US Mortgage Calculator | Monthly Payment, PMI, Tax & Insurance | Upaman</title>
        <meta
          name="description"
          content="Free US mortgage calculator with principal and interest, property tax, homeowners insurance, HOA and PMI estimates."
        />
        <meta
          name="keywords"
          content="US mortgage calculator, monthly mortgage payment calculator, PMI calculator, PITI calculator, home loan calculator USA"
        />
        <link rel="canonical" href="https://upaman.com/us-mortgage-calculator" />
        <meta property="og:title" content="US Mortgage Calculator | Upaman" />
        <meta
          property="og:description"
          content="Estimate US mortgage payments with principal, interest, property tax, insurance, HOA and PMI."
        />
        <meta property="og:url" content="https://upaman.com/us-mortgage-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Mortgage Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Calculate monthly mortgage payment, PMI impact and first-month principal vs interest."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'US Mortgage Calculator',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              url: 'https://upaman.com/us-mortgage-calculator',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: MORTGAGE_FAQS.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a }
              }))
            })
          }}
        />
      </Head>

      <CalcLayout
        eyebrow="United States"
        title="US Mortgage Calculator"
        subtitle="Estimate your monthly payment with principal, interest, property tax, insurance, HOA, and PMI."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="m-price" label="Home price" prefix="$" value={inputs.homePrice} onChange={(v) => set('homePrice', v)} />
              <NumberField id="m-down" label="Down payment" prefix="$" value={inputs.downPayment} onChange={(v) => set('downPayment', v)} />
              <NumberField id="m-rate" label="Interest rate (APR)" suffix="%" step={0.01} value={inputs.interestRate} onChange={(v) => set('interestRate', v)} />
              <NumberField id="m-term" label="Loan term" suffix="yrs" min={1} max={40} value={inputs.loanTermYears} onChange={(v) => set('loanTermYears', v)} />
              <NumberField id="m-tax" label="Property tax rate" suffix="%/yr" step={0.01} value={inputs.propertyTaxRate} onChange={(v) => set('propertyTaxRate', v)} />
              <NumberField id="m-ins" label="Home insurance" prefix="$" suffix="/yr" value={inputs.homeInsuranceAnnual} onChange={(v) => set('homeInsuranceAnnual', v)} />
              <NumberField id="m-hoa" label="HOA" prefix="$" suffix="/mo" value={inputs.hoaMonthly} onChange={(v) => set('hoaMonthly', v)} />
              <NumberField id="m-pmi" label="PMI rate (if <20% down)" suffix="%/yr" step={0.01} value={inputs.pmiRate} onChange={(v) => set('pmiRate', v)} />
              <NumberField id="m-income" label="Gross income" prefix="$" suffix="/mo" value={inputs.monthlyGrossIncome} onChange={(v) => set('monthlyGrossIncome', v)} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Total monthly" value={formatUSD(results.totalMonthlyPayment)} emphasis tone="positive" />
              <ResultStat label="Principal & interest" value={formatUSD(results.principalAndInterest)} />
              <ResultStat label="Property tax + insurance" value={formatUSD(results.propertyTaxMonthly + results.insuranceMonthly)} />
              <ResultStat label="PMI + HOA" value={formatUSD(results.pmiMonthly + results.hoaMonthly)} />
            </div>

            <Card className="p-5">
              <div className="space-y-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <p><strong className="font-semibold text-ink dark:text-white">Loan amount:</strong> {formatUSD(results.loanAmount)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">Estimated total interest:</strong> {formatUSD(results.totalInterest)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">First-month split:</strong> Principal {formatUSD(results.firstMonthPrincipal)} · Interest {formatUSD(results.firstMonthInterest)}</p>
                <p>
                  <strong className="font-semibold text-ink dark:text-white">Housing ratio:</strong> {results.housingRatio.toFixed(1)}%
                  {results.housingRatio > 28 ? ' (above common 28% guideline)' : ' (within common 28% guideline)'}
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <PieBreakdownChart
                title="Monthly payment composition"
                items={[
                  { label: 'Principal & interest', value: results.principalAndInterest, color: '#3b82f6' },
                  { label: 'Property tax', value: results.propertyTaxMonthly, color: '#f59e0b' },
                  { label: 'Insurance', value: results.insuranceMonthly, color: '#10b981' },
                  { label: 'HOA', value: results.hoaMonthly, color: '#8b5cf6' },
                  { label: 'PMI', value: results.pmiMonthly, color: '#ef4444' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <ResultActions title="US Mortgage Calculator Summary" summaryLines={summaryLines} fileName="us-mortgage-calculator-summary.txt" />
          </div>
        </div>

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">What a mortgage payment actually contains</h2>
            <p>
              The number a lender quotes you — the principal-and-interest payment — is usually the smallest version of the
              truth. The amount that leaves your bank account each month is PITI plus extras: <strong>P</strong>rincipal,{' '}
              <strong>I</strong>nterest, property <strong>T</strong>axes, homeowners <strong>I</strong>nsurance, plus HOA dues
              if the property has an association and PMI if you put less than 20% down. This calculator adds all five so the
              monthly figure you budget against is the complete one.
            </p>
            <p>
              Take the default example: a $450,000 home with $90,000 down (exactly 20%) at 6.75% over 30 years. The loan is
              $360,000 and the principal-and-interest payment works out to $2,334.95. Add property tax at 1.1% of the home
              value ($412.50 a month), insurance at $1,800 a year ($150 a month), and a $150 HOA, and the real monthly cost is{' '}
              <strong className="text-ink dark:text-white">$3,047.45</strong> — about 31% more than the quoted payment. On a
              $9,000 gross monthly income, that is a 33.9% housing ratio, noticeably above the common 28% guideline, which is
              exactly the kind of thing worth knowing before falling in love with a listing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">The quiet cost of a smaller down payment</h2>
            <p>
              Change one input — put 10% down instead of 20% — and three things move at once. The loan grows to $405,000, so
              principal and interest rises to $2,626.82. PMI switches on at 0.6% of the loan, adding $202.50 a month. The total
              payment becomes $3,541.82, which is <strong className="text-ink dark:text-white">$494 more every month</strong>{' '}
              than the 20%-down version. Over the full term, the larger loan also accrues about $540,656 of interest instead of
              $480,583. None of this means a smaller down payment is wrong — waiting years to save 20% has its own cost — but
              the trade-off should be a number, not a vibe.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Where the money goes: interest first, equity later</h2>
            <p>
              Amortization front-loads interest. In month one of the $360,000 loan, $2,025.00 of the $2,334.95 payment is
              interest and only $309.95 reduces the balance. Over 30 years you repay the $360,000 you borrowed plus{' '}
              <strong className="text-ink dark:text-white">$480,583 in interest</strong> — the house costs roughly 2.3× the
              loan amount. The first-month split shown in the results panel is there precisely because it surprises most
              first-time buyers.
            </p>
            <p>Three levers change that interest bill dramatically:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink dark:text-white">Term.</strong> The same loan over 15 years costs $3,185.67 a month
                but only $213,421 in lifetime interest — a saving of about $267,000 versus the 30-year schedule.
              </li>
              <li>
                <strong className="text-ink dark:text-white">Rate.</strong> At 6.0% the payment is $2,158.38; at 7.5% it is
                $2,517.17. A percentage point and a half moves the payment by about $360 a month, which is why shopping
                multiple lenders and considering points can matter more than negotiating the sale price.
              </li>
              <li>
                <strong className="text-ink dark:text-white">Extra principal.</strong> Adding just $200 a month to the default
                loan pays it off in about 23.8 years instead of 30 and cuts lifetime interest by roughly $115,900. Extra
                payments early in the loan do the most work, because that is when the balance — and therefore the interest —
                is largest.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">What this estimate deliberately leaves out</h2>
            <p>
              A payment estimate is not a closing estimate. One-time costs — origination fees, title insurance, appraisal,
              transfer taxes, prepaid escrow — typically add 2–5% of the purchase price at closing and are not part of the
              monthly figure here. The calculator also treats property tax and insurance as fixed, while in reality both tend
              to rise over the years; models a fixed rate, so adjustable-rate mortgages behave differently after their intro
              period; and does not predict when PMI cancels. Use the monthly number for affordability decisions, then get a
              formal Loan Estimate from a lender for the transaction itself.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Frequently asked questions</h2>
            <div className="space-y-3">
              {MORTGAGE_FAQS.map((item) => (
                <details key={item.q} className="group rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <summary className="cursor-pointer font-semibold text-ink dark:text-white">{item.q}</summary>
                  <p className="mt-2">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </article>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Home price, down payment, APR, term, tax rate, insurance, HOA, PMI rate',
              'Gross monthly income for housing ratio context'
            ]}
            formulas={[
              'Principal & interest: standard amortization mortgage payment formula',
              'Property tax monthly = home price × tax rate ÷ 12',
              'PMI estimate shown when down payment is below 20%',
              'Housing ratio = total monthly payment ÷ gross monthly income'
            ]}
            assumptions={[
              'Property tax and insurance are treated as fixed estimates',
              'PMI cancellation timing is not modeled here',
              'Actual lender costs and escrow rules vary by state and lender'
            ]}
            sources={[
              { label: 'Consumer Financial Protection Bureau (CFPB) - Mortgage basics', url: 'https://www.consumerfinance.gov/owning-a-home/' },
              { label: 'Fannie Mae - Loan-to-value and mortgage topics', url: 'https://singlefamily.fanniemae.com/' }
            ]}
          />
        </div>
      
        <HowToSection
          name="How to use the Mortgage Calculator"
          description="Estimate your monthly mortgage payment."
          steps={[
            { name: "Enter the home price", text: "Type the purchase price of the property." },
            { name: "Set the down payment", text: "Enter your down payment amount or percentage." },
            { name: "Set the rate and term", text: "Enter the interest rate and loan length in years." },
            { name: "Add taxes and insurance", text: "Include property tax, insurance, and HOA if relevant." },
            { name: "Review the payment", text: "See your monthly payment and total interest over the loan." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default USMortgageCalculator;
