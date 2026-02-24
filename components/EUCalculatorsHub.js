import React, { useMemo, useState } from 'react';
import { BadgePercent, Banknote, Landmark } from 'lucide-react';
import { useRouter } from 'next/router';
import HomeButton from './HomeButton';

const EUCalculatorsHub = () => {
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
        title: 'European VAT Calculator',
        description: 'Calculate VAT for 15 European countries with inclusive/exclusive and reverse VAT modes.',
        icon: BadgePercent,
        path: '/eu-vat-calculator',
        tags: ['15 countries', 'Inclusive/exclusive VAT', 'Rate comparison']
      },
      {
        title: 'European Salary Calculator',
        description: 'Estimate net salary after tax and social contributions across key European countries.',
        icon: Banknote,
        path: '/european-salary-calculator',
        tags: ['Net salary', 'Social contributions', 'Country comparison']
      },
      {
        title: 'UK Income Tax Calculator',
        description: 'Estimate UK income tax for 2025-26 with Scottish rates and National Insurance.',
        icon: Landmark,
        path: '/uk-income-tax-calculator',
        tags: ['2025-26 tax year', 'Scottish rates', 'NI included']
      },
      {
        title: 'Germany Salary Calculator',
        description: 'Estimate Germany net salary with income tax, social insurance, and solidarity surcharge.',
        icon: Banknote,
        path: '/germany-salary-calculator',
        tags: ['Brutto to netto', 'Social insurance', 'Take-home estimate']
      },
      {
        title: 'France Salary Calculator',
        description: 'Estimate France take-home salary after income tax and social contributions.',
        icon: Banknote,
        path: '/france-salary-calculator',
        tags: ['Salaire net', 'Social charges', 'Tax estimate']
      },
      {
        title: 'Netherlands Salary Calculator',
        description: 'Estimate Dutch net salary with box-1 tax and common tax-credit adjustment.',
        icon: Banknote,
        path: '/netherlands-salary-calculator',
        tags: ['Dutch tax', 'Tax credits', 'Net pay estimate']
      }
    ],
    []
  );

  return (
    <div
      className="calculator-container hub-landing-container"
      style={{
        background: isDarkMode
          ? 'radial-gradient(circle at 10% 15%, rgba(15, 118, 110, 0.24), transparent 34%), linear-gradient(135deg, #081424 0%, #10243a 100%)'
          : 'radial-gradient(circle at 10% 15%, rgba(15, 118, 110, 0.14), transparent 34%), linear-gradient(135deg, #f6f4ef 0%, #e8f1ee 100%)'
      }}
    >
      <div className="hub-landing-shell" style={{ maxWidth: '1160px', margin: '0 auto', padding: '0.4rem clamp(0.55rem, 2.6vw, 0.9rem) 2.4rem' }}>
        <div className="calculator-card">
          <div className="calculator-header emi-header">
            <div className="header-nav">
              <HomeButton style={{ position: 'static', top: 'auto', left: 'auto', zIndex: 'auto' }} />
              <div className="flex-spacer"></div>
            </div>
            <h1 className="header-title">EU & UK Calculators Hub</h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
              Start with high-intent EU and UK tools for VAT, annual tax, and country-specific salary decisions.
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
                        background: 'linear-gradient(135deg, #0f766e, #115e59)',
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
                            background: isDarkMode ? 'rgba(15, 118, 110, 0.24)' : 'rgba(204, 251, 241, 0.85)',
                            color: isDarkMode ? '#99f6e4' : '#0f766e'
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

export default EUCalculatorsHub;
