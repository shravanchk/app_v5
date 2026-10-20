const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const {
  linesFromItems,
  parseAmount,
  parseForm16,
  compareRegimesFromForm16,
  taxYearForAssessmentYear
} = require('../utils/form16');
const { sample1, sample2, sample3, blankPdf } = require('./fixtures/form16Samples');

// The same reader the page uses, run on the Node build of pdf.js.
const load = async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { readPdfText } = await import(pathToFileURL(path.join(__dirname, '../utils/form16Pdf.mjs')).href);
  return (bytes, password) => readPdfText(pdfjs, bytes, password);
};

const read = async (bytes, password) => parseForm16(linesFromItems(await (await load())(bytes, password)));

test('amounts: Indian and Western grouping, negatives, and section numbers rejected', () => {
  assert.equal(parseAmount('1,23,456.00'), 123456);
  assert.equal(parseAmount('12,34,56,789'), 123456789);
  assert.equal(parseAmount('1,234,567.5'), 1234567.5);
  assert.equal(parseAmount('Rs. 50,000'), 50000);
  assert.equal(parseAmount('-2,00,000.00'), -200000);
  assert.equal(parseAmount('(2,00,000.00)'), -200000);
  assert.equal(parseAmount('0.00'), 0);
  for (const notAmount of ['17(1)', '80C', '2025-26', '1,2,3', '12,3456', 'Rs.', '(1B)', '10(13A)']) {
    assert.equal(parseAmount(notAmount), null, notAmount);
  }
});

test('Form 16 (TRACES layout) is read field by field', async () => {
  const r = await read(sample1());
  assert.equal(r.assessmentYear, '2026-27');
  assert.equal(r.tan, 'MUMS12345A');
  assert.equal(r.employerRegime, 'old');
  assert.deepEqual(r.fields, {
    salary171: 1740000,
    perquisites172: 60000,
    profits173: 50000,
    grossSalary: 1850000,
    otherEmployerSalary: 0,
    hra: 240000,
    lta: 30000,
    totalExemptions: 270000,
    standardDeduction: 50000,
    professionalTax: 2500,
    // Printed level with the middle of a two-line label, on a line of its own.
    houseProperty: -200000,
    otherSources: 12000,
    // The deductible column (10(d)), not the ₹1,62,000 gross.
    section80C: 150000,
    section80CCD1B: 50000,
    section80CCD2: 0,
    section80D: 25000,
    section80E: 0,
    // Its label runs into the amount column in this sample.
    section80G: 0,
    section80TTA: 10000,
    otherChapterVIA: 0,
    totalChapterVIA: 235000,
    taxableIncome: 1104500,
    taxOnIncome: 143850,
    // Part A's quarterly total (amount deducted), not the challan table's ₹99,999.
    tds: 149600
  });
});

test('a password-protected Form 16 asks for the password, rejects a wrong one, and reads with the right one', async () => {
  const open = await load();
  const locked = sample1({ userPassword: 'abcpe1234k' });
  await assert.rejects(open(locked), { code: 'password' });
  await assert.rejects(open(locked, 'ABCPE1234K'), { code: 'wrong-password' });
  const r = parseForm16(linesFromItems(await open(locked, 'abcpe1234k')));
  assert.equal(r.fields.grossSalary, 1850000);
  assert.equal(r.fields.tds, 149600);
});

test('rows the form leaves out stay empty, not zero', async () => {
  const r = await read(sample2());
  assert.equal(r.assessmentYear, '2027-28');
  assert.equal(r.tan, 'BLRT54321C');
  assert.equal(r.employerRegime, 'new');
  assert.equal(r.fields.grossSalary, 1200000);
  assert.equal(r.fields.section80C, 0); // printed as 0.00
  assert.equal(r.fields.tds, 0);
  for (const k of ['hra', 'lta', 'houseProperty', 'otherSources', 'section80CCD1B', 'section80D', 'section80TTA', 'otherEmployerSalary']) {
    assert.equal(r.fields[k], null, k);
  }
});

test('an employer-made Part B: missing rows, a blank HRA amount and no Part A are never guessed', async () => {
  const r = await read(sample3());
  assert.equal(r.fields.salary171, 980000);
  assert.equal(r.fields.standardDeduction, 50000);
  assert.equal(r.fields.section80C, 120000);
  // No "(d) Total" row: the gross is not filled from 17(1).
  assert.equal(r.fields.grossSalary, null);
  // The HRA row is there with no amount, and the next row's figure is not borrowed.
  assert.equal(r.fields.hra, null);
  assert.equal(r.fields.tds, null);
  assert.equal(r.assessmentYear, null);
  assert.equal(r.tan, null);
  assert.equal(r.employerRegime, null);
});

