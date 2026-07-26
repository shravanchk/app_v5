// Single source of truth for who is accountable for content on this site.
//
// Upaman is operated by one person. The three profiles below are *functions*
// he performs, not separate people or teams — saying so plainly is the point.
// On a YMYL site an unnamed "Review Desk" reads as manufactured authority,
// which is worse for trust than admitting the site is small.

export const SITE_OPERATOR = {
  name: 'Shravan Cherukuri',
  role: 'Software engineer',
  linkedin: 'https://www.linkedin.com/in/ch-shravan-kumar-b6a89974/',
  aboutUrl: '/about',
  contactUrl: '/contact'
};

export const editorialProfiles = {
  researchTeam: {
    label: 'Upaman Research Team',
    url: '/authors/upaman-research-team'
  },
  financeReviewDesk: {
    label: 'Personal Finance Review Desk',
    url: '/authors/personal-finance-review-desk'
  },
  travelReviewDesk: {
    label: 'Travel Utility Review Desk',
    url: '/authors/travel-utility-review-desk'
  }
};

/**
 * ProfilePage + Person JSON-LD for an editorial profile page.
 * `sameAs` carries the LinkedIn link so the profile resolves to a real,
 * verifiable human rather than a site-invented entity.
 */
export const buildProfileSchema = ({ profileUrl, headline, description }) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `https://upaman.com${profileUrl}`,
  url: `https://upaman.com${profileUrl}`,
  name: headline,
  description,
  mainEntity: {
    '@type': 'Person',
    name: SITE_OPERATOR.name,
    jobTitle: SITE_OPERATOR.role,
    url: `https://upaman.com${SITE_OPERATOR.aboutUrl}`,
    sameAs: [SITE_OPERATOR.linkedin],
    worksFor: {
      '@type': 'Organization',
      name: 'Upaman',
      url: 'https://upaman.com/'
    }
  }
});
