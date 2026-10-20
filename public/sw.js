/*
 * Upaman service worker. It does one thing: receive files shared into the
 * installed app (the manifest's share_target), so "Share → Upaman" from
 * Files, Gmail or WhatsApp opens the Form 16 reader with the PDF.
 *
 * The share arrives as a POST to /share-target, which never reaches the
 * network: the file is parked in a cache and the reader at
 * /form-16-reader?shared=1 picks it up (utils/sharedFiles.js).
 *
 * Every other request passes straight through — no page caching, so a new
 * deploy is never hidden behind a stale copy.
 */
// Read by utils/sharedFiles.js.
const SHARE_CACHE = 'upaman-share';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method === 'POST' && url.origin === self.location.origin && url.pathname === '/share-target') {
    event.respondWith(receiveShare(req));
  }
});

/** Keeps the shared files (replacing any earlier share) and opens the reader. */
async function receiveShare(req) {
  try {
    const form = await req.formData();
    const files = form.getAll('files').filter((f) => typeof f === 'object' && 'size' in f);
    const cache = await caches.open(SHARE_CACHE);
    for (const key of await cache.keys()) await cache.delete(key);
    await Promise.all(
      files.map((f, i) =>
        cache.put(
          `/__shared/${i}`,
          new Response(f, {
            headers: {
              'content-type': f.type || 'application/octet-stream',
              'x-name': encodeURIComponent(f.name || `shared-${i + 1}.pdf`)
            }
          })
        )
      )
    );
  } catch {
    // The reader says nothing arrived and offers the file picker instead.
  }
  return Response.redirect(new URL('/form-16-reader?shared=1', self.location.origin).href, 303);
}
