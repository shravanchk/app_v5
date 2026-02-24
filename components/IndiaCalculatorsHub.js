import React, { useMemo, useState } from 'react';
import { Train, Calculator, TrendingUp, PiggyBank, Target, Banknote, Wallet } from 'lucide-react';
import { useRouter } from 'next/router';
import HomeButton from './HomeButton';

const IndiaCalculatorsHub = () => {
  const router = useRouter();
  const [isDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });
  const baseCardShadow = isDarkMode
    ? '0 8px 20px -8px rgba(0, 0, 0, 0.5)'
    : '0 10px 24px -10px rgba(9, 30, 66, 0.22)';
  const hoverCardShadow = isDarkMode
    ? '0 16px 32px -8px rgba(0, 0, 0, 0.62)'
    : '0 18px 30px -10px rgba(9, 30, 66, 0.3)';
  const baseBorderColor = isDarkMode ? '#34516e' : '#d4deea';
  const hoverBorderColor = isDarkMode ? '#3f556f' : '#bfccd8';

  const cards = useMemo(
    () => [
      {
        title: 'Loan & EMI Calculator',
        description: 'Calculate EMI, prepayment impact, and amortization for home, car, and personal loans.',
        icon: Calculator,
        path: '/loan-calculator',
        tags: ['EMI breakdown', 'Prepayment savings', 'Amortization']
      },
      {
        title: 'Income Tax Calculator',
        description: 'Estimate income tax for FY 2025-26 with old/new regime comparison.',
        icon: Target,
        path: '/income-tax-calculator',
        tags: ['FY 2025-26', 'Old vs new regime', 'Tax estimate']
      },
      {
        title: 'GST Calculator',
        description: 'Add/remove/reverse GST with CGST, SGST, and IGST split.',
        icon: Calculator,
        path: '/gst-calculator',
        tags: ['Inclusive/exclusive', 'CGST/SGST/IGST', 'Rate-wise']
      },
      {
        title: 'SIP Calculator',
        description: 'Estimate SIP corpus with expected returns and goal-based planning.',
        icon: TrendingUp,
        path: '/sip-calculator',
        tags: ['Future value', 'Goal planning', 'Return assumptions']
      },
      {
        title: 'PPF Calculator',
        description: 'Project PPF maturity with year-wise contribution and interest assumptions.',
        icon: PiggyBank,
        path: '/ppf-calculator',
        tags: ['15-year plan', 'Year-wise table', 'Maturity estimate']
      },
      {
        title: 'Salary Calculator',
        description: 'Convert CTC to in-hand salary with key deduction estimates.',
        icon: Banknote,
        path: '/salary-calculator',
        tags: ['CTC to net', 'Deduction view', 'Monthly take-home']
      },
      {
        title: 'IRCTC Booking Calculator',
        description: 'Get exact booking date/timing windows for regular and Tatkal booking.',
        icon: Train,
        path: '/irctc-calculator',
        tags: ['Booking date', 'Tatkal timing', 'Quick planning']
      },
      {
        title: 'Credit Card Trap Calculator',
        description: 'Compare minimum due vs fixed payment and estimate payoff time.',
        icon: Wallet,
        path: '/credit-card-trap-calculator',
        tags: ['Debt payoff', 'Interest saved', 'Monthly strategy']
      }
    ],
    []
  );

  return (
    <div
      className="calculator-container hub-landing-container"
      style={{
        background: isDarkMode
          ? 'radial-gradient(circle at 10% 15%, rgba(180, 83, 9, 0.22), transparent 34%), linear-gradient(135deg, #081424 0%, #10243a 100%)'
          : 'radial-gradient(circle at 10% 15%, rgba(180, 83, 9, 0.14), transparent 34%), linear-gradient(135deg, #f6f4ef 0%, #f0ece1 100%)'
      }}
    >
      <div className="hub-landing-shell" style={{ maxWidth: '1160px', margin: '0 auto', padding: '0.4rem clamp(0.55rem, 2.6vw, 0.9rem) 2.4rem' }}>
        <div className="calculator-card">
          <div className="calculator-header emi-header">
            <div className="header-nav">
              <HomeButton style={{ position: 'static', top: 'auto', left: 'auto', zIndex: 'auto' }} />
              <div className="flex-spacer"></div>
            </div>
            <h1 className="header-title">India Calculators Hub</h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
              Start with high-intent India tools for tax, borrowing, investing, salary, and booking decisions.
            </p>
          </div>

          <div className="mobile-card-content">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                gap: '1rem'
              }}
            >
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.path}
                    type="button"
                    onClick={() => router.push(card.path)}
                    style={{
                      textAlign: 'left',
                      borderRadius: '1rem',
                      border: `1px solid ${baseBorderColor}`,
                      background: isDarkMode ? 'rgba(18, 37, 56, 0.8)' : 'rgba(255, 255, 255, 0.88)',
                      padding: '1rem',
                      cursor: 'pointer',
                      color: isDarkMode ? '#e2e8f0' : '#1e293b',
                      transition: 'transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease',
                      boxShadow: baseCardShadow
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = hoverCardShadow;
                      e.currentTarget.style.borderColor = hoverBorderColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = baseCardShadow;
                      e.currentTarget.style.borderColor = baseBorderColor;
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = hoverCardShadow;
                      e.currentTarget.style.borderColor = hoverBorderColor;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = baseCardShadow;
                      e.currentTarget.style.borderColor = baseBorderColor;
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #0f2a43, #b45309)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <Icon size={22} color="#fff" />
                    </div>
                    <h2 style={{ margin: '0 0 0.45rem 0', fontSize: '1.02rem', fontWeight: 700 }}>{card.title}</h2>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.87rem', lineHeight: 1.5, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      {card.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.56rem',
                            borderRadius: '999px',
                            background: isDarkMode ? 'rgba(180, 83, 9, 0.24)' : 'rgba(254, 243, 199, 0.95)',
                            color: isDarkMode ? '#fdba74' : '#9a3412'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaCalculatorsHub;
