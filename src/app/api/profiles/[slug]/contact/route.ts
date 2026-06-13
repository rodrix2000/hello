import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { publicContactSchema } from '@/lib/validation';

type Params = Promise<{ slug: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const parsed = publicContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter at least your name and valid contact details.' }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({
    where: { slug, isPublic: true },
    select: { id: true, ownerUserId: true, displayName: true }
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  const contact = await prisma.contact.create({
    data: {
      ownerUserId: profile.ownerUserId,
      sourceProfileId: profile.id,
      fullName: parsed.data.fullName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      role: parsed.data.role || null,
      location: parsed.data.location || null,
      notesFromContact: parsed.data.notesFromContact || null,
      sourceType: 'qr_profile_scan',
      sourceLabel: `QR profile scan: ${profile.displayName}`,
      socialLinksJson: parsed.data.socialLink ? { submitted: parsed.data.socialLink } : {}
    }
  });

  await prisma.profileEvent.create({
    data: {
      profileId: profile.id,
      type: 'contact_submission',
      metadata: { contactId: contact.id }
    }
  });

  return NextResponse.json({ ok: true });
}
