import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Info } from 'lucide-react';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, SelectField } from '../ui/Field';
import Card from '../ui/Card';

const CONFIDENCE_Z = {
  90: 1.645,
  95: 1.96,
  99: 2.576
};

const STATS_FAQS = [
  {
    q: 'Should I use population SD or sample SD?',
    a: 'Use population SD when your list is the entire group you care about — every student in the class, every order this month. Use sample SD when the list is a subset standing in for something bigger — 9 measurements representing a machine’s typical output. Sample SD divides by n − 1 instead of n, which makes it slightly larger and corrects the bias that comes from measuring spread around the sample’s own mean.'
  },
  {
    q: 'Why are my mean and median so different?',
    a: 'A gap between them is a skew detector. The mean is pulled toward extreme values; the median is not. If the mean sits well above the median, a few large values are dragging it up — typical for incomes, house prices, and response times. When that happens, the median is usually the more honest single summary.'
  },
  {
    q: 'How does percentile rank handle values that appear multiple times?',
    a: 'It uses the midpoint convention: values strictly below the target count fully, and ties count half. In the default dataset, 24 appears three times with five values below it, so its rank is (5 + 1.5) / 9 = 72.2nd percentile. This avoids the ambiguity of a tied value being simultaneously "above" and "at" its own position.'
  },
  {
    q: 'What does a 95% confidence interval actually mean?',
    a: 'If you repeated the same sampling process many times and built an interval each time, about 95% of those intervals would contain the true population mean. It is a statement about the reliability of the procedure, not a 95% probability that the true mean sits inside this particular interval — a subtle but real distinction that trips up many reports.'
  },
  {
    q: 'Why do my quartiles differ from Excel or my textbook?',
    a: 'There are several accepted ways to compute quartiles. This tool uses linear interpolation on the sorted positions (the same method as Excel’s QUARTILE.INC). Textbooks that use the median-of-halves method can give slightly different Q1 and Q3 for the same data — neither is wrong, they are different conventions.'
  },
  {
    q: 'What input formats does the parser accept?',
    a: 'Paste numbers separated by commas, spaces, tabs, or line breaks — straight from a spreadsheet column works. Negatives, decimals, and scientific notation like 2.5e3 are all recognized; any surrounding text is ignored.'
  }
];

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: STATS_FAQS.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a }
              }))
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

          <p className="flex items-start gap-1.5 text-xs text-ink-muted dark:text-slate-400">
            <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>For audited or regulated reporting, validate these outputs with your official statistical workflow.</span>
          </p>
        </div>

        <article className="mt-10 max-w-4xl space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-ink dark:text-white">Reading the numbers: a walkthrough of the default dataset</h2>
            <p className="mt-3">
              The preloaded data — 12, 15, 15, 18, 21, 24, 24, 24, 30 — is small enough to check by hand, which makes it a good
              tour of what each tile means. Nine values sum to 183, so the mean is 20.33. The median, the middle value once
              sorted, is 21 — close to the mean here because the data is fairly balanced. The mode is 24, the only value that
              repeats more than any other. Q1 is 15 and Q3 is 24, so the interquartile range is 9: the middle half of the data
              spans nine units, a spread measure that ignores whatever the extremes are doing.
            </p>
            <p className="mt-3">
              The two standard deviations differ on purpose. Population SD (5.44) divides the squared deviations by n and
              describes exactly the numbers you typed. Sample SD (5.77) divides by n − 1 and answers a different question: if
              these nine values are a sample from something larger, what is our best estimate of that larger population&rsquo;s
              spread? Dividing by n − 1 — Bessel&rsquo;s correction — compensates for the fact that deviations measured around
              the sample&rsquo;s own mean are systematically a little too small.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink dark:text-white">Mean, median, or mode — which one to report</h2>
            <p className="mt-3">
              The mean uses every value, which is both its strength and its weakness: one outlier moves it. The median only
              cares about order, so it holds steady when the extremes misbehave. For anything with a long right tail — salaries,
              house prices, page-load times, hospital bills — the median usually tells the truer story, and a mean sitting far
              above the median is itself a finding: it says a small number of large values dominate. The mode matters mostly for
              discrete choices (most common shoe size, most frequent rating) and is deliberately blank when nothing repeats,
              rather than pretending every unique value is a mode.
            </p>
            <p className="mt-3">
              A practical habit: report a center and a spread together. &ldquo;Median 21, IQR 9&rdquo; or &ldquo;mean 20.3, SD
              5.8&rdquo; each paint a picture; a center alone hides whether the data huddles tightly or sprawls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink dark:text-white">Z-scores and percentile ranks: locating one value in the crowd</h2>
            <p className="mt-3">
              A z-score re-expresses a value as &ldquo;how many standard deviations from the mean.&rdquo; In the default data,
              the value 20 scores z = −0.06 — essentially dead on the mean. Values beyond ±2 are unusual for roughly
              bell-shaped data, and beyond ±3 are rare enough to warrant a second look at either the observation or the data
              entry. Z-scores also make different scales comparable: a student&rsquo;s z of +1.5 in math and +0.3 in reading
              says something no pair of raw scores can.
            </p>
            <p className="mt-3">
              Percentile rank answers the complementary question — what share of the dataset sits below a value. It uses the
              midpoint convention for ties: 24 appears three times with five values below it, giving (5 + 1.5) / 9 ≈ the 72.2nd
              percentile. Note this is the empirical rank within <em>your</em> data, not a claim about any wider population.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink dark:text-white">The confidence interval, and its honest limits</h2>
            <p className="mt-3">
              The interval uses the classic mean ± z × (sample SD / √n) construction with z at 1.645, 1.96, or 2.576 for 90%,
              95%, and 99%. For the default data the 95% interval is 16.57 to 24.10 — a margin of ±3.77 around the mean.
              Widening confidence costs width: the same data gives a ±3.16 margin at 90% and ±4.95 at 99%. Certainty is bought
              with vagueness.
            </p>
            <p className="mt-3">
              Two caveats keep this honest. First, the z-based formula assumes the sample is reasonably large or the underlying
              data roughly normal; below a few dozen observations, a t-distribution interval would be somewhat wider, so treat
              small-sample intervals here as slightly optimistic. Second, the interval says nothing about individual values —
              it brackets the <em>mean</em>, not where the next observation will land. Shrinking the interval by collecting
              more data follows a square-root law: quadrupling n only halves the margin.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink dark:text-white">Frequently asked questions</h2>
            <div className="mt-4 space-y-3">
              {STATS_FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <summary className="cursor-pointer font-semibold text-ink dark:text-white">{faq.q}</summary>
                  <p className="mt-2">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        </article>

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
