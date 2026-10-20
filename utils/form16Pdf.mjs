// Opens a Form 16 PDF and returns the text items of each page, for
// utils/form16.js to read. Takes the pdf.js module as an argument: the browser
// passes pdfjs-dist with its worker (loadPdfjs below), the tests pass the Node
// legacy build. Nothing here touches the network — the bytes come from a file
// the user picked, dropped or shared, and stay in memory.

export class Form16PdfError extends Error {
  /** @param {'password' | 'wrong-password' | 'not-pdf' | 'damaged' | 'no-text'} code */
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// pdf.js PasswordResponses.INCORRECT_PASSWORD (1 is NEED_PASSWORD).
const INCORRECT_PASSWORD = 2;

/**
 * @param {typeof import('pdfjs-dist')} pdfjs
 * @param {Uint8Array} bytes
 * @param {string} [password]
 * @returns {Promise<Array<Array<{str: string, transform: number[], width: number, height: number}>>>}
 */
export async function readPdfText(pdfjs, bytes, password) {
  if (String.fromCharCode(...bytes.subarray(0, 5)) !== '%PDF-') {
    throw new Form16PdfError('not-pdf', 'This file is not a PDF.');
  }

  // pdf.js transfers the buffer to its worker; hand it a copy so a retry
  // with a password still has the bytes.
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    password: password || undefined,
    // No fonts or CMaps are fetched: only the text layer is used, and the
    // standard fonts' text extracts without them.
    disableFontFace: true,
    useSystemFonts: false,
    isEvalSupported: false,
    // Errors only: without font data pdf.js warns on every standard font.
    verbosity: 0
  });
  let doc;
  try {
    doc = await task.promise;
  } catch (e) {
    await task.destroy();
    if (e && e.name === 'PasswordException') {
      throw e.code === INCORRECT_PASSWORD
        ? new Form16PdfError('wrong-password', 'That password did not open the PDF.')
        : new Form16PdfError('password', 'This PDF is password-protected.');
    }
    throw new Form16PdfError('damaged', 'This PDF could not be opened. It may be damaged.');
  }

  try {
    const pages = [];
    for (let i = 1; i <= doc.numPages; i += 1) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.filter((it) => 'str' in it));
    }
    if (!pages.some((items) => items.some((it) => it.str.trim()))) {
      throw new Form16PdfError('no-text', 'This PDF has no text layer — it looks like a scan or photo.');
    }
    return pages;
  } finally {
    await task.destroy();
  }
}

let pdfjsPromise = null;

/** pdf.js for the browser, loaded on first use only. */
export function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((m) => {
      // Copied into public/vendor by scripts/copy-vendor.mjs before dev and build.
      m.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.mjs';
      return m;
    });
  }
  return pdfjsPromise;
}
