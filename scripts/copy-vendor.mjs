// Files the browser loads from a URL at run time, which a static export has
// no bundler to serve. Copied into public/vendor/ (gitignored) before dev and
// build, so each stays locked to the installed library's version.
//
// - pdf.js parses PDFs (the Form 16 reader) in a Web Worker.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const pkgDir = (name) => dirname(require.resolve(`${name}/package.json`));

mkdirSync('public/vendor', { recursive: true });
copyFileSync(join(pkgDir('pdfjs-dist'), 'build/pdf.worker.min.mjs'), 'public/vendor/pdf.worker.min.mjs');
