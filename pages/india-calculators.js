import Head from 'next/head';
import PageComponent from '../components/india/IndiaCalculatorsHub';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>India Calculators Hub | Tax, EMI, SIP, GST, Salary | Upaman</title>
        <meta
          name="description"
          content="Explore India-focused calculators on Upaman: EMI, income tax, GST, SIP, PPF, salary, HRA, capital gains, gratuity, and credit card repayment tools."
        />
        <meta
          name="keywords"
          content="India calculators hub, EMI calculator India, income tax calculator India, GST calculator India, SIP calculator India, PPF calculator India, salary calculator India, HRA calculator India"
        />
        <link rel="canonical" href="https://upaman.com/india-calculators" />
        <meta property="og:title" content="India Calculators Hub | Upaman" />
        <meta
          property="og:description"
          content="India-focused calculators for tax, loans, investment planning, salary, and debt payoff decisions."
        />
        <meta property="og:url" content="https://upaman.com/india-calculators" />
        <meta property="og:type" content="website" />
      </Head>
      <PageComponent />
    </>
  );
}
