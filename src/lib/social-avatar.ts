export type SocialAvatarOption = {
  label: string;
  platform: string;
  url: string;
};

type LinkLike = {
  platform: string;
  url: string;
};

function cleanHandle(value: string) {
  return value
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\//, '')
    .split(/[/?#]/)[0]
    .trim();
}

function firstPathSegment(value: string) {
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    return url.pathname.split('/').filter(Boolean)[0] || '';
  } catch {
    return '';
  }
}

function githubAvatar(value: string) {
  const handle = firstPathSegment(value) || cleanHandle(value);
  return handle ? `https://github.com/${encodeURIComponent(handle)}.png?size=400` : '';
}

function unavatar(platform: string, value: string) {
  const handle = firstPathSegment(value) || cleanHandle(value);
  return handle ? `https://unavatar.io/${platform}/${encodeURIComponent(handle)}` : '';
}

function linkedinHandle(value: string) {
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    const parts = url.pathname.split('/').filter(Boolean);
    const index = parts.findIndex((part) => ['in', 'company'].includes(part));
    return index >= 0 ? parts[index + 1] || '' : parts[0] || '';
  } catch {
    return cleanHandle(value);
  }
}

export function socialAvatarUrl(platform: string, value: string) {
  if (!value.trim()) return '';

  if (platform === 'github') {
    return githubAvatar(value);
  }

  if (platform === 'linkedin') {
    const handle = linkedinHandle(value);
    return handle ? `https://unavatar.io/linkedin/${encodeURIComponent(handle)}` : '';
  }

  const unavatarPlatforms: Record<string, string> = {
    x: 'x',
    instagram: 'instagram',
    threads: 'threads',
    bluesky: 'bluesky',
    tiktok: 'tiktok'
  };

  const service = unavatarPlatforms[platform];
  return service ? unavatar(service, value) : '';
}

export function socialAvatarOptions(links: LinkLike[]): SocialAvatarOption[] {
  const options = links.flatMap((link) => {
    const value = link.url.trim();
    if (!value) return [];

    const url = socialAvatarUrl(link.platform, value);
    return url ? [{ platform: link.platform, label: link.platform === 'github' ? 'Use GitHub avatar' : `Try ${link.platform} image`, url }] : [];
  });

  return options.filter((option, index, all) => all.findIndex((item) => item.url === option.url) === index);
}
