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
import { useShareableState, toNumericString, toOption } from '../../utils/shareableState';
import { useT } from '../../utils/i18n/LanguageProvider';
import LanguageToggle from '../i18n/LanguageToggle';

const FAQ = [
  { question: 'How accurate are these salary calculations?', answer: 'These calculations use the tax rates and standard deductions configured in this calculator. Actual take-home pay may vary based on personal circumstances, allowances, and local variations. Consult a tax professional for precise calculations.' },
  { question: "What's included in social security deductions?", answer: 'Social security typically includes pension contributions, unemployment insurance, health insurance, and disability insurance. The exact components and rates vary significantly between European countries.' },
  { question: 'Which European country is most tax-efficient for high earners?', answer: 'Switzerland generally has lower overall tax rates, especially for high earners. However, cost of living and available services vary greatly. Consider total compensation packages and living costs, not just tax rates.' },
  { question: 'Do these calculations include all possible deductions?', answer: 'These are standard calculations for employees. Additional deductions may apply for pension contributions, charitable donations, professional expenses, or other tax-deductible items specific to each country.' },
  { question: 'Why is the effective rate lower than the top tax band?', answer: 'Progressive systems tax income in slices: the first slice is often tax-free, and higher rates apply only to income above each threshold. A UK earner on £50,000 faces a 40% band but pays about 21% of gross overall once the personal allowance and lower bands are counted.' },
  { question: 'Why do social contributions matter as much as income tax?', answer: 'In several countries — Germany and France especially — employee social contributions (pension, health, unemployment) take a larger share of a mid-level salary than income tax itself. Comparing countries on headline income-tax rates alone misses most of the story.' },
  { question: 'Can I compare salaries across countries with this tool?', answer: 'You can compare what each system deducts from the same gross figure, which is the right first step. A fair offer comparison also needs cost of living, what contributions buy (healthcare, pensions), currency, and benefits like employer pension matches or a 13th-month salary.' }
];

// Per-country educational content. Rendered only on the dedicated country pages
// (forcedCountry set); the hub uses its own comparison article above. Every euro
// figure below is computed from this page's own engine (computeEuropeanSalary) for
// a single, childless employee, so prose and calculator always agree.
const proseHead = 'font-display text-lg font-semibold text-ink dark:text-white';
const proseLink = 'font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300';

