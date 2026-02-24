import React, { useEffect, useState, useRef } from 'react';
import { adSenseManager, detectAdBlocker } from '../utils/adsenseUtils';

const AdSenseAd = ({ 
  adSlot = '1234567890', 
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {},
  className = '',
  showFallback = true
}) => {
  const [adStatus, setAdStatus] = useState({
    loading: true,
    blocked: false,
    loaded: false,
    error: null
  });
  
  const adRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    let timeoutId;

    const initializeAd = async () => {
      try {
        // Check for ad blockers first
        const isBlocked = await detectAdBlocker();
        if (isBlocked) {
          if (mountedRef.current) {
            setAdStatus({
              loading: false,
              blocked: true,
              loaded: false,
              error: 'Ad blocker detected'
            });
          }
          return;
        }

        // Initialize AdSense
        const result = await adSenseManager.initialize();
        
        if (!mountedRef.current) return;

        if (result.success && !result.blocked) {
          // Try to push the ad
          const pushed = adSenseManager.pushAd(adRef.current);
          
          setAdStatus({
            loading: false,
            blocked: false,
            loaded: pushed,
            error: pushed ? null : 'Failed to load ad'
          });

          // Set a timeout to mark as loaded if no error occurs
          timeoutId = setTimeout(() => {
            if (mountedRef.current) {
              setAdStatus(prev => ({
                ...prev,
                loading: false,
                loaded: true
              }));
            }
          }, 1000);
        } else {
          setAdStatus({
            loading: false,
            blocked: true,
            loaded: false,
            error: result.error?.message || 'AdSense blocked or failed'
          });
        }
      } catch (error) {
        if (mountedRef.current) {
          setAdStatus({
            loading: false,
            blocked: true,
            loaded: false,
            error: error.message
          });
        }
      }
    };

    initializeAd();

    return () => {
      mountedRef.current = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Fallback content for when ads are blocked or fail to load
  const FallbackContent = ({ reason = 'blocked' }) => {
    const isTestMode = typeof window !== 'undefined' && Boolean(window.adsenseTestMode);
    
    return (
      <div style={{
        ...style,
        minHeight: style.height || style.minHeight || '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        color: '#64748b',
        fontSize: '0.9rem',
        textAlign: 'center',
        padding: '1rem',
        position: 'relative'
      }}>
        <div>
          <div style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>
            {reason === 'loading' ? '⏳' : isTestMode ? '🔧' : '📊'}
          </div>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
            {reason === 'loading' 
              ? 'Loading Advertisement' 
              : isTestMode 
                ? 'AdSense Test Mode'
                : 'Support Free Tools'
            }
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            {reason === 'loading' 
              ? 'Please wait...'
              : isTestMode
                ? 'AdSense test mode is enabled'
                : 'Consider disabling ad blocker to support our free calculators'
            }
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (adStatus.loading) {
    return showFallback ? <FallbackContent reason="loading" /> : null;
  }

  // Show fallback if ads are blocked and fallback is enabled
  if (adStatus.blocked && showFallback) {
    return <FallbackContent reason="blocked" />;
  }

  // Don't render anything if ads are blocked and no fallback
  if (adStatus.blocked && !showFallback) {
    return null;
  }

  return (
    <div 
      className={`adsense-container ${className}`} 
      style={{ 
        position: 'relative',
        minHeight: style.height || style.minHeight || '90px',
        ...style 
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ 
          display: 'block',
          width: '100%',
          height: style.height || 'auto',
          minHeight: style.minHeight || '90px'
        }}
        data-ad-client="ca-pub-3543327769912677"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
      
      {/* Show loading indicator if ad hasn't loaded yet */}
      {!adStatus.loaded && !adStatus.error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(248, 250, 252, 0.8)',
          borderRadius: '8px',
          zIndex: 1
        }}>
          <div style={{ 
            color: '#94a3b8',
            fontSize: '0.9rem',
            animation: 'pulse 2s infinite'
          }}>
            Loading ad...
          </div>
        </div>
      )}

      {/* Error handling */}
      {adStatus.error && showFallback && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(248, 250, 252, 0.9)',
          borderRadius: '8px',
          zIndex: 1
        }}>
          <FallbackContent reason="error" />
        </div>
      )}
    </div>
  );
};

// Predefined ad configurations
export const AdFormats = {
  banner: {
    adFormat: 'horizontal',
    style: { height: '90px', minHeight: '90px' }
  },
  rectangle: {
    adFormat: 'rectangle', 
    style: { height: '250px', minHeight: '250px' }
  },
  sidebar: {
    adFormat: 'vertical',
    style: { height: '600px', width: '300px', minHeight: '600px' }
  },
  responsive: {
    adFormat: 'auto',
    style: { minHeight: '50px' }
  },
  leaderboard: {
    adFormat: 'horizontal',
    style: { height: '90px', maxWidth: '728px', minHeight: '90px' }
  },
  mobile_banner: {
    adFormat: 'horizontal',
    style: { height: '50px', minHeight: '50px' }
  },
  large_rectangle: {
    adFormat: 'rectangle',
    style: { height: '280px', width: '336px', minHeight: '280px' }
  }
};

export default AdSenseAd;
