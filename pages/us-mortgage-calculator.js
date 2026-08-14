import PageComponent from '../components/us/USMortgageCalculator';
import EmbedSnippet from '../components/EmbedSnippet';

export default function RoutePage() {
  return (
    <>
      <PageComponent />
      <EmbedSnippet slug="us-mortgage" height={560} title="US Mortgage Calculator" noun="mortgage calculator" />
    </>
  );
}
