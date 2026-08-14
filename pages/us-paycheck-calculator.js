import PageComponent from '../components/us/USPaycheckCalculator';
import EmbedSnippet from '../components/EmbedSnippet';

export default function RoutePage() {
  return (
    <>
      <PageComponent />
      <EmbedSnippet slug="us-paycheck" height={520} title="US Paycheck Calculator" noun="paycheck calculator" />
    </>
  );
}
