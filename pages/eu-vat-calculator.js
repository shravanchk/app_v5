import PageComponent from '../components/europe/VATCalculator';
import EmbedSnippet from '../components/EmbedSnippet';

export default function RoutePage() {
  return (
    <>
      <PageComponent />
      <EmbedSnippet slug="eu-vat" height={460} title="EU VAT Calculator" noun="VAT calculator" />
    </>
  );
}
