import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CalcLayout, ResultStat } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import CalculatorInfoPanel from './CalculatorInfoPanel';
import { NumberField, Tabs } from './ui/Field';
import Card from './ui/Card';
import { percentOf, whatPercent, percentChange, applyPercent } from '../utils/quickCalculations';
import { buildFaqSchema } from '../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/schema';

const FAQ = [
  { question: 'How do I calculate a percentage of a number?', answer: 'Multiply the number by the percentage and divide by 100. For example, 15% of 80 is 80 × 15 ÷ 100 = 12. A quick mental shortcut: 10% is the number with the decimal moved one place left, then scale from there.' },
  { question: 'How do I work out what percent one number is of another?', answer: 'Divide the part by the whole and multiply by 100. If 25 students out of 200 passed, that is 25 ÷ 200 × 100 = 12.5%.' },
  { question: 'What is the difference between percentage change and percentage points?', answer: 'If a rate moves from 10% to 15%, it rose 5 percentage points — but the percentage change is 50%, because 15 is half again as large as 10. News about interest rates usually means points; discounts usually mean percent.' },
  { question: 'How do reverse percentages work?', answer: 'To undo a percentage increase, divide instead of multiplying. If a price is $120 after a 20% increase, the original was 120 ÷ 1.20 = $100 — not 120 minus 20%, which would give $96.' }
];

const MODES = [
  { id: 'of', label: 'X% of Y' },
  { id: 'what', label: 'X is what % of Y' },
  { id: 'change', label: '% change' },
  { id: 'apply', label: 'Increase / decrease' }
];

const fmt = (v, digits = 2) => {
  if (v === null || !Number.isFinite(v)) return '—';
  const rounded = Number(v.toFixed(digits));
  return rounded.toLocaleString('en-US', { maximumFractionDigits: digits });
};

// Animated donut showing a percentage (display clamped to 0–100).
function PercentRing({ pct, label }) {
  const shown = Math.min(Math.max(pct ?? 0, 0), 100);
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-32 w-32 flex-none" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" className="stroke-slate-100 dark:stroke-slate-700/60" />
        <circle
          cx="60" cy="60" r={r} fill="none" strokeWidth="12" strokeLinecap="round"
          className="stroke-brand-500 transition-[stroke-dashoffset] duration-700 ease-out dark:stroke-brand-400"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="66" textAnchor="middle" className="fill-ink font-display text-xl font-bold dark:fill-white">
          {fmt(pct, 1)}%
        </text>
      </svg>
      <p className="text-sm leading-relaxed text-ink-soft dark:text-slate-300">{label}</p>
    </div>
  );
}

