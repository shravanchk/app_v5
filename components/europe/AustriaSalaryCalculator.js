import React from 'react';
import EuropeanSalaryCalculator from '../europe/EuropeanSalaryCalculator';

const AustriaSalaryCalculator = () => {
  return (
    <EuropeanSalaryCalculator
      forcedCountry="AT"
      canonicalPath="/austria-salary-calculator"
      seoTitle="Austria Salary Calculator 2026 | Brutto Netto Rechner | Upaman"
      seoDescription="Calculate Austria net salary from Jahresbrutto. Models 14 payments, the 6% rate on the 13th and 14th salary, social-security ceilings and the Verkehrsabsetzbetrag."
      seoKeywords="Austria salary calculator, brutto netto rechner, Austria net salary, Jahresbrutto calculator, 13th 14th salary Austria, take home pay Austria"
      pageHeading="Austria Salary Calculator"
      pageSubheading="Estimate net salary across all 14 payments, including the 13th and 14th at the 6% rate"
    />
  );
};

export default AustriaSalaryCalculator;
