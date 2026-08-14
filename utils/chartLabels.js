// Label-fitting maths for the donut chart's centre figure. Pure — no React, no
// DOM — so it can be unit-tested and so it works during static export, where
// there is no getBBox to measure real text with.

// The donut hole is 56 units wide in a 120-unit viewBox; 48 leaves padding so
// the label never touches the ring.
const HOLE_WIDTH = 48;
const BASE_FONT_SIZE = 10;
// The SVG renders between 132px and 168px wide for that 120-unit viewBox, so a
// unit is roughly 1.1-1.4 real pixels. Below 8 units the label would render
// under ~9px on a phone; abbreviate rather than shrink past that.
const MIN_FONT_SIZE = 8;
// Measured against the site's font: roughly 0.47 x fontSize per character for
// digits and separators.
const CHAR_WIDTH_RATIO = 0.47;

const fitFontSize = (text) =>
  Math.min(BASE_FONT_SIZE, HOLE_WIDTH / (Math.max(1, String(text).length) * CHAR_WIDTH_RATIO));

const estimatedWidth = (text, fontSize) => String(text).length * CHAR_WIDTH_RATIO * fontSize;

// Falls back to lakh/crore for rupees and K/M/B otherwise, taking the symbol
// from whatever the caller's formatter already produced so this stays
// currency-agnostic.
const compactAmount = (value, formatted) => {
  // Strip a leading minus before reading the symbol, or a negative total would
  // match the empty prefix and silently lose its currency.
  const unsigned = String(formatted).replace(/^-/, '');
  const symbol = (unsigned.match(/^[^\d]*/) || [''])[0];
  const sign = value < 0 ? '-' : '';
  const units = symbol.includes('₹')
    ? [[1e7, ' Cr'], [1e5, ' L'], [1e3, 'K']]
    : [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
  const abs = Math.abs(value);

  for (const [size, suffix] of units) {
    if (abs >= size) {
      const scaled = abs / size;
      const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
      return `${sign}${symbol}${scaled.toFixed(decimals)}${suffix}`;
    }
  }
  return formatted;
};

// Returns the label to draw and the size to draw it at. Renders the exact
// figure whenever it fits legibly, and abbreviates only when it will not.
const fitCentreLabel = (value, formatted) => {
  let label = formatted;
  let fontSize = fitFontSize(label);

  if (fontSize < MIN_FONT_SIZE) {
    label = compactAmount(value, formatted);
    // Past about a lakh crore even the abbreviation runs long. Hold the floor
    // rather than shrink to unreadable — legibility matters more than a hair
    // of overflow at magnitudes no real salary or loan reaches.
    fontSize = Math.max(MIN_FONT_SIZE, fitFontSize(label));
  }

  return { label, fontSize };
};

module.exports = {
  HOLE_WIDTH,
  BASE_FONT_SIZE,
  MIN_FONT_SIZE,
  fitFontSize,
  estimatedWidth,
  compactAmount,
  fitCentreLabel
};
