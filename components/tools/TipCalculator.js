import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import { NumberField } from '../ui/Field';
import Card from '../ui/Card';
import { computeTip } from '../../utils/quickCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';

const FAQ = [
  { question: 'How much should I tip at a restaurant in the US?', answer: '15–20% of the pre-tax bill is standard for table service, with 18–20% now the norm in most cities. Tip on the pre-tax amount if you prefer — most people simply tip on the total.' },
  { question: 'Should I tip on the pre-tax or post-tax amount?', answer: 'Etiquette guides say the pre-tax subtotal is fine; the difference is small (a 20% tip on $8 tax is $1.60). Tipping on the after-tax total is a bit more generous and simpler.' },
  { question: 'How much do I tip for delivery, bars, and other services?', answer: 'Common US norms: food delivery 10–15% (minimum $3–5), bartenders $1–2 per drink or 15–20% of the tab, hairdressers 15–20%, taxi/rideshare 10–15%, hotel housekeeping $2–5 per night.' },
  { question: 'Is a tip required if a service charge is already added?', answer: 'No. If the bill includes an automatic gratuity or service charge (common for parties of 6+), an extra tip is optional — add a little only for exceptional service. Always check the bill first.' }
];

const PRESETS = [10, 15, 18, 20, 25];

const fmtUSD = (v, digits = 2) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

// Animated stacked bar: bill vs tip share of the total.
function BillBar({ bill, tip, total }) {
  if (total <= 0) return null;
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
        <div className="h-full bg-sky-400 transition-[width] duration-500 ease-out dark:bg-sky-500" style={{ width: `${(bill / total) * 100}%` }} />
        <div className="h-full bg-emerald-400 transition-[width] duration-500 ease-out dark:bg-emerald-500" style={{ width: `${(tip / total) * 100}%` }} />
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" /> Bill {fmtUSD(bill)}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Tip {fmtUSD(tip)}</span>
      </div>
    </div>
  );
}

const GUIDE = [
  ['Sit-down restaurant', '18–20%'],
  ['Buffet or counter service', '0–10%'],
  ['Food delivery', '10–15% (min $3–5)'],
  ['Bartender', '$1–2/drink or 15–20%'],
  ['Hair / spa services', '15–20%'],
  ['Taxi or rideshare', '10–15%'],
  ['Hotel housekeeping', '$2–5 per night']
];

