import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CalcLayout } from '../../components/calculator/CalcLayout';
import Card from '../../components/ui/Card';
import { BLOG_POSTS } from '../../utils/blogPosts';

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Upaman Blog',
  url: 'https://upaman.com/blog',
  description: 'Data-driven analysis of tax, salary and money decisions across the US, UK, Europe and India.',
  blogPost: BLOG_POSTS.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: `https://upaman.com/blog/${p.slug}`,
    datePublished: p.date,
    description: p.excerpt
  }))
};

export default function BlogIndex() {
  return (
    <>
      <Head>
        <title>Blog | Data-Driven Money Analysis | Upaman</title>
        <meta name="description" content="Timely, data-driven takes on tax, salary and money decisions across the US, UK, Europe and India — every figure computed with Upaman's own calculators." />
        <link rel="canonical" href="https://upaman.com/blog" />
        <meta property="og:title" content="Upaman Blog" />
        <meta property="og:description" content="Data-driven analysis of tax, salary and money decisions across the US, UK, Europe and India." />
        <meta property="og:url" content="https://upaman.com/blog" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      </Head>

      <CalcLayout
        eyebrow="Blog"
        title="The Upaman blog"
        subtitle="Timely, data-driven takes on tax, salary and money decisions — every number computed with our own calculators, not copied from a press release."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {BLOG_POSTS.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
              <Card className="flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-card">
                <div className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.05em] text-teal-700 dark:text-teal-300">
                  <span>{p.category}</span>
                  <span className="text-ink-muted dark:text-slate-500">· {p.dateLabel}</span>
                </div>
                <h2 className="mt-2 font-display text-base font-semibold text-ink dark:text-white">{p.title}</h2>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{p.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-brand-700 dark:text-brand-300">
                  Read post <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </CalcLayout>
    </>
  );
}
