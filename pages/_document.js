import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#e44004" />
        <link rel="icon" type="image/svg+xml" href="/upaman-elephant-logo.svg?v=20260223a" />
        <link rel="shortcut icon" type="image/svg+xml" href="/upaman-elephant-logo.svg?v=20260223a" />
        <link rel="apple-touch-icon" href="/upaman-elephant-logo.svg?v=20260223a" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
