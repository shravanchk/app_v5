import React from 'react';
import EuropeanSalaryCalculator from './EuropeanSalaryCalculator';

const GermanySalaryCalculator = () => {
  return (
    <EuropeanSalaryCalculator
      forcedCountry="DE"
      canonicalPath="/germany-salary-calculator"
      seoTitle="Germany Salary Calculator 2026 | Net Salary After Tax | Upaman"
      seoDescription="Calculate Germany net salary from gross annual or monthly pay. Estimate income tax, social security, solidarity surcharge, and take-home pay."
      seoKeywords="Germany salary calculator, Germany net salary calculator, brutto netto rechner, Germany income tax calculator, take home pay Germany"
      pageHeading="Germany Salary Calculator"
      pageSubheading="Estimate net salary after tax, social insurance, and solidarity surcharge"
    />
  );
};

export default GermanySalaryCalculator;
