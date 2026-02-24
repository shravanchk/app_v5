import Head from 'next/head';
import PageComponent from '../components/HomeLoanReadinessWorkflow';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Home Loan Readiness Workflow | India, US, EU/UK | Upaman</title>
        <meta
          name="description"
          content="Check home loan readiness across India, US, and EU/UK assumptions with safe EMI, affordable loan, property budget guidance, and action plan."
        />
        <meta
          name="keywords"
          content="home loan readiness calculator, mortgage affordability workflow, safe emi calculator, max affordable home loan, housing budget planner"
        />
        <link rel="canonical" href="https://upaman.com/home-loan-readiness-workflow" />
        <meta property="og:title" content="Home Loan Readiness Workflow | Upaman" />
        <meta
          property="og:description"
          content="Assess safe EMI, affordable loan size, property budget, and next actions before taking a home loan across key regions."
        />
        <meta property="og:url" content="https://upaman.com/home-loan-readiness-workflow" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Home Loan Readiness Workflow | Upaman" />
        <meta
          name="twitter:description"
          content="Evaluate affordability and risk before taking a home loan with a guided workflow for India, US, and EU/UK scenarios."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Home Loan Readiness Workflow',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/home-loan-readiness-workflow',
              description: 'Guided affordability workflow for safe EMI, home loan budget, and readiness assessment.',
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
