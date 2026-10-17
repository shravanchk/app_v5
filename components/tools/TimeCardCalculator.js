import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import ResultActions from '../ResultActions';
import { NumberField, SelectField } from '../ui/Field';
import Card from '../ui/Card';
import { useShareableState, encodeRows, decodeRows, toOption } from '../../utils/shareableState';
import { RULES, computeTimeCard, toHM, toDecimalHours } from '../../utils/timeCalculations';
import { buildFaqSchema } from '../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../utils/schema';
import { FaqList, linkCls, h2Cls } from './dates/DateKit';

const URL = 'https://upaman.com/time-card-calculator';

const FAQ = [
  { question: 'How do I calculate hours worked from a time card?', answer: 'For each day, subtract the clock-in time from the clock-out time, then subtract any unpaid break. 8:45 AM to 5:15 PM is 8 hours 30 minutes, and less a 30-minute lunch that leaves 8 hours. Add the days together for the week. For payroll, convert the minutes to decimal hours by dividing by 60: 8 hours 15 minutes is 8.25 hours, not 8.15.' },
  { question: 'How do I convert minutes to decimal hours?', answer: 'Divide the minutes by 60. 15 minutes = 0.25, 20 minutes = 0.33, 30 minutes = 0.5, 45 minutes = 0.75. A common payroll mistake is writing 7 hours 30 minutes as 7.30. It is 7.5, and paying 7.30 hours shorts the employee 12 minutes.' },
  { question: 'When does overtime start?', answer: 'Under the federal Fair Labor Standards Act, non-exempt employees earn 1.5 times their regular rate for hours over 40 in a workweek. Long single days don\'t count on their own. California adds daily rules: 1.5x after 8 hours in a day, 2x after 12, and special rates on the 7th consecutive day worked in a workweek. Alaska, Nevada and Colorado have their own daily rules too. Use the federal rule for those and check the state\'s details.' },
  { question: 'Is rounding time punches legal?', answer: 'Federal rules allow employers to round clock times to the nearest 5, 6 or 15 minutes, as long as the rounding is neutral over time. Rounding to the nearest increment, as this calculator does, is neutral: with 15-minute rounding, 7 minutes past rounds down and 8 minutes past rounds up. Some states, including California, look closely at rounding that consistently favors the employer.' },
  { question: 'How are overnight shifts handled?', answer: 'If the clock-out time is earlier than the clock-in time, the calculator treats it as the next morning. 10:00 PM to 6:00 AM is 8 hours. Enter the shift on the day it started.' },
  { question: 'Are breaks paid?', answer: 'Federal law treats short breaks of about 5 to 20 minutes as paid work time. Bona fide meal periods, typically 30 minutes or more with the employee fully relieved of duty, can be unpaid. Enter only unpaid break minutes in the break column.' }
];

const DAYS_FROM_MONDAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_FROM_SUNDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ROW_FIELDS = ['start', 'end', 'breakMin'];
const workday = () => ({ start: '09:00', end: '17:30', breakMin: '30' });
const offDay = () => ({ start: '', end: '', breakMin: '0' });
const defaultRows = (weekStart) => (weekStart === 'sunday'
  ? [offDay(), workday(), workday(), workday(), workday(), workday(), offDay()]
  : [workday(), workday(), workday(), workday(), workday(), offDay(), offDay()]);

const RULE_OPTIONS = Object.entries(RULES).map(([value, label]) => ({ value, label }));
const ROUNDING_OPTIONS = [
  { value: '0', label: 'No rounding (exact minutes)' },
  { value: '5', label: 'Nearest 5 minutes' },
  { value: '6', label: 'Nearest 6 minutes (tenth of an hour)' },
  { value: '15', label: 'Nearest 15 minutes (quarter hour)' }
];
const WEEK_START_OPTIONS = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' }
];

const SHARE_DEFAULTS = { rows: encodeRows(defaultRows('monday'), ROW_FIELDS), rate: '20', rule: 'federal', rounding: '0', weekStart: 'monday' };

const money = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const hoursText = (min) => `${toHM(min)} (${toDecimalHours(min)} h)`;

