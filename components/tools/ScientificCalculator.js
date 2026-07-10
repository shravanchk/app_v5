import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Eraser, Delete, History, Sigma } from 'lucide-react';
import { CalcLayout } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { cn } from '../ui/cn';

const FUNCTION_TOKENS = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'log', 'ln', 'abs', 'fact']);

const buildScope = (angleMode) => {
  const toRadians = (value) => (angleMode === 'DEG' ? (value * Math.PI) / 180 : value);
  const toAngle = (value) => (angleMode === 'DEG' ? (value * 180) / Math.PI : value);

  const fact = (n) => {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error('Factorial accepts non-negative integers only');
    }
    if (n > 170) {
      throw new Error('Factorial overflow for numbers above 170');
    }
    let result = 1;
    for (let i = 2; i <= n; i += 1) {
      result *= i;
    }
    return result;
  };

  return {
    PI: Math.PI,
    E: Math.E,
    sin: (x) => Math.sin(toRadians(x)),
    cos: (x) => Math.cos(toRadians(x)),
    tan: (x) => Math.tan(toRadians(x)),
    asin: (x) => toAngle(Math.asin(x)),
    acos: (x) => toAngle(Math.acos(x)),
    atan: (x) => toAngle(Math.atan(x)),
    sqrt: (x) => Math.sqrt(x),
    abs: (x) => Math.abs(x),
    log: (x) => Math.log10(x),
    ln: (x) => Math.log(x),
    fact,
    min: Math.min,
    max: Math.max,
    pow: Math.pow
  };
};

const normalizeExpression = (rawExpression) => {
  let expression = rawExpression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'PI')
    .replace(/\^/g, '**')
    .replace(/%/g, '/100')
    .replace(/\bpi\b/gi, 'PI');

  expression = expression
    .replace(/(\d)\(/g, '$1*(')
    .replace(/\)(\d)/g, ')*$1')
    .replace(/\)([a-zA-Z])/g, ')*$1');

  return expression;
};

const SCI_FAQS = [
  {
    q: 'Why is my trig answer different from the textbook?',
    a: 'Almost always the angle mode. In DEG mode sin(30) is 0.5, the textbook answer. In RAD mode the same keystrokes compute the sine of 30 radians, which is about −0.988 — a completely different number. School problems are usually in degrees; calculus and programming formulas are usually in radians. Check the DEG/RAD toggle before anything else.'
  },
  {
    q: 'What is the difference between log and ln?',
    a: 'Here log is base-10 logarithm and ln is the natural (base-e) logarithm, following calculator convention: log(1000) = 3 and ln(E) = 1. Be careful when moving between this tool and programming languages — in most languages the function named log is the natural logarithm.'
  },
  {
    q: 'Why does sin(180) show exactly 0 instead of a tiny number?',
    a: 'Computers store π only approximately, so the raw result of sin(180°) is a number around 10⁻¹⁶ rather than a true zero. The calculator snaps anything smaller than 10⁻¹² to zero so that results read the way the mathematics intends instead of leaking floating-point noise.'
  },
  {
    q: 'Why does factorial stop at 170?',
    a: 'Numbers here are stored in double-precision floating point, which tops out near 1.8 × 10³⁰⁸. 170! is about 7.3 × 10³⁰⁶ and still fits; 171! does not, so the calculator raises an overflow error instead of returning Infinity. Factorial also requires a non-negative whole number — fact(2.5) is rejected.'
  },
  {
    q: 'How does the % key work?',
    a: 'It divides the preceding value by 100, so 25% evaluates to 0.25 and 200 * 10% gives 20. It is a plain mathematical percent, not the “add tax” style percent found on some shop calculators.'
  },
  {
    q: 'How do I reuse a previous result?',
    a: 'Press ANS to insert the last computed value into the expression, or click any line in the Recent calculations list to reload that full expression for editing. History keeps the last eight evaluations.'
  }
];

const keyBase =
  'rounded-xl border px-1 py-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40';
const keyDefault =
  'border-slate-200 bg-slate-50 text-ink hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700';
const keyEquals = 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700';
const keyClear =
  'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300';

