import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import ResultActions from './ResultActions';
import { PieBreakdownChart } from './calculator/ResultVisualizations';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import { NumberField } from './ui/Field';
import Card from './ui/Card';
import { formatCurrency } from '../utils/calculations';

const getMonthlyPayment = (principal, annualRate, months) => {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
};

const formatUSD = (value) => formatCurrency(Number(value) || 0, 'USD');

const getPayoffDate = (months) => {
  if (!months || months <= 0) return 'N/A';
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

const USAutoLoanCalculator = () => {
  const [inputs, setInputs] = useState({
    vehiclePrice: 38000,
    downPayment: 5000,
    tradeInValue: 3000,
    salesTaxRate: 7,
    dealerFees: 1200,
    apr: 6.5,
    termMonths: 60
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
      </CalcLayout>
    </>
  );
};

export default USAutoLoanCalculator;
