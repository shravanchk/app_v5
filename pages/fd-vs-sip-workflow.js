import Head from 'next/head';
import PageComponent from '../components/workflow/FdVsSipWorkflow';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>FD vs SIP Calculator — Post-Tax Benefit Comparison | Upaman</title>
        <meta
          name="description"
          content="Compare fixed deposit vs SIP on post-tax maturity value. Models yearly slab tax on FD interest vs 12.5% LTCG with the ₹1.25 lakh exemption, with a horizon-aware verdict."
        />
        <meta
          name="keywords"
          content="fd vs sip calculator, fixed deposit vs sip, fd vs mutual fund, rd vs sip, post tax fd return, sip vs fd which is better"
        />
        <link rel="canonical" href="https://upaman.com/fd-vs-sip-workflow" />
        <meta property="og:title" content="FD vs SIP Calculator — Post-Tax Benefit Comparison | Upaman" />
        <meta
          property="og:description"
          content="One workflow to compare guaranteed FD interest against an equity SIP projection after tax, with a clear verdict for your horizon."
        />
        <meta property="og:url" content="https://upaman.com/fd-vs-sip-workflow" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FD vs SIP Calculator — Post-Tax Benefit Comparison | Upaman" />
        <meta
          name="twitter:description"
          content="See what an FD and a SIP each leave you after tax — yearly slab tax vs capital-gains tax — and get a horizon-aware verdict."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'FD vs SIP Benefit Workflow',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/fd-vs-sip-workflow',
              description: 'Compares fixed deposit and SIP outcomes on post-tax maturity value.',
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
