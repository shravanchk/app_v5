import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import HomeButton from './HomeButton';
import SearchLandingSections from './calculator/SearchLandingSections';
import { PieBreakdownChart, ComparisonBars } from './calculator/ResultVisualizations';

const monthlyEmi = (principal, annualRate, years) => {
  const n = years * 12;
  const r = annualRate / 12 / 100;
  if (!principal || !n) return 0;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
};

const BuyVsRentCalculator = () => {
  const [homePrice, setHomePrice] = useState(10000000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanYears, setLoanYears] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(35000);
  const [rentIncrease, setRentIncrease] = useState(6);
  const [homeAppreciation, setHomeAppreciation] = useState(5);
  const [analysisYears, setAnalysisYears] = useState(20);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const result = useMemo(() => {
    const downPayment = (homePrice * downPaymentPct) / 100;
    const loanPrincipal = Math.max(0, homePrice - downPayment);
    const emi = monthlyEmi(loanPrincipal, loanRate, loanYears);
    const monthlyRate = loanRate / 12 / 100;
    const maxMonths = analysisYears * 12;
    let outstanding = loanPrincipal;
    let cumulativeBuyOutflow = downPayment;
    let cumulativeRentOutflow = 0;
    let breakEvenYear = null;

    for (let month = 1; month <= maxMonths; month += 1) {
      const interest = outstanding * monthlyRate;
      const principalPaid = Math.min(outstanding, Math.max(0, emi - interest));
      outstanding = Math.max(0, outstanding - principalPaid);

      const yearIndex = Math.ceil(month / 12);
      const currentRent = monthlyRent * Math.pow(1 + rentIncrease / 100, yearIndex - 1);
      const currentHomeValue = homePrice * Math.pow(1 + homeAppreciation / 100, yearIndex - 1);
      const maintenanceAndTaxMonthly = (currentHomeValue * 0.015) / 12;

      cumulativeBuyOutflow += emi + maintenanceAndTaxMonthly;
      cumulativeRentOutflow += currentRent;

      const equity = currentHomeValue - outstanding;
      const buyEffectiveCost = cumulativeBuyOutflow - equity;

      if (!breakEvenYear && month % 12 === 0 && buyEffectiveCost <= cumulativeRentOutflow) {
        breakEvenYear = yearIndex;
      }
    }

    const finalHomeValue = homePrice * Math.pow(1 + homeAppreciation / 100, analysisYears);
    const finalEquity = finalHomeValue - outstanding;
    const buyEffectiveCostFinal = cumulativeBuyOutflow - finalEquity;
    const winner = buyEffectiveCostFinal <= cumulativeRentOutflow ? 'Buying' : 'Renting';

    return {
      downPayment,
      loanPrincipal,
      emi,
      breakEvenYear,
      cumulativeBuyOutflow,
      cumulativeRentOutflow,
      buyEffectiveCostFinal,
      finalEquity,
      winner
    };
  }, [analysisYears, downPaymentPct, homeAppreciation, homePrice, loanRate, loanYears, monthlyRent, rentIncrease]);

  const maxBar = Math.max(result.cumulativeBuyOutflow, result.cumulativeRentOutflow, 1);
  const effectiveBuyCost = Math.max(0, result.buyEffectiveCostFinal);

  return (
    <div className="calculator-container" style={{ background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)' }}>
      <Head>
        <title>Buy vs Rent Calculator India | Home Decision Tool | Upaman</title>
        <meta
          name="description"
          content="Compare buying vs renting a house in India with EMI, rent escalation, home appreciation, and break-even timeline."
        />
        <link rel="canonical" href="https://upaman.com/buy-vs-rent-calculator" />
      </Head>

      <div className="calculator-card">
        <div className="calculator-header emi-header">
          <div className="header-nav">
            <HomeButton style={{ position: 'static', top: 'auto', left: 'auto', zIndex: 'auto' }} />
            <div className="flex-spacer" />
          </div>
          <h1 className="header-title">Buy vs Rent Calculator (India)</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Estimate break-even timeline using home price, EMI, rent escalation, and home appreciation assumptions.
          </p>
        </div>

        <div className="mobile-card-content">
          <section style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#f8fafc', padding: '1rem', marginBottom: '1rem' }}>
            <div className="responsive-grid">
              <div>
                <label className="input-label">Home Price (INR)</label>
                <input className="calculator-input mobile-input" type="number" value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Down Payment (%)</label>
                <input className="calculator-input mobile-input" type="number" value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Loan Interest Rate (%)</label>
                <input className="calculator-input mobile-input" type="number" step="0.1" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Loan Tenure (Years)</label>
                <input className="calculator-input mobile-input" type="number" value={loanYears} onChange={(e) => setLoanYears(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Monthly Rent (INR)</label>
                <input className="calculator-input mobile-input" type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Annual Rent Increase (%)</label>
                <input className="calculator-input mobile-input" type="number" value={rentIncrease} onChange={(e) => setRentIncrease(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Home Appreciation (%)</label>
                <input className="calculator-input mobile-input" type="number" value={homeAppreciation} onChange={(e) => setHomeAppreciation(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="input-label">Analysis Period (Years)</label>
                <input className="calculator-input mobile-input" type="number" value={analysisYears} onChange={(e) => setAnalysisYears(Number(e.target.value) || 0)} />
              </div>
            </div>
          </section>

          <section style={{ border: '1px solid #dbe2eb', borderRadius: '0.9rem', background: '#ffffff', padding: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ marginTop: 0, color: '#0f2a43', fontSize: '1.05rem' }}>Decision Summary</h2>
            <p style={{ marginTop: 0, color: '#334155' }}>
              Based on current assumptions, <strong>{result.winner}</strong> appears more favorable over {analysisYears} years.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: '#eff6ff', borderRadius: '0.75rem', padding: '0.8rem' }}>
                <div style={{ color: '#1d4e89', fontWeight: 700 }}>Estimated EMI</div>
                <div style={{ color: '#0f2a43', fontSize: '1.1rem', fontWeight: 700 }}>{formatCurrency(result.emi)}</div>
                <div style={{ color: '#475569', fontSize: '0.82rem' }}>Down payment: {formatCurrency(result.downPayment)}</div>
              </div>
              <div style={{ background: '#ecfeff', borderRadius: '0.75rem', padding: '0.8rem' }}>
                <div style={{ color: '#0f766e', fontWeight: 700 }}>Break-even Year</div>
                <div style={{ color: '#0f766e', fontSize: '1.1rem', fontWeight: 700 }}>
                  {result.breakEvenYear ? `Year ${result.breakEvenYear}` : 'Not reached'}
                </div>
                <div style={{ color: '#475569', fontSize: '0.82rem' }}>Final equity: {formatCurrency(result.finalEquity)}</div>
              </div>
            </div>

            <div style={{ marginTop: '0.9rem', display: 'grid', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.2rem' }}>Cumulative buying outflow</div>
                <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${(result.cumulativeBuyOutflow / maxBar) * 100}%`, height: '100%', background: '#1d4e89' }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.2rem' }}>Cumulative renting outflow</div>
                <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${(result.cumulativeRentOutflow / maxBar) * 100}%`, height: '100%', background: '#0f766e' }} />
                </div>
              </div>
            </div>
          </section>

          <PieBreakdownChart
            title="Buy-side composition at analysis end"
            items={[
              { label: 'Cash outflow (buy path)', value: result.cumulativeBuyOutflow, color: '#3b82f6' },
              { label: 'Home equity built', value: Math.max(0, result.finalEquity), color: '#22c55e' }
            ]}
            formatter={formatCurrency}
          />

          <ComparisonBars
            title="Decision cost comparison"
            items={[
              { label: 'Buy effective cost', value: effectiveBuyCost, color: '#1d4e89' },
              { label: 'Rent total outflow', value: result.cumulativeRentOutflow, color: '#0f766e' }
            ]}
            formatter={formatCurrency}
          />

          <SearchLandingSections
            intro={(
              <p>
                Buy vs rent is not just an EMI question. It is a long-term cash-flow and wealth decision that depends on
                rent growth, property appreciation, down payment, and holding period. This calculator helps you compare
                effective costs and identify when buying may become financially favorable.
              </p>
            )}
            example={(
              <p>
                If home price is ₹1 crore with 20% down payment and rent is ₹35,000/month, you can test how different
                rent-growth and appreciation assumptions change break-even year. This is useful before committing to
                long-tenure home loans or deciding to keep renting.
              </p>
            )}
            formula={(
              <p>
                EMI is computed using reducing-balance amortization. Buying outflow combines down payment, EMI, and
                ownership overhead assumptions. Renting outflow compounds yearly by rent increase. Break-even is estimated
                where buy effective cost (cash outflow minus accumulated home equity) becomes lower than rent outflow.
              </p>
            )}
            faqItems={[
              {
                question: 'Does this include home maintenance costs?',
                answer: 'Yes. The model includes a simple annual ownership overhead assumption to avoid unrealistic buy-side underestimation.'
              },
              {
                question: 'Can break-even vary a lot?',
                answer: 'Yes. Small changes in appreciation, rent growth, or interest rate can materially shift break-even year.'
              },
              {
                question: 'Should I decide only based on this result?',
                answer: 'No. Combine this with liquidity, job stability, location preference, and emergency fund readiness before final decision.'
              }
            ]}
            relatedLinks={[
              { label: 'Loan & EMI Calculator', href: '/loan-calculator' },
              { label: 'Home Loan Readiness Workflow', href: '/home-loan-readiness-workflow' },
              { label: 'EMI Prepayment Strategy Guide', href: '/guide-emi-prepayment-strategy.html' }
            ]}
            softwareSchema={{
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Buy vs Rent Calculator India',
              url: 'https://upaman.com/buy-vs-rent-calculator',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BuyVsRentCalculator;
