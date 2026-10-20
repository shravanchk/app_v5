// Synthetic Form 16s laid out like the TRACES download: Part A (deductor,
// assessment year, quarterly TDS) and Part B (the salary computation), with
// the row markers, wrapped labels and two amount columns the real one has.
// Every name, PAN, TAN and figure here is invented.
const { buildPdf } = require('./syntheticPdf');

const LINE = 12;

/** Lays rows out top-down. A row's label may wrap; `mid` prints its amounts level with the middle line. */
const layout = (rows, top = 800) => {
  const entries = [];
  let y = top;
  for (const row of rows) {
    const label = Array.isArray(row.label) ? row.label : [row.label];
    if (row.marker) entries.push({ x: 36, y, text: row.marker });
    label.forEach((text, i) => entries.push({ x: 60, y: y - i * LINE, text }));
    const amountY = row.mid ? y - Math.floor(label.length / 2) * LINE - LINE / 2 : y;
    for (const [x, text] of row.cells || []) entries.push({ x, y: amountY, text });
    y -= label.length * LINE + 4;
  }
  return entries;
};

const INNER = 360;
const GROSS = 430;
const OUTER = 505;

const partA = ({ ay = '2026-27', tan = 'MUMS12345A', tds } = {}) =>
  layout([
    { label: 'FORM NO. 16' },
    { label: '[See rule 31(1)(a)]' },
    { label: 'Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salary' },
    { label: 'PART A' },
    { label: 'Name and address of the Employer/Specified Bank', cells: [[330, 'Name and address of the Employee']] },
    { label: 'EXAMPLE SOFTWARE PVT LTD, 1 TEST ROAD, PUNE', cells: [[330, 'A SAMPLE EMPLOYEE, PUNE']] },
    { label: 'PAN of the Deductor', cells: [[200, 'TAN of the Deductor'], [330, 'PAN of the Employee']] },
    { label: 'AAACE1234Q', cells: [[200, tan], [330, 'ABCPE1234K']] },
    ...(ay
      ? [
          { label: 'CIT (TDS)', cells: [[330, 'Assessment Year'], [430, 'Period with the Employer']] },
          { label: 'Pune', cells: [[330, ay], [430, 'From 01-Apr-2025 To 31-Mar-2026']] }
        ]
      : []),
    { label: 'Summary of amount paid/credited and tax deducted at source thereon in respect of the employee' },
    { label: 'Quarter(s)', cells: [[110, 'Receipt Numbers'], [250, 'Amount paid/credited'], [360, 'Amount of tax deducted'], [470, 'Amount of tax deposited']] },
    ...(tds
      ? [
          { label: 'Q1', cells: [[110, 'QQAAAAAA'], [250, tds.paid[0]], [360, tds.deducted[0]], [470, tds.deducted[0]]] },
          { label: 'Q2', cells: [[110, 'QQBBBBBB'], [250, tds.paid[1]], [360, tds.deducted[1]], [470, tds.deducted[1]]] },
          { label: 'Total (Rs.)', cells: [[250, tds.paid[2]], [360, tds.deducted[2]], [470, tds.deducted[2]]] }
        ]
      : []),
    // The challan table's total has one amount, so it must not be read as TDS.
    { label: 'I. DETAILS OF TAX DEDUCTED AND DEPOSITED IN THE CENTRAL GOVERNMENT ACCOUNT THROUGH CHALLAN' },
    { label: 'Total (Rs.)', cells: [[250, '99,999.00']] }
  ]);

