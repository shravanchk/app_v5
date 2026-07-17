import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CalculatorInfoPanel from '../../CalculatorInfoPanel';
import ResultActions from '../../ResultActions';
import HowToSection from '../../calculator/HowToSection';
import { CalcLayout } from '../../calculator/CalcLayout';
import Card from '../../ui/Card';
import { cn } from '../../ui/cn';
import { buildFaqSchema } from '../../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../../utils/schema';
import {
  deepSortKeys,
  flattenObject,
  unflattenObject,
  csvToJson,
  jsonToCsv,
  parseJsonWithDetails,
  createJsonPatch,
  yamlToJson,
  jsonToYaml
} from '../../../utils/jsonTools';
import CodeEditor from './CodeEditor';
import {
  ACTIONS,
  TABS,
  SAMPLE_SNIPPETS,
  INPUT_KIND_META,
  OUTPUT_KIND_META,
  TOOL_LINKS,
  buildCanonical
} from './config';

const STORAGE_KEY = 'upaman-json-workbench-v1';

const utilityBtn =
  'inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold ' +
  'text-ink-soft transition hover:border-slate-300 hover:bg-slate-50 ' +
  'dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600';

// One editor buffer per input kind, so switching from a JSON action to a CSV
// action never shows the wrong data in the wrong mode.
const initialBuffers = () => ({
  json: SAMPLE_SNIPPETS.portfolio,
  csv: SAMPLE_SNIPPETS.csv,
  yaml: SAMPLE_SNIPPETS.yaml,
  text: SAMPLE_SNIPPETS.text
});

const yamlErrorLine = (error) => {
  const markLine = error?.mark?.line;
  return typeof markLine === 'number' ? markLine + 1 : null;
};

