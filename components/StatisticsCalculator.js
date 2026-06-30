import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Info } from 'lucide-react';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import { NumberField, SelectField } from './ui/Field';
import Card from './ui/Card';

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

  const statTiles = stats
    ? [
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
      ]
    : [];

  return (
    <>
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

      <CalcLayout
        eyebrow="Everyday tool"
        title="Statistics Calculator"
        subtitle="Convert raw numbers into descriptive statistics, confidence intervals, and percentile insights."
      >
        <div className="max-w-4xl space-y-5">
          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-ink dark:text-white">Input data</h2>
            <p className="mt-1 mb-3 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
              Paste values separated by commas, spaces, or line breaks. Useful for exam prep, operational metrics,
              experiment results, and report validation.
            </p>
            <textarea
              value={rawData}
              onChange={(event) => setRawData(event.target.value)}
              rows={5}
              spellCheck={false}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-[0.95rem] text-ink shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="mt-2 text-xs text-ink-muted dark:text-slate-400">
              Parsed values: <strong className="text-ink dark:text-slate-200">{values.length}</strong>
            </p>
          </Card>

          {stats ? (
            <div>
              <h2 className="mb-3 font-display text-base font-bold text-ink dark:text-white">Descriptive statistics</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {statTiles.map(([label, value]) => (
                  <ResultStat key={label} label={label} value={formatNumber(value)} />
                ))}
              </div>
              <p className="mt-3 text-sm text-ink-soft dark:text-slate-300">
                Mode: {stats.mode.length ? stats.mode.map((value) => formatNumber(value)).join(', ') : 'No repeated mode'}
              </p>
            </div>
          ) : (
            <Card className="border-rose-200 p-4 text-sm font-medium text-rose-700 dark:border-rose-800 dark:text-rose-300">
              Enter at least one number to compute statistics.
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="mb-2.5 font-display text-sm font-bold text-ink dark:text-white">Z-score</h3>
              <NumberField id="z-score-input" label="Value to standardize" value={zInput} onChange={setZInput} />
              <p className="mt-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                {zScore === null ? 'Need valid dataset and value' : `z = ${formatNumber(zScore)}`}
              </p>
            </Card>

            <Card className="p-5">
              <h3 className="mb-2.5 font-display text-sm font-bold text-ink dark:text-white">Percentile rank</h3>
              <NumberField id="percentile-rank-input" label="Target value" value={percentileInput} onChange={setPercentileInput} />
              <p className="mt-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                {percentileRank === null ? 'Need valid dataset and value' : `${formatNumber(percentileRank)}th percentile`}
              </p>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="mb-2.5 font-display text-sm font-bold text-ink dark:text-white">Confidence interval for mean</h3>
            <div className="max-w-xs">
              <SelectField
                id="confidence-level"
                label="Confidence level"
                value={confidenceLevel}
                onChange={setConfidenceLevel}
                options={[
                  { value: '90', label: '90%' },
                  { value: '95', label: '95%' },
                  { value: '99', label: '99%' }
                ]}
              />
            </div>
            <p className="mt-3 text-sm text-ink-soft dark:text-slate-300">Formula: mean ± z × (sample SD / √n)</p>
            <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
              {confidenceInterval
                ? `[${formatNumber(confidenceInterval.lower)}, ${formatNumber(confidenceInterval.upper)}] (margin ${formatNumber(confidenceInterval.margin)})`
                : 'Need at least two data points for sample-based CI'}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-ink dark:text-white">Interpretation tips</h2>
            <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
              <p>
                Use population variance/SD when the dataset contains every observation in scope. Use sample variance/SD
                when your list is a subset of a larger population and you want an unbiased estimate.
              </p>
              <p>
                A z-score near 0 means the value is close to the mean. Larger absolute z-scores indicate more unusual
                observations relative to the dataset spread.
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-ink dark:text-white">FAQ</h2>
            <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
              <p>
                <strong className="font-semibold text-ink dark:text-white">Does this tool support negative and decimal values?</strong>{' '}
                Yes. You can mix negatives, decimals, and scientific notation like 2.5e3.
              </p>
              <p>
                <strong className="font-semibold text-ink dark:text-white">What if all values are unique?</strong> In that
                case there is no repeated mode, so the mode output stays empty by design.
              </p>
            </div>
          </Card>

          <p className="flex items-start gap-1.5 text-xs text-ink-muted dark:text-slate-400">
            <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>For audited or regulated reporting, validate these outputs with your official statistical workflow.</span>
          </p>
        </div>
      
        <HowToSection
          name="How to use the Statistics Calculator"
          description="Compute descriptive statistics for a set of numbers."
          steps={[
            { name: "Enter your data set", text: "Type or paste your numbers separated by commas or spaces." },
            { name: "View descriptive stats", text: "See mean, median, mode, standard deviation, and more." },
            { name: "Use the extra tools", text: "Compute a z-score or percentile rank for a value." },
            { name: "Build a confidence interval", text: "Pick a confidence level to estimate the population mean." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default StatisticsCalculator;
