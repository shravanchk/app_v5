import Head from 'next/head';
import PageComponent from '../components/workflow/RentVsBuyWorkflow';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Rent vs Buy Decision Workflow | Upaman</title>
        <meta
          name="description"
          content="Compare renting vs buying with monthly affordability, break-even timeline, closing costs, and a guided action plan across India, US, and EU/UK scenarios."
        />
        <meta
          name="keywords"
          content="rent vs buy workflow, rent vs buy calculator, home buying decision, break-even housing tool, should I rent or buy"
        />
        <link rel="canonical" href="https://upaman.com/rent-vs-buy-workflow" />
        <meta property="og:title" content="Rent vs Buy Decision Workflow | Upaman" />
        <meta
          property="og:description"
          content="Use a guided workflow to compare monthly cost, break-even year, and flexibility before deciding whether to rent or buy."
        />
        <meta property="og:url" content="https://upaman.com/rent-vs-buy-workflow" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rent vs Buy Decision Workflow | Upaman" />
        <meta
          name="twitter:description"
          content="Compare rent and buy scenarios with affordability checks, break-even logic, and a practical action plan."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Rent vs Buy Decision Workflow',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/rent-vs-buy-workflow',
              description: 'Guided housing decision workflow for comparing rent vs buy cash flow and break-even.',
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
