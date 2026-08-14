import en from './en';
import hi from './hi';
import bn from './bn';
import mr from './mr';
import ta from './ta';
import te from './te';

// Keyed by locale code from ../locales. Every table is bundled: the dictionaries
// are a few KB each, and code-splitting them would put a network round-trip
// between the reader and their own language on a static-hosted page.
const strings = { en, hi, bn, mr, ta, te };

export default strings;
