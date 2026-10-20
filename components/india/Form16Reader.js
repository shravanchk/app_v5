import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FileText, Lock, Scale, ShieldCheck, Upload } from 'lucide-react';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import CalcFAQ from '../calculator/CalcFAQ';
import { NumberField, SelectField } from '../ui/Field';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { cn } from '../ui/cn';
import { DecisionBanner } from '../workflow/WorkflowKit';
import ResultActions from '../ResultActions';
import InstallApp from '../InstallApp';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';
import { sharedFiles, consumeShared, isPdf } from '../../utils/sharedFiles';
const { linesFromItems, parseForm16, compareRegimesFromForm16, taxYearForAssessmentYear } = require('../../utils/form16');
const { INDIA_TAX_YEARS, INDIA_DEFAULT_TAX_YEAR, INDIA_AGE_BANDS } = require('../../utils/taxCalculations');

const LAST_REVIEWED = 'October 20, 2026';
const URL = 'https://upaman.com/form-16-reader';

// What the reader shows for checking, in Part B's order. `negative` allows a
// house-property loss.
const GROUPS = [
  {
    title: 'Salary (Part B, row 1)',
    fields: [
      { key: 'grossSalary', label: 'Gross salary — 1(d) total' },
      { key: 'salary171', label: 'Salary u/s 17(1)' },
      { key: 'perquisites172', label: 'Perquisites u/s 17(2)' },
      { key: 'profits173', label: 'Profits in lieu of salary u/s 17(3)' },
      { key: 'otherEmployerSalary', label: 'Salary from other employer(s) — 1(e)' }
    ]
  },
  {
    title: 'Exemptions u/s 10 (row 2)',
    fields: [
      { key: 'hra', label: 'House rent allowance — 10(13A)' },
      { key: 'lta', label: 'Leave travel — 10(5)' },
      { key: 'totalExemptions', label: 'Total exemptions — 2(h)' }
    ]
  },
  {
    title: 'Section 16 and other income (rows 4, 7)',
    fields: [
      { key: 'standardDeduction', label: 'Standard deduction — 16(ia)', info: true },
      { key: 'professionalTax', label: 'Professional tax — 16(iii)' },
      { key: 'houseProperty', label: 'House property (a loss is negative)', negative: true },
      { key: 'otherSources', label: 'Other sources' }
    ]
  },
  {
    title: 'Chapter VI-A, deductible amounts (row 10)',
    fields: [
      { key: 'section80C', label: '80C + 80CCC + 80CCD(1) — 10(d)' },
      { key: 'section80CCD1B', label: '80CCD(1B) — own NPS' },
      { key: 'section80CCD2', label: '80CCD(2) — employer NPS' },
      { key: 'section80D', label: '80D — health insurance' },
      { key: 'section80E', label: '80E — education loan interest' },
      { key: 'section80G', label: '80G — donations' },
      { key: 'section80TTA', label: '80TTA — savings interest' },
      { key: 'otherChapterVIA', label: 'Any other VI-A — 10(m)' }
    ]
  },
  {
    title: 'Tax deducted (Part A)',
    fields: [{ key: 'tds', label: 'TDS deducted by employer' }]
  }
];
const ALL_KEYS = GROUPS.flatMap((g) => g.fields.map((f) => f.key));

const inr = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(v));
const signed = (v) => (Math.round(v) < 0 ? `−${inr(-v)}` : inr(Math.abs(v)));
const toText = (v) => (typeof v === 'number' ? String(v) : '');
const toNum = (s) => (s === '' || s === null || s === undefined || Number.isNaN(Number(s)) ? null : Number(s));

// Proofs go to the employer in January–February, before the financial year
// ends on 31 March; once it has, the next window is a year away.
const proofSeason = (now = new Date()) => {
  const fyEnd = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
  return { fy: `${fyEnd - 1}-${String(fyEnd).slice(2)}`, window: `January–February ${fyEnd}`, fyEnd };
};

const ERRORS = {
  'not-pdf': 'That file isn’t a PDF. Form 16 is issued as a PDF — choose that file.',
  damaged: 'This PDF couldn’t be opened. It may be damaged; try downloading it again.',
  'no-text': 'This PDF has no text in it — it looks like a scan or a photo. Download the original Form 16 from your employer or TRACES, or enter the figures below by hand.'
};

