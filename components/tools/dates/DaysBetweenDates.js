import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';
import { CalcLayout, ResultStat } from '../../calculator/CalcLayout';
import HowToSection from '../../calculator/HowToSection';
import CalculatorInfoPanel from '../../CalculatorInfoPanel';
import ResultActions from '../../ResultActions';
import { DateField, SelectField } from '../../ui/Field';
import Card from '../../ui/Card';
import { useShareableFields } from '../../../utils/shareableState';
import {
  parseISO, toISO, toYMD, fromYMD, formatLong, diffYMD, countDays, addMonths
} from '../../../utils/dateCalculations';
import { buildFaqSchema } from '../../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../../utils/schema';
import { FaqList, RelatedDateTools, REGION_OPTIONS, useTodayDefaults, linkCls, h2Cls, plural, ymdText } from './DateKit';

const URL = 'https://upaman.com/days-between-dates';

const FAQ = [
  { question: 'How do I calculate the number of days between two dates?', answer: 'Subtract the earlier date from the later one. Counting by hand, take the days left in the start month, add the full months in between, then the days into the end month. From March 10 to June 2: 21 days left in March, 30 in April, 31 in May, and 2 into June — 84 days. The calculator does the same thing without the month-length errors.' },
  { question: 'Does the count include the start date and the end date?', answer: 'By default the start date is counted and the end date is not, so Monday to Friday is 4 days. That is how elapsed time and "days until" countdowns work. Tick "Include the end date" when you need both ends counted, as for a hotel stay counted in days, a leave request, or a contract that runs "from and including" one date "to and including" another. That makes Monday to Friday 5 days.' },
  { question: 'How many days are there between now and Christmas?', answer: 'Open the calculator. The start date fills with today, and the "Christmas" quick button sets the end date to the next December 25. The answer updates every day because it uses the date on your own device, not the day this page was published.' },
  { question: 'How are leap years handled?', answer: 'Every date is converted to a day count on the real Gregorian calendar, so February 29 is counted in 2028 and skipped in 2026 automatically. A full year from January 1, 2028 to January 1, 2029 is 366 days, and the same span a year earlier is 365.' },
  { question: 'Why does "1 month" sometimes mean 28 days and sometimes 31?', answer: 'Calendar months differ in length, so the years-months-days breakdown counts whole months first and then the leftover days. January 31 to March 1 is "1 month, 1 day" in a non-leap year: one month lands on February 28 (the end of the shorter month), and one day more reaches March 1. Use the total days figure when you need an exact, unambiguous number.' },
  { question: 'Can I count only working days?', answer: 'Yes. The business days line counts Monday to Friday. Choose a holiday calendar (US federal or England & Wales bank holidays) to take those out too. For more detail, including adding working days to a date and a monthly table, use the business days calculator.' }
];

const SHARE_DEFAULTS = { start: '', end: '', inclusive: false, region: 'none' };

const nextAnnual = (todayIso, month, day) => {
  const today = parseISO(todayIso);
  const { y } = toYMD(today);
  const thisYear = fromYMD(y, month, day);
  return toISO(thisYear >= today ? thisYear : fromYMD(y + 1, month, day));
};

