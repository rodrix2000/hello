import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { updateSettingsAction } from '@/app/dashboard/actions';

type SearchParams = Promise<{ saved?: string; error?: string }>;

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const sessionUser = await requireUser();
  if (!sessionUser) redirect('/login');
  const params = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { name: true, email: true }
  });

  return (
    <>
      <div className="dashboardTopbar">
        <div>
          <p className="dashboardKicker">Owner account</p>
          <h1 className="dashboardTitle">Settings</h1>
          <p className="muted" style={{ margin: '8px 0 0' }}>Account basics for the profile owner.</p>
        </div>
      </div>

      {params.saved ? <p className="statusPill statusPillHot" style={{ marginBottom: 12 }}>Settings saved</p> : null}
      {params.error ? <p style={{ color: 'var(--danger)', fontWeight: 800 }}>Unable to save settings.</p> : null}

      <form action={updateSettingsAction} className="card stack formPanel" style={{ maxWidth: 680 }}>
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input className="input" id="name" name="name" defaultValue={user?.name || ''} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" defaultValue={user?.email || ''} required />
        </div>
        <div>
          <label className="label" htmlFor="password">New password</label>
          <input className="input" id="password" name="password" type="password" minLength={8} placeholder="Leave blank to keep current password" />
        </div>
        <button className="button buttonPrimary" type="submit">Save settings</button>
      </form>
    </>
  );
}
