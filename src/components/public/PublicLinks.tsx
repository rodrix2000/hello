'use client';

type LinkItem = {
  id: string;
  platform: string;
  label: string;
  url: string;
};

function displayUrl(url: string) {
  if (url.includes('@') && !url.startsWith('http') && !url.startsWith('mailto:')) return `mailto:${url}`;
  if (/^\+?[0-9().\-\s]+$/.test(url) && !url.startsWith('tel:')) return `tel:${url}`;
  if (!/^https?:\/\//.test(url) && !url.startsWith('mailto:') && !url.startsWith('tel:')) return `https://${url}`;
  return url;
}

export function PublicLinks({ slug, links }: { slug: string; links: LinkItem[] }) {
  async function logClick(link: LinkItem) {
    try {
      await fetch(`/api/profiles/${slug}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({ type: 'link_click', metadata: { platform: link.platform, label: link.label } })
      });
    } catch {
      // Event logging must never block the scanner flow.
    }
  }

  if (!links.length) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
      {links.map((link) => (
        <a
          key={link.id}
          className="button buttonSecondary"
          href={displayUrl(link.url)}
          target={link.url.startsWith('http') ? '_blank' : undefined}
          rel={link.url.startsWith('http') ? 'noreferrer' : undefined}
          onClick={() => logClick(link)}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
