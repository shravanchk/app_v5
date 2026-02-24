import Head from 'next/head';
import PageComponent from '../components/IndiaCalculatorsHub';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>India Calculators Hub | Tax, EMI, SIP, GST, Salary | Upaman</title>
        <meta
          name="description"
          content="Explore India-focused calculators on Upaman: EMI, income tax, GST, SIP, PPF, salary, IRCTC booking, and credit card repayment tools."
        />
        <meta
          name="keywords"
          content="India calculators hub, EMI calculator India, income tax calculator India, GST calculator India, SIP calculator India, PPF calculator India, salary calculator India, IRCTC calculator"
        />
        <link rel="canonical" href="https://upaman.com/india-calculators" />
        <meta property="og:title" content="India Calculators Hub | Upaman" />
        <meta
          property="og:description"
          content="India-focused calculators for tax, loans, investment planning, salary, IRCTC and debt payoff decisions."
        />
        <meta property="og:url" content="https://upaman.com/india-calculators" />
        <meta property="og:type" content="website" />
      </Head>
      <PageComponent />
    </>
  );
}
