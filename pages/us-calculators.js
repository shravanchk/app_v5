import Head from 'next/head';
import PageComponent from '../components/USCalculatorsHub';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>US Calculators Hub | Mortgage, Refinance, Auto Loan | Upaman</title>
        <meta
          name="description"
          content="Explore US-focused calculators on Upaman: mortgage payment, refinance break-even, auto loan, 401(k), savings/CD, and credit card payoff tools."
        />
        <meta
          name="keywords"
          content="US calculators, mortgage calculator USA, refinance calculator USA, auto loan calculator USA, 401k calculator USA, savings CD calculator USA, credit card payoff calculator USA"
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
