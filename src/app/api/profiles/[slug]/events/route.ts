import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { z } from 'zod';

type Params = Promise<{ slug: string }>;

const eventSchema = z.object({
  type: z.enum(['profile_view', 'vcard_download', 'link_click', 'contact_submission']),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export async function POST(request: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({
    where: { slug, isPublic: true },
    select: { id: true }
  });

  if (!profile) return NextResponse.json({ ok: true });

  await prisma.profileEvent.create({
    data: {
      profileId: profile.id,
      type: parsed.data.type,
      metadata: (parsed.data.metadata || {}) as Prisma.InputJsonValue
    }
  });

  return NextResponse.json({ ok: true });
}
