import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser, unauthorized } from '@/lib/session';
import { contactToVCard } from '@/lib/vcard';

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, ownerUserId: user.id }
  });

  if (!contact) {
    return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
  }

  return new NextResponse(contactToVCard(contact), {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${contact.fullName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.vcf"`
    }
  });
}
