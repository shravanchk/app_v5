import PageComponent from '../components/us/US401kCalculator';
import EmbedSnippet from '../components/EmbedSnippet';

export default function RoutePage() {
  return (
    <>
      <PageComponent />
      <EmbedSnippet slug="us-401k" height={560} title="401(k) Calculator" noun="401(k) calculator" />
    </>
  );
}
