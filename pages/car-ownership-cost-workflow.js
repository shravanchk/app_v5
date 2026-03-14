import Head from 'next/head';
import PageComponent from '../components/CarOwnershipCostWorkflow';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Car Ownership Cost Workflow | Fuel Expense Calculator | Upaman</title>
        <meta
          name="description"
          content="Estimate true monthly car cost with fuel expense, EMI, insurance, maintenance, parking, tolls, depreciation, and a lower-cost commute comparison."
        />
        <meta
          name="keywords"
          content="fuel expense calculator, car cost calculator, commute fuel cost, car ownership cost, monthly transport budget, car expense workflow"
        />
        <link rel="canonical" href="https://upaman.com/car-ownership-cost-workflow" />
        <meta property="og:title" content="Car Ownership Cost Workflow | Upaman" />
        <meta
          property="og:description"
          content="See what your car really costs each month after fuel, upkeep, EMI, and insurance, then compare it with a cheaper commute path."
        />
        <meta property="og:url" content="https://upaman.com/car-ownership-cost-workflow" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Car Ownership Cost Workflow | Upaman" />
        <meta
          name="twitter:description"
          content="Compare fuel-only cost with true car ownership cost and a cheaper commute benchmark before locking your monthly budget."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Car Ownership Cost Workflow',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/car-ownership-cost-workflow',
              description: 'Transport budgeting workflow with fuel expense, car ownership cost, and commute comparison.',
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
