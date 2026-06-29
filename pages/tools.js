import Head from 'next/head';
import PageComponent from '../components/ToolsHub';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Everyday Tools | Age, Scientific, Statistics, Unit & JSON | Upaman</title>
        <meta
          name="description"
          content="Free everyday tools on Upaman: age calculator, scientific calculator, statistics calculator, unit converter, and JSON formatter. No sign-up required."
        />
        <meta
          name="keywords"
          content="age calculator, scientific calculator, statistics calculator, unit converter, JSON formatter, online tools"
        />
        <link rel="canonical" href="https://upaman.com/tools" />
        <meta property="og:title" content="Everyday Tools | Upaman" />
        <meta
          property="og:description"
          content="Handy region-agnostic utilities: age, scientific and statistics calculators, unit conversion, and JSON formatting."
        />
        <meta property="og:url" content="https://upaman.com/tools" />
        <meta property="og:type" content="website" />
      </Head>
      <PageComponent />
    </>
  );
}
