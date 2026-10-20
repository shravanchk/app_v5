import { useSyncExternalStore } from 'react';

// Whether, and how, this browser can install Upaman as an app.
//
// - 'prompt': Chrome/Edge/Samsung offered an install prompt; ours shows it.
// - 'ios':    iPhone or iPad, where installing is Share → Add to Home Screen
//             and no browser offers a prompt (and the share target doesn't
//             work: iOS doesn't support it for web apps).
// - 'none':   already installed, or the browser can't install web apps.
//
// The listener is registered when this module loads — the footer imports it,
// so that's on every page — because the browser fires beforeinstallprompt
// once, early, and doesn't repeat it.

let deferred = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Hold it for our button instead of Chrome's own mini-infobar.
    e.preventDefault();
    deferred = e;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    emit();
  });
}

function state() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone) return 'none';
  if (deferred) return 'prompt';
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  return ios ? 'ios' : 'none';
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useInstallState = () => useSyncExternalStore(subscribe, state, () => 'none');

/** Shows the browser's install prompt. */
export async function promptInstall() {
  const e = deferred;
  if (!e) return;
  deferred = null;
  await e.prompt().catch(() => {});
  emit();
}
