import Head from 'next/head';
import PageComponent from '../components/PrepayVsInvestWorkflow';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Prepay Loan vs Invest Workflow | Upaman</title>
        <meta
          name="description"
          content="Compare loan prepayment versus investing monthly surplus with risk-adjusted return assumptions, interest savings, and actionable recommendation."
        />
        <meta
          name="keywords"
          content="prepay vs invest calculator, loan prepayment vs sip, surplus allocation workflow, debt vs investment decision"
        />
        <link rel="canonical" href="https://upaman.com/prepay-vs-invest-workflow" />
        <meta property="og:title" content="Prepay Loan vs Invest Workflow | Upaman" />
        <meta
          property="og:description"
          content="One workflow to compare loan prepayment and investing surplus with timeline and corpus outcomes."
        />
        <meta property="og:url" content="https://upaman.com/prepay-vs-invest-workflow" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Prepay Loan vs Invest Workflow | Upaman" />
        <meta
          name="twitter:description"
          content="Analyze interest savings vs projected investment corpus and get a clear debt-vs-invest action plan."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Prepay Loan vs Invest Workflow',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/prepay-vs-invest-workflow',
              description: 'Compares monthly surplus allocation between loan prepayment and investing.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR'
              }
            })
          }}
        />
      </Head>
      <PageComponent />
    </>
  );
}
