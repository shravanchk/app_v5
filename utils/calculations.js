// Shared utility functions for calculator applications

/**
 * Format currency values for Indian calculators
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format currency values for European calculators
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (EUR, GBP, USD)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'EUR') => {
  const locale = currency === 'GBP' ? 'en-GB' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format percentage values
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with appropriate suffixes (K, L, Cr)
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted number with suffix
 */
export const formatIndianNumber = (amount) => {
  if (amount >= 10000000) { // 1 Crore
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) { // 1 Lakh
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (amount >= 1000) { // 1 Thousand
    return `₹${(amount / 1000).toFixed(2)} K`;
  }
  return formatINR(amount);
};

/**
 * Validate positive number input
 * @param {number} value - Value to validate
 * @returns {boolean} - True if valid positive number
 */
export const isValidPositiveNumber = (value) => {
  return !isNaN(value) && value > 0 && isFinite(value);
};

/**
 * Calculate GST amount
 * @param {number} amount - Base amount
 * @param {number} gstRate - GST rate percentage
 * @returns {number} - GST amount
 */
export const calculateGST = (amount, gstRate) => {
  return (amount * gstRate) / 100;
};

/**
 * Calculate amount excluding GST
 * @param {number} inclusiveAmount - Amount including GST
 * @param {number} gstRate - GST rate percentage
 * @returns {number} - Amount excluding GST
 */
export const calculateAmountExcludingGST = (inclusiveAmount, gstRate) => {
  return inclusiveAmount / (1 + gstRate / 100);
};

/**
 * Enhanced SEO data generation utility
 * @param {object} seoConfig - SEO configuration object
 * @param {string} seoConfig.title - Page title
 * @param {string} seoConfig.description - Page description
 * @param {string} seoConfig.keywords - SEO keywords
 * @param {string} seoConfig.canonicalUrl - Canonical URL
 * @param {string} seoConfig.ogTitle - Open Graph title
 * @param {string} seoConfig.ogDescription - Open Graph description
 * @param {string} seoConfig.ogImage - Open Graph image
 * @param {string} seoConfig.ogUrl - Open Graph URL
 * @param {string} seoConfig.twitterCard - Twitter card type
 * @param {string} seoConfig.twitterTitle - Twitter title
 * @param {string} seoConfig.twitterDescription - Twitter description
 * @param {string} seoConfig.schemaType - Schema.org type
 * @param {object} seoConfig.schemaData - Structured data
 * @returns {void} - Sets meta tags directly
 */
export const generateSEOData = (...args) => {
  let seoConfig;
  
  // Handle legacy calls with individual parameters
  if (typeof args[0] === 'string') {
    const [title, description, keywords, url] = args;
    seoConfig = {
      title,
      description,
      keywords,
      canonicalUrl: url,
      ogTitle: title,
      ogDescription: description,
      ogUrl: url,
      twitterTitle: title,
      twitterDescription: description
    };
  } else {
    seoConfig = args[0];
  }

  const {
    title,
    description,
    keywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    twitterCard = 'summary_large_image',
    twitterTitle,
    twitterDescription,
    schemaType,
    schemaData
  } = seoConfig;

  // Set document title
  if (title) {
    document.title = title;
  }

  // Set meta description
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;
  }

  // Set meta keywords
  if (keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords;
  }

  // Set canonical URL
  if (canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + canonicalUrl;
  }

  // Set Open Graph meta tags
  const ogTags = {
    'og:title': ogTitle || title,
    'og:description': ogDescription || description,
    'og:type': 'website',
    'og:url': ogUrl ? window.location.origin + ogUrl : window.location.href
  };

  if (ogImage) {
    ogTags['og:image'] = window.location.origin + ogImage;
    ogTags['og:image:width'] = '512';
    ogTags['og:image:height'] = '512';
  }

  Object.entries(ogTags).forEach(([property, content]) => {
    if (content) {
      let metaOg = document.querySelector(`meta[property="${property}"]`);
      if (!metaOg) {
        metaOg = document.createElement('meta');
        metaOg.property = property;
        document.head.appendChild(metaOg);
      }
      metaOg.content = content;
    }
  });

  // Set Twitter Card meta tags
  const twitterTags = {
    'twitter:card': twitterCard,
    'twitter:title': twitterTitle || title,
    'twitter:description': twitterDescription || description
  };

  if (ogImage) {
    twitterTags['twitter:image'] = window.location.origin + ogImage;
  }

  Object.entries(twitterTags).forEach(([name, content]) => {
    if (content) {
      let metaTwitter = document.querySelector(`meta[name="${name}"]`);
      if (!metaTwitter) {
        metaTwitter = document.createElement('meta');
        metaTwitter.name = name;
        document.head.appendChild(metaTwitter);
      }
      metaTwitter.content = content;
    }
  });

  // Set structured data (Schema.org)
  if (schemaData && schemaType) {
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);
  }
};

/**
 * Debounce function for input handling
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Common age calculation utility
 * @param {Date} birthDate - Date of birth
 * @returns {object} - Age breakdown with years, months, days
 */
export const calculateAge = (birthDate) => {
  const now = new Date();
  const birth = new Date(birthDate);
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  
  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  
  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths
  };
};
