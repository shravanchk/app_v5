import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AffiliateRecommendations from '../AffiliateRecommendations';
import AdSenseAd from '../AdSenseAd';
import CalculatorInfoPanel from '../CalculatorInfoPanel';
import { PieBreakdownChart } from '../calculator/ResultVisualizations';
import ResultActions from '../ResultActions';
import { CalcLayout, ResultStat } from '../calculator/CalcLayout';
import HowToSection from '../calculator/HowToSection';
import { NumberField, SelectField, Tabs } from '../ui/Field';
import Card from '../ui/Card';
import { cn } from '../ui/cn';
import { SALARY_SYSTEMS, computeEuropeanSalary } from '../../utils/europeanSalaryCalculations';

const FAQ = [
  { question: 'How accurate are these salary calculations?', answer: 'These calculations use the tax rates and standard deductions configured in this calculator. Actual take-home pay may vary based on personal circumstances, allowances, and local variations. Consult a tax professional for precise calculations.' },
  { question: "What's included in social security deductions?", answer: 'Social security typically includes pension contributions, unemployment insurance, health insurance, and disability insurance. The exact components and rates vary significantly between European countries.' },
  { question: 'Which European country is most tax-efficient for high earners?', answer: 'Switzerland generally has lower overall tax rates, especially for high earners. However, cost of living and available services vary greatly. Consider total compensation packages and living costs, not just tax rates.' },
  { question: 'Do these calculations include all possible deductions?', answer: 'These are standard calculations for employees. Additional deductions may apply for pension contributions, charitable donations, professional expenses, or other tax-deductible items specific to each country.' },
  { question: 'Why is the effective rate lower than the top tax band?', answer: 'Progressive systems tax income in slices: the first slice is often tax-free, and higher rates apply only to income above each threshold. A UK earner on £50,000 faces a 40% band but pays about 21% of gross overall once the personal allowance and lower bands are counted.' },
  { question: 'Why do social contributions matter as much as income tax?', answer: 'In several countries — Germany and France especially — employee social contributions (pension, health, unemployment) take a larger share of a mid-level salary than income tax itself. Comparing countries on headline income-tax rates alone misses most of the story.' },
  { question: 'Can I compare salaries across countries with this tool?', answer: 'You can compare what each system deducts from the same gross figure, which is the right first step. A fair offer comparison also needs cost of living, what contributions buy (healthcare, pensions), currency, and benefits like employer pension matches or a 13th-month salary.' }
];

