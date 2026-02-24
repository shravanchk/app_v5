import React from 'react';
import EuropeanSalaryCalculator from './EuropeanSalaryCalculator';

const FranceSalaryCalculator = () => {
  return (
    <EuropeanSalaryCalculator
      forcedCountry="FR"
      canonicalPath="/france-salary-calculator"
      seoTitle="France Salary Calculator 2026 | Net Salary After Tax | Upaman"
      seoDescription="Calculate France net salary from gross pay. Estimate income tax, social contributions, and monthly take-home pay using current model assumptions."
      seoKeywords="France salary calculator, France net salary calculator, salaire net calculator, France tax calculator, take home pay France"
      pageHeading="France Salary Calculator"
      pageSubheading="Estimate net salary after income tax and social contributions"
    />
  );
};

export default FranceSalaryCalculator;