// Sample 1: a metro employee in the old regime with HRA, full 80C, 80D,
// own NPS, professional tax and a home-loan interest loss.
const sample1Rows = [
  { label: 'PART B (Annexure)' },
  { label: 'Details of Salary Paid and any other income and tax deducted' },
  { label: 'Whether opting out of taxation u/s 115BAC?', cells: [[OUTER, 'Yes']] },
  { marker: '1.', label: 'Gross Salary', cells: [[INNER, 'Rs.'], [OUTER, 'Rs.']] },
  { marker: '(a)', label: 'Salary as per provisions contained in section 17(1)', cells: [[INNER, '17,40,000.00']] },
  { marker: '(b)', label: ['Value of perquisites under section 17(2) (as per Form No. 12BA,', 'wherever applicable)'], cells: [[INNER, '60,000.00']] },
  { marker: '(c)', label: ['Profits in lieu of salary under section 17(3) (as per Form No.', '12BA, wherever applicable)'], cells: [[INNER, '50,000.00']] },
  { marker: '(d)', label: 'Total', cells: [[OUTER, '18,50,000.00']] },
  { marker: '(e)', label: 'Reported total amount of salary received from other employer(s)', cells: [[OUTER, '0.00']] },
  { marker: '2.', label: 'Less: Allowances to the extent exempt under section 10' },
  { marker: '(a)', label: 'Travel concession or assistance under section 10(5)', cells: [[INNER, '30,000.00']] },
  { marker: '(b)', label: 'Death-cum-retirement gratuity under section 10(10)', cells: [[INNER, '0.00']] },
  { marker: '(e)', label: 'House rent allowance under section 10(13A)', cells: [[INNER, '2,40,000.00']] },
  { marker: '(h)', label: ['Total amount of exemption claimed under section 10', '[2(a)+2(b)+2(c)+2(d)+2(e)+2(g)]'], cells: [[OUTER, '2,70,000.00']] },
  { marker: '3.', label: 'Total amount of salary received from current employer [1(d)-2(h)]', cells: [[OUTER, '15,80,000.00']] },
  { marker: '4.', label: 'Less: Deductions under section 16' },
  { marker: '(a)', label: 'Standard deduction under section 16(ia)', cells: [[INNER, '50,000.00']] },
  { marker: '(b)', label: 'Entertainment allowance under section 16(ii)', cells: [[INNER, '0.00']] },
  { marker: '(c)', label: 'Tax on employment under section 16(iii)', cells: [[INNER, '2,500.00']] },
  { marker: '5.', label: 'Total amount of deductions under section 16 [4(a)+4(b)+4(c)]', cells: [[OUTER, '52,500.00']] },
  { marker: '6.', label: 'Income chargeable under the head "Salaries" [(3+1(e)-5]', cells: [[OUTER, '15,27,500.00']] },
  { marker: '7.', label: 'Add: Any other income reported by the employee under as per section 192 (2B)' },
  { marker: '(a)', label: ['Income (or admissible loss) from house property reported by', 'employee offered for TDS'], cells: [[INNER, '-2,00,000.00']], mid: true },
  { marker: '(b)', label: 'Income under the head Other Sources offered for TDS', cells: [[INNER, '12,000.00']] },
  { marker: '8.', label: 'Total amount of other income reported by the employee [7(a)+7(b)]', cells: [[OUTER, '-1,88,000.00']] },
  { marker: '9.', label: 'Gross total income (6+8)', cells: [[OUTER, '13,39,500.00']] },
  { marker: '10.', label: 'Deductions under Chapter VI-A', cells: [[GROSS, 'Gross Amount'], [OUTER, 'Deductible Amount']] },
  { marker: '(a)', label: ['Deduction in respect of life insurance premia, contributions to', 'provident fund etc. under section 80C'], cells: [[GROSS, '1,62,000.00'], [OUTER, '1,50,000.00']] },
  { marker: '(b)', label: 'Deduction in respect of contribution to certain pension funds under section 80CCC', cells: [[GROSS, '0.00'], [OUTER, '0.00']] },
  { marker: '(c)', label: ['Deduction in respect of contribution by taxpayer to pension', 'scheme under section 80CCD (1)'], cells: [[GROSS, '0.00'], [OUTER, '0.00']] },
  { marker: '(d)', label: 'Total deduction under section 80C, 80CCC and 80CCD(1)', cells: [[GROSS, '1,62,000.00'], [OUTER, '1,50,000.00']] },
  { marker: '(e)', label: ['Deductions in respect of amount paid/deposited to notified', 'pension scheme under section 80CCD (1B)'], cells: [[GROSS, '50,000.00'], [OUTER, '50,000.00']] },
  { marker: '(f)', label: ['Deduction in respect of contribution by Employer to pension', 'scheme under section 80CCD (2)'], cells: [[GROSS, '0.00'], [OUTER, '0.00']] },
  { marker: '(g)', label: ['Deduction in respect of health insurance premia under section', '80D'], cells: [[GROSS, '25,000.00'], [OUTER, '25,000.00']] },
  { marker: '(h)', label: 'Deduction in respect of interest on loan taken for higher education under section 80E', cells: [[GROSS, '0.00'], [OUTER, '0.00']] },
  { marker: '(j)', label: 'Total deduction in respect of donations to certain funds, charitable institutions, etc. under section 80G', cells: [[GROSS, '0.00'], [OUTER, '0.00']] },
  { marker: '(k)', label: 'Deduction in respect of interest on deposits in savings account under section 80TTA', cells: [[GROSS, '10,000.00'], [OUTER, '10,000.00']] },
  { marker: '(m)', label: 'Total of amount deductible under any other provision(s) of Chapter VI-A', cells: [[OUTER, '0.00']] },
  { marker: '11.', label: 'Aggregate of deductible amount under Chapter VI-A [10(d)+10(e)+...+10(m)]', cells: [[OUTER, '2,35,000.00']] },
  { marker: '12.', label: 'Total taxable income (9-11)', cells: [[OUTER, '11,04,500.00']] },
  { marker: '13.', label: 'Tax on total income', cells: [[OUTER, '1,43,850.00']] },
  { marker: '14.', label: 'Rebate under section 87A, if applicable', cells: [[OUTER, '0.00']] },
  { marker: '16.', label: 'Health and education cess', cells: [[OUTER, '5,754.00']] },
  { marker: '17.', label: 'Tax payable (13+15+16-14)', cells: [[OUTER, '1,49,604.00']] }
];

