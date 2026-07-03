import Head from 'next/head';
import PageComponent from '../components/tools/ToolsHub';

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Everyday Tools | Percentage, Tip, Age, Unit & JSON | Upaman</title>
        <meta
          name="description"
          content="Free everyday tools on Upaman: percentage calculator, tip calculator with bill split, age calculator, scientific and statistics calculators, unit converter, and JSON formatter."
        />
        <meta
          name="keywords"
          content="percentage calculator, tip calculator, age calculator, scientific calculator, statistics calculator, unit converter, JSON formatter, online tools"
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
