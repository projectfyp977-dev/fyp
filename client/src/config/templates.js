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
      fields: ['fullName', 'jobTitle', 'company', 'tagline', 'address', 'phone', 'email', 'website', 'photo', 'logo'],
    },
    card2: {
      path: '/templates/visiting-card/card2.html',
      name: 'Card 2',
      fields: ['fullName', 'jobTitle', 'company', 'tagline', 'address', 'phone', 'email', 'website', 'photo', 'logo'],
    },
    card3: {
      path: '/templates/visiting-card/card3.html',
      name: 'Card 3',
      fields: ['fullName', 'jobTitle', 'company', 'tagline', 'address', 'phone', 'email', 'website', 'photo', 'logo'],
    },
  },
  poster: {
    poster1: {
      path: '/templates/poster/poster1.html',
      name: 'Poster 1',
      fields: ['title', 'fullName', 'company', 'subtitle', 'body', 'photo', 'website'],
    },
    poster2: {
      path: '/templates/poster/poster2.html',
      name: 'Poster 2',
      fields: ['title', 'company', 'headline', 'subtitle', 'body', 'website', 'photo'],
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
      fields: ['fullName', 'jobTitle', 'body', 'photo', 'company', 'platform'],
    },
    bio2: {
      path: '/templates/bibliographies/bibliographies2.html',
      name: 'Bio 2',
      fields: ['fullName', 'jobTitle', 'body', 'photo', 'company', 'platform'],
    },
    bio3: {
      path: '/templates/bibliographies/bibliographies3.html',
      name: 'Bio 3',
      fields: ['fullName', 'jobTitle', 'body', 'photo', 'company', 'platform'],
    },
  },
};

const LOGO_DEFAULTS = {
  card1: '<svg class="logo-1" viewBox="0 0 120 120" fill="none"><path d="M60 6 L114 60 L60 114 L6 60 L60 6Z" stroke="var(--cyan,#13bde8)" stroke-width="10" fill="white"/><path d="M26 60 L60 26 L94 60" stroke="var(--cyan,#13bde8)" stroke-width="10" stroke-linecap="round"/></svg>',
  card2: '<svg class="hex-logo" viewBox="0 0 120 120" fill="none"><path d="M60 6 L106 33 L106 87 L60 114 L14 87 L14 33 L60 6Z" stroke="white" stroke-width="3"/></svg>',
  card3: '<svg class="double-circle-logo-white" viewBox="0 0 160 120" fill="white"><circle cx="45" cy="75" r="35"/><circle cx="115" cy="45" r="35"/><rect x="60" y="45" width="40" height="30" fill="#00272e"/></svg>',
};

/** Get placeholder map: placeholder string -> value from cv. Pass templateId for visiting-card logo default. */
export function getPlaceholderValues(cv, templateId) {
  const p = cv?.personalInfo || {};
  const tagline = cv?.professionalSummary || '';
  const title = cv?.title || p.jobTitle || 'Title';
  const logoOrPhoto = p.logo || p.photo;
  const logoImg = logoOrPhoto
    ? `<img src="${logoOrPhoto}" alt="Logo" class="logo-img" style="max-width:110px;max-height:80px;object-fit:contain;margin-bottom:1rem;" onerror="this.style.display='none'"/>`
    : (LOGO_DEFAULTS[templateId] || LOGO_DEFAULTS.card1);
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
    '{{body}}': tagline || 'Body text',
    '{{subtitle}}': (p.posterSubtitle || '').toString().trim() || 'Subtitle',
    '{{headline}}': (p.posterHeadline || tagline || title || 'Headline').toString().trim(),
    '{{subhead}}': (p.posterSubtitle || '').toString().trim() || 'Subhead',
    '{{professionalSummary}}': tagline,
    '{{platform}}': (p.platform || cv?.platform || 'Platform').toString().trim() || 'Platform',
    '{{photo}}': p.photo || '',
    '{{logo}}': p.logo || p.photo || '',
    '{{logoImg}}': logoImg,
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
