import React, { useEffect, useRef, useState } from 'react';
import { cn } from './cn';

const labelCls = 'mb-1.5 block text-sm font-medium text-ink-soft dark:text-slate-300';
const controlCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[0.95rem] text-ink ' +
  'shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 ' +
  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

type NumericInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: number | string | null | undefined;
  onChange: (raw: string) => void;
};

const toText = (v: NumericInputProps['value']) =>
  v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? '' : String(v);

// A number input that shows what the user typed rather than echoing the parent's
// state back. Most calculators coerce input with `Number(v) || 0`, so a cleared
// field became state 0 and rendered "0"; typing next produced "012". Here the
// typed text is local, and the parent's value only overwrites it when it changes
// for some other reason (a reset, a preset, a shared link, a currency switch).
export function NumericInput({ value, onChange, ...rest }: NumericInputProps) {
  const [draft, setDraft] = useState(() => toText(value));
  const justTyped = useRef(false);

  useEffect(() => {
    if (justTyped.current) return;
    setDraft(toText(value));
  }, [value]);

  // Runs after the effect above on every render, so the flag only ever covers
  // the render caused by the keystroke that set it.
  useEffect(() => {
    justTyped.current = false;
  });

  return (
    <input
      type="number"
      inputMode="decimal"
      {...rest}
      value={draft}
      onChange={(e) => {
        // "012" -> "12", but "0.5" and "0" stay as typed.
        const raw = e.target.value.replace(/^(-?)0+(?=\d)/, '$1');
        justTyped.current = true;
        setDraft(raw);
        onChange(raw);
      }}
    />
  );
}

type NumberFieldProps = {
  id: string;
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
};

export function NumberField({ id, label, value, onChange, min = 0, max, step, prefix, suffix, hint }: NumberFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <div className="relative flex items-center">
        {prefix ? <span className="pointer-events-none absolute left-3.5 text-sm text-ink-muted">{prefix}</span> : null}
        <NumericInput
          id={id}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          className={cn(controlCls, prefix && 'pl-8', suffix && 'pr-12')}
        />
        {suffix ? <span className="pointer-events-none absolute right-3.5 text-sm text-ink-muted">{suffix}</span> : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-ink-muted dark:text-slate-500">{hint}</p> : null}
    </div>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  hint?: string;
};

export function SelectField({ id, label, value, onChange, options, hint }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={controlCls}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint ? <p className="mt-1 text-xs text-ink-muted dark:text-slate-500">{hint}</p> : null}
    </div>
  );
}

type TabsProps = {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
};

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/60" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
            active === t.id
              ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-ink-muted hover:text-ink dark:text-slate-400'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (iso: string) => void;
  hint?: string;
};

// Native date picker; reads and writes ISO YYYY-MM-DD strings.
export function DateField({ id, label, value, onChange, hint }: DateFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className={cn(controlCls, 'min-h-[2.75rem]')} />
      {hint ? <p className="mt-1 text-xs text-ink-muted dark:text-slate-500">{hint}</p> : null}
    </div>
  );
}

// Today's date in the visitor's own timezone, as YYYY-MM-DD.
export const localTodayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
