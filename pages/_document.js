import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SXZKYDXLKW" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              // Calculators keep their inputs in the query string so results can be
              // shared and bookmarked. Those inputs are salaries, loan balances and
              // debts, and page_location would otherwise carry them to Analytics on
              // every page_view. Keep only the attribution params we actually report
              // on and drop the rest before anything is sent.
              var UPAMAN_ANALYTICS_PARAMS = [
                'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ref'
              ];
              window.upamanCleanLocation = function () {
                try {
                  var url = new URL(window.location.href);
                  var kept = new URLSearchParams();
                  UPAMAN_ANALYTICS_PARAMS.forEach(function (key) {
                    var value = url.searchParams.get(key);
                    if (value) kept.set(key, value);
                  });
                  var query = kept.toString();
                  return url.origin + url.pathname + (query ? '?' + query : '');
                } catch (error) {
                  return window.location.origin + window.location.pathname;
                }
              };

              gtag('config', 'G-SXZKYDXLKW', {
                page_location: window.upamanCleanLocation()
              });
            `
          }}
        />
        <meta charSet="utf-8" />
        <meta name="google-adsense-account" content="ca-pub-3543327769912677" />
        <meta name="theme-color" content="#1d4e89" />
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