test('a PDF with no text layer and a file that is not a PDF are refused', async () => {
  const open = await load();
  await assert.rejects(open(blankPdf()), { code: 'no-text' });
  await assert.rejects(open(new TextEncoder().encode('hello, not a pdf')), { code: 'not-pdf' });
});

test('assessment year maps to the engine year, and unknown years map to nothing', () => {
  assert.equal(taxYearForAssessmentYear('2026-27'), '2025-26');
  assert.equal(taxYearForAssessmentYear('2027-28'), '2026-27');
  assert.equal(taxYearForAssessmentYear('2019-20'), null);
  assert.equal(taxYearForAssessmentYear(null), null);
});

test('regime comparison from sample 1 matches the form and hand-worked slabs', async () => {
  const { fields } = await read(sample1());
  const c = compareRegimesFromForm16(fields, { taxYear: '2025-26' });

  // Old: 18,50,000 − 2,70,000 − 50,000 − 2,500 − 2,00,000 + 12,000 − 2,35,000.
  assert.equal(c.old.taxable, 1104500);
  // 12,500 + 1,00,000 + 31,350 = 1,43,850; +4% cess = 1,49,604 → ₹10 rounding. Line 17 of the form says 1,49,604.
  assert.equal(c.old.slabTax, 143850);
  assert.equal(c.old.totalTax, 149600);

  // New: 18,50,000 − 75,000 + 12,000; no HRA, PT, house loss or 80C.
  assert.equal(c.new.taxable, 1787000);
  // 20,000 + 40,000 + 60,000 + 37,400 = 1,57,400; +4% = 1,63,696.
  assert.equal(c.new.slabTax, 157400);
  assert.equal(c.new.totalTax, 163700);

  assert.equal(c.better, 'old');
  assert.equal(c.saving, 14100);
  // Old already wins, so the break-even is how much it could give up and still tie.
  assert.ok(c.breakEven < 0);
  const giveUp = (amount) => compareRegimesFromForm16({ ...fields, otherChapterVIA: -amount }, { taxYear: '2025-26' }).old.totalTax;
  assert.ok(giveUp(-c.breakEven) <= c.new.totalTax);
  assert.ok(giveUp(-c.breakEven + 200) > c.new.totalTax, 'within a ₹100 step of the tie');
});

test('new regime employee: break-even says how much more the old regime needs', async () => {
  const { fields } = await read(sample2());
  const c = compareRegimesFromForm16(fields, { taxYear: '2026-27' });
  // ₹12,00,000 − 75,000 = 11,25,000: inside the 87A rebate, so ₹0.
  assert.equal(c.new.totalTax, 0);
  assert.equal(c.better, 'new');
  // Old regime would need taxable income down to ₹5,00,000 for its own rebate.
  assert.equal(c.old.taxable, 1150000);
  assert.ok(c.breakEven >= 650000 && c.breakEven <= 650100, String(c.breakEven));
  // Unused 80C, 80CCD(1B) and 80D room is listed, and filling it would not flip the answer.
  assert.equal(c.totalRoom, 150000 + 50000 + 25000);
  assert.equal(c.filledFlips, false);
});

test('gross salary falls back to the sum of the 17(x) parts, and says so; no gross at all gives no comparison', () => {
  const base = { salary171: 1000000, perquisites172: 20000, profits173: null, grossSalary: null };
  const c = compareRegimesFromForm16(base, { taxYear: '2026-27' });
  assert.equal(c.gross, 1020000);
  assert.equal(c.grossDerived, true);
  assert.match(c.old.lines[0].label, /17\(1\)/);
  assert.equal(compareRegimesFromForm16({ salary171: null, grossSalary: null }), null);
});

test('old-regime caps: 80C at ₹1.5 lakh, 80CCD(1B) at ₹50,000, house loss at ₹2 lakh', () => {
  const c = compareRegimesFromForm16({
    grossSalary: 2000000,
    section80C: 300000,
    section80CCD1B: 90000,
    houseProperty: -350000
  }, { taxYear: '2026-27' });
  // 20,00,000 − 50,000 − 2,00,000 − 1,50,000 − 50,000.
  assert.equal(c.old.taxable, 1550000);
});