function WorkingTable({ title, lines, taxLines, highlight }) {
  const row = (l, i) => (
    <li
      key={`${l.label}-${i}`}
      className={cn(
        'flex justify-between gap-3 py-1.5',
        l.detail && 'pl-3 text-xs text-ink-muted dark:text-slate-400',
        (l.subtotal || l.total) && 'font-semibold',
        l.total && 'text-base'
      )}
    >
      <span className={cn(!l.subtotal && !l.total && !l.detail && 'text-ink-soft dark:text-slate-300', (l.subtotal || l.total) && 'text-ink dark:text-white')}>{l.label}</span>
      <span className={cn('whitespace-nowrap tabular-nums', l.total ? 'text-brand-700 dark:text-brand-200' : 'text-ink dark:text-white')}>{signed(l.value)}</span>
    </li>
  );
  return (
    <Card className={cn('p-5', highlight && 'ring-2 ring-emerald-400/60')}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-base font-bold text-ink dark:text-white">{title}</h3>
        {highlight ? <Badge tone="green">Lower tax</Badge> : null}
      </div>
      <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-700">{lines.map(row)}</ul>
      <ul className="mt-3 divide-y divide-slate-100 border-t-2 border-slate-200 text-sm dark:divide-slate-700 dark:border-slate-600">{taxLines.map(row)}</ul>
    </Card>
  );
}

