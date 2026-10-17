import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CalcLayout, ResultStat } from '../../calculator/CalcLayout';
import HowToSection from '../../calculator/HowToSection';
import CalculatorInfoPanel from '../../CalculatorInfoPanel';
import ResultActions from '../../ResultActions';
import { DateField, NumberField, SelectField, Tabs } from '../../ui/Field';
import Card from '../../ui/Card';
import { useShareableFields } from '../../../utils/shareableState';
import {
  parseISO, toISO, formatLong, addToDate, addBusinessDays, dayOfYear, isoWeek, isLeapYear, toYMD
} from '../../../utils/dateCalculations';
import { buildFaqSchema } from '../../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../../utils/schema';
import { FaqList, RelatedDateTools, REGION_OPTIONS, useTodayDefaults, linkCls, h2Cls, plural } from './DateKit';

const URL = 'https://upaman.com/date-calculator';

const FAQ = [
  { question: 'What date is 90 days from today?', answer: 'Leave the start date on today, choose Add, and enter 90 in Days. The answer is shown with its weekday. The table under the result also lists the dates 30, 60, 90 and 180 days out, plus 1 year, so the most common deadlines are there at a glance.' },
  { question: 'Is "3 months from now" the same as 90 days?', answer: 'Not quite. Three calendar months can be 89 to 92 days long depending on which months they cross. Adding 3 months to March 15 gives June 15 (92 days later), while adding 90 days gives June 13. Use months when an agreement says months, and days when it says days.' },
  { question: 'What happens when I add a month to January 31?', answer: 'You get the last day of February: the 28th, or the 29th in a leap year. The day is clamped to the length of the target month rather than spilling into March. Banks, payroll systems and most programming languages use the same rule, so this date will match theirs.' },
  { question: 'In what order are years, months, weeks and days added?', answer: 'Years and months first, as one block of calendar months, then weeks and days as a fixed number of days. Doing months first means "1 month and 1 day" from January 31 gives March 1 (February 28 + 1). Adding the day first would give March 1 + 1 month = April 1, which nobody means.' },
  { question: 'How do I add business days instead of calendar days?', answer: 'Switch to the Business days tab. It skips Saturdays, Sundays and, if you choose a holiday calendar, US federal or England & Wales bank holidays. The start date itself is never counted, so 1 business day after a Friday is the following Monday.' },
  { question: 'How do I count backwards, for example 45 days before a date?', answer: 'Choose Subtract. Everything works in reverse: months are clamped the same way (March 31 minus 1 month is February 28), and business days step backwards over weekends and holidays.' }
];

const SHARE_DEFAULTS = { start: '', mode: 'calendar', op: 'add', years: '0', months: '0', weeks: '0', days: '30', bdays: '10', region: 'us' };

const num = (v) => Math.max(0, Math.min(100000, Math.trunc(Number(v) || 0)));

const MODES = [
  { id: 'calendar', label: 'Days / weeks / months / years' },
  { id: 'business', label: 'Business days' }
];
const OPS = [
  { id: 'add', label: 'Add (+)' },
  { id: 'subtract', label: 'Subtract (−)' }
];

