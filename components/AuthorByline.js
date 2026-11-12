import React from 'react';
import Link from 'next/link';
import { SITE_OPERATOR } from '../utils/editorialProfiles';

const fmt = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// Names the person behind a page, with a verifiable profile link. On money
// topics an unnamed byline reads as manufactured authority; a real name with
// a real LinkedIn does not.
export default function AuthorByline({ published, updated, note }) {
  const initials = SITE_OPERATOR.name.split(' ').map((p) => p[0]).join('');
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200/70 bg-white px-4 py-3 text-sm dark:border-slate-700/70 dark:bg-slate-800/70">
      <span aria-hidden className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-xs font-bold text-white">{initials}</span>
      <div className="min-w-0">
        <p className="text-ink dark:text-white">
          By <Link href="/authors/upaman-research-team" rel="author" className="font-semibold underline-offset-2 hover:underline">{SITE_OPERATOR.name}</Link>
          <span className="text-ink-muted dark:text-slate-400"> · {SITE_OPERATOR.role} · </span>
          <a href={SITE_OPERATOR.linkedin} rel="me noopener" target="_blank" className="text-brand-600 underline underline-offset-2 dark:text-brand-300">LinkedIn</a>
        </p>
        <p className="text-xs text-ink-muted dark:text-slate-400">
          Published {fmt(published)}{updated && updated !== published ? ` · Updated ${fmt(updated)}` : ''}{note ? ` · ${note}` : ''}
        </p>
      </div>
    </div>
  );
}
