import React from 'react';
import EuropeanSalaryCalculator from '../europe/EuropeanSalaryCalculator';

const BelgiumSalaryCalculator = () => {
  return (
    <EuropeanSalaryCalculator
      forcedCountry="BE"
      canonicalPath="/belgium-salary-calculator"
      seoTitle="Belgium Salary Calculator 2026 | Net Salary After Tax | Upaman"
      seoDescription="Calculate Belgium net salary from gross pay. Estimate RSZ social security, income tax, the tax-free sum and communal surcharge to get monthly take-home pay."
      seoKeywords="Belgium salary calculator, Belgium net salary calculator, brutto netto Belgie, Belgium tax calculator, take home pay Belgium, loonberekening"
      pageHeading="Belgium Salary Calculator"
      pageSubheading="Estimate net salary after RSZ social security, income tax and the communal surcharge"
    />
  );
};

export default BelgiumSalaryCalculator;
