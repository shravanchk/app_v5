import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Clock, Train,  CalendarDays } from 'lucide-react';
import Head from 'next/head';
import HomeButton from './HomeButton';
import SearchLandingSections from './calculator/SearchLandingSections';

const IRCTCCalculator = () => {
  const [journeyDate, setJourneyDate] = useState('');
  const [passengerType, setPassengerType] = useState('general');
  const [trainType, setTrainType] = useState('mail-express');
  const [bookingResults, setBookingResults] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Booking rules based on IRCTC guidelines (effective from Nov 1, 2024)
  const bookingRules = useMemo(() => ({
    general: {
      'mail-express': { days: 60, time: '10:00' },
      'rajdhani-shatabdi': { days: 60, time: '10:00' },
      'duronto': { days: 60, time: '10:00' },
      'premium-tatkal': { days: 1, time: '11:00' },
      'tatkal': { days: 1, time: '11:00' }
    },
    senior: {
      'mail-express': { days: 60, time: '10:00' },
      'rajdhani-shatabdi': { days: 60, time: '10:00' },
      'duronto': { days: 60, time: '10:00' },
      'premium-tatkal': { days: 1, time: '11:00' },
      'tatkal': { days: 1, time: '11:00' }
    },
    ladies: {
      'mail-express': { days: 60, time: '11:00' },
      'rajdhani-shatabdi': { days: 60, time: '11:00' },
      'duronto': { days: 60, time: '11:00' },
      'premium-tatkal': { days: 1, time: '11:00' },
      'tatkal': { days: 1, time: '11:00' }
    }
  }), []);

  const passengerTypes = useMemo(() => [
    { value: 'general', label: 'General Public', icon: '👥' },
    { value: 'senior', label: 'Senior Citizens (60+)', icon: '👴' },
    { value: 'ladies', label: 'Ladies (General)', icon: '👩' }
  ], []);

  const trainTypes = useMemo(() => [
    { value: 'mail-express', label: 'Mail/Express Trains', description: 'Regular trains' },
    { value: 'rajdhani-shatabdi', label: 'Rajdhani/Shatabdi', description: 'Premium trains' },
    { value: 'duronto', label: 'Duronto Express', description: 'Non-stop trains' },
    { value: 'premium-tatkal', label: 'Premium Tatkal', description: 'Same day booking (AC classes)' },
    { value: 'tatkal', label: 'Tatkal', description: 'Same day booking (Non-AC classes)' }
  ], []);

  const getTatkalNotes = useCallback(() => [
    'Tatkal booking opens exactly 1 day before journey date',
    'Both Premium and General Tatkal: 11:00 AM',
    'Higher fare charges apply',
    'Limited quota available'
  ], []);

  const getGeneralNotes = useCallback(() => {
    const notes = [
      'Booking opens at 10:00 AM IST',
      'Subject to availability',
      'New 60-day advance booking period effective from Nov 1, 2024',
      'Cancellation rules apply as per IRCTC policy'
    ];

    if (passengerType === 'senior') {
      notes.push('Senior citizens (60+) also follow 60-day advance booking period');
      notes.push('Concession available as per rules');
    }

    if (passengerType === 'ladies') {
      notes.push('Ladies quota booking opens at 11:00 AM IST');
    }

    const today = new Date();
    const effectiveDate = new Date('2024-11-01');
    if (today < effectiveDate) {
      notes.unshift('Until Oct 31, 2024: 120-day advance booking period applies');
    }

    return notes;
  }, [passengerType]);

  const calculateBookingDate = useCallback(() => {
    if (!journeyDate) return;

    const journey = new Date(journeyDate);
    const rule = bookingRules[passengerType][trainType];
    
    // Calculate booking start date
    const bookingStart = new Date(journey);
    bookingStart.setDate(journey.getDate() - rule.days);
    
    // For Tatkal, booking starts 1 day before at specific times
    if (trainType.includes('tatkal')) {
      const tatkalDate = new Date(journey);
      tatkalDate.setDate(journey.getDate() - 1);
      
      setBookingResults({
        bookingStartDate: tatkalDate,
        bookingStartTime: '11:00 AM',
        journeyDate: journey,
        daysInAdvance: 1,
        passengerCategory: passengerTypes.find(p => p.value === passengerType).label,
        trainCategory: trainTypes.find(t => t.value === trainType).label,
        specialNotes: getTatkalNotes()
      });
    } else {
      setBookingResults({
        bookingStartDate: bookingStart,
        bookingStartTime: rule.time + ' AM',
        journeyDate: journey,
        daysInAdvance: rule.days,
        passengerCategory: passengerTypes.find(p => p.value === passengerType).label,
        trainCategory: trainTypes.find(t => t.value === trainType).label,
        specialNotes: getGeneralNotes()
      });
    }
  }, [journeyDate, passengerType, trainType, bookingRules, passengerTypes, trainTypes, setBookingResults, getTatkalNotes, getGeneralNotes]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilBooking = () => {
    if (!bookingResults) return 0;
    const today = new Date();
    const bookingDate = bookingResults.bookingStartDate;
    const diffTime = bookingDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    if (journeyDate) {
      calculateBookingDate();
    }
  }, [journeyDate, passengerType, trainType, calculateBookingDate]);

  // Dynamic styles based on theme
  const styles = {
    container: {
      flex: 1,
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%)'
        : 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      color: isDarkMode ? '#e2e8f0' : 'inherit',
    },
    maxWidth: {
      width: '100%',
      maxWidth: '1024px',
      margin: '0 auto'
    },
    contentWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    },
    title: {
      fontSize: '30px',
      fontWeight: 'bold',
      color: isDarkMode ? '#e2e8f0' : '#1f2937',
      marginLeft: '8px'
    },
    subtitle: {
      color: isDarkMode ? '#94a3b8' : '#6b7280'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      alignItems: 'start'
    },
    card: {
      backgroundColor: isDarkMode ? '#2d3748' : 'white',
      borderRadius: '12px',
      boxShadow: isDarkMode 
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '24px',
      height: 'fit-content',
      color: isDarkMode ? '#e2e8f0' : 'inherit',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: isDarkMode ? '#94a3b8' : '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: `1px solid ${isDarkMode ? '#4a5568' : '#d1d5db'}`,
      borderRadius: '8px',
      outline: 'none',
      fontSize: '16px',
      marginBottom: '24px',
      backgroundColor: isDarkMode ? '#1a202c' : 'white',
      color: isDarkMode ? '#e2e8f0' : 'inherit'
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    radioContainer: {
      marginBottom: '24px'
    },
    radioOption: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      border: `1px solid ${isDarkMode ? '#4a5568' : '#d1d5db'}`,
      borderRadius: '8px',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: isDarkMode ? '#1a202c' : 'white',
      color: isDarkMode ? '#e2e8f0' : 'inherit'
    },
    radioOptionHover: {
      backgroundColor: isDarkMode ? '#2d3748' : '#f9fafb'
    },
    radioInput: {
      marginRight: '12px'
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      border: `1px solid ${isDarkMode ? '#4a5568' : '#d1d5db'}`,
      borderRadius: '8px',
      outline: 'none',
      fontSize: '16px',
      marginBottom: '24px',
      backgroundColor: isDarkMode ? '#1a202c' : 'white',
      color: isDarkMode ? '#e2e8f0' : 'inherit'
    },
    bookingCard: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px'
    },
    bookingCardHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px'
    },
    bookingDate: {
      fontSize: '18px',
      fontWeight: 'bold'
    },
    bookingTime: {
      fontSize: '14px',
      opacity: 0.9
    },
    daysCounter: {
      textAlign: 'center',
      padding: '16px',
      backgroundColor: isDarkMode ? '#1a202c' : '#f9fafb',
      borderRadius: '8px',
      marginBottom: '24px'
    },
    daysCounterNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: isDarkMode ? '#e2e8f0' : '#1f2937'
    },
    daysCounterText: {
      fontSize: '14px',
      color: isDarkMode ? '#94a3b8' : '#6b7280'
    },
    detailsContainer: {
      marginBottom: '24px'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px'
    },
    detailLabel: {
      color: '#6b7280'
    },
    detailValue: {
      fontWeight: '500'
    },
    notesCard: {
      backgroundColor: '#fefce8',
      borderLeft: '4px solid #facc15',
      padding: '16px'
    },
    notesHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px'
    },
    notesTitle: {
      fontWeight: '600',
      color: '#a16207',
      marginLeft: '8px'
    },
    notesList: {
      fontSize: '14px',
      color: '#a16207'
    },
    noteItem: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '4px'
    },
    placeholder: {
      textAlign: 'center',
      color: '#9ca3af',
      padding: '32px 0'
    },
    infoSection: {
      marginTop: '32px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    infoTitle: {
      fontWeight: '500',
      color: '#2563eb',
      marginBottom: '8px'
    },
    infoList: {
      fontSize: '14px',
      color: '#6b7280'
    },
    infoItem: {
      marginBottom: '4px'
    }
  };

  const trainAnimationStyles = {
    wrapper: {
      width: '100vw',
      maxWidth: '100%',
      overflow: 'hidden',
      height: '40px',
      margin: '0 0 12px 0',
      position: 'relative',
      background: 'transparent'
    },
    svg: {
      position: 'absolute',
      left: '-260px',
      right: 'auto',
      top: '4px',
      animation: 'trainMove 10s linear infinite',
      zIndex: 1,
      transform: 'none'
    }
  };

  // Add the keyframe animation to the document
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes trainMove {
        0% { left: -260px; }
        100% { left: 100vw; }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  // Theme toggle button styles
  const themeToggleStyles = {
    button: {
      position: 'fixed',
      top: 0,
      right: 0,
      margin: 0,
      padding: 0,
      background: 'none',
      border: 'none',
      fontSize: '1.6rem',
      cursor: 'pointer',
      zIndex: 9999,
      color: 'var(--text)',
      transition: 'color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48px',
      height: '48px',
      boxSizing: 'border-box',
      '@media (max-width: 600px)': {
        fontSize: '1.2rem',
        width: '40px',
        height: '40px',
        minWidth: '36px',
        minHeight: '36px'
      }
    },
    focusOutline: {
      outline: '2px solid #007bff'
    }
  };

    // Theme toggle handler
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      window.dispatchEvent(new Event('upaman-theme-change'));
      document.body.className = newTheme ? 'dark-theme' : '';
      return newTheme;
    });
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : '';
  }, [isDarkMode]);

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
    };

    window.addEventListener('upaman-theme-change', syncTheme);
    window.addEventListener('storage', syncTheme);

    return () => {
      window.removeEventListener('upaman-theme-change', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const seoFaqItems = [
    {
      question: 'When does IRCTC general booking open?',
      answer: 'For most regular classes, booking opens at 10:00 AM IST as per current applicable booking window rules.'
    },
    {
      question: 'When does Tatkal booking open?',
      answer: 'Tatkal generally opens one day before journey date around 11:00 AM IST. Always verify final timing on the official IRCTC portal.'
    },
    {
      question: 'Can this tool guarantee seat availability?',
      answer: 'No. It helps plan booking windows and timing strategy. Final availability depends on live quota, demand, and IRCTC system status.'
    }
  ];
  
  return (
    <div className={`calculator-container irctc-container ${isDarkMode ? 'dark' : ''}`}>
      <Head>
    <title>IRCTC Booking Charges Calculator 2025 | Train Ticket Fee Tool | Upaman</title>
    <meta name="description" content="IRCTC Booking Charges Calculator 2025. Compute convenience fees & payment gateway charges for train ticket classes (Sleeper, 3A, 2A, CC, etc)." />
    <meta name="keywords" content="IRCTC calculator 2025, train booking charges, railway ticket fees, IRCTC convenience fee" />
    <link rel="canonical" href="https://upaman.com/irctc-calculator" />
    <meta property="og:title" content="IRCTC Booking Charges Calculator 2025 | Upaman" />
    <meta property="og:description" content="Calculate IRCTC booking & payment gateway charges for all classes." />
    <meta property="og:url" content="https://upaman.com/irctc-calculator" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
    <meta property="og:image:alt" content="IRCTC Booking Charges Calculator" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="IRCTC Booking Charges Calculator 2025 | Upaman" />
    <meta name="twitter:description" content="IRCTC train ticket booking fee & convenience charge calculator." />
    <meta name="twitter:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
      "name": "IRCTC Booking Charges Calculator 2025",
            "url": "https://upaman.com/irctc-calculator",
            "description": "Free IRCTC train booking calculator for convenience fees and total booking charges calculation",
            "applicationCategory": "Travel & Transportation",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "featureList": ["IRCTC Booking Calculator", "Convenience Fee Calculator", "Payment Gateway Charges", "Train Fare Calculator", "Railway Booking Charges"]
          })
        }} />
      </Head>
      <button 
        style={themeToggleStyles.button} 
        onClick={toggleTheme}
        aria-label="Toggle light/dark mode"
      >
        <span title="Toggle light/dark mode">
          {isDarkMode ? (
            // Sun icon for dark mode
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" fill="#FFD700" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            // Moon icon for light mode
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M21 12.79A9 9 0 0 1 12.79 3a7 7 0 1 0 8.21 9.79z" 
                fill="#FFA500"
              />
            </svg>
          )}
        </span>
      </button>
      <div style={{...trainAnimationStyles.wrapper}} aria-hidden="true">
        <svg style={{...trainAnimationStyles.svg}} viewBox="0 0 260 40" width="260" height="40">
          {/* Coach 3 */}
          <g>
            <rect x="8" y="14" width="44" height="16" rx="3" fill="#888" />
            <rect x="14" y="18" width="8" height="6" rx="1" fill="#fff" />
            <rect x="28" y="18" width="8" height="6" rx="1" fill="#fff" />
            <rect x="42" y="18" width="8" height="6" rx="1" fill="#fff" />
            <circle cx="20" cy="30" r="3" fill="#444" />
            <circle cx="36" cy="30" r="3" fill="#444" />
            <circle cx="52" cy="30" r="3" fill="#444" />
          </g>
          {/* Coach 2 */}
          <g>
            <rect x="58" y="14" width="44" height="16" rx="3" fill="#888" />
            <rect x="64" y="18" width="8" height="6" rx="1" fill="#fff" />
            <rect x="78" y="18" width="8" height="6" rx="1" fill="#fff" />
            <rect x="92" y="18" width="8" height="6" rx="1" fill="#fff" />
            <circle cx="70" cy="30" r="3" fill="#444" />
            <circle cx="86" cy="30" r="3" fill="#444" />
            <circle cx="102" cy="30" r="3" fill="#444" />
          </g>
          {/* Coach 1 */}
          <g>
            <rect x="108" y="14" width="44" height="16" rx="3" fill="#888" />
            <rect x="114" y="18" width="8" height="6" rx="1" fill="#fff" />
            <rect x="128" y="18" width="8" height="6" rx="1" fill="#fff" />
            <rect x="142" y="18" width="8" height="6" rx="1" fill="#fff" />
            <circle cx="120" cy="30" r="3" fill="#444" />
            <circle cx="136" cy="30" r="3" fill="#444" />
            <circle cx="152" cy="30" r="3" fill="#444" />
          </g>
          {/* WAP-7 Engine */}
          <g>
            <rect x="158" y="14" width="54" height="16" rx="3" fill="#e0e0e0" stroke="#2d3a4b" strokeWidth="1" />
            <rect x="158" y="22" width="54" height="4" fill="#c00" />
            <text x="170" y="21" fontSize="8" fontFamily="'Source Sans 3', sans-serif" fill="#c00" fontWeight="bold">IR</text>
            <circle cx="210" cy="22" r="2" fill="#ff0" stroke="#aaa" strokeWidth="0.5" />
            <rect x="212" y="24" width="4" height="6" rx="1" fill="#444" />
            <circle cx="170" cy="30" r="3.5" fill="#444" />
            <circle cx="188" cy="30" r="3.5" fill="#444" />
            <circle cx="206" cy="30" r="3.5" fill="#444" />
          </g>
        </svg>
      </div>
      <div style={styles.maxWidth}>
        <div style={styles.contentWrapper}>
          {/* Header */}
          <div style={styles.header}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
              width: '100%'
            }}>
              <HomeButton />
              <div style={{ flex: 1 }}></div>
            </div>
            <div style={styles.headerTitle}>
              <Train size={32} color="#2563eb" />
              <h1 style={styles.title}>IRCTC Advance Booking Calculator</h1>
            </div>
            <p style={styles.subtitle}>Find out when you can book your train tickets in advance</p>
          </div>

          <div style={styles.gridContainer}>
            {/* Input Section */}
            <div className={`irctc-card ${isDarkMode ? 'dark' : ''}`}>
              <h2 style={styles.sectionTitle}>
                <Calendar size={20} color="#2563eb" style={{marginRight: '8px'}} />
                Booking Details
              </h2>

              {/* Journey Date */}
              <div>
  <label style={styles.label}>Journey Date</label>
  <input
    type="date"
    value={journeyDate}
    onChange={(e) => {
      const selectedDate = new Date(e.target.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate >= today) {
        setJourneyDate(e.target.value);
      }
    }}
    min={new Date().toISOString().split('T')[0]}
    style={styles.input}
  />
