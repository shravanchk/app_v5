import Head from 'next/head';
import PageComponent from '../components/us/USCalculatorsHub';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>US Calculators Hub | Mortgage, Refinance, Auto Loan | Upaman</title>
        <meta
          name="description"
          content="Explore US-focused calculators on Upaman: paycheck take-home pay, mortgage, refinance break-even, auto loan, 401(k), savings/CD, credit card payoff, compound interest, and inflation tools."
        />
        <meta
          name="keywords"
          content="US calculators, paycheck calculator, mortgage calculator USA, refinance calculator USA, auto loan calculator USA, 401k calculator USA, compound interest calculator, inflation calculator, credit card payoff calculator USA"
        />
        <link rel="canonical" href="https://upaman.com/us-calculators" />
        <meta property="og:title" content="US Calculators Hub | Upaman" />
        <meta
          property="og:description"
          content="US financial calculators for mortgage, refinance, auto loan, retirement, savings, and debt payoff decisions."
        />
        <meta property="og:url" content="https://upaman.com/us-calculators" />
        <meta property="og:type" content="website" />
      </Head>
      <PageComponent />
    </>
  );
}
