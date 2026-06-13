import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { publicProfileUrl } from '@/lib/urls';
import { QRPanel } from '@/components/dashboard/QRPanel';

export default async function QRPage() {
  const user = await requireUser();
  if (!user) redirect('/login');

  const profile = await prisma.profile.findUnique({ where: { ownerUserId: user.id } });

  return (
    <>
      <div className="dashboardTopbar">
        <div>
          <p className="dashboardKicker">Share mode</p>
          <h1 className="dashboardTitle">QR</h1>
          <p className="muted" style={{ margin: '8px 0 0' }}>Open this on your phone and show it across the table.</p>
        </div>
        <Link className="button buttonSecondary" href="/dashboard/profile">Edit profile</Link>
      </div>

      {profile ? (
        <QRPanel url={publicProfileUrl(profile.slug)} />
      ) : (
        <div className="card emptyState">
          <p className="muted">Create your profile before generating a QR code.</p>
          <Link className="button buttonPrimary" href="/dashboard/profile">Create profile</Link>
        </div>
      )}
    </>
  );
}