</div>

              {/* Passenger Type */}
              <div style={styles.radioContainer}>
                <label style={styles.label}>Passenger Category</label>
                {passengerTypes.map((type) => (
                  <label 
                    key={type.value} 
                    style={styles.radioOption}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <input
                      type="radio"
                      name="passengerType"
                      value={type.value}
                      checked={passengerType === type.value}
                      onChange={(e) => setPassengerType(e.target.value)}
                      style={styles.radioInput}
                    />
                    <span style={{marginRight: '8px'}}>{type.icon}</span>
                    <span style={{fontWeight: '500'}}>{type.label}</span>
                  </label>
                ))}
              </div>

              {/* Train Type */}
              <div>
                <label style={styles.label}>Train Category</label>
                <select
                  value={trainType}
                  onChange={(e) => setTrainType(e.target.value)}
                  style={styles.select}
                >
                  {trainTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Section */}
            <div className={`irctc-card ${isDarkMode ? 'dark' : ''}`}>
              <h2 style={styles.sectionTitle}>
                <CalendarDays size={20} color="#16a34a" style={{marginRight: '8px'}} />
                Booking Information
              </h2>

              {bookingResults ? (
                <div>
                  {/* Combined Booking Info Card */}
                  <div style={{
                    ...styles.bookingCard,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div>
                        <div style={styles.bookingCardHeader}>
                          <Clock size={20} style={{marginRight: '8px'}} />
                          <span style={{fontWeight: '600'}}>Booking Opens</span>
                        </div>
                        <div style={{...styles.bookingDate, marginTop: '8px'}}>
                          {formatDate(bookingResults.bookingStartDate)}
                        </div>
                        <div style={styles.bookingTime}>
                          at {bookingResults.bookingStartTime}
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '28px',
                          fontWeight: 'bold',
                          lineHeight: '1.2'
                        }}>
                          {getDaysUntilBooking()}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          opacity: 0.9
                        }}>
                          {getDaysUntilBooking() === 1 ? 'day' : 'days'} {getDaysUntilBooking() > 0 ? 'left' : 'ago'}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}>
                      {getDaysUntilBooking() > 0 
                        ? 'Mark your calendar to book your tickets on time!'
                        : getDaysUntilBooking() === 0 
                          ? 'Booking is available now! Visit IRCTC website.'
                          : 'Booking date has passed.'}
                    </div>
                  </div>

                  {/* Calendar Integration */}
                  <div style={{
                    backgroundColor: isDarkMode ? '#1a202c' : '#f3f4f6',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <Calendar size={16} color={isDarkMode ? '#94a3b8' : '#4b5563'} style={{marginRight: '8px'}} />
                      <span style={{fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#4b5563'}}>Add to Calendar</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'center'
                    }}>
                      <a
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=IRCTC Booking Opens - ${bookingResults.trainCategory}&dates=${bookingResults.bookingStartDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${bookingResults.bookingStartDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=Train booking opens for ${bookingResults.trainCategory}%0A%0APassenger Type: ${bookingResults.passengerCategory}%0AJourney Date: ${formatDate(bookingResults.journeyDate)}%0ABooking Time: ${bookingResults.bookingStartTime}%0A%0AVisit IRCTC website to book tickets: https://www.irctc.co.in&location=IRCTC Website`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 16px',
                          backgroundColor: '#ea4335',
                          color: 'white',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" 
                          alt="Google Calendar" 
                          style={{width: '20px', marginRight: '8px'}}
                        />
                        Google
                      </a>
                      <a
                        href={`https://outlook.live.com/calendar/0/deeplink/compose?subject=IRCTC Booking Opens - ${bookingResults.trainCategory}&startdt=${bookingResults.bookingStartDate.toISOString()}&enddt=${bookingResults.bookingStartDate.toISOString()}&body=Train booking opens for ${bookingResults.trainCategory}%0D%0A%0D%0APassenger Type: ${bookingResults.passengerCategory}%0D%0AJourney Date: ${formatDate(bookingResults.journeyDate)}%0D%0ABooking Time: ${bookingResults.bookingStartTime}%0D%0A%0D%0AVisit IRCTC website to book tickets: https://www.irctc.co.in&location=IRCTC Website`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 16px',
                          backgroundColor: '#0078d4',
                          color: 'white',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018–present%29.svg" 
                          alt="Outlook" 
                          style={{width: '20px', marginRight: '8px'}}
                        />
                        Outlook
                      </a>
                      <a
                        href={`data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${bookingResults.bookingStartDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${bookingResults.bookingStartDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:IRCTC Booking Opens - ${bookingResults.trainCategory}
DESCRIPTION:Train booking opens for ${bookingResults.trainCategory}\\n\\nPassenger Type: ${bookingResults.passengerCategory}\\nJourney Date: ${formatDate(bookingResults.journeyDate)}\\nBooking Time: ${bookingResults.bookingStartTime}\\n\\nVisit IRCTC website to book tickets: https://www.irctc.co.in
LOCATION:IRCTC Website
END:VEVENT
END:VCALENDAR`}
                        download="irctc_booking_reminder.ics"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 16px',
                          backgroundColor: '#4f46e5',
                          color: 'white',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        <Calendar size={20} style={{marginRight: '8px'}} />
                        iCal
                      </a>
                    </div>
                  </div>

                  {/* Journey Details */}
                  <div style={styles.detailsContainer}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Journey Date:</span>
                      <span style={styles.detailValue}>{formatDate(bookingResults.journeyDate)}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Passenger Type:</span>
                      <span style={styles.detailValue}>{bookingResults.passengerCategory}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Train Type:</span>
                      <span style={styles.detailValue}>{bookingResults.trainCategory}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Advance Period:</span>
                      <span style={styles.detailValue}>{bookingResults.daysInAdvance} days</span>
                    </div>
                  </div>

                  {/* Important Notes */}
                  {/* <div style={styles.notesCard}>
                    <div style={styles.notesHeader}>
                      <Info size={16} color="#a16207" />
                      <span style={styles.notesTitle}>Important Notes</span>
                    </div>
                    <ul style={styles.notesList}>
                      {bookingResults.specialNotes.map((note, index) => (
                        <li key={index} style={styles.noteItem}>
                          <span style={{marginRight: '8px'}}>•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div> */}
                </div>
              ) : (
                <div style={styles.placeholder}>
                  <Calendar size={48} color="#9ca3af" style={{marginBottom: '16px'}} />
                  <p>Select your journey date to see booking information</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div style={{...styles.card, ...styles.infoSection}}>
            <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px'}}>
              IRCTC Advance Booking Rules
            </h3>
            <div style={{...styles.infoGrid, gridTemplateColumns: 'repeat(3, 1fr)'}}>
              <div>
                <h4 style={styles.infoTitle}>General Booking (From Nov 1, 2024)</h4>
                <ul style={styles.infoList}>
                  <li style={styles.infoItem}>• Mail/Express: 60 days advance</li>
                  <li style={styles.infoItem}>• Rajdhani/Shatabdi: 60 days advance</li>
                  <li style={styles.infoItem}>• Duronto Express: 60 days advance</li>
                  <li style={styles.infoItem}>• Opening time: 10:00 AM IST</li>
                  <li style={styles.infoItem}>• Valid for all passenger types</li>
                  <li style={styles.infoItem}>• Applicable for all classes</li>
                  <li style={styles.infoItem}>• Subject to quota availability</li>
                </ul>
              </div>
              <div>
                <h4 style={styles.infoTitle}>Special Quotas & Timings</h4>
                <ul style={styles.infoList}>
                  <li style={styles.infoItem}>• Tatkal: 11:00 AM (1 day before)</li>
                  <li style={styles.infoItem}>• Premium Tatkal: AC classes, dynamic pricing</li>
                  <li style={styles.infoItem}>• Ladies Quota: 11:00 AM IST</li>
                  <li style={styles.infoItem}>• Senior Citizen: 60 days advance</li>
                  <li style={styles.infoItem}>• Foreign Tourist: 365 days advance</li>
                  <li style={styles.infoItem}>• Disabled Quota: 60 days advance</li>
                  <li style={styles.infoItem}>• Defence Quota: Special rules apply</li>
                </ul>
              </div>
              <div>
                <h4 style={styles.infoTitle}>Important Guidelines</h4>
                <ul style={styles.infoList}>
                  <li style={styles.infoItem}>• Valid ID proof mandatory</li>
                  <li style={styles.infoItem}>• Max 6 tickets per month (general)</li>
                  <li style={styles.infoItem}>• Max 12 tickets for verified users</li>
                  <li style={styles.infoItem}>• Tatkal: Max 4 passengers per ticket</li>
                  <li style={styles.infoItem}>• No agent booking in Tatkal (10-12 AM)</li>
                  <li style={styles.infoItem}>• Cancellation rules vary by class</li>
                  <li style={styles.infoItem}>• Keep checking RAC/Waitlist status</li>
                </ul>
              </div>
            </div>
          </div>

          <SearchLandingSections
            intro={(
              <>
                <p>
                  IRCTC booking timing queries are highly intent-driven: users usually need exact opening windows for
                  regular and Tatkal booking, not long documentation. This page combines timing logic and practical
                  booking planning so you can avoid missing critical windows.
                </p>
                <p>
                  Use this tool before important travel bookings to calculate booking date, time, and quota context in
                  one place.
                </p>
              </>
            )}
            example={(
              <p>
                If your journey date is April 30 and the train follows a 60-day advance window, booking date is derived
                by moving back the configured days and applying opening-time logic. For Tatkal journeys, the calculator
                applies one-day window rules with expected opening time to help you prepare in advance.
              </p>
            )}
            formula={(
              <p>
                Core logic: booking date = journey date minus applicable advance-booking days, then attach quota-specific
                opening time (regular, Tatkal, or other selected quota category). Display layers then provide category
                labels, reminders, and practical timing guidance for real booking behavior.
              </p>
            )}
            faqItems={seoFaqItems}
            relatedLinks={[
              { label: 'Age Calculator (Travel age checks)', href: '/age-calculator' },
              { label: 'Loan & EMI Calculator', href: '/loan-calculator' },
              { label: 'IRCTC and Booking Strategy Guide', href: '/guide-irctc-booking-strategy.html' }
            ]}
          />

        </div>
        {/* Footer */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#be123c',
          color: 'white',
          width: '100%'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            All times shown are in IST (UTC+5:30). This calculator is for informational purposes only and is not affiliated with Indian Railways or IRCTC. For official information, visit <a href="https://www.irctc.co.in" target="_blank" rel="noopener noreferrer" style={{color: 'white', textDecoration: 'underline'}}>IRCTC website</a>. Rules and timings may change without notice.
          </div>
        </div>
      </div>
    </div>
  );
};

export default IRCTCCalculator;
