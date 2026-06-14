import { z } from 'zod';

export const linkPlatforms = [
  'x',
  'linkedin',
  'website',
  'email',
  'phone',
  'calendly',
  'github',
  'instagram',
  'youtube',
  'tiktok',
  'newsletter',
  'discord',
  'threads',
  'bluesky',
  'podcast',
  'portfolio',
  'resume',
  'media_kit',
  'custom'
] as const;

const optionalUrl = z.string().trim().url().or(z.literal('')).optional();
const optionalImageValue = z.string().trim().max(2_200_000).refine((value) => {
  if (!value) return true;
  if (z.string().url().safeParse(value).success) return true;
  return /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(value);
}).optional();

export const signupSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export const profileSchema = z.object({
  slug: z.string().trim().toLowerCase().min(3).max(48).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  displayName: z.string().trim().min(1).max(120),
  headline: z.string().trim().max(180).optional(),
  bioShort: z.string().trim().max(600).optional(),
  profilePhotoUrl: optionalImageValue,
  company: z.string().trim().max(120).optional(),
  role: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  contactPreference: z.string().trim().max(240).optional(),
  primaryCtaLabel: z.string().trim().max(80).optional(),
  primaryCtaUrl: optionalUrl,
  isPublic: z.boolean(),
  links: z.array(z.object({
    platform: z.enum(linkPlatforms),
    label: z.string().trim().min(1).max(80),
    url: z.string().trim().min(1).max(500),
    sortOrder: z.number().int().min(0),
    isVisible: z.boolean()
  })).max(24)
});

export const publicContactSchema = z.object({
  fullName: z.string().trim().min(1).max(140),
  email: z.string().trim().email().or(z.literal('')).optional(),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(120).optional(),
  role: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  socialLink: z.string().trim().max(500).optional(),
  notesFromContact: z.string().trim().max(1000).optional()
});

export const contactUpdateSchema = z.object({
  privateNotes: z.string().trim().max(3000).optional(),
  meetingContext: z.string().trim().max(1000).optional(),
  sourceLabel: z.string().trim().max(140).optional(),
  tags: z.string().trim().max(500).optional(),
  followUpStatus: z.enum(['not_started', 'needs_follow_up', 'followed_up', 'no_follow_up_needed']),
  followUpDueAt: z.string().trim().optional(),
  lastContactedAt: z.string().trim().optional(),
  manualFollowUpNote: z.string().trim().max(3000).optional()
});
