import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { Calculator, Eraser, Delete, History, Sigma } from 'lucide-react';
import HomeButton from './HomeButton';

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
    <div className="calculator-container" style={{ background: 'linear-gradient(135deg, #f6f4ef 0%, #e7edf4 100%)' }}>
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

      <div className="calculator-card">
        <div className="calculator-header emi-header">
          <div className="header-nav">
            <HomeButton style={{ position: 'static', top: 'auto', left: 'auto', zIndex: 'auto' }} />
            <div className="flex-spacer" />
          </div>
          <div className="header-title-container">
            <Calculator size={32} color="#facc15" aria-hidden="true" />
            <h1 className="header-title">Scientific Calculator</h1>
          </div>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>
            Solve trig, logarithmic, root, and power expressions with degree/radian control and instant history.
          </p>
        </div>

        <div className="mobile-card-content">
          <section
            style={{
              marginBottom: '1.25rem',
              background: '#f8fafc',
              border: '1px solid #dbe2eb',
              borderRadius: '0.9rem',
              padding: '1rem'
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '0.55rem', fontSize: '1.05rem', color: '#0f2a43' }}>
              How this calculator helps
            </h2>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Enter a full expression in one line instead of solving each step separately. The calculator supports
              trigonometric functions, logarithms, factorials, powers, and parentheses, making it useful for school
              math, engineering prep, and quick technical checks.
            </p>
          </section>

          <section style={{ marginBottom: '1rem' }}>
            <label htmlFor="scientific-expression" style={{ display: 'block', fontWeight: 700, marginBottom: '0.45rem', color: '#1e293b' }}>
              Expression
            </label>
            <textarea
              id="scientific-expression"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              rows={3}
              spellCheck={false}
              style={{
                width: '100%',
                borderRadius: '0.75rem',
                border: '1px solid #cbd5e1',
                padding: '0.8rem',
                fontSize: '1rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'
              }}
              placeholder="Example: sin(45)^2 + cos(45)^2"
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setAngleMode('DEG')}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '999px',
                  border: '1px solid #94a3b8',
                  background: angleMode === 'DEG' ? '#0f766e' : '#fff',
                  color: angleMode === 'DEG' ? '#fff' : '#334155',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                DEG
              </button>
              <button
                type="button"
                onClick={() => setAngleMode('RAD')}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '999px',
                  border: '1px solid #94a3b8',
                  background: angleMode === 'RAD' ? '#0f766e' : '#fff',
                  color: angleMode === 'RAD' ? '#fff' : '#334155',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                RAD
              </button>
              <button
                type="button"
                onClick={evaluateExpression}
                style={{
                  marginLeft: 'auto',
                  padding: '0.45rem 1rem',
                  borderRadius: '0.7rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0f2a43, #1d4e89)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Evaluate
              </button>
            </div>
          </section>

          <section
            style={{
              border: '1px solid #dbe2eb',
              borderRadius: '0.9rem',
              background: '#ffffff',
              padding: '0.95rem',
              marginBottom: '1rem'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#0f2a43', fontSize: '1rem' }}>Result</h3>
            <div style={{ fontSize: '1.12rem', fontWeight: 700, color: '#0f766e', wordBreak: 'break-word' }}>
              {result || 'No result yet'}
            </div>
            {error ? (
              <p style={{ margin: '0.5rem 0 0', color: '#b91c1c', fontWeight: 600, fontSize: '0.88rem' }}>{error}</p>
            ) : null}
          </section>

          <section style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.6rem', color: '#0f2a43', fontSize: '1rem' }}>Quick keypad</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {keypadRows.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '0.5rem' }}>
                  {row.map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => appendToken(token)}
                      style={{
                        padding: '0.55rem 0.25rem',
                        borderRadius: '0.6rem',
                        border: '1px solid #cbd5e1',
                        background: token === '=' ? '#0f766e' : token === 'C' ? '#fee2e2' : '#f8fafc',
                        color: token === '=' ? '#fff' : token === 'C' ? '#991b1b' : '#1e293b',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {token === 'DEL' ? <Delete size={16} style={{ margin: '0 auto' }} /> : token === 'C' ? <Eraser size={16} style={{ margin: '0 auto' }} /> : token}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#0f2a43', fontSize: '1rem' }}>Try examples</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {quickExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setExpression(example);
                    setError('');
                  }}
                  style={{
                    borderRadius: '999px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#334155',
                    fontSize: '0.82rem',
                    padding: '0.35rem 0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </section>

          <section
            style={{
              border: '1px solid #dbe2eb',
              borderRadius: '0.9rem',
              background: '#f8fafc',
              padding: '0.95rem',
              marginBottom: '1rem'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#0f2a43', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <History size={16} aria-hidden="true" />
              Recent calculations
            </h3>
            {history.length ? (
              <ul style={{ margin: 0, paddingLeft: '1rem', color: '#334155', fontSize: '0.88rem', lineHeight: 1.6 }}>
                {history.map((entry, index) => (
                  <li key={`${entry.expression}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setExpression(entry.expression)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#1d4e89',
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {entry.expression} = {entry.result}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>Run a few expressions to build history.</p>
            )}
          </section>

          <section style={{ marginBottom: '1rem' }}>
            <h2 style={{ margin: '0 0 0.6rem', color: '#0f2a43', fontSize: '1.05rem' }}>Formula notes</h2>
            <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.65 }}>
              <p style={{ marginTop: 0 }}>
                Core identities supported include Pythagorean trig identity <strong>sin²(x) + cos²(x) = 1</strong>,
                change-of-base via logarithms, and factorial expansion for permutation and combinatorics checks.
              </p>
              <p style={{ marginBottom: 0 }}>
                Use <strong>DEG</strong> mode for school-style angles (30, 45, 60) and <strong>RAD</strong> mode when
                working with calculus or programming formulas.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '0.25rem' }}>
            <h2 style={{ margin: '0 0 0.6rem', color: '#0f2a43', fontSize: '1.05rem' }}>FAQ</h2>
            <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.65 }}>
              <p style={{ marginTop: 0 }}>
                <strong>Why are trig answers different from my textbook?</strong> Check the angle mode. Most textbook
                examples use degrees.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>How do I reuse previous outputs?</strong> Use <strong>ANS</strong> in the keypad or click an item
                from calculation history.
              </p>
            </div>
          </section>

          <div style={{ marginTop: '1.2rem', color: '#64748b', fontSize: '0.82rem', display: 'flex', gap: '0.35rem', alignItems: 'flex-start' }}>
            <Sigma size={14} aria-hidden="true" style={{ marginTop: '0.1rem' }} />
            <span>
              Results are numerical approximations. Validate critical engineering and exam submissions with independent checks.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculator;
