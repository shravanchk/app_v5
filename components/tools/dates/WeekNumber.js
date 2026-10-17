import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CalcLayout, ResultStat } from '../../calculator/CalcLayout';
import CalculatorInfoPanel from '../../CalculatorInfoPanel';
import { DateField, localTodayISO } from '../../ui/Field';
import Card from '../../ui/Card';
import { parseISO, toYMD, formatLong, isoWeek, isoWeeksInYear, isoWeeksOfYear, usWeek, dayOfYear, MONTHS } from '../../../utils/dateCalculations';
import { buildFaqSchema } from '../../../utils/faqSchema';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../../../utils/schema';
import { FaqList, RelatedDateTools, linkCls, h2Cls } from './DateKit';

const URL = 'https://upaman.com/week-number';

const shortDay = (n) => {
  const { m, d } = toYMD(n);
  return `${MONTHS[m - 1].slice(0, 3)} ${d}`;
};

const WeekNumber = ({ year }) => {
  const [today, setToday] = useState('');
  const [lookup, setLookup] = useState('');
  useEffect(() => {
    const t = localTodayISO();
    setToday(t);
    setLookup((current) => current || t);
  }, []);

  const todayNum = parseISO(today);
  const current = todayNum === null ? null : isoWeek(todayNum);
  const lookupNum = parseISO(lookup);
  const looked = lookupNum === null ? null : { iso: isoWeek(lookupNum), us: usWeek(lookupNum) };

  const weeks = useMemo(() => isoWeeksOfYear(year), [year]);
  const weekCount = weeks.length;
  const nextCount = isoWeeksInYear(year + 1);

  const FAQ = [
    { question: 'What week number is it today?', answer: 'The large number at the top of this page is the current ISO-8601 week, worked out from the date on your own device. The full table shows the Monday and Sunday of every week, and the current week is highlighted.' },
    { question: `How many weeks are there in ${year}?`, answer: `${year} has ${weekCount} ISO weeks. ${weekCount === 53 ? `It is a 53-week year because ${year} ${new Date(Date.UTC(year, 0, 1)).getUTCDay() === 4 ? 'starts on a Thursday' : 'is a leap year that starts on a Wednesday'}, so its last week runs into January ${year + 1}.` : 'Most years have 52.'} ${year + 1} has ${nextCount}.` },
    { question: 'When does week 1 start?', answer: 'Under ISO 8601, week 1 is the week (Monday to Sunday) that contains the first Thursday of January. Equivalently, it is the week that contains January 4. So week 1 can start as early as December 29 of the previous year or as late as January 4.' },
    { question: 'Why does my calendar or spreadsheet show a different week number?', answer: 'Many US calendars and Excel\'s default WEEKNUM function use a different system: weeks start on Sunday, and week 1 is whatever week contains January 1, however short. The two systems often differ by one, especially around New Year. In Excel, ISOWEEKNUM() or WEEKNUM(date, 21) gives the ISO number shown here.' },
    { question: 'Can a week number belong to a different year than its date?', answer: 'Yes. January 1–3 can fall in week 52 or 53 of the previous year, and December 29–31 can fall in week 1 of the next. That is why ISO dates written by week include the week-year: 2026-W53 runs from December 28, 2026 to January 3, 2027.' }
  ];

  const softwareSchema = buildSoftwareApplicationSchema({
    name: 'Week Number Calculator',
    url: URL,
    description: `Current ISO week number, the week number of any date, and a full ${year} week calendar with each week's Monday and Sunday.`,
    applicationCategory: 'UtilitiesApplication',
    priceCurrency: 'USD',
    featureList: ['Current week number', 'Week number for any date', `All ${weekCount} weeks of ${year}`, 'ISO 8601 and US week numbering']
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', item: 'https://upaman.com/' },
    { name: 'Everyday Tools', item: 'https://upaman.com/tools' },
    { name: 'Week Number', item: URL }
  ]);

  const thCls = 'border-b border-slate-200 px-2 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:text-white';
  const tdCls = 'border-b border-slate-100 px-2 py-1.5 text-ink-soft dark:border-slate-700/60 dark:text-slate-300';

  return (
    <>
      <Head>
        <title>{`What Week Is It? Week Number Today & ${year} Week Calendar | Upaman`}</title>
        <meta name="description" content={`The current week number, the week number of any date, and all ${weekCount} ISO weeks of ${year} with their start and end dates. Includes US week numbering.`} />
        <meta name="keywords" content={`what week is it, week number, current week number, week number ${year}, iso week, calendar week, week numbers ${year}`} />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="What Week Is It? | Upaman" />
        <meta property="og:description" content={`Current week number and the full ${year} week calendar.`} />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="What Week Is It? | Upaman" />
        <meta name="twitter:description" content={`Current week number and all ${weekCount} weeks of ${year}.`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(FAQ)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Everyday Tools · Dates"
        title="What Week Is It?"
        subtitle={`The current ISO week number, the week of any date, and all ${weekCount} weeks of ${year} with their dates.`}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="flex flex-col items-center justify-center p-6 text-center lg:col-span-2">
            <p className="text-sm font-medium uppercase tracking-wide text-ink-muted dark:text-slate-400">Today is week</p>
            <p className="mt-1 font-display text-7xl font-bold text-brand-600 dark:text-brand-300">{current ? current.week : '—'}</p>
            <p className="mt-2 text-sm text-ink-soft dark:text-slate-300">
              {todayNum !== null ? <>{formatLong(todayNum)} · {current.year}-W{String(current.week).padStart(2, '0')}</> : 'Working out today’s date…'}
            </p>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            <Card className="p-5">
              <DateField id="wk-lookup" label="Week number of another date" value={lookup} onChange={setLookup} />
            </Card>
            {looked && (
              <div className="grid grid-cols-2 gap-3">
                <ResultStat label="ISO week (Mon–Sun)" value={`Week ${looked.iso.week}, ${looked.iso.year}`} emphasis tone="positive" />
                <ResultStat label="US week (Sun–Sat)" value={`Week ${looked.us}`} />
                <ResultStat label="Day of the year" value={String(dayOfYear(lookupNum))} />
                <ResultStat label="Weekday" value={formatLong(lookupNum).split(',')[0]} />
              </div>
            )}
          </div>
        </div>

        <section className="mt-10">
          <h2 className={h2Cls}>All {weekCount} weeks of {year}</h2>
          <p className="mt-2 text-sm text-ink-muted dark:text-slate-400">ISO 8601 weeks, Monday to Sunday. {current && current.year === year ? 'The current week is highlighted.' : ''}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[weeks.slice(0, Math.ceil(weekCount / 2)), weeks.slice(Math.ceil(weekCount / 2))].map((half, i) => (
              <div key={i} className="overflow-x-auto rounded-xl border border-slate-200/70 bg-white p-3 dark:border-slate-700/70 dark:bg-slate-800/70">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr><th className={thCls}>Week</th><th className={thCls}>Monday</th><th className={thCls}>Sunday</th></tr>
                  </thead>
                  <tbody>
                    {half.map((w) => {
                      const isNow = current && current.year === year && current.week === w.week;
                      return (
                        <tr key={w.week} className={isNow ? 'bg-brand-50 font-semibold dark:bg-brand-900/30' : undefined}>
                          <td className={tdCls}>{w.week}</td>
                          <td className={tdCls}>{shortDay(w.start)}{toYMD(w.start).y !== year ? `, ${toYMD(w.start).y}` : ''}</td>
                          <td className={tdCls}>{shortDay(w.end)}{toYMD(w.end).y !== year ? `, ${toYMD(w.end).y}` : ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        <article className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section className="space-y-3">
            <h2 className={h2Cls}>How ISO week numbers work</h2>
            <p>
              ISO 8601 is the international standard, and it is the week number most of Europe, logistics and software
              use. Its rules are short:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Weeks run Monday to Sunday.</li>
              <li>Week 1 is the week containing the year&rsquo;s first Thursday, which is also the week containing January 4.</li>
              <li>A year therefore has 52 or 53 full weeks, and no week is ever split across two week-years.</li>
            </ul>
            <p>
              The Thursday rule means a week belongs to whichever year holds most of its days (4 or more of the 7).
              The cost is that the edges of the year can disagree with the calendar. In {year}, week 1 began on{' '}
              {formatLong(weeks[0].start)}, and week {weekCount} ends on {formatLong(weeks[weekCount - 1].end)}.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>Why some years have 53 weeks</h2>
            <p>
              52 weeks are 364 days, one or two short of a year. The spare days add up, and roughly every five or six
              years the calendar gains a 53rd ISO week. That happens when the year starts on a Thursday, or when a leap
              year starts on a Wednesday. {year} has {weekCount} weeks and {year + 1} has {nextCount}. Payroll and
              budgeting run on weeks: a business paying weekly makes 53 payments in some years, and a fixed annual
              budget split into 52 weekly amounts falls one week short in those years.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={h2Cls}>The US system, and why spreadsheets disagree</h2>
            <p>
              Many US calendars, and Excel&rsquo;s default <code>WEEKNUM()</code>, count weeks from Sunday and call the
              week containing January 1 &ldquo;week 1&rdquo;, even if it is only a single day. That system can have 53
              or even 54 numbered weeks, and from early January it often runs one ahead of ISO. The lookup above shows
              both. In a spreadsheet, use <code>ISOWEEKNUM(date)</code> in Excel or Google Sheets for the ISO number. In
              code, Python&rsquo;s <code>date.isocalendar()</code> and the <code>%V</code> format specifier both
              return ISO weeks.
            </p>
            <p>
              To count the days or working days between two weeks, use the{' '}
              <Link href="/days-between-dates" className={linkCls}>days between dates calculator</Link> or the{' '}
              <Link href="/business-days-calculator" className={linkCls}>business days calculator</Link>. To jump a set
              number of weeks forward or back, use the <Link href="/date-calculator" className={linkCls}>date calculator</Link>.
            </p>
          </section>
        </article>

        <FaqList title="Week number FAQ" items={FAQ} />
        <RelatedDateTools current="/week-number" />

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Method"
            inputs={['Your device’s current date', 'Any date to look up']}
            formulas={[
              'ISO week: number of the Monday–Sunday week containing the date’s Thursday, counted from the week containing January 4',
              'US week: floor((day of year − 1 + weekday of January 1) ÷ 7) + 1, with weeks starting Sunday'
            ]}
            assumptions={['Gregorian calendar', `The week table is for ${year}; the lookup works for any date`]}
            sources={[{ label: 'ISO 8601 — Date and time format', url: 'https://www.iso.org/iso-8601-date-and-time-format.html' }]}
          />
        </div>
      </CalcLayout>
    </>
  );
};

export default WeekNumber;