const JsonWorkbench = ({ page }) => {
  const pageActionIds = page.isStudio ? Object.keys(ACTIONS) : page.actions;
  const [activeAction, setActiveAction] = useState(page.defaultAction);
  const [buffers, setBuffers] = useState(initialBuffers);
  const [targetText, setTargetText] = useState(SAMPLE_SNIPPETS.portfolioTarget);
  const [outputText, setOutputText] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [status, setStatus] = useState({ type: 'info', message: 'Results update live as you type.' });
  const [inputErrorLine, setInputErrorLine] = useState(null);
  const [targetErrorLine, setTargetErrorLine] = useState(null);

  const action = ACTIONS[activeAction];
  const inputText = buffers[action.inputKind];
  const runToken = useRef(0);
  const hydrated = useRef(false);

  const activeTabId = useMemo(
    () => TABS.find((tab) => tab.actions.includes(activeAction))?.id,
    [activeAction]
  );

  // Restore unsaved work from a previous visit (shared across all JSON tool pages).
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.buffers) {
        setBuffers((current) => ({ ...current, ...saved.buffers }));
      }
      if (saved?.target) setTargetText(saved.target);
    } catch (error) {
      // Corrupt storage — fall back to samples.
    }
    hydrated.current = true;
  }, []);

  const performAction = async (actionId) => {
    const token = ++runToken.current;
    const currentAction = ACTIONS[actionId];
    const text = buffers[currentAction.inputKind];

    const apply = (updates) => {
      if (runToken.current !== token) return;
      setOutputText(typeof updates.output === 'string' ? updates.output : '');
      setStatus(updates.status);
      setInputErrorLine(updates.inputErrorLine || null);
      setTargetErrorLine(updates.targetErrorLine || null);
    };

    try {
      if (!text.trim()) {
        apply({ status: { type: 'info', message: `Paste ${currentAction.inputKind.toUpperCase()} in the input panel to begin.` } });
        return;
      }

      if (actionId === 'validate') {
        const parsed = parseJsonWithDetails(text);
        if (parsed.error) {
          const location = parsed.error.line ? ` (line ${parsed.error.line}, column ${parsed.error.column})` : '';
          apply({
            status: { type: 'error', message: `Invalid JSON${location}: ${parsed.error.message}` },
            inputErrorLine: parsed.error.line
          });
        } else {
          const topLevelType = Array.isArray(parsed.value) ? 'array' : typeof parsed.value;
          const sizeKb = (new Blob([text]).size / 1024).toFixed(2);
          apply({
            output: JSON.stringify(parsed.value, null, indentSize),
            status: { type: 'success', message: `Valid JSON detected (${topLevelType}, ${sizeKb} KB).` }
          });
        }
        return;
      }

      if (actionId === 'escape') {
        apply({
          output: JSON.stringify(text).slice(1, -1),
          status: { type: 'success', message: 'String escaped for JSON usage.' }
        });
        return;
      }

      if (actionId === 'unescape') {
        const trimmed = text.trim();
        const wrapped = (trimmed.startsWith('"') && trimmed.endsWith('"'))
          ? trimmed
          : `"${trimmed.replace(/"/g, '\\"')}"`;
        apply({
          output: JSON.parse(wrapped),
          status: { type: 'success', message: 'Escaped string decoded successfully.' }
        });
        return;
      }

      if (actionId === 'csvToJson') {
        const data = csvToJson(text);
        apply({
          output: JSON.stringify(data, null, indentSize),
          status: { type: 'success', message: `CSV converted to JSON (${data.length} row${data.length === 1 ? '' : 's'}).` }
        });
        return;
      }

      if (actionId === 'yamlToJson') {
        try {
          const data = await yamlToJson(text);
          apply({
            output: JSON.stringify(data, null, indentSize),
            status: { type: 'success', message: 'YAML converted to JSON successfully.' }
          });
        } catch (error) {
          apply({
            status: { type: 'error', message: `YAML parse error: ${error.reason || error.message}` },
            inputErrorLine: yamlErrorLine(error)
          });
        }
        return;
      }

      const parsed = parseJsonWithDetails(text);
      if (parsed.error) {
        const location = parsed.error.line ? `line ${parsed.error.line}, column ${parsed.error.column}` : 'invalid syntax';
        apply({
          status: { type: 'error', message: `Fix the input JSON first (${location}).` },
          inputErrorLine: parsed.error.line
        });
        return;
      }

      const data = parsed.value;

      if (actionId === 'format') {
        apply({
          output: JSON.stringify(data, null, indentSize),
          status: { type: 'success', message: `Formatted JSON with ${indentSize}-space indentation.` }
        });
        return;
      }

      if (actionId === 'minify') {
        const output = JSON.stringify(data);
        const savedPct = text.length ? Math.max(0, Math.round((1 - output.length / text.length) * 100)) : 0;
        apply({
          output,
          status: { type: 'success', message: `JSON minified — ${(new Blob([output]).size / 1024).toFixed(2)} KB (${savedPct}% smaller).` }
        });
        return;
      }

      if (actionId === 'sort') {
        apply({
          output: JSON.stringify(deepSortKeys(data), null, indentSize),
          status: { type: 'success', message: 'Keys sorted recursively in ascending order.' }
        });
        return;
      }

      if (actionId === 'flatten') {
        apply({
          output: JSON.stringify(flattenObject(data), null, indentSize),
          status: { type: 'success', message: 'Nested JSON flattened into dot-path keys.' }
        });
        return;
      }

      if (actionId === 'unflatten') {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          apply({ status: { type: 'warning', message: 'Unflatten expects a JSON object with flat keys.' } });
          return;
        }
        apply({
          output: JSON.stringify(unflattenObject(data), null, indentSize),
          status: { type: 'success', message: 'Flat keys expanded into nested JSON.' }
        });
        return;
      }

      if (actionId === 'jsonToCsv') {
        const { csv, rowCount } = jsonToCsv(data);
        apply({
          output: csv,
          status: { type: 'success', message: `JSON converted to CSV with ${rowCount} row${rowCount === 1 ? '' : 's'}.` }
        });
        return;
      }

      if (actionId === 'jsonToYaml') {
        apply({
          output: await jsonToYaml(data),
          status: { type: 'success', message: 'JSON converted to YAML successfully.' }
        });
        return;
      }

      if (actionId === 'jsonPatchDiff') {
        const targetParsed = parseJsonWithDetails(targetText);
        if (targetParsed.error) {
          const location = targetParsed.error.line
            ? `line ${targetParsed.error.line}, column ${targetParsed.error.column}`
            : 'invalid syntax';
          apply({
            status: { type: 'error', message: `Target JSON is invalid (${location}).` },
            targetErrorLine: targetParsed.error.line
          });
          return;
        }
        const patch = createJsonPatch(data, targetParsed.value);
        apply({
          output: JSON.stringify(patch, null, indentSize),
          status: {
            type: 'success',
            message: patch.length
              ? `JSON Patch generated with ${patch.length} operation${patch.length === 1 ? '' : 's'}.`
              : 'No differences detected. Base and target are equivalent.'
          }
        });
      }
    } catch (error) {
      apply({ status: { type: 'error', message: `Operation failed: ${error.message || 'Unknown error'}` } });
    }
  };

  // Live mode: re-run the active action shortly after any relevant change,
  // and persist unsaved work at the same cadence.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      performAction(activeAction);
      if (hydrated.current) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ buffers, target: targetText }));
        } catch (error) {
          // Storage full or unavailable — live behavior still works.
        }
      }
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buffers, targetText, activeAction, indentSize]);

  const setInputText = (value) => {
    setBuffers((current) => ({ ...current, [action.inputKind]: value }));
  };

  const loadSample = () => {
    setInputText(SAMPLE_SNIPPETS[action.sampleKey]);
    if (action.needsTarget) setTargetText(SAMPLE_SNIPPETS.portfolioTarget);
    setStatus({ type: 'info', message: 'Sample data loaded.' });
  };

  const copyOutput = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setStatus({ type: 'success', message: 'Output copied to clipboard.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Clipboard access failed. Use manual copy.' });
    }
  };

  const downloadOutput = () => {
    if (!outputText) return;
    const extension = OUTPUT_KIND_META[action.outputKind].extension;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `upaman-${action.id.toLowerCase()}-output.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const useOutputAsInput = () => {
    if (!outputText) return;
    // Route the output into the buffer that can consume it next.
    setBuffers((current) => ({ ...current, [action.outputKind]: outputText }));
    if (action.outputKind !== 'json' && action.outputKind !== 'text') {
      setStatus({ type: 'info', message: `Output moved to the ${action.outputKind.toUpperCase()} input buffer — pick a ${action.outputKind.toUpperCase()} action to continue.` });
    } else {
      setStatus({ type: 'info', message: 'Output moved to input. Pick the next action to chain transforms.' });
    }
  };

  const clearAll = () => {
    setBuffers({ json: '', csv: '', yaml: '', text: '' });
    setTargetText('');
    setOutputText('');
    setStatus({ type: 'info', message: 'Cleared all input and output.' });
  };

  const handleEditorKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      performAction(activeAction);
    }
  };

  const statusClasses = useMemo(() => {
    if (status.type === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-900/25 dark:text-emerald-300';
    if (status.type === 'warning') return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/25 dark:text-amber-300';
    if (status.type === 'error') return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-900/25 dark:text-red-300';
    return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-900/25 dark:text-sky-300';
  }, [status.type]);

  const summaryLines = useMemo(() => {
    if (!outputText) return [];
    const lines = [
      `Action: ${action.label}`,
      `Input size: ${(new Blob([inputText || '']).size / 1024).toFixed(2)} KB`,
      `Output size: ${(new Blob([outputText]).size / 1024).toFixed(2)} KB`
    ];
    if (action.needsTarget) {
      lines.push(`Target size: ${(new Blob([targetText || '']).size / 1024).toFixed(2)} KB`);
    }
    lines.push(`Characters in output: ${outputText.length}`);
    return lines;
  }, [action, inputText, outputText, targetText]);

  const visibleActionIds = page.isStudio
    ? TABS.find((tab) => tab.id === activeTabId)?.actions || []
    : pageActionIds;

  const inputMeta = INPUT_KIND_META[action.inputKind];
  const outputMeta = OUTPUT_KIND_META[action.outputKind];
  const relatedLinks = (page.related || []).map((key) => TOOL_LINKS[key]).filter(Boolean);

  return (
    <CalcLayout eyebrow={page.eyebrow} title={page.h1} subtitle={page.subtitle}>
      <Head>
        <title>{page.metaTitle}</title>
        <meta name="description" content={page.metaDescription} />
        <meta name="keywords" content={page.keywords} />
        <link rel="canonical" href={buildCanonical(page.path)} />
        <meta property="og:title" content={page.metaTitle} />
        <meta property="og:description" content={page.metaDescription} />
        <meta property="og:url" content={buildCanonical(page.path)} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.metaTitle} />
        <meta name="twitter:description" content={page.metaDescription} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildSoftwareApplicationSchema({
              name: page.schemaName,
              url: buildCanonical(page.path),
              description: page.schemaDescription,
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Web',
              priceCurrency: 'USD'
            }))
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(page.faq)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildBreadcrumbSchema([
              { name: 'Home', item: buildCanonical('/') },
              { name: 'Everyday Tools', item: buildCanonical('/tools') },
              { name: page.h1, item: buildCanonical(page.path) }
            ]))
          }}
        />
      </Head>

      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-brand-300">
        <span aria-hidden="true">⚡</span> 100% browser-side processing — nothing is uploaded
      </div>

      <div className="space-y-5">
        <Card className="p-4 sm:p-5">
          {page.isStudio ? (
            <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800/80" role="tablist" aria-label="Tool categories">
              {TABS.map((tab) => {
                const isActiveTab = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActiveTab}
                    onClick={() => setActiveAction(tab.actions[0])}
                    className={cn(
                      'rounded-lg px-3.5 py-2 text-sm font-semibold transition',
                      isActiveTab
                        ? 'bg-white text-ink shadow-sm dark:bg-slate-700 dark:text-white'
                        : 'text-ink-muted hover:text-ink dark:text-slate-400 dark:hover:text-slate-200'
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {visibleActionIds.length > 1 ? (
            <div className={cn('flex flex-wrap gap-2', page.isStudio && 'mt-3')}>
              {visibleActionIds.map((actionId) => {
                const item = ACTIONS[actionId];
                const isActive = activeAction === actionId;
                return (
                  <button
                    key={actionId}
                    type="button"
                    onClick={() => setActiveAction(actionId)}
                    aria-pressed={isActive}
                    title={item.hint}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'border-brand-400 bg-brand-50/70 text-brand-800 shadow-sm dark:border-brand-500/70 dark:bg-brand-900/20 dark:text-brand-200'
                        : 'border-slate-200 bg-white text-ink-soft hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    <span aria-hidden="true">{item.emoji}</span> {item.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <p className="mt-3 text-sm text-ink-muted dark:text-slate-400">
            <span aria-hidden="true">{action.emoji}</span> <strong className="font-semibold text-ink-soft dark:text-slate-300">{action.label}:</strong> {action.hint}. Output updates live as you type — or press Ctrl/Cmd + Enter.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft dark:text-slate-300">
              Indent:
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </label>
            <button type="button" onClick={loadSample} className={utilityBtn} title="Load sample data for the selected action">
              Load sample
            </button>
            <button type="button" onClick={useOutputAsInput} className={utilityBtn} title="Move output into input for chained transforms">
              Use output as input
            </button>
            <button type="button" onClick={copyOutput} className={utilityBtn} title="Copy output to clipboard">
              Copy output
            </button>
            <button type="button" onClick={downloadOutput} className={utilityBtn} title={`Download output as .${outputMeta.extension}`}>
              Download .{outputMeta.extension}
            </button>
            <button type="button" onClick={clearAll} className={utilityBtn} title="Clear all input and output">
              Clear
            </button>
          </div>

          <div
            role="status"
            aria-live={status.type === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            className={cn('mt-4 rounded-xl border px-3.5 py-2.5 text-sm font-semibold', statusClasses)}
          >
            {status.message}
          </div>
        </Card>

        <div className={cn('grid grid-cols-1 gap-4', action.needsTarget ? 'lg:grid-cols-3' : 'lg:grid-cols-2')}>
          <CodeEditor
            id="json-tools-input"
            label={action.needsTarget ? 'Base JSON' : inputMeta.label}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleEditorKeyDown}
            placeholder={inputMeta.placeholder}
            errorLine={inputErrorLine}
          />

          {action.needsTarget ? (
            <CodeEditor
              id="json-tools-target"
              label="Target JSON"
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              placeholder="Paste target JSON for patch generation..."
              errorLine={targetErrorLine}
            />
          ) : null}

          <CodeEditor
            id="json-tools-output"
            label={action.needsTarget ? 'RFC 6902 Patch Output' : outputMeta.label}
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
            onKeyDown={handleEditorKeyDown}
            placeholder="Transformed output appears here..."
          />
        </div>

        <ResultActions
          title={`${page.h1} summary`}
          summaryLines={summaryLines}
          fileName={`upaman-${page.slug}-summary.txt`}
        />

        {relatedLinks.length ? (
          <section aria-label="Related JSON tools">
            <h2 className="font-display text-lg font-bold text-ink dark:text-white">
              {page.isStudio ? 'Dedicated single-purpose tools' : 'Related tools'}
            </h2>
            {page.isStudio ? (
              <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
                Each action also has its own focused page — handy for bookmarking the one you use daily.
              </p>
            ) : null}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="group rounded-xl border border-slate-200/70 bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70 dark:hover:border-slate-600"
                >
                  <span className="block text-sm font-semibold text-ink group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{link.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted dark:text-slate-400">{link.blurb}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {page.isStudio ? (
          <CalculatorInfoPanel
            title="Methodology, assumptions, and source references"
            credibilityScope="This developer utility processes data entirely in your browser; output depends only on the input you provide and the documented transformation rules below."
            inputs={[
              'Input accepts JSON, CSV, and YAML (for YAML→JSON action)',
              'JSON Patch Diff compares base JSON against the target JSON panel',
              'Conversion actions infer primitive value types where possible'
            ]}
            formulas={[
              'Validation uses strict JSON.parse behavior',
              'Sort keys uses recursive lexicographic ordering',
              'Flatten/unflatten use dot notation with [index] for arrays',
              'JSON Patch Diff outputs add/remove/replace operations compatible with RFC 6902'
            ]}
            assumptions={[
              'CSV parser assumes the first row is a header (RFC 4180 quoting)',
              'YAML parsing uses the full js-yaml parser (anchors, aliases, multi-line strings)',
              'Unflatten expects object keys in dot/bracket path format',
              'Large payloads may be slower on low-memory devices'
            ]}
            sources={[
              { label: 'RFC 8259 - The JSON Data Interchange Format', url: 'https://www.rfc-editor.org/rfc/rfc8259' },
              { label: 'ECMA-404 JSON specification', url: 'https://www.ecma-international.org/publications-and-standards/standards/ecma-404/' },
              { label: 'RFC 6902 - JSON Patch', url: 'https://www.rfc-editor.org/rfc/rfc6902' }
            ]}
          />
        ) : null}

        <HowToSection
          heading={page.howTo.heading}
          name={page.howTo.name}
          description={page.howTo.description}
          steps={page.howTo.steps}
        />

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          {page.article.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-bold text-ink dark:text-white">{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="mt-3">{paragraph}</p>
              ))}
            </section>
          ))}
        </article>

        <section className="mt-10" aria-label={`${page.h1} frequently asked questions`}>
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">{page.h1} FAQ</h2>
          <div className="mt-4 grid gap-3">
            {page.faq.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </CalcLayout>
  );
};

export default JsonWorkbench;
