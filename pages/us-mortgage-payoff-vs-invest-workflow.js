import Head from 'next/head';
import PageComponent from '../components/workflow/UsMortgagePayoffVsInvestWorkflow';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Pay Off Mortgage Early or Invest? Decision Workflow | Upaman</title>
        <meta
          name="description"
          content="Compare extra mortgage principal payments against investing the same money on the same timeline — interest saved, months saved, and final portfolio, with a risk-adjusted verdict."
        />
        <meta
          name="keywords"
          content="pay off mortgage early or invest, mortgage payoff vs invest, extra mortgage payment calculator, should i pay off my mortgage, invest vs pay down mortgage"
        />
        <link rel="canonical" href="https://upaman.com/us-mortgage-payoff-vs-invest-workflow" />
        <meta property="og:title" content="Pay Off Mortgage Early or Invest? Decision Workflow | Upaman" />
        <meta
          property="og:description"
          content="Guaranteed interest savings vs risk-adjusted market growth, compared honestly over the same horizon."
        />
        <meta property="og:url" content="https://upaman.com/us-mortgage-payoff-vs-invest-workflow" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pay Off Mortgage Early or Invest? | Upaman" />
        <meta
          name="twitter:description"
          content="The mortgage-vs-market race, computed on your actual numbers."
        />
      </Head>
      <PageComponent />
    </>
  );
}
