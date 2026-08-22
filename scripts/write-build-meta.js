#!/usr/bin/env node
/**
 * Compose generated/buildMeta.json from the build clock and a tracked source file.
 *
 * The output used to be edited by hand, so it drifted: it still read 2026-06-28
 * while out/ had been rebuilt on 2026-08-14, and every calculator rendered
 * "Auto-updated on Jun 28, 2026" — a stale freshness claim on pages whose
 * content had in fact moved, contradicting the sitemap's <lastmod>.
 *
 * Only the build stamp is derived. dataFreshness describes when the *market
 * data* was last pulled, which no rebuild changes; stamping it with the build
 * date would manufacture a "Data snapshot: <today>" label out of nothing and
 * defeat the 180-day staleness guard in utils/siteMeta.js that is supposed to
 * hide the label once the underlying data goes cold. So it is not derived — it
 * is read from data/buildMeta.source.json, which is tracked and hand-edited
 * during a data refresh (see DATA_REFRESH_CHECKLIST.md).
 *
 * That split is what lets the output be gitignored: everything in it is either
 * derivable or recoverable from the tracked source. Regenerating it must stay
 * cheap and side-effect-free, because the pre* hooks run it before every build
 * and every dev server.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'data', 'buildMeta.source.json');
const TARGET = path.join(ROOT, 'generated', 'buildMeta.json');

// Only used if the tracked source is missing or unreadable. Nulls rather than
// today's date: utils/siteMeta.js treats an absent latestAvailable as "no data
// snapshot to advertise" and hides the label, which is the honest failure mode.
const FALLBACK = {
  version: '2.0.0',
  dataFreshness: { marketData: null, financialNews: null, latestAvailable: null }
};

function readSource(file) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      version: parsed.version || FALLBACK.version,
      dataFreshness: parsed.dataFreshness || FALLBACK.dataFreshness
    };
  } catch (error) {
    const why = error.code === 'ENOENT' ? 'not found' : error.message;
    console.warn(
      `write-build-meta: ${path.relative(ROOT, file)} ${why} — ` +
        'falling back to null dataFreshness, so the "Data snapshot" label will be hidden'
    );
    return FALLBACK;
  }
}

function main() {
  const { version, dataFreshness } = readSource(SOURCE);
  const now = new Date();

  const meta = {
    buildTimestamp: now.toISOString(),
    buildDate: now.toISOString().slice(0, 10),
    version,
    dataFreshness
  };

  fs.mkdirSync(path.dirname(TARGET), { recursive: true });
  fs.writeFileSync(TARGET, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  console.log(`write-build-meta: buildDate ${meta.buildDate}`);
}

main();
