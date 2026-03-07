import React, { useEffect, useState } from 'react';
import { Train, Clock, Shield, Target, Zap, Calendar, CreditCard, Briefcase, Home, Search, X, Sigma, BarChart3, Ruler, Wallet } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MainLandingPage = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? savedTheme === 'dark' : false;
    }
    return false;
  });
  const [showMethodologyTooltip, setShowMethodologyTooltip] = useState(false);
  const [toolSearch, setToolSearch] = useState('');
  const [activeHierarchyIndex, setActiveHierarchyIndex] = useState(-1);

  // Theme toggle handler
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        window.dispatchEvent(new Event('upaman-theme-change'));
      }
      return newTheme;
    });
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.className = isDarkMode ? 'dark-theme' : '';
    }
  }, [isDarkMode]);

  useEffect(() => {
    const syncTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    };

    window.addEventListener('upaman-theme-change', syncTheme);
    window.addEventListener('storage', syncTheme);

    return () => {
      window.removeEventListener('upaman-theme-change', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const navigateToTool = (path) => {
    router.push(path);
  };

  const brand = {
    primary: '#0f2a43',
    secondary: '#0f766e',
    accent: '#b45309',
    lightBg: '#f6f4ef',
    lightBgAlt: '#e7edf4',
    darkBg: '#0b1726',
    darkBgAlt: '#15253a'
  };

  const logoAnimations = {
    idle: 'logoDrift 7s ease-in-out infinite',
    hover: 'logoCalmPulse 1.6s ease-in-out infinite',
    tap: 'logoCalmPulse 0.45s ease-in-out 2'
  };

  const containerStyle = {
    minHeight: '100vh',
    background: isDarkMode
      ? `radial-gradient(circle at top right, rgba(15, 118, 110, 0.22), transparent 46%), linear-gradient(135deg, ${brand.darkBg} 0%, ${brand.darkBgAlt} 100%)`
      : `radial-gradient(circle at top right, rgba(180, 83, 9, 0.14), transparent 44%), linear-gradient(135deg, ${brand.lightBg} 0%, ${brand.lightBgAlt} 100%)`,
    fontFamily: 'var(--app-font)',
    color: isDarkMode ? '#e2e8f0' : '#1e293b'
  };

  const headerStyle = {
    background: isDarkMode ? 'rgba(11, 23, 38, 0.92)' : 'rgba(250, 248, 243, 0.92)',
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${isDarkMode ? '#2e4057' : '#d8dde6'}`,
    position: 'sticky',
    top: 0,
    zIndex: 50,
    padding: '1rem 0'
  };

  const navStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1rem',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const logoStyle = {
    fontSize: '1.75rem',
    fontWeight: '700',
    background: `linear-gradient(135deg, ${brand.primary}, ${brand.secondary})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const heroStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'clamp(3rem, 8vw, 6rem) 1rem clamp(2rem, 6vw, 4rem)',
    textAlign: 'center'
  };

  const cardStyle = {
    background: isDarkMode ? 'rgba(20, 35, 53, 0.86)' : 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${isDarkMode ? '#314961' : '#dbe2eb'}`,
    borderRadius: '0.9rem',
    padding: '1.75rem',
    boxShadow: isDarkMode 
      ? '0 8px 20px -8px rgba(0, 0, 0, 0.5)'
      : '0 10px 24px -10px rgba(9, 30, 66, 0.22)',
    transition: 'transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease',
    height: '100%',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const featureCardStyle = {
    background: isDarkMode ? 'rgba(22, 38, 57, 0.7)' : 'rgba(255, 255, 255, 0.78)',
    border: `1px solid ${isDarkMode ? '#30475f' : '#dde3ec'}`,
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  };

  const sectionHeadingStyle = {
    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
    fontWeight: '700',
    color: isDarkMode ? '#e2e8f0' : '#1e293b',
    textAlign: 'left'
  };

  const sectionDescriptionStyle = {
    fontSize: '0.95rem',
    color: isDarkMode ? '#94a3b8' : '#64748b',
    textAlign: 'left',
    marginTop: '0.35rem'
  };

  const cardsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'clamp(1rem, 3vw, 1.5rem)',
    maxWidth: '100%'
  };

  const tones = {
    primary: {
      gradient: `linear-gradient(135deg, ${brand.primary}, #1d4e89)`,
      lightBg: 'rgba(15, 42, 67, 0.08)',
      darkBg: 'rgba(29, 78, 137, 0.22)',
      lightText: '#0f2a43',
      darkText: '#bfdbfe'
    },
    secondary: {
      gradient: `linear-gradient(135deg, ${brand.secondary}, #115e59)`,
      lightBg: 'rgba(15, 118, 110, 0.09)',
      darkBg: 'rgba(15, 118, 110, 0.22)',
      lightText: '#0f766e',
      darkText: '#99f6e4'
    },
    accent: {
      gradient: `linear-gradient(135deg, ${brand.accent}, #c2410c)`,
      lightBg: 'rgba(180, 83, 9, 0.1)',
      darkBg: 'rgba(194, 65, 12, 0.22)',
      lightText: '#9a3412',
      darkText: '#fdba74'
    }
  };

  const themedCard = (tone) => ({
    gradient: tones[tone].gradient,
    bgColor: isDarkMode ? tones[tone].darkBg : tones[tone].lightBg,
    textColor: isDarkMode ? tones[tone].darkText : tones[tone].lightText
  });

  // Workflow cards data
  const workflows = [
    {
      title: 'Job Offer Decision Workflow',
      description: 'Compare two salary offers, estimate take-home impact, and get investing/debt plan guidance in one flow',
      icon: Briefcase,
      ...themedCard('primary'),
      features: ['Offer comparison', 'Tax impact', 'Decision recommendation'],
      path: '/job-offer-workflow',
      badge: 'Workflow',
      badgeBg: isDarkMode ? 'rgba(29, 78, 137, 0.22)' : '#dbe7f4',
      badgeColor: isDarkMode ? '#bfdbfe' : '#0f2a43'
    },
    {
      title: 'Home Loan Readiness Workflow',
      description: 'Check safe EMI, maximum loan budget, and readiness plan before committing to a property',
      icon: Home,
      ...themedCard('secondary'),
      features: ['Safe EMI', 'Budget validation', 'Readiness action plan'],
      path: '/home-loan-readiness-workflow',
      badge: 'Workflow',
      badgeBg: isDarkMode ? 'rgba(15, 118, 110, 0.22)' : '#d7f2ee',
      badgeColor: isDarkMode ? '#99f6e4' : '#0f766e'
    },
    {
      title: 'Prepay vs Invest Workflow',
      description: 'Decide whether monthly surplus should prepay debt or be invested based on timeline and risk-adjusted outcomes',
      icon: Wallet,
      ...themedCard('accent'),
      features: ['Interest saved', 'Corpus comparison', 'Action recommendation'],
      path: '/prepay-vs-invest-workflow',
      badge: 'Workflow',
      badgeBg: isDarkMode ? 'rgba(180, 83, 9, 0.25)' : '#ffedd5',
      badgeColor: isDarkMode ? '#fdba74' : '#9a3412'
    },
    {
      title: 'Emergency Fund Readiness Workflow',
      description: 'Estimate target emergency runway and monthly contribution plan based on your household risk profile',
      icon: Shield,
      ...themedCard('primary'),
      features: ['Runway target', 'Gap analysis', 'Milestone plan'],
      path: '/emergency-fund-readiness-workflow',
      badge: 'Workflow',
      badgeBg: isDarkMode ? 'rgba(29, 78, 137, 0.22)' : '#dbe7f4',
      badgeColor: isDarkMode ? '#bfdbfe' : '#0f2a43'
    }
  ];

  // Standalone calculator cards data
  const calculators = [
    {
      title: 'IRCTC Booking Calculator',
      description: 'Calculate exact booking dates & times for train reservations',
      icon: Train,
      ...themedCard('primary'),
      features: ['60-day booking', 'Tatkal timing', 'All classes'],
      path: '/irctc-calculator'
    },
    {
      title: 'UK Rail Journey Planner',
      description: 'Journey planning with smart estimates and optional live departures when API access is available',
      icon: Train,
      ...themedCard('primary'),
      features: ['Smart estimates', 'Live mode (beta)', 'Journey planning'],
      path: '/uk-rail-calculator',
      badge: 'Beta',
      badgeBg: isDarkMode ? 'rgba(245, 158, 11, 0.22)' : '#fef3c7',
      badgeColor: isDarkMode ? '#fcd34d' : '#92400e'
    },
    {
      title: 'Age Calculator',
      description: 'Calculate exact age, days lived & life milestones',
      icon: Calendar,
      ...themedCard('secondary'),
      features: ['Exact age', 'Life milestones', 'Fun facts'],
      path: '/age-calculator'
    },
    {
      title: 'Scientific Calculator',
      description: 'Solve trigonometry, logarithms, roots, powers, and factorial expressions in one calculator',
      icon: Sigma,
      ...themedCard('primary'),
      features: ['Trig + log', 'Powers and roots', 'DEG/RAD modes'],
      path: '/scientific-calculator',
      badge: 'New',
      badgeBg: isDarkMode ? 'rgba(30, 64, 175, 0.25)' : '#dbeafe',
      badgeColor: isDarkMode ? '#bfdbfe' : '#1e40af'
    },
    {
      title: 'Statistics Calculator',
      description: 'Compute mean, median, mode, variance, standard deviation, confidence intervals, and percentile rank',
      icon: BarChart3,
      ...themedCard('secondary'),
      features: ['Descriptive stats', 'Z-score + percentile', 'Confidence intervals'],
      path: '/statistics-calculator',
      badge: 'New',
      badgeBg: isDarkMode ? 'rgba(15, 118, 110, 0.22)' : '#d7f2ee',
      badgeColor: isDarkMode ? '#99f6e4' : '#0f766e'
    },
    {
      title: 'Engineering Unit Converter',
      description: 'Convert length, area, volume, mass, temperature, speed, pressure, energy, power, and data units',
      icon: Ruler,
      ...themedCard('accent'),
      features: ['10 categories', 'Formula visibility', 'Temperature equations'],
      path: '/unit-converter',
      badge: 'New',
      badgeBg: isDarkMode ? 'rgba(180, 83, 9, 0.25)' : '#ffedd5',
      badgeColor: isDarkMode ? '#fdba74' : '#9a3412'
    },
    {
      title: 'India Calculators Hub',
      description: 'Access India-focused calculators for tax, investing, loans, salary, and IRCTC booking planning',
      icon: Target,
      ...themedCard('accent'),
      features: ['GST, Income Tax, EMI', 'SIP, PPF, Salary', 'IRCTC and debt planning'],
      path: '/india-calculators',
      badge: 'New',
      badgeBg: isDarkMode ? 'rgba(180, 83, 9, 0.25)' : '#ffedd5',
      badgeColor: isDarkMode ? '#fdba74' : '#9a3412'
    },
    {
      title: 'Tax Regime Comparison Tool',
      description: 'Compare old vs new tax regime and identify which option saves more tax for your current deductions',
      icon: Target,
      ...themedCard('secondary'),
      features: ['Old vs new', 'Deduction-aware', 'Savings recommendation'],
      path: '/tax-regime-comparison',
      badge: 'New',
      badgeBg: isDarkMode ? 'rgba(15, 118, 110, 0.22)' : '#d7f2ee',
      badgeColor: isDarkMode ? '#99f6e4' : '#0f766e'
    },
    {
      title: 'Buy vs Rent Calculator',
      description: 'Model home buying vs renting with EMI, rent growth, appreciation, and break-even timeline',
      icon: Home,
      ...themedCard('accent'),
      features: ['Break-even year', 'Cash flow view', 'Home decision'],
      path: '/buy-vs-rent-calculator',
      badge: 'New',
      badgeBg: isDarkMode ? 'rgba(180, 83, 9, 0.25)' : '#ffedd5',
      badgeColor: isDarkMode ? '#fdba74' : '#9a3412'
    },
    {
      title: 'JSON Formatter & Validator',
      description: 'Validate, format, minify, flatten, unflatten, and convert JSON ↔ CSV in one workspace',
      icon: Zap,
      ...themedCard('primary'),
      features: ['Format & validate', 'JSON ↔ CSV', 'Flatten transforms'],
      path: '/json-tools'
    },
    {
      title: 'US Calculators Hub',
      description: 'Access US-focused calculators for mortgage, refinance break-even, and auto loan decisions',
      icon: Home,
      ...themedCard('primary'),
      features: ['Mortgage, refinance, auto loan', '401(k), savings, debt payoff', 'Regional hub'],
      path: '/us-calculators',
      badge: 'New',
      badgeBg: isDarkMode ? 'rgba(30, 64, 175, 0.25)' : '#dbeafe',
      badgeColor: isDarkMode ? '#bfdbfe' : '#1e40af'
    },
    {
      title: 'EU & UK Calculators Hub',
      description: 'Access Europe-focused calculators for VAT, UK tax, and country-specific salary estimation',
      icon: Briefcase,
      ...themedCard('secondary'),
      features: ['VAT across EU', 'UK tax + NI', 'Germany/France/Netherlands salary'],
      path: '/eu-calculators',
      badge: 'New',
      badgeBg: isDarkMode ? 'rgba(15, 118, 110, 0.22)' : '#d7f2ee',
      badgeColor: isDarkMode ? '#99f6e4' : '#0f766e'
    },
    {
      title: 'Credit Card Expense Analyzer',
      description: 'Track, categorize & analyze your credit card spending patterns',
      icon: CreditCard,
      ...themedCard('accent'),
      features: ['Expense tracking', 'Budget analysis', 'Category insights'],
      path: '/credit-card-analyzer'
    }
  ];

  const calculatorGroups = [
    {
      key: 'regional-hubs',
      title: 'Regional Hubs',
      description: 'Choose your region first and open a focused set of calculators in one click.',
      paths: ['/india-calculators', '/us-calculators', '/eu-calculators']
    },
    {
      key: 'specialty-tools',
      title: 'Other Tools',
      description: 'Non-core utilities and specialty calculators.',
      paths: [
        '/irctc-calculator',
        '/uk-rail-calculator',
        '/credit-card-analyzer',
        '/tax-regime-comparison',
        '/buy-vs-rent-calculator',
        '/age-calculator',
        '/scientific-calculator',
        '/statistics-calculator',
        '/unit-converter',
        '/json-tools'
      ]
    },
  ];

  const calculatorsByPath = calculators.reduce((acc, calculator) => {
    acc[calculator.path] = calculator;
    return acc;
  }, {});

  const groupedCalculators = calculatorGroups.map((group) => ({
    ...group,
    calculators: group.paths.map((path) => calculatorsByPath[path]).filter(Boolean)
  }));

  const planningGuides = [
    {
      title: 'EMI Prepayment Strategy',
      description: 'How to decide when part-prepayment is worth it and how to estimate savings quickly.',
      href: '/guide-emi-prepayment-strategy.html'
    },
    {
      title: 'Old vs New Tax Regime Guide',
      description: 'Practical checklist to choose the better tax regime before filing.',
      href: '/guide-income-tax-regime-choice.html'
    },
    {
      title: 'SIP Step-up Planning Guide',
      description: 'Use step-up investing to target goals without overcommitting in year one.',
      href: '/guide-sip-step-up-planning.html'
    },
    {
      title: 'Credit Card Minimum Due Trap',
      description: 'See why minimum due keeps debt alive and what payment strategy exits faster.',
      href: '/guide-credit-card-minimum-due-trap.html'
    },
    {
      title: 'CTC to In-hand Breakdown',
      description: 'Understand what usually gets deducted between offer CTC and monthly take-home.',
      href: '/guide-ctc-inhand-breakdown.html'
    },
    {
      title: 'PPF vs SIP Selection',
      description: 'When to prioritize guaranteed debt-style growth vs market-linked equity SIP.',
      href: '/guide-ppf-vs-sip-choice.html'
    },
    {
      title: 'IRCTC Booking Strategy Guide',
      description: 'Practical booking-window and Tatkal preparation checklist to improve booking success.',
      href: '/guide-irctc-booking-strategy.html'
    },
    {
      title: 'Prepay vs Invest Decision Guide',
      description: 'Framework to allocate surplus between debt prepayment and investing with risk-adjusted assumptions.',
      href: '/guide-prepay-vs-invest-decision.html'
    },
    {
      title: 'Emergency Fund Readiness Guide',
      description: 'How to set runway target, compute corpus gap, and build a milestone-based emergency buffer.',
      href: '/guide-emergency-fund-readiness.html'
    }
  ];

  const normalizedSearch = toolSearch.trim().toLowerCase();
  const hasActiveSearch = normalizedSearch.length > 0;

  const itemMatchesSearch = (item) => {
    if (!hasActiveSearch) return true;
    const searchableText = [
      item.title,
      item.description,
      ...(item.features || []),
      item.badge || ''
    ]
      .join(' ')
      .toLowerCase();
    return searchableText.includes(normalizedSearch);
  };

  const filteredWorkflows = workflows.filter(itemMatchesSearch);

  const filteredGroupedCalculators = groupedCalculators
    .map((group) => {
      if (!hasActiveSearch) return group;

      const groupMatches = `${group.title} ${group.description}`.toLowerCase().includes(normalizedSearch);
      return {
        ...group,
        calculators: group.calculators.filter((calc) => groupMatches || itemMatchesSearch(calc))
      };
    })
    .filter((group) => group.calculators.length > 0);

  const filteredRegionalGroup = filteredGroupedCalculators.find((group) => group.key === 'regional-hubs');
  const filteredNonRegionalGroups = filteredGroupedCalculators.filter((group) => group.key !== 'regional-hubs');
  const showNonRegionalGroupHeaders = filteredNonRegionalGroups.length > 1;

  const hubHierarchy = [
    {
      key: 'india',
      hubTitle: 'India Calculators Hub',
      hubPath: '/india-calculators',
      hubDescription: 'Tax, investment, loan, salary, and IRCTC planning tools for India.',
      tools: [
        { title: 'Loan & EMI Calculator', path: '/loan-calculator', keywords: 'emi loan amortization prepayment' },
        { title: 'Income Tax Calculator', path: '/income-tax-calculator', keywords: 'tax regime fy 2025-26 india' },
        { title: 'GST Calculator', path: '/gst-calculator', keywords: 'gst cgst sgst igst' },
        { title: 'SIP Calculator', path: '/sip-calculator', keywords: 'sip returns mutual fund goal' },
        { title: 'PPF Calculator', path: '/ppf-calculator', keywords: 'ppf maturity interest' },
        { title: 'Salary Calculator', path: '/salary-calculator', keywords: 'ctc in hand salary' },
        { title: 'IRCTC Booking Calculator', path: '/irctc-calculator', keywords: 'train booking tatkal' },
        { title: 'Credit Card Trap Calculator', path: '/credit-card-trap-calculator', keywords: 'debt payoff minimum due' }
      ]
    },
    {
      key: 'us',
      hubTitle: 'US Calculators Hub',
      hubPath: '/us-calculators',
      hubDescription: 'Mortgage, refinance, auto loan, retirement, savings, and debt tools for US users.',
      tools: [
        { title: 'US Mortgage Calculator', path: '/us-mortgage-calculator', keywords: 'mortgage piti pmi hoa' },
        { title: 'US Refinance Calculator', path: '/us-refinance-calculator', keywords: 'refinance break-even' },
        { title: 'US Auto Loan Calculator', path: '/us-auto-loan-calculator', keywords: 'car auto apr trade-in' },
        { title: 'US 401(k) Calculator', path: '/us-401k-calculator', keywords: '401k retirement match' },
        { title: 'US Savings & CD Calculator', path: '/us-savings-cd-calculator', keywords: 'savings cd apy maturity' },
        { title: 'US Credit Card Payoff Calculator', path: '/us-credit-card-payoff-calculator', keywords: 'credit card payoff debt' }
      ]
    },
    {
      key: 'eu',
      hubTitle: 'EU & UK Calculators Hub',
      hubPath: '/eu-calculators',
      hubDescription: 'EU VAT, UK tax, and country-specific salary calculators for Europe.',
      tools: [
        { title: 'European VAT Calculator', path: '/eu-vat-calculator', keywords: 'vat eu countries' },
        { title: 'UK Income Tax Calculator', path: '/uk-income-tax-calculator', keywords: 'uk tax ni national insurance' },
        { title: 'European Salary Calculator', path: '/european-salary-calculator', keywords: 'eu salary net pay' },
        { title: 'Germany Salary Calculator', path: '/germany-salary-calculator', keywords: 'germany brutto netto' },
        { title: 'France Salary Calculator', path: '/france-salary-calculator', keywords: 'france salaire net' },
        { title: 'Netherlands Salary Calculator', path: '/netherlands-salary-calculator', keywords: 'dutch salary net pay' }
      ]
    }
  ];

  const hierarchicalHubResults = hasActiveSearch
    ? hubHierarchy
        .map((hub) => {
          const hubCard = calculatorsByPath[hub.hubPath];
          const hubSearchable = [
            hub.hubTitle,
            hub.hubDescription,
            ...(hubCard?.features || [])
          ]
            .join(' ')
            .toLowerCase();
          const hubMatches = hubSearchable.includes(normalizedSearch);
          const matchingTools = hub.tools.filter((tool) =>
            `${tool.title} ${tool.keywords || ''}`.toLowerCase().includes(normalizedSearch)
          );
          const toolsToShow = hubMatches ? hub.tools : matchingTools;
          if (!hubMatches && toolsToShow.length === 0) return null;
          return { ...hub, hubMatches, toolsToShow };
        })
        .filter(Boolean)
    : [];

  const hierarchicalNavigationItems = hierarchicalHubResults.flatMap((hub) => [
    {
      key: `hub:${hub.key}`,
      label: hub.hubTitle,
      path: hub.hubPath
    },
    ...hub.toolsToShow.map((tool) => ({
      key: `tool:${hub.key}:${tool.path}`,
      label: tool.title,
      path: tool.path
    }))
  ]);

  const hierarchicalKeyToIndex = hierarchicalNavigationItems.reduce((acc, item, idx) => {
    acc[item.key] = idx;
    return acc;
  }, {});

  const activeHierarchyItem = activeHierarchyIndex >= 0
    ? hierarchicalNavigationItems[activeHierarchyIndex]
    : null;

  useEffect(() => {
    if (!hasActiveSearch || hierarchicalNavigationItems.length === 0) {
      if (activeHierarchyIndex !== -1) setActiveHierarchyIndex(-1);
      return;
    }
    if (activeHierarchyIndex >= hierarchicalNavigationItems.length) {
      setActiveHierarchyIndex(hierarchicalNavigationItems.length - 1);
    }
  }, [hasActiveSearch, hierarchicalNavigationItems.length, activeHierarchyIndex]);

  const filteredPlanningGuides = planningGuides.filter((guide) => {
    if (!hasActiveSearch) return true;
    return `${guide.title} ${guide.description}`.toLowerCase().includes(normalizedSearch);
  });

  const totalToolMatches = hasActiveSearch
    ? hierarchicalHubResults.reduce((count, hub) => count + 1 + hub.toolsToShow.length, 0) +
      filteredWorkflows.length +
      filteredNonRegionalGroups.reduce((count, group) => count + group.calculators.length, 0) +
      filteredPlanningGuides.length
    : filteredWorkflows.length +
      filteredGroupedCalculators.reduce((count, group) => count + group.calculators.length, 0) +
      filteredPlanningGuides.length;

  const renderCalculatorCard = (calc) => {
    const IconComponent = calc.icon;
    
    return (
      <div 
        key={calc.path}
        style={cardStyle}
        onClick={() => navigateToTool(calc.path)}
        role="button"
        tabIndex={0}
        aria-label={`Open ${calc.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigateToTool(calc.path);
          }
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isDarkMode 
            ? '0 14px 28px -8px rgba(0, 0, 0, 0.62)'
            : '0 16px 28px -10px rgba(9, 30, 66, 0.27)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = cardStyle.boxShadow;
          e.currentTarget.style.borderColor = isDarkMode ? '#314961' : '#dbe2eb';
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = isDarkMode ? '#38b2ac' : '#0f766e';
          e.currentTarget.style.boxShadow = isDarkMode
            ? '0 0 0 3px rgba(15, 118, 110, 0.25), 0 14px 28px -8px rgba(0, 0, 0, 0.62)'
            : '0 0 0 3px rgba(15, 118, 110, 0.18), 0 16px 28px -10px rgba(9, 30, 66, 0.27)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = isDarkMode ? '#314961' : '#dbe2eb';
          e.currentTarget.style.boxShadow = cardStyle.boxShadow;
        }}
      >
        {calc.badge && (
          <span style={{
            position: 'absolute',
            top: '0.9rem',
            left: '0.9rem',
            zIndex: 3,
            padding: '0.3rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: '700',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            background: calc.badgeBg || '#dbeafe',
            color: calc.badgeColor || '#1d4ed8',
            border: `1px solid ${calc.badgeColor || '#1d4ed8'}33`
          }}>
            {calc.badge}
          </span>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '52px',
          height: '52px',
          background: calc.bgColor,
          borderRadius: '0 0.9rem 0 1.75rem'
        }}></div>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.95rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '0.75rem',
            background: calc.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <IconComponent size={24} color="#ffffff" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#e2e8f0' : '#1e293b',
              lineHeight: '1.3'
            }}>
              {calc.title}
            </h3>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#64748b',
              fontSize: '0.875rem',
              lineHeight: '1.4',
              marginBottom: '0.75rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '3.6rem'
            }}>
              {calc.description}
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: 'auto'
        }}>
          {calc.features.map((feature, idx) => (
            <span key={idx} style={{
              backgroundColor: calc.bgColor,
              color: calc.textColor,
              padding: '0.25rem 0.65rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {feature}
            </span>
          ))}
        </div>
        
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <Head>
        <title>Decision-First Financial Calculators | Upaman</title>
        <meta
          name="description"
          content="Decision-first financial calculators for your growth. Plan tax, loans, savings, investing, salary, and more with transparent formulas, practical workflows, and useful utility tools."
        />
        <meta
          name="keywords"
          content="financial calculators US Europe India, scientific calculator, statistics calculator, unit converter, India calculators hub, US calculators hub, EU calculators hub, US mortgage calculator, US refinance calculator, US auto loan calculator, US 401k calculator, US savings cd calculator, US credit card payoff calculator, European VAT calculator, EU salary calculator, UK income tax calculator 2025-26, Germany salary calculator, France salary calculator, Netherlands salary calculator, GST calculator, income tax calculator India 2025-26, SIP calculator, EMI calculator, salary calculator, json formatter"
        />
        <link rel="canonical" href="https://upaman.com/" />
        <meta property="og:title" content="Decision-First Financial Calculators | Upaman" />
        <meta
          property="og:description"
          content="Plan important money decisions with transparent calculators, practical workflows, and trusted methodology notes."
        />
        <meta property="og:url" content="https://upaman.com/" />
        <meta name="twitter:title" content="Decision-First Financial Calculators | Upaman" />
        <meta
          name="twitter:description"
          content="Decision-first calculators and workflows to help you plan tax, loans, savings, investing, and salary with confidence."
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Upaman Financial Calculators",
            "url": "https://upaman.com/",
            "description": "Decision-first financial calculators and workflows for tax, loans, savings, investing, salary, and utility planning.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://upaman.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "mainEntity": [
              {
                "@type": "SoftwareApplication",
                "name": "GST Calculator",
                "url": "https://upaman.com/gst-calculator",
                "description": "Calculate GST inclusive and exclusive prices with latest rates for India",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "India Calculators Hub",
                "url": "https://upaman.com/india-calculators",
                "description": "Region-focused India calculator hub for EMI, GST, income tax, SIP, PPF, salary and IRCTC planning.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@type": "SoftwareApplication", 
                "name": "Income Tax Calculator",
                "url": "https://upaman.com/income-tax-calculator",
                "description": "Calculate income tax liability for FY 2025-26 with new and old tax regime",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "SIP Calculator",
                "url": "https://upaman.com/sip-calculator",
                "description": "Calculate mutual fund SIP returns with compound growth projections",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "PPF Calculator",
                "url": "https://upaman.com/ppf-calculator",
                "description": "Estimate PPF maturity value with annual contribution, interest assumptions and year-wise projection.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "EMI Calculator",
                "url": "https://upaman.com/loan-calculator",
                "description": "Calculate loan EMI for home loans, car loans, and personal loans",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "UK Income Tax Calculator",
                "url": "https://upaman.com/uk-income-tax-calculator",
                "description": "Calculate UK income tax for 2025-26 with Scottish rates and National Insurance",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "GBP"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "European VAT Calculator",
                "url": "https://upaman.com/eu-vat-calculator",
                "description": "Calculate VAT for 15 European countries with latest rates and multi-currency support",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EUR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "European Salary Calculator",
                "url": "https://upaman.com/european-salary-calculator", 
                "description": "Calculate net salary after tax and social security for 8 European countries",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EUR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "Germany Salary Calculator",
                "url": "https://upaman.com/germany-salary-calculator",
                "description": "Estimate Germany net salary after income tax, social insurance and solidarity surcharge.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EUR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "France Salary Calculator",
                "url": "https://upaman.com/france-salary-calculator",
                "description": "Estimate France net salary after income tax and social contributions.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EUR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "Netherlands Salary Calculator",
                "url": "https://upaman.com/netherlands-salary-calculator",
                "description": "Estimate Dutch net salary using income tax and common tax-credit adjustments.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EUR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "IRCTC Calculator",
                "url": "https://upaman.com/irctc-calculator",
                "description": "Calculate IRCTC booking charges and convenience fees for train tickets",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "UK Rail Journey Planner",
                "url": "https://upaman.com/uk-rail-calculator",
                "description": "Real-time UK train departures, journey planning, and fare estimation using National Rail API",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "GBP"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "Salary Calculator",
                "url": "https://upaman.com/salary-calculator",
                "description": "Convert CTC to in-hand salary with PF, tax calculations, and city-wise comparisons",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "Credit Card Trap Calculator",
                "url": "https://upaman.com/credit-card-trap-calculator",
                "description": "Compare credit card minimum due repayment with fixed monthly payment to estimate payoff time and interest savings.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "Age Calculator",
                "url": "https://upaman.com/age-calculator",
                "description": "Calculate exact age with life timeline, milestones, and gender-inclusive face animations",
                "applicationCategory": "Lifestyle",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "Scientific Calculator",
                "url": "https://upaman.com/scientific-calculator",
                "description": "Evaluate trigonometry, logarithms, powers, roots, and factorial expressions with degree and radian modes.",
                "applicationCategory": "EducationalApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "Statistics Calculator",
                "url": "https://upaman.com/statistics-calculator",
                "description": "Compute mean, median, mode, variance, standard deviation, z-score, percentile rank, and confidence intervals.",
                "applicationCategory": "EducationalApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "Engineering Unit Converter",
                "url": "https://upaman.com/unit-converter",
                "description": "Convert practical units across length, area, volume, mass, temperature, speed, pressure, energy, power, and data size.",
                "applicationCategory": "UtilitiesApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "JSON Formatter & Validator",
                "url": "https://upaman.com/json-tools",
                "description": "Validate, format, minify, flatten, unflatten and convert JSON to CSV or CSV to JSON in one tool.",
                "applicationCategory": "DeveloperApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "EU & UK Calculators Hub",
                "url": "https://upaman.com/eu-calculators",
                "description": "Access Europe and UK calculators for VAT, salary net pay, and UK income tax estimation.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EUR"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "US Mortgage Calculator",
                "url": "https://upaman.com/us-mortgage-calculator",
                "description": "Estimate US monthly mortgage payment with principal, interest, tax, insurance, HOA and PMI.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "US Refinance Break-even Calculator",
                "url": "https://upaman.com/us-refinance-calculator",
                "description": "Compare current mortgage vs refinance terms and estimate break-even timeline.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "US Auto Loan Calculator",
                "url": "https://upaman.com/us-auto-loan-calculator",
                "description": "Calculate US car loan payment with tax, trade-in, APR and term.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "US 401(k) Calculator",
                "url": "https://upaman.com/us-401k-calculator",
                "description": "Project retirement balance with employee contribution, employer match and return assumptions.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "US Savings & CD Calculator",
                "url": "https://upaman.com/us-savings-cd-calculator",
                "description": "Estimate savings APY growth and CD maturity value for US deposit products.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "SoftwareApplication",
                "name": "US Credit Card Payoff Calculator",
                "url": "https://upaman.com/us-credit-card-payoff-calculator",
                "description": "Compare minimum payment and fixed monthly payment strategies for US credit card debt.",
                "applicationCategory": "FinanceApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              }
            ]
          })
        }} />
      </Head>
      {/* Header */}
      <header style={headerStyle}>
        <nav style={navStyle}>
          <div style={{...logoStyle, display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <img 
              src="/upaman-elephant-logo.svg" 
              alt="Upaman Logo"
              style={{
                width: '40px',
                height: '40px',
                filter: isDarkMode
                  ? 'drop-shadow(0 4px 8px rgba(15, 118, 110, 0.35))'
                  : 'drop-shadow(0 3px 6px rgba(15, 42, 67, 0.18))',
                animation: logoAnimations.idle,
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
            <span style={{fontWeight: '700', fontSize: '1.5rem'}}>Upaman</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#334155' : '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={heroStyle}>
        {/* Logo Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <img 
            src="/upaman-elephant-logo.svg" 
            alt="Upaman Financial Tools"
            style={{
              width: 'clamp(80px, 15vw, 120px)',
              height: 'clamp(80px, 15vw, 120px)',
              filter: isDarkMode
                ? 'drop-shadow(0 8px 14px rgba(15, 118, 110, 0.35))'
                : 'drop-shadow(0 6px 10px rgba(15, 42, 67, 0.18))',
              animation: logoAnimations.idle,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.animation = logoAnimations.hover;
              e.target.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.target.style.animation = logoAnimations.idle;
              e.target.style.transform = 'scale(1)';
            }}
            onClick={() => {
              // Keep interaction subtle and reversible.
              const img = document.querySelector('[alt="Upaman Financial Tools"]');
              if (img) {
                img.style.animation = logoAnimations.tap;
                setTimeout(() => {
                  img.style.animation = logoAnimations.idle;
                }, 520);
              }
            }}
          />
        </div>
        
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '800',
          marginBottom: '1.5rem',
          background: `linear-gradient(135deg, ${brand.primary}, #1d4e89, ${brand.secondary})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1.2'
        }}>
          Decision-First Financial Calculators
        </h1>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: isDarkMode ? '#94a3b8' : '#64748b',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Interactive tools and guided workflows to compare real financial decisions like rent vs buy, debt payoff, salary offers, and retirement planning.
        </h2>
        <p style={{
          fontSize: '1.25rem',
          color: isDarkMode ? '#94a3b8' : '#64748b',
          maxWidth: '760px',
          margin: '0 auto 3rem',
          lineHeight: '1.55',
          textAlign: 'center'
        }}>
          Upaman focuses on expensive decisions: income tax regime, loan affordability, debt payoff, and investment
          planning. Formulas are visible, assumptions are explicit, and outputs are structured for action.
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.75rem 1rem',
          marginBottom: 'clamp(2rem, 5vw, 2.8rem)'
        }}>
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowMethodologyTooltip(true)}
            onMouseLeave={() => setShowMethodologyTooltip(false)}
          >
            <button
              type="button"
              aria-expanded={showMethodologyTooltip}
              aria-controls="methodology-tooltip"
              onFocus={() => setShowMethodologyTooltip(true)}
              onBlur={() => setShowMethodologyTooltip(false)}
              onClick={() => setShowMethodologyTooltip((prev) => !prev)}
              style={{
                border: `1px solid ${isDarkMode ? '#216564' : '#94c6c2'}`,
                background: isDarkMode ? 'rgba(15, 118, 110, 0.2)' : 'rgba(15, 118, 110, 0.1)',
                color: isDarkMode ? '#99f6e4' : '#115e59',
                borderRadius: '999px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Methodology and formulas
            </button>
            {showMethodologyTooltip && (
              <div
                id="methodology-tooltip"
                role="tooltip"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.6rem)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'min(380px, 82vw)',
                  zIndex: 25,
                  textAlign: 'left',
                  borderRadius: '0.75rem',
                  border: `1px solid ${isDarkMode ? '#2f4f68' : '#dbe2eb'}`,
                  background: isDarkMode ? 'rgba(15, 31, 46, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                  boxShadow: isDarkMode
                    ? '0 12px 28px rgba(0, 0, 0, 0.45)'
                    : '0 12px 26px rgba(9, 30, 66, 0.2)',
                  color: isDarkMode ? '#cbd5e1' : '#334155',
                  padding: '0.8rem 0.9rem'
                }}
              >
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: isDarkMode ? '#99f6e4' : '#0f766e' }}>
                  How values are calculated
                </p>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.77rem', lineHeight: 1.45 }}>
                  <strong style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Inputs used:</strong> your entered values plus selected
                  country, tax regime, and calculator settings.
                </p>
                <p style={{ margin: '0.26rem 0 0 0', fontSize: '0.77rem', lineHeight: 1.45 }}>
                  <strong style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Formula basis:</strong> standard methods like compound
                  growth, EMI amortization, tax slabs, and periodic fee/interest accrual.
                </p>
                <p style={{ margin: '0.26rem 0 0 0', fontSize: '0.77rem', lineHeight: 1.45 }}>
                  <strong style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Assumptions:</strong> rates stay constant for the selected
                  period unless a calculator explicitly models changes.
                </p>
                <p style={{ margin: '0.26rem 0 0 0', fontSize: '0.77rem', lineHeight: 1.45 }}>
                  <strong style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Rounding and disclaimer:</strong> results are rounded
                  estimates for planning and should be validated before final financial decisions.
                </p>
              </div>
            )}
          </div>
          <span style={{
            border: `1px solid ${isDarkMode ? '#35516d' : '#ced7e3'}`,
            background: isDarkMode ? 'rgba(20, 35, 53, 0.78)' : 'rgba(255, 255, 255, 0.82)',
            color: isDarkMode ? '#cbd5e1' : '#334155',
            borderRadius: '999px',
            padding: '0.4rem 0.85rem',
            fontSize: '0.82rem',
            fontWeight: 600
          }}>
            Calculations run locally
          </span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.45rem 0.9rem',
          marginBottom: '1rem'
        }}>
          {[
            { label: 'About', href: '/about' },
            { label: 'Methodology', href: '/methodology' },
            { label: 'Editorial Policy', href: '/editorial-policy' },
            { label: 'Publisher Standards', href: '/publisher-standards' },
            { label: 'Contact', href: '/contact' }
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                color: isDarkMode ? '#99f6e4' : '#0f766e',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div
          style={{
            maxWidth: '640px',
            margin: '0 auto clamp(1.7rem, 4vw, 2.6rem)',
            textAlign: 'left'
          }}
        >
          <label
            htmlFor="tool-search"
            style={{
              display: 'block',
              marginBottom: '0.45rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: isDarkMode ? '#cbd5e1' : '#334155',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}
          >
            Find a hub or tool quickly
          </label>
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.8rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}
            />
            <input
              id="tool-search"
              type="text"
              value={toolSearch}
              onChange={(e) => {
                setToolSearch(e.target.value);
                setActiveHierarchyIndex(-1);
              }}
              onKeyDown={(e) => {
                if (!hasActiveSearch || hierarchicalNavigationItems.length === 0) return;

                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveHierarchyIndex((prev) =>
                    prev < hierarchicalNavigationItems.length - 1 ? prev + 1 : 0
                  );
                  return;
                }

                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveHierarchyIndex((prev) =>
                    prev > 0 ? prev - 1 : hierarchicalNavigationItems.length - 1
                  );
                  return;
                }

                if (e.key === 'Enter' && activeHierarchyItem) {
                  e.preventDefault();
                  navigateToTool(activeHierarchyItem.path);
                  return;
                }

                if (e.key === 'Escape') {
                  setActiveHierarchyIndex(-1);
                }
              }}
              placeholder="Search hubs, tools, and guides (India, US, tax, JSON...)"
              style={{
                width: '100%',
                borderRadius: '0.75rem',
                border: `1px solid ${isDarkMode ? '#37506a' : '#cbd5e1'}`,
                background: isDarkMode ? 'rgba(17, 33, 50, 0.84)' : 'rgba(255, 255, 255, 0.92)',
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                padding: '0.62rem 2.7rem 0.62rem 2.2rem',
                fontSize: '0.86rem',
                lineHeight: 1.3,
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#38b2ac' : '#0f766e';
                e.currentTarget.style.boxShadow = isDarkMode
                  ? '0 0 0 3px rgba(15, 118, 110, 0.25)'
                  : '0 0 0 3px rgba(15, 118, 110, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#37506a' : '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
              }}
              aria-label="Search tools"
              aria-controls={hasActiveSearch ? 'search-hierarchy-results' : undefined}
              aria-activedescendant={
                hasActiveSearch && activeHierarchyItem
                  ? `hier-search-item-${activeHierarchyIndex}`
                  : undefined
              }
            />
            {toolSearch && (
              <button
                type="button"
                onClick={() => {
                  setToolSearch('');
                  setActiveHierarchyIndex(-1);
                }}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: isDarkMode ? 'rgba(51, 65, 85, 0.7)' : 'rgba(226, 232, 240, 0.85)',
                  color: isDarkMode ? '#cbd5e1' : '#475569',
                  borderRadius: '999px',
                  width: '1.85rem',
                  height: '1.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <p
            style={{
              margin: '0.35rem 0 0',
              fontSize: '0.76rem',
              color: isDarkMode ? '#94a3b8' : '#64748b'
            }}
          >
            {hasActiveSearch
              ? `${totalToolMatches} match${totalToolMatches === 1 ? '' : 'es'} found for "${toolSearch.trim()}".`
              : 'Search across workflows, regional hubs, other tools, and decision guides.'}
          </p>
        </div>

        {/* Workflow Menu */}
        <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          <h3 style={sectionHeadingStyle}>{hasActiveSearch ? 'Matching Guided Workflows' : 'Start Here: Guided Workflows'}</h3>
          <p style={sectionDescriptionStyle}>
            {hasActiveSearch
              ? 'Filtered workflow results based on your search.'
              : 'Use these first for high-impact decisions. Each workflow combines multiple calculators in one flow.'}
          </p>
        </div>
        <div style={{ ...cardsGridStyle, marginBottom: 'clamp(2rem, 6vw, 4rem)' }}>
          {filteredWorkflows.length
            ? filteredWorkflows.map(renderCalculatorCard)
            : hasActiveSearch && (
              <div style={{
                ...cardStyle,
                cursor: 'default'
              }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                  No workflow match found
                </h4>
                <p style={{ marginTop: '0.45rem', marginBottom: 0, fontSize: '0.86rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  Try broader terms like "loan", "salary", "budget", or "offer".
                </p>
              </div>
            )}
        </div>

        {/* Regional Hubs */}
        <div style={{ marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
          <h3 style={sectionHeadingStyle}>
            {hasActiveSearch ? 'Matching Menus by Hub' : 'Regional Hubs'}
          </h3>
          <p style={sectionDescriptionStyle}>
            {hasActiveSearch
              ? 'Search results are grouped as Hub → matching tools.'
              : 'Open India, US, or EU/UK hubs directly below.'}
          </p>
        </div>
        {hasActiveSearch ? (
          hierarchicalHubResults.length ? (
            <div id="search-hierarchy-results" role="listbox" style={{ display: 'grid', gap: '0.95rem', marginBottom: 'clamp(2rem, 6vw, 3.2rem)' }}>
              {hierarchicalHubResults.map((hub) => {
                const hubKey = `hub:${hub.key}`;
                const hubResultIndex = hierarchicalKeyToIndex[hubKey];
                const hubIsActive = hubResultIndex === activeHierarchyIndex;

                return (
                  <div
                    key={hub.key}
                    style={{
                      ...cardStyle,
                      cursor: 'default',
                      padding: '1.1rem'
                    }}
                  >
                    <button
                      id={hubResultIndex !== undefined ? `hier-search-item-${hubResultIndex}` : undefined}
                      type="button"
                      onClick={() => navigateToTool(hub.hubPath)}
                      onMouseEnter={() => {
                        if (hubResultIndex !== undefined) setActiveHierarchyIndex(hubResultIndex);
                      }}
                      style={{
                        border: 'none',
                        background: hubIsActive ? (isDarkMode ? 'rgba(15, 118, 110, 0.2)' : 'rgba(15, 118, 110, 0.12)') : 'transparent',
                        padding: '0.18rem 0.4rem',
                        margin: 0,
                        cursor: 'pointer',
                        fontSize: '1.01rem',
                        fontWeight: 700,
                        color: isDarkMode ? '#e2e8f0' : '#0f2a43',
                        textAlign: 'left',
                        borderRadius: '0.4rem'
                      }}
                    >
                      {hub.hubTitle}
                    </button>
                    <p style={{ margin: '0.35rem 0 0.7rem', fontSize: '0.84rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      {hub.hubDescription}
                    </p>
                    <div style={{ display: 'grid', gap: '0.42rem' }}>
                      {hub.toolsToShow.map((tool) => {
                        const toolKey = `tool:${hub.key}:${tool.path}`;
                        const toolResultIndex = hierarchicalKeyToIndex[toolKey];
                        const toolIsActive = toolResultIndex === activeHierarchyIndex;
                        return (
                          <button
                            id={toolResultIndex !== undefined ? `hier-search-item-${toolResultIndex}` : undefined}
                            key={`${hub.key}-${tool.path}`}
                            type="button"
                            onClick={() => navigateToTool(tool.path)}
                            onMouseEnter={() => {
                              if (toolResultIndex !== undefined) setActiveHierarchyIndex(toolResultIndex);
                            }}
                            style={{
                              textAlign: 'left',
                              borderRadius: '0.7rem',
                              border: `1px solid ${
                                toolIsActive
                                  ? (isDarkMode ? '#38b2ac' : '#0f766e')
                                  : (isDarkMode ? '#32485f' : '#d8e0ea')
                              }`,
                              background: toolIsActive
                                ? (isDarkMode ? 'rgba(15, 118, 110, 0.2)' : 'rgba(240, 253, 250, 0.98)')
                                : (isDarkMode ? 'rgba(16, 30, 46, 0.82)' : 'rgba(248, 250, 252, 0.95)'),
                              color: isDarkMode ? '#cbd5e1' : '#334155',
                              padding: '0.5rem 0.7rem',
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            {'\u203A'} {tool.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              ...cardStyle,
              cursor: 'default',
              marginBottom: 'clamp(2rem, 6vw, 3.2rem)'
            }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                No hierarchical match found
              </h4>
              <p style={{ marginTop: '0.45rem', marginBottom: 0, fontSize: '0.86rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                Try terms like "India tax", "US mortgage", "EU VAT", or "salary".
              </p>
            </div>
          )
        ) : (
          filteredRegionalGroup && filteredRegionalGroup.calculators.length ? (
            <div style={{ ...cardsGridStyle, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', marginBottom: 'clamp(2rem, 6vw, 3.2rem)' }}>
              {filteredRegionalGroup.calculators.map(renderCalculatorCard)}
            </div>
          ) : null
        )}

        {/* Other Tools */}
        <div style={{ marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
          <h3 style={sectionHeadingStyle}>
            {hasActiveSearch ? 'Matching Other Tools' : 'Other Tools'}
          </h3>
          <p style={sectionDescriptionStyle}>
            {hasActiveSearch
              ? 'Only matching calculators are shown below.'
              : 'Global tools and utilities that complement regional hubs.'}
          </p>
        </div>
        {filteredNonRegionalGroups.length ? filteredNonRegionalGroups.map((group) => (
          <div key={group.key} style={{ marginBottom: 'clamp(1.6rem, 4vw, 2.8rem)' }}>
            {showNonRegionalGroupHeaders && (
              <>
                <h4 style={{
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  textAlign: 'left',
                  color: isDarkMode ? '#dbeafe' : '#0f2a43',
                  marginBottom: '0.35rem'
                }}>
                  {group.title}
                </h4>
                <p style={{
                  fontSize: '0.88rem',
                  textAlign: 'left',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  marginBottom: '0.85rem'
                }}>
                  {group.description}
                </p>
              </>
            )}
            <div style={cardsGridStyle}>
              {group.calculators.map(renderCalculatorCard)}
            </div>
          </div>
        )) : (
          hasActiveSearch && (
            <div style={{
              ...cardStyle,
              cursor: 'default',
              marginBottom: 'clamp(1.6rem, 4vw, 2.8rem)'
            }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                No standalone tool match found
              </h4>
              <p style={{ marginTop: '0.45rem', marginBottom: 0, fontSize: '0.86rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                Try terms like "tax", "GST", "EMI", "salary", "JSON", or "credit card".
              </p>
            </div>
          )
        )}

        <div style={{ marginBottom: 'clamp(1rem, 3vw, 2rem)', marginTop: 'clamp(2rem, 5vw, 3.2rem)' }}>
          <h3 style={sectionHeadingStyle}>{hasActiveSearch ? 'Matching Decision Guides' : 'Decision Guides'}</h3>
          <p style={sectionDescriptionStyle}>
            {hasActiveSearch
              ? 'Guide pages that match your current search.'
              : 'Short reference pages that explain formulas, assumptions, and common mistakes before you calculate.'}
          </p>
        </div>
        <div style={cardsGridStyle}>
          {filteredPlanningGuides.length ? filteredPlanningGuides.map((guide) => (
            <a
              key={guide.href}
              href={guide.href}
              style={{
                ...cardStyle,
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <h4 style={{
                fontSize: '1.02rem',
                fontWeight: '700',
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                marginBottom: '0.55rem'
              }}>
                {guide.title}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '0.87rem',
                lineHeight: 1.5,
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                {guide.description}
              </p>
            </a>
          )) : (
            hasActiveSearch && (
              <div style={{
                ...cardStyle,
                cursor: 'default'
              }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                  No guide match found
                </h4>
                <p style={{ marginTop: '0.45rem', marginBottom: 0, fontSize: '0.86rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  Try a broader keyword or clear search to browse all guides.
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2rem, 6vw, 4rem) 1rem'
      }}>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: 'clamp(2rem, 5vw, 3rem)',
          color: isDarkMode ? '#e2e8f0' : '#1e293b',
          lineHeight: '1.2'
        }}>
          Why Users Trust Upaman
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'clamp(1rem, 3vw, 2rem)'
        }}>
          <div 
            style={featureCardStyle}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '1rem',
              background: `linear-gradient(135deg, ${brand.primary}, #1d4e89)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Clock size={28} color="#ffffff" />
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: isDarkMode ? '#e2e8f0' : '#1e293b'
            }}>
              Real-time Accuracy
            </h3>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#64748b',
              lineHeight: '1.6'
            }}>
              Built with transparent assumptions and practical defaults so outputs are easy to validate and compare.
            </p>
          </div>

          <div 
            style={featureCardStyle}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '1rem',
              background: `linear-gradient(135deg, ${brand.secondary}, #115e59)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Shield size={28} color="#ffffff" />
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: isDarkMode ? '#e2e8f0' : '#1e293b'
            }}>
              Secure & Private
            </h3>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#64748b',
              lineHeight: '1.6'
            }}>
              Most tools run directly in your browser. No login is required for standard calculations.
            </p>
          </div>

          <div 
            style={featureCardStyle}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '1rem',
              background: `linear-gradient(135deg, ${brand.accent}, #c2410c)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Zap size={28} color="#ffffff" />
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: isDarkMode ? '#e2e8f0' : '#1e293b'
            }}>
              Lightning Fast
            </h3>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#64748b',
              lineHeight: '1.6'
            }}>
              Optimized for quick inputs, readable outputs, and consistent behavior on desktop and mobile.
            </p>
          </div>
        </div>
      </section>

      {/* Footer with required legal links for AdSense compliance */}
      <footer style={{
        background: isDarkMode ? '#0a1624' : '#0f2a43',
        color: '#e2e8f0',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: `linear-gradient(135deg, ${brand.secondary}, #67e8f9)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Upaman.com
          </div>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem'
          }}>
            Decision-first financial tools with transparent assumptions and workflow-led guidance.<br />
            Most calculations run locally in your browser for speed and privacy.
          </p>

          <p style={{
            color: '#f59e0b',
            fontSize: '0.82rem',
            marginBottom: '1rem'
          }}>
            UK Rail Planner is currently in beta: smart estimates are always available, live departures depend on API/network access.
          </p>
          
          {/* Legal Links - Required for AdSense */}
          <div style={{
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            <a
              href="/methodology"
              style={{
                color: '#9dd6ff',
                textDecoration: 'none',
                margin: '0 1rem',
                borderBottom: '1px solid transparent',
                transition: 'border-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.borderBottomColor = '#60a5fa'}
              onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}
            >
              Methodology
            </a>
            <a
              href="/editorial-policy"
              style={{
                color: '#60a5fa',
                textDecoration: 'none',
                margin: '0 1rem',
                borderBottom: '1px solid transparent',
                transition: 'border-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.borderBottomColor = '#60a5fa'}
              onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}
            >
              Editorial Policy
            </a>
            <a 
              href="/privacy-policy" 
              style={{
                color: '#60a5fa',
                textDecoration: 'none',
                margin: '0 1rem',
                borderBottom: '1px solid transparent',
                transition: 'border-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.borderBottomColor = '#60a5fa'}
              onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}
            >
              Privacy Policy
            </a>
            <a 
              href="/terms-of-service" 
              style={{
                color: '#60a5fa',
                textDecoration: 'none',
                margin: '0 1rem',
                borderBottom: '1px solid transparent',
                transition: 'border-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.borderBottomColor = '#60a5fa'}
              onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}
            >
              Terms of Service
            </a>
            <a
              href="/about"
              style={{
                color: '#60a5fa',
                textDecoration: 'none',
                margin: '0 1rem',
                borderBottom: '1px solid transparent',
                transition: 'border-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.borderBottomColor = '#60a5fa'}
              onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}
            >
              About Us
            </a>
            <a
              href="/contact"
              style={{
                color: '#60a5fa',
                textDecoration: 'none',
                margin: '0 1rem',
                borderBottom: '1px solid transparent',
                transition: 'border-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.borderBottomColor = '#60a5fa'}
              onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}
            >
              Contact
            </a>
          </div>

          <div style={{
            marginBottom: '1rem',
            fontSize: '0.82rem'
          }}>
            <a href="/publisher-standards" style={{ color: '#93c5fd', textDecoration: 'none', margin: '0 0.6rem' }}>Publisher Standards</a>
            <a href="/advertising-policy" style={{ color: '#93c5fd', textDecoration: 'none', margin: '0 0.6rem' }}>Advertising Policy</a>
            <a href="/corrections-policy" style={{ color: '#93c5fd', textDecoration: 'none', margin: '0 0.6rem' }}>Corrections Policy</a>
            <a href="/affiliate-disclosure" style={{ color: '#93c5fd', textDecoration: 'none', margin: '0 0.6rem' }}>Affiliate Disclosure</a>
            <a href="/cookie-policy" style={{ color: '#93c5fd', textDecoration: 'none', margin: '0 0.6rem' }}>Cookie Policy</a>
          </div>

          <div style={{
            marginBottom: '1rem',
            fontSize: '0.82rem'
          }}>
            <a href="/guide-emi-prepayment-strategy.html" style={{ color: '#93c5fd', textDecoration: 'none', margin: '0 0.6rem' }}>EMI Guide</a>
            <a href="/guide-income-tax-regime-choice.html" style={{ color: '#93c5fd', textDecoration: 'none', margin: '0 0.6rem' }}>Tax Regime Guide</a>
            <a href="/guide-sip-step-up-planning.html" style={{ color: '#93c5fd', textDecoration: 'none', margin: '0 0.6rem' }}>SIP Guide</a>
            <a href="/guide-ctc-inhand-breakdown.html" style={{ color: '#93c5fd', textDecoration: 'none', margin: '0 0.6rem' }}>Salary Guide</a>
          </div>
          
          <p style={{
            color: '#64748b',
            fontSize: '0.75rem',
            marginTop: '1rem'
          }}>
            © 2026 Upaman.com. For informational purposes only. Consult professionals for financial decisions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLandingPage;
