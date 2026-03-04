import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Footer from '../components/Footer';
import '../styles/globals.css';
import '../styles/common.css';
import '../styles/adsense.css';

const AD_ELIGIBLE_ROUTES = new Set([
  '/',
  '/age-calculator',
  '/credit-card-analyzer',
  '/credit-card-trap-calculator',
  '/eu-vat-calculator',
  '/european-salary-calculator',
  '/france-salary-calculator',
  '/germany-salary-calculator',
  '/gst-calculator',
  '/income-tax-calculator',
  '/irctc-calculator',
  '/json-tools',
  '/loan-calculator',
  '/netherlands-salary-calculator',
  '/ppf-calculator',
  '/salary-calculator',
  '/scientific-calculator',
  '/sip-calculator',
  '/statistics-calculator',
  '/unit-converter',
  '/uk-income-tax-calculator',
  '/uk-rail-calculator',
  '/us-401k-calculator',
  '/us-auto-loan-calculator',
  '/us-credit-card-payoff-calculator',
  '/us-mortgage-calculator',
  '/us-refinance-calculator',
  '/us-savings-cd-calculator'
]);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const hideFooter = router.pathname === '/';

  useEffect(() => {
    if (!AD_ELIGIBLE_ROUTES.has(router.pathname)) return;

    const existingScript = document.querySelector('script[data-upaman-adsense="true"]');
    if (existingScript) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3543327769912677';
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-upaman-adsense', 'true');
    script.onload = () => {
      window.adsenseLoaded = true;
    };
    script.onerror = () => {
      window.adsenseBlocked = true;
    };

    document.head.appendChild(script);
  }, [router.pathname]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Component {...pageProps} />
      {!hideFooter && <Footer />}
    </div>
  );
}
