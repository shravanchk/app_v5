import PageComponent from '../components/india/SIPCalculator';
import EmbedSnippet from '../components/EmbedSnippet';

export default function RoutePage() {
  return (
    <>
      <PageComponent />
      <EmbedSnippet slug="sip" height={400} title="SIP Calculator" noun="SIP calculator" />
    </>
  );
}
