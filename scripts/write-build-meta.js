#!/usr/bin/env node
/**
 * Stamp generated/buildMeta.json with the current build time.
 *
 * The file used to be edited by hand, so it drifted: it still read 2026-06-28
 * while out/ had been rebuilt on 2026-08-14, and every calculator rendered
 * "Auto-updated on Jun 28, 2026" — a stale freshness claim on pages whose
 * content had in fact moved, contradicting the sitemap's <lastmod>.
 *
 * Only the build stamp is derived. dataFreshness describes when the *market
 * data* was last pulled, which no rebuild changes; overwriting it with the
 * build date would manufacture a "Data snapshot: <today>" label out of nothing
 * and defeat the 180-day staleness guard in utils/siteMeta.js that is supposed
 * to hide the label once the underlying data goes cold. It stays hand-managed,
 * and is carried through untouched.
 */

const fs = require('fs');
const path = require('path');

const TARGET = path.join(__dirname, '..', 'generated', 'buildMeta.json');

const FALLBACK_DATA_FRESHNESS = {
  marketData: null,
  financialNews: null,
  latestAvailable: null
};

function readExisting(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      // A corrupt file is worth knowing about; a missing one is just a fresh checkout.
      console.warn(`write-build-meta: could not parse ${path.basename(file)} (${error.message}) — rebuilding it`);
    }
    return {};
  }
}

function main() {
  const existing = readExisting(TARGET);
  const now = new Date();

  const next = {
    ...existing,
    buildTimestamp: now.toISOString(),
    buildDate: now.toISOString().slice(0, 10),
    version: existing.version || '2.0.0',
    dataFreshness: existing.dataFreshness || FALLBACK_DATA_FRESHNESS
  };

  fs.mkdirSync(path.dirname(TARGET), { recursive: true });
  fs.writeFileSync(TARGET, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log(`write-build-meta: buildDate ${next.buildDate}`);
}

main();
