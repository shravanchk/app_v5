import { useRouter } from 'next/router';
import { useEffect } from 'react';
import SiteFooter from '../components/home/SiteFooter';
import Navbar from '../components/home/Navbar';
import '../styles/globals.css';
import '../styles/common.css';
import '../styles/adsense.css';

// AdSense loads on every content page; only the embeddable iframe widget and
// the 404 page are excluded. (Was an allowlist that went stale as calculators
// were added — new pages silently shipped without ads.)
const isAdEligible = (pathname) => !pathname.startsWith('/embed') && pathname !== '/404';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isEmbed = router.pathname.startsWith('/embed');
  const isHome = router.pathname === '/';
  // Global sticky navbar + unified footer everywhere except the embeddable iframe widget.
  const hideChrome = isEmbed;

  useEffect(() => {
    if (!isAdEligible(router.pathname)) return;

    // Dedupe marker uses id, not a data-* attribute: adsbygoogle.js warns about
    // unrecognized data-* attributes on its own script tag.
    if (document.getElementById('upaman-adsense')) return;

    const script = document.createElement('script');
    script.id = 'upaman-adsense';
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3543327769912677';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      window.adsenseLoaded = true;
    };
    script.onerror = () => {
      window.adsenseBlocked = true;
    };

    document.head.appendChild(script);
  }, [router.pathname]);

  return (
    <div style={{ minHeight: '100vh' }} className={!isHome && !isEmbed ? 'bg-slate-50 dark:bg-slate-950' : undefined}>
      {!hideChrome && <Navbar />}
      <Component {...pageProps} />
      {!hideChrome && <SiteFooter />}
    </div>
  );
}
