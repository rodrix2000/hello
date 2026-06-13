import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { publicProfileUrl } from '@/lib/urls';
import { statusLabel } from '@/lib/contact';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'SM';
}

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect('/login');

  const profile = await prisma.profile.findUnique({
    where: { ownerUserId: user.id },
    include: { links: true }
  });

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const [contactsThisWeek, followUps, recentContacts, eventCounts] = await Promise.all([
    prisma.contact.count({ where: { ownerUserId: user.id, createdAt: { gte: weekAgo } } }),
    prisma.contact.findMany({
      where: { ownerUserId: user.id, followUpStatus: 'needs_follow_up' },
      orderBy: [{ followUpDueAt: 'asc' }, { createdAt: 'desc' }],
      take: 5
    }),
    prisma.contact.findMany({
      where: { ownerUserId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 6
    }),
    profile ? prisma.profileEvent.groupBy({
      by: ['type'],
      where: { profileId: profile.id },
      _count: true
    }) : Promise.resolve([])
  ]);

  const metricMap = Object.fromEntries(eventCounts.map((event) => [event.type, event._count]));
  const metrics = [
    ['PV', 'Profile views', metricMap.profile_view || 0],
    ['VC', 'Save-contact clicks', metricMap.vcard_download || 0],
    ['LC', 'Link clicks', metricMap.link_click || 0],
    ['IN', 'Submissions', metricMap.contact_submission || 0]
  ];

  return (
    <>
      <div className="dashboardTopbar">
        <div>
          <p className="dashboardKicker">Relationship memory</p>
          <h1 className="dashboardTitle">Dashboard</h1>
          <p className="muted" style={{ margin: '8px 0 0' }}>Your relationship memory for this week.</p>
        </div>
        {profile ? <Link className="button buttonPrimary" href="/dashboard/qr">Show QR</Link> : <Link className="button buttonPrimary" href="/dashboard/profile">Create profile</Link>}
      </div>

      <div className="metricGrid">
        {metrics.map(([icon, label, value]) => (
          <div className="card metricCard" key={label}>
            <div className="metricIcon">{icon}</div>
            <div>
              <div className="metricValue">{value}</div>
              <div className="metricLabel">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="gridTwo">
        <section className="card panel">
          <div className="panelHeader">
            <div>
              <h2 style={{ margin: 0 }}>Profile</h2>
              <p className="muted" style={{ margin: '8px 0 0' }}>{profile ? publicProfileUrl(profile.slug) : 'Create your public SparkMeet profile.'}</p>
            </div>
            <span className={profile?.isPublic ? 'statusPill statusPillHot' : 'statusPill'}>{profile?.isPublic ? 'Public' : 'Draft'}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Link className="button buttonSecondary" href="/dashboard/profile">Edit profile</Link>
            {profile ? <Link className="button buttonSecondary" href={`/r/${profile.slug}`}>View public page</Link> : null}
          </div>
        </section>

        <section className="card panel">
          <div className="metricIcon">WK</div>
          <h2 style={{ margin: '14px 0 0' }}>People I met this week</h2>
          <div className="metricValue" style={{ marginTop: 12 }}>{contactsThisWeek}</div>
          <p className="muted" style={{ margin: 0 }}>Contacts captured in the last 7 days.</p>
        </section>
      </div>

      <div className="gridTwo" style={{ marginTop: 16 }}>
        <section className="card panel">
          <div className="panelHeader">
            <h2>Follow-up queue</h2>
          </div>
          <div className="tableList">
            {followUps.length ? followUps.map((contact) => (
              <Link className="rowLink" key={contact.id} href={`/dashboard/contacts/${contact.id}`}>
                <div className="contactIdentity">
                  <span className="contactAvatar">{initials(contact.fullName)}</span>
                  <div>
                    <strong>{contact.fullName}</strong>
                    <p className="muted" style={{ margin: '4px 0 0' }}>{contact.sourceLabel || contact.company || 'Needs follow-up'}</p>
                  </div>
                </div>
                <span className="statusPill statusPillHot">{statusLabel(contact.followUpStatus)}</span>
              </Link>
            )) : <p className="muted">No follow-ups waiting.</p>}
          </div>
        </section>

        <section className="card panel">
          <div className="panelHeader">
            <h2>Recent contacts</h2>
          </div>
          <div className="tableList">
            {recentContacts.length ? recentContacts.map((contact) => (
              <Link className="rowLink" key={contact.id} href={`/dashboard/contacts/${contact.id}`}>
                <div className="contactIdentity">
                  <span className="contactAvatar">{initials(contact.fullName)}</span>
                  <div>
                    <strong>{contact.fullName}</strong>
                    <p className="muted" style={{ margin: '4px 0 0' }}>{contact.company || contact.role || 'QR profile scan'}</p>
                  </div>
                </div>
                <span className="statusPill">{statusLabel(contact.followUpStatus)}</span>
              </Link>
            )) : <p className="muted">Contacts from scanner submissions will appear here.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