const ScientificCalculator = () => {
  const [expression, setExpression] = useState('sin(30) + sqrt(16)');
  const [angleMode, setAngleMode] = useState('DEG');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [lastAnswer, setLastAnswer] = useState(0);

  const scope = useMemo(() => buildScope(angleMode), [angleMode]);

  const evaluateExpression = () => {
    if (!expression.trim()) {
      setResult('');
      setError('Enter an expression to evaluate');
      return;
    }

    try {
      const normalized = normalizeExpression(expression);
      if (!/^[0-9+\-*/().,\s%^a-zA-Z_]*$/.test(normalized)) {
        throw new Error('Expression has unsupported characters');
      }

      const evaluator = new Function(
        ...Object.keys(scope),
        'ANS',
        `"use strict"; return (${normalized});`
      );

      const rawResult = evaluator(...Object.values(scope), lastAnswer);

      if (typeof rawResult !== 'number' || !Number.isFinite(rawResult)) {
        throw new Error('Result is not a finite number');
      }

      const rounded = Math.abs(rawResult) < 1e-12 ? 0 : Number(rawResult.toPrecision(12));
      const formatted = `${rounded}`;
      setResult(formatted);
      setError('');
      setLastAnswer(rounded);
      setHistory((previous) => [{ expression, result: formatted }, ...previous].slice(0, 8));
    } catch (evaluationError) {
      setError(evaluationError.message || 'Invalid expression');
    }
  };

  const appendToken = (token) => {
    setError('');

    if (token === 'C') {
      setExpression('');
      setResult('');
      return;
    }

    if (token === 'DEL') {
      setExpression((previous) => previous.slice(0, -1));
      return;
    }

    if (token === '=') {
      evaluateExpression();
      return;
    }

    if (token === 'ANS') {
      setExpression((previous) => `${previous}${lastAnswer}`);
      return;
    }

    if (FUNCTION_TOKENS.has(token)) {
      setExpression((previous) => `${previous}${token}(`);
      return;
    }

    setExpression((previous) => `${previous}${token}`);
  };

  const keypadRows = [
    ['7', '8', '9', '/', 'sin', 'cos'],
    ['4', '5', '6', '*', 'tan', 'sqrt'],
    ['1', '2', '3', '-', 'log', 'ln'],
    ['0', '.', '(', ')', '+', '^'],
    ['PI', 'E', 'ANS', 'fact', 'DEL', 'C']
  ];

  const quickExamples = [
    'sin(30) + cos(60)',
    'sqrt(144) + ln(E)',
    'fact(6) / (3 * 2)',
    '(25^2 + 40^2)^0.5'
  ];

  return (
    <>
      <Head>
        <title>Scientific Calculator Online | Trig, Log, Roots, Factorial | Upaman</title>
        <meta
          name="description"
          content="Use Upaman Scientific Calculator for trigonometry, logarithms, roots, powers, and factorials with DEG/RAD modes and expression history."
        />
        <meta
          name="keywords"
          content="scientific calculator online, trigonometry calculator, log calculator, factorial calculator, degree radian calculator"
        />
        <link rel="canonical" href="https://upaman.com/scientific-calculator" />
        <meta property="og:title" content="Scientific Calculator Online | Upaman" />
        <meta
          property="og:description"
          content="Evaluate complex math expressions with trig functions, logs, powers, and roots in one free scientific calculator."
        />
        <meta property="og:url" content="https://upaman.com/scientific-calculator" />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Scientific Calculator',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web Browser',
              url: 'https://upaman.com/scientific-calculator',
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
              mainEntity: SCI_FAQS.map((faq) => ({
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
        title="Scientific Calculator"
        subtitle="Solve trig, logarithmic, root, and power expressions with degree/radian control and instant history."
      >
        <div className="max-w-3xl space-y-5">
          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-ink dark:text-white">How this calculator helps</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
              Enter a full expression in one line instead of solving each step separately. The calculator supports
              trigonometric functions, logarithms, factorials, powers, and parentheses, making it useful for school
              math, engineering prep, and quick technical checks.
            </p>
          </Card>

          <Card className="p-5">
            <label htmlFor="scientific-expression" className="mb-1.5 block text-sm font-semibold text-ink-soft dark:text-slate-300">
              Expression
            </label>
            <textarea
              id="scientific-expression"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              rows={3}
              spellCheck={false}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-[0.95rem] text-ink shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Example: sin(45)^2 + cos(45)^2"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/60" role="group" aria-label="Angle mode">
                {['DEG', 'RAD'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAngleMode(mode)}
                    aria-pressed={angleMode === mode}
                    className={cn(
                      'rounded-lg px-3.5 py-1.5 text-sm font-bold transition',
                      angleMode === mode
                        ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-white'
                        : 'text-ink-muted hover:text-ink dark:text-slate-400'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <Button className="ml-auto" onClick={evaluateExpression}>Evaluate</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-sm font-bold text-ink dark:text-white">Result</h3>
            <p className="mt-1 break-words font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {result || 'No result yet'}
            </p>
            {error ? <p className="mt-2 text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p> : null}
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 font-display text-sm font-bold text-ink dark:text-white">Quick keypad</h3>
            <div className="grid gap-2">
              {keypadRows.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-6 gap-2">
                  {row.map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => appendToken(token)}
                      className={cn(keyBase, token === '=' ? keyEquals : token === 'C' ? keyClear : keyDefault)}
                    >
                      {token === 'DEL' ? (
                        <Delete size={16} className="mx-auto" />
                      ) : token === 'C' ? (
                        <Eraser size={16} className="mx-auto" />
                      ) : (
                        token
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-2.5 font-display text-sm font-bold text-ink dark:text-white">Try examples</h3>
            <div className="flex flex-wrap gap-2">
              {quickExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setExpression(example);
                    setError('');
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-slate-300 hover:text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {example}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-ink dark:text-white">
              <History size={16} aria-hidden="true" /> Recent calculations
            </h3>
            {history.length ? (
              <ul className="space-y-1 text-sm">
                {history.map((entry, index) => (
                  <li key={`${entry.expression}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setExpression(entry.expression)}
                      className="text-left font-mono text-brand-700 hover:underline dark:text-brand-300"
                    >
                      {entry.expression} = {entry.result}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted dark:text-slate-400">Run a few expressions to build history.</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-ink dark:text-white">Formula notes</h2>
            <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
              <p>
                Core identities supported include the Pythagorean trig identity{' '}
                <strong className="font-semibold text-ink dark:text-white">sin²(x) + cos²(x) = 1</strong>, change-of-base
                via logarithms, and factorial expansion for permutation and combinatorics checks.
              </p>
              <p>
                Use <strong className="font-semibold text-ink dark:text-white">DEG</strong> mode for school-style angles
                (30, 45, 60) and <strong className="font-semibold text-ink dark:text-white">RAD</strong> mode when working
                with calculus or programming formulas.
              </p>
            </div>
          </Card>

          <p className="flex items-start gap-1.5 text-xs text-ink-muted dark:text-slate-400">
            <Sigma size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>
              Results are numerical approximations. Validate critical engineering and exam submissions with independent checks.
            </span>
          </p>
        </div>

        <article className="mt-10 max-w-3xl space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-ink dark:text-white">Type the whole expression, not one step at a time</h2>
            <p className="mt-3">
              This calculator evaluates a complete expression in one pass, the way you would write it on paper:{' '}
              <span className="font-mono">(25^2 + 40^2)^0.5</span> returns 47.1699056603 directly, with the standard order of
              operations applied — parentheses first, then powers, then multiplication and division, then addition and
              subtraction. That is the main advantage over a button-chain calculator, where each intermediate press commits a
              step and a mistyped operator forces you to start over. Here you can see the whole computation, edit any part of
              it, and re-evaluate.
            </p>
            <p className="mt-3">
              A few notational conveniences are handled for you: <span className="font-mono">^</span> means &ldquo;to the power
              of&rdquo;, <span className="font-mono">π</span> or <span className="font-mono">pi</span> inserts the constant, and
              implicit multiplication like <span className="font-mono">2(3+4)</span> is expanded to{' '}
              <span className="font-mono">2*(3+4)</span> automatically. Function names always take parentheses:{' '}
              <span className="font-mono">sqrt(144)</span>, <span className="font-mono">log(1000)</span>,{' '}
              <span className="font-mono">fact(6)</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink dark:text-white">DEG vs RAD: the switch that causes most wrong answers</h2>
            <p className="mt-3">
              Every trigonometric mistake we could list comes down to one toggle. In DEG mode, <span className="font-mono">sin(30)</span>{' '}
              is 0.5 — the answer school problems expect. In RAD mode, the same input asks for the sine of 30 <em>radians</em>,
              which is about −0.988. Neither answer is wrong; they are answers to different questions. Degrees are the
              convention in school geometry, surveying, and most everyday contexts. Radians are the native unit of calculus,
              physics formulas, and every mainstream programming language, because they make the derivatives of sin and cos
              come out clean.
            </p>
            <p className="mt-3">
              The inverse functions respect the same setting: in DEG mode <span className="font-mono">atan(1)</span> returns 45;
              in RAD mode it returns 0.785398163397, which is π/4. If you are checking a formula from code against this
              calculator, switch to RAD first — that single step reconciles most &ldquo;the computer disagrees with my
              calculator&rdquo; sessions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink dark:text-white">What the calculator does about floating-point noise</h2>
            <p className="mt-3">
              All arithmetic runs in double-precision floating point, the same number format used by spreadsheets and most
              programming languages. It is accurate to roughly 15–16 significant digits, but it cannot represent most decimal
              fractions exactly — the raw result of 0.1 + 0.2 is 0.30000000000000004. To keep answers readable, this calculator
              rounds every result to 12 significant digits, which folds that kind of representational noise back into the
              number you expect: 0.1 + 0.2 displays as 0.3.
            </p>
            <p className="mt-3">
              Two related behaviors are worth knowing. First, results smaller than 10⁻¹² in magnitude snap to exactly zero, so{' '}
              <span className="font-mono">sin(180)</span> in DEG mode shows 0 rather than a stray 1.2 × 10⁻¹⁶ left over from the
              approximate value of π. Second, quantities that are mathematically undefined can still evaluate to a huge finite
              number for the same reason: <span className="font-mono">tan(90)</span> in DEG mode returns a value around 1.6 ×
              10¹⁶ instead of an error, because the computed angle is a hair short of a true right angle. If you see an
              absurdly large trig result, read it as &ldquo;undefined&rdquo;, not as data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink dark:text-white">The function set, briefly</h2>
            <p className="mt-3">
              <span className="font-mono">sin</span>, <span className="font-mono">cos</span>, <span className="font-mono">tan</span>{' '}
              and their inverses <span className="font-mono">asin</span>, <span className="font-mono">acos</span>,{' '}
              <span className="font-mono">atan</span> follow the angle mode. <span className="font-mono">log</span> is base-10 and{' '}
              <span className="font-mono">ln</span> is natural — <span className="font-mono">log(1000)</span> is 3,{' '}
              <span className="font-mono">ln(E)</span> is 1. <span className="font-mono">sqrt</span> and{' '}
              <span className="font-mono">abs</span> do what they say; <span className="font-mono">pow(x, y)</span> and{' '}
              <span className="font-mono">x^y</span> are interchangeable. <span className="font-mono">fact(n)</span> computes
              factorials for whole numbers from 0 to 170 — handy for permutation and combination checks like{' '}
              <span className="font-mono">fact(6) / (3 * 2)</span>, which returns 120. Beyond 170 the true value exceeds what
              double precision can hold (171! is larger than 1.8 × 10³⁰⁸), so the calculator reports an overflow rather than
              returning a misleading Infinity.
            </p>
            <p className="mt-3">
              <span className="font-mono">ANS</span> inserts the last result, which turns the calculator into a running tape:
              evaluate a subtotal, then build the next expression around <span className="font-mono">ANS</span> instead of
              retyping. The history list keeps your last eight evaluations, and clicking one reloads the full expression — not
              just the answer — so you can correct one number in a long formula without reconstructing it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink dark:text-white">Frequently asked questions</h2>
            <div className="mt-4 space-y-3">
              {SCI_FAQS.map((faq) => (
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
          name="How to use the Scientific Calculator"
          description="Perform scientific calculations in your browser."
          steps={[
            { name: "Enter your numbers", text: "Type on your keyboard or tap the on-screen keypad." },
            { name: "Use the functions", text: "Apply trig, logarithm, power, and root functions as needed." },
            { name: "Apply operators", text: "Combine operations using parentheses for the right order." },
            { name: "Read the result", text: "Press equals to see the computed value." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default ScientificCalculator;