const timeInputCls =
  'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-brand-400 ' +
  'focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

const TimeCardCalculator = () => {
  const [rows, setRows] = useState(defaultRows('monday'));
  const [rate, setRate] = useState('20');
  const [rule, setRule] = useState('federal');
  const [rounding, setRounding] = useState('0');
  const [weekStart, setWeekStart] = useState('monday');

  useShareableState({
    values: { rows: encodeRows(rows, ROW_FIELDS), rate, rule, rounding, weekStart },
    defaults: SHARE_DEFAULTS,
    onRestore: (shared) => {
      if ('rate' in shared && Number.isFinite(Number(shared.rate))) setRate(String(shared.rate));
      if ('rule' in shared) setRule(toOption(shared.rule, Object.keys(RULES), 'federal'));
      if ('rounding' in shared) setRounding(toOption(shared.rounding, ROUNDING_OPTIONS.map((o) => o.value), '0'));
      if ('weekStart' in shared) setWeekStart(toOption(shared.weekStart, ['monday', 'sunday'], 'monday'));
      if ('rows' in shared) {
        const decoded = decodeRows(shared.rows, ROW_FIELDS, 7);
        if (decoded.length === 7) setRows(decoded);
      }
    }
  });

  const dayNames = weekStart === 'sunday' ? DAYS_FROM_SUNDAY : DAYS_FROM_MONDAY;
  // Rows are positional, so rotate them when the workweek start changes; each
  // shift stays on its own weekday.
  const changeWeekStart = (next) => {
    if (next === weekStart) return;
    setRows((prev) => (next === 'sunday' ? [prev[6], ...prev.slice(0, 6)] : [...prev.slice(1), prev[0]]));
    setWeekStart(next);
  };
  const setCell = (i, key, value) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  const result = useMemo(
    () => computeTimeCard(rows, { rule, rounding: Number(rounding), rate }),
    [rows, rule, rounding, rate]
  );
  const { totals, pay, days } = result;
  const hasOvertime = totals.ot + totals.dt > 0;

  const summaryLines = [
    `Total hours: ${hoursText(totals.minutes)}`,
    `Regular: ${hoursText(totals.reg)}; overtime: ${hoursText(totals.ot)}${totals.dt ? `; double time: ${hoursText(totals.dt)}` : ''}`,
    `Gross pay at ${money(Number(rate) || 0)}/hour (${RULES[rule]}): ${money(pay.total)}`,
    ...days.map((d, i) => `${dayNames[i]}: ${rows[i].start && rows[i].end ? `${rows[i].start}–${rows[i].end}, ${rows[i].breakMin || 0} min break → ${toHM(d.minutes)}` : 'off'}`)
  ];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Time Card Calculator',
    url: URL,
    description: 'Weekly time card calculator: hours worked from clock-in and clock-out times with breaks, decimal hours, federal or California overtime, and gross pay.',
    applicationCategory: 'BusinessApplication',
    priceCurrency: 'USD',
    featureList: ['Clock-in / clock-out per day', 'Unpaid breaks', 'Overnight shifts', 'Decimal hours', 'Federal 40-hour overtime', 'California daily and 7th-day overtime', 'Neutral punch rounding', 'Gross pay']
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Everyday Tools', item: 'https://upaman.com/tools' },
    { name: 'Time Card Calculator', item: URL }
  ]);

  return (
    <>
      <Head>
        <title>Time Card Calculator | Hours Worked, Overtime & Pay | Upaman</title>
        <meta name="description" content="Free weekly time card calculator: hours worked from clock-in/out times with breaks, decimal hours, federal or California overtime, and gross pay. Handles overnight shifts." />
        <meta name="keywords" content="time card calculator, timesheet calculator, hours calculator, work hours calculator, overtime calculator, hours worked calculator, decimal hours" />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="Time Card Calculator | Upaman" />
        <meta property="og:description" content="Hours worked, overtime and gross pay from a weekly time card." />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Time Card Calculator | Upaman" />
        <meta name="twitter:description" content="Weekly hours, decimal hours, overtime and pay from clock-in and clock-out times." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(FAQ)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Everyday Tools · Work"
        title="Time Card Calculator"
        subtitle="Enter clock-in and clock-out times for the week to get hours worked, decimal hours, overtime under federal or California rules, and gross pay."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="p-4 sm:p-5 lg:col-span-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NumberField id="tc-rate" label="Hourly rate" prefix="$" value={rate} onChange={setRate} step={0.25} />
              <SelectField id="tc-rule" label="Overtime rule" value={rule} onChange={setRule} options={RULE_OPTIONS} />
              <SelectField id="tc-rounding" label="Round clock times" value={rounding} onChange={setRounding} options={ROUNDING_OPTIONS} />
              <SelectField id="tc-start" label="Workweek starts on" value={weekStart} onChange={changeWeekStart} options={WEEK_START_OPTIONS} />
            </div>

            <div className="mt-5">
              {/* Phones: day name and hours on their own line, inputs full width below. */}
              <div className="grid grid-cols-[1fr_1fr_4rem] items-end gap-1.5 text-xs font-medium text-ink-muted dark:text-slate-400 sm:grid-cols-[6rem_1fr_1fr_4.5rem_3.5rem] sm:gap-2">
                <span className="hidden sm:block">Day</span><span>In</span><span>Out</span><span>Break (min)</span><span className="hidden text-right sm:block">Hours</span>
              </div>
              <div className="mt-1.5 space-y-2.5 sm:space-y-1.5">
                {rows.map((row, i) => (
                  <div key={dayNames[i]} className="grid grid-cols-[1fr_1fr_4rem] items-center gap-x-1.5 gap-y-1 sm:grid-cols-[6rem_1fr_1fr_4.5rem_3.5rem] sm:gap-2">
                    <div className="col-span-3 flex justify-between text-sm sm:col-span-1">
                      <span className="font-medium text-ink-soft dark:text-slate-300">{dayNames[i]}</span>
                      <span className="tabular-nums text-ink dark:text-white sm:hidden">{days[i].minutes ? toHM(days[i].minutes) : '—'}</span>
                    </div>
                    <input aria-label={`${dayNames[i]} clock in`} type="time" value={row.start} onChange={(e) => setCell(i, 'start', e.target.value)} className={timeInputCls} />
                    <input aria-label={`${dayNames[i]} clock out`} type="time" value={row.end} onChange={(e) => setCell(i, 'end', e.target.value)} className={timeInputCls} />
                    <input aria-label={`${dayNames[i]} unpaid break in minutes`} type="number" inputMode="numeric" min="0" value={row.breakMin} onChange={(e) => setCell(i, 'breakMin', e.target.value.replace(/^0+(?=\d)/, ''))} className={timeInputCls} />
                    <span className="hidden text-right text-sm tabular-nums text-ink dark:text-white sm:block">{days[i].minutes ? toHM(days[i].minutes) : '—'}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRows((prev) => {
                    const first = prev.find((r) => r.start && r.end) || workday();
                    const weekdayIdx = weekStart === 'sunday' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4];
                    return prev.map((r, i) => (weekdayIdx.includes(i) ? { ...first } : r));
                  })}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Copy first shift to all weekdays
                </button>
                <button
                  type="button"
                  onClick={() => setRows(Array.from({ length: 7 }, offDay))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => { setRows(defaultRows(weekStart)); }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Reset to 9–5:30
                </button>
              </div>
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              <ResultStat label="Total hours" value={toHM(totals.minutes)} emphasis tone="positive" />
              <ResultStat label="Decimal hours" value={String(toDecimalHours(totals.minutes))} />
              <ResultStat label="Regular" value={toHM(totals.reg)} />
              <ResultStat label={totals.dt ? 'Overtime / double' : 'Overtime (1.5×)'} value={totals.dt ? `${toHM(totals.ot)} / ${toHM(totals.dt)}` : toHM(totals.ot)} />
            </div>
            <Card className="p-5">
              <p className="text-sm text-ink-muted dark:text-slate-400">Gross pay for the week</p>
              <p className="mt-1 font-display text-3xl font-bold text-ink dark:text-white">{money(pay.total)}</p>
              <ul className="mt-3 space-y-1 text-sm text-ink-soft dark:text-slate-300">
                <li className="flex justify-between"><span>Regular {toDecimalHours(totals.reg)} h × {money(Number(rate) || 0)}</span><span>{money(pay.reg)}</span></li>
                {totals.ot > 0 && <li className="flex justify-between"><span>Overtime {toDecimalHours(totals.ot)} h × 1.5</span><span>{money(pay.ot)}</span></li>}
                {totals.dt > 0 && <li className="flex justify-between"><span>Double time {toDecimalHours(totals.dt)} h × 2</span><span>{money(pay.dt)}</span></li>}
              </ul>
              {!hasOvertime && rule !== 'none' && (
                <p className="mt-3 text-xs text-ink-muted dark:text-slate-500">No overtime this week under the {RULES[rule]} rule.</p>
              )}
            </Card>
            <p className="text-sm text-ink-muted dark:text-slate-400">
              That is gross pay before tax. See what lands in your account with the{' '}
              <Link href="/us-paycheck-calculator" className={linkCls}>US paycheck calculator</Link>, or turn an hourly rate into
              an annual salary with the <Link href="/hourly" className={linkCls}>hourly-to-salary converter</Link>.
            </p>
            <ResultActions title="Time card summary" summaryLines={summaryLines} fileName="upaman-time-card.txt" />
          </div>
        </div>

        <HowToSection
          name="How to calculate a weekly time card"
          description="Total a week of hours, overtime and pay in three steps."
          steps={[
            { name: 'Set your rate and rules', text: 'Enter the hourly rate, pick federal or California overtime, and choose whether clock times are rounded.' },
            { name: 'Enter each shift', text: 'Type clock-in and clock-out times and any unpaid break for each day. Leave days off blank, and enter overnight shifts on the day they start.' },
            { name: 'Read the totals', text: 'Hours appear per day and for the week, in hours:minutes and decimal, split into regular, overtime and double time, with gross pay.' }
          ]}
        />

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className={h2Cls}>Hours and minutes vs decimal hours</h2>
            <p>
              Time cards record hours and minutes, but payroll multiplies by decimal hours, and mixing them up is the
              most common timesheet error. 7 hours 30 minutes is <strong className="text-ink dark:text-white">7.5</strong>{' '}
              hours, not 7.30. 8 hours 45 minutes is 8.75, and 20 minutes is 0.33. Each result here is shown both ways,
              as 7:30 and 7.5 h. Use the decimal figure when you multiply by a rate. At $20 an hour, paying 7.30 hours
              instead of 7.5 is $4 short a day, or about $1,000 a year.
            </p>
            <div className="overflow-x-auto">
              <table className="mt-2 w-full max-w-md border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left font-semibold text-ink dark:border-slate-700 dark:text-white">Minutes</th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left font-semibold text-ink dark:border-slate-700 dark:text-white">Decimal</th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left font-semibold text-ink dark:border-slate-700 dark:text-white">Minutes</th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left font-semibold text-ink dark:border-slate-700 dark:text-white">Decimal</th>
                  </tr>
                </thead>
                <tbody>
                  {[[5, 35], [10, 40], [15, 45], [20, 50], [25, 55], [30, 60]].map(([a, b]) => (
                    <tr key={a}>
                      <td className="border-b border-slate-100 px-2 py-1 dark:border-slate-700/60">{a}</td>
                      <td className="border-b border-slate-100 px-2 py-1 dark:border-slate-700/60">{(a / 60).toFixed(2)}</td>
                      <td className="border-b border-slate-100 px-2 py-1 dark:border-slate-700/60">{b}</td>
                      <td className="border-b border-slate-100 px-2 py-1 dark:border-slate-700/60">{(b / 60).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Federal overtime: 40 hours in a workweek</h2>
            <p>
              The Fair Labor Standards Act requires overtime at 1.5 times the regular rate for every hour a non-exempt
              employee works over 40 in a <em>workweek</em>, a fixed, recurring 168-hour period the employer chooses. A
              single long day doesn&rsquo;t trigger federal overtime, and you can&rsquo;t average two weeks together: 30
              hours one week and 50 the next means 10 overtime hours, even though the two weeks average 40. Paid holidays,
              vacation and sick time are not hours worked, so they don&rsquo;t count toward the 40 unless an employer
              policy or contract says they do.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>California overtime: daily limits and the 7th day</h2>
            <p>California adds daily rules on top of the weekly one:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Hours over <strong className="text-ink dark:text-white">8 in a workday</strong> are paid at 1.5×, and hours over <strong className="text-ink dark:text-white">12</strong> at 2×.</li>
              <li>On the <strong className="text-ink dark:text-white">7th consecutive day</strong> worked in a workweek, the first 8 hours are paid at 1.5× and anything beyond at 2×.</li>
              <li>Regular hours over <strong className="text-ink dark:text-white">40 in the workweek</strong> are paid at 1.5×.</li>
            </ul>
            <p>
              Hours already paid as daily overtime aren&rsquo;t counted again toward the weekly 40, so five 10-hour days
              come to 40 regular hours and 10 overtime, not more. Six 8-hour days have no daily overtime, but the sixth
              day takes the week past 40, so those 8 hours are overtime. Alternative workweek schedules (such as 4×10)
              agreed by an employee vote change the daily threshold and are not modelled here.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Rounding punches, breaks and overnight shifts</h2>
            <p>
              <strong className="text-ink dark:text-white">Rounding.</strong> The Department of Labor allows clock
              times to be rounded to the nearest 5, 6 or 15 minutes if, over time, the rounding neither underpays nor
              overpays. The nearest-increment option here is the neutral version. With 15-minute rounding a punch at
              8:07 becomes 8:00 and one at 8:08 becomes 8:15. Rounding that always goes in the employer&rsquo;s favor,
              such as always rounding clock-ins up, is not neutral.
            </p>
            <p>
              <strong className="text-ink dark:text-white">Breaks.</strong> Short rest breaks (roughly 5 to 20
              minutes) are paid time under federal rules. Only a genuine meal break, usually 30 minutes or more with the
              employee fully relieved of duty, can be unpaid. Enter only unpaid minutes.
            </p>
            <p>
              <strong className="text-ink dark:text-white">Overnight.</strong> A clock-out earlier than the clock-in is
              read as the next day, so 22:00 to 06:00 is 8 hours. For overtime, the shift counts on the day it started,
              which is how most payroll systems handle it unless your workday is defined differently.
            </p>
          </section>
        </article>

        <FaqList title="Time card FAQ" items={FAQ} />

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Method"
            inputs={['Clock-in and clock-out per day', 'Unpaid break minutes', 'Hourly rate', 'Overtime rule', 'Rounding increment']}
            formulas={[
              'Shift = rounded clock-out − rounded clock-in (+24 h if out ≤ in) − unpaid break',
              'Federal: regular = first 40 h of the workweek; overtime = the rest at 1.5×',
              'California: per day, 0–8 h regular, 8–12 h at 1.5×, 12 h+ at 2×; 7th consecutive day 0–8 h at 1.5×, 8 h+ at 2×; then regular hours past 40 become 1.5×',
              'Gross pay = regular h × rate + overtime h × 1.5 × rate + double time h × 2 × rate'
            ]}
            assumptions={[
              'Non-exempt employee paid a single hourly rate; bonuses and shift differentials that change the regular rate are not modelled',
              'Each shift counts toward the day it started',
              'California alternative workweek schedules and other states’ daily rules (e.g. Alaska, Nevada, Colorado) are not modelled'
            ]}
            sources={[
              { label: 'U.S. DOL — Overtime pay (FLSA)', url: 'https://www.dol.gov/agencies/whd/overtime' },
              { label: 'U.S. DOL — Hours worked and rounding (29 CFR 785.48)', url: 'https://www.ecfr.gov/current/title-29/section-785.48' },
              { label: 'California DIR — Overtime', url: 'https://www.dir.ca.gov/dlse/faq_overtime.htm' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default TimeCardCalculator;
