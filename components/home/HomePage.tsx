import React from 'react';
import Head from 'next/head';
import Hero from './Hero';
import StartHere from './StartHere';
import WorkflowCards from './WorkflowCards';
import CalculatorGrid from './CalculatorGrid';
import RegionSection from './RegionSection';
import GuideCards from './GuideCards';
import TrustSection from './TrustSection';
import Reveal from '../ui/Reveal';

// No SearchAction: site search is a client-side modal with no ?q= results
// page, and declaring a non-functional target hurts more than omitting it.
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Upaman',
  url: 'https://upaman.com/',
  description: 'Free calculators, comparison tools, workflows and guides to make better financial decisions.',
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
        <meta key="og:image" property="og:image" content="https://upaman.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </Head>
      <div className="bg-white font-sans text-ink dark:bg-slate-900">
        <Hero />
        <Reveal><StartHere /></Reveal>
        <Reveal><RegionSection /></Reveal>
        <Reveal><WorkflowCards /></Reveal>
        <Reveal><CalculatorGrid /></Reveal>
        <Reveal><GuideCards /></Reveal>
        <Reveal><TrustSection /></Reveal>
      </div>
    </>
  );
}
