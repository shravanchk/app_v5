import Head from 'next/head';
import PageComponent from '../components/workflow/RetirementReadinessWorkflow';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Retirement Readiness Calculator (US) — Are You on Track? | Upaman</title>
        <meta
          name="description"
          content="Project your 401(k), IRA, and savings to retirement, compare them with what your lifestyle actually requires, and get the exact extra monthly amount that closes any gap."
        />
        <meta
          name="keywords"
          content="retirement calculator, am i on track for retirement, how much do i need to retire, retirement readiness calculator, retirement savings calculator"
        />
        <link rel="canonical" href="https://upaman.com/us-retirement-readiness-workflow" />
        <meta property="og:title" content="Retirement Readiness Calculator (US) — Are You on Track? | Upaman" />
        <meta
          property="og:description"
          content="Inflation-aware retirement number vs your projected savings, with a readiness score and a concrete monthly plan."
        />
        <meta property="og:url" content="https://upaman.com/us-retirement-readiness-workflow" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Retirement Readiness Calculator (US) — Are You on Track? | Upaman" />
        <meta
          name="twitter:description"
          content="How big a nest egg does your lifestyle need — and are your savings on track to build it?"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'US Retirement Readiness Workflow',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/us-retirement-readiness-workflow',
              description: 'Compares the retirement corpus a lifestyle requires with the corpus current savings will produce.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
      </Head>
      <PageComponent marketKey="us" />
    </>
  );
}
