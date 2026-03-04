import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { BarChart3, Home as HomeIcon } from 'lucide-react';
import HomeButton from './HomeButton';

const CONFIDENCE_Z = {
  90: 1.645,
  95: 1.96,
  99: 2.576
};

const parseNumbers = (rawText) => {
  const matches = rawText.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
  return matches.map((item) => Number(item)).filter((value) => Number.isFinite(value));
};

const percentile = (sortedValues, p) => {
  if (sortedValues.length === 0) return null;
  if (sortedValues.length === 1) return sortedValues[0];

  const index = (p / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper === lower) return sortedValues[lower];
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  if (!Number.isFinite(value)) return 'Infinity';
  const abs = Math.abs(value);
  if (abs > 0 && (abs >= 1e7 || abs < 1e-5)) {
    return value.toExponential(6);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
};

const StatisticsCalculator = () => {
  const [rawData, setRawData] = useState('12, 15, 15, 18, 21, 24, 24, 24, 30');
  const [zInput, setZInput] = useState('20');
  const [percentileInput, setPercentileInput] = useState('24');
  const [confidenceLevel, setConfidenceLevel] = useState('95');

  const values = useMemo(() => parseNumbers(rawData), [rawData]);

  const stats = useMemo(() => {
    if (!values.length) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, value) => acc + value, 0);
    const mean = sum / count;
    const medianValue = percentile(sorted, 50);

    const frequencyMap = new Map();
    sorted.forEach((value) => {
      const key = `${value}`;
      frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
    });

    let highestFrequency = 0;
    frequencyMap.forEach((frequency) => {
      if (frequency > highestFrequency) highestFrequency = frequency;
    });

    const mode = highestFrequency > 1
      ? Array.from(frequencyMap.entries())
          .filter(([, frequency]) => frequency === highestFrequency)
          .map(([key]) => Number(key))
      : [];

    const squaredDifferences = sorted.map((value) => (value - mean) ** 2);
    const variancePopulation = squaredDifferences.reduce((acc, value) => acc + value, 0) / count;
    const varianceSample = count > 1
      ? squaredDifferences.reduce((acc, value) => acc + value, 0) / (count - 1)
      : null;

    const stdPopulation = Math.sqrt(variancePopulation);
    const stdSample = varianceSample !== null ? Math.sqrt(varianceSample) : null;

    const q1 = percentile(sorted, 25);
    const q3 = percentile(sorted, 75);

    return {
      sorted,
      count,
      sum,
      mean,
      median: medianValue,
      mode,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      range: sorted[sorted.length - 1] - sorted[0],
      variancePopulation,
      varianceSample,
      stdPopulation,
      stdSample,
      q1,
      q3,
      iqr: q3 - q1
    };
  }, [values]);

  const zScore = useMemo(() => {
    if (!stats) return null;
    const inputValue = Number(zInput);
    if (!Number.isFinite(inputValue) || stats.stdPopulation === 0) return null;
    return (inputValue - stats.mean) / stats.stdPopulation;
  }, [stats, zInput]);

  const percentileRank = useMemo(() => {
    if (!stats) return null;
    const target = Number(percentileInput);
    if (!Number.isFinite(target)) return null;

    const lessThan = stats.sorted.filter((value) => value < target).length;
    const equalTo = stats.sorted.filter((value) => value === target).length;
    return ((lessThan + 0.5 * equalTo) / stats.count) * 100;
  }, [stats, percentileInput]);

  const confidenceInterval = useMemo(() => {
    if (!stats || stats.stdSample === null || stats.count < 2) return null;
    const z = CONFIDENCE_Z[confidenceLevel];
    const margin = z * (stats.stdSample / Math.sqrt(stats.count));
    return {
      lower: stats.mean - margin,
      upper: stats.mean + margin,
      margin
    };
  }, [stats, confidenceLevel]);

  return (
    <div className="calculator-container" style={{ background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)' }}>
      <Head>
        <title>Statistics Calculator Online | Mean, Median, SD, CI, Percentile | Upaman</title>
        <meta
          name="description"
          content="Free statistics calculator to compute mean, median, mode, variance, standard deviation, quartiles, confidence intervals, z-score, and percentile rank."
        />
        <meta
          name="keywords"
          content="statistics calculator, mean median mode calculator, standard deviation calculator, confidence interval calculator, percentile calculator"
        />
        <link rel="canonical" href="https://upaman.com/statistics-calculator" />
        <meta property="og:title" content="Statistics Calculator Online | Upaman" />
        <meta
          property="og:description"
          content="Analyze datasets quickly with descriptive statistics, z-scores, percentile ranks, and confidence intervals."
        />
        <meta property="og:url" content="https://upaman.com/statistics-calculator" />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Statistics Calculator',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web Browser',
              url: 'https://upaman.com/statistics-calculator',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
      </Head>

      <div className="calculator-card">
        <div className="calculator-header emi-header">
          <div className="header-nav">
            <HomeButton style={{ position: 'static', top: 'auto', left: 'auto', zIndex: 'auto' }} />
            <div className="flex-spacer" />
          </div>
          <div className="header-title-container">
            <BarChart3 size={32} color="#22d3ee" aria-hidden="true" />
            <h1 className="header-title">Statistics Calculator</h1>
          </div>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Convert raw numbers into descriptive statistics, confidence intervals, and percentile insights.
          </p>
        </div>

        <div className="mobile-card-content">
          <section
            style={{
              marginBottom: '1.2rem',
              background: '#f8fafc',
              border: '1px solid #dbe2eb',
              borderRadius: '0.9rem',
              padding: '1rem'
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.55rem', fontSize: '1.05rem', color: '#0f2a43' }}>Input data</h2>
            <p style={{ marginTop: 0, marginBottom: '0.6rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Paste values separated by commas, spaces, or line breaks. Useful for exam prep, operational metrics,
              experiment results, and report validation.
            </p>
            <textarea
              value={rawData}
              onChange={(event) => setRawData(event.target.value)}
              rows={5}
              spellCheck={false}
              style={{
                width: '100%',
                borderRadius: '0.75rem',
                border: '1px solid #cbd5e1',
                padding: '0.8rem',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'
              }}
            />
            <p style={{ margin: '0.6rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>
              Parsed values: <strong>{values.length}</strong>
            </p>
          </section>

          {stats ? (
            <section style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: '0 0 0.6rem', color: '#0f2a43', fontSize: '1.05rem' }}>Descriptive statistics</h2>
              <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
                {[
                  ['Count', stats.count],
                  ['Sum', stats.sum],
                  ['Mean', stats.mean],
                  ['Median', stats.median],
                  ['Min', stats.min],
                  ['Max', stats.max],
                  ['Range', stats.range],
                  ['Q1', stats.q1],
                  ['Q3', stats.q3],
                  ['IQR', stats.iqr],
                  ['Population Variance', stats.variancePopulation],
                  ['Population SD', stats.stdPopulation],
                  ['Sample Variance', stats.varianceSample],
                  ['Sample SD', stats.stdSample]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dbe2eb',
                      borderRadius: '0.8rem',
                      padding: '0.75rem'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>{label}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f2a43' }}>{formatNumber(value)}</div>
                  </div>
                ))}
              </div>
              <p style={{ margin: '0.65rem 0 0', color: '#475569', fontSize: '0.86rem' }}>
                Mode: {stats.mode.length ? stats.mode.map((value) => formatNumber(value)).join(', ') : 'No repeated mode'}
              </p>
            </section>
          ) : (
            <section
              style={{
                marginBottom: '1rem',
                borderRadius: '0.85rem',
                border: '1px solid #fecaca',
                background: '#fff1f2',
                color: '#9f1239',
                padding: '0.85rem'
              }}
            >
              Enter at least one number to compute statistics.
            </section>
          )}

          <section style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.7rem' }}>
            <div style={{ border: '1px solid #dbe2eb', borderRadius: '0.85rem', background: '#fff', padding: '0.85rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.98rem', color: '#0f2a43' }}>Z-score</h3>
              <label htmlFor="z-score-input" style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '0.3rem' }}>
                Value to standardize
              </label>
              <input
                id="z-score-input"
                type="number"
                value={zInput}
                onChange={(event) => setZInput(event.target.value)}
                style={{ width: '100%', borderRadius: '0.6rem', border: '1px solid #cbd5e1', padding: '0.5rem' }}
              />
              <p style={{ margin: '0.55rem 0 0', color: '#0f766e', fontWeight: 700 }}>
                {zScore === null ? 'Need valid dataset and value' : `z = ${formatNumber(zScore)}`}
              </p>
            </div>

            <div style={{ border: '1px solid #dbe2eb', borderRadius: '0.85rem', background: '#fff', padding: '0.85rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.98rem', color: '#0f2a43' }}>Percentile rank</h3>
              <label htmlFor="percentile-rank-input" style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '0.3rem' }}>
                Target value
              </label>
              <input
                id="percentile-rank-input"
                type="number"
                value={percentileInput}
                onChange={(event) => setPercentileInput(event.target.value)}
                style={{ width: '100%', borderRadius: '0.6rem', border: '1px solid #cbd5e1', padding: '0.5rem' }}
              />
              <p style={{ margin: '0.55rem 0 0', color: '#0f766e', fontWeight: 700 }}>
                {percentileRank === null ? 'Need valid dataset and value' : `${formatNumber(percentileRank)}th percentile`}
              </p>
            </div>
          </section>

          <section
            style={{
              marginBottom: '1rem',
              border: '1px solid #dbe2eb',
              borderRadius: '0.85rem',
              background: '#f8fafc',
              padding: '0.95rem'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '0.55rem', fontSize: '0.98rem', color: '#0f2a43' }}>
              Confidence interval for mean
            </h3>
            <label htmlFor="confidence-level" style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '0.3rem' }}>
              Confidence level
            </label>
            <select
              id="confidence-level"
              value={confidenceLevel}
              onChange={(event) => setConfidenceLevel(event.target.value)}
              style={{ borderRadius: '0.6rem', border: '1px solid #cbd5e1', padding: '0.45rem 0.6rem' }}
            >
              <option value="90">90%</option>
              <option value="95">95%</option>
              <option value="99">99%</option>
            </select>
            <p style={{ margin: '0.6rem 0 0.25rem', color: '#334155', fontSize: '0.88rem' }}>
              Formula: mean ± z × (sample SD / √n)
            </p>
            <p style={{ margin: 0, color: '#0f766e', fontWeight: 700, fontSize: '0.92rem' }}>
              {confidenceInterval
                ? `[${formatNumber(confidenceInterval.lower)}, ${formatNumber(confidenceInterval.upper)}] (margin ${formatNumber(confidenceInterval.margin)})`
                : 'Need at least two data points for sample-based CI'}
            </p>
          </section>

          <section style={{ marginBottom: '1rem' }}>
            <h2 style={{ margin: '0 0 0.55rem', color: '#0f2a43', fontSize: '1.05rem' }}>Interpretation tips</h2>
            <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.65 }}>
              <p style={{ marginTop: 0 }}>
                Use population variance/SD when the dataset contains every observation in scope. Use sample
                variance/SD when your list is a subset of a larger population and you want an unbiased estimate.
              </p>
              <p style={{ marginBottom: 0 }}>
                A z-score near 0 means the value is close to the mean. Larger absolute z-scores indicate more unusual
                observations relative to the dataset spread.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '0.25rem' }}>
            <h2 style={{ margin: '0 0 0.55rem', color: '#0f2a43', fontSize: '1.05rem' }}>FAQ</h2>
            <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.65 }}>
              <p style={{ marginTop: 0 }}>
                <strong>Does this tool support negative and decimal values?</strong> Yes. You can mix negatives,
                decimals, and scientific notation like 2.5e3.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>What if all values are unique?</strong> In that case there is no repeated mode, so the mode
                output stays empty by design.
              </p>
            </div>
          </section>

          <div style={{ marginTop: '1.2rem', color: '#64748b', fontSize: '0.82rem', display: 'flex', gap: '0.35rem', alignItems: 'flex-start' }}>
            <HomeIcon size={14} aria-hidden="true" style={{ marginTop: '0.1rem' }} />
            <span>
              For audited or regulated reporting, validate these outputs with your official statistical workflow.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCalculator;