const EuropeanSalaryCalculator = ({
  onBack,
  forcedCountry = null,
  canonicalPath = '/european-salary-calculator',
  seoTitle = null,
  seoDescription = null,
  seoKeywords = null,
  pageHeading = null,
  pageSubheading = null
}) => {
  const [grossSalary, setGrossSalary] = useState('');
  const [country, setCountry] = useState(forcedCountry || 'UK');
  const [frequency, setFrequency] = useState('annual'); // annual, monthly
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (forcedCountry) {
      setCountry(forcedCountry);
    }
  }, [forcedCountry]);

  const calculateSalary = () => {
    if (!grossSalary || !country) return;

    const annual = frequency === 'annual' ? parseFloat(grossSalary) : parseFloat(grossSalary) * 12;
    const computed = computeEuropeanSalary(country, annual);
    if (computed) setResults(computed);
  };

  useEffect(() => {
    if (grossSalary) {
      calculateSalary();
    } else {
      setResults(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grossSalary, country, frequency]);

  const formatCurrency = (amount, currency) => {
    return `${currency}${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const selectedCountry = SALARY_SYSTEMS[country] || SALARY_SYSTEMS.UK;
  const selectedCountryName = selectedCountry.country;
  const canonicalUrl = `https://upaman.com${canonicalPath}`;
  const resolvedTitle = seoTitle || (forcedCountry
    ? `${selectedCountryName} Salary Calculator | Net Salary After Tax | Upaman`
    : 'European Salary Calculator | UK Germany France Switzerland | Net Salary Calculator | Upaman');
  const resolvedDescription = seoDescription || (forcedCountry
    ? `Calculate ${selectedCountryName} net salary after tax and social contributions. Get annual and monthly take-home pay with effective deduction estimates.`
    : 'Calculate net salary after taxes for European countries. UK, Germany, France, Netherlands, Switzerland salary calculator with tax rates and social security deductions.');
  const resolvedKeywords = seoKeywords || (forcedCountry
    ? `${selectedCountryName} salary calculator, ${selectedCountryName} net salary calculator, ${selectedCountryName} tax calculator, take home pay ${selectedCountryName}`
    : 'European salary calculator, UK salary calculator, Germany salary calculator, France salary calculator, Switzerland salary calculator, net salary calculator, European tax calculator, after tax salary');
  const resolvedHeading = pageHeading || (forcedCountry ? `${selectedCountryName} Salary Calculator` : 'European Salary Calculator');
  const resolvedSubheading = pageSubheading || (forcedCountry
    ? `Calculate your net salary after tax in ${selectedCountryName}`
    : 'Estimate net salary after tax and social contributions across 8 European countries.');

  const deductionLabels = {
    incomeTax: 'Income Tax',
    nationalInsurance: 'National Insurance',
    socialSecurity: 'Social Security',
    solidarityTax: 'Solidarity Tax',
    federalTax: 'Federal Tax',
    cantonalTax: 'Cantonal Tax',
    ahv: 'AHV/Insurance',
    municipalTax: 'Municipal Tax',
    stateTax: 'State Tax',
    grossTax: 'Gross Tax',
    taxCredits: 'Tax Credits',
    personalAllowance: 'Personal Allowance',
    taxableIncome: 'Taxable Income'
  };

  const resultShareLines = results ? [
    `Country: ${results.flag} ${results.country}`,
    `Gross annual salary: ${formatCurrency(results.grossAnnual, results.currency)}`,
    `Net annual salary (take-home): ${formatCurrency(results.netAnnual, results.currency)}`,
    `Net monthly salary: ${formatCurrency(results.netMonthly, results.currency)}`,
    `Total annual deductions: ${formatCurrency(results.breakdown.totalDeductions, results.currency)}`,
    `Effective tax rate: ${results.effectiveRate?.toFixed(1)}%`
  ] : [];

  return (
    <>
      <Head>
        <title>{resolvedTitle}</title>
        <meta name="description" content={resolvedDescription} />
        <meta name="keywords" content={resolvedKeywords} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph Tags */}
        <meta property="og:title" content={resolvedTitle} />
        <meta property="og:description" content={resolvedDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Cards */}
        <meta name="twitter:title" content={resolvedTitle} />
        <meta name="twitter:description" content={resolvedDescription} />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": forcedCountry ? `${selectedCountryName} Salary Calculator` : "European Salary Calculator",
            "description": resolvedDescription,
            "url": canonicalUrl,
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": selectedCountry.symbol || "EUR"
            },
            "featureList": [
              forcedCountry ? `Salary calculation for ${selectedCountryName}` : "Salary calculation for 8 European countries",
              "Tax and social security deductions",
              "Annual and monthly salary breakdown",
              "Multi-currency support (GBP, EUR, CHF, SEK)",
              "Effective tax rate calculation",
              "Country-specific tax systems"
            ]
          })}
        </script>

        {/* FAQ Schema — built from the same FAQ list rendered on the page */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQ.map(({ question, answer }) => ({
              "@type": "Question",
              "name": question,
              "acceptedAnswer": { "@type": "Answer", "text": answer }
            }))
          })}
        </script>
      </Head>

      <CalcLayout
        eyebrow={forcedCountry ? `Europe · ${selectedCountryName}` : 'Europe · Salary'}
        title={resolvedHeading}
        subtitle={resolvedSubheading}
      >
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Input Panel */}
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              {!forcedCountry && (
                <SelectField
                  id="eu-country"
                  label="Country"
                  value={country}
                  onChange={setCountry}
                  options={Object.entries(SALARY_SYSTEMS).map(([code, data]) => ({
                    value: code,
                    label: `${data.flag} ${data.country}`
                  }))}
                />
              )}

              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink-soft dark:text-slate-300">Salary frequency</span>
                <Tabs
                  tabs={[
                    { id: 'annual', label: 'Annual' },
                    { id: 'monthly', label: 'Monthly' }
                  ]}
                  active={frequency}
                  onChange={setFrequency}
                />
              </div>

              <NumberField
                id="eu-gross"
                label={`Gross salary (${frequency})`}
                prefix={selectedCountry.currency}
                value={grossSalary}
                onChange={setGrossSalary}
                hint={`Enter your gross ${frequency} salary to calculate take-home pay.`}
              />

              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-sm dark:border-teal-800/60 dark:bg-teal-900/20">
                <p className="font-semibold text-teal-800 dark:text-teal-300">{selectedCountry.flag} {selectedCountryName}</p>
                <p className="mt-0.5 text-teal-700 dark:text-teal-400">
                  Calculations include income tax, social security, and other mandatory deductions for {selectedCountryName}.
                </p>
              </div>
            </div>
            <div className="mt-5"><AdSenseAd /></div>
          </Card>

          {/* Results Panel */}
          <div className="space-y-5 lg:col-span-3">
            {results ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ResultStat label="Net annual (take-home)" value={formatCurrency(results.netAnnual, results.currency)} emphasis tone="positive" />
                  <ResultStat label="Net monthly" value={formatCurrency(results.netMonthly, results.currency)} />
                  <ResultStat label="Total deductions" value={formatCurrency(results.breakdown.totalDeductions, results.currency)} />
                  <ResultStat label="Effective tax rate" value={`${results.effectiveRate?.toFixed(1)}%`} />
                </div>

                <Card className="p-5">
                  <PieBreakdownChart
                    title="Gross salary composition"
                    items={[
                      { label: 'Net take-home', value: results.netAnnual, color: '#10b981' },
                      { label: 'Total deductions', value: results.breakdown.totalDeductions, color: '#f97316' }
                    ]}
                    formatter={(value) => formatCurrency(value, results.currency)}
                  />
                </Card>

                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Detailed breakdown</h3>
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                    <div className="flex items-center justify-between py-2 text-sm">
                      <span className="font-medium text-ink-soft dark:text-slate-300">Gross annual salary</span>
                      <span className="font-semibold text-ink dark:text-white">{formatCurrency(results.grossAnnual, results.currency)}</span>
                    </div>
                    {Object.entries(results.breakdown).map(([key, value]) => {
                      if (key === 'totalDeductions') return null;
                      const isPositive = key.includes('Credit') || key.includes('Allowance') || key === 'taxableIncome';
                      const isNeutral = key === 'taxableIncome';
                      return (
                        <div key={key} className="flex items-center justify-between py-2 text-sm">
                          <span className="text-ink-soft dark:text-slate-300">{deductionLabels[key] || key}</span>
                          <span className={cn(
                            'font-medium',
                            isNeutral
                              ? 'text-ink dark:text-white'
                              : isPositive
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-amber-700 dark:text-amber-400'
                          )}>
                            {isNeutral ? '' : isPositive ? '+' : '-'}{formatCurrency(Math.abs(value), results.currency)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between py-2 text-sm font-semibold">
                      <span className="text-emerald-700 dark:text-emerald-400">Net annual salary</span>
                      <span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(results.netAnnual, results.currency)}</span>
                    </div>
                  </div>
                </Card>

                <ResultActions
                  title={`${results.country} salary calculation summary`}
                  summaryLines={resultShareLines}
                  fileName="upaman-european-salary-summary.txt"
                />

                <AffiliateRecommendations calculatorType="european-salary" />
              </>
            ) : (
              <Card className="flex items-center justify-center p-10 text-center text-sm text-ink-muted dark:text-slate-400">
                Enter your gross salary to see your net take-home breakdown.
              </Card>
            )}
          </div>
        </div>

        {/* Country Comparison */}
        {!forcedCountry && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-ink dark:text-white">European tax systems comparison</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(SALARY_SYSTEMS).map(([code, data]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCountry(code)}
                  className={cn(
                    'rounded-xl border p-4 text-left transition',
                    country === code
                      ? 'border-brand-300 bg-brand-50/60 dark:border-brand-700 dark:bg-brand-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink dark:text-white">{data.flag} {data.country}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-ink-soft dark:bg-slate-700 dark:text-slate-200">{data.currency}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
                    {data.taxBands ? `Tax: up to ${data.taxBands[data.taxBands.length - 1].rate}%` : 'Complex tax system'}
                    {data.socialSecurity && ` · Social: ${typeof data.socialSecurity === 'number' ? data.socialSecurity : 'Variable'}%`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!forcedCountry && (
          <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
            <h2 className="font-display text-xl font-bold text-ink dark:text-white">Same gross, very different net: what actually varies between countries</h2>
            <p className="mt-3">
              Run the same €60,000 gross salary through this calculator&rsquo;s eight systems and the spread is
              startling: about <strong className="text-ink dark:text-white">€46,990 net in the Netherlands</strong>{' '}
              (a 21.7% effective rate) against roughly{' '}
              <strong className="text-ink dark:text-white">€28,100 in Belgium</strong> (53.2%) — a gap of nearly
              €1,600 every month for identical pay. Germany (€37,550) and France (€36,120) cluster in the middle
              around 37&ndash;40%. Three structural differences, not one, produce that spread, and knowing which
              one drives your own number is what makes a payslip legible.
            </p>

            <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">The three levers: bands, contributions, credits</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink dark:text-white">Progressive tax bands</strong> get the headlines, but
                they tax income in slices — the first slice is often free (UK personal allowance £12,570; German
                Grundfreibetrag €12,348; French first band to €11,600), and top rates apply only above high
                thresholds. This is why a UK earner on £50,000 sits in a &ldquo;40% band&rdquo; yet keeps about
                £39,520 — an effective rate of 21%.
              </li>
              <li>
                <strong className="text-ink dark:text-white">Social contributions</strong> are the quiet giant. In
                Germany, an employee&rsquo;s pension (9.3%), health (~8.75%), unemployment (1.3%), and care (2.4%)
                contributions take more of a €60,000 salary than income tax does — and unlike tax they start from
                the first euro, though they also stop at assessment ceilings. France stacks CSG and other social
                charges to a similar effect. Belgium&rsquo;s combination of both levers at once is what pushes it
                to the top of the deduction table.
              </li>
              <li>
                <strong className="text-ink dark:text-white">Credits and allowances</strong> pull in the opposite
                direction. The Dutch system looks steep on paper, but the general credit (algemene heffingskorting)
                and labour credit (arbeidskorting) refund thousands of euros for low and middle earners — the main
                reason the Netherlands nets out mildest of the euro countries here at €60,000.
              </li>
            </ul>

            <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Reading a cross-border job offer</h3>
            <p className="mt-3">
              The right first move is the one this page does: put the same gross through both systems and compare
              nets. The second move is remembering what the deductions <em>buy</em>, because it differs. German
              and French contributions fund healthcare with little or no employee top-up and earnings-linked state
              pensions; a Swiss net salary looks generous partly because mandatory health insurance is paid
              separately out of pocket (typically CHF 300&ndash;500 a month per adult) and much of the pension
              runs through occupational schemes. Housing costs then swing the comparison harder than either:
              Amsterdam and Zurich rents can erase a five-figure net advantage. A sensible checklist for an offer:
              net monthly pay (this calculator), minus typical rent for an equivalent home, minus out-of-pocket
              health costs, plus employer pension value and extras like a 13th-month salary — <em>then</em> compare.
            </p>

            <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">Why your real payslip will still differ</h3>
            <p className="mt-3">
              This calculator models a standard single employee, and that assumption matters more in some systems
              than others. France taxes households, not individuals — the <em>quotient familial</em> splits income
              across family members, so a married earner with children can pay dramatically less than the single
              figure shown. Germany&rsquo;s marital splitting and church tax move numbers both ways; Swiss totals
              swing by canton and commune. Country-specific pages for{' '}
              <a href="/germany-salary-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">Germany</a>,{' '}
              <a href="/france-salary-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">France</a>, and the{' '}
              <a href="/netherlands-salary-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">Netherlands</a>{' '}
              go deeper on each system, and the{' '}
              <a href="/uk-income-tax-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">UK income tax calculator</a>{' '}
              breaks the British payslip into its exact bands. Treat every figure here as a planning estimate to
              anchor negotiations — the final word belongs to a local payroll slip or tax adviser.
            </p>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">
            {forcedCountry ? `${selectedCountryName} Salary Calculator FAQ` : 'European Salary Calculator FAQ'}
          </h2>
          <div className="mt-4 grid gap-3">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/70">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden dark:text-white">{question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <CalculatorInfoPanel
            title="Methodology and assumptions"
            inputs={[
              'Country, salary frequency (annual or monthly), and gross salary amount'
            ]}
            formulas={[
              'Progressive income-tax bands applied per country',
              'Employee social-security / national-insurance contributions per country rules',
              'Net = gross − income tax − social contributions (− credits where applicable)'
            ]}
            assumptions={[
              'Standard single-employee treatment without personal allowances beyond those modelled',
              'Germany uses a linear-progressive approximation in the 14–42% zone; Netherlands applies flat general + labour credits',
              'Swiss cantonal tax uses an average rate; actual rates vary significantly by canton',
              'Rates reflect 2026 published thresholds; verify with official sources before relying on figures'
            ]}
            sources={[
              { label: 'UK Income Tax rates (gov.uk)', url: 'https://www.gov.uk/income-tax-rates' },
              { label: 'Germany income tax (BMF)', url: 'https://www.bundesfinanzministerium.de/' },
              { label: 'France impôt sur le revenu (service-public.fr)', url: 'https://www.service-public.fr/particuliers/vosdroits/F1419' },
              { label: 'Netherlands Box 1 rates (belastingdienst.nl)', url: 'https://www.belastingdienst.nl/' }
            ]}
          />
        </div>

        <div className="mt-8 text-center"><AdSenseAd /></div>
      
        <HowToSection
          name="How to use the European Salary Calculator"
          description="Estimate net take-home pay across European countries."
          steps={[
            { name: "Select your country", text: "Choose from the supported European tax systems." },
            { name: "Choose the frequency", text: "Switch between annual and monthly salary input." },
            { name: "Enter your gross salary", text: "Type your gross pay for the selected frequency." },
            { name: "Review your net pay", text: "See net salary, total deductions, and the effective tax rate." }
          ]}
        />

      </CalcLayout>
    </>
  );
};

export default EuropeanSalaryCalculator;
