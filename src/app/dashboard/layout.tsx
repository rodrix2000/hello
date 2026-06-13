import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import './dashboard.css';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user) redirect('/login');

  return (
    <main className="dashboardShell">
      <div className="dashboardFrame">
        <aside className="dashboardSidebar">
          <div>
            <div className="dashboardBrand">SparkMeet</div>
            <p className="dashboardSidebarCopy">
              Remember who you met and what to do next.
            </p>
          </div>
          <DashboardNav />
          <div className="dashboardSidebarCard">
            <strong>Your profile is live</strong>
            <p className="muted" style={{ margin: 0, lineHeight: 1.45 }}>
              Show your QR, capture context, and keep follow-ups moving.
            </p>
          </div>
        </aside>
        <section className="dashboardMain">{children}</section>
      </div>
    </main>
  );
}
