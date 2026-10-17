import PageComponent from '../components/tools/dates/BusinessDaysCalculator';

export default function RoutePage({ year }) {
  return <PageComponent year={year} />;
}

// The working-days table is for the year the site was built in; each deploy
// rolls it forward.
export async function getStaticProps() {
  return { props: { year: new Date().getUTCFullYear() } };
}
