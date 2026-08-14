import React from 'react';
import Link from 'next/link';
import {
  BadgePercent, Banknote, Landmark, Table2,
} from 'lucide-react';
import { CalcLayout } from '../calculator/CalcLayout';
import Reveal from '../ui/Reveal';
import { computeEuropeanSalary } from '../../utils/europeanSalaryCalculations';
import { useLanguage } from '../../utils/i18n/LanguageProvider';
import LanguageToggle from '../i18n/LanguageToggle';

const T = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
};

// `id` keys into the `cards.*` namespace of the locale dictionaries for the
// title, description, and tag chips; everything here is presentation that does
// not vary by language.
const cards = [
  { id: 'ukIncomeTax', icon: Landmark, path: '/uk-income-tax-calculator', tint: T.violet },
  { id: 'ukTakeHome', icon: Table2, path: '/uk/take-home', tint: T.brand },
  { id: 'ukHourly', icon: Landmark, path: '/uk/hourly', tint: T.emerald },
  { id: 'vat', icon: BadgePercent, path: '/eu-vat-calculator', tint: T.amber },
  { id: 'europeanSalary', icon: Banknote, path: '/european-salary-calculator', tint: T.emerald },
  { id: 'germanySalary', icon: Banknote, path: '/germany-salary-calculator', tint: T.brand },
  { id: 'germanyTakeHome', icon: Table2, path: '/germany/take-home', tint: T.emerald },
  { id: 'franceSalary', icon: Banknote, path: '/france-salary-calculator', tint: T.sky },
  { id: 'netherlandsSalary', icon: Banknote, path: '/netherlands-salary-calculator', tint: T.teal },
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

// Intro figures, computed from the same engine as the table so the prose can
// never drift from the calculators.
const NET_60K = Object.fromEntries(
  ['DE', 'FR', 'NL'].map((code) => [code, money(computeEuropeanSalary(code, 60000).netAnnual, '€')])
);

const EUCalculatorsHub = () => {
  const { t, tList } = useLanguage();

  return (
    <CalcLayout eyebrow={t('hub.eyebrow')} title={t('hub.title')} subtitle={t('hub.subtitle')}>
      <LanguageToggle className="mb-6" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ id, icon: Icon, path, tint }) => (
          <Link
            key={path}
            href={path}
            className="group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card dark:border-slate-700/70 dark:bg-slate-800/70"
          >
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}>
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <h2 className="mt-4 font-display text-base font-semibold text-ink group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{t(`cards.${id}.title`)}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{t(`cards.${id}.description`)}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tList(`cards.${id}.tags`).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-soft dark:bg-slate-700 dark:text-slate-300">{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <Reveal>
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">
          {t('hub.comparisonHeading')}
        </h2>
        <p className="mt-2 max-w-3xl text-[0.98rem] leading-relaxed text-ink-soft dark:text-slate-300">
          {t('hub.comparisonIntro')}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[0.95rem]">
            <tbody>
              <tr>
                <th className={thCls}>{t('hub.colCountry')}</th>
                <th className={thCls}>{t('hub.colGross')}</th>
                <th className={thCls}>{t('hub.colNetYear')}</th>
                <th className={thCls}>{t('hub.colNetMonth')}</th>
                <th className={thCls}>{t('hub.colKeeps')}</th>
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

      <Reveal>
      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">
          Same salary, different rules — why each country needs its own calculator
        </h2>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft dark:text-slate-300">
          Every tool in this suite runs on country-specific 2026 rules, not a generic percentage. The{' '}
          <Link href="/germany-salary-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">Germany calculator</Link>{' '}
          applies the official §32a EStG income-tax formula plus solidarity surcharge and social-insurance
          contributions up to their assessment ceilings. The{' '}
          <Link href="/france-salary-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">France calculator</Link>{' '}
          models the CSG/CRDS social charges that come out of pay before income tax is even assessed. The{' '}
          <Link href="/netherlands-salary-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">Netherlands calculator</Link>{' '}
          includes the general tax credit and labour credit whose taper makes Dutch take-home unusually progressive.
          And the{' '}
          <Link href="/uk-income-tax-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">UK calculator</Link>{' '}
          applies income tax bands alongside National Insurance, including the 60% effective marginal rate where the
          personal allowance tapers away between £100,000 and £125,140.
        </p>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft dark:text-slate-300">
          That is why the same €60,000 salary produces very different net pay: roughly {NET_60K.DE} in Germany,{' '}
          {NET_60K.FR} in France, and {NET_60K.NL} in the Netherlands (single employee, no church tax — the figures in
          the table above come from the same engine). Use a country calculator for a detailed breakdown of your own
          salary, the{' '}
          <Link href="/european-salary-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">European comparison tool</Link>{' '}
          to see several countries side by side, or the{' '}
          <Link href="/eu-vat-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">EU VAT calculator</Link>{' '}
          for consumption-tax rates across member states. If you earn a round salary, the{' '}
          <Link href="/uk/take-home" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">UK</Link>{' '}
          and{' '}
          <Link href="/germany/take-home" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">Germany take-home tables</Link>{' '}
          give instant answers for common salary levels without entering anything.
        </p>
      </section>
      </Reveal>
    </CalcLayout>
  );
};

export default EUCalculatorsHub;
