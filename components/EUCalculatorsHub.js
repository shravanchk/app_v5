import React from 'react';
import Link from 'next/link';
import {
  BadgePercent, Banknote, Landmark, Table2, Train,
} from 'lucide-react';
import { CalcLayout } from './calculator/CalcLayout';
import Reveal from './ui/Reveal';
import { computeEuropeanSalary } from '../utils/europeanSalaryCalculations';

const T = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
};

const cards = [
  { title: 'UK Income Tax Calculator', description: 'Estimate UK income tax for 2026-27 with Scottish rates and National Insurance.', icon: Landmark, path: '/uk-income-tax-calculator', tint: T.violet, tags: ['2026-27 tax year', 'Scottish rates', 'NI included'] },
  { title: 'UK Take-Home by Salary', description: 'Instant after-tax figures for UK salaries from £20,000 to £150,000 — tax, NI, and monthly pay.', icon: Table2, path: '/uk/take-home', tint: T.brand, tags: ['£20k–£150k', '2026-27 rates', 'Tax + NI'] },
  { title: 'UK Rail Fare Calculator', description: 'Compare UK rail ticket options and estimate fares across journey types.', icon: Train, path: '/uk-rail-calculator', tint: T.rose, tags: ['Fare compare', 'Journey types', 'Quick planning'] },
  { title: 'European VAT Calculator', description: 'Calculate VAT for 15 European countries with inclusive/exclusive and reverse VAT modes.', icon: BadgePercent, path: '/eu-vat-calculator', tint: T.amber, tags: ['15 countries', 'Inclusive/exclusive', 'Rate comparison'] },
  { title: 'European Salary Calculator', description: 'Estimate net salary after tax and social contributions across key European countries.', icon: Banknote, path: '/european-salary-calculator', tint: T.emerald, tags: ['Net salary', 'Social contributions', 'Country comparison'] },
  { title: 'Germany Salary Calculator', description: 'Estimate Germany net salary with income tax, social insurance, and solidarity surcharge.', icon: Banknote, path: '/germany-salary-calculator', tint: T.brand, tags: ['Brutto to netto', 'Social insurance', 'Take-home'] },
  { title: 'France Salary Calculator', description: 'Estimate France take-home salary after income tax and social contributions.', icon: Banknote, path: '/france-salary-calculator', tint: T.sky, tags: ['Salaire net', 'Social charges', 'Tax estimate'] },
  { title: 'Netherlands Salary Calculator', description: 'Estimate Dutch net salary with box-1 tax and the common tax-credit adjustment.', icon: Banknote, path: '/netherlands-salary-calculator', tint: T.teal, tags: ['Dutch tax', 'Tax credits', 'Net pay estimate'] },
];

// Static comparison table for the hub: net pay on a typical gross salary in each
// country's own currency, computed at build time from the shared salary engine.
const COMPARISON_SALARIES = [
  { code: 'UK', gross: 50000, href: '/uk-income-tax-calculator' },
  { code: 'DE', gross: 60000, href: '/germany-salary-calculator' },
  { code: 'FR', gross: 60000, href: '/france-salary-calculator' },
  { code: 'NL', gross: 60000, href: '/netherlands-salary-calculator' },
  { code: 'AT', gross: 60000, href: '/european-salary-calculator' },
  { code: 'BE', gross: 60000, href: '/european-salary-calculator' },
  { code: 'CH', gross: 90000, href: '/european-salary-calculator' },
  { code: 'SE', gross: 600000, href: '/european-salary-calculator' },
];

const money = (amount, currency) => {
  const n = Math.round(amount).toLocaleString('en-US');
  return currency.length > 1 ? `${currency} ${n}` : `${currency}${n}`;
};

const COMPARISON_ROWS = COMPARISON_SALARIES
  .map(({ code, gross, href }) => {
    const r = computeEuropeanSalary(code, gross);
    return {
      code,
      href,
      flag: r.flag,
      country: r.country,
      gross: money(gross, r.currency),
      net: money(r.netAnnual, r.currency),
      netMonthly: money(r.netMonthly, r.currency),
      keepRate: Math.round(100 - r.effectiveRate)
    };
  })
  .sort((a, b) => b.keepRate - a.keepRate);

const thCls = 'border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white';
const tdCls = 'border border-slate-200 px-3 py-2 text-ink-soft dark:border-slate-700 dark:text-slate-300';

const EUCalculatorsHub = () => {
  return (
    <CalcLayout eyebrow="UK & Europe" title="UK & Europe Calculators Hub" subtitle="Tax, VAT, and country-specific net-salary tools for the UK, Germany, France, the Netherlands and across Europe — all free.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, description, icon: Icon, path, tint, tags }) => (
          <Link
            key={path}
            href={path}
            className="group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70"
          >
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}>
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <h2 className="mt-4 font-display text-base font-semibold text-ink group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{title}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft dark:bg-slate-700 dark:text-slate-300">{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <Reveal>
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">
          Who keeps most of their salary in Europe?
        </h2>
        <p className="mt-2 max-w-3xl text-[0.98rem] leading-relaxed text-ink-soft dark:text-slate-300">
          Estimated 2026 take-home pay for a single employee on a typical gross salary in each country&apos;s own
          currency, after income tax and employee social contributions. Click a country to run your own numbers.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[0.95rem]">
            <tbody>
              <tr>
                <th className={thCls}>Country</th>
                <th className={thCls}>Example gross</th>
                <th className={thCls}>Net / year</th>
                <th className={thCls}>Net / month</th>
                <th className={thCls}>Keeps</th>
              </tr>
              {COMPARISON_ROWS.map((r) => (
                <tr key={r.code}>
                  <td className={`${tdCls} font-semibold`}>
                    <Link href={r.href} className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">
                      {r.flag} {r.country}
                    </Link>
                  </td>
                  <td className={tdCls}>{r.gross}</td>
                  <td className={`${tdCls} font-semibold text-emerald-700 dark:text-emerald-400`}>{r.net}</td>
                  <td className={tdCls}>{r.netMonthly}</td>
                  <td className={tdCls}>
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">{r.keepRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink-muted dark:text-slate-500">
          Planning estimates only — figures use national averages where rates vary locally (Swiss canton, Swedish
          municipality), exclude church tax and surcharges, and salaries are not currency-adjusted between countries.
          Cost of living differs; a higher keep-rate is not automatically a higher standard of living.
        </p>
      </section>
      </Reveal>
    </CalcLayout>
  );
};

export default EUCalculatorsHub;
