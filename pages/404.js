import Head from 'next/head';
import NotFoundPage from '../components/NotFoundPage';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found | Upaman</title>
        <meta name="description" content="The page you requested could not be found." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://upaman.com/404" />
        <meta property="og:url" content="https://upaman.com/404" />
      </Head>
      <NotFoundPage />
    </>
  );
}
