import PageComponent from '../components/finance/CompoundInterestCalculator';
import EmbedSnippet from '../components/EmbedSnippet';

export default function RoutePage() {
  return (
    <>
      <PageComponent />
      <EmbedSnippet slug="compound-interest" height={430} title="Compound Interest Calculator" noun="compound interest calculator" />
    </>
  );
}
