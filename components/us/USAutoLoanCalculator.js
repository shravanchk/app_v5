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
import { useShareableState, toNumber } from '../../utils/shareableState';

const getMonthlyPayment = (principal, annualRate, months) => {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
};

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

// All figures computed with this page's own formulas on the default inputs:
// $38,000 price, $5,000 down, $3,000 trade-in, 7% sales tax, $1,200 fees, 6.5% APR, 60 months.
const AUTO_LOAN_FAQS = [
  {
    q: 'How is the amount financed calculated?',
    a: 'Price minus trade-in gives the taxable amount, then sales tax and dealer fees are added and the down payment subtracted. On the default example: $38,000 − $3,000 trade-in = $35,000 taxable, plus $2,450 tax and $1,200 fees, minus $5,000 down = $33,650 financed. That — not the sticker price — is what you pay interest on.'
  },
  {
    q: 'Is a 72- or 84-month car loan a bad idea?',
    a: 'It is a trade you should price, not a rule. Stretching this $33,650 loan from 60 to 72 months drops the payment from $658.40 to $565.65 but raises total interest from $5,854 to $7,077; at 84 months the payment is $499.68 and interest reaches $8,323. Longer terms also keep you underwater on a depreciating car for more of the loan.'
  },
  {
    q: 'How much does my APR actually matter?',
    a: 'On this loan, the difference between 6.5% and 9.5% APR is $48.31 a month — $2,899 over 60 months, all of it interest. APR depends on your credit profile, the loan term, and the lender, which is why getting pre-approved by a bank or credit union before visiting the dealer gives you a real number to make the dealer beat.'
  },
  {
    q: 'Why does the trade-in reduce my sales tax?',
    a: 'In many states, tax applies only to the price difference after the trade-in credit. Here the $3,000 trade-in trims the taxable base and saves $210 at a 7% rate on top of its cash value. State rules vary — some tax the full price — so check how yours treats trade-ins before comparing a private sale against trading in.'
  },
  {
    q: 'What does being "upside-down" on a car loan mean?',
    a: 'Owing more than the car is worth. Cars depreciate fastest in the first years, while slow-amortizing loans (small down payments, long terms) pay principal slowly, so the loan balance can exceed the car’s value. A bigger down payment and a shorter term shrink the underwater window; gap insurance covers the difference if the car is totaled during it.'
  }
];

