import React from 'react';

const AffiliateRecommendations = ({ calculatorType, result, isDarkMode = false }) => {
  const enableAffiliateRecommendations = process.env.NEXT_PUBLIC_ENABLE_AFFILIATE_RECOMMENDATIONS === 'true';

  if (!enableAffiliateRecommendations) return null;

  const recommendations = {
    emi: [
      {
        title: "Get Best Personal Loan Rates",
        description: "Compare rates from 15+ banks. Quick approval in 24 hours.",
        cta: "Apply Now",
        link: "https://www.bankbazaar.com/personal-loan.html", // Example affiliate link
        highlight: "Starting from 10.75% p.a."
      },
      {
        title: "Home Loan Calculator & Apply",
        description: "Get home loans up to ₹10 crores with minimal documentation.",
        cta: "Check Eligibility", 
        link: "https://www.hdfcbank.com/personal/borrow/home-loan", // Example link
        highlight: "Up to 90% funding"
      }
    ],
    sip: [
      {
        title: "Start SIP Investment - Zerodha",
        description: "Invest in top-rated mutual funds with zero commission on Zerodha Coin.",
        cta: "Start Investing",
        link: "https://coin.zerodha.com/", // Example link
        highlight: "₹500 minimum SIP"
      },
      {
        title: "Investment Advisory - Groww",
        description: "Get personalized investment recommendations from certified advisors.",
        cta: "Get Analysis",
        link: "https://groww.in/mutual-funds", // Example link
        highlight: "Free consultation"
      }
    ],
    gst: [
      {
        title: "ClearTax GST Software",
        description: "Automate GST filing with 99.9% accuracy. Trusted by 10L+ businesses.",
        cta: "Try Free",
        link: "https://cleartax.in/s/gst-software", // Example affiliate link
        highlight: "30-day free trial"
      },
      {
        title: "Zoho Books Accounting",
        description: "Complete accounting solution with inventory & invoicing.",
        cta: "Start Free Trial",
        link: "https://www.zoho.com/books/", // Example link
        highlight: "₹499/month"
      }
    ],
    tax: [
      {
        title: "File Income Tax with ClearTax",
        description: "Expert CA assistance for ITR filing. Maximum refund guaranteed.",
        cta: "File Now",
        link: "https://cleartax.in/s/income-tax-efiling", // Example affiliate link
        highlight: "Starting ₹499"
      },
      {
        title: "Tax Saving ELSS Funds",
        description: "Save tax up to ₹46,800 with Section 80C investments via Groww.",
        cta: "Save Tax",
        link: "https://groww.in/mutual-funds/category/elss", // Example link
        highlight: "ELSS funds available"
      }
    ],
    salary: [
      {
        title: "Find High-Paying Jobs - Naukri",
        description: "Discover job opportunities with better salary packages and career growth.",
        cta: "Search Jobs",
        link: "https://www.naukri.com/", // Example affiliate link
        highlight: "Top companies hiring"
      },
      {
        title: "Upskill for Higher Salary - Coursera",
        description: "Learn in-demand skills to negotiate better salary packages.",
        cta: "Browse Courses",
        link: "https://www.coursera.org/", // Example link
        highlight: "Professional certificates"
      }
    ],
    age: [
      {
        title: "Life Insurance Calculator",
        description: "Calculate the right life insurance coverage for your age and family needs.",
        cta: "Calculate Coverage",
        link: "https://www.policybazaar.com/life-insurance/", // Example affiliate link
        highlight: "Free comparison"
      },
      {
        title: "Retirement Planning Tools",
        description: "Plan your retirement savings based on your current age and goals.",
        cta: "Start Planning",
        link: "https://groww.in/calculators/retirement-calculator", // Example link
        highlight: "Goal-based planning"
      }
    ],
    vat: [
      {
        title: "Xero European Accounting",
        description: "Complete accounting software with multi-currency VAT compliance for European businesses.",
        cta: "Start Free Trial",
        link: "https://www.xero.com/uk/", // Example affiliate link
        highlight: "30-day free trial"
      },
      {
        title: "Sage Business Accounting",
        description: "VAT compliance made simple for UK & EU businesses with automated submissions.",
        cta: "Try Free",
        link: "https://www.sage.com/en-gb/products/sage-business-cloud-accounting/", // Example link
        highlight: "£10/month"
      }
    ],
    'european-salary': [
      {
        title: "HSBC European Banking",
        description: "Multi-currency accounts and international transfers for European professionals.",
        cta: "Open Account",
        link: "https://www.hsbc.co.uk/current-accounts/", // Example affiliate link
        highlight: "Fee-free transfers"
      },
      {
        title: "Wise Multi-Currency Card",
        description: "Spend in 50+ currencies with real exchange rates. Perfect for European workers.",
        cta: "Get Card",
        link: "https://wise.com/gb/card/", // Example link
        highlight: "No hidden fees"
      },
      {
        title: "European Tax Advisory",
        description: "Professional tax planning services for cross-border European employment.",
        cta: "Free Consultation",
        link: "https://www.pwc.com/gx/en/services/tax.html", // Example link
        highlight: "Expert guidance"
      }
    ],
    'uk-tax': [
      {
        title: "Monzo UK Banking",
        description: "Smart UK bank account with budgeting tools and salary management features.",
        cta: "Open Account",
        link: "https://monzo.com/", // Example affiliate link
        highlight: "No monthly fees"
      },
      {
        title: "Nutmeg UK Investment",
        description: "ISA and pension investments optimized for UK tax efficiency.",
        cta: "Start Investing",
        link: "https://www.nutmeg.com/", // Example link
        highlight: "£500 minimum"
      },
      {
        title: "UK Tax Return Service",
        description: "Professional self-assessment and tax return filing for UK residents.",
        cta: "File Return",
        link: "https://www.gov.uk/self-assessment-tax-returns", // Example link
        highlight: "HMRC approved"
      }
    ]
  };

  const currentRecommendations = recommendations[calculatorType] || [];

  if (currentRecommendations.length === 0) return null;

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRadius: '12px',
      border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        fontSize: '1.1rem',
        fontWeight: '600',
        color: isDarkMode ? '#e2e8f0' : '#334155',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        💡 Recommended for You
      </h3>
      
      <div style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: currentRecommendations.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))'
      }}>
        {currentRecommendations.map((rec, index) => (
          <div
            key={index}
            style={{
              padding: '1rem',
              background: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {rec.highlight && (
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: '#10b981',
                color: 'white',
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                {rec.highlight}
              </div>
            )}
            
            <h4 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: isDarkMode ? '#e2e8f0' : '#334155'
            }}>
              {rec.title}
            </h4>
            
            <p style={{
              margin: '0 0 1rem 0',
              fontSize: '0.85rem',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              lineHeight: '1.4'
            }}>
              {rec.description}
            </p>
            
            <a
              href={rec.link}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#2563eb'}
              onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
            >
              {rec.cta} →
            </a>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '1rem',
        fontSize: '0.75rem',
        color: isDarkMode ? '#94a3b8' : '#64748b',
        textAlign: 'center'
      }}>
        <em>* These are affiliate recommendations. We may earn a commission at no extra cost to you.</em>
      </div>
    </div>
  );
};

export default AffiliateRecommendations;
