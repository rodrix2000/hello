import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { publicProfileUrl } from '@/lib/urls';
import { profileToVCard } from '@/lib/vcard';

type Params = Promise<{ slug: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const profile = await prisma.profile.findFirst({
    where: { slug, isPublic: true },
    include: {
      links: {
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  await prisma.profileEvent.create({
    data: {
      profileId: profile.id,
      type: 'vcard_download',
      metadata: {}
    }
  });

  const body = profileToVCard(profile, publicProfileUrl(profile.slug));
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${profile.slug}.vcf"`
    }
  });
}