const getPayoffDate = (months) => {
  if (!months || months <= 0) return 'N/A';
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

const DEFAULT_INPUTS = {
  vehiclePrice: 38000,
  downPayment: 5000,
  tradeInValue: 3000,
  salesTaxRate: 7,
  dealerFees: 1200,
  apr: 6.5,
  termMonths: 60
};

const USAutoLoanCalculator = () => {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  useShareableState({
    values: inputs,
    defaults: DEFAULT_INPUTS,
    onRestore: (shared) =>
      setInputs((prev) => {
        const restored = { ...prev };
        Object.entries(shared).forEach(([key, raw]) => {
          restored[key] = toNumber(raw, DEFAULT_INPUTS[key]);
        });
        return restored;
      })
  });

  const results = useMemo(() => {
    const vehiclePrice = Math.max(0, Number(inputs.vehiclePrice) || 0);
    const downPayment = Math.max(0, Number(inputs.downPayment) || 0);
    const tradeInValue = Math.max(0, Number(inputs.tradeInValue) || 0);
    const salesTaxRate = Math.max(0, Number(inputs.salesTaxRate) || 0);
    const dealerFees = Math.max(0, Number(inputs.dealerFees) || 0);
    const apr = Math.max(0, Number(inputs.apr) || 0);
    const termMonths = Math.max(1, Math.floor(Number(inputs.termMonths) || 1));

    const taxableAmount = Math.max(0, vehiclePrice - tradeInValue);
    const salesTax = (taxableAmount * salesTaxRate) / 100;
    const financedAmount = Math.max(0, taxableAmount + salesTax + dealerFees - downPayment);
    const monthlyPayment = getMonthlyPayment(financedAmount, apr, termMonths);
    const totalLoanPaid = monthlyPayment * termMonths;
    const totalInterest = Math.max(0, totalLoanPaid - financedAmount);
    const totalOutOfPocketCost = totalLoanPaid + downPayment + tradeInValue;

    return {
      taxableAmount,
      salesTax,
      financedAmount,
      monthlyPayment,
      totalLoanPaid,
      totalInterest,
      totalOutOfPocketCost,
      payoffDate: getPayoffDate(termMonths)
    };
  }, [inputs]);

  const summaryLines = [
    `Estimated monthly payment: ${formatUSD(results.monthlyPayment)}`,
    `Amount financed: ${formatUSD(results.financedAmount)}`,
    `Estimated total loan interest: ${formatUSD(results.totalInterest)}`,
    `Total loan payments: ${formatUSD(results.totalLoanPaid)}`,
    `Estimated payoff date: ${results.payoffDate}`
  ];

  const set = (field, value) => setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <Head>
        <title>US Auto Loan Calculator | Payment, Interest & Total Cost | Upaman</title>
        <meta
          name="description"
          content="Free US auto loan calculator with sales tax, trade-in, fees, APR and term. Estimate monthly payment, interest and total cost."
        />
        <meta
          name="keywords"
          content="US auto loan calculator, car payment calculator, vehicle loan calculator, car financing calculator, APR auto loan estimator"
        />
        <link rel="canonical" href="https://upaman.com/us-auto-loan-calculator" />
        <meta property="og:title" content="US Auto Loan Calculator | Upaman" />
        <meta
          property="og:description"
          content="Calculate US auto loan payments with tax, trade-in, fees, APR and loan term."
        />
        <meta property="og:url" content="https://upaman.com/us-auto-loan-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="US Auto Loan Calculator | Upaman" />
        <meta
          name="twitter:description"
          content="Estimate monthly car payment, total interest, financed amount and payoff timeline."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: AUTO_LOAN_FAQS.map((item) => ({
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
        title="US Auto Loan Calculator"
        subtitle="Estimate your car loan payment with sales tax, trade-in credit, and dealer fees."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField id="a-price" label="Vehicle price" prefix="$" value={inputs.vehiclePrice} onChange={(v) => set('vehiclePrice', v)} />
              <NumberField id="a-down" label="Down payment" prefix="$" value={inputs.downPayment} onChange={(v) => set('downPayment', v)} />
              <NumberField id="a-trade" label="Trade-in value" prefix="$" value={inputs.tradeInValue} onChange={(v) => set('tradeInValue', v)} />
              <NumberField id="a-tax" label="Sales tax rate" suffix="%" step={0.01} value={inputs.salesTaxRate} onChange={(v) => set('salesTaxRate', v)} />
              <NumberField id="a-fees" label="Dealer fees" prefix="$" value={inputs.dealerFees} onChange={(v) => set('dealerFees', v)} />
              <NumberField id="a-apr" label="Loan APR" suffix="%" step={0.01} value={inputs.apr} onChange={(v) => set('apr', v)} />
              <NumberField id="a-term" label="Loan term" suffix="mo" min={1} max={96} value={inputs.termMonths} onChange={(v) => set('termMonths', v)} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Monthly payment" value={formatUSD(results.monthlyPayment)} emphasis tone="positive" />
              <ResultStat label="Amount financed" value={formatUSD(results.financedAmount)} />
              <ResultStat label="Total interest" value={formatUSD(results.totalInterest)} />
              <ResultStat label="Payoff date" value={results.payoffDate} />
            </div>

            <Card className="p-5">
              <div className="space-y-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                <p><strong className="font-semibold text-ink dark:text-white">Taxable amount:</strong> {formatUSD(results.taxableAmount)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">Sales tax estimate:</strong> {formatUSD(results.salesTax)}</p>
                <p><strong className="font-semibold text-ink dark:text-white">Total out-of-pocket cost:</strong> {formatUSD(results.totalOutOfPocketCost)}</p>
              </div>
            </Card>

            <Card className="p-5">
              <PieBreakdownChart
                title="Out-of-pocket cost composition"
                items={[
                  {
                    label: 'Upfront (down + trade-in)',
                    value: Math.max(0, Number(inputs.downPayment) || 0) + Math.max(0, Number(inputs.tradeInValue) || 0),
                    color: '#0f766e'
                  },
                  { label: 'Loan principal', value: results.financedAmount, color: '#3b82f6' },
                  { label: 'Loan interest', value: results.totalInterest, color: '#f97316' }
                ]}
                formatter={formatUSD}
              />
            </Card>

            <ResultActions title="US Auto Loan Calculator Summary" summaryLines={summaryLines} fileName="us-auto-loan-calculator-summary.txt" />
          </div>
        </div>

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">The number the dealer finances is not the sticker price</h2>
            <p>
              Car-buying conversations orbit the sticker, but your loan is written on a different number. Watch it get
              built on the default example: a $38,000 vehicle minus the $3,000 trade-in leaves $35,000 of taxable
              price. A 7% sales tax adds $2,450, dealer fees add $1,200, and the $5,000 down payment comes off at the
              end — leaving <strong>$33,650 financed</strong>. At 6.5% APR over 60 months that costs
              <strong> $658.40 a month</strong> and <strong>$5,854 in interest</strong>, for a total out-of-pocket cost
              of about $47,500 on a &ldquo;$38,000 car.&rdquo;
            </p>
            <p>
              Two useful things fall out of that arithmetic. First, tax and fees are financed too — you pay five years
              of interest on the $2,450 of sales tax unless you cover it in cash. Second, in many states the trade-in
              reduces the taxable base, so the $3,000 trade here is really worth $3,210 against a $3,000 private-sale
              check. State rules differ on both points; the calculator lets you set the tax rate and fees to match
              yours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">The long-term illusion</h2>
            <p>
              Dealers sell payments, not prices, and the easiest way to shrink a payment is to stretch the term. The
              same $33,650 loan at the same 6.5% APR: 60 months costs $658.40 a month and $5,854 in interest; 72
              months looks friendlier at <strong>$565.65</strong> but the interest climbs to <strong>$7,077</strong>;
              84 months reads <strong>$499.68</strong> and the interest bill hits <strong>$8,323</strong> — 42% more
              than the five-year loan, for the identical car.
            </p>
            <p>
              The subtler cost is depreciation racing your amortization. A new car loses value fastest exactly when a
              long loan pays principal slowest, which is how buyers end up owing more than the car is worth deep into
              year three. If the payment only works at 84 months, that is the budget telling you something the term is
              trying to hide.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">APR is the silent price tag</h2>
            <p>
              Rate shopping feels abstract until you price it. Moving this loan from 6.5% to 9.5% APR — a spread well
              within the range between a strong and a weak credit profile — raises the payment by $48.31 and the total
              interest by <strong>$2,899</strong>. That is a real cost of the loan, paid as surely as any dealer fee.
            </p>
            <p>
              The practical defense is sequencing: get pre-approved by your bank or credit union <em>before</em> the
              dealership, so the finance office has a concrete number to beat rather than a captive customer. Then run
              the offered APR and term through this calculator while you sit there — the interest line updates
              instantly, and it negotiates better than adjectives do.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">What this estimate deliberately leaves out</h2>
            <p>
              Title, registration, and documentation charges vary by state and are not separately modeled — fold them
              into the fees field if you know them. Insurance, fuel, and maintenance sit outside the loan but firmly
              inside the cost of ownership. Optional products pitched at signing (extended warranties, gap coverage,
              paint protection) are priced separately and usually negotiable. And the trade-in-before-tax treatment is
              a common state rule, not a universal one. For the full running-cost picture beyond the loan, the car
              ownership cost workflow complements this page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink dark:text-white">Frequently asked questions</h2>
            <div className="space-y-3">
              {AUTO_LOAN_FAQS.map((item) => (
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
              'Vehicle price, trade-in, down payment, sales tax rate, dealer fees, APR, and term',
              'Trade-in is applied before tax as a general estimate (state rules vary)'
            ]}
            formulas={[
              'Amount financed = (price - trade-in) + sales tax + fees - down payment',
              'Monthly payment uses standard amortization formula',
              'Total interest = total loan payments - amount financed'
            ]}
            assumptions={[
              'Taxable base and fee treatment vary by state and lender',
              'Title, registration, and optional products are not separately modeled',
              'Actual APR and contract terms depend on borrower profile and lender'
            ]}
            sources={[
              { label: 'Consumer Financial Protection Bureau (CFPB) - Auto loans', url: 'https://www.consumerfinance.gov/consumer-tools/auto-loans/' },
              { label: 'Federal Trade Commission (FTC) - Buying and financing a car', url: 'https://consumer.ftc.gov/articles/understanding-vehicle-financing' }
            ]}
          />
        </div>
      
        <HowToSection
          name="How to use the Auto Loan Calculator"
          description="Work out the monthly payment on a car loan."
          steps={[
            { name: "Enter the vehicle price", text: "Type the purchase price of the car." },
            { name: "Set the down payment", text: "Enter your down payment and any trade-in value." },
            { name: "Set the rate and term", text: "Enter the APR and loan length in months or years." },
            { name: "Review the payment", text: "See your monthly payment, total interest, and total cost." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default USAutoLoanCalculator;
