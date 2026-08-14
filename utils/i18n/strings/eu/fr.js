// French (Français).
//
// Uses the typographic apostrophe (’) throughout, both because it is correct
// French typography and because it keeps these single-quoted strings free of
// escapes. "National Insurance" stays English: it is a UK proper noun.

const fr = {
  switcher: {
    label: 'Langue',
    ariaLabel: 'Choisir la langue d’affichage',
    note: 'Traduit les libellés du calculateur. Les explications restent en anglais.',
  },

  hub: {
    eyebrow: 'Royaume-Uni & Europe',
    title: 'Calculateurs Royaume-Uni & Europe',
    subtitle:
      'Outils d’impôt, de TVA et de salaire net par pays pour le Royaume-Uni, l’Allemagne, la France, les Pays-Bas et toute l’Europe — tous gratuits.',
    comparisonHeading: 'Qui conserve la plus grande part de son salaire en Europe ?',
    comparisonIntro:
      'Salaire net estimé pour 2026 pour un salarié célibataire sur un salaire brut typique, dans la monnaie de chaque pays, après impôt sur le revenu et cotisations sociales salariales. Cliquez sur un pays pour calculer vos propres chiffres.',
    colCountry: 'Pays',
    colGross: 'Brut de référence',
    colNetYear: 'Net / an',
    colNetMonth: 'Net / mois',
    colKeeps: 'Conserve',
  },

  cards: {
    ukIncomeTax: {
      title: 'Calculateur d’impôt sur le revenu (Royaume-Uni)',
      description: 'Estimez l’impôt britannique pour 2026-27 avec les taux écossais et la National Insurance.',
      tags: ['Année fiscale 2026-27', 'Taux écossais', 'NI incluse'],
    },
    ukTakeHome: {
      title: 'Salaire net britannique par tranche',
      description: 'Montants nets immédiats pour les salaires britanniques de 20 000 £ à 150 000 £ — impôt, NI et paie mensuelle.',
      tags: ['20 000–150 000 £', 'Taux 2026-27', 'Impôt + NI'],
    },
    ukHourly: {
      title: 'Convertisseur taux horaire (Royaume-Uni)',
      description:
        'Convertissez tout taux en £/heure en salaire annuel, mensuel et hebdomadaire sur 37,5 ou 40 heures — avec une page par taux de 12 £ à 50 £, net 2026-27 inclus.',
      tags: ['12–50 £/heure', 'Semaines 37,5 h & 40 h', 'Vue après impôt'],
    },
    vat: {
      title: 'Calculateur de TVA européenne',
      description: 'Calculez la TVA pour 15 pays européens en modes HT, TTC et calcul inversé.',
      tags: ['15 pays', 'HT/TTC', 'Comparaison des taux'],
    },
    europeanSalary: {
      title: 'Calculateur de salaire européen',
      description: 'Estimez le salaire net après impôt et cotisations sociales dans les principaux pays européens.',
      tags: ['Salaire net', 'Cotisations sociales', 'Comparaison par pays'],
    },
    germanySalary: {
      title: 'Calculateur de salaire (Allemagne)',
      description: 'Estimez le salaire net allemand avec l’impôt sur le revenu, les assurances sociales et la surtaxe de solidarité.',
      tags: ['Brut vers net', 'Assurances sociales', 'Salaire net'],
    },
    germanyTakeHome: {
      title: 'Allemagne : net par salaire',
      description: 'Montants brut-net immédiats pour les salaires allemands de 25 000 € à 150 000 €.',
      tags: ['25 000–150 000 €', '§32a EStG 2026', 'Impôt + social'],
    },
    franceSalary: {
      title: 'Calculateur de salaire net (France)',
      description: 'Estimez le salaire net français après impôt sur le revenu et cotisations sociales.',
      tags: ['Salaire net', 'Charges sociales', 'Estimation d’impôt'],
    },
    netherlandsSalary: {
      title: 'Calculateur de salaire (Pays-Bas)',
      description: 'Estimez le salaire net néerlandais avec l’impôt de la case 1 et le crédit d’impôt habituel.',
      tags: ['Impôt néerlandais', 'Crédits d’impôt', 'Estimation nette'],
    },
  },

  common: {
    country: 'Pays',
    type: 'Type',
    totalDeductions: 'Total des prélèvements',
    effectiveTaxRate: 'Taux effectif d’imposition',
    amountWithCurrency: 'Montant ({currency})',
  },

  vat: {
    calculationType: 'Type de calcul',
    exclusive: 'Hors TVA',
    inclusive: 'TTC',
    grossInclVat: 'TTC (avec TVA)',
    netExclVat: 'HT (hors TVA)',
    amountHint: 'Saisissez le montant auquel ajouter la TVA ou dont l’extraire.',
    standardRate: 'Taux normal de TVA',
    currency: 'Devise',
    chartTitle: 'Part du net et de la TVA',
    netAmount: 'Montant HT',
    vatAmount: 'Montant de TVA',
  },

  salary: {
    grossAnnual: 'Salaire brut annuel',
    netAnnual: 'Salaire net annuel',
    netAnnualTakeHome: 'Net annuel',
    netMonthly: 'Net mensuel',
    frequency: 'Périodicité du salaire',
    annual: 'Annuel',
    monthly: 'Mensuel',
    detailedBreakdown: 'Détail du calcul',
    freqAnnualWord: 'annuel',
    freqMonthlyWord: 'mensuel',
    grossSalaryWithFrequency: 'Salaire brut ({frequency})',
    grossHint: 'Saisissez votre salaire brut ({frequency}) pour calculer le net.',
    compositionTitle: 'Composition du salaire brut',
    netTakeHome: 'Net perçu',
  },

  deductions: {
    incomeTax: 'Impôt sur le revenu',
    nationalInsurance: 'National Insurance',
    socialSecurity: 'Sécurité sociale',
    solidarityTax: 'Surtaxe de solidarité',
    federalTax: 'Impôt fédéral',
    cantonalTax: 'Impôt cantonal',
    ahv: 'AVS/Assurance',
    municipalTax: 'Impôt communal',
    stateTax: 'Impôt régional',
    grossTax: 'Impôt brut',
    taxCredits: 'Crédits d’impôt',
    personalAllowance: 'Abattement personnel',
    taxableIncome: 'Revenu imposable',
  },
};

export default fr;
