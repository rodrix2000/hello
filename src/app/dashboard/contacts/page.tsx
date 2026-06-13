import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { statusLabel } from '@/lib/contact';

type SearchParams = Promise<{ q?: string; status?: string }>;

const statuses = [
  ['all', 'All'],
  ['not_started', 'Not started'],
  ['needs_follow_up', 'Needs follow-up'],
  ['followed_up', 'Followed up'],
  ['no_follow_up_needed', 'No follow-up needed']
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'SM';
}

export default async function ContactsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  if (!user) redirect('/login');
  const params = await searchParams;
  const q = (params.q || '').trim();
  const status = params.status || 'all';

  const where: Prisma.ContactWhereInput = {
    ownerUserId: user.id,
    ...(status !== 'all' ? { followUpStatus: status } : {}),
    ...(q ? {
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { role: { contains: q, mode: 'insensitive' } },
        { sourceLabel: { contains: q, mode: 'insensitive' } },
        { notesFromContact: { contains: q, mode: 'insensitive' } },
        { privateNotes: { contains: q, mode: 'insensitive' } },
        { meetingContext: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } }
      ]
    } : {})
  };

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return (
    <>
      <div className="dashboardTopbar">
        <div>
          <p className="dashboardKicker">Contact memory</p>
          <h1 className="dashboardTitle">Contacts</h1>
          <p className="muted" style={{ margin: '8px 0 0' }}>Search by name, tag, source/event, or notes.</p>
        </div>
        <a className="button buttonSecondary" href="/api/contacts/export">Export CSV</a>
      </div>

      <form className="card contactSearchForm">
        <input className="input" name="q" defaultValue={q} placeholder="Search contacts, tags, notes, event..." />
        <select className="select" name="status" defaultValue={status}>
          {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button className="button buttonPrimary" type="submit">Search</button>
      </form>

      <div className="tableList">
        {contacts.length ? contacts.map((contact) => (
          <Link className="rowLink" key={contact.id} href={`/dashboard/contacts/${contact.id}`}>
            <div className="contactIdentity">
              <span className="contactAvatar">{initials(contact.fullName)}</span>
              <div>
                <strong>{contact.fullName}</strong>
                <p className="muted" style={{ margin: '5px 0 8px' }}>
                  {[contact.company, contact.role, contact.sourceLabel].filter(Boolean).join(' - ') || 'QR profile scan'}
                </p>
                <div className="tagList">
                  {contact.tags.slice(0, 4).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
                </div>
              </div>
            </div>
            <span className={contact.followUpStatus === 'needs_follow_up' ? 'statusPill statusPillHot' : 'statusPill'}>
              {statusLabel(contact.followUpStatus)}
            </span>
          </Link>
        )) : (
          <div className="card emptyState">
            <h2 style={{ margin: '0 0 8px' }}>No contacts yet</h2>
            <p className="muted" style={{ margin: 0 }}>Show your QR at an event. Submitted info will appear here.</p>
          </div>
        )}
      </div>
    </>
  );
}
