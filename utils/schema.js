export const buildSoftwareApplicationSchema = ({
  name,
  url,
  description,
  applicationCategory = 'FinanceApplication',
  operatingSystem = 'Web Browser',
  featureList = [],
  price = '0',
  priceCurrency = 'INR'
}) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name,
  url,
  description,
  applicationCategory,
  operatingSystem,
  offers: {
    '@type': 'Offer',
    price,
    priceCurrency
  },
  ...(featureList.length ? { featureList } : {})
});

export const buildBreadcrumbSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.item
  }))
});