const sample1 = (options) => buildPdf(
  [
    partA({ tds: { paid: ['9,25,000.00', '9,25,000.00', '18,50,000.00'], deducted: ['74,800.00', '74,800.00', '1,49,600.00'] } }),
    layout(sample1Rows)
  ],
  options
);

// Sample 2: a new-regime employee; Chapter VI-A rows present but all zero.
const sample2 = () => buildPdf([
  partA({ ay: '2027-28', tan: 'BLRT54321C', tds: { paid: ['6,00,000.00', '6,00,000.00', '12,00,000.00'], deducted: ['0.00', '0.00', '0.00'] } }),
  layout([
    { label: 'PART B (Annexure)' },
    { label: 'Whether opting out of taxation u/s 115BAC?', cells: [[OUTER, 'No']] },
    { marker: '1.', label: 'Gross Salary' },
    { marker: '(a)', label: 'Salary as per provisions contained in section 17(1)', cells: [[INNER, '12,00,000.00']] },
    { marker: '(b)', label: 'Value of perquisites under section 17(2)', cells: [[INNER, '0.00']] },
    { marker: '(c)', label: 'Profits in lieu of salary under section 17(3)', cells: [[INNER, '0.00']] },
    { marker: '(d)', label: 'Total', cells: [[OUTER, '12,00,000.00']] },
    { marker: '2.', label: 'Less: Allowances to the extent exempt under section 10' },
    { marker: '(h)', label: 'Total amount of exemption claimed under section 10', cells: [[OUTER, '0.00']] },
    { marker: '4.', label: 'Less: Deductions under section 16' },
    { marker: '(a)', label: 'Standard deduction under section 16(ia)', cells: [[INNER, '75,000.00']] },
    { marker: '(c)', label: 'Tax on employment under section 16(iii)', cells: [[INNER, '0.00']] },
    { marker: '10.', label: 'Deductions under Chapter VI-A' },
    { marker: '(d)', label: 'Total deduction under section 80C, 80CCC and 80CCD(1)', cells: [[GROSS, '0.00'], [OUTER, '0.00']] },
    { marker: '(f)', label: 'Deduction in respect of contribution by Employer to pension scheme under section 80CCD (2)', cells: [[GROSS, '0.00'], [OUTER, '0.00']] },
    { marker: '12.', label: 'Total taxable income (9-11)', cells: [[OUTER, '11,25,000.00']] }
  ])
]);

// Sample 3: an employer's own Part B, not the TRACES layout — no Part A, no
// gross total row, no 80CCD(1B)/80D rows, plain unformatted amounts and an
// HRA row with its label but a blank amount. What isn't there must stay empty.
const sample3 = () => buildPdf([
  layout([
    { label: 'Form No. 16 - Part B' },
    { label: 'Assessment Year: to be confirmed' },
    { marker: '1.', label: 'Gross Salary' },
    { marker: '(a)', label: 'Salary as per section 17(1)', cells: [[OUTER, '980000']] },
    { marker: '2.', label: 'Less: Allowance to the extent exempt u/s 10' },
    { marker: '(a)', label: 'House rent allowance under section 10(13A)' },
    { marker: '4.', label: 'Deductions under section 16' },
    { marker: '(a)', label: 'Standard deduction', cells: [[OUTER, '50000']] },
    { marker: '10.', label: 'Deductions under Chapter VI-A' },
    { marker: '(a)', label: 'Total deduction under section 80C, 80CCC and 80CCD(1)', cells: [[OUTER, '120000']] }
  ])
]);

// Not a Form 16 text layer at all: one page with no text (a scan, say).
const blankPdf = () => buildPdf([[]]);

module.exports = { sample1, sample2, sample3, blankPdf };
