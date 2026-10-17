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
  parseISO, toISO, toYMD, fromYMD, formatLong, countDays, addBusinessDays, addMonths, daysInMonth,
  businessDaysByMonth, holidaysBetween, isWeekend, WEEKDAYS
} from '../../../utils/dateCalculations';
import { buildFaqSchema } from '../../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../../utils/schema';
import { FaqList, RelatedDateTools, REGION_OPTIONS, useTodayDefaults, linkCls, h2Cls, plural } from './DateKit';

const URL = 'https://upaman.com/business-days-calculator';

const MODES = [
  { id: 'count', label: 'Count working days' },
  { id: 'add', label: 'Find a deadline' }
];
const DIRECTIONS = [
  { id: 'after', label: 'After the start' },
  { id: 'before', label: 'Before the start' }
];

const SHARE_DEFAULTS = { mode: 'count', start: '', end: '', inclusive: true, n: '10', dir: 'after', region: 'us' };

const shortDate = (n) => {
  const { m, d } = toYMD(n);
  return `${WEEKDAYS[new Date(n * 86400000).getUTCDay()].slice(0, 3)} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} ${d}`;
};

const BusinessDaysCalculator = ({ year }) => {
  const [mode, setMode] = useState('count');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [inclusive, setInclusive] = useState(true);
  const [n, setN] = useState('10');
  const [dir, setDir] = useState('after');
  const [region, setRegion] = useState('us');

  useShareableFields(
    SHARE_DEFAULTS,
    { mode: [mode, setMode], start: [start, setStart], end: [end, setEnd], inclusive: [inclusive, setInclusive], n: [n, setN], dir: [dir, setDir], region: [region, setRegion] },
    { mode: MODES.map((m) => m.id), dir: DIRECTIONS.map((d) => d.id), region: REGION_OPTIONS.map((o) => o.value) }
  );
  useTodayDefaults([
    [setStart, (today) => today],
    // Default range: today to the end of next month.
    [setEnd, (today) => {
      const next = addMonths(parseISO(today), 1);
      const { y, m } = toYMD(next);
      return toISO(fromYMD(y, m, daysInMonth(y, m)));
    }]
  ]);

  const a = parseISO(start);
  const b = parseISO(end);
  const count = Math.max(0, Math.min(5000, Math.trunc(Number(n) || 0)));

  const counted = useMemo(
    () => (a === null || b === null ? null : countDays(a, b, { includeEnd: inclusive, region })),
    [a, b, inclusive, region]
  );
  const deadline = useMemo(() => {
    if (a === null) return null;
    const target = addBusinessDays(a, dir === 'before' ? -count : count, region);
    const [lo, hi] = target >= a ? [a + 1, target] : [target, a - 1];
    const skippedHolidays = hi >= lo ? holidaysBetween(lo, hi, region).filter((h) => !isWeekend(h.date)) : [];
    return { target, calendarDays: Math.abs(target - a), skippedHolidays };
  }, [a, count, dir, region]);

  const tables = useMemo(() => ({
    us: businessDaysByMonth(year, 'us'),
    uk: businessDaysByMonth(year, 'uk')
  }), [year]);
  const totals = {
    us: tables.us.reduce((s, r) => s + r.businessDays, 0),
    uk: tables.uk.reduce((s, r) => s + r.businessDays, 0),
    weekdays: tables.us.reduce((s, r) => s + r.weekdays, 0)
  };
  const yearHolidays = {
    us: holidaysBetween(fromYMD(year, 1, 1), fromYMD(year, 12, 31), 'us'),
    uk: holidaysBetween(fromYMD(year, 1, 1), fromYMD(year, 12, 31), 'uk')
  };

  const regionLabel = REGION_OPTIONS.find((o) => o.value === region)?.label;
  const summaryLines = mode === 'count'
    ? (counted ? [
      `${formatLong(Math.min(a, b))} to ${formatLong(Math.max(a, b))}${inclusive ? ' (both dates counted)' : ''}`,
      `Working days: ${counted.businessDays} (${regionLabel})`,
      `Weekdays: ${counted.weekdays}, weekend days: ${counted.weekendDays}, holidays on weekdays: ${counted.weekdays - counted.businessDays}`
    ] : [])
    : (deadline ? [
      `${plural(count, 'business day')} ${dir === 'before' ? 'before' : 'after'} ${formatLong(a)} is ${formatLong(deadline.target)}`,
      `${plural(deadline.calendarDays, 'calendar day')}; holidays skipped: ${deadline.skippedHolidays.map((h) => h.name).join(', ') || 'none'} (${regionLabel})`
    ] : []);

  const FAQ = [
    { question: `How many working days are there in ${year}?`, answer: `${year} has ${totals.weekdays} weekdays. Taking out the US federal holidays that fall on weekdays leaves ${totals.us} working days. Taking out the England & Wales bank holidays leaves ${totals.uk}. The month-by-month table on this page shows where they fall.` },
    { question: 'How do I calculate business days between two dates?', answer: 'Count the weekdays (Monday to Friday) in the range, then subtract any public holidays that fall on a weekday. Holidays on a weekend do not reduce the count again, because those days are already off. The calculator does both steps and lists each holiday it removed.' },
    { question: 'Is the start date counted?', answer: 'When you count working days between two dates, both the start and the end date are counted by default, because that is how a working period like "1 to 31 October" is meant. Untick the box to exclude the end date. When you find a deadline, the start date is never counted: 1 business day after Friday is Monday.' },
    { question: 'What does "within 10 business days" mean?', answer: 'Ten weekdays, excluding public holidays, counted from the day after the request. From a Monday with no holidays that is the Monday two weeks later, 14 calendar days on. With a holiday in between, the deadline moves a day later. Use the "Find a deadline" tab to get the exact date.' },
    { question: 'Which holidays are included?', answer: 'US: the 11 federal holidays in 5 U.S.C. 6103, including Juneteenth since 2021, at their observed dates (a Saturday holiday is observed on Friday, a Sunday one on Monday). UK: England & Wales bank holidays with substitute days, including the one-off holidays of 2020 to 2023. State, school and company holidays vary too much to include, so subtract them yourself.' },
    { question: 'Are banks and the stock market closed on the same days?', answer: 'Mostly, but not exactly. US banks follow the Federal Reserve schedule, which matches the federal holidays. The NYSE closes on Good Friday, which is not a federal holiday, and stays open on Columbus Day and Veterans Day. UK banks close on bank holidays. For settlement dates, check the specific exchange or bank calendar.' }
  ];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Business Days Calculator',
    url: URL,
    description: 'Count working days between two dates, or find the date N business days away, skipping weekends and US federal or UK bank holidays. Includes a month-by-month working-day table.',
    applicationCategory: 'UtilitiesApplication',
    priceCurrency: 'USD',
    featureList: ['Working days between dates', 'Deadline N business days away', 'US federal holidays with observed dates', 'England & Wales bank holidays with substitute days', `Working days per month in ${year}`]
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Everyday Tools', item: 'https://upaman.com/tools' },
    { name: 'Business Days Calculator', item: URL }
  ]);

  const tableCls = 'w-full border-collapse text-sm';
  const thCls = 'border-b border-slate-200 px-2 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:text-white';
  const tdCls = 'border-b border-slate-100 px-2 py-1.5 text-ink-soft dark:border-slate-700/60 dark:text-slate-300';

  return (
    <>
      <Head>
        <title>{`Business Days Calculator | Working Days in ${year} (US & UK) | Upaman`}</title>
        <meta name="description" content={`Count working days between two dates or find a deadline N business days away, skipping weekends and US federal or UK bank holidays. ${year} has ${totals.us} US working days.`} />
        <meta name="keywords" content={`business days calculator, working days calculator, business days between dates, 10 business days from today, working days in ${year}, bank holidays ${year}`} />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="Business Days Calculator | Upaman" />
        <meta property="og:description" content="Working days between dates and business-day deadlines, with US and UK holidays." />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Business Days Calculator | Upaman" />
        <meta name="twitter:description" content="Count working days and find deadlines, skipping weekends and public holidays." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(FAQ)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Everyday Tools · Dates"
        title="Business Days Calculator"
        subtitle="Count the working days between two dates, or find the date a set number of business days away. Weekends and US federal or UK bank holidays are skipped."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <Tabs tabs={MODES} active={mode} onChange={setMode} />
              <SelectField id="bd-region" label="Holiday calendar" value={region} onChange={setRegion} options={REGION_OPTIONS} />
              <DateField id="bd-start" label="Start date" value={start} onChange={setStart} />
              {mode === 'count' ? (
                <>
                  <DateField id="bd-end" label="End date" value={end} onChange={setEnd} />
                  <label className="flex items-center gap-2 text-sm text-ink-soft dark:text-slate-300">
                    <input type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                    Count the end date as well
                  </label>
                </>
              ) : (
                <>
                  <NumberField id="bd-n" label="Number of business days" value={n} onChange={setN} />
                  <Tabs tabs={DIRECTIONS} active={dir} onChange={setDir} />
                </>
              )}
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {mode === 'count' && counted && (
              <>
                <Card className="p-5">
                  <p className="text-lg leading-relaxed text-ink dark:text-white">
                    <strong>{plural(counted.businessDays, 'working day')}</strong> from <strong>{formatLong(Math.min(a, b))}</strong> to{' '}
                    <strong>{formatLong(Math.max(a, b))}</strong>{inclusive ? ', both dates included' : ''}.
                  </p>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Working days" value={counted.businessDays.toLocaleString('en-US')} emphasis tone="positive" />
                  <ResultStat label="Calendar days" value={counted.calendar.toLocaleString('en-US')} />
                  <ResultStat label="Weekend days" value={counted.weekendDays.toLocaleString('en-US')} />
                  <ResultStat label="Holidays on weekdays" value={String(counted.weekdays - counted.businessDays)} />
                </div>
                {counted.holidays.length > 0 && (
                  <Card className="p-5">
                    <h3 className="font-display text-base font-bold text-ink dark:text-white">Holidays taken out</h3>
                    <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-700">
                      {counted.holidays.slice(0, 20).map((h) => (
                        <li key={`${h.date}-${h.name}`} className="flex justify-between gap-3 py-1.5">
                          <span className="text-ink-soft dark:text-slate-300">{h.name}</span>
                          <span className="whitespace-nowrap text-ink-muted dark:text-slate-400">{formatLong(h.date)}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </>
            )}
            {mode === 'add' && deadline && (
              <>
                <Card className="p-5">
                  <p className="text-sm text-ink-muted dark:text-slate-400">
                    {plural(count, 'business day')} {dir === 'before' ? 'before' : 'after'} {formatLong(a)} is
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink dark:text-white">{formatLong(deadline.target)}</p>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Deadline" value={toISO(deadline.target)} emphasis tone="positive" />
                  <ResultStat label="Calendar days" value={deadline.calendarDays.toLocaleString('en-US')} />
                </div>
                <Card className="p-5 text-sm text-ink-soft dark:text-slate-300">
                  {deadline.skippedHolidays.length
                    ? <>Skipped {deadline.skippedHolidays.length === 1 ? 'a holiday' : `${deadline.skippedHolidays.length} holidays`}: {deadline.skippedHolidays.map((h) => `${h.name} (${shortDate(h.date)})`).join(', ')}.</>
                    : <>No public holidays fall in this window; only weekends were skipped.</>}
                </Card>
              </>
            )}
            {((mode === 'count' && !counted) || (mode === 'add' && !deadline)) && (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Pick a start date to calculate.
              </Card>
            )}
            {((mode === 'count' && counted) || (mode === 'add' && deadline)) && (
              <ResultActions title="Business days calculation" summaryLines={summaryLines} fileName="upaman-business-days.txt" />
            )}
          </div>
        </div>

        <section className="mt-10">
          <h2 className={h2Cls}>Working days in {year}, month by month</h2>
          <p className="mt-2 text-sm text-ink-muted dark:text-slate-400">
            {`Weekdays less the public holidays that fall on them. ${year} has ${totals.weekdays} weekdays, which leaves ${totals.us} US working days and ${totals.uk} in England & Wales.`}
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200/70 bg-white p-3 dark:border-slate-700/70 dark:bg-slate-800/70">
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Month</th>
                  <th className={thCls}>Weekdays</th>
                  <th className={thCls}>US working days</th>
                  <th className={thCls}>UK working days</th>
                </tr>
              </thead>
              <tbody>
                {tables.us.map((row, i) => (
                  <tr key={row.month}>
                    <td className={tdCls}>{row.month}</td>
                    <td className={tdCls}>{row.weekdays}</td>
                    <td className={tdCls}>{row.businessDays}{row.holidays ? <span className="text-ink-muted dark:text-slate-500"> (−{row.holidays})</span> : null}</td>
                    <td className={tdCls}>{tables.uk[i].businessDays}{tables.uk[i].holidays ? <span className="text-ink-muted dark:text-slate-500"> (−{tables.uk[i].holidays})</span> : null}</td>
                  </tr>
                ))}
                <tr>
                  <td className={`${tdCls} font-semibold text-ink dark:text-white`}>Total</td>
                  <td className={`${tdCls} font-semibold text-ink dark:text-white`}>{totals.weekdays}</td>
                  <td className={`${tdCls} font-semibold text-ink dark:text-white`}>{totals.us}</td>
                  <td className={`${tdCls} font-semibold text-ink dark:text-white`}>{totals.uk}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {[['us', `US federal holidays ${year}`], ['uk', `England & Wales bank holidays ${year}`]].map(([key, title]) => (
              <div key={key} className="rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <h3 className="font-display text-base font-bold text-ink dark:text-white">{title}</h3>
                <ul className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-700">
                  {yearHolidays[key].map((h) => (
                    <li key={`${h.date}-${h.name}`} className="flex justify-between gap-3 py-1.5">
                      <span className="text-ink-soft dark:text-slate-300">{h.name}</span>
                      <span className="whitespace-nowrap text-ink-muted dark:text-slate-400">{shortDate(h.date)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <HowToSection
          name="How to calculate business days"
          description="Count working days or find a business-day deadline in three steps."
          steps={[
            { name: 'Pick a holiday calendar', text: 'Choose US federal holidays, England & Wales bank holidays, or weekends only.' },
            { name: 'Choose what to calculate', text: 'Count the working days between two dates, or find the date a number of business days before or after a start date.' },
            { name: 'Read the result', text: 'See the working-day count or the deadline, with every holiday that was taken out listed by name.' }
          ]}
        />

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className={h2Cls}>What counts as a business day</h2>
            <p>
              A business day is a weekday that is not a public holiday. In the US and UK that means Monday to Friday,
              minus the holidays that fall on those days. A year has 260 to 262 weekdays, depending on which weekday it
              starts on and whether it is a leap year. Federal and bank holidays then remove about 8 to 11 more. The
              rest, usually around 250, are the days that payroll, shipping estimates, legal notice periods and
              &ldquo;allow 5 to 7 business days&rdquo; promises are measured in.
            </p>
            <p>
              Holidays that fall on a weekend do not cost a second day, because the rules move them. In the US a
              Saturday holiday is observed on the Friday before and a Sunday holiday on the Monday after. In England
              &amp; Wales a weekend holiday gets a substitute weekday, normally the next Monday. When Christmas and Boxing
              Day both fall on a weekend, the substitutes are Monday and Tuesday. The calculator uses the observed and
              substitute dates, because those are the days offices are actually closed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Counting a range vs counting to a deadline</h2>
            <p>
              The two tabs answer different questions, and they treat the start date differently on purpose:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink dark:text-white">Count working days</strong> covers a period: &ldquo;how many
                working days are there in October?&rdquo; or &ldquo;how many days of leave does 3 to 14 March use?&rdquo;
                Both ends count by default, because a period from the 3rd to the 14th includes both days. Untick the box
                if your rule excludes the end date.
              </li>
              <li>
                <strong className="text-ink dark:text-white">Find a deadline</strong> counts forward or back from an
                event: &ldquo;respond within 10 business days of receipt&rdquo;. The day of the event is day zero, and
                counting starts the next business day. One business day after a Friday is Monday, and 5 business days
                after a Monday is the next Monday.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Where business-day rules show up</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-ink dark:text-white">Payments and banking.</strong> ACH and BACS transfers settle on banking days, so money sent on a Friday before a holiday Monday may not arrive until Tuesday.</li>
              <li><strong className="text-ink dark:text-white">Employment.</strong> Notice periods, pay dates that move when they fall on a holiday, and leave balances are usually counted in working days. A two-week holiday that spans a bank holiday uses one day less of leave.</li>
              <li><strong className="text-ink dark:text-white">Consumer rights and refunds.</strong> Many refund policies and statutory response times are given in business days. A &ldquo;14-day&rdquo; promise and a &ldquo;10 business day&rdquo; promise are often about the same length.</li>
              <li><strong className="text-ink dark:text-white">Shipping.</strong> &ldquo;Ships in 3 to 5 business days&rdquo; for an order placed on Thanksgiving means the following Tuesday at the earliest and Thursday at the latest.</li>
            </ul>
            <p>
              If you only need calendar days between two dates, the{' '}
              <Link href="/days-between-dates" className={linkCls}>days between dates calculator</Link> is quicker. To move
              a date by months or years, use the <Link href="/date-calculator" className={linkCls}>date calculator</Link>.
              If you are working out how many hours a salary covers, the{' '}
              <Link href="/hourly" className={linkCls}>hourly-to-salary converter</Link> uses a standard 2,080-hour year
              (260 weekdays × 8 hours) that you can compare with the working-day totals above.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>What the calculator does not know</h2>
            <p>
              It covers national public holidays only. Not included: US state holidays (for example Cesar Chavez Day in
              California or Patriots&rsquo; Day in Massachusetts), Scottish and Northern Irish bank holidays (Scotland
              takes January 2 and St Andrew&rsquo;s Day, and Northern Ireland takes St Patrick&rsquo;s Day and July 12),
              school holidays, and company shutdown days. The day after Thanksgiving is a holiday for many US employers
              but is not a federal one. Future one-off holidays, such as the UK&rsquo;s Platinum Jubilee in 2022, are added
              once they are announced. If your workplace has extra days off, subtract them from the result.
            </p>
          </section>
        </article>

        <FaqList title="Business days FAQ" items={FAQ} />
        <RelatedDateTools current="/business-days-calculator" />

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Method"
            inputs={['Holiday calendar (US federal, England & Wales, or none)', 'Start and end dates, or a start date and a number of business days']}
            formulas={[
              'Working days = weekdays in range − distinct public holidays falling on weekdays',
              'Deadline: step day by day from the day after the start, counting weekdays that are not holidays',
              'US observed date: Saturday → Friday, Sunday → Monday',
              'UK substitute day: next weekday not already a bank holiday'
            ]}
            assumptions={[
              'US: the 11 federal holidays of 5 U.S.C. 6103 (Juneteenth from 2021)',
              'UK: England & Wales bank holidays, including the one-off holidays of 2020–2023; Easter dates are computed with the Gregorian computus',
              `The month-by-month table is for ${year}; calculators work for any year`
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

export default BusinessDaysCalculator;
