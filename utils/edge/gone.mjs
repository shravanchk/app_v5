/**
 * 410 Gone response for pre-revamp URLs.
 *
 * Cloudflare Pages `_redirects` only supports 200/301/302/303/307/308/404, so a
 * genuine 410 has to come from a Pages Function. These paths belonged to the
 * general-interest blog that ran on this domain before the finance rebuild;
 * nothing on the current site is topically equivalent, so 410 is the honest
 * signal and clears the index faster than a 404.
 *
 * Imported by the route handlers in functions/. Kept outside functions/ because
 * every file in that directory is published as a route.
 */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ESCAPES[char]);
}

function page(pathname) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Page Gone | Upaman</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif; padding:2rem; }
  main { max-width:34rem; }
  h1 { font-size:1.5rem; margin:0 0 .75rem; }
  code { font-size:.9em; opacity:.75; }
  ul { padding-left:1.1rem; }
  a { color:#b3261e; }
  @media (prefers-color-scheme: dark) { a { color:#ff8a80; } }
</style>
</head>
<body>
<main>
  <h1>410 &mdash; This page is gone</h1>
  <p><code>${escapeHtml(pathname)}</code> was part of an earlier version of this
     site and has been permanently removed. It has no replacement here.</p>
  <p>Upaman is now a set of free financial calculators and decision workflows:</p>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/india-calculators">India calculators</a></li>
    <li><a href="/us-calculators">US calculators</a></li>
    <li><a href="/eu-calculators">Europe &amp; UK calculators</a></li>
    <li><a href="/guides">Guides</a></li>
  </ul>
</main>
</body>
</html>
`;
}

/**
 * @param {string} pathname - request path, shown back to the visitor
 * @returns {Response} 410 with an HTML body and noindex
 */
export function goneResponse(pathname) {
  return new Response(page(pathname), {
    status: 410,
    statusText: 'Gone',
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}

/** Pages Function handler: always 410, regardless of method. */
export function onRequestGone(context) {
  return goneResponse(new URL(context.request.url).pathname);
}
