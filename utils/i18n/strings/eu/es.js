// Spanish (Español).
//
// Note on coverage: there is no Spain-specific calculator in this cluster —
// the salary engine covers UK, DE, FR, NL, AT, BE, SE and CH, and Spain
// appears only in the VAT calculator's country list. So this locale is most
// useful on /eu-vat-calculator and the hub; a Spanish reader on the salary
// tools is reading about other countries' systems. Building a Spain salary
// calculator is what would make this locale pull its weight.
//
// Terminology is kept pan-Hispanic where the Spain-specific term would read
// oddly elsewhere (for example "Impuesto regional" rather than "autonómico").

const es = {
  switcher: {
    label: 'Idioma',
    ariaLabel: 'Elegir idioma de visualización',
    note: 'Traduce las etiquetas de la calculadora. Las explicaciones permanecen en inglés.',
  },

  hub: {
    eyebrow: 'Reino Unido y Europa',
    title: 'Calculadoras de Reino Unido y Europa',
    subtitle:
      'Herramientas de impuestos, IVA y salario neto por país para el Reino Unido, Alemania, Francia, los Países Bajos y toda Europa — todas gratuitas.',
    comparisonHeading: '¿Quién conserva la mayor parte de su salario en Europa?',
    comparisonIntro:
      'Salario neto estimado para 2026 de una persona empleada sin cargas familiares sobre un salario bruto típico, en la moneda de cada país, tras el impuesto sobre la renta y las cotizaciones sociales. Haz clic en un país para calcular tus propias cifras.',
    colCountry: 'País',
    colGross: 'Bruto de ejemplo',
    colNetYear: 'Neto / año',
    colNetMonth: 'Neto / mes',
    colKeeps: 'Conserva',
  },

  cards: {
    ukIncomeTax: {
      title: 'Calculadora del impuesto sobre la renta (Reino Unido)',
      description: 'Estima el impuesto sobre la renta del Reino Unido para 2026-27 con los tipos escoceses y el National Insurance.',
      tags: ['Ejercicio 2026-27', 'Tipos escoceses', 'NI incluido'],
    },
    ukTakeHome: {
      title: 'Salario neto británico por tramo',
      description: 'Cifras netas inmediatas para salarios británicos de 20.000 £ a 150.000 £ — impuesto, NI y pago mensual.',
      tags: ['20.000–150.000 £', 'Tipos 2026-27', 'Impuesto + NI'],
    },
    ukHourly: {
      title: 'Conversor de tarifa por hora (Reino Unido)',
      description:
        'Convierte cualquier tarifa en £/hora a salario anual, mensual y semanal con jornadas de 37,5 o 40 horas — con páginas por tarifa de 12 £ a 50 £ e importe neto 2026-27.',
      tags: ['12–50 £/hora', 'Jornadas de 37,5 h y 40 h', 'Vista tras impuestos'],
    },
    vat: {
      title: 'Calculadora de IVA europeo',
      description: 'Calcula el IVA de 15 países europeos en modos con IVA, sin IVA e inverso.',
      tags: ['15 países', 'Con/sin IVA', 'Comparación de tipos'],
    },
    europeanSalary: {
      title: 'Calculadora de salario europeo',
      description: 'Estima el salario neto tras impuestos y cotizaciones sociales en los principales países europeos.',
      tags: ['Salario neto', 'Cotizaciones sociales', 'Comparación por país'],
    },
    germanySalary: {
      title: 'Calculadora de salario (Alemania)',
      description: 'Estima el salario neto alemán con el impuesto sobre la renta, la seguridad social y el recargo de solidaridad.',
      tags: ['De bruto a neto', 'Seguridad social', 'Salario neto'],
    },
    germanyTakeHome: {
      title: 'Alemania: neto por salario',
      description: 'Cifras de bruto a neto inmediatas para salarios alemanes de 25.000 € a 150.000 €.',
      tags: ['25.000–150.000 €', '§32a EStG 2026', 'Impuesto + social'],
    },
    franceSalary: {
      title: 'Calculadora de salario (Francia)',
      description: 'Estima el salario neto francés tras el impuesto sobre la renta y las cotizaciones sociales.',
      tags: ['Salaire net', 'Cargas sociales', 'Estimación fiscal'],
    },
    netherlandsSalary: {
      title: 'Calculadora de salario (Países Bajos)',
      description: 'Estima el salario neto neerlandés con el impuesto de la casilla 1 y la deducción fiscal habitual.',
      tags: ['Impuesto neerlandés', 'Deducciones fiscales', 'Estimación neta'],
    },
  },

  common: {
    country: 'País',
    type: 'Tipo',
    totalDeductions: 'Total de deducciones',
    effectiveTaxRate: 'Tipo efectivo',
    amountWithCurrency: 'Importe ({currency})',
  },

  vat: {
    calculationType: 'Tipo de cálculo',
    exclusive: 'Sin IVA',
    inclusive: 'Con IVA',
    grossInclVat: 'Bruto (con IVA)',
    netExclVat: 'Neto (sin IVA)',
    amountHint: 'Introduce el importe al que añadir el IVA o del que extraerlo.',
    standardRate: 'Tipo general de IVA',
    currency: 'Moneda',
    chartTitle: 'Proporción entre neto e IVA',
    netAmount: 'Importe neto',
    vatAmount: 'Importe del IVA',
  },

  salary: {
    grossAnnual: 'Salario bruto anual',
    netAnnual: 'Salario neto anual',
    netAnnualTakeHome: 'Neto anual',
    netMonthly: 'Neto mensual',
    frequency: 'Periodicidad del salario',
    annual: 'Anual',
    monthly: 'Mensual',
    detailedBreakdown: 'Desglose detallado',
    freqAnnualWord: 'anual',
    freqMonthlyWord: 'mensual',
    grossSalaryWithFrequency: 'Salario bruto ({frequency})',
    grossHint: 'Introduce tu salario bruto ({frequency}) para calcular el neto.',
    compositionTitle: 'Composición del salario bruto',
    netTakeHome: 'Neto percibido',
  },

  deductions: {
    incomeTax: 'Impuesto sobre la renta',
    nationalInsurance: 'National Insurance',
    socialSecurity: 'Seguridad Social',
    solidarityTax: 'Recargo de solidaridad',
    federalTax: 'Impuesto federal',
    cantonalTax: 'Impuesto cantonal',
    ahv: 'AVS/Seguro',
    municipalTax: 'Impuesto municipal',
    stateTax: 'Impuesto regional',
    grossTax: 'Impuesto bruto',
    taxCredits: 'Deducciones fiscales',
    personalAllowance: 'Mínimo personal',
    taxableIncome: 'Base imponible',
  },
};

export default es;
