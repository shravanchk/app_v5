import PageComponent from '../components/india/IncomeTaxCalculator';
import EmbedSnippet from '../components/EmbedSnippet';
import ReportCallout from '../components/india/ReportCallout';

export default function RoutePage() {
  return (
    <>
      <PageComponent />
      <ReportCallout />
      <EmbedSnippet slug="income-tax" height={470} title="Income Tax Calculator FY 2026-27" noun="income tax calculator" />
    </>
  );
}
