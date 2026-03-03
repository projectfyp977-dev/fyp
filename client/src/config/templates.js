/**
 * Template config: HTML path, default template, and fields per template.
 * Templates live in public/templates/ (e.g. /templates/visiting-card/card1.html)
 */
export const DOCUMENT_DEFAULTS = {
  'visiting-card': 'card1',
  poster: 'poster1',
  biographics: 'bio1',
};

export const TEMPLATE_CONFIG = {
  'visiting-card': {
    card1: {
      path: '/templates/visiting-card/card1.html',
      name: 'Card 1',
      fields: ['fullName', 'jobTitle', 'company', 'tagline', 'address', 'phone', 'email', 'website', 'photo'],
    },
    card2: {
      path: '/templates/visiting-card/card2.html',
      name: 'Card 2',
      fields: ['fullName', 'jobTitle', 'company', 'tagline', 'address', 'phone', 'email', 'website', 'photo'],
    },
    card3: {
      path: '/templates/visiting-card/card3.html',
      name: 'Card 3',
      fields: ['fullName', 'jobTitle', 'company', 'tagline', 'address', 'phone', 'email', 'website', 'photo'],
    },
  },
  poster: {
    poster1: {
      path: '/templates/poster/poster1.html',
      name: 'Poster 1',
      fields: ['title', 'fullName', 'tagline', 'body', 'photo', 'website'],
    },
    poster2: {
      path: '/templates/poster/poster2.html',
      name: 'Poster 2',
      fields: ['title', 'company', 'headline', 'subhead', 'website', 'photo'],
    },
    poster3: {
      path: '/templates/poster/poster3.html',
      name: 'Poster 3',
      fields: ['title', 'subtitle', 'body', 'photo'],
    },
  },
  biographics: {
    bio1: {
      path: '/templates/bibliographies/bibliographies1.html',
      name: 'Bio 1',
      fields: ['fullName', 'jobTitle', 'body', 'photo', 'company'],
    },
    bio2: {
      path: '/templates/bibliographies/bibliographies2.html',
      name: 'Bio 2',
      fields: ['fullName', 'jobTitle', 'body', 'photo', 'company'],
    },
    bio3: {
      path: '/templates/bibliographies/bibliographies3.html',
      name: 'Bio 3',
      fields: ['fullName', 'jobTitle', 'body', 'photo', 'company'],
    },
  },
};

/** Get placeholder map: placeholder string -> value from cv */
export function getPlaceholderValues(cv) {
  const p = cv?.personalInfo || {};
  const tagline = cv?.professionalSummary || '';
  const title = cv?.title || p.jobTitle || 'Title';
  return {
    '{{fullName}}': p.fullName || 'Your Name',
    '{{jobTitle}}': p.jobTitle || 'Job Title',
    '{{company}}': p.company || 'Company Name',
    '{{brandName}}': p.company || 'Brand Name',
    '{{tagline}}': tagline || 'Tagline',
    '{{address}}': p.address || 'Address',
    '{{phone}}': p.phone || 'Phone',
    '{{email}}': p.email || 'Email',
    '{{website}}': p.website || 'Website',
    '{{title}}': title,
    '{{headline}}': tagline || 'Headline',
    '{{subhead}}': tagline || 'Subhead',
    '{{body}}': tagline || 'Body text',
    '{{subtitle}}': tagline || 'Subtitle',
    '{{professionalSummary}}': tagline,
    '{{photo}}': p.photo || '',
  };
}

export function getDefaultTemplate(documentType) {
  return DOCUMENT_DEFAULTS[documentType] || 'ats-simple';
}

export function getTemplatePath(documentType, templateId) {
  const config = TEMPLATE_CONFIG[documentType];
  if (!config || !config[templateId]) return null;
  return config[templateId].path;
}

export function getFieldsForTemplate(documentType, templateId) {
  const config = TEMPLATE_CONFIG[documentType];
  if (!config || !config[templateId]) return [];
  return config[templateId].fields || [];
}
