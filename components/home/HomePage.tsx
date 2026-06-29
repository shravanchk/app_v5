import React from 'react';
import Head from 'next/head';
import Hero from './Hero';
import StartHere from './StartHere';
import WorkflowCards from './WorkflowCards';
import CalculatorGrid from './CalculatorGrid';
import RegionSection from './RegionSection';
import GuideCards from './GuideCards';
import TrustSection from './TrustSection';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Upaman',
  url: 'https://upaman.com/',
  description: 'Free calculators, comparison tools, workflows and guides to make better financial decisions.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://upaman.com/india-calculators?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Upaman',
  url: 'https://upaman.com/',
  logo: 'https://upaman.com/upaman-elephant-logo.svg',
};

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Upaman — Smart tools for smarter financial decisions</title>
        <meta name="description" content="Free calculators, comparison tools, workflows and guides that help you plan, compare, and make confident financial decisions. Updated for FY 2026-27." />
        <link rel="canonical" href="https://upaman.com/" />
        <meta property="og:title" content="Upaman — Smart tools for smarter financial decisions" />
        <meta property="og:description" content="Calculate, compare, and decide. Free financial calculators, workflows and guides." />
        <meta property="og:url" content="https://upaman.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://upaman.com/upaman-elephant-logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </Head>
      <div className="bg-white font-sans text-ink dark:bg-slate-900">
        <Hero />
        <StartHere />
        <WorkflowCards />
        <CalculatorGrid />
        <RegionSection />
        <GuideCards />
        <TrustSection />
      </div>
    </>
  );
}
