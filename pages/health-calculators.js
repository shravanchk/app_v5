import Head from 'next/head';
import PageComponent from '../components/HealthCalculatorsHub';

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
      </Head>
      <PageComponent />
    </>
  );
}
