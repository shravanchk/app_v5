// Files shared into the installed app from another app's share sheet.
//
// The service worker (public/sw.js) receives the share, parks the files in
// the "upaman-share" cache and opens /form-16-reader?shared=1, which takes
// them from here. Nothing in this round trip touches the network.

const CACHE = 'upaman-share';

const index = (url) => Number(url.split('/').pop()) || 0;

async function peekShared() {
  if (typeof caches === 'undefined') return [];
  try {
    const cache = await caches.open(CACHE);
    const keys = [...(await cache.keys())].sort((a, b) => index(a.url) - index(b.url));
    const files = [];
    for (const k of keys) {
      const res = await cache.match(k);
      if (!res) continue;
      const blob = await res.blob();
      const name = decodeURIComponent(res.headers.get('x-name') || '') || `shared-${files.length + 1}`;
      files.push(new File([blob], name, { type: blob.type }));
    }
    return files;
  } catch {
    return [];
  }
}

let pending = null;

/**
 * The files shared for this page, or null when it wasn't opened with
 * `?shared=1`. Read once per address, so a component that mounts twice
 * (React strict mode in development) gets the same files.
 */
export function sharedFiles() {
  if (typeof window === 'undefined' || !new URLSearchParams(window.location.search).has('shared')) return null;
  if (!pending || pending.href !== window.location.href) pending = { href: window.location.href, files: peekShared() };
  return pending.files;
}

/** Once the files are open: empty the cache and drop `shared=1`, so a reload doesn't bring them back. */
export function consumeShared() {
  pending = null;
  if (typeof caches !== 'undefined') caches.delete(CACHE).catch(() => {});
  const url = new URL(window.location.href);
  url.searchParams.delete('shared');
  window.history.replaceState(window.history.state, '', url);
}

export const isPdf = (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
