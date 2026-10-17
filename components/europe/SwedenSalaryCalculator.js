import React from 'react';
import EuropeanSalaryCalculator from '../europe/EuropeanSalaryCalculator';

const SwedenSalaryCalculator = () => {
  return (
    <EuropeanSalaryCalculator
      forcedCountry="SE"
      canonicalPath="/sweden-salary-calculator"
      seoTitle="Sweden Salary Calculator 2026 | Net Salary After Tax | Upaman"
      seoDescription="Calculate Sweden net salary from gross pay. Models the grundavdrag, jobbskatteavdrag, municipal and state tax, and the refunded allmän pensionsavgift."
      seoKeywords="Sweden salary calculator, lön efter skatt, Sweden net salary, jobbskatteavdrag calculator, grundavdrag, take home pay Sweden"
      pageHeading="Sweden Salary Calculator"
      pageSubheading="Estimate net salary after grundavdrag, jobbskatteavdrag and municipal tax"
    />
  );
};

export default SwedenSalaryCalculator;
