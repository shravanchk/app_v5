// English source dictionary for the Europe calculators. Every other locale in
// this folder mirrors its shape; anything missing elsewhere falls back to here.
//
// Scope note: interactive UI chrome only — input labels, result labels, tab
// names, table headers. The long-form prose and FAQ in each calculator stay
// English: they are the indexed body content, and translating them only pays
// off once these pages have real localised URLs to be indexed at.

const en = {
  switcher: {
    label: 'Language',
    ariaLabel: 'Choose display language',
    note: 'Translates the calculator labels. Explanations stay in English.',
  },

  hub: {
    eyebrow: 'UK & Europe',
    title: 'UK & Europe Calculators Hub',
    subtitle:
      'Tax, VAT, and country-specific net-salary tools for the UK, Germany, France, the Netherlands and across Europe — all free.',
    comparisonHeading: 'Who keeps most of their salary in Europe?',
    comparisonIntro:
      'Estimated 2026 take-home pay for a single employee on a typical gross salary in each country’s own currency, after income tax and employee social contributions. Click a country to run your own numbers.',
    colCountry: 'Country',
    colGross: 'Example gross',
    colNetYear: 'Net / year',
    colNetMonth: 'Net / month',
    colKeeps: 'Keeps',
  },

  // Keyed by card id (see EUCalculatorsHub) rather than by path, so a URL change
  // does not silently orphan three translations.
  cards: {
    ukIncomeTax: {
      title: 'UK Income Tax Calculator',
      description: 'Estimate UK income tax for 2026-27 with Scottish rates and National Insurance.',
      tags: ['2026-27 tax year', 'Scottish rates', 'NI included'],
    },
    ukTakeHome: {
      title: 'UK Take-Home by Salary',
      description: 'Instant after-tax figures for UK salaries from £20,000 to £150,000 — tax, NI, and monthly pay.',
      tags: ['£20k–£150k', '2026-27 rates', 'Tax + NI'],
    },
    ukHourly: {
      title: 'UK Hourly to Salary Converter',
      description:
        'Turn any £/hour rate into yearly, monthly, and weekly pay on a 37.5- or 40-hour week — with per-rate pages from £12 to £50 including 2026-27 take-home.',
      tags: ['£12–£50/hour', '37.5h & 40h weeks', 'After-tax view'],
    },
    vat: {
      title: 'European VAT Calculator',
      description: 'Calculate VAT for 15 European countries with inclusive/exclusive and reverse VAT modes.',
      tags: ['15 countries', 'Inclusive/exclusive', 'Rate comparison'],
    },
    europeanSalary: {
      title: 'European Salary Calculator',
      description: 'Estimate net salary after tax and social contributions across key European countries.',
      tags: ['Net salary', 'Social contributions', 'Country comparison'],
    },
    germanySalary: {
      title: 'Germany Salary Calculator',
      description: 'Estimate Germany net salary with income tax, social insurance, and solidarity surcharge.',
      tags: ['Brutto to netto', 'Social insurance', 'Take-home'],
    },
    germanyTakeHome: {
      title: 'Germany Take-Home by Salary',
      description: 'Instant brutto-to-netto figures for German salaries from €25,000 to €150,000.',
      tags: ['€25k–€150k', '§32a EStG 2026', 'Tax + social'],
    },
    franceSalary: {
      title: 'France Salary Calculator',
      description: 'Estimate France take-home salary after income tax and social contributions.',
      tags: ['Salaire net', 'Social charges', 'Tax estimate'],
    },
    netherlandsSalary: {
      title: 'Netherlands Salary Calculator',
      description: 'Estimate Dutch net salary with box-1 tax and the common tax-credit adjustment.',
      tags: ['Dutch tax', 'Tax credits', 'Net pay estimate'],
    },
  },

  common: {
    country: 'Country',
    type: 'Type',
    totalDeductions: 'Total deductions',
    effectiveTaxRate: 'Effective tax rate',
    // {currency} is substituted by the caller — the symbol depends on the
    // selected country, so it cannot be baked into the string.
    amountWithCurrency: 'Amount ({currency})',
  },

  vat: {
    calculationType: 'Calculation type',
    exclusive: 'VAT exclusive',
    inclusive: 'VAT inclusive',
    grossInclVat: 'Gross (incl. VAT)',
    netExclVat: 'Net (excl. VAT)',
    amountHint: 'Enter the amount to add or extract VAT from.',
    standardRate: 'Standard VAT rate',
    currency: 'Currency',
    chartTitle: 'Net amount vs VAT share',
    netAmount: 'Net amount',
    vatAmount: 'VAT amount',
  },

  salary: {
    grossAnnual: 'Gross annual salary',
    netAnnual: 'Net annual salary',
    netAnnualTakeHome: 'Net annual (take-home)',
    netMonthly: 'Net monthly',
    frequency: 'Salary frequency',
    annual: 'Annual',
    monthly: 'Monthly',
    detailedBreakdown: 'Detailed breakdown',
    freqAnnualWord: 'annual',
    freqMonthlyWord: 'monthly',
    grossSalaryWithFrequency: 'Gross salary ({frequency})',
    grossHint: 'Enter your gross salary ({frequency}) to calculate take-home pay.',
    compositionTitle: 'Gross salary composition',
    netTakeHome: 'Net take-home',
  },

  // Line items in the salary breakdown. Keys match the engine's breakdown keys
  // in utils/europeanSalaryCalculations.js.
  deductions: {
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
    taxableIncome: 'Taxable Income',
  },
};

export default en;
