import Head from 'next/head';
import PageComponent from '../components/health/HealthCalculatorsHub';

const TOOLS = [
  { name: 'BMI Calculator', path: '/bmi-calculator' },
  { name: 'Calorie Calculator (TDEE)', path: '/calorie-calculator' },
  { name: 'BMR Calculator', path: '/bmr-calculator' },
  { name: 'Body Fat Calculator', path: '/body-fat-calculator' },
  { name: 'Period Calculator', path: '/period-calculator' },
  { name: 'Pregnancy Due Date Calculator', path: '/pregnancy-due-date-calculator' },
];

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Upaman health & fitness calculators',
  itemListElement: TOOLS.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    url: `https://upaman.com${t.path}`,
  })),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://upaman.com/' },
    { '@type': 'ListItem', position: 2, name: 'Health Calculators', item: 'https://upaman.com/health-calculators' },
  ],
};

export default function RoutePage() {
  return (
    <>
      <Head>
        <title>Health Calculators Hub | BMI, Calorie, Body Fat, Period, Due Date | Upaman</title>
        <meta
          name="description"
          content="Free health and fitness calculators on Upaman: BMI, daily calorie needs (TDEE), BMR, body fat percentage, period and ovulation predictions, and pregnancy due date."
        />
        <meta
          name="keywords"
          content="health calculators, BMI calculator, calorie calculator, TDEE calculator, BMR calculator, body fat calculator, period calculator, due date calculator"
        />
        <link rel="canonical" href="https://upaman.com/health-calculators" />
        <meta property="og:title" content="Health Calculators Hub | Upaman" />
        <meta
          property="og:description"
          content="BMI, calorie needs, BMR, body fat, period, and pregnancy due date calculators — free, with clear methods."
        />
        <meta property="og:url" content="https://upaman.com/health-calculators" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>
      <PageComponent />
    </>
  );
}
