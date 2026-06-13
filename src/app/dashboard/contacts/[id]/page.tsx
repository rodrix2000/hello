import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { formatDateInput, followUpStatuses, statusLabel } from '@/lib/contact';
import { updateContactAction } from '@/app/dashboard/actions';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ saved?: string; error?: string }>;

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'SM';
}

export default async function ContactDetailPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const user = await requireUser();
  if (!user) redirect('/login');
  const { id } = await params;
  const query = await searchParams;

  const contact = await prisma.contact.findFirst({
    where: { id, ownerUserId: user.id },
    include: { sourceProfile: true }
  });

  if (!contact) notFound();

  const updateAction = updateContactAction.bind(null, contact.id);

  return (
    <>
      <div className="dashboardTopbar">
        <div>
          <Link href="/dashboard/contacts" className="muted" style={{ fontWeight: 800 }}>Contacts</Link>
          <p className="dashboardKicker" style={{ marginTop: 12 }}>Contact detail</p>
          <h1 className="dashboardTitle" style={{ marginTop: 8 }}>{contact.fullName}</h1>
          <p className="muted" style={{ margin: '8px 0 0' }}>
            {[contact.company, contact.role].filter(Boolean).join(' - ') || contact.sourceLabel || 'QR profile scan'}
          </p>
        </div>
        <a className="button buttonSecondary" href={`/api/contacts/${contact.id}/vcard`}>Export vCard</a>
      </div>

      {query.saved ? <p className="statusPill statusPillHot" style={{ marginBottom: 12 }}>Contact saved</p> : null}
      {query.error ? <p style={{ color: 'var(--danger)', fontWeight: 800 }}>Unable to save contact changes.</p> : null}

      <div className="detailGrid">
        <section className="card submittedInfo">
          <div className="detailHeader">
            <div className="contactIdentity">
              <span className="contactAvatar">{initials(contact.fullName)}</span>
              <div>
                <h2>Submitted info</h2>
                <p className="muted" style={{ margin: '4px 0 0' }}>Source details from the QR profile scan.</p>
              </div>
            </div>
          </div>
          <div className="infoList">
            {[
              ['Email', contact.email],
              ['Phone', contact.phone],
              ['Company', contact.company],
              ['Role', contact.role],
              ['Location', contact.location],
              ['Source', contact.sourceLabel || contact.sourceType],
              ['Created', contact.createdAt.toLocaleString()]
            ].map(([label, value]) => (
              <div className="infoItem" key={label}>
                <div className="infoLabel">{label}</div>
                <div style={{ overflowWrap: 'anywhere' }}>{value || '-'}</div>
              </div>
            ))}
            {contact.notesFromContact ? (
              <div className="infoItem">
                <div className="infoLabel">Note from contact</div>
                <p style={{ margin: '4px 0 0', lineHeight: 1.5 }}>{contact.notesFromContact}</p>
              </div>
            ) : null}
            <div className="infoItem">
              <div className="infoLabel">Follow-up status</div>
              <span className={contact.followUpStatus === 'needs_follow_up' ? 'statusPill statusPillHot' : 'statusPill'}>{statusLabel(contact.followUpStatus)}</span>
            </div>
          </div>
        </section>

        <form action={updateAction} className="card stack formPanel">
          <h2 style={{ margin: 0 }}>Memory and follow-up</h2>
          <div>
            <label className="label" htmlFor="meetingContext">Meeting context</label>
            <textarea className="textarea" id="meetingContext" name="meetingContext" defaultValue={contact.meetingContext || ''} placeholder="Met at Indie Hackers meetup" />
          </div>
          <div>
            <label className="label" htmlFor="sourceLabel">Source/event label</label>
            <input className="input" id="sourceLabel" name="sourceLabel" defaultValue={contact.sourceLabel || ''} />
          </div>
          <div>
            <label className="label" htmlFor="tags">Tags</label>
            <input className="input" id="tags" name="tags" defaultValue={contact.tags.join(', ')} placeholder="founder, design partner, local" />
          </div>
          <div>
            <label className="label" htmlFor="privateNotes">Private notes</label>
            <textarea className="textarea" id="privateNotes" name="privateNotes" defaultValue={contact.privateNotes || ''} />
          </div>
          <div>
            <label className="label" htmlFor="followUpStatus">Follow-up status</label>
            <select className="select" id="followUpStatus" name="followUpStatus" defaultValue={contact.followUpStatus}>
              {followUpStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </div>
          <div className="formGrid">
            <div>
              <label className="label" htmlFor="followUpDueAt">Follow-up reminder date</label>
              <input className="input" id="followUpDueAt" name="followUpDueAt" type="date" defaultValue={formatDateInput(contact.followUpDueAt)} />
            </div>
            <div>
              <label className="label" htmlFor="lastContactedAt">Last contacted</label>
              <input className="input" id="lastContactedAt" name="lastContactedAt" type="date" defaultValue={formatDateInput(contact.lastContactedAt)} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="manualFollowUpNote">Manual follow-up note</label>
            <textarea className="textarea" id="manualFollowUpNote" name="manualFollowUpNote" defaultValue={contact.manualFollowUpNote || ''} placeholder="Manual follow-up note" />
          </div>
          <button className="button buttonPrimary" type="submit">Save contact memory</button>
        </form>
      </div>
    </>
  );
}