const COUNTRY_CONTENT = {
  DE: {
    faq: [
      { question: 'Why are social contributions higher than income tax on a German salary?', answer: 'On a mid-level salary such as €60,000, statutory pension, health, unemployment and care contributions total about €13,050 for a single employee, against roughly €9,399 of income tax. Social insurance is charged from the first euro with no tax-free band, so it dominates until income tax catches up at higher salaries.' },
      { question: 'What is tax class I, and does this calculator use it?', answer: 'Yes. The model assumes Steuerklasse I — a single, childless employee with statutory health insurance and no church tax. Married couples using splitting (class III/V or IV) and parents paying the lower care rate will see different, usually lower, deductions.' },
      { question: 'When does the solidarity surcharge apply in Germany?', answer: 'Since 2021 the Soli is zero until your annual income-tax bill exceeds about €20,350, then phases in. For a single employee that means roughly €0 up to €80,000 of gross salary; it first appears around €100,000 (about €347 in this model).' }
    ],
    article: (
      <>
        <h2 className="font-display text-xl font-bold text-ink dark:text-white">How Germany turns €60,000 gross into about €3,129 a month</h2>
        <p className="mt-3">
          Put €60,000 of gross salary through the calculator above as a single, childless employee (tax class I) and it
          returns roughly <strong className="text-ink dark:text-white">€37,551 net a year — about €3,129 a month</strong>,
          an effective deduction rate of 37.4%. The striking part is the split: income tax takes about €9,399, but social
          insurance takes about €13,050. For a normal mid-level German salary the state pension, health, unemployment and
          care contributions cost you more than income tax does.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Where a German salary actually goes</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink dark:text-white">Social insurance first, from the first euro.</strong> Pension
            9.3%, health 8.75%, unemployment 1.3% and care 2.4% (the childless rate) come to about €13,050 on €60,000.
            Unlike income tax there is no tax-free band, but the contributions stop at assessment ceilings (€101,400 for
            pension and unemployment, €69,750 for health and care) — which is why the effective rate flattens on high
            salaries.
          </li>
          <li>
            <strong className="text-ink dark:text-white">Income tax on a shrinking base.</strong> The §32a EStG tariff is
            applied not to gross but to taxable income after the employee lump sums and deductible insurance, so the €9,399
            bill on €60,000 is lower than the headline bands suggest. The Grundfreibetrag (€12,348) is tax-free and the 42%
            zone only starts at €69,879 of taxable income.
          </li>
          <li>
            <strong className="text-ink dark:text-white">Solidarity surcharge, now a high-earner tax.</strong> Once a 5.5%
            add-on for everyone, the Soli is zero until your income-tax bill passes €20,350 — so it stays at €0 through
            €80,000 of salary and first appears (about €347) around €100,000 gross here.
          </li>
        </ul>

        <h3 className={cn('mt-8', proseHead)}>What the effective rate does as pay rises</h3>
        <p className="mt-3">
          At €40,000 the calculator shows about €26,887 net (32.8%); at €80,000, €48,035 (40.0%); at €100,000, €58,014
          (42.0%). The climb is steady rather than sharp because the two big levers act in sequence — social contributions
          dominate the middle and then plateau at the ceilings, while income tax becomes the marginal cost near and above
          the 42% zone.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Why your Brutto-Netto will differ</h3>
        <p className="mt-3">
          This model assumes tax class I, no children, statutory health insurance and no church tax. A married single-earner
          using splitting (class III) keeps substantially more; church tax (8&ndash;9% of income tax in most states) and
          private health insurance move the number the other way; parents pay the lower care rate. For the wider picture,
          the <a href="/european-salary-calculator" className={proseLink}>European salary calculator</a>{' '}compares the
          same gross across eight systems, and the{' '}
          <a href="/uk-income-tax-calculator" className={proseLink}>UK income tax calculator</a>{' '}breaks down the British
          equivalent. Treat the figure as a planning estimate — your official Lohnabrechnung is the final word.
        </p>
      </>
    )
  },
  FR: {
    faq: [
      { question: 'Does this France calculator account for the quotient familial?', answer: 'No — it models a single person (one part). France taxes households, so a married or PACS couple and children add parts that lower the income-tax base. A family can pay far less income tax than the single figure shown, though social contributions are unchanged.' },
      { question: 'Why is French take-home lower than the Netherlands for the same gross?', answer: 'French employee social contributions (state and AGIRC-ARRCO pensions, plus CSG and CRDS) are heavier — about 21% of gross — and there is no large flat tax credit like the Dutch heffingskorting. On €60,000 France nets about €41,149 versus roughly €46,987 in the Netherlands.' },
      { question: 'Is French income tax withheld monthly now?', answer: 'Yes. Since the prélèvement à la source reform, income tax is withheld from each payslip rather than settled the following year, so the net figure here is close to what actually reaches your account.' }
    ],
    article: (
      <>
        <h2 className="font-display text-xl font-bold text-ink dark:text-white">What €60,000 gross becomes in France — about €3,429 a month</h2>
        <p className="mt-3">
          Run €60,000 of gross salary through the calculator above and it returns roughly{' '}
          <strong className="text-ink dark:text-white">€41,149 net a year — about €3,429 a month</strong>, an effective
          rate of 31.4%. Two very different charges make up the gap: social contributions of about €12,446 and income tax
          of about €6,405. Social contributions are twice the size of the tax bill, and most of them are deducted
          before income tax is even calculated.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Two layers: cotisations, then impôt</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink dark:text-white">Social contributions come off first.</strong> On €60,000 they come
            to about €12,446 (20.7%): the state pension (6.9% up to the €48,060 social-security ceiling plus 0.4% on
            everything), the AGIRC-ARRCO complementary pension (4.01% below the ceiling, 9.72% above it), and CSG and CRDS
            at 9.7% of 98.25% of gross. Employees have paid no unemployment or health contribution since 2019 — the
            employer carries those.
          </li>
          <li>
            <strong className="text-ink dark:text-white">Income tax on a progressive barème — applied to a much smaller
            base.</strong> Taxable income is gross less the deductible contributions (all but 2.9 points of CSG/CRDS),
            then less a flat 10% allowance for professional expenses: €60,000 becomes about €44,337 of taxable income.
            The 2026 bands run 0% to €11,600, 11% to €29,579, 30% to €84,577, then 41% and 45%, giving about €6,405 of
            tax — an effective income-tax rate under 11% despite the 30% headline. Modest earners also get the
            <em> décote</em>, which trims small tax bills further.
          </li>
          <li>
            <strong className="text-ink dark:text-white">Withheld at source.</strong> Since the prélèvement à la source
            reform income tax is taken from each payslip rather than the following year, so the net shown here is close to
            what actually lands each month.
          </li>
        </ul>

        <h3 className={cn('mt-8', proseHead)}>The big caveat — France taxes households, not people</h3>
        <p className="mt-3">
          This calculator models a single person. France&rsquo;s income tax uses the <em>quotient familial</em>: household
          income is divided by a number of &ldquo;parts&rdquo; (2 for a married or PACS couple, an extra half-part per
          child), taxed on that smaller base, then multiplied back. A married earner with two children can pay dramatically
          less income tax than the single figure shown — sometimes nothing at incomes where a single person pays thousands.
          The social contributions do not change, but the impôt line can.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Reading the number</h3>
        <p className="mt-3">
          At €40,000 the calculator shows about €29,697 net (25.8%); at €80,000, €52,706 (34.1%); at €100,000, €64,262
          (35.7%). To weigh a French offer against a neighbour&rsquo;s, the{' '}
          <a href="/european-salary-calculator" className={proseLink}>European salary calculator</a>{' '}runs the same gross
          through eight systems side by side — useful because France&rsquo;s social contributions are heavier than most
          while its net can still be middling. Every figure here is a planning estimate for a single employee; a French
          bulletin de paie or a tax adviser gives the household-adjusted truth.
        </p>
      </>
    )
  },
  NL: {
    faq: [
      { question: 'Why is the Dutch effective tax rate so low despite a 35.70% first bracket?', answer: 'Two credits do the work: the general tax credit (up to €3,115) and the labour credit (up to €5,685) subtract directly from the tax bill — about €8,800 combined. On €60,000 that cuts a €21,813 gross tax to roughly €13,013, an effective rate of 21.7%.' },
      { question: 'Does this calculator include the 30% ruling for expats?', answer: 'No. The 30% ruling, which exempts part of a qualifying incoming employee’s salary from tax, is not modelled. Those who qualify would keep more than the figure shown here.' },
      { question: 'Are the Dutch tax credits really a flat amount?', answer: 'This model applies the maximum general and labour credits as a flat sum, which is accurate for low-to-middle incomes. In reality both taper as income rises, so at higher salaries the true tax is somewhat higher and net a little lower than shown.' }
    ],
    article: (
      <>
        <h2 className="font-display text-xl font-bold text-ink dark:text-white">Why €60,000 gross nets nearly €47,000 in the Netherlands</h2>
        <p className="mt-3">
          Put €60,000 of gross salary through the calculator above and it returns about{' '}
          <strong className="text-ink dark:text-white">€46,987 net a year — roughly €3,916 a month</strong>, an effective
          rate of just 21.7%. That is the mildest of the euro-zone systems this tool models, and the reason is not low tax
          rates (Box 1 starts at 35.70%) but two large tax credits that refund thousands of euros.
        </p>

        <h3 className={cn('mt-8', proseHead)}>High rates, then big credits</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink dark:text-white">Box 1 looks steep.</strong> The 2026 brackets are 35.70% to
            €38,883, 37.56% to €78,426, then 49.50% — and the first bracket already bundles national insurance into that
            combined rate. On €60,000 the gross tax works out to about €21,813.
          </li>
          <li>
            <strong className="text-ink dark:text-white">Then the credits arrive.</strong> The general tax credit (algemene
            heffingskorting, up to €3,115) and the labour credit (arbeidskorting, up to €5,685) subtract directly from the
            tax bill — here a flat €8,800 — cutting the actual tax to about €13,013. Credits are the whole story: they are
            why a system with a 35.70% entry rate produces a 21.7% effective rate at €60,000.
          </li>
        </ul>

        <h3 className={cn('mt-8', proseHead)}>How the effective rate climbs</h3>
        <p className="mt-3">
          At €40,000 the calculator shows about €34,499 net (13.8%); at €80,000, €59,287 (25.9%); at €100,000, €69,387
          (30.6%). The rate rises faster than in Germany or France because the flat credit is a shrinking share of a larger
          salary — €8,800 relieves a huge fraction of a €40,000 tax bill but only a slice of a €100,000 one.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Where the estimate is optimistic</h3>
        <p className="mt-3">
          Two simplifications matter. First, this model applies the maximum credits as a flat amount, but in reality both
          the general and labour credits taper away as income rises — so at higher salaries the true tax is a little higher
          and the net a little lower than shown. Second, the 30% ruling for qualifying incoming expats (which exempts part
          of salary from tax) is not modelled and would push net higher for those who qualify. For a cross-border
          comparison, the <a href="/european-salary-calculator" className={proseLink}>European salary calculator</a>{' '}puts
          the Dutch number beside seven other systems, and the{' '}
          <a href="/uk-income-tax-calculator" className={proseLink}>UK income tax calculator</a>{' '}does the British
          breakdown. As always, a Dutch loonstrook or the Belastingdienst&rsquo;s own tools give the exact figure.
        </p>
      </>
    )
  },
  BE: {
    faq: [
      { question: 'Why is Belgian tax lower than the 50% headline rate suggests?', answer: 'Because the 50% band applies to taxable income, not gross. On a €60,000 salary, social security (€7,842) and the flat-rate professional expenses deduction (€6,070) come off first, leaving about €46,088 to be taxed — below the €51,070 point where 50% starts. The effective rate lands near 38%, not 50%.' },
      { question: 'What is the communal surcharge and how much does it cost me?', answer: 'Belgian municipalities add a surcharge on the federal tax you owe, ranging from 0% to about 9%. This calculator applies the 7% national average, which is roughly €977 a year on a €60,000 salary. Moving between a 0% commune and a 9% one is worth about €1,250 a year at that income — small next to rent, but not nothing.' },
      { question: 'Does this include the werkbonus or a company car?', answer: 'No. The werkbonus, a social-security rebate for lower wages, is excluded, so salaries under roughly €30,000 are shown slightly pessimistically. The bijzondere bijdrage sociale zekerheid (at most €731 a year) is also excluded. Belgian packages often carry a company car, meal vouchers or an eco-cheque budget that this model does not value, and those can be worth more than a raise.' }
    ],
    article: (
      <>
        <h2 className="font-display text-xl font-bold text-ink dark:text-white">What €60,000 gross becomes in Belgium — about €3,102 a month</h2>
        <p className="mt-3">
          Run €60,000 of gross salary through the calculator above as a single employee with no dependants and it
          returns roughly <strong className="text-ink dark:text-white">€37,220 net a year — about €3,102 a month</strong>,
          an effective rate of 38.0%. That is a long way from the 50% figure Belgium is famous for, and the gap is not a
          loophole: it is simply what happens when you tax income in the order Belgian law actually specifies.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Four steps, in this order</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink dark:text-white">Social security comes off first.</strong> The employee RSZ/ONSS
            contribution is 13.07% of gross — €7,842 on €60,000 — and it is deducted before any income tax is
            calculated. It funds healthcare, pensions and unemployment cover.
          </li>
          <li>
            <strong className="text-ink dark:text-white">Then the professional expenses deduction.</strong> Employees
            automatically get 30% of what remains as a flat-rate expenses allowance, capped at €6,070 for income year
            2026. No receipts, no paperwork. On €60,000 the cap binds, and taxable income falls to about €46,088.
          </li>
          <li>
            <strong className="text-ink dark:text-white">Only then do the bands apply</strong> — 25% to €16,720, 40%
            to €29,510, 45% to €51,070 and 50% above. Because taxable income is €46,088, this salary never reaches
            the 50% band at all; gross tax comes to about €16,756.
          </li>
          <li>
            <strong className="text-ink dark:text-white">A credit, then the commune.</strong> The tax-free sum of
            €11,180 is not a zero-rate slice but a credit worth 25% of itself — €2,795 straight off the bill,
            leaving €13,961. Your municipality then adds its surcharge on that figure: about €977 at the 7% national
            average used here.
          </li>
        </ul>

        <h3 className={cn('mt-8', proseHead)}>What the effective rate does as pay rises</h3>
        <p className="mt-3">
          At €30,000 the calculator shows about €23,189 net (22.7%); at €45,000, €30,459 (32.3%); at €80,000,
          €45,571 (43.0%); at €100,000, €53,655 (46.3%). The climb is steep in the middle because the flat-rate
          expenses deduction is capped — once you pass the €6,070 ceiling, every extra euro of salary is exposed to
          the bands with no offsetting relief, and the 50% band starts biting on gross salaries above roughly €80,000.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Why your Belgian payslip will differ</h3>
        <p className="mt-3">
          This model assumes a single employee, no dependants, private sector, standard flat-rate expenses and the 7%
          average communal surcharge. Dependent children raise the tax-free sum and can move the number substantially;
          your own commune may charge anywhere from 0% to 9%; and the werkbonus lifts net pay at lower salaries. Belgian
          compensation also leans unusually hard on things a gross figure never shows — company cars, meal vouchers,
          group insurance and the 13th month — so compare packages, not just salaries. For the wider picture, the{' '}
          <a href="/european-salary-calculator" className={proseLink}>European salary calculator</a>{' '}puts the same gross
          through eight systems, and the{' '}
          <a href="/netherlands-salary-calculator" className={proseLink}>Netherlands calculator</a>{' '}shows the neighbour
          most often compared against. Treat this as a planning estimate — your loonbrief or fiche 281.10 is the final word.
        </p>
      </>
    )
  },
  AT: {
    faq: [
      { question: 'Does this calculator include the 13th and 14th salary?', answer: 'Yes, and it has to. Austrian salaries are quoted as 14 payments — 12 monthly plus Urlaubsgeld and Weihnachtsgeld. Enter your Jahresbrutto (all 14) and the calculator splits it correctly; if you enter a monthly figure it multiplies by 14, not 12. The two extra payments are Sonderzahlungen and are taxed at a flat 6%, not at your marginal rate.' },
      { question: 'Why are the 13th and 14th salaries taxed so lightly?', answer: 'Sonderzahlungen fall outside the progressive tariff. After social security, the first €620 is free and the rest is taxed at 6%, provided the total stays within the Jahressechstel — which a standard 14-payment salary does exactly. On a €60,000 salary that costs about €389 instead of roughly €2,842 at the 40% marginal rate, a saving of about €2,450 a year.' },
      { question: 'Does social security really stop at a ceiling?', answer: 'Yes. The Höchstbeitragsgrundlage for 2026 is €6,930 a month for running pay, with a separate €13,860 annual ceiling for the 13th/14th. Above those levels no further contributions are due, which is why the effective rate flattens on high salaries — at €120,000 social security is about €17,441 rather than the €21,744 an uncapped 18.12% would take.' }
    ],
    article: (
      <>
        <h2 className="font-display text-xl font-bold text-ink dark:text-white">What €60,000 gross becomes in Austria — about €2,934 a month, fourteen times a year</h2>
        <p className="mt-3">
          Run €60,000 of Jahresbrutto through the calculator above as a single Angestellte(r) outside Vienna and it
          returns roughly <strong className="text-ink dark:text-white">€41,082 net a year</strong>, an effective rate
          of 31.5%. The monthly figure depends on which month you mean: about{' '}
          <strong className="text-ink dark:text-white">€2,934 in a normal month</strong>, and roughly double that in
          June and November when the Urlaubsgeld and Weihnachtsgeld land. That fourteenth-payment structure is not a
          quirk of presentation — it is the single biggest reason Austrian take-home beats what the 48% tax band implies.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Two salaries, two tax systems</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink dark:text-white">The twelve running payments</strong>{' '}go through the normal
            progressive tariff. Social security of 18.12% comes off first (about €9,319), the
            Werbungskostenpauschale takes €132, and what remains — roughly €41,978 — meets the 2026 bands: nothing to
            €13,539, then 20%, 30% and 40%. That produces about €8,238, less the €496 Verkehrsabsetzbetrag, so €7,742.
          </li>
          <li>
            <strong className="text-ink dark:text-white">The 13th and 14th are taxed separately</strong>{' '}and far more
            gently. Social security applies at a lower 17.12% (they escape the Wohnbauförderungsbeitrag and the
            AK-Umlage), the first €620 is tax-free, and everything above it is charged at a flat 6%. The bill on
            €8,571 of Sonderzahlungen is about €389. Pushed through the progressive tariff at this salary&rsquo;s 40%
            marginal rate it would have cost roughly €2,842 — the Sonderzahlungen rule is worth about €2,450 a year.
          </li>
          <li>
            <strong className="text-ink dark:text-white">Contributions stop at a ceiling.</strong>{' '}The 2026
            Höchstbeitragsgrundlage is €6,930 a month for running pay and €13,860 a year for the Sonderzahlungen.
            Below those levels contributions scale with salary; above them they simply stop.
          </li>
        </ul>

        <h3 className={cn('mt-8', proseHead)}>What the effective rate does as pay rises</h3>
        <p className="mt-3">
          At €35,000 the calculator shows about €26,570 net (24.1%); at €45,000, €32,596 (27.6%); at €80,000, €51,730
          (35.3%); at €120,000, €74,312 (38.1%). The curve is gentler than the 40&ndash;48% bands suggest, and it
          flattens at the top for two compounding reasons: social security stops at the ceiling, and a fixed two
          fourteenths of every salary keeps being taxed at 6% no matter how high the rest climbs.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Why your Lohnzettel will differ</h3>
        <p className="mt-3">
          This model assumes an Angestellte(r) outside Vienna, single, with no children and no commuter allowance.
          Vienna raised the Wohnbauförderungsbeitrag for 2026, taking the employee rate to 18.32%; the
          Familienbonus Plus, Alleinverdienerabsetzbetrag and Pendlerpauschale all reduce tax and none are modelled;
          and the Zuschlag zum Verkehrsabsetzbetrag plus the Negativsteuer are granted at assessment rather than in
          payroll, so low earners here are shown slightly pessimistically. For the wider picture, the{' '}
          <a href="/european-salary-calculator" className={proseLink}>European salary calculator</a>{' '}puts the same
          gross through eight systems, and the{' '}
          <a href="/germany-salary-calculator" className={proseLink}>Germany calculator</a>{' '}covers the neighbour
          Austrian offers are most often weighed against. Treat this as a planning estimate — your monthly
          Lohnzettel is the final word.
        </p>
      </>
    )
  },
  SE: {
    faq: [
      { question: 'Why is Swedish tax lower than its reputation suggests?', answer: 'Because the ~32% municipal rate is charged on taxable income, not gross, and two large reliefs come off first. The grundavdrag removes a slice of income from tax entirely, and the jobbskatteavdrag is a credit worth about 50,500 kr a year at higher salaries. On 500,000 kr the effective rate is about 21.2%, not 32%.' },
      { question: 'Do I really pay the 7% allmän pensionsavgift?', answer: 'On paper yes, in practice no. The 7% pension fee is charged on income up to 673,038 kr, but a skattereduktion refunds 100% of it against your income tax. Anyone with enough tax to offset — which is nearly every employee — ends up paying nothing net. Modelling it as a straight 7% deduction, as many calculators do, overstates Swedish tax substantially.' },
      { question: 'When does the 20% state tax actually start?', answer: 'On taxable income above the 2026 skiktgräns of 643,000 kr, which for someone taking only the standard grundavdrag means a gross salary of roughly 660,400 kr. Below that you pay municipal tax only. This is why the effective rate curve here is flat through the middle and then steepens sharply.' }
    ],
    article: (
      <>
        <h2 className="font-display text-xl font-bold text-ink dark:text-white">What 500,000 kr gross becomes in Sweden — about 32,854 kr a month</h2>
        <p className="mt-3">
          Run 500,000 kr of gross salary through the calculator above as an employee under 66 in an average-rate
          municipality and it returns roughly{' '}
          <strong className="text-ink dark:text-white">394,247 kr net a year — about 32,854 kr a month</strong>, an
          effective rate of 21.2%. Sweden has a reputation for taking a third of everything, and the headline
          municipal rate of 32.38% appears to confirm it. The reputation is wrong for one simple reason: that rate is
          charged on taxable income after two substantial reliefs, and a third charge is refunded outright.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Three reliefs, then the rate</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink dark:text-white">The grundavdrag</strong>{' '}comes off first. It rises with
            income, plateaus, then tapers to a floor of 17,400 kr — which is where a 500,000 kr salary sits, leaving
            482,600 kr to be taxed. Municipal tax on that is about 156,266 kr.
          </li>
          <li>
            <strong className="text-ink dark:text-white">The jobbskatteavdrag is the big one.</strong>{' '}It is a
            credit against municipal tax, built up in bands and valued at the municipal rate, worth about 50,513 kr a
            year at this salary. The phase-out that used to claw it back from high earners was removed for 2026, so
            it now plateaus rather than disappearing.
          </li>
          <li>
            <strong className="text-ink dark:text-white">The 7% pension fee cancels itself.</strong>{' '}The allmän
            pensionsavgift takes 35,000 kr here — and a skattereduktion hands back 100% of it. It appears on the
            payslip and then vanishes from the bill. Calculators that treat it as a straight deduction overstate
            Swedish tax by the full 7%.
          </li>
        </ul>

        <h3 className={cn('mt-8', proseHead)}>What the effective rate does as pay rises</h3>
        <p className="mt-3">
          At 300,000 kr the calculator shows about 245,240 kr net (18.3%); at 400,000 kr, 320,580 kr (19.9%); at
          600,000 kr, 461,867 kr (23.0%); at 1,000,000 kr, 664,427 kr (33.6%). The curve is remarkably flat through
          the middle and then bends hard, because the 20% statlig inkomstskatt only begins above 643,000 kr of
          taxable income — roughly 660,400 kr of gross salary. Below that threshold Swedish marginal rates are
          municipal-only; above it they jump by twenty points at once.
        </p>

        <h3 className={cn('mt-8', proseHead)}>Why your lönebesked will differ</h3>
        <p className="mt-3">
          This model uses the national average municipal rate of 32.38%, but the real figure is set by your kommun
          and region and runs from 28.93% in Österåker to 35.65% in Dorotea — a spread worth more than 15,000 kr a
          year on this salary. It also assumes you are under 66 (over-66s get a much larger grundavdrag and a
          different job credit) and not a member of the Church of Sweden, whose fee is not modelled here. Thresholds
          and formulas follow Skatteverket&rsquo;s technical description for 2026. For the wider picture, the{' '}
          <a href="/european-salary-calculator" className={proseLink}>European salary calculator</a>{' '}puts the same
          gross through eight systems, and the{' '}
          <a href="/germany-salary-calculator" className={proseLink}>Germany calculator</a>{' '}covers the system
          Swedish offers are most often compared against. Treat this as a planning estimate — your lönebesked and
          Skatteverket&rsquo;s own tools are the final word.
        </p>
      </>
    )
  }
};

