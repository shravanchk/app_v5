import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { Plus, Minus, RotateCcw, Info } from 'lucide-react';
import AffiliateRecommendations from './AffiliateRecommendations';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import HomeButton from './HomeButton';
import ResultActions from './ResultActions';
import { formatINR } from '../utils/calculations';

const GSTCalculator = () => {
  const [activeTab, setActiveTab] = useState('add-gst');
  
  // GST Addition State
  const [addGSTParams, setAddGSTParams] = useState({
    amount: 10000,
    gstRate: 18
  });
  
  // GST Removal State
  const [removeGSTParams, setRemoveGSTParams] = useState({
    amount: 11800,
    gstRate: 18
  });
  
  // Reverse GST State
  const [reverseGSTParams, setReverseGSTParams] = useState({
    inclusiveAmount: 11800,
    gstRate: 18
  });

  // Results
  const [addGSTResult, setAddGSTResult] = useState(null);
  const [removeGSTResult, setRemoveGSTResult] = useState(null);
  const [reverseGSTResult, setReverseGSTResult] = useState(null);

  // GST Addition Calculation
  const calculateAddGST = useCallback(() => {
    const { amount, gstRate } = addGSTParams;
    if (!amount || gstRate === null) return;

    const gstAmount = (amount * gstRate) / 100;
    const totalAmount = amount + gstAmount;

    setAddGSTResult({
      originalAmount: amount,
      gstRate: gstRate,
      gstAmount: gstAmount,
      totalAmount: totalAmount,
      breakdown: {
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        igst: gstAmount
      }
    });
  }, [addGSTParams]);

  // GST Removal Calculation
  const calculateRemoveGST = useCallback(() => {
    const { amount, gstRate } = removeGSTParams;
    if (!amount || !gstRate) return;

    const baseAmount = (amount * 100) / (100 + gstRate);
    const gstAmount = amount - baseAmount;

    setRemoveGSTResult({
      inclusiveAmount: amount,
      gstRate: gstRate,
      baseAmount: baseAmount,
      gstAmount: gstAmount,
      breakdown: {
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        igst: gstAmount
      }
    });
  }, [removeGSTParams]);

  // Reverse GST Calculation
  const calculateReverseGST = useCallback(() => {
    const { inclusiveAmount, gstRate } = reverseGSTParams;
    if (!inclusiveAmount || !gstRate) return;

    const baseAmount = (inclusiveAmount * 100) / (100 + gstRate);
    const gstAmount = inclusiveAmount - baseAmount;

    setReverseGSTResult({
      inclusiveAmount: inclusiveAmount,
      gstRate: gstRate,
      baseAmount: baseAmount,
      gstAmount: gstAmount,
      breakdown: {
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        igst: gstAmount
      }
    });
  }, [reverseGSTParams]);

  // Auto-calculate when params change
  useEffect(() => {
    calculateAddGST();
  }, [calculateAddGST]);

  useEffect(() => {
    calculateRemoveGST();
  }, [calculateRemoveGST]);

  useEffect(() => {
    calculateReverseGST();
  }, [calculateReverseGST]);

  const commonGSTRates = [
    { rate: 0, label: '0% - Essential goods' },
    { rate: 5, label: '5% - Basic necessities' },
    { rate: 12, label: '12% - Standard goods' },
    { rate: 18, label: '18% - Most goods/services' },
    { rate: 28, label: '28% - Luxury items' }
  ];

  const addShareLines = addGSTResult ? [
    `Base amount: ${formatINR(addGSTResult.originalAmount)}`,
    `GST (${addGSTResult.gstRate}%): ${formatINR(addGSTResult.gstAmount)}`,
    `Total amount: ${formatINR(addGSTResult.totalAmount)}`
  ] : [];

  const removeShareLines = removeGSTResult ? [
    `GST-inclusive amount: ${formatINR(removeGSTResult.inclusiveAmount)}`,
    `GST (${removeGSTResult.gstRate}%): ${formatINR(removeGSTResult.gstAmount)}`,
    `Base amount: ${formatINR(removeGSTResult.baseAmount)}`
  ] : [];

  const reverseShareLines = reverseGSTResult ? [
    `GST-inclusive amount: ${formatINR(reverseGSTResult.inclusiveAmount)}`,
    `GST (${reverseGSTResult.gstRate}%): ${formatINR(reverseGSTResult.gstAmount)}`,
    `Base amount: ${formatINR(reverseGSTResult.baseAmount)}`
  ] : [];

  return (
    <div className="calculator-container gst-container">
      <Head>
    <title>GST Calculator India 2025 | Free GST Calculator Online | Upaman</title>
    <meta name="description" content="Free GST Calculator India 2025 by Upaman. Calculate GST online - add, remove, reverse GST with CGST, SGST, IGST breakdown. All GST rates 5%, 12%, 18%, 28%. Business GST compliance tool." />
    <meta name="keywords" content="GST calculator India 2025, GST calculator upaman, free GST calculator online, add GST calculator, remove GST calculator, reverse GST calculator, GST breakdown, CGST SGST IGST calculator, business GST tool, GST compliance calculator" />
    <link rel="canonical" href="https://upaman.com/gst-calculator" />
    <meta property="og:title" content="Free GST Calculator India 2025 | Upaman" />
    <meta property="og:description" content="Free GST Calculator by Upaman - Add, remove & reverse GST with complete CGST, SGST, IGST breakdown. Business tax compliance made easy." />
    <meta property="og:url" content="https://upaman.com/gst-calculator" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
    <meta property="og:image:alt" content="GST Calculator - Upaman" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Free GST Calculator India 2025 | Upaman" />
    <meta name="twitter:description" content="Free GST calculator by Upaman with add, remove & reverse GST functions. Complete CGST, SGST, IGST breakdown." />
    <meta name="twitter:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
      "name": "Free GST Calculator India 2025 - Upaman",
            "url": "https://upaman.com/gst-calculator",
            "description": "Free online GST calculator by Upaman for India with add GST, remove GST, and reverse GST calculations including complete CGST, SGST, IGST breakdown for business compliance",
            "applicationCategory": "Finance & Taxation",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "featureList": ["Add GST Calculator", "Remove GST Calculator", "Reverse GST Calculator", "GST Breakdown", "All GST Rates"]
          })
        }} />
      </Head>
      <div className="calculator-card">
        <div className="calculator-header gst-header">
          <div className="header-nav">
            <HomeButton />
            <div className="flex-spacer"></div>
          </div>
          <div className="header-title-container">
            <img 
              src="/upaman-elephant-logo.svg" 
              alt="Upaman Logo"
              className="header-logo"
            />
            <h1 className="header-title">
              Free GST Calculator India 2025 - Upaman
            </h1>
            <p style={{ 
              textAlign: 'center', 
              marginTop: '0.5rem', 
              color: '#6b7280', 
              fontSize: '0.95rem' 
            }}>
              Calculate GST online for free. Add, remove, or reverse GST with complete CGST, SGST, IGST breakdown for all rates (5%, 12%, 18%, 28%). Perfect for business compliance and tax planning.
            </p>
          </div>
        </div>

        <div className="gst-operations">
          <h2 className="operations-title">Choose GST Operation</h2>
          <div className="operation-buttons">
            <button
              className={`operation-button add-gst-btn ${activeTab === 'add-gst' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-gst')}
            >
              <div className="button-icon">
                <Plus size={24} />
              </div>
              <div className="button-content">
                <h3>Add GST</h3>
                <p>Calculate GST inclusive amount from base price</p>
              </div>
              <div className="button-arrow">→</div>
            </button>
            
            <button
              className={`operation-button remove-gst-btn ${activeTab === 'remove-gst' ? 'active' : ''}`}
              onClick={() => setActiveTab('remove-gst')}
            >
              <div className="button-icon">
                <Minus size={24} />
              </div>
              <div className="button-content">
                <h3>Remove GST</h3>
                <p>Extract GST amount from inclusive price</p>
              </div>
              <div className="button-arrow">→</div>
            </button>
            
            <button
              className={`operation-button reverse-gst-btn ${activeTab === 'reverse-gst' ? 'active' : ''}`}
              onClick={() => setActiveTab('reverse-gst')}
            >
              <div className="button-icon">
                <RotateCcw size={24} />
              </div>
              <div className="button-content">
                <h3>Reverse GST</h3>
                <p>Find original amount from total with GST</p>
              </div>
              <div className="button-arrow">→</div>
            </button>
          </div>
        </div>

        <div className="calculator-content">
          {/* Add GST Tab */}
          {activeTab === 'add-gst' && (
            <div className="tab-content">
              <div className="input-section">
                <h3 className="section-title">
                  <Plus size={24} />
                  Add GST to Amount
                </h3>
                
                <div className="input-group">
                  <label className="input-label">Base Amount (Exclusive of GST)</label>
                  <input
                    type="number"
                    value={addGSTParams.amount}
                    onChange={(e) => setAddGSTParams(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="calculator-input"
                    placeholder="Enter amount without GST"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">GST Rate (%)</label>
                  <select
                    value={addGSTParams.gstRate}
                    onChange={(e) => setAddGSTParams(prev => ({ ...prev, gstRate: Number(e.target.value) }))}
                    className="calculator-input"
                  >
                    {commonGSTRates.map(rate => (
                      <option key={rate.rate} value={rate.rate}>
                        {rate.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="quick-rates">
                  {commonGSTRates.map(rate => (
                    <button
                      key={rate.rate}
                      className={`rate-button ${addGSTParams.gstRate === rate.rate ? 'active' : ''}`}
                      onClick={() => setAddGSTParams(prev => ({ ...prev, gstRate: rate.rate }))}
                    >
                      {rate.rate}%
                    </button>
                  ))}
                </div>
              </div>

              {addGSTResult && (
                <div className="results-container">
                  <h3 className="results-title">GST Calculation Result</h3>
                  
                  <div className="result-grid">
                    <div className="result-item">
                      <span className="result-label">Base Amount</span>
                      <span className="result-value">{formatINR(addGSTResult.originalAmount)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">GST Amount ({addGSTResult.gstRate}%)</span>
                      <span className="result-value">{formatINR(addGSTResult.gstAmount)}</span>
                    </div>
                    <div className="result-item total">
                      <span className="result-label">Total Amount (GST Inclusive)</span>
                      <span className="result-value">{formatINR(addGSTResult.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="gst-breakdown">
                    <h4>GST Breakdown</h4>
                    <div className="breakdown-grid">
                      <div className="breakdown-item">
                        <span>CGST (Central)</span>
                        <span>{formatINR(addGSTResult.breakdown.cgst)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>SGST (State)</span>
                        <span>{formatINR(addGSTResult.breakdown.sgst)}</span>
                      </div>
                      <div className="breakdown-note">
                        <Info size={16} />
                        <span>For inter-state: IGST = {formatINR(addGSTResult.breakdown.igst)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Affiliate Recommendations */}
                  <AffiliateRecommendations 
                    calculatorType="gst" 
                    result={addGSTResult}
                    isDarkMode={false} 
                  />
                  <ResultActions
                    title="GST add summary"
                    summaryLines={addShareLines}
                    fileName="upaman-gst-add-summary.txt"
                  />
                </div>
              )}
            </div>
          )}

          {/* Remove GST Tab */}
          {activeTab === 'remove-gst' && (
            <div className="tab-content">
              <div className="input-section">
                <h3 className="section-title">
                  <Minus size={24} />
                  Remove GST from Amount
                </h3>
                
                <div className="input-group">
                  <label className="input-label">Total Amount (Inclusive of GST)</label>
                  <input
                    type="number"
                    value={removeGSTParams.amount}
                    onChange={(e) => setRemoveGSTParams(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="calculator-input"
                    placeholder="Enter amount with GST"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">GST Rate (%)</label>
                  <select
                    value={removeGSTParams.gstRate}
                    onChange={(e) => setRemoveGSTParams(prev => ({ ...prev, gstRate: Number(e.target.value) }))}
                    className="calculator-input"
                  >
                    {commonGSTRates.map(rate => (
                      <option key={rate.rate} value={rate.rate}>
                        {rate.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="quick-rates">
                  {commonGSTRates.map(rate => (
                    <button
                      key={rate.rate}
                      className={`rate-button ${removeGSTParams.gstRate === rate.rate ? 'active' : ''}`}
                      onClick={() => setRemoveGSTParams(prev => ({ ...prev, gstRate: rate.rate }))}
                    >
                      {rate.rate}%
                    </button>
                  ))}
                </div>
              </div>

              {removeGSTResult && (
                <div className="results-container">
                  <h3 className="results-title">GST Removal Result</h3>
                  
                  <div className="result-grid">
                    <div className="result-item">
                      <span className="result-label">Total Amount (GST Inclusive)</span>
                      <span className="result-value">{formatINR(removeGSTResult.inclusiveAmount)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">GST Amount ({removeGSTResult.gstRate}%)</span>
                      <span className="result-value">{formatINR(removeGSTResult.gstAmount)}</span>
                    </div>
                    <div className="result-item total">
                      <span className="result-label">Base Amount (GST Exclusive)</span>
                      <span className="result-value">{formatINR(removeGSTResult.baseAmount)}</span>
                    </div>
                  </div>

                  <div className="gst-breakdown">
                    <h4>GST Breakdown</h4>
                    <div className="breakdown-grid">
                      <div className="breakdown-item">
                        <span>CGST (Central)</span>
                        <span>{formatINR(removeGSTResult.breakdown.cgst)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>SGST (State)</span>
                        <span>{formatINR(removeGSTResult.breakdown.sgst)}</span>
                      </div>
                      <div className="breakdown-note">
                        <Info size={16} />
                        <span>For inter-state: IGST = {formatINR(removeGSTResult.breakdown.igst)}</span>
                      </div>
                    </div>
                  </div>
                  <ResultActions
                    title="GST remove summary"
                    summaryLines={removeShareLines}
                    fileName="upaman-gst-remove-summary.txt"
                  />
                </div>
              )}
            </div>
          )}

          {/* Reverse GST Tab */}
          {activeTab === 'reverse-gst' && (
            <div className="tab-content">
              <div className="input-section">
                <h3 className="section-title">
                  <RotateCcw size={24} />
                  Reverse GST Calculation
                </h3>
                
                <div className="input-group">
                  <label className="input-label">GST Inclusive Amount</label>
                  <input
                    type="number"
                    value={reverseGSTParams.inclusiveAmount}
                    onChange={(e) => setReverseGSTParams(prev => ({ ...prev, inclusiveAmount: Number(e.target.value) }))}
                    className="calculator-input"
                    placeholder="Enter GST inclusive amount"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">GST Rate (%)</label>
                  <select
                    value={reverseGSTParams.gstRate}
                    onChange={(e) => setReverseGSTParams(prev => ({ ...prev, gstRate: Number(e.target.value) }))}
                    className="calculator-input"
                  >
                    {commonGSTRates.map(rate => (
                      <option key={rate.rate} value={rate.rate}>
                        {rate.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="quick-rates">
                  {commonGSTRates.map(rate => (
                    <button
                      key={rate.rate}
                      className={`rate-button ${reverseGSTParams.gstRate === rate.rate ? 'active' : ''}`}
                      onClick={() => setReverseGSTParams(prev => ({ ...prev, gstRate: rate.rate }))}
                    >
                      {rate.rate}%
                    </button>
                  ))}
                </div>
              </div>

              {reverseGSTResult && (
                <div className="results-container">
                  <h3 className="results-title">Reverse GST Result</h3>
                  
                  <div className="result-grid">
                    <div className="result-item">
                      <span className="result-label">GST Inclusive Amount</span>
                      <span className="result-value">{formatINR(reverseGSTResult.inclusiveAmount)}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">GST Amount ({reverseGSTResult.gstRate}%)</span>
                      <span className="result-value">{formatINR(reverseGSTResult.gstAmount)}</span>
                    </div>
                    <div className="result-item total">
                      <span className="result-label">Base Amount (GST Exclusive)</span>
                      <span className="result-value">{formatINR(reverseGSTResult.baseAmount)}</span>
                    </div>
                  </div>

                  <div className="gst-breakdown">
                    <h4>GST Breakdown</h4>
                    <div className="breakdown-grid">
                      <div className="breakdown-item">
                        <span>CGST (Central)</span>
                        <span>{formatINR(reverseGSTResult.breakdown.cgst)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>SGST (State)</span>
                        <span>{formatINR(reverseGSTResult.breakdown.sgst)}</span>
                      </div>
                      <div className="breakdown-note">
                        <Info size={16} />
                        <span>For inter-state: IGST = {formatINR(reverseGSTResult.breakdown.igst)}</span>
                      </div>
                    </div>
                  </div>
                  <ResultActions
                    title="GST reverse summary"
                    summaryLines={reverseShareLines}
                    fileName="upaman-gst-reverse-summary.txt"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="calculator-content" style={{ paddingTop: 0 }}>
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            inputs={[
              'Base amount or GST-inclusive amount and selected GST rate',
              'Breakdown shows CGST/SGST split for intra-state and IGST reference for inter-state'
            ]}
            formulas={[
              'Add GST: GST = amount × rate / 100; total = amount + GST',
              'Remove GST: base = inclusive × 100 / (100 + rate); GST = inclusive - base'
            ]}
            assumptions={[
              'Rate is applied uniformly to the full amount entered',
              'Complex classification/composition-scheme scenarios are out of scope',
              'Use official filing portals and professional advice for compliance decisions'
            ]}
            sources={[
              { label: 'CBIC GST portal', url: 'https://www.cbic-gst.gov.in/' },
              { label: 'GST common portal', url: 'https://www.gst.gov.in/' }
            ]}
            guideLinks={[
              { label: 'Income tax regime choice guide', href: '/guide-income-tax-regime-choice.html' }
            ]}
          />
        </div>

        {/* Footer Disclaimer */}
        <div className="calculator-footer">
          <div className="disclaimer-section">
            <h4>📋 Important Disclaimer</h4>
            <div className="disclaimer-content">
              <p>
                <strong>Information Purpose Only:</strong> This GST calculator is provided for informational and educational purposes only. 
                The calculations are based on standard GST rates and formulas as per Indian GST laws.
              </p>
              <p>
                <strong>Not Financial Advice:</strong> The results should not be considered as professional tax advice or official GST calculations. 
                For actual GST filing and compliance, please consult a qualified CA or tax professional.
              </p>
              <p>
                <strong>Accuracy Notice:</strong> While we strive for accuracy, GST rates and rules may change. Always verify current rates 
                and regulations from official GSTN portal or government sources before making business decisions.
              </p>
              <p>
                <strong>No Liability:</strong> We disclaim any liability for decisions made based on these calculations. 
                Users are responsible for verifying the accuracy of inputs and results.
              </p>
            </div>
            <div className="disclaimer-footer">
              <p>💡 <em>For official GST information, visit: </em><strong>gstn.gov.in</strong></p>
            </div>
          </div>

          {/* SEO Content Section */}
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              color: '#1f2937', 
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              About Upaman GST Calculator India 2025
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <div>
                <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Free GST Calculator Features</h3>
                <p>
                  Our free GST calculator by Upaman provides comprehensive GST calculations for Indian businesses. 
                  Calculate GST amounts with precision using add GST, remove GST, and reverse GST functions. 
                  Perfect for GST compliance, invoice preparation, and tax planning.
                </p>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  <li>Add GST Calculator - Calculate total amount including GST</li>
                  <li>Remove GST Calculator - Extract GST from inclusive amount</li>  
                  <li>Reverse GST Calculator - Find base amount from GST-inclusive price</li>
                  <li>Complete CGST, SGST, IGST breakdown</li>
                </ul>
              </div>
              <div>
                <h3 style={{ color: '#374151', marginBottom: '1rem' }}>GST Rates Supported</h3>
                <p>
                  Calculate GST for all applicable rates in India 2025. Our GST calculator supports all current GST slabs 
                  as per Indian GST laws. Use this tool for accurate GST calculations in business transactions.
                </p>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  <li>5% GST - Essential goods and services</li>
                  <li>12% GST - Standard rate items</li>
                  <li>18% GST - Most goods and services</li>
                  <li>28% GST - Luxury and sin goods</li>
                </ul>
              </div>
            </div>
            <div style={{ 
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Why Choose Upaman GST Calculator?</h3>
              <p style={{ color: '#6b7280', margin: 0 }}>
                <strong>Free GST Calculator by Upaman</strong> - No registration required. Fast, accurate, and reliable GST calculations 
                for Indian businesses. Perfect for CA professionals, business owners, and students. Calculate GST online 
                with complete transparency and detailed breakdowns. Trusted by thousands of users across India.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTCalculator;
