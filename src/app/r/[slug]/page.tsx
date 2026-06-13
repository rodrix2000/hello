import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { publicProfileUrl } from '@/lib/urls';
import { PublicContactForm } from '@/components/public/PublicContactForm';
import { PublicLinks } from '@/components/public/PublicLinks';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export default async function PublicProfilePage({ params }: { params: Params }) {
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

  if (!profile) notFound();

  await prisma.profileEvent.create({
    data: {
      profileId: profile.id,
      type: 'profile_view',
      metadata: {}
    }
  });

  return (
    <main className="shell">
      <div className="container" style={{ padding: '18px 0 44px', maxWidth: 560 }}>
        <section className="card" style={{ padding: 20, display: 'grid', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 72, height: 72, borderRadius: 8, background: 'var(--warm-amber)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '1.7rem', overflow: 'hidden' }}>
              {profile.profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : profile.displayName.slice(0, 1)}
            </div>
            <div>
              <p className="statusPill statusPillHot" style={{ margin: '0 0 8px', width: 'fit-content' }}>SparkMeet</p>
              <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.05 }}>{profile.displayName}</h1>
            </div>
          </div>

          <div>
            {profile.headline ? <p style={{ margin: '0 0 8px', fontWeight: 850, fontSize: '1.08rem' }}>{profile.headline}</p> : null}
            {profile.bioShort ? <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>{profile.bioShort}</p> : null}
          </div>

          <div className="tagList">
            {profile.company ? <span className="tag">{profile.company}</span> : null}
            {profile.role ? <span className="tag">{profile.role}</span> : null}
            {profile.location ? <span className="tag">{profile.location}</span> : null}
          </div>

          {profile.contactPreference ? (
            <div style={{ background: 'var(--cloud-gray)', borderRadius: 8, padding: 14 }}>
              <strong>Contact preference</strong>
              <p className="muted" style={{ margin: '6px 0 0' }}>{profile.contactPreference}</p>
            </div>
          ) : null}

          <div style={{ display: 'grid', gap: 10 }}>
            <a className="button buttonPrimary" href={`/api/profiles/${profile.slug}/vcard`}>Save contact</a>
            {profile.primaryCtaUrl ? <a className="button buttonDark" href={profile.primaryCtaUrl}>{profile.primaryCtaLabel || 'Open link'}</a> : null}
          </div>

          <PublicLinks slug={profile.slug} links={profile.links} />

          <p className="muted" style={{ margin: 0, fontSize: '.85rem' }}>{publicProfileUrl(profile.slug)}</p>
        </section>

        <div style={{ height: 14 }} />
        <PublicContactForm slug={profile.slug} />
      </div>
    </main>
  );
}
