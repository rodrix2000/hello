'use server';

import { Buffer } from 'node:buffer';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { contactUpdateSchema, linkPlatforms, profileSchema } from '@/lib/validation';
import { parseTags } from '@/lib/contact';

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim();
}

function optionalDate(value: string) {
  return value ? new Date(`${value}T12:00:00.000Z`) : null;
}

async function uploadedProfilePhoto(formData: FormData) {
  const file = formData.get('profilePhotoFile');
  if (!(file instanceof File) || file.size === 0) return '';

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  const maxBytes = 1.5 * 1024 * 1024;
  if (!allowedTypes.includes(file.type) || file.size > maxBytes) {
    redirect('/dashboard/profile?error=image');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

async function getRequiredUserId() {
  const user = await requireUser();
  if (!user?.id) redirect('/login');
  return user.id;
}

export async function saveProfileAction(formData: FormData) {
  const userId = await getRequiredUserId();
  const profilePhotoUrl = await uploadedProfilePhoto(formData) || formValue(formData, 'profilePhotoUrl');
  const links = linkPlatforms.map((platform, index) => {
    const label = formValue(formData, `link_${platform}_label`);
    const url = formValue(formData, `link_${platform}_url`);
    const visible = formData.get(`link_${platform}_visible`) === 'on';
    return {
      platform,
      label: label || platform,
      url,
      sortOrder: index,
      isVisible: visible
    };
  }).filter((link) => link.url);

  const parsed = profileSchema.safeParse({
    slug: formValue(formData, 'slug'),
    displayName: formValue(formData, 'displayName'),
    headline: formValue(formData, 'headline'),
    bioShort: formValue(formData, 'bioShort'),
    profilePhotoUrl,
    company: formValue(formData, 'company'),
    role: formValue(formData, 'role'),
    location: formValue(formData, 'location'),
    contactPreference: formValue(formData, 'contactPreference'),
    primaryCtaLabel: formValue(formData, 'primaryCtaLabel'),
    primaryCtaUrl: formValue(formData, 'primaryCtaUrl'),
    isPublic: formData.get('isPublic') === 'on',
    links
  });

  if (!parsed.success) {
    redirect('/dashboard/profile?error=profile');
  }

  const existingSlug = await prisma.profile.findUnique({
    where: { slug: parsed.data.slug },
    select: { ownerUserId: true }
  });
  if (existingSlug && existingSlug.ownerUserId !== userId) {
    redirect('/dashboard/profile?error=slug');
  }

  await prisma.profile.upsert({
    where: { ownerUserId: userId },
    update: {
      slug: parsed.data.slug,
      displayName: parsed.data.displayName,
      headline: parsed.data.headline || null,
      bioShort: parsed.data.bioShort || null,
      profilePhotoUrl: parsed.data.profilePhotoUrl || null,
      company: parsed.data.company || null,
      role: parsed.data.role || null,
      location: parsed.data.location || null,
      contactPreference: parsed.data.contactPreference || null,
      primaryCtaLabel: parsed.data.primaryCtaLabel || null,
      primaryCtaUrl: parsed.data.primaryCtaUrl || null,
      isPublic: parsed.data.isPublic,
      links: {
        deleteMany: {},
        create: parsed.data.links
      }
    },
    create: {
      ownerUserId: userId,
      slug: parsed.data.slug,
      displayName: parsed.data.displayName,
      headline: parsed.data.headline || null,
      bioShort: parsed.data.bioShort || null,
      profilePhotoUrl: parsed.data.profilePhotoUrl || null,
      company: parsed.data.company || null,
      role: parsed.data.role || null,
      location: parsed.data.location || null,
      contactPreference: parsed.data.contactPreference || null,
      primaryCtaLabel: parsed.data.primaryCtaLabel || null,
      primaryCtaUrl: parsed.data.primaryCtaUrl || null,
      isPublic: parsed.data.isPublic,
      links: {
        create: parsed.data.links
      }
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/profile');
  revalidatePath(`/r/${parsed.data.slug}`);
  redirect('/dashboard/profile?saved=1');
}

export async function updateContactAction(contactId: string, formData: FormData) {
  const userId = await getRequiredUserId();
  const parsed = contactUpdateSchema.safeParse({
    privateNotes: formValue(formData, 'privateNotes'),
    meetingContext: formValue(formData, 'meetingContext'),
    sourceLabel: formValue(formData, 'sourceLabel'),
    tags: formValue(formData, 'tags'),
    followUpStatus: formValue(formData, 'followUpStatus') || 'not_started',
    followUpDueAt: formValue(formData, 'followUpDueAt'),
    lastContactedAt: formValue(formData, 'lastContactedAt'),
    manualFollowUpNote: formValue(formData, 'manualFollowUpNote')
  });

  if (!parsed.success) redirect(`/dashboard/contacts/${contactId}?error=contact`);

  await prisma.contact.updateMany({
    where: { id: contactId, ownerUserId: userId },
    data: {
      privateNotes: parsed.data.privateNotes || null,
      meetingContext: parsed.data.meetingContext || null,
      sourceLabel: parsed.data.sourceLabel || null,
      tags: parseTags(parsed.data.tags),
      followUpStatus: parsed.data.followUpStatus,
      followUpDueAt: optionalDate(parsed.data.followUpDueAt || ''),
      lastContactedAt: optionalDate(parsed.data.lastContactedAt || ''),
      manualFollowUpNote: parsed.data.manualFollowUpNote || null
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/contacts');
  revalidatePath(`/dashboard/contacts/${contactId}`);
  redirect(`/dashboard/contacts/${contactId}?saved=1`);
}

export async function updateSettingsAction(formData: FormData) {
  const userId = await getRequiredUserId();
  const name = formValue(formData, 'name');
  const email = formValue(formData, 'email').toLowerCase();
  const password = formValue(formData, 'password');

  if (!email) redirect('/dashboard/settings?error=settings');

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || null,
      email,
      ...(password ? { password: await bcrypt.hash(password, 12) } : {})
    }
  });

  revalidatePath('/dashboard/settings');
  redirect('/dashboard/settings?saved=1');
}