const TipCalculator = () => {
  const [bill, setBill] = useState('60');
  const [tipPct, setTipPct] = useState('18');
  const [people, setPeople] = useState(2);
  const [roundUp, setRoundUp] = useState(false);

  const result = useMemo(() => computeTip({
    bill: parseFloat(bill) || 0,
    tipPct: parseFloat(tipPct) || 0,
    people,
    roundUpPerPerson: roundUp
  }), [bill, tipPct, people, roundUp]);

  const billNum = parseFloat(bill) || 0;
  const hasResult = billNum > 0;

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Tip Calculator',
    url: 'https://upaman.com/tip-calculator',
    description: 'Free tip calculator with bill splitting: pick a tip percent, split between any number of people, and round up per person. Includes a US tipping guide.',
    applicationCategory: 'UtilitiesApplication',
    priceCurrency: 'USD',
    featureList: ['One-tap tip percents (10–25%)', 'Split between any number of people', 'Round up per person', 'US tipping etiquette guide']
  });
  const faqSchema = buildFaqSchema(FAQ);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Everyday Tools', item: 'https://upaman.com/tools' },
    { name: 'Tip Calculator', item: 'https://upaman.com/tip-calculator' }
  ]);

  return (
    <>
      <Head>
        <title>Tip Calculator | Split the Bill & Tip Percent Guide | Upaman</title>
        <meta name="description" content="Free tip calculator: choose 10–25% or a custom tip, split the bill between friends, and round up per person. Includes a US tipping guide for restaurants, delivery, and more." />
        <meta name="keywords" content="tip calculator, tip calculator with split, how much to tip, restaurant tip calculator, split bill calculator, 20 percent tip" />
        <link rel="canonical" href="https://upaman.com/tip-calculator" />
        <meta property="og:title" content="Tip Calculator | Split the Bill | Upaman" />
        <meta property="og:description" content="Tip, total, and per-person share in one tap — with a US tipping guide." />
        <meta property="og:url" content="https://upaman.com/tip-calculator" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Tip Calculator | Upaman" />
        <meta name="twitter:description" content="Tip, total, and per-person share — plus how much to tip for what." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Everyday Tools · Dining"
        title="Tip Calculator"
        subtitle="Work out the tip, the total, and each person's share in seconds — with one-tap percentages and per-person round-up."
      >
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <NumberField id="tip-bill" label="Bill amount" prefix="$" value={bill} onChange={setBill} min={0} step={0.01} />

              <div>
                <p className="mb-1.5 text-sm font-medium text-ink-soft dark:text-slate-300">Tip percent</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTipPct(String(p))}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                        parseFloat(tipPct) === p
                          ? 'bg-brand-600 text-white shadow-soft'
                          : 'bg-slate-100 text-ink-soft hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
                <div className="mt-2.5">
                  <NumberField id="tip-pct" label="Custom percent" suffix="%" value={tipPct} onChange={setTipPct} min={0} max={100} />
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-ink-soft dark:text-slate-300">Split between</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Fewer people"
                    onClick={() => setPeople((n) => Math.max(1, n - 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-ink-soft transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-[6.5rem] text-center font-display text-lg font-bold text-ink dark:text-white">
                    {people} {people === 1 ? 'person' : 'people'}
                  </span>
                  <button
                    type="button"
                    aria-label="More people"
                    onClick={() => setPeople((n) => Math.min(50, n + 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-ink-soft transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={roundUp}
                  onChange={(e) => setRoundUp(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Round up each person&apos;s share to a whole dollar
              </label>
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {hasResult ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Each person pays" value={fmtUSD(result.perPerson)} emphasis tone="positive" />
                  <ResultStat label="Total with tip" value={fmtUSD(result.total)} />
                  <ResultStat label="Tip amount" value={fmtUSD(result.tip)} />
                  <ResultStat label="Tip per person" value={fmtUSD(result.perPersonTip)} />
                </div>

                <Card className="p-5">
                  <h3 className="mb-4 font-display text-base font-bold text-ink dark:text-white">Bill vs tip</h3>
                  <BillBar bill={billNum} tip={result.total - billNum} total={result.total} />
                  {roundUp && result.roundingAdded > 0.005 ? (
                    <p className="mt-3 text-xs text-ink-muted dark:text-slate-500">
                      Round-up adds {fmtUSD(result.roundingAdded)} on top of the {tipPct}% tip
                      (effective tip {result.effectiveTipPct.toFixed(1)}%).
                    </p>
                  ) : null}
                </Card>

                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">How much to tip in the US</h3>
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                    {GUIDE.map(([service, range]) => (
                      <div key={service} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-ink-soft dark:text-slate-300">{service}</span>
                        <span className="font-medium text-ink dark:text-white">{range}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <p className="text-sm text-ink-muted dark:text-slate-400">
                  Need a quick percent for anything else? Try the{' '}
                  <Link href="/percentage-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">percentage calculator</Link>.
                </p>
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your bill to calculate the tip and split.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to use the Tip Calculator"
          description="Split any bill with tip in three steps."
          steps={[
            { name: 'Enter the bill', text: 'Type the amount from the check — pre-tax or total, your choice.' },
            { name: 'Tap a tip percent', text: 'Use 18–20% for US table service, or set a custom percent.' },
            { name: 'Split and round', text: 'Set the number of people and optionally round each share up to a whole dollar for easy cash payments.' }
          ]}
        />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Tipping FAQ</h2>
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
            title="Methodology"
            inputs={['Bill amount, tip percent (presets or custom), number of people, optional per-person round-up']}
            formulas={[
              'Tip = bill × percent ÷ 100; total = bill + tip',
              'Per person = total ÷ people; round-up ceils each share to the next dollar',
              'Effective tip percent is recomputed after rounding'
            ]}
            assumptions={['Tipping norms shown are US conventions — customs differ widely by country', 'Automatic service charges on the bill replace, not add to, a tip']}
            sources={[
              { label: 'Emily Post Institute — Tipping guide', url: 'https://emilypost.com/advice/general-tipping-guide' },
              { label: 'Pew Research — Tipping culture in America', url: 'https://www.pewresearch.org/social-trends/2023/11/09/tipping-culture-in-america-public-sees-a-changed-landscape/' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default TipCalculator;
