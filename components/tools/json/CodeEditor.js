import React, { useMemo, useRef } from 'react';
import { cn } from '../../ui/cn';

const LINE_HEIGHT = 20; // px — must match the inline lineHeight on gutter + textarea
const EDITOR_PADDING_Y = 12; // px — matches py-3 so gutter rows align with text rows

// Plain-textarea code editor with a synced line-number gutter and error-line
// marker. Deliberately not CodeMirror: the site is a static export and this
// keeps the page bundle tiny while still making "line 12, column 5" findable.
const CodeEditor = ({ id, label, value, onChange, placeholder, errorLine = null, onKeyDown, className }) => {
  const textareaRef = useRef(null);
  const gutterInnerRef = useRef(null);

  const lineCount = useMemo(() => (value ? value.split('\n').length : 1), [value]);
  const sizeKb = useMemo(() => (value ? (new Blob([value]).size / 1024).toFixed(2) : '0.00'), [value]);

  const syncScroll = () => {
    if (gutterInnerRef.current && textareaRef.current) {
      gutterInnerRef.current.style.transform = `translateY(-${textareaRef.current.scrollTop}px)`;
    }
  };

  const jumpToError = () => {
    const textarea = textareaRef.current;
    if (!textarea || !errorLine) return;
    const lines = (value || '').split('\n');
    const lineStart = lines.slice(0, errorLine - 1).reduce((total, line) => total + line.length + 1, 0);
    const lineEnd = lineStart + (lines[errorLine - 1]?.length || 0);
    textarea.focus();
    textarea.setSelectionRange(lineStart, lineEnd);
    textarea.scrollTop = Math.max(0, (errorLine - 3) * LINE_HEIGHT);
    syncScroll();
  };

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-[0.03em] text-ink-muted dark:text-slate-400">
          {label}
        </label>
        <span className="flex items-center gap-2 text-[0.68rem] text-ink-muted dark:text-slate-500">
          {errorLine ? (
            <button
              type="button"
              onClick={jumpToError}
              className="rounded-md bg-red-50 px-1.5 py-0.5 font-semibold text-red-700 transition hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
            >
              Go to line {errorLine}
            </button>
          ) : null}
          {lineCount} lines · {sizeKb} KB
        </span>
      </div>

      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900">
        <div
          aria-hidden="true"
          className="w-11 shrink-0 select-none overflow-hidden border-r border-slate-100 bg-slate-50 text-right dark:border-slate-800 dark:bg-slate-900/80"
          style={{ paddingTop: EDITOR_PADDING_Y, paddingBottom: EDITOR_PADDING_Y }}
        >
          <div ref={gutterInnerRef} className="pr-2 font-mono text-[0.72rem] text-slate-400 dark:text-slate-600" style={{ lineHeight: `${LINE_HEIGHT}px` }}>
            {Array.from({ length: lineCount }, (_, index) => {
              const lineNumber = index + 1;
              const isErrorLine = errorLine === lineNumber;
              return (
                <div
                  key={lineNumber}
                  className={cn(isErrorLine && 'rounded-l-md bg-red-100 pr-0.5 font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300')}
                >
                  {lineNumber}
                </div>
              );
            })}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          wrap="off"
          aria-label={label}
          placeholder={placeholder}
          className="min-h-[320px] w-full resize-y whitespace-pre bg-transparent px-3 font-mono text-[0.82rem] text-ink outline-none dark:text-slate-100"
          style={{ lineHeight: `${LINE_HEIGHT}px`, paddingTop: EDITOR_PADDING_Y, paddingBottom: EDITOR_PADDING_Y }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
