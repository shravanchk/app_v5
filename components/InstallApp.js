import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone } from 'lucide-react';
import { promptInstall, useInstallState } from '../utils/install';
import { cn } from './ui/cn';

const IOS_STEPS = [
  'Tap the Share button in Safari’s toolbar.',
  'Scroll down and tap “Add to Home Screen”.',
  'Tap “Add”. Upaman opens from your home screen like an app.'
];

/**
 * "Install the app", wherever the browser can install it: a link in the
 * footer, or a fuller prompt on the Form 16 reader (where installing is what
 * puts Upaman in the share sheet). On iPhone it explains Add to Home Screen,
 * since Safari has no install prompt. Renders nothing once installed.
 */
export default function InstallApp({ variant = 'link', className = '' }) {
  const state = useInstallState();
  const [help, setHelp] = useState(false);

  if (state === 'none') return null;
  const onClick = () => (state === 'prompt' ? promptInstall() : setHelp(true));

  return (
    <>
      {variant === 'card' ? (
        <div className={cn('flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-sm dark:border-brand-800/60 dark:bg-brand-900/20 sm:flex-row sm:items-center', className)}>
          <Smartphone size={20} className="shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
          <p className="flex-1 text-ink-soft dark:text-slate-300">
            {state === 'prompt'
              ? 'Install Upaman and it appears in your share sheet: share a Form 16 from Files, Gmail or WhatsApp straight to this reader.'
              : 'Add Upaman to your home screen for one-tap access. (iPhone doesn’t let web apps receive shared files, so choose the PDF here.)'}
          </p>
          <button type="button" onClick={onClick} className="rounded-lg bg-brand-600 px-3.5 py-2 font-semibold text-white hover:bg-brand-700">
            Install app
          </button>
        </div>
      ) : (
        <button type="button" onClick={onClick} className={cn('inline-flex items-center gap-1.5 hover:text-brand-700 dark:hover:text-white', className)}>
          <Smartphone size={13} aria-hidden />
          Install app
        </button>
      )}
      {help && createPortal(<IosHelp onClose={() => setHelp(false)} />, document.body)}
    </>
  );
}

function IosHelp({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ink shadow-xl dark:bg-slate-900 dark:text-slate-100"
      >
        <h2 id="ios-install-title" className="font-display text-lg font-bold">Add Upaman to your home screen</h2>
        <ol className="mt-4 space-y-3 text-sm">
          {IOS_STEPS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">{i + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        <button type="button" onClick={onClose} className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
          Close
        </button>
      </div>
    </div>
  );
}
