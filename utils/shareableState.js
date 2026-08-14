// Keeps calculator inputs in the URL so a shared or bookmarked link reproduces
// the numbers the user actually entered. Before this, every Share/Copy action
// in ResultActions emitted a bare calculator URL and the recipient landed on an
// empty form.
//
// Only values that differ from the calculator's defaults are written, so a
// pristine page keeps a clean URL and a shared link carries just the changed
// inputs. Query keys the calculator does not own (utm_*, gclid, ref) are left
// untouched — campaign attribution has to survive a recalculation.
//
// Every page hardcodes an absolute rel="canonical" to its clean path, so the
// parameterised variants collapse back to one indexable URL.

const { useEffect, useRef } = require('react');

// Reads the calculator's own params out of a query string. Values stay raw strings.
const collectSharedValues = (search, defaults) => {
  const params = new URLSearchParams(search || '');
  const shared = {};

  Object.keys(defaults).forEach((key) => {
    const raw = params.get(key);
    if (raw !== null && raw !== '') shared[key] = raw;
  });

  return shared;
};

// Rebuilds the query string: drops the calculator's keys that are back at their
// default, keeps everything else already in the URL.
const buildShareQuery = (values, defaults, existingSearch) => {
  const params = new URLSearchParams(existingSearch || '');

  Object.keys(defaults).forEach((key) => params.delete(key));

  Object.entries(values).forEach(([key, value]) => {
    if (!(key in defaults)) return;
    if (value === null || value === undefined || value === '') return;
    if (String(value) === String(defaults[key])) return;
    params.set(key, String(value));
  });

  return params.toString();
};

// Coerces a shared value to a finite number, falling back when it is junk.
const toNumber = (raw, fallback) => {
  if (raw === null || raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Coerces a shared value to one of a fixed set of options (tabs, modes, frequencies).
const toOption = (raw, allowed, fallback) => (allowed.includes(raw) ? raw : fallback);

// Several calculators hold their numeric fields as strings so the input can be
// cleared. This keeps that string form while rejecting anything non-numeric.
const toNumericString = (raw, fallback) => {
  if (raw === null || raw === undefined || raw === '') return fallback;
  return Number.isFinite(Number(raw)) ? String(raw) : fallback;
};

// Coerces a shared value to a boolean. Accepts the "1"/"0" form the URL writer emits.
const toBoolean = (raw, fallback) => {
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return fallback;
};

// Rebuilds a state object from shared strings, picking the coercion from the
// type of each default. `options` constrains individual string fields to a
// known set so a hand-edited URL cannot push a calculator into an unhandled
// branch (asset classes, regimes, frequencies).
const restoreValues = (previous, shared, defaults, options = {}) => {
  const restored = { ...previous };

  Object.entries(shared).forEach(([key, raw]) => {
    if (!(key in defaults)) return;
    const fallback = defaults[key];

    if (typeof fallback === 'number') {
      restored[key] = toNumber(raw, fallback);
    } else if (typeof fallback === 'boolean') {
      restored[key] = toBoolean(raw, fallback);
    } else if (options[key]) {
      restored[key] = toOption(raw, options[key], fallback);
    } else {
      restored[key] = raw;
    }
  });

  return restored;
};

// Some calculators hold a variable-length list (debts, accounts) rather than a
// fixed set of fields. These pack one into a single param as `a~b~c|a~b~c`.
// Cells are percent-encoded, and `~` is escaped explicitly because
// encodeURIComponent leaves it alone — otherwise a name containing one would
// split into extra columns.
const ROW_SEPARATOR = '|';
const CELL_SEPARATOR = '~';

const encodeRows = (rows, fields) =>
  rows
    .map((row) =>
      fields
        .map((field) => encodeURIComponent(row[field] === undefined ? '' : row[field]).replace(/~/g, '%7E'))
        .join(CELL_SEPARATOR)
    )
    .join(ROW_SEPARATOR);

// `limit` bounds how much work a hand-written URL can ask for.
const decodeRows = (raw, fields, limit = 20) => {
  if (!raw) return [];

  return raw
    .split(ROW_SEPARATOR)
    .slice(0, limit)
    .map((chunk) => {
      const cells = chunk.split(CELL_SEPARATOR);
      if (cells.length !== fields.length) return null;

      const row = {};
      fields.forEach((field, index) => {
        try {
          row[field] = decodeURIComponent(cells[index]);
        } catch (error) {
          row[field] = cells[index];
        }
      });
      return row;
    })
    .filter(Boolean);
};

const WRITE_DELAY_MS = 300;

// Two-way binding between calculator state and the query string.
//
// `defaults` must be a module-level constant — it defines which keys the
// calculator owns and is read once on mount to decide what to restore.
// `onRestore` receives a raw string map; coerce it with the helpers above.
const useShareableState = ({ values, defaults, onRestore }) => {
  const restoredRef = useRef(false);
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const shared = collectSharedValues(window.location.search, defaults);
    if (Object.keys(shared).length) onRestoreRef.current(shared);
    // `defaults` is a module constant; restoring once on mount is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const serialized = JSON.stringify(values);

  useEffect(() => {
    if (!restoredRef.current) return undefined;

    const timer = window.setTimeout(() => {
      const query = buildShareQuery(values, defaults, window.location.search);
      const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;

      // Analytics enhanced measurement fires a page_view on history changes and
      // reads the live URL, which now holds the user's salary or loan balance.
      // Pin the reported location to the redacted form before we write.
      if (typeof window.gtag === 'function' && typeof window.upamanCleanLocation === 'function') {
        window.gtag('set', { page_location: window.upamanCleanLocation() });
      }

      window.history.replaceState(window.history.state, '', next);
    }, WRITE_DELAY_MS);

    return () => window.clearTimeout(timer);
    // `serialized` stands in for `values` so re-renders with equal input don't rewrite the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);
};

module.exports = {
  collectSharedValues,
  buildShareQuery,
  restoreValues,
  encodeRows,
  decodeRows,
  toNumber,
  toNumericString,
  toOption,
  toBoolean,
  useShareableState
};
