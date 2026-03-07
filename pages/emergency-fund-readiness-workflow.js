import Head from 'next/head';
import PageComponent from '../components/EmergencyFundReadinessWorkflow';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Emergency Fund Readiness Workflow | Upaman</title>
        <meta
          name="description"
          content="Estimate emergency fund runway, target corpus, funding gap, and monthly plan based on income stability and household risk profile."
        />
        <meta
          name="keywords"
          content="emergency fund calculator, emergency corpus planner, financial safety net workflow, runway calculator"
        />
        <link rel="canonical" href="https://upaman.com/emergency-fund-readiness-workflow" />
        <meta property="og:title" content="Emergency Fund Readiness Workflow | Upaman" />
        <meta
          property="og:description"
          content="Calculate emergency runway and get a practical monthly contribution plan to reach your target corpus."
        />
        <meta property="og:url" content="https://upaman.com/emergency-fund-readiness-workflow" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Emergency Fund Readiness Workflow | Upaman" />
        <meta
          name="twitter:description"
          content="Build a stronger safety buffer with target runway, gap analysis, and milestone tracking."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Emergency Fund Readiness Workflow',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/emergency-fund-readiness-workflow',
              description: 'Emergency corpus readiness tool with runway and milestone-based planning.',
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