export default function Form16Reader() {
  const [phase, setPhase] = useState('idle'); // idle | reading | password | review
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [meta, setMeta] = useState(null); // { assessmentYear, tan, employerRegime, looksLikeForm16, hasPartB }
  const [read, setRead] = useState({}); // what the PDF said, to mark edits
  const [values, setValues] = useState({});
  const [taxYear, setTaxYear] = useState(INDIA_DEFAULT_TAX_YEAR);
  const [ageBand, setAgeBand] = useState('below60');
  const [dragging, setDragging] = useState(false);
  const bytesRef = useRef(null);

  const parse = useCallback(async (pw) => {
    setPhase('reading');
    setError('');
    try {
      const { loadPdfjs, readPdfText } = await import('../../utils/form16Pdf.mjs');
      const pages = await readPdfText(await loadPdfjs(), bytesRef.current, pw);
      const result = parseForm16(linesFromItems(pages));
      const texts = Object.fromEntries(ALL_KEYS.map((k) => [k, toText(result.fields[k])]));
      setRead(texts);
      setValues(texts);
      setMeta(result);
      setTaxYear(taxYearForAssessmentYear(result.assessmentYear) || INDIA_DEFAULT_TAX_YEAR);
      setPassword('');
      setPasswordError('');
      // The bytes are no longer needed once read.
      bytesRef.current = null;
      setPhase('review');
    } catch (e) {
      if (e && (e.code === 'password' || e.code === 'wrong-password')) {
        setPasswordError(e.code === 'wrong-password' ? 'That password didn’t open it. Check the case and try again.' : '');
        setPhase('password');
        return;
      }
      setError(ERRORS[e && e.code] || ERRORS.damaged);
      setPhase('idle');
    }
  }, []);

  const openFile = useCallback(async (file) => {
    if (!file) return;
    if (!isPdf(file)) {
      setError(ERRORS['not-pdf']);
      return;
    }
    setFileName(file.name);
    bytesRef.current = new Uint8Array(await file.arrayBuffer());
    parse();
  }, [parse]);

  // A PDF shared into the installed app (public/sw.js) arrives here.
  useEffect(() => {
    const shared = sharedFiles();
    if (!shared) return;
    shared.then((files) => {
      consumeShared();
      const pdf = files.find(isPdf);
      if (pdf) openFile(pdf);
      else setError('Nothing readable was shared. Choose your Form 16 PDF below.');
    });
  }, [openFile]);

  const enterByHand = () => {
    const empty = Object.fromEntries(ALL_KEYS.map((k) => [k, '']));
    setRead(empty);
    setValues(empty);
    setMeta(null);
    setFileName('');
    setError('');
    setPhase('review');
  };

  const fields = useMemo(() => Object.fromEntries(ALL_KEYS.map((k) => [k, toNum(values[k])])), [values]);
  const result = useMemo(
    () => (phase === 'review' ? compareRegimesFromForm16(fields, { ageBand, taxYear }) : null),
    [phase, fields, ageBand, taxYear]
  );
  const season = proofSeason();
  const formYear = taxYearForAssessmentYear(meta?.assessmentYear);

  const readCount = ALL_KEYS.filter((k) => read[k] !== '' && read[k] !== undefined).length;
  const better = result && (result.better === 'old' ? 'Old regime' : 'New regime');

  const summaryLines = result
    ? [
        `Tax year: ${INDIA_TAX_YEARS[taxYear].label}`,
        `Gross salary: ${inr(result.gross)}`,
        `Old regime: taxable ${inr(result.old.taxable)}, tax ${inr(result.old.totalTax)}`,
        `New regime: taxable ${inr(result.new.taxable)}, tax ${inr(result.new.totalTax)}`,
        `${better} saves ${inr(result.saving)}`,
        result.breakEven > 0
          ? `Old regime needs ${inr(result.breakEven)} more in deductions to break even`
          : `Old regime could lose ${inr(-result.breakEven)} of deductions and still tie`
      ]
    : [];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Form 16 Reader — Old vs New Regime',
    url: URL,
    description: 'Read your Form 16 PDF on your device and compare the old and new income tax regimes with the working shown.',
    featureList: ['Reads Form 16 Part A and Part B on the device', 'Password-protected PDFs', 'Old vs new regime with line-by-line working', 'Break-even deductions', 'What to declare to your employer']
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'India Calculators', item: 'https://upaman.com/india-calculators' },
    { name: 'Form 16 Reader', item: URL }
  ]);

  return (
    <>
      <Head>
        <title>Form 16 Reader: Old vs New Regime from Your Form 16 | Upaman</title>
        <meta
          name="description"
          content="Drop your Form 16 PDF and see old vs new tax regime with every line of the working. Read on your device — nothing is uploaded. Works with password-protected PDFs."
        />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="Form 16 Reader: Old vs New Regime | Upaman" />
        <meta property="og:description" content="Read your Form 16 on your device and compare both tax regimes, line by line. Nothing is uploaded." />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="India · Tax"
        title="Form 16 Reader"
        subtitle="Drop your Form 16 and see the old and new regimes side by side, with every line of the working. The PDF is read on your device — nothing is uploaded."
        ratesFor="FY 2025-26 & FY 2026-27"
        reviewedOn={LAST_REVIEWED}
      >
        {phase !== 'review' && (
          <div className="space-y-4">
            <label
              htmlFor="f16-file"
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                openFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-white p-10 text-center transition dark:bg-slate-900',
                dragging ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-900/20' : 'border-slate-300 hover:border-brand-400 dark:border-slate-700'
              )}
            >
              {phase === 'reading' ? (
                <>
                  <FileText size={32} className="animate-pulse text-brand-600" aria-hidden />
                  <p className="font-semibold text-ink dark:text-white">Reading {fileName || 'your Form 16'}…</p>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-brand-600 dark:text-brand-300" aria-hidden />
                  <p className="font-display text-lg font-bold text-ink dark:text-white">Drop your Form 16 PDF here</p>
                  <p className="text-sm text-ink-muted dark:text-slate-400">or tap to choose it</p>
                </>
              )}
              <input
                id="f16-file"
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => {
                  openFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>

            {phase === 'password' && (
              <Card className="p-5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (password) parse(password);
                  }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 font-semibold text-ink dark:text-white">
                    <Lock size={16} aria-hidden /> {fileName} is password-protected
                  </div>
                  <p className="text-sm text-ink-muted dark:text-slate-400">
                    The password is in the email that came with it — often a mix of your PAN and date of birth. It is used here, on this device, only to open the file.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="password"
                      autoComplete="off"
                      autoFocus
                      aria-label="PDF password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700">Open</button>
                  </div>
                  {passwordError ? <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p> : null}
                </form>
              </Card>
            )}

            {error ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">{error}</p> : null}

            <div className="flex flex-col gap-2 text-sm text-ink-muted dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5"><ShieldCheck size={15} aria-hidden /> The PDF stays on this device. Nothing is sent anywhere.</p>
              <button type="button" onClick={enterByHand} className="font-medium text-brand-700 underline underline-offset-2 dark:text-brand-300">No PDF? Enter the figures yourself</button>
            </div>
            <InstallApp variant="card" />
          </div>
        )}

        {phase === 'review' && (
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink dark:text-white">
                    {fileName ? 'Check what was read' : 'Enter your Form 16 figures'}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
                    {fileName
                      ? `${readCount} of ${ALL_KEYS.length} figures read from ${fileName}. Empty boxes weren’t on the form or couldn’t be read — fill them in from your Form 16, or leave them empty if they don’t apply.`
                      : 'Copy the figures from Part B of your Form 16. Leave anything that doesn’t apply empty.'}
                  </p>
                  {meta && (
                    <p className="mt-2 flex flex-wrap gap-2 text-xs">
                      <Badge tone={meta.assessmentYear ? 'brand' : 'slate'}>Assessment year: {meta.assessmentYear || 'not found'}</Badge>
                      <Badge tone={meta.tan ? 'brand' : 'slate'}>Employer TAN: {meta.tan || 'not found'}</Badge>
                      {meta.employerRegime ? <Badge tone="brand">Employer used the {meta.employerRegime} regime</Badge> : null}
                    </p>
                  )}
                  {meta && !meta.looksLikeForm16 ? (
                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">This doesn’t look like a Form 16, so few figures may have been found.</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => { setPhase('idle'); setMeta(null); setFileName(''); }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Read another PDF
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {GROUPS.map((g) => (
                  <fieldset key={g.title} className="space-y-3">
                    <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-ink dark:text-slate-200">{g.title}</legend>
                    {g.fields.map((f) => {
                      const wasRead = read[f.key] !== '' && read[f.key] !== undefined;
                      const edited = values[f.key] !== read[f.key];
                      let hint;
                      if (edited) hint = wasRead ? `Changed by you (form says ${signed(Number(read[f.key]))})` : 'Entered by you';
                      else if (fileName && !wasRead) hint = 'Not found on the form';
                      if (f.info) hint = `${hint ? `${hint}. ` : ''}For reference — each regime applies its own statutory amount.`;
                      return (
                        <NumberField
                          key={f.key}
                          id={`f16-${f.key}`}
                          label={f.label}
                          prefix="₹"
                          min={f.negative ? -100000000 : 0}
                          value={values[f.key] ?? ''}
                          onChange={(v) => setValues((cur) => ({ ...cur, [f.key]: v }))}
                          hint={hint}
                        />
                      );
                    })}
                  </fieldset>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-2">
                <SelectField
                  id="f16-year"
                  label="Compare under the rules for"
                  value={taxYear}
                  onChange={setTaxYear}
                  options={Object.entries(INDIA_TAX_YEARS).map(([value, y]) => ({ value, label: `${y.label}${value === formYear ? ' — your form' : ''}` }))}
                  hint={
                    meta?.assessmentYear && !formYear
                      ? `Your form is for AY ${meta.assessmentYear}, which this tool doesn’t have rules for; pick the year to compare under.`
                      : 'Budget 2026 kept FY 2025-26’s slabs and limits, so both years give the same answer.'
                  }
                />
                <SelectField
                  id="f16-age"
                  label="Your age during the year"
                  value={ageBand}
                  onChange={setAgeBand}
                  options={INDIA_AGE_BANDS.map(({ value, label }) => ({ value, label }))}
                  hint="Form 16 doesn’t say. Only the old regime’s exemption changes with age."
                />
              </div>
            </Card>

            {!result ? (
              <Card className="p-8 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter the gross salary (or the 17(1) salary) to see both regimes.
              </Card>
            ) : (
              <>
                <DecisionBanner
                  tone="positive"
                  label={result.saving === 0 ? 'Both regimes cost the same' : `${better} saves ${inr(result.saving)}`}
                  reason={`${INDIA_TAX_YEARS[taxYear].label}: old regime ${inr(result.old.totalTax)} vs new regime ${inr(result.new.totalTax)}.`}
                  icon={<Scale size={18} />}
                />
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <ResultStat label="Old regime tax" value={inr(result.old.totalTax)} emphasis={result.better === 'old'} />
                  <ResultStat label="New regime tax" value={inr(result.new.totalTax)} emphasis={result.better === 'new'} />
                  <ResultStat
                    label={result.breakEven > 0 ? 'Old regime needs more deductions' : 'Old regime’s margin'}
                    value={inr(Math.abs(result.breakEven))}
                  />
                  <ResultStat label="TDS deducted" value={fields.tds === null ? '—' : inr(fields.tds)} />
                </div>

                {result.surchargeWarning ? (
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                    Taxable income is above ₹50 lakh, where surcharge applies. This comparison doesn’t add surcharge, so both figures are understated.
                  </p>
                ) : null}

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <WorkingTable title="Old regime — the working" lines={result.old.lines} taxLines={result.old.taxLines} highlight={result.better === 'old' && result.saving > 0} />
                  <WorkingTable title="New regime (s.115BAC) — the working" lines={result.new.lines} taxLines={result.new.taxLines} highlight={result.better === 'new' && result.saving > 0} />
                </div>

                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Break-even</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                    {result.breakEven > 0 ? (
                      <>
                        The old regime would need <strong>{inr(result.breakEven)}</strong> more in deductions or exemptions — on top of the{' '}
                        {inr(result.old.deductions)} it already takes off — to cost the same as the new regime. Below that, the new regime is cheaper.
                      </>
                    ) : (
                      <>
                        The old regime is ahead. You could give up <strong>{inr(-result.breakEven)}</strong> of your{' '}
                        {inr(result.old.deductions)} in deductions and exemptions before the new regime caught up.
                      </>
                    )}
                  </p>
                  {fields.tds !== null ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
                      Your employer deducted {inr(fields.tds)}
                      {meta?.employerRegime ? ` under the ${meta.employerRegime} regime` : ''}. Under the {better.toLowerCase()} your tax on these figures is{' '}
                      {inr(Math.min(result.old.totalTax, result.new.totalTax))}
                      {(() => {
                        const gap = fields.tds - Math.min(result.old.totalTax, result.new.totalTax);
                        if (gap > 0) return ` — the ${inr(gap)} difference would come back as a refund when you file, before any other income or TDS you have.`;
                        if (gap < 0) return ` — ${inr(-gap)} more than was deducted, payable as self-assessment tax before you file.`;
                        return ', exactly what was deducted.';
                      })()}
                    </p>
                  ) : null}
                </Card>

                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">What to declare to your employer before March</h3>
                  <p className="mt-2 text-sm text-ink-muted dark:text-slate-400">
                    Investment-proof season for FY {season.fy} is {season.window}: your employer asks for evidence of what you declared, and recalculates TDS for the last months of the year. These figures are from your Form 16 — if your salary has changed since, edit the gross salary above.
                  </p>
                  {result.better === 'new' && !result.filledFlips ? (
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft dark:text-slate-300">
                      <li>
                        Tell your employer you’re in the <strong>new regime</strong> (it’s the default). Even with every rupee of your 80C, 80CCD(1B) and 80D room used — {inr(result.totalRoom)} more — the old regime would cost{' '}
                        {inr(result.oldIfFilled)}, against {inr(result.new.totalTax)} in the new.
                      </li>
                      <li>No rent receipts or investment proofs are needed for the new regime.</li>
                      <li>Ask HR whether they offer employer NPS contributions (80CCD(2)) — the one deduction the new regime keeps, up to 14% of basic pay.</li>
                    </ul>
                  ) : (
                    <>
                      <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-700">
                        {result.room.map((r) => (
                          <li key={r.key} className="flex justify-between gap-3 py-1.5">
                            <span className="text-ink-soft dark:text-slate-300">{r.label}</span>
                            <span className="whitespace-nowrap tabular-nums text-ink dark:text-white">{r.room ? `${inr(r.room)} left of ${inr(r.limit)}` : 'Full'}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm text-ink-soft dark:text-slate-300">
                        {result.totalRoom === 0
                          ? <>Your 80C, 80CCD(1B) and 80D limits are already full on this Form 16.</>
                          : result.filledFlips
                          ? <>Filling that room ({inr(result.totalRoom)}) would bring the old regime to {inr(result.oldIfFilled)} — below the new regime’s {inr(result.new.totalTax)}. Only worth it if you’d make these investments anyway.</>
                          : <>With the room filled, the old regime would come to {inr(result.oldIfFilled)}.</>}
                      </p>
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft dark:text-slate-300">
                        <li>Declare the <strong>old regime</strong> and submit proofs for everything you claim.</li>
                        <li>HRA: rent receipts and the rental agreement; your landlord’s PAN if rent is over ₹1 lakh a year.</li>
                        <li>Home loan: the lender’s certificate splitting interest (section 24(b), up to ₹2 lakh) and principal (80C).</li>
                        <li>80C: PF is automatic; add PPF, ELSS, life-insurance premium and tuition-fee receipts.</li>
                        <li>80D: health-insurance premium receipts, including any policy for your parents (up to ₹25,000 more, ₹50,000 if they’re senior citizens).</li>
                        <li>80CCD(1B): the NPS Tier I contribution receipt.</li>
                      </ul>
                    </>
                  )}
                  <p className="mt-3 text-xs text-ink-muted dark:text-slate-500">
                    What you tell your employer only sets TDS. If you have no business income you choose the regime again when you file your return.
                  </p>
                </Card>

                <ResultActions title="Form 16: old vs new regime" summaryLines={summaryLines} fileName="upaman-form16-regime.txt" />
              </>
            )}
          </div>
        )}

        <section className="mt-10 space-y-4 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">How the reader works</h2>
          <p>
            Form 16 is the certificate your employer issues each June for the year to 31 March: Part A has the tax deducted each quarter, Part B the salary computation. This page opens
            the PDF in your browser with pdf.js, reads its text layer, and picks out each figure by its row label — gross salary and its 17(1), 17(2) and 17(3) split, the section 10
            exemptions, standard deduction, professional tax, Chapter VI-A deductions and TDS. Where a row is missing or its amount can’t be read, the box is left empty rather than
            guessed, so check the figures before relying on the comparison.
          </p>
          <p>
            The comparison then reworks Part B under both regimes. The old regime keeps HRA and other section 10 exemptions, professional tax, a house-property loss of up to
            ₹2 lakh and the Chapter VI-A deductions (80C capped at ₹1.5 lakh). The new regime drops all of those except the employer’s NPS contribution, and gives a ₹75,000
            standard deduction, wider slabs and the section 87A rebate up to ₹12 lakh. Income and tax are rounded to the nearest ₹10, as the Act requires. Surcharge (above ₹50
            lakh) and section 89 relief are not modelled. For a quick what-if without a Form 16, use the{' '}
            <Link href="/tax-regime-comparison" className="font-medium text-brand-700 underline underline-offset-2 dark:text-brand-300">tax regime comparison</Link>.
          </p>
        </section>

        <CalcFAQ
          items={[
            {
              question: 'Is my Form 16 uploaded anywhere?',
              answer: 'No. The PDF is opened by your browser, on your device, and the figures are worked out there. Nothing about the file or its numbers is sent to Upaman or anyone else, and nothing is kept after you leave the page.'
            },
            {
              question: 'My Form 16 is password-protected. What is the password?',
              answer: 'Your employer sets it and usually explains it in the email that came with the PDF — a common pattern combines your PAN and date of birth. Type it when asked; it is only used to open the file in your browser.'
            },
            {
              question: 'Why are some boxes empty?',
              answer: 'The reader leaves a box empty when the row is not on your form or its amount could not be read with confidence. Employers who make their own Part B lay it out differently, and scanned PDFs have no text to read. Fill the box from the form, or leave it empty if it does not apply to you.'
            },
            {
              question: 'Can I still switch regime after my employer deducted tax under one?',
              answer: 'If you have no business or professional income, yes: you choose the regime when you file your return, whatever you told your employer. Extra tax deducted comes back as a refund; a shortfall is paid as self-assessment tax before filing.'
            },
            {
              question: 'Can I share my Form 16 straight from Gmail or WhatsApp?',
              answer: 'On Android, install Upaman (the Install app button on this page or in the footer). It then appears in the share sheet: share the PDF to Upaman and this reader opens with it. iPhone does not allow web apps to receive shared files, so choose the PDF here instead.'
            }
          ]}
        />

        <HowToSection
          name="How to compare tax regimes from your Form 16"
          description="Read a Form 16 PDF on your device and compare the old and new regimes."
          steps={[
            { name: 'Open your Form 16', text: 'Drop the PDF on the page, tap to choose it, or share it to the installed Upaman app.' },
            { name: 'Enter the password if asked', text: 'Password-protected PDFs open in your browser once you type the password from your employer’s email.' },
            { name: 'Check the figures', text: 'Correct any figure that was read wrongly and fill in any that were not found.' },
            { name: 'Compare and plan', text: 'Read both regimes’ working, the break-even, and what to declare to your employer before March.' }
          ]}
        />
      </CalcLayout>
    </>
  );
}
