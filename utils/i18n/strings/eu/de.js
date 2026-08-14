// German (Deutsch).
//
// Terminology note: the German market has settled vocabulary for these tools —
// "Brutto-Netto-Rechner", "Solidaritätszuschlag", "Grundfreibetrag". Using the
// established terms rather than literal translations of the English is what
// makes these read as native, and is what the eventual /de/* pages will need
// to rank. "National Insurance" stays English: it is a UK proper noun.

const de = {
  switcher: {
    label: 'Sprache',
    ariaLabel: 'Anzeigesprache wählen',
    note: 'Übersetzt die Beschriftungen des Rechners. Die Erläuterungen bleiben auf Englisch.',
  },

  hub: {
    eyebrow: 'UK & Europa',
    title: 'Rechner für UK & Europa',
    subtitle:
      'Steuer-, Mehrwertsteuer- und länderspezifische Nettolohnrechner für das Vereinigte Königreich, Deutschland, Frankreich, die Niederlande und ganz Europa — alle kostenlos.',
    comparisonHeading: 'Wer behält in Europa am meisten vom Gehalt?',
    comparisonIntro:
      'Geschätztes Nettoeinkommen 2026 für eine alleinstehende angestellte Person bei einem typischen Bruttogehalt in der jeweiligen Landeswährung, nach Einkommensteuer und Sozialabgaben. Klicken Sie auf ein Land, um eigene Zahlen zu berechnen.',
    colCountry: 'Land',
    colGross: 'Beispiel-Brutto',
    colNetYear: 'Netto / Jahr',
    colNetMonth: 'Netto / Monat',
    colKeeps: 'Behält',
  },

  cards: {
    ukIncomeTax: {
      title: 'UK-Einkommensteuerrechner',
      description: 'Berechnen Sie die britische Einkommensteuer für 2026-27 mit schottischen Sätzen und National Insurance.',
      tags: ['Steuerjahr 2026-27', 'Schottische Sätze', 'Inkl. NI'],
    },
    ukTakeHome: {
      title: 'UK-Nettolohn nach Gehalt',
      description: 'Sofortige Nettobeträge für britische Gehälter von 20.000 £ bis 150.000 £ — Steuer, NI und Monatslohn.',
      tags: ['20.000–150.000 £', 'Sätze 2026-27', 'Steuer + NI'],
    },
    ukHourly: {
      title: 'UK Stundenlohn-Umrechner',
      description:
        'Rechnen Sie jeden £/Stunde-Satz in Jahres-, Monats- und Wochenlohn um, bei 37,5- oder 40-Stunden-Woche — mit Seiten je Satz von 12 £ bis 50 £ inklusive Nettolohn 2026-27.',
      tags: ['12–50 £/Stunde', '37,5- & 40-Stunden-Woche', 'Nach Steuern'],
    },
    vat: {
      title: 'Europäischer Mehrwertsteuerrechner',
      description: 'Berechnen Sie die Mehrwertsteuer für 15 europäische Länder mit Brutto-, Netto- und Rückrechnungsmodus.',
      tags: ['15 Länder', 'Brutto/Netto', 'Satzvergleich'],
    },
    europeanSalary: {
      title: 'Europäischer Gehaltsrechner',
      description: 'Schätzen Sie das Nettogehalt nach Steuern und Sozialabgaben in wichtigen europäischen Ländern.',
      tags: ['Nettogehalt', 'Sozialabgaben', 'Ländervergleich'],
    },
    germanySalary: {
      title: 'Brutto-Netto-Rechner Deutschland',
      description: 'Berechnen Sie das deutsche Nettogehalt mit Lohnsteuer, Sozialversicherung und Solidaritätszuschlag.',
      tags: ['Brutto zu Netto', 'Sozialversicherung', 'Nettolohn'],
    },
    germanyTakeHome: {
      title: 'Deutschland: Netto nach Gehalt',
      description: 'Sofortige Brutto-Netto-Werte für deutsche Gehälter von 25.000 € bis 150.000 €.',
      tags: ['25.000–150.000 €', '§32a EStG 2026', 'Steuer + Sozial'],
    },
    franceSalary: {
      title: 'Gehaltsrechner Frankreich',
      description: 'Schätzen Sie das französische Nettogehalt nach Einkommensteuer und Sozialabgaben.',
      tags: ['Salaire net', 'Sozialabgaben', 'Steuerschätzung'],
    },
    netherlandsSalary: {
      title: 'Gehaltsrechner Niederlande',
      description: 'Schätzen Sie das niederländische Nettogehalt mit Box-1-Steuer und der üblichen Steuergutschrift.',
      tags: ['Niederländische Steuer', 'Steuergutschriften', 'Netto-Schätzung'],
    },
  },

  common: {
    country: 'Land',
    type: 'Art',
    totalDeductions: 'Abzüge gesamt',
    effectiveTaxRate: 'Effektiver Steuersatz',
    amountWithCurrency: 'Betrag ({currency})',
  },

  vat: {
    calculationType: 'Berechnungsart',
    exclusive: 'Ohne MwSt.',
    inclusive: 'Inkl. MwSt.',
    grossInclVat: 'Brutto (inkl. MwSt.)',
    netExclVat: 'Netto (ohne MwSt.)',
    amountHint: 'Geben Sie den Betrag ein, zu dem die MwSt. addiert oder aus dem sie herausgerechnet werden soll.',
    standardRate: 'Regelsatz MwSt.',
    currency: 'Währung',
    chartTitle: 'Netto im Verhältnis zur MwSt.',
    netAmount: 'Nettobetrag',
    vatAmount: 'MwSt.-Betrag',
  },

  salary: {
    grossAnnual: 'Bruttojahresgehalt',
    netAnnual: 'Nettojahresgehalt',
    netAnnualTakeHome: 'Netto pro Jahr',
    netMonthly: 'Netto pro Monat',
    frequency: 'Abrechnungszeitraum',
    annual: 'Jährlich',
    monthly: 'Monatlich',
    detailedBreakdown: 'Detaillierte Aufschlüsselung',
    freqAnnualWord: 'jährlich',
    freqMonthlyWord: 'monatlich',
    grossSalaryWithFrequency: 'Bruttogehalt ({frequency})',
    grossHint: 'Geben Sie Ihr Bruttogehalt ({frequency}) ein, um den Nettolohn zu berechnen.',
    compositionTitle: 'Zusammensetzung des Bruttogehalts',
    netTakeHome: 'Netto',
  },

  deductions: {
    incomeTax: 'Einkommensteuer',
    nationalInsurance: 'National Insurance',
    socialSecurity: 'Sozialversicherung',
    solidarityTax: 'Solidaritätszuschlag',
    federalTax: 'Bundessteuer',
    cantonalTax: 'Kantonssteuer',
    ahv: 'AHV/Versicherung',
    municipalTax: 'Gemeindesteuer',
    stateTax: 'Regionalsteuer',
    grossTax: 'Steuer brutto',
    taxCredits: 'Steuergutschriften',
    personalAllowance: 'Grundfreibetrag',
    taxableIncome: 'Zu versteuerndes Einkommen',
  },
};

export default de;
