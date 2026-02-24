import Head from 'next/head';
import PageComponent from '../components/JobOfferWorkflow';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Job Offer Decision Workflow | India, US, EU Salary Comparison | Upaman</title>
        <meta
          name="description"
          content="Compare two salary offers across India, US, and EU/UK assumptions with take-home impact, tax difference, cost-of-living adjustment, and a guided decision plan."
        />
        <meta
          name="keywords"
          content="job offer comparison, salary comparison calculator, take home pay workflow, offer negotiation planner, india us eu salary estimate"
        />
        <link rel="canonical" href="https://upaman.com/job-offer-workflow" />
        <meta property="og:title" content="Job Offer Decision Workflow | Upaman" />
        <meta
          property="og:description"
          content="Compare current vs new offer with region-aware tax, in-hand difference, monthly surplus, and decision guidance."
        />
        <meta property="og:url" content="https://upaman.com/job-offer-workflow" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Job Offer Decision Workflow | Upaman" />
        <meta
          name="twitter:description"
          content="One guided workflow to compare salary offers, affordability impact, and practical action plan across key regions."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Job Offer Decision Workflow',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/job-offer-workflow',
              description: 'Compares salary offers with in-hand estimates, budget impact, and actionable recommendation.',
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
