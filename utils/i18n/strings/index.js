import inEn from './in/en';
import inHi from './in/hi';
import inBn from './in/bn';
import inMr from './in/mr';
import inTa from './in/ta';
import inTe from './in/te';

import euEn from './eu/en';
import euDe from './eu/de';
import euFr from './eu/fr';
import euEs from './eu/es';

// Keyed by region, then locale code. Every table is bundled: the dictionaries
// are a few KB each, and code-splitting them would put a network round-trip
// between the reader and their own language on a static-hosted page.
const strings = {
  in: { en: inEn, hi: inHi, bn: inBn, mr: inMr, ta: inTa, te: inTe },
  eu: { en: euEn, de: euDe, fr: euFr, es: euEs },
};

export default strings;
