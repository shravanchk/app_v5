import Head from 'next/head';
import PageComponent from '../components/EUCalculatorsHub';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>EU & UK Calculators Hub | VAT, Salary, Income Tax | Upaman</title>
        <meta
          name="description"
          content="Explore EU and UK calculators on Upaman: VAT, European salary, UK income tax, Germany salary, France salary, and Netherlands salary estimation tools."
        />
        <meta
          name="keywords"
          content="EU calculators hub, UK calculators hub, European VAT calculator, European salary calculator, UK income tax calculator, Germany salary calculator, France salary calculator, Netherlands salary calculator"
        />
        <link rel="canonical" href="https://upaman.com/eu-calculators" />
        <meta property="og:title" content="EU & UK Calculators Hub | Upaman" />
        <meta
          property="og:description"
          content="Europe-focused calculators for VAT, UK tax, and country-specific net salary estimation for Germany, France, and Netherlands."
        />
        <meta property="og:url" content="https://upaman.com/eu-calculators" />
        <meta property="og:type" content="website" />
      </Head>
      <PageComponent />
    </>
  );
}