const DaysBetweenDates = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [inclusive, setInclusive] = useState(false);
  const [region, setRegion] = useState('none');

  useShareableFields(
    SHARE_DEFAULTS,
    { start: [start, setStart], end: [end, setEnd], inclusive: [inclusive, setInclusive], region: [region, setRegion] },
    { region: REGION_OPTIONS.map((o) => o.value) }
  );
  useTodayDefaults([
    [setStart, (today) => today],
    [setEnd, (today) => nextAnnual(today, 12, 25)]
  ]);

  const a = parseISO(start);
  const b = parseISO(end);

  const result = useMemo(() => {
    if (a === null || b === null) return null;
    const counts = countDays(a, b, { includeEnd: inclusive, region });
    const span = diffYMD(a, inclusive ? (b >= a ? b + 1 : b - 1) : b);
    return { counts, span };
  }, [a, b, inclusive, region]);

  const quick = (label, compute) => ({ label, compute });
  const presets = [
    quick('Christmas', (s) => nextAnnual(s, 12, 25)),
    quick("New Year's Day", (s) => nextAnnual(s, 1, 1)),
    quick('+30 days', (s) => toISO(parseISO(s) + 30)),
    quick('+90 days', (s) => toISO(parseISO(s) + 90)),
    quick('+6 months', (s) => toISO(addMonths(parseISO(s), 6))),
    quick('+1 year', (s) => toISO(addMonths(parseISO(s), 12)))
  ];

  const c = result?.counts;
  const total = c?.calendar ?? 0;
  const weeks = Math.floor(total / 7);
  const remDays = total % 7;
  const regionLabel = REGION_OPTIONS.find((o) => o.value === region)?.label;

  const summaryLines = result ? [
    `From ${formatLong(Math.min(a, b))} to ${formatLong(Math.max(a, b))}${inclusive ? ' (end date included)' : ''}`,
    `Total: ${plural(total, 'day')} (${plural(weeks, 'week')} and ${plural(remDays, 'day')})`,
    `Calendar span: ${ymdText(result.span)}`,
    `Business days: ${c.businessDays} (${regionLabel})`
  ] : [];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Days Between Dates Calculator',
    url: URL,
    description: 'Count the days between two dates, as total days, weeks, and years-months-days, with optional end-date inclusion and business days excluding US or UK holidays.',
    applicationCategory: 'UtilitiesApplication',
    priceCurrency: 'USD',
    featureList: ['Total days between dates', 'Weeks and days', 'Years, months and days', 'Include or exclude the end date', 'Business days with US or UK holidays', 'Countdown presets']
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Everyday Tools', item: 'https://upaman.com/tools' },
    { name: 'Days Between Dates', item: URL }
  ]);

  return (
    <>
      <Head>
        <title>Days Between Dates Calculator | Count Days, Weeks & Months | Upaman</title>
        <meta name="description" content="Count the days between two dates — total days, weeks, and years/months/days, with the end date included or not, plus business days excluding US or UK holidays." />
        <meta name="keywords" content="days between dates, day counter, how many days between two dates, days until, date duration calculator, how many days until christmas" />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="Days Between Dates Calculator | Upaman" />
        <meta property="og:description" content="How many days between two dates — in days, weeks, months and working days." />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Days Between Dates Calculator | Upaman" />
        <meta name="twitter:description" content="Count days, weeks, months and business days between any two dates." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(FAQ)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Everyday Tools · Dates"
        title="Days Between Dates Calculator"
        subtitle="How many days from one date to another, as total days, weeks, years-months-days and working days. You choose whether the end date counts."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              <DateField id="dbd-start" label="Start date" value={start} onChange={setStart} />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => { setStart(end); setEnd(start); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" /> Swap dates
                </button>
              </div>
              <DateField id="dbd-end" label="End date" value={end} onChange={setEnd} />

              <div>
                <p className="mb-1.5 text-sm font-medium text-ink-soft dark:text-slate-300">Quick end date (from the start date)</p>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      disabled={a === null}
                      onClick={() => setEnd(p.compute(start))}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-ink-soft dark:text-slate-300">
                <input type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                Include the end date (+1 day)
              </label>

              <SelectField id="dbd-region" label="Holidays for the business-day count" value={region} onChange={setRegion} options={REGION_OPTIONS} />
            </div>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {result ? (
              <>
                <Card className="p-5">
                  <p className="text-lg leading-relaxed text-ink dark:text-white">
                    {c.negative ? (
                      <><strong>{formatLong(b)}</strong> is <strong>{plural(total, 'day')}</strong> before <strong>{formatLong(a)}</strong>.</>
                    ) : (
                      <>From <strong>{formatLong(a)}</strong> to <strong>{formatLong(b)}</strong> is <strong>{plural(total, 'day')}</strong>{inclusive ? ', counting both dates' : ''}.</>
                    )}
                  </p>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Total days" value={total.toLocaleString('en-US')} emphasis tone="positive" />
                  <ResultStat label="Weeks + days" value={`${weeks.toLocaleString('en-US')}w ${remDays}d`} />
                  <ResultStat label="Years, months, days" value={ymdText(result.span)} />
                  <ResultStat label="Business days" value={c.businessDays.toLocaleString('en-US')} />
                  <ResultStat label="Weekend days" value={c.weekendDays.toLocaleString('en-US')} />
                  <ResultStat label="Hours" value={(total * 24).toLocaleString('en-US')} />
                </div>
                {region !== 'none' && (
                  <Card className="p-5">
                    <h3 className="font-display text-base font-bold text-ink dark:text-white">
                      Holidays in this range on weekdays ({c.holidays.length})
                    </h3>
                    {c.holidays.length ? (
                      <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-700">
                        {c.holidays.slice(0, 15).map((h) => (
                          <li key={`${h.date}-${h.name}`} className="flex justify-between gap-3 py-1.5">
                            <span className="text-ink-soft dark:text-slate-300">{h.name}</span>
                            <span className="whitespace-nowrap text-ink-muted dark:text-slate-400">{formatLong(h.date)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-ink-muted dark:text-slate-400">None. Every weekday in this range is a working day.</p>
                    )}
                    {c.holidays.length > 15 && (
                      <p className="mt-2 text-xs text-ink-muted dark:text-slate-500">Showing the first 15 of {c.holidays.length}.</p>
                    )}
                  </Card>
                )}
                <ResultActions title="Days between dates" summaryLines={summaryLines} fileName="upaman-days-between-dates.txt" />
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Pick a start and an end date to count the days between them.
              </Card>
            )}
          </div>
        </div>

        <HowToSection
          name="How to count the days between two dates"
          description="Get the exact number of days between any two dates in three steps."
          steps={[
            { name: 'Set the two dates', text: 'The start date fills with today. Pick an end date, or tap a quick button such as Christmas or +90 days.' },
            { name: 'Decide whether the end date counts', text: 'Leave the box unticked for elapsed time and countdowns. Tick it when both dates should count, as for leave or a booking.' },
            { name: 'Read the breakdown', text: 'See total days, weeks and days, years-months-days and business days. Choose a holiday calendar to take public holidays out of the working-day count.' }
          ]}
        />

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className={h2Cls}>The one decision that changes the answer: is the end date counted?</h2>
            <p>
              Ask two people how many days there are from Monday to Friday and you can get two answers, 4 and 5. Both are
              right. They are answering different questions:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink dark:text-white">Elapsed time (the default here).</strong> How much time
                passes between the two moments? From Monday morning to Friday morning is 4 days. Countdowns, ages,
                interest periods and &ldquo;days until&rdquo; questions all work this way.
              </li>
              <li>
                <strong className="text-ink dark:text-white">Days touched (tick &ldquo;Include the end date&rdquo;).</strong>{' '}
                How many calendar days does the period cover? Monday through Friday covers 5. Leave requests, event
                durations, medication courses and anything described as &ldquo;from and including&rdquo; to &ldquo;up to
                and including&rdquo; work this way.
              </li>
            </ul>
            <p>
              When a document gives a deadline in days, read how it counts them. Legal and banking rules often say
              outright that the first day is excluded and the last day included, which gives the same number as elapsed
              time. If it doesn&rsquo;t say, the safer reading is usually the one that gives you less time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Why the months-and-days figure is not just total days divided by 30</h2>
            <p>
              Months are 28, 29, 30 or 31 days long, so &ldquo;how many months&rdquo; depends on which months you cross.
              The calculator counts the way a person reading a calendar would. It moves forward one whole month at a time
              until another month would overshoot, and then counts the remaining days. When the start day doesn&rsquo;t
              exist in a shorter month, it stops at that month&rsquo;s last day. So January 31 plus one month is
              February 28 (or 29 in a leap year), not March 3.
            </p>
            <p>
              One surprising result: <strong className="text-ink dark:text-white">January 31 to February 28 and January
              28 to February 28 are both &ldquo;1 month&rdquo;</strong>, even though they are 28 and 31 days long. Where
              precision matters, such as an interest calculation or a notice period, use the total-days figure.
              Contracts that mean days should say days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Counting by hand, and the shortcuts that work</h2>
            <p>
              Without a calculator, break the span at month boundaries. From March 10 to June 2: 21 days remain in March
              (31 − 10), then 30 in April, 31 in May and 2 into June, which is 84 days in total. Two shortcuts help:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink dark:text-white">Same day, later month:</strong> the answer is the sum of the
                lengths of the months you leave. From March 10 to June 10 you leave March (31), April (30) and May (31),
                so it is 92 days.
              </li>
              <li>
                <strong className="text-ink dark:text-white">Weeks are always 7 days.</strong> A date exactly 13 weeks
                ahead is 91 days ahead and falls on the same weekday. That is why the weeks-and-days figure is handy for
                scheduling.
              </li>
            </ul>
            <p>
              The knuckle rule gives month lengths: make a fist, and each knuckle is a 31-day month and each dip between
              them a shorter one. July and August are both knuckles, which is why they are both 31 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Working days, weekends and public holidays</h2>
            <p>
              The business days figure counts Monday to Friday in the same range and follows the same end-date setting.
              Choose a holiday calendar and it also takes out public holidays that fall on weekdays. The calendars are
              US federal holidays, using the observed date when a holiday falls on a weekend, and England &amp; Wales bank
              holidays with their substitute days. A 4-week span usually has 20 working days, and a December with
              Christmas and New Year in it often has 2 or 3 fewer. To find a deadline (&ldquo;10 business days from
              today&rdquo;) or see working days month by month, use the{' '}
              <Link href="/business-days-calculator" className={linkCls}>business days calculator</Link>. To move a date
              forward or back by a set number of days, weeks or months, use the{' '}
              <Link href="/date-calculator" className={linkCls}>date calculator</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Time zones and daylight saving</h2>
            <p>
              This counter works in whole calendar days, so a daylight-saving change can&rsquo;t throw it off. The spring
              night has 23 hours and the autumn night 25, but each is still one day. &ldquo;Today&rdquo; is taken from
              your own device, so someone in Sydney and someone in San Francisco will see different starting dates for a
              few hours each day. For a precise age in years, months and days (for example for an eligibility
              cut-off), the <Link href="/age-calculator" className={linkCls}>age calculator</Link> uses the same
              calendar rules.
            </p>
          </section>
        </article>

        <FaqList title="Days between dates FAQ" items={FAQ} />
        <RelatedDateTools current="/days-between-dates" />

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Method"
            inputs={['Start date and end date (ISO calendar dates)', 'Whether the end date is counted', 'Optional public-holiday calendar']}
            formulas={[
              'Total days = end − start (+1 if the end date is included)',
              'Weeks = floor(days ÷ 7), remainder in days',
              'Years/months/days: whole calendar months first, clamped to month end, then leftover days',
              'Business days = weekdays in range − public holidays falling on weekdays'
            ]}
            assumptions={[
              'Gregorian calendar, with leap years handled by the calendar itself',
              'Dates are compared as whole days, so time zones and daylight saving do not affect the count',
              'US holidays follow 5 U.S.C. 6103 (Saturday → Friday, Sunday → Monday). UK holidays follow England & Wales rules, including one-off proclamations from 2020 to 2023'
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

export default DaysBetweenDates;
