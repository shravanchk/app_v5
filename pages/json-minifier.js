import JsonWorkbench from '../components/tools/json/JsonWorkbench';
import { TOOL_PAGES } from '../components/tools/json/config';

export default function RoutePage() {
  return <JsonWorkbench page={TOOL_PAGES['json-minifier']} />;
}