const SHARE_DEFAULTS = { grossSalary: '', country: 'UK', frequency: 'annual' };
const PINNED_SHARE_DEFAULTS = { grossSalary: '', frequency: 'annual' };

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
  const t = useT();
  const [grossSalary, setGrossSalary] = useState('');
  const [country, setCountry] = useState(forcedCountry || 'UK');
  const [frequency, setFrequency] = useState('annual'); // annual, monthly
  const [results, setResults] = useState(null);

  // The country-specific pages (/germany-salary-calculator and friends) pin the
  // country, so it must not become a shared param there — a link that silently
  // switched country would contradict the page it sits on.
  const shareDefaults = forcedCountry ? PINNED_SHARE_DEFAULTS : SHARE_DEFAULTS;

  useShareableState({
    values: forcedCountry ? { grossSalary, frequency } : { grossSalary, country, frequency },
    defaults: shareDefaults,
    onRestore: (shared) => {
      if ('grossSalary' in shared) setGrossSalary(toNumericString(shared.grossSalary, ''));
      if ('frequency' in shared) setFrequency(toOption(shared.frequency, ['annual', 'monthly'], 'annual'));
      if ('country' in shared && !forcedCountry) {
        setCountry(toOption(shared.country, Object.keys(SALARY_SYSTEMS), 'UK'));
      }
    }
  });

  useEffect(() => {
    if (forcedCountry) {
      setCountry(forcedCountry);
    }
  }, [forcedCountry]);

  const calculateSalary = () => {
    if (!grossSalary || !country) return;

    // Austria advertises salaries as 14 payments, so a monthly figure there
    // annualises to 14x, not 12x. Every other system here pays 12.
    const paymentsPerYear = SALARY_SYSTEMS[country]?.paymentsPerYear || 12;
    const annual = frequency === 'annual'
      ? parseFloat(grossSalary)
      : parseFloat(grossSalary) * paymentsPerYear;
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
  const countryContent = forcedCountry ? COUNTRY_CONTENT[forcedCountry] : null;
  // FAQ shown and emitted as schema: country-specific questions first (on the
  // dedicated pages), then the shared list. Schema is always built from this
  // same array so structured data matches what renders.
  const activeFaq = countryContent ? [...countryContent.faq, ...FAQ] : FAQ;
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

  // Line-item names come from the dictionary, keyed by the engine's breakdown
  // keys, so an unmapped key still falls back to the raw key below.
  const deductionLabels = Object.fromEntries(
    ['incomeTax', 'nationalInsurance', 'socialSecurity', 'solidarityTax', 'federalTax', 'cantonalTax',
      'ahv', 'municipalTax', 'stateTax', 'grossTax', 'taxCredits', 'personalAllowance', 'taxableIncome',
      'specialPaymentTax', 'unemploymentAccident', 'occupationalPension']
      .map((key) => [key, t(`deductions.${key}`)])
  );

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
            "mainEntity": activeFaq.map(({ question, answer }) => ({
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
        <LanguageToggle className="mb-6" />

        <div className="grid gap-5 lg:grid-cols-5">
          {/* Input Panel */}
          <Card className="p-5 lg:col-span-2">
            <div className="space-y-4">
              {!forcedCountry && (
                <SelectField
                  id="eu-country"
                  label={t('common.country')}
                  value={country}
                  onChange={setCountry}
                  options={Object.entries(SALARY_SYSTEMS).map(([code, data]) => ({
                    value: code,
                    label: `${data.flag} ${data.country}`
                  }))}
                />
              )}

              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink-soft dark:text-slate-300">{t('salary.frequency')}</span>
                <Tabs
                  tabs={[
                    { id: 'annual', label: t('salary.annual') },
                    { id: 'monthly', label: t('salary.monthly') }
                  ]}
                  active={frequency}
                  onChange={setFrequency}
                />
              </div>

              <NumberField
                id="eu-gross"
                label={t('salary.grossSalaryWithFrequency').replace('{frequency}', t(frequency === 'monthly' ? 'salary.freqMonthlyWord' : 'salary.freqAnnualWord'))}
                prefix={selectedCountry.currency}
                value={grossSalary}
                onChange={setGrossSalary}
                hint={t('salary.grossHint').replace('{frequency}', t(frequency === 'monthly' ? 'salary.freqMonthlyWord' : 'salary.freqAnnualWord'))}
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
                  <ResultStat label={t('salary.netAnnualTakeHome')} value={formatCurrency(results.netAnnual, results.currency)} emphasis tone="positive" />
                  <ResultStat
                    label={results.paymentsPerYear === 12 ? t('salary.netMonthly') : t('salary.netPerPayment')}
                    value={formatCurrency(
                      results.paymentsPerYear === 12 ? results.netMonthly : results.netPerPayment,
                      results.currency
                    )}
                  />
                  <ResultStat label={t('common.totalDeductions')} value={formatCurrency(results.breakdown.totalDeductions, results.currency)} />
                  <ResultStat label={t('common.effectiveTaxRate')} value={`${results.effectiveRate?.toFixed(1)}%`} />
                </div>

                <Card className="p-5">
                  <PieBreakdownChart
                    title={t('salary.compositionTitle')}
                    items={[
                      { label: t('salary.netTakeHome'), value: results.netAnnual, color: '#10b981' },
                      { label: t('common.totalDeductions'), value: results.breakdown.totalDeductions, color: '#f97316' }
                    ]}
                    formatter={(value) => formatCurrency(value, results.currency)}
                  />
                </Card>

                <Card className="p-5">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">{t('salary.detailedBreakdown')}</h3>
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                    <div className="flex items-center justify-between py-2 text-sm">
                      <span className="font-medium text-ink-soft dark:text-slate-300">{t('salary.grossAnnual')}</span>
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
                      <span className="text-emerald-700 dark:text-emerald-400">{t('salary.netAnnual')}</span>
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
              Run the same €60,000 gross salary through this calculator&rsquo;s euro-denominated systems and the
              spread is startling: about <strong className="text-ink dark:text-white">€46,990 net in the
              Netherlands</strong> (a 21.7% effective rate) against roughly{' '}
              <strong className="text-ink dark:text-white">€37,220 in Belgium</strong>{' '}(38.0%) — a gap of about
              €810 every month for identical pay. Germany (€37,551) sits right beside Belgium, while France
              (€41,149) and Austria (€41,082) land in between, around 31&ndash;32%. Three structural differences, not one, produce that spread, and knowing
              which one drives your own number is what makes a payslip legible.
            </p>

            <h3 className="mt-8 font-display text-lg font-semibold text-ink dark:text-white">The three levers: bands, contributions, credits</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink dark:text-white">Progressive tax bands</strong>{' '}get the headlines, but
                they tax income in slices — the first slice is often free (UK personal allowance £12,570; German
                Grundfreibetrag €12,348; French first band to €11,600), and top rates apply only above high
                thresholds. This is why a UK earner on £50,000 sits in a &ldquo;40% band&rdquo; yet keeps about
                £39,520 — an effective rate of 21%.
              </li>
              <li>
                <strong className="text-ink dark:text-white">Social contributions</strong>{' '}are the quiet giant. In
                Germany, an employee&rsquo;s pension (9.3%), health (~8.75%), unemployment (1.3%), and care (2.4%)
                contributions take more of a €60,000 salary than income tax does — and unlike tax they start from
                the first euro, though they also stop at assessment ceilings. France stacks pension charges and
                CSG to a similar 21%, though most of it is deductible from taxable income. Belgium pulls both levers at once — 13.07% employee social security
                and bands reaching 50% — but its flat-rate professional-expenses deduction and tax-free credit
                claw enough back to land it beside Germany rather than far above it.
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
              than others. France taxes households, not individuals — the <em>quotient familial</em>{' '}splits income
              across family members, so a married earner with children can pay dramatically less than the single
              figure shown. Germany&rsquo;s marital splitting and church tax move numbers both ways; Swiss totals
              swing by canton and commune, and Switzerland here means Zürich (the{' '}
              <a href="/switzerland-salary-calculator" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300">Switzerland calculator</a>{' '}
              covers all 26 cantons). Country-specific pages for{' '}
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

        {/* Country-specific article (dedicated country pages only) */}
        {countryContent && (
          <div className="mt-12 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft dark:text-slate-300">
            {countryContent.article}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">
            {forcedCountry ? `${selectedCountryName} Salary Calculator FAQ` : 'European Salary Calculator FAQ'}
          </h2>
          <div className="mt-4 grid gap-3">
            {activeFaq.map(({ question, answer }) => (
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
              'Switzerland uses official ESTV figures for Zürich (city), age 35–44; the Switzerland calculator covers all 26 cantons',
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
