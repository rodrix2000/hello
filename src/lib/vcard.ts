type VCardProfile = {
  displayName: string;
  headline?: string | null;
  company?: string | null;
  role?: string | null;
  location?: string | null;
  primaryCtaUrl?: string | null;
  links?: { platform: string; url: string; isVisible: boolean }[];
};

type VCardContact = {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  location?: string | null;
  notesFromContact?: string | null;
  socialLinksJson?: unknown;
};

function escapeValue(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function line(key: string, value?: string | null) {
  return value ? `${key}:${escapeValue(value)}` : null;
}

export function profileToVCard(profile: VCardProfile, url: string) {
  const email = profile.links?.find((link) => link.isVisible && link.platform === 'email')?.url.replace(/^mailto:/, '');
  const phone = profile.links?.find((link) => link.isVisible && link.platform === 'phone')?.url.replace(/^tel:/, '');
  const website = profile.primaryCtaUrl || profile.links?.find((link) => link.isVisible && ['website', 'portfolio'].includes(link.platform))?.url || url;

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    line('FN', profile.displayName),
    line('TITLE', profile.headline || profile.role),
    line('ORG', profile.company),
    line('EMAIL', email),
    line('TEL', phone),
    line('ADR;TYPE=WORK', profile.location ? `;;;;;;${profile.location}` : null),
    line('URL', website),
    line('NOTE', `SparkMeet profile: ${url}`),
    'END:VCARD'
  ].filter(Boolean).join('\r\n');
}

export function contactToVCard(contact: VCardContact) {
  const socialLinks = contact.socialLinksJson && typeof contact.socialLinksJson === 'object'
    ? Object.values(contact.socialLinksJson as Record<string, unknown>).filter((value): value is string => typeof value === 'string')
    : [];
  const firstUrl = socialLinks[0];

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    line('FN', contact.fullName),
    line('TITLE', contact.role),
    line('ORG', contact.company),
    line('EMAIL', contact.email),
    line('TEL', contact.phone),
    line('ADR;TYPE=WORK', contact.location ? `;;;;;;${contact.location}` : null),
    line('URL', firstUrl),
    line('NOTE', contact.notesFromContact || null),
    'END:VCARD'
  ].filter(Boolean).join('\r\n');
}
