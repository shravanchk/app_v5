// Every article under the legacy /tutorial/* namespace (e.g. /tutorial/dry-principle).
// The old codebase is gone, so the full slug list is unknown — catch the whole
// namespace rather than enumerating it.
import { onRequestGone } from '../../utils/edge/gone.mjs';

export const onRequest = onRequestGone;
