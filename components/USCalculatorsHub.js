import React, { useMemo, useState } from 'react';
import { Car, Landmark, RefreshCcw, PiggyBank, Wallet } from 'lucide-react';
import { useRouter } from 'next/router';
import HomeButton from './HomeButton';

const USCalculatorsHub = () => {
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
        title: 'US Mortgage Calculator',
        description: 'Estimate monthly payment with principal, interest, property tax, insurance, HOA, and PMI.',
        icon: Landmark,
        path: '/us-mortgage-calculator',
        tags: ['PITI + PMI', 'Affordability ratio', 'Interest estimate']
      },
      {
        title: 'US Refinance Break-even Calculator',
        description: 'Compare current mortgage vs refinance offer and estimate break-even months.',
        icon: RefreshCcw,
        path: '/us-refinance-calculator',
        tags: ['Break-even', 'Cost recovery', 'Savings estimate']
      },
      {
        title: 'US Auto Loan Calculator',
        description: 'Calculate monthly car payment using sales tax, trade-in value, fees, APR, and term.',
        icon: Car,
        path: '/us-auto-loan-calculator',
        tags: ['Car financing', 'APR impact', 'Total cost']
      },
      {
        title: 'US 401(k) Calculator',
        description: 'Project retirement balance with salary growth, contribution rate, and employer match.',
        icon: PiggyBank,
        path: '/us-401k-calculator',
        tags: ['Retirement planning', 'Employer match', 'Projection table']
      },
      {
        title: 'US Savings & CD Calculator',
        description: 'Estimate savings APY growth and CD maturity value for your deposit timeline.',
        icon: Landmark,
        path: '/us-savings-cd-calculator',
        tags: ['APY growth', 'CD maturity', 'Interest estimate']
      },
      {
        title: 'US Credit Card Payoff Calculator',
        description: 'Compare minimum payment and fixed payment plans to reduce debt faster.',
        icon: Wallet,
        path: '/us-credit-card-payoff-calculator',
        tags: ['Debt payoff', 'APR impact', 'Interest saved']
      }
    ],
    []
  );

  return (
    <div
      className="calculator-container hub-landing-container"
      style={{
        background: isDarkMode
          ? 'radial-gradient(circle at 10% 15%, rgba(30, 64, 175, 0.24), transparent 34%), linear-gradient(135deg, #081424 0%, #10243a 100%)'
          : 'radial-gradient(circle at 10% 15%, rgba(30, 64, 175, 0.14), transparent 34%), linear-gradient(135deg, #f6f4ef 0%, #e8eef6 100%)'
      }}
    >
      <div className="hub-landing-shell" style={{ maxWidth: '1160px', margin: '0 auto', padding: '0.4rem clamp(0.55rem, 2.6vw, 0.9rem) 2.4rem' }}>
        <div className="calculator-card">
          <div className="calculator-header emi-header">
            <div className="header-nav">
              <HomeButton style={{ position: 'static', top: 'auto', left: 'auto', zIndex: 'auto' }} />
              <div className="flex-spacer"></div>
            </div>
            <h1 className="header-title">US Calculators Hub</h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
              Start with high-intent US tools for home and vehicle financing decisions.
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
                        background: 'linear-gradient(135deg, #0f2a43, #1d4e89)',
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
                            background: isDarkMode ? 'rgba(30, 64, 175, 0.24)' : 'rgba(219, 234, 254, 0.9)',
                            color: isDarkMode ? '#bfdbfe' : '#1e40af'
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

            <div style={{ marginTop: '1.35rem', fontSize: '0.86rem', color: '#475569', lineHeight: 1.55 }}>
              <p style={{ margin: 0 }}>
                Use these tools for high-intent US decisions across housing, vehicles, retirement, savings, and debt payoff.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default USCalculatorsHub;
