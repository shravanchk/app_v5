import Head from 'next/head';
import HomePage from '../components/home/HomePage';

// Superseded by the live homepage ('/'); kept as a noindex mirror for review.
// The global Navbar is provided by _app.js, so this only renders HomePage.
export default function HomePreview() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <HomePage />
    </>
  );
}
