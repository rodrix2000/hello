import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { saveProfileAction } from '@/app/dashboard/actions';
import { defaultProfileLinks, platformLabels } from '@/lib/platforms';
import { publicProfileUrl, slugify } from '@/lib/urls';
import { linkPlatforms } from '@/lib/validation';

type SearchParams = Promise<{ saved?: string; error?: string }>;

export default async function ProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  if (!user) redirect('/login');
  const params = await searchParams;

  const profile = await prisma.profile.findUnique({
    where: { ownerUserId: user.id },
    include: { links: { orderBy: { sortOrder: 'asc' } } }
  });

  const existingLinks = new Map((profile?.links || []).map((link) => [link.platform, link]));
  const linkRows = linkPlatforms.map((platform, index) => {
    const existing = existingLinks.get(platform);
    const fallback = defaultProfileLinks.find((link) => link.platform === platform);
    return {
      platform,
      label: existing?.label || fallback?.label || platformLabels[platform] || platform,
      url: existing?.url || fallback?.url || '',
      isVisible: existing?.isVisible ?? true,
      sortOrder: index
    };
  });

  const initialSlug = profile?.slug || slugify(user.name || user.email);

  return (
    <>
      <div className="dashboardTopbar">
        <div>
          <p className="dashboardKicker">Public card</p>
          <h1 className="dashboardTitle">Profile</h1>
          <p className="muted" style={{ margin: '8px 0 0' }}>Create the public page people see after scanning your QR.</p>
        </div>
        {profile ? <a className="button buttonSecondary" href={`/r/${profile.slug}`}>View public page</a> : null}
      </div>

      {params.saved ? <p className="statusPill statusPillHot" style={{ marginBottom: 12 }}>Profile saved</p> : null}
      {params.error === 'slug' ? <p style={{ color: 'var(--danger)', fontWeight: 800 }}>That slug is already taken.</p> : null}
      {params.error === 'profile' ? <p style={{ color: 'var(--danger)', fontWeight: 800 }}>Check required fields and link URLs.</p> : null}

      <form action={saveProfileAction} className="card stack formPanel">
        <div className="formGrid">
          <div>
            <label className="label" htmlFor="displayName">Name</label>
            <input className="input" id="displayName" name="displayName" defaultValue={profile?.displayName || user.name || ''} required />
          </div>
          <div>
            <label className="label" htmlFor="slug">Public slug</label>
            <input className="input" id="slug" name="slug" defaultValue={initialSlug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </div>
          <div>
            <label className="label" htmlFor="headline">Headline</label>
            <input className="input" id="headline" name="headline" defaultValue={profile?.headline || ''} placeholder="Founder, designer, community builder" />
          </div>
          <div>
            <label className="label" htmlFor="profilePhotoUrl">Profile photo URL</label>
            <input className="input" id="profilePhotoUrl" name="profilePhotoUrl" defaultValue={profile?.profilePhotoUrl || ''} placeholder="https://..." />
          </div>
          <div>
            <label className="label" htmlFor="company">Company/project</label>
            <input className="input" id="company" name="company" defaultValue={profile?.company || ''} />
          </div>
          <div>
            <label className="label" htmlFor="role">Role</label>
            <input className="input" id="role" name="role" defaultValue={profile?.role || ''} />
          </div>
          <div>
            <label className="label" htmlFor="location">Location</label>
            <input className="input" id="location" name="location" defaultValue={profile?.location || ''} />
          </div>
          <div>
            <label className="label" htmlFor="contactPreference">Contact preference</label>
            <input className="input" id="contactPreference" name="contactPreference" defaultValue={profile?.contactPreference || ''} placeholder="Email is best" />
          </div>
          <div>
            <label className="label" htmlFor="primaryCtaLabel">Primary CTA label</label>
            <input className="input" id="primaryCtaLabel" name="primaryCtaLabel" defaultValue={profile?.primaryCtaLabel || ''} placeholder="Book a call" />
          </div>
          <div>
            <label className="label" htmlFor="primaryCtaUrl">Primary CTA URL</label>
            <input className="input" id="primaryCtaUrl" name="primaryCtaUrl" defaultValue={profile?.primaryCtaUrl || ''} placeholder="https://calendly.com/..." />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="bioShort">Short bio / what I do</label>
          <textarea className="textarea" id="bioShort" name="bioShort" defaultValue={profile?.bioShort || ''} />
        </div>

        <label className="checkRow">
          <input type="checkbox" name="isPublic" defaultChecked={profile?.isPublic ?? true} />
          Public profile is visible
        </label>

        <section className="formSection">
          <div>
            <h2 style={{ margin: 0 }}>Social/contact links</h2>
            <p className="muted" style={{ margin: '6px 0 0' }}>Leave URL blank to hide a link. Custom links are supported through the Custom row.</p>
          </div>
          {linkRows.map((link) => (
            <div key={link.platform} className="linkEditorRow">
              <div>
                <label className="label" htmlFor={`link_${link.platform}_label`}>{platformLabels[link.platform]}</label>
                <input className="input" id={`link_${link.platform}_label`} name={`link_${link.platform}_label`} defaultValue={link.label} />
              </div>
              <div>
                <label className="label" htmlFor={`link_${link.platform}_url`}>URL / handle</label>
                <input className="input" id={`link_${link.platform}_url`} name={`link_${link.platform}_url`} defaultValue={link.url} />
              </div>
              <label className="checkRow" style={{ minHeight: 44 }}>
                <input type="checkbox" name={`link_${link.platform}_visible`} defaultChecked={link.isVisible} />
                Show
              </label>
            </div>
          ))}
        </section>

        {profile ? <p className="muted" style={{ margin: 0 }}>Public link: {publicProfileUrl(profile.slug)}</p> : null}
        <button className="button buttonPrimary" type="submit">Save profile</button>
      </form>
    </>
  );
}
