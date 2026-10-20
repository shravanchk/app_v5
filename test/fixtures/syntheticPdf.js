// Writes small PDFs for the tests: text placed at given positions in
// Helvetica, optionally encrypted with a user password (the standard security
// handler, revision 2: 40-bit RC4, which pdf.js opens). Everything a test
// needs to exercise the real pdf.js text layer without a binary fixture.
const crypto = require('node:crypto');

const PAD = Buffer.from(
  '28bf4e5e4e758a4164004e56fffa01082e2e00b6d0683e802f0ca9fe6453697a',
  'hex'
);

const rc4 = (key, data) => {
  const s = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 0, j = 0; i < 256; i += 1) {
    j = (j + s[i] + key[i % key.length]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  const out = Buffer.alloc(data.length);
  for (let k = 0, i = 0, j = 0; k < data.length; k += 1) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    out[k] = data[k] ^ s[(s[i] + s[j]) & 255];
  }
  return out;
};

const md5 = (...parts) => crypto.createHash('md5').update(Buffer.concat(parts)).digest();
const padded = (pw) => Buffer.concat([Buffer.from(pw, 'latin1'), PAD]).subarray(0, 32);

const escapeText = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

/**
 * @param {Array<Array<{x: number, y: number, text: string, size?: number}>>} pages
 * @param {{ userPassword?: string }} [options]
 * @returns {Uint8Array}
 */
const buildPdf = (pages, { userPassword } = {}) => {
  const id = md5(Buffer.from(JSON.stringify(pages).slice(0, 64)));
  const P = -44;
  let fileKey = null;
  let O = null;
  let U = null;
  if (userPassword !== undefined) {
    O = rc4(md5(padded(`owner-${userPassword}`)).subarray(0, 5), padded(userPassword));
    const p = Buffer.alloc(4);
    p.writeInt32LE(P);
    fileKey = md5(padded(userPassword), O, p, id).subarray(0, 5);
    U = rc4(fileKey, PAD);
  }
  const encrypt = (num, data) => {
    if (!fileKey) return data;
    const k = Buffer.alloc(5);
    k.writeUIntLE(num, 0, 3);
    return rc4(md5(fileKey, k).subarray(0, 10), data);
  };

  // 1 catalog, 2 pages, 3 font, then a page + content pair per page.
  const objects = [];
  const pageIds = pages.map((_, i) => 4 + i * 2);
  objects[1] = Buffer.from('<< /Type /Catalog /Pages 2 0 R >>');
  objects[2] = Buffer.from(`<< /Type /Pages /Kids [${pageIds.map((n) => `${n} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  objects[3] = Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  pages.forEach((entries, i) => {
    const pageId = pageIds[i];
    const contentId = pageId + 1;
    const ops = entries
      .map(({ x, y, text, size = 9 }) => `BT /F1 ${size} Tf ${x} ${y} Td (${escapeText(text)}) Tj ET`)
      .join('\n');
    const stream = encrypt(contentId, Buffer.from(ops, 'latin1'));
    objects[pageId] = Buffer.from(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    objects[contentId] = Buffer.concat([
      Buffer.from(`<< /Length ${stream.length} >>\nstream\n`),
      stream,
      Buffer.from('\nendstream')
    ]);
  });
  let encryptId = null;
  if (fileKey) {
    encryptId = objects.length;
    objects[encryptId] = Buffer.from(
      `<< /Filter /Standard /V 1 /R 2 /O <${O.toString('hex')}> /U <${U.toString('hex')}> /P ${P} >>`
    );
  }

  const chunks = [Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'latin1')];
  let offset = chunks[0].length;
  const offsets = [];
  for (let n = 1; n < objects.length; n += 1) {
    offsets[n] = offset;
    const body = Buffer.concat([Buffer.from(`${n} 0 obj\n`), objects[n], Buffer.from('\nendobj\n')]);
    chunks.push(body);
    offset += body.length;
  }
  const xref = [`xref\n0 ${objects.length}\n`, '0000000000 65535 f \n']
    .concat(offsets.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`))
    .join('');
  const trailer = `trailer\n<< /Size ${objects.length} /Root 1 0 R${encryptId ? ` /Encrypt ${encryptId} 0 R` : ''} /ID [<${id.toString('hex')}> <${id.toString('hex')}>] >>\nstartxref\n${offset}\n%%EOF\n`;
  chunks.push(Buffer.from(xref + trailer));
  return new Uint8Array(Buffer.concat(chunks));
};

module.exports = { buildPdf };
