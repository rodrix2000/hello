export const platformLabels: Record<string, string> = {
  x: 'X',
  linkedin: 'LinkedIn',
  website: 'Website',
  email: 'Email',
  phone: 'Phone',
  calendly: 'Calendly',
  github: 'GitHub',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  newsletter: 'Newsletter',
  discord: 'Discord',
  threads: 'Threads',
  bluesky: 'Bluesky',
  podcast: 'Podcast',
  portfolio: 'Portfolio',
  resume: 'Resume',
  media_kit: 'Media kit',
  custom: 'Custom'
};

export const defaultProfileLinks = [
  { platform: 'linkedin', label: 'LinkedIn', url: '', sortOrder: 0, isVisible: true },
  { platform: 'website', label: 'Website', url: '', sortOrder: 1, isVisible: true },
  { platform: 'email', label: 'Email', url: '', sortOrder: 2, isVisible: true },
  { platform: 'calendly', label: 'Calendly', url: '', sortOrder: 3, isVisible: true },
  { platform: 'github', label: 'GitHub', url: '', sortOrder: 4, isVisible: true },
  { platform: 'custom', label: 'Custom', url: '', sortOrder: 5, isVisible: true }
];