const PercentageCalculator = () => {
  const [mode, setMode] = useState('of');
  const [a, setA] = useState('15');
  const [b, setB] = useState('80');

  const x = parseFloat(a);
  const y = parseFloat(b);
  const valid = Number.isFinite(x) && Number.isFinite(y);

  const view = useMemo(() => {
    if (!valid) return null;
    switch (mode) {
      case 'of': {
        const v = percentOf(x, y);
        return {
          fields: [`Percent`, `Of the number`],
          sentence: <><strong>{fmt(x)}%</strong> of <strong>{fmt(y)}</strong> is <strong>{fmt(v)}</strong></>,
          stats: [['Result', fmt(v)], ['Formula', `${fmt(y)} × ${fmt(x)} ÷ 100`]],
          ringPct: x,
          ringLabel: `${fmt(x)}% of ${fmt(y)} — the ring shows the share taken.`
        };
      }
      case 'what': {
        const v = whatPercent(x, y);
        return {
          fields: [`The part (X)`, `The whole (Y)`],
          sentence: <><strong>{fmt(x)}</strong> is <strong>{fmt(v)}%</strong> of <strong>{fmt(y)}</strong></>,
          stats: [['Result', v === null ? '—' : `${fmt(v)}%`], ['Formula', `${fmt(x)} ÷ ${fmt(y)} × 100`]],
          ringPct: v,
          ringLabel: `${fmt(x)} as a share of ${fmt(y)}.`
        };
      }
      case 'change': {
        const v = percentChange(x, y);
        const dir = v === null ? '' : v >= 0 ? 'increase' : 'decrease';
        return {
          fields: [`From (old value)`, `To (new value)`],
          sentence: <>From <strong>{fmt(x)}</strong> to <strong>{fmt(y)}</strong> is a <strong>{fmt(Math.abs(v ?? 0))}% {dir}</strong></>,
          stats: [['Change', v === null ? '—' : `${v >= 0 ? '+' : ''}${fmt(v)}%`], ['Difference', fmt(y - x)]],
          ringPct: v === null ? null : Math.abs(v),
          ringLabel: `Relative ${dir || 'change'} from ${fmt(x)} to ${fmt(y)}.`
        };
      }
      case 'apply':
      default: {
        const up = applyPercent(y, x, 1);
        const down = applyPercent(y, x, -1);
        return {
          fields: [`Percent`, `Number`],
          sentence: <><strong>{fmt(y)}</strong> increased by {fmt(x)}% is <strong>{fmt(up)}</strong>; decreased it is <strong>{fmt(down)}</strong></>,
          stats: [[`+${fmt(x)}%`, fmt(up)], [`−${fmt(x)}%`, fmt(down)]],
          ringPct: x,
          ringLabel: `Applying ±${fmt(x)}% to ${fmt(y)} — handy for discounts, raises, and markups.`
        };
      }
    }
  }, [mode, x, y, valid]);

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Percentage Calculator',
    url: 'https://upaman.com/percentage-calculator',
    description: 'Free percentage calculator: find X% of a number, what percent X is of Y, percentage increase or decrease, and percent change — with formulas shown.',
    applicationCategory: 'UtilitiesApplication',
    priceCurrency: 'USD',
    featureList: ['Percent of a number', 'X is what percent of Y', 'Percentage change', 'Increase or decrease by a percent', 'Formulas shown for every result']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Everyday Tools', item: 'https://upaman.com/tools' },
    { name: 'Percentage Calculator', item: 'https://upaman.com/percentage-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>Percentage Calculator | % of a Number, Change & Reverse | Upaman</title>
        <meta name="description" content="Free percentage calculator: what is X% of Y, X is what percent of Y, percentage increase/decrease, and percent change — instant answers with the formula shown." />
        <meta name="keywords" content="percentage calculator, percent calculator, what is x percent of y, percentage change calculator, percentage increase calculator, percent off calculator" />
        <link rel="canonical" href="https://upaman.com/percentage-calculator" />
        <meta property="og:title" content="Percentage Calculator | Upaman" />
        <meta property="og:description" content="Percent of a number, percent change, and reverse percentages — with formulas." />
        <meta property="og:url" content="https://upaman.com/percentage-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Percentage Calculator | Upaman" />
        <meta name="twitter:description" content="Every everyday percentage problem, solved with the formula shown." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Everyday Tools · Math"
        title="Percentage Calculator"
        subtitle="Four everyday percentage problems in one place — percent of a number, share of a whole, percent change, and increase/decrease — always with the formula shown."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <Tabs tabs={MODES} active={mode} onChange={setMode} />
              <NumberField id="pct-a" label={view ? view.fields[0] : 'X'} value={a} onChange={setA} />
              <NumberField id="pct-b" label={view ? view.fields[1] : 'Y'} value={b} onChange={setB} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {view ? (
              <>
                <Card className="p-5">
                  <p className="text-lg leading-relaxed text-ink dark:text-white">{view.sentence}</p>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  {view.stats.map(([label, value], i) => (
                    <ResultStat key={label} label={label} value={value} emphasis={i === 0} tone={i === 0 ? 'positive' : undefined} />
                  ))}
                </div>
                <Card className="p-5">
                  <PercentRing pct={view.ringPct} label={view.ringLabel} />
                </Card>
                <p className="text-sm text-ink-muted dark:text-slate-400">
                  Splitting a restaurant bill? Use the{' '}
                  <Link href="/tip-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">tip calculator</Link>{' '}
                  — or grow a number over time with the{' '}
                  <Link href="/compound-interest-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">compound interest calculator</Link>.
                </p>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter two numbers to calculate.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the Percentage Calculator"
          description="Solve any everyday percentage problem in three steps."
          steps={[
            { name: 'Pick the question type', text: 'Choose between percent of a number, share of a whole, percent change, or applying an increase/decrease.' },
            { name: 'Enter your two numbers', text: 'The field labels change with each mode so it is always clear what goes where.' },
            { name: 'Read the answer and formula', text: 'The result appears instantly as a sentence, with the exact formula so you can check or reuse it.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Percentage FAQ</h2>
          <div className="mt-4 grid gap-3">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Formulas used"
            inputs={['Two numbers, interpreted per the selected mode']}
            formulas={[
              'Percent of a number: Y × X ÷ 100',
              'X is what % of Y: X ÷ Y × 100',
              'Percent change: (new − old) ÷ old × 100',
              'Increase/decrease: Y × (1 ± X/100)'
            ]}
            assumptions={['Division by zero returns no result rather than an error', 'Results are rounded to 2 decimal places for display']}
            sources={[
              { label: 'Khan Academy — Intro to percents', url: 'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic/cc-6th-percent-problems/v/finding-percentages-example' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default PercentageCalculator;
