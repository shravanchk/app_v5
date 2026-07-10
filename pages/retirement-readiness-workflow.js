import Head from 'next/head';
import PageComponent from '../components/workflow/RetirementReadinessWorkflow';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Retirement Corpus Calculator India — Readiness Workflow | Upaman</title>
        <meta
          name="description"
          content="Find the retirement corpus your lifestyle needs in India, compare it with where your savings are headed, and get the exact extra monthly SIP that closes the gap."
        />
        <meta
          name="keywords"
          content="retirement calculator india, retirement corpus calculator, how much money to retire in india, retirement planning calculator, retirement readiness"
        />
        <link rel="canonical" href="https://upaman.com/retirement-readiness-workflow" />
        <meta property="og:title" content="Retirement Corpus Calculator India — Readiness Workflow | Upaman" />
        <meta
          property="og:description"
          content="Inflation-aware retirement corpus requirement vs your projected savings, with a readiness score and monthly action plan."
        />
        <meta property="og:url" content="https://upaman.com/retirement-readiness-workflow" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Retirement Corpus Calculator India — Readiness Workflow | Upaman" />
        <meta
          name="twitter:description"
          content="How big a corpus does your lifestyle need at retirement — and are your savings on track to build it?"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Retirement Readiness Workflow (India)',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/retirement-readiness-workflow',
              description: 'Compares the retirement corpus a lifestyle requires with the corpus current savings will produce.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR'
              }
            })
          }}
        />
      </Head>
      <PageComponent marketKey="india" />
    </>
  );
}