const DateCalculator = () => {
  const [start, setStart] = useState('');
  const [mode, setMode] = useState('calendar');
  const [op, setOp] = useState('add');
  const [years, setYears] = useState('0');
  const [months, setMonths] = useState('0');
  const [weeks, setWeeks] = useState('0');
  const [days, setDays] = useState('30');
  const [bdays, setBdays] = useState('10');
  const [region, setRegion] = useState('us');

  useShareableFields(
    SHARE_DEFAULTS,
    {
      start: [start, setStart], mode: [mode, setMode], op: [op, setOp], years: [years, setYears], months: [months, setMonths],
      weeks: [weeks, setWeeks], days: [days, setDays], bdays: [bdays, setBdays], region: [region, setRegion]
    },
    { mode: MODES.map((m) => m.id), op: OPS.map((o) => o.id), region: REGION_OPTIONS.map((o) => o.value) }
  );
  useTodayDefaults([[setStart, (today) => today]]);

  const base = parseISO(start);
  const sign = op === 'subtract' ? -1 : 1;

  const result = useMemo(() => {
    if (base === null) return null;
    const target = mode === 'business'
      ? addBusinessDays(base, sign * num(bdays), region)
      : addToDate(base, { years: num(years), months: num(months), weeks: num(weeks), days: num(days) }, sign);
    return { target, gap: target - base };
  }, [base, mode, sign, bdays, region, years, months, weeks, days]);

  const ladder = base === null ? [] : [
    ['+7 days', base + 7], ['+14 days', base + 14], ['+30 days', base + 30], ['+60 days', base + 60],
    ['+90 days', base + 90], ['+180 days', base + 180], ['+1 year', addToDate(base, { years: 1 })], ['−30 days', base - 30]
  ];

  const amountText = mode === 'business'
    ? plural(num(bdays), 'business day')
    : [[num(years), 'year'], [num(months), 'month'], [num(weeks), 'week'], [num(days), 'day']]
      .filter(([n]) => n).map(([n, w]) => plural(n, w)).join(', ') || '0 days';

  const t = result?.target;
  const week = t !== undefined ? isoWeek(t) : null;
  const summaryLines = result ? [
    `${formatLong(base)} ${op === 'subtract' ? '−' : '+'} ${amountText} = ${formatLong(t)}`,
    `That is ${plural(Math.abs(result.gap), 'calendar day')} ${result.gap < 0 ? 'earlier' : 'later'}`,
    `Day ${dayOfYear(t)} of ${toYMD(t).y}, ISO week ${week.week}`
  ] : [];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Date Calculator',
    url: URL,
    description: 'Add or subtract days, weeks, months, years or business days from any date. Month-end rules are handled correctly, and US/UK holidays can be skipped.',
    applicationCategory: 'UtilitiesApplication',
    priceCurrency: 'USD',
    featureList: ['Add or subtract days, weeks, months and years', 'Business days with US or UK holidays', 'Month-end clamping', 'Day of year and ISO week', 'Common deadlines at a glance']
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Everyday Tools', item: 'https://upaman.com/tools' },
    { name: 'Date Calculator', item: URL }
  ]);

  return (
    <>
      <Head>
        <title>Date Calculator | Add or Subtract Days, Weeks & Months | Upaman</title>
        <meta name="description" content="Add or subtract days, weeks, months, years or business days from any date. What date is 90 days from today? Month-end and holiday rules handled correctly." />
        <meta name="keywords" content="date calculator, add days to date, 90 days from today, 30 days from today, subtract days from date, date plus days, business days from today" />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="Date Calculator | Upaman" />
        <meta property="og:description" content="Add or subtract days, weeks, months, years or business days from any date." />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Date Calculator | Upaman" />
        <meta name="twitter:description" content="What date is 30, 60 or 90 days from today? Add or subtract any period." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(FAQ)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Everyday Tools · Dates"
        title="Date Calculator"
        subtitle="Add or subtract days, weeks, months, years or business days from any date. Find the date 90 days from today, or a deadline 10 working days out."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <Tabs tabs={MODES} active={mode} onChange={setMode} />
              <DateField id="dc-start" label="Start date" value={start} onChange={setStart} />
              <Tabs tabs={OPS} active={op} onChange={setOp} />
              {mode === 'calendar' ? (
                <div className="grid grid-cols-2 gap-3">
                  <NumberField id="dc-years" label="Years" value={years} onChange={setYears} />
                  <NumberField id="dc-months" label="Months" value={months} onChange={setMonths} />
                  <NumberField id="dc-weeks" label="Weeks" value={weeks} onChange={setWeeks} />
                  <NumberField id="dc-days" label="Days" value={days} onChange={setDays} />
                </div>
              ) : (
                <>
                  <NumberField id="dc-bdays" label="Business days" value={bdays} onChange={setBdays} hint="The start date itself is never counted." />
                  <SelectField id="dc-region" label="Skip these holidays" value={region} onChange={setRegion} options={REGION_OPTIONS} />
                </>
              )}
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {result ? (
              <>
                <Card className="p-5">
                  <p className="text-sm text-ink-muted dark:text-slate-400">
                    {formatLong(base)} {op === 'subtract' ? 'minus' : 'plus'} {amountText} is
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink dark:text-white">{formatLong(t)}</p>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Result date" value={toISO(t)} emphasis tone="positive" />
                  <ResultStat label="Calendar days apart" value={`${result.gap > 0 ? '+' : ''}${result.gap.toLocaleString('en-US')}`} />
                  <ResultStat label="Day of the year" value={`${dayOfYear(t)} of ${isLeapYear(toYMD(t).y) ? 366 : 365}`} />
                  <ResultStat label="ISO week" value={`Week ${week.week}, ${week.year}`} />
                </div>
                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Common deadlines from {formatLong(base)}</h3>
                  <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-700">
                    {ladder.map(([label, n]) => (
                      <li key={label} className="flex justify-between gap-3 py-1.5">
                        <span className="font-medium text-ink-soft dark:text-slate-300">{label}</span>
                        <span className="text-ink-muted dark:text-slate-400">{formatLong(n)}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                <ResultActions title="Date calculation" summaryLines={summaryLines} fileName="upaman-date-calculation.txt" />
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Pick a start date to calculate.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to add or subtract days from a date"
          description="Find a future or past date in three steps."
          steps={[
            { name: 'Pick the start date', text: 'It starts on today. Change it to any date, past or future.' },
            { name: 'Choose add or subtract and the amount', text: 'Enter any mix of years, months, weeks and days, or switch to business days to skip weekends and public holidays.' },
            { name: 'Read the result', text: 'The resulting date shows with its weekday, day of the year and ISO week, along with a ladder of common deadlines.' }
          ]}
        />

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className={h2Cls}>Days and months are different units</h2>
            <p>
              A day is always a day, and a week is always 7 of them. A month is not a fixed length: it can be 28, 29,
              30 or 31 days, so &ldquo;in 3 months&rdquo; and &ldquo;in 90 days&rdquo; land on different dates almost
              every time. From March 15, three months later is June 15, but 90 days later is June 13. From January 31,
              three months later is April 30, but 90 days later is May 1.
            </p>
            <p>
              Which unit is right depends on who set the deadline. Statutes and contracts that say &ldquo;30
              days&rdquo; mean days, and the business-days tab exists because many of them actually say &ldquo;30
              business days&rdquo;. Subscriptions, rent and billing cycles usually mean calendar months, renewing on the
              same day number each month.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>The month-end rule, and why January 31 + 1 month is February 28</h2>
            <p>
              Adding a month keeps the day number and changes the month. That works until the day doesn&rsquo;t exist in
              the target month: there is no February 31. The calculator then uses the last day of that month, so January
              31 + 1 month is February 28 (29 in a leap year), and March 31 − 1 month is also February 28. This is the
              convention used by banks for monthly payment dates, by payroll systems and by most date libraries. If you
              compare this result with another system, it will almost certainly agree.
            </p>
            <p>
              One effect worth knowing: <strong className="text-ink dark:text-white">month arithmetic is not reversible
              at month end</strong>. January 31 + 1 month = February 28, but February 28 − 1 month = January 28. If a
              plan schedules something &ldquo;on the 31st every month&rdquo;, check the short months by hand.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Order of operations when you mix units</h2>
            <p>
              With years, months, weeks and days all filled in, the calculator adds the calendar part first (years ×
              12 + months, as one step) and then the fixed part (weeks × 7 + days). That is how people talk about it:
              &ldquo;a year and two weeks from now&rdquo; means next year&rsquo;s same date, then two weeks on. Adding
              the months in one step also avoids drift. Twelve one-month steps from January 31 would get stuck on the
              28th after February, but one 12-month step returns to January 31.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Business days: deadlines that skip weekends and holidays</h2>
            <p>
              &ldquo;Within 10 business days&rdquo; appears in refund policies, notice periods, bank transfers and
              government processing times. Counting starts the day after the start date, and only Monday to Friday
              count. Choose a holiday calendar and US federal holidays (at their observed dates) or England &amp; Wales
              bank holidays (with substitute days) are skipped too. Ten business days from the Wednesday before
              Thanksgiving ends a day later than it would in an ordinary week. To count how many working days
              fall between two dates, or see a month-by-month table for the year, use the{' '}
              <Link href="/business-days-calculator" className={linkCls}>business days calculator</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Day of the year and ISO week numbers</h2>
            <p>
              Each result also shows its day of the year (1 to 365, or 366 in a leap year) and its ISO-8601 week number.
              Under ISO rules weeks start on Monday, and week 1 is the week containing the year&rsquo;s first Thursday.
              So the first days of January can belong to the previous year&rsquo;s week 52 or 53, and the last days of
              December can belong to the next year&rsquo;s week 1. January 1, 2027 is a Friday and falls in week 53 of
              2026. Many European workplaces and supply chains plan by week number, so it is worth checking the year
              that goes with it. To measure the gap between two dates instead, use the{' '}
              <Link href="/days-between-dates" className={linkCls}>days between dates calculator</Link>.
            </p>
          </section>
        </article>

        <FaqList title="Date calculator FAQ" items={FAQ} />
        <RelatedDateTools current="/date-calculator" />

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Method"
            inputs={['Start date', 'Add or subtract', 'Years, months, weeks and days, or a number of business days', 'Optional holiday calendar']}
            formulas={[
              'Calendar: (start ± (years × 12 + months) months, clamped to month end) ± (weeks × 7 + days)',
              'Business days: step one day at a time from the day after the start, counting only weekdays that are not holidays',
              'ISO week: the week (Monday–Sunday) containing the date’s Thursday'
            ]}
            assumptions={[
              'Gregorian calendar; dates are whole days, so daylight saving cannot shift a result',
              'US holidays follow 5 U.S.C. 6103 observed dates; UK holidays follow England & Wales rules, including one-off holidays from 2020 to 2023',
              'Scotland and Northern Ireland have different bank holidays and are not modelled'
            ]}
            sources={[
              { label: 'U.S. OPM — Federal holidays', url: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/' },
              { label: 'GOV.UK — UK bank holidays', url: 'https://www.gov.uk/bank-holidays' }
            ]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default DateCalculator;
