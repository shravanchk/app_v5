import React from 'react';
import Head from 'next/head';
import Container from '../ui/Container';
import { editorialProfiles } from '../../utils/editorialProfiles';

// Prose styling mirrors GuidePageLayout so blog posts match the site's editorial
// look and adapt to dark mode via descendant classes (inline styles can't).
const proseCls = [
  'text-[1.02rem] leading-relaxed text-ink-soft dark:text-slate-300',
  '[&_h2]:mt-9 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-ink dark:[&_h2]:text-white',
  '[&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink dark:[&_h3]:text-white',
  '[&_p]:mt-4',
  '[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_li]:marker:text-ink-muted',
  '[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6',
  '[&_strong]:font-semibold [&_strong]:text-ink dark:[&_strong]:text-white',
  '[&_a]:font-medium [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-700 dark:[&_a]:text-brand-300',
  '[&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[0.95rem]',
  '[&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-ink dark:[&_th]:border-slate-700 dark:[&_th]:bg-slate-800 dark:[&_th]:text-white',
  '[&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 dark:[&_td]:border-slate-700'
].join(' ');

const BlogPostLayout = ({
  title,
  description,
  canonicalPath,
  category = 'Money',
  publishedOn,
  updatedOn,
  author = editorialProfiles.researchTeam,
  reviewer = editorialProfiles.financeReviewDesk,
  articleSchema,
  children
}) => {
  return (
    <section className="py-8 sm:py-12">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://upaman.com${canonicalPath}`} />
        <meta property="og:title" content={`${title} | Upaman`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://upaman.com${canonicalPath}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | Upaman`} />
        <meta name="twitter:description" content={description} />
        {articleSchema ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        ) : null}
      </Head>
      <Container>
        <article className="mx-auto max-w-[820px]">
          <p className="text-sm text-ink-muted dark:text-slate-500">
            <a href="/" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">Home</a>
            {' '}&rsaquo;{' '}
            <a href="/blog" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">Blog</a>
          </p>
          <p className="mt-3 text-[0.78rem] font-bold uppercase tracking-[0.06em] text-teal-700 dark:text-teal-300">{category}</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">{title}</h1>
          <p className="mt-2 text-sm italic text-ink-muted dark:text-slate-500">
            Published {publishedOn}
            {updatedOn ? ` • Updated ${updatedOn}` : ''}
            {' • '}By{' '}
            <a href={author.url} className="not-italic font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">{author.label}</a>
            {reviewer ? (
              <>
                {' • Reviewed by '}
                <a href={reviewer.url} className="not-italic font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">{reviewer.label}</a>
              </>
            ) : null}
          </p>
          <div className={`mt-6 ${proseCls}`}>{children}</div>
        </article>
      </Container>
    </section>
  );
};

export default BlogPostLayout;
