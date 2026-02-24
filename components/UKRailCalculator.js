import React, { useState, useEffect } from 'react';
import { Train, MapPin, Clock, AlertCircle, Search, PoundSterling, ArrowRight, Users } from 'lucide-react';
import Head from 'next/head';
import HomeButton from './HomeButton';
import { formatCurrency } from '../utils/calculations';

// CSS animations for trains and UI
const trainAnimationStyles = `
  @keyframes trainMove {
    0% { transform: translateX(-100px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateX(calc(100vw + 100px)); opacity: 0; }
  }

  @keyframes trainPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes cloudFloat {
    0% { transform: translateX(-50px); }
    100% { transform: translateX(calc(100vw + 50px)); }
  }

  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .train-animation {
    animation: trainMove 15s infinite linear;
    animation-delay: 5s;
  }

  .train-pulse {
    animation: trainPulse 3s infinite ease-in-out;
  }

  .cloud-float {
    animation: cloudFloat 30s infinite linear;
  }

  .fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
  }

  .shimmer-effect {
    position: relative;
    overflow: hidden;
  }

  .shimmer-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 2s infinite;
  }
`;

// Inject styles once in browser environments.
if (typeof document !== 'undefined' && !document.getElementById('train-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'train-animations';
  styleSheet.textContent = trainAnimationStyles;
  document.head.appendChild(styleSheet);
}

const UKRailCalculator = ({ isDarkMode: appIsDarkMode }) => {
  const [localIsDarkMode, setLocalIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [journeyResults, setJourneyResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stationSuggestions, setStationSuggestions] = useState({ from: [], to: [] });
  const [apiToken, setApiToken] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('ukRailApiToken') || '';
  });
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [recentRoutes, setRecentRoutes] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('ukRailRecentRoutes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const isDarkMode = typeof appIsDarkMode === 'boolean' ? appIsDarkMode : localIsDarkMode;

  // Popular UK railway stations with their CRS codes
  const popularStations = {
    'London Paddington': 'PAD',
    'London Victoria': 'VIC',
    'London Waterloo': 'WAT',
    'London King\'s Cross': 'KGX',
    'London Liverpool Street': 'LST',
    'London Euston': 'EUS',
    'London St Pancras': 'STP',
    'Birmingham New Street': 'BHM',
    'Manchester Piccadilly': 'MAN',
    'Edinburgh Waverley': 'EDB',
    'Glasgow Central': 'GLC',
    'Leeds': 'LDS',
    'Liverpool Lime Street': 'LIV',
    'Newcastle': 'NCL',
    'Bristol Temple Meads': 'BRI',
    'Cardiff Central': 'CDF',
    'Reading': 'RDG',
    'Brighton': 'BTN',
    'Oxford': 'OXF',
    'Cambridge': 'CBG',
    'York': 'YRK',
    'Bath Spa': 'BTH',
    'Exeter St Davids': 'EXD',
    'Plymouth': 'PLY',
    'Southampton Central': 'SOU',
    'Portsmouth & Southsea': 'PMS',
    'Nottingham': 'NOT',
    'Sheffield': 'SHF',
    'Hull': 'HUL',
    'Preston': 'PRE',
    'Coventry': 'COV',
    'Bournemouth': 'BMH',
    'Chester': 'CTR',
    'Derby': 'DBY',
    'Gloucester': 'GCR',
    'Ipswich': 'IPS',
    'Lincoln': 'LCN',
    'Norwich': 'NRW',
    'Peterborough': 'PBO',
    'Salisbury': 'SAL',
    'Swansea': 'SWA',
    'Truro': 'TRU',
    'Warwick': 'WRW',
    'Winchester': 'WIN',
    'Wolverhampton': 'WVH',
    'Worcester': 'WOS'
  };

  // Rough fare estimates based on distance (£/mile approximation)
  const estimateFare = (distance) => {
    if (distance < 50) return { peak: distance * 0.4, offPeak: distance * 0.3 };
    if (distance < 100) return { peak: distance * 0.35, offPeak: distance * 0.25 };
    if (distance < 200) return { peak: distance * 0.3, offPeak: distance * 0.22 };
    return { peak: distance * 0.25, offPeak: distance * 0.18 };
  };

  // Rough distance calculation (simplified)
  const estimateDistance = (from, to) => {
    const distances = {
      'PAD-BHM': 118, 'PAD-MAN': 163, 'PAD-EDB': 393, 'PAD-GLC': 401,
      'VIC-BTN': 47, 'VIC-BRI': 106, 'VIC-CDF': 145,
      'KGX-YRK': 188, 'KGX-EDB': 393, 'KGX-LDS': 185,
      'EUS-BHM': 112, 'EUS-MAN': 184, 'EUS-LIV': 178, 'EUS-GLC': 401,
      'WAT-SOU': 79, 'WAT-BMH': 108, 'WAT-EXD': 171
    };
    
    const key1 = `${from}-${to}`;
    const key2 = `${to}-${from}`;
    
    return distances[key1] || distances[key2] || Math.floor(Math.random() * 200) + 50;
  };

  const createEstimatedServices = (fromName, toName, toCRS) => {
    const now = new Date();

    return Array.from({ length: 5 }, (_, idx) => {
      const minutes = 15 + idx * 20;
      const dep = new Date(now.getTime() + minutes * 60000);

      return {
        std: dep.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        etd: idx === 2 ? 'Delayed' : 'On time',
        platform: `${(idx % 8) + 1}`,
        operator: ['LNER', 'Avanti West Coast', 'Great Western Railway', 'CrossCountry', 'ScotRail'][idx % 5],
        service: `EST${200 + idx}`,
        length: 6 + (idx % 5),
        destination: [{ locationName: toName, crs: toCRS }]
      };
    });
  };

  const buildJourneyResults = ({
    services,
    fromCRS,
    toCRS,
    resolvedFrom,
    resolvedTo,
    mode = 'live'
  }) => {
    const distance = estimateDistance(fromCRS, toCRS);
    const fareEstimate = estimateFare(distance);

    return {
      services: services.slice(0, 5),
      fromStation: resolvedFrom || fromStation,
      toStation: resolvedTo || toStation,
      distance,
      fareEstimate,
      searchTime: new Date().toLocaleTimeString(),
      mode
    };
  };

  const saveRecentRoute = (from, to) => {
    const route = {
      from,
      to,
      updatedAt: new Date().toISOString()
    };

    setRecentRoutes(prev => {
      const filtered = prev.filter(item => !(item.from === from && item.to === to));
      const next = [route, ...filtered].slice(0, 6);
      localStorage.setItem('ukRailRecentRoutes', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const syncTheme = () => {
      setLocalIsDarkMode(localStorage.getItem('theme') === 'dark');
    };

    window.addEventListener('upaman-theme-change', syncTheme);
    window.addEventListener('storage', syncTheme);

    return () => {
      window.removeEventListener('upaman-theme-change', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const getCRSCode = (stationName) => {
    return popularStations[stationName] || stationName.toUpperCase().replace(/\s+/g, '').slice(0, 3);
  };

  const getStationSuggestions = (query, type) => {
    if (!query || query.length < 2) {
      setStationSuggestions(prev => ({ ...prev, [type]: [] }));
      return;
    }

    const filtered = Object.keys(popularStations)
      .filter(station => station.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
    
    setStationSuggestions(prev => ({ ...prev, [type]: filtered }));
  };

  const searchTrains = async () => {
    if (!fromStation.trim() || !toStation.trim()) {
      setError('Please enter both departure and destination stations');
      return;
    }

    const fromCRS = getCRSCode(fromStation);
    const toCRS = getCRSCode(toStation);

    // Useful mode even without API token/back-end proxy.
    if (!apiToken.trim()) {
      const estimatedJourney = buildJourneyResults({
        services: createEstimatedServices(fromStation, toStation, toCRS),
        fromCRS,
        toCRS,
        resolvedFrom: fromStation,
        resolvedTo: toStation,
        mode: 'estimate'
      });

      setJourneyResults(estimatedJourney);
      saveRecentRoute(fromStation, toStation);
      setError('ℹ️ Smart Estimate Mode: Add a National Rail token to try live departures.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let apiUrl;
      let data;
      let fallbackMessage = '';
      
      try {
        apiUrl = `https://huxley2.azurewebsites.net/next/${fromCRS}/to/${toCRS}?accessToken=${apiToken}&expand=true`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'UpamanRailCalculator/1.0'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`Huxley API Error: ${response.status}`);
        }
        data = await response.json();
      } catch (liveDataError) {
        // Fall back to estimate mode when live endpoint is blocked/unavailable.
        data = {
          locationName: fromStation,
          trainServices: createEstimatedServices(fromStation, toStation, toCRS)
        };
        fallbackMessage = 'ℹ️ Live railway data unavailable. Showing Smart Estimate Mode.';
      }
      
      if (data.trainServices && data.trainServices.length > 0) {
        setJourneyResults(buildJourneyResults({
          services: data.trainServices,
          fromCRS,
          toCRS,
          resolvedFrom: data.locationName || fromStation,
          resolvedTo: toStation,
          mode: fallbackMessage ? 'estimate' : 'live'
        }));
        saveRecentRoute(fromStation, toStation);

        if (fallbackMessage) {
          setError(fallbackMessage);
        } else {
          setError('');
        }
      } else if (data.nrccMessages && data.nrccMessages.length > 0 && data.nrccMessages[0].message) {
        const estimatedJourney = buildJourneyResults({
          services: createEstimatedServices(fromStation, toStation, toCRS),
          fromCRS,
          toCRS,
          resolvedFrom: fromStation,
          resolvedTo: toStation,
          mode: 'estimate'
        });
        setJourneyResults(estimatedJourney);
        saveRecentRoute(fromStation, toStation);
        setError(`Station/Route Warning: ${data.nrccMessages[0].message}. Showing Smart Estimate Mode.`);
      } else if (data.locationName && !data.trainServices) {
        const estimatedJourney = buildJourneyResults({
          services: createEstimatedServices(fromStation, toStation, toCRS),
          fromCRS,
          toCRS,
          resolvedFrom: fromStation,
          resolvedTo: toStation,
          mode: 'estimate'
        });
        setJourneyResults(estimatedJourney);
        saveRecentRoute(fromStation, toStation);
        setError(`No direct trains found between ${fromStation} and ${toStation}. Showing Smart Estimate Mode.`);
      } else {
        setError(`Station not found: Please check if "${fromStation}" and "${toStation}" are valid UK railway stations.`);
      }
    } catch (err) {
      console.error('Full API Error:', err);

      const estimatedJourney = buildJourneyResults({
        services: createEstimatedServices(fromStation, toStation, toCRS),
        fromCRS,
        toCRS,
        resolvedFrom: fromStation,
        resolvedTo: toStation,
        mode: 'estimate'
      });
      setJourneyResults(estimatedJourney);
      saveRecentRoute(fromStation, toStation);
      setError(`⚠️ Live data error: ${err.message}. Showing Smart Estimate Mode.`);
    } finally {
      setLoading(false);
    }
  };

  const selectStation = (station, type) => {
    if (type === 'from') {
      setFromStation(station);
      setStationSuggestions(prev => ({ ...prev, from: [] }));
    } else {
      setToStation(station);
      setStationSuggestions(prev => ({ ...prev, to: [] }));
    }
  };

  const swapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const testApiToken = async () => {
    if (!apiToken.trim()) {
      setError('Please enter your API token first');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const testUrl = `https://huxley2.azurewebsites.net/departures/PAD?accessToken=${apiToken}`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'UpamanRailCalculator/1.0'
        },
        mode: 'cors' // Explicitly set CORS mode
      });

      if (response.ok) {
        await response.json();
        setError('✅ API token is valid! You can now search for trains.');
      } else {
        const errorText = await response.text();
        if (response.status === 401) {
          setError('❌ Invalid API token. Please check your National Rail token.');
        } else if (response.status === 403) {
          setError('❌ Access denied. Please ensure your token is active.');
        } else {
          setError(`❌ API test failed: ${response.status} - ${errorText}`);
        }
      }
    } catch (err) {
      console.error('Token test error:', err);
      
      // More specific CORS error handling
      if (err.message.includes('Failed to fetch') || err.message.includes('CORS')) {
        setError(`🌐 CORS/Network Issue: The browser is blocking the API request. This is common with railway APIs. The token appears valid but we need to use a different method.`);
      } else {
        setError(`❌ Network error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTokenInstructions = () => (
    <div style={{
      background: isDarkMode ? '#1e293b' : '#f8fafc',
      border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', color: isDarkMode ? '#60a5fa' : '#2563eb' }}>
        🔑 Optional Live API Token
      </h4>
      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
        You can use this planner without a token in Smart Estimate Mode.
        Add your token only if you want to attempt live departures.
      </p>
      <details style={{ fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        <summary style={{ cursor: 'pointer', fontWeight: '500', marginBottom: '0.5rem' }}>
          Want to use your own token? Click here for instructions
        </summary>
        <ol style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.875rem' }}>
          <li>Visit <a href="https://realtime.nationalrail.co.uk/OpenLDBWSRegistration/Registration" target="_blank" rel="noopener noreferrer" style={{ color: isDarkMode ? '#60a5fa' : '#2563eb' }}>National Rail Registration</a></li>
          <li>Fill out the simple form (select "Personal/Educational")</li>
          <li>Receive your token via email instantly</li>
          <li>Replace the token above with your personal one</li>
        </ol>
      </details>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 70%, #475569 100%)'
        : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #7dd3fc 70%, #38bdf8 100%)',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Head>
        <title>UK Rail Journey Planner & Live Train Times | Real-Time Departures Calculator</title>
        <meta
          name="description"
          content="Find UK train times, compare rail fares, and plan journeys with real-time departure boards. Get live platform information, delays, and ticket price estimates for all British railway stations including London, Birmingham, Manchester, Edinburgh."
        />
        <meta
          name="keywords"
          content="UK rail journey planner, train times calculator, British rail departures, live train times UK, railway fare calculator, National Rail departures, train platform information, UK station departures, London train times, train delay checker, rail ticket prices UK, train journey planner, British railway calculator, train fare estimator"
        />
        <link rel="canonical" href="https://upaman.com/uk-rail-calculator" />
        <meta property="og:title" content="UK Rail Journey Planner | Live Train Times & Fare Calculator" />
        <meta
          property="og:description"
          content="Plan your UK rail journey with real-time train departures, platform information, and fare estimates. Covering all major British railway stations."
        />
        <meta property="og:url" content="https://upaman.com/uk-rail-calculator" />
        <meta property="og:image" content="https://upaman.com/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="UK Rail Journey Planner | Live Train Times" />
        <meta
          name="twitter:description"
          content="Real-time UK train departures, platform info, and fare estimates for all British railway stations."
        />
        <meta name="twitter:image" content="https://upaman.com/logo512.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'UK Rail Journey Planner',
              description: 'Plan UK rail journeys with real-time departure boards, live train times, and fare estimates',
              url: 'https://upaman.com/uk-rail-calculator',
              applicationCategory: 'TransportationApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'GBP'
              },
              featureList: [
                'Real-time train departures',
                'Live platform information',
                'Fare estimation calculator',
                'Delay notifications',
                'UK railway station search',
                'Journey planning tools'
              ],
              provider: {
                '@type': 'Organization',
                name: 'Upaman Tools'
              }
            })
          }}
        />
      </Head>
      
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {/* Animated Train */}
        <div 
          className="train-animation"
          style={{
            position: 'absolute',
            top: '20%',
            fontSize: '2rem',
            color: isDarkMode ? '#60a5fa' : '#1d4ed8',
            zIndex: 2
          }}
        >
          🚄
        </div>

        {/* Floating Clouds */}
        <div 
          className="cloud-float"
          style={{
            position: 'absolute',
            top: '10%',
            fontSize: '1.5rem',
            animationDelay: '0s'
          }}
        >
          ☁️
        </div>
        <div 
          className="cloud-float"
          style={{
            position: 'absolute',
            top: '15%',
            fontSize: '1rem',
            animationDelay: '8s'
          }}
        >
          ☁️
        </div>
        <div 
          className="cloud-float"
          style={{
            position: 'absolute',
            top: '25%',
            fontSize: '1.2rem',
            animationDelay: '15s'
          }}
        >
          ☁️
        </div>

        {/* Railway Track Pattern */}
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: '0',
          width: '100%',
          height: '2px',
          background: isDarkMode 
            ? 'repeating-linear-gradient(to right, #374151 0px, #374151 20px, transparent 20px, transparent 40px)'
            : 'repeating-linear-gradient(to right, #94a3b8 0px, #94a3b8 20px, transparent 20px, transparent 40px)',
          opacity: 0.3
        }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <HomeButton isDarkMode={isDarkMode} />
      
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div className="fade-in-up" style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div className="train-pulse" style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '12px',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
            }}>
              <Train size={28} color="white" />
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: 0,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              🚂 UK Rail Journey Planner
            </h1>
          </div>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Real-time train departures, journey planning & fare estimates
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginTop: '0.75rem',
            padding: '0.35rem 0.7rem',
            borderRadius: '999px',
            border: `1px solid ${isDarkMode ? '#f59e0b55' : '#f59e0b'}`,
            background: isDarkMode ? 'rgba(245, 158, 11, 0.14)' : '#fffbeb',
            color: isDarkMode ? '#fcd34d' : '#92400e',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            Beta
            <span style={{ fontWeight: 500 }}>Smart estimates always available; live boards depend on API/network access.</span>
          </div>
        </div>

        {/* API Token Input - Only show if user wants to change token */}
        {showTokenInput ? (
          <div style={{
            background: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: isDarkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
          }}>
            {getTokenInstructions()}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                placeholder="Enter your National Rail API token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: isDarkMode ? '#374151' : 'white',
                  color: isDarkMode ? '#f3f4f6' : '#1f2937',
                  fontSize: '1rem'
                }}
              />
              <button
                onClick={testApiToken}
                disabled={!apiToken.trim() || loading}
                style={{
                  background: apiToken.trim() && !loading ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: apiToken.trim() && !loading ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                {loading ? 'Testing...' : 'Test Token'}
              </button>
              <button
                onClick={() => {
                  const trimmed = apiToken.trim();
                  if (trimmed) {
                    localStorage.setItem('ukRailApiToken', trimmed);
                    setError('✅ API token saved. Live departures will be tried on your next search.');
                  } else {
                    localStorage.removeItem('ukRailApiToken');
                    setError('ℹ️ Token cleared. Searches will use Smart Estimate Mode.');
                  }
                  setShowTokenInput(false);
                }}
                disabled={loading}
                style={{
                  background: !loading ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: !loading ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                {apiToken.trim() ? 'Save Token' : 'Use Offline Mode'}
              </button>
            </div>
          </div>
        ) : (
          // Show smart mode / live mode indicator
          <div style={{
            background: isDarkMode ? '#0f172a' : '#f0fdf4',
            border: `1px solid ${isDarkMode ? '#f59e0b30' : '#f59e0b'}`,
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                ⚠
              </div>
              <div>
                <div style={{ 
                  fontWeight: '600', 
                  color: isDarkMode ? '#f59e0b' : '#d97706',
                  fontSize: '0.95rem'
                }}>
                  {apiToken.trim() ? '🚂 Live + Smart Fallback Mode' : '🚂 Smart Estimate Mode Active'}
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  marginTop: '0.25rem'
                }}>
                  {apiToken.trim()
                    ? 'The planner will try live departures first and switch to smart estimates if blocked.'
                    : 'No token needed. You can plan routes with smart estimated departures and fares immediately.'}
                </div>
              </div>
            </div>
            
            <div style={{
              background: isDarkMode ? '#1e293b' : '#fffbeb',
              border: `1px solid ${isDarkMode ? '#374151' : '#fed7aa'}`,
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: isDarkMode ? '#f59e0b' : '#d97706' }}>
                📋 Real-Time Upgrade (Optional):
              </div>
              <div style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                1. Add your National Rail API token in Token Settings<br />
                2. Live data will be used when CORS/network allows it<br />
                3. Automatic fallback keeps planning available if live calls fail
              </div>
            </div>
            
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowTokenInput(true)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  fontSize: '0.75rem'
                }}
              >
                View Token Settings
              </button>
            </div>
          </div>
        )}

        {/* Journey Search Form */}
        <div className="fade-in-up" style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: isDarkMode 
            ? '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
            : '0 20px 50px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
          position: 'relative'
        }}>
          
          {/* Form Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            justifyContent: 'center'
          }}>
            <div className="train-pulse" style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animationDelay: '1s'
            }}>
              <Search size={16} color="white" />
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '600',
              color: isDarkMode ? '#e2e8f0' : '#1e293b'
            }}>
              Plan Your Journey
            </h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr auto',
            gap: '1rem',
            alignItems: 'end'
          }}>
            {/* From Station */}
            <div style={{ position: 'relative' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: isDarkMode ? '#f1f5f9' : '#334155',
                fontSize: '0.95rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={12} color="white" />
                </div>
                Departure Station
              </label>
              <input
                type="text"
                placeholder="🚉 e.g., London Paddington"
                value={fromStation}
                onChange={(e) => {
                  setFromStation(e.target.value);
                  getStationSuggestions(e.target.value, 'from');
                }}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: `2px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)' 
                    : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                  color: isDarkMode ? '#f3f4f6' : '#1f2937',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                  ':focus': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDarkMode ? '#475569' : '#e2e8f0';
                  e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
                }}
              />
              
              {/* From Station Suggestions */}
              {stationSuggestions.from.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: isDarkMode ? '#374151' : 'white',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  marginTop: '0.25rem',
                  zIndex: 10,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {stationSuggestions.from.map((station) => (
                    <div
                      key={station}
                      onClick={() => selectStation(station, 'from')}
                      style={{
                        padding: '0.75rem',
                        borderBottom: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      {station} ({popularStations[station]})
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <button
              onClick={swapStations}
              style={{
                background: isDarkMode ? '#4b5563' : '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '1.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDarkMode ? '#6b7280' : '#e5e7eb';
                e.target.style.transform = 'rotate(180deg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = isDarkMode ? '#4b5563' : '#f3f4f6';
                e.target.style.transform = 'rotate(0deg)';
              }}
            >
              <ArrowRight size={20} color={isDarkMode ? '#f3f4f6' : '#374151'} />
            </button>

            {/* To Station */}
            <div style={{ position: 'relative' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: isDarkMode ? '#f1f5f9' : '#334155'
              }}>
                <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                To Station
              </label>
              <input
                type="text"
                placeholder="e.g., Birmingham New Street"
                value={toStation}
                onChange={(e) => {
                  setToStation(e.target.value);
                  getStationSuggestions(e.target.value, 'to');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  background: isDarkMode ? '#374151' : 'white',
                  color: isDarkMode ? '#f3f4f6' : '#1f2937',
                  fontSize: '1rem'
                }}
              />
              
              {/* To Station Suggestions */}
              {stationSuggestions.to.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: isDarkMode ? '#374151' : 'white',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  marginTop: '0.25rem',
                  zIndex: 10,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {stationSuggestions.to.map((station) => (
                    <div
                      key={station}
                      onClick={() => selectStation(station, 'to')}
                      style={{
                        padding: '0.75rem',
                        borderBottom: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      {station} ({popularStations[station]})
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={searchTrains}
              disabled={loading}
              style={{
                background: loading 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2rem',
                fontWeight: '600',
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '1.5rem',
                boxShadow: loading 
                  ? '0 4px 12px rgba(0,0,0,0.1)' 
                  : '0 8px 32px rgba(59, 130, 246, 0.3)',
                transform: 'scale(1)',
                position: 'relative',
                minHeight: '56px',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Searching Trains...
                </>
              ) : (
                <>
                  <Search size={20} />
                  🚄 Find Trains
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Journey Results */}
        {journeyResults && (
          <div style={{
            background: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: isDarkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
          }}>
            {/* Journey Header */}
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              paddingBottom: '1rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: isDarkMode ? '#f1f5f9' : '#1f2937'
              }}>
                {fromStation} → {toStation}
              </h3>
              <div style={{
                display: 'flex',
                gap: '2rem',
                fontSize: '0.875rem',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                <div>Distance: ~{journeyResults.distance} miles</div>
                <div>Updated: {journeyResults.searchTime}</div>
              </div>
            </div>

            {/* Fare Estimates */}
            <div style={{
              background: isDarkMode ? '#0f172a' : '#f8fafc',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{
                margin: '0 0 0.75rem 0',
                fontSize: '1rem',
                fontWeight: '600',
                color: isDarkMode ? '#60a5fa' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <PoundSterling size={16} />
                Estimated Fares
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Peak Time</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                    {formatCurrency(journeyResults.fareEstimate.peak, 'GBP')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Off-Peak</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                    {formatCurrency(journeyResults.fareEstimate.offPeak, 'GBP')}
                  </div>
                </div>
              </div>
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.75rem',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                *Estimates based on distance. Actual fares may vary by operator and ticket type.
              </p>
            </div>

            {/* Train Services */}
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              fontWeight: '600',
              color: isDarkMode ? '#60a5fa' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock size={16} />
              Next Departures
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {journeyResults.services.map((service, index) => (
                <div
                  key={index}
                  style={{
                    background: isDarkMode ? '#0f172a' : '#f8fafc',
                    borderRadius: '8px',
                    padding: '1rem',
                    border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Departure</div>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '600', 
                        color: service.etd === 'On time' ? '#22c55e' : service.etd === 'Cancelled' ? '#ef4444' : '#f59e0b' 
                      }}>
                        {service.std} {service.etd !== 'On time' && `(${service.etd})`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Platform</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '600', color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                        {service.platform || 'TBA'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Operator</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                        {service.operator}
                      </div>
                    </div>
                    <div style={{
                      background: service.length ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#6b7280',
                      color: 'white',
                      borderRadius: '6px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Users size={12} />
                      {service.length ? `${service.length} cars` : 'TBA'}
                    </div>
                  </div>
                  
                  {service.destination && service.destination.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      Destination: {service.destination.map(dest => dest.locationName).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Routes */}
        {recentRoutes.length > 0 && (
          <div style={{
            marginTop: '2rem',
            background: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: isDarkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: isDarkMode ? '#f1f5f9' : '#1f2937'
            }}>
              Recent Routes
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '0.75rem'
            }}>
              {recentRoutes.map((route, index) => (
                <button
                  key={`${route.from}-${route.to}-${index}`}
                  onClick={() => {
                    setFromStation(route.from);
                    setToStation(route.to);
                  }}
                  style={{
                    background: isDarkMode ? '#0f172a' : '#f8fafc',
                    border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: isDarkMode ? '#f1f5f9' : '#1f2937'
                  }}>
                    {route.from} → {route.to}
                  </div>
                  <div style={{
                    marginTop: '0.25rem',
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#94a3b8' : '#64748b'
                  }}>
                    Tap to refill route
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Routes */}
        <div style={{
          marginTop: '2rem',
          background: isDarkMode ? '#1e293b' : 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: isDarkMode 
            ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: isDarkMode ? '#f1f5f9' : '#1f2937'
          }}>
            Popular UK Rail Routes
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '0.75rem'
          }}>
            {[
              ['London Paddington', 'Birmingham New Street'],
              ['London King\'s Cross', 'Edinburgh Waverley'],
              ['London Euston', 'Manchester Piccadilly'],
              ['London Victoria', 'Brighton'],
              ['London Waterloo', 'Southampton Central'],
              ['Birmingham New Street', 'Glasgow Central']
            ].map(([from, to], index) => (
              <button
                key={index}
                onClick={() => {
                  setFromStation(from);
                  setToStation(to);
                }}
                style={{
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = isDarkMode ? '#1e293b' : '#f0f9ff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0';
                  e.target.style.background = isDarkMode ? '#0f172a' : '#f8fafc';
                }}
              >
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: isDarkMode ? '#f1f5f9' : '#1f2937',
                  marginBottom: '0.25rem'
                }}>
                  {from.split(' ')[0]} → {to.split(' ')[0]}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: isDarkMode ? '#94a3b8' : '#64748b'
                }}>
                  Click to search this route
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: isDarkMode ? '#94a3b8' : '#64748b'
        }}>
          <strong>Disclaimer:</strong> This calculator provides estimated fares and uses real-time data from National Rail. 
          Actual ticket prices may vary based on advance booking, railcards, and operator-specific pricing. 
          Always check official sources before travel. Powered by National Rail Enquiries API.
        </div>
      </div>
      </div>

      {/* CSS Animation for loading spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default UKRailCalculator;
