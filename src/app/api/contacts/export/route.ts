import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser, unauthorized } from '@/lib/session';

function csvEscape(value: unknown) {
  const stringValue = value == null ? '' : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  const contacts = await prisma.contact.findMany({
    where: { ownerUserId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  const headers = [
    'fullName',
    'email',
    'phone',
    'company',
    'role',
    'location',
    'sourceType',
    'sourceLabel',
    'tags',
    'followUpStatus',
    'followUpDueAt',
    'lastContactedAt',
    'notesFromContact',
    'privateNotes',
    'meetingContext',
    'createdAt'
  ];

  const rows = contacts.map((contact) => [
    contact.fullName,
    contact.email,
    contact.phone,
    contact.company,
    contact.role,
    contact.location,
    contact.sourceType,
    contact.sourceLabel,
    contact.tags.join('; '),
    contact.followUpStatus,
    contact.followUpDueAt?.toISOString() || '',
    contact.lastContactedAt?.toISOString() || '',
    contact.notesFromContact,
    contact.privateNotes,
    contact.meetingContext,
    contact.createdAt.toISOString()
  ].map(csvEscape).join(','));

  const body = [headers.join(','), ...rows].join('\n');
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sparkmeet-contacts.csv"'
    }
  });
}
