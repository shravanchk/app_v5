import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Eraser, Delete, History, Sigma } from 'lucide-react';
import { CalcLayout } from './calculator/CalcLayout';
import HowToSection from './calculator/HowToSection';
import Card from './ui/Card';
import Button from './ui/Button';
import { cn } from './ui/cn';

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

          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-ink dark:text-white">FAQ</h2>
            <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
              <p>
                <strong className="font-semibold text-ink dark:text-white">Why are trig answers different from my textbook?</strong>{' '}
                Check the angle mode. Most textbook examples use degrees.
              </p>
              <p>
                <strong className="font-semibold text-ink dark:text-white">How do I reuse previous outputs?</strong> Use{' '}
                <strong className="font-semibold text-ink dark:text-white">ANS</strong> in the keypad or click an item from
                calculation history.
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
