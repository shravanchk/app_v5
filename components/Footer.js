import React from 'react';

const Footer = () => {
  const sectionTitleStyle = {
    fontSize: '0.95rem',
    fontWeight: '700',
    marginBottom: '0.8rem',
    color: '#99f6e4',
    letterSpacing: '0.02em',
    textTransform: 'uppercase'
  };

  const linkStyle = {
    color: '#bfdbfe',
    textDecoration: 'none',
    lineHeight: 1.7
  };

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0b1726 0%, #13273e 100%)',
      color: '#e2e8f0',
      padding: '2.5rem 1.25rem 2rem',
      marginTop: '4rem',
      borderTop: '1px solid rgba(148, 163, 184, 0.24)',
      fontFamily: 'var(--app-font)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem 1.25rem',
          marginBottom: '1.6rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.22)'
        }}>
          <div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#e2e8f0'
            }}>
              Upaman
            </div>
            <div style={{
              color: '#94a3b8',
              fontSize: '0.84rem',
              marginTop: '0.25rem'
            }}>
              Financial calculators and workflows for practical decisions.
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 118, 110, 0.11)',
          borderRadius: '12px',
          padding: '1rem 1rem 0.9rem',
          marginBottom: '1.6rem',
          border: '1px solid rgba(94, 234, 212, 0.2)'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '700',
            marginBottom: '0.55rem',
            color: '#99f6e4'
          }}>
            Use and accuracy notice
          </h3>
          <div style={{
            fontSize: '0.86rem',
            lineHeight: 1.6,
            color: '#cbd5e1'
          }}>
            <p>Calculators provide informational estimates using published rates and formula assumptions.</p>
            <p>Tax rules, deductions, and market conditions can change and vary by individual case.</p>
            <p>Verify critical decisions with official sources or a qualified advisor.</p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.5rem',
          paddingTop: '0.5rem'
        }}>
          <div>
            <h4 style={sectionTitleStyle}>
              Indian Calculators
            </h4>
            <div style={{
              fontSize: '0.85rem'
            }}>
              <a href="/india-calculators" style={linkStyle}>India Calculators Hub</a><br/>
              <a href="/gst-calculator" style={linkStyle}>GST Calculator</a> • <a href="/income-tax-calculator" style={linkStyle}>Income Tax Calculator</a><br/>
              <a href="/sip-calculator" style={linkStyle}>SIP Calculator</a> • <a href="/loan-calculator" style={linkStyle}>Loan EMI Calculator</a><br/>
              <a href="/ppf-calculator" style={linkStyle}>PPF Calculator</a> • <a href="/credit-card-trap-calculator" style={linkStyle}>Credit Card Trap Calculator</a><br/>
              <a href="/salary-calculator" style={linkStyle}>Salary Calculator</a> • <a href="/irctc-calculator" style={linkStyle}>IRCTC Calculator</a><br/>
              <a href="/age-calculator" style={linkStyle}>Age Calculator</a> • <a href="/json-tools" style={linkStyle}>JSON Tools</a><br/>
              <a href="/scientific-calculator" style={linkStyle}>Scientific Calculator</a> • <a href="/statistics-calculator" style={linkStyle}>Statistics Calculator</a><br/>
              <a href="/unit-converter" style={linkStyle}>Engineering Unit Converter</a>
            </div>
          </div>
          
          <div>
            <h4 style={sectionTitleStyle}>
              European Calculators
            </h4>
            <div style={{
              fontSize: '0.85rem'
            }}>
              <a href="/eu-calculators" style={linkStyle}>EU & UK Calculators Hub</a><br/>
              <a href="/uk-income-tax-calculator" style={linkStyle}>UK Income Tax Calculator</a><br/>
              <a href="/eu-vat-calculator" style={linkStyle}>EU VAT Calculator (15 Countries)</a><br/>
              <a href="/european-salary-calculator" style={linkStyle}>European Salary Calculator</a><br/>
              <a href="/germany-salary-calculator" style={linkStyle}>Germany Salary Calculator</a><br/>
              <a href="/france-salary-calculator" style={linkStyle}>France Salary Calculator</a><br/>
              <a href="/netherlands-salary-calculator" style={linkStyle}>Netherlands Salary Calculator</a><br/>
              <a href="/uk-rail-calculator" style={linkStyle}>UK Rail Journey Planner (Beta)</a>
            </div>
          </div>

          <div>
            <h4 style={sectionTitleStyle}>
              US Calculators
            </h4>
            <div style={{
              fontSize: '0.85rem'
            }}>
              <a href="/us-calculators" style={linkStyle}>US Calculators Hub</a><br/>
              <a href="/us-mortgage-calculator" style={linkStyle}>US Mortgage Calculator</a><br/>
              <a href="/us-refinance-calculator" style={linkStyle}>US Refinance Calculator</a><br/>
              <a href="/us-auto-loan-calculator" style={linkStyle}>US Auto Loan Calculator</a><br/>
              <a href="/us-401k-calculator" style={linkStyle}>US 401(k) Calculator</a><br/>
              <a href="/us-savings-cd-calculator" style={linkStyle}>US Savings & CD Calculator</a><br/>
              <a href="/us-credit-card-payoff-calculator" style={linkStyle}>US Credit Card Payoff Calculator</a>
            </div>
          </div>
          
          <div>
            <h4 style={sectionTitleStyle}>
              Policy and Trust
            </h4>
            <div style={{
              fontSize: '0.85rem'
            }}>
              <a href="/methodology.html" style={linkStyle}>Methodology & Formula Notes</a><br/>
              <a href="/editorial-policy.html" style={linkStyle}>Editorial Policy</a><br/>
              <a href="/about.html" style={linkStyle}>About Upaman</a><br/>
              <a href="/privacy-policy.html" style={linkStyle}>Privacy Policy</a> • <a href="/terms-of-service.html" style={linkStyle}>Terms</a>
            </div>
          </div>

          <div>
            <h4 style={sectionTitleStyle}>
              Learning Guides
            </h4>
            <div style={{
              fontSize: '0.85rem'
            }}>
              <a href="/guide-emi-prepayment-strategy.html" style={linkStyle}>EMI Prepayment Guide</a><br/>
              <a href="/guide-income-tax-regime-choice.html" style={linkStyle}>Tax Regime Guide</a><br/>
              <a href="/guide-sip-step-up-planning.html" style={linkStyle}>SIP Step-up Guide</a><br/>
              <a href="/guide-credit-card-minimum-due-trap.html" style={linkStyle}>Credit Card Trap Guide</a><br/>
              <a href="/guide-ctc-inhand-breakdown.html" style={linkStyle}>CTC to In-hand Guide</a>
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          paddingTop: '1.2rem',
          marginTop: '1.5rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.22)',
          fontSize: '0.78rem',
          color: '#94a3b8',
          lineHeight: 1.6
        }}>
          © 2026 Upaman. Educational and informational tools only.
          <br />
          Not affiliated with any government agency, railway operator, or financial institution.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
