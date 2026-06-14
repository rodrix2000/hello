'use client';

import { useMemo, useState } from 'react';
import { socialAvatarUrl, type SocialAvatarOption } from '@/lib/social-avatar';

type ProfileImagePickerProps = {
  currentUrl?: string | null;
  displayName: string;
  options: SocialAvatarOption[];
};

function initialFor(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'S';
}

export function ProfileImagePicker({ currentUrl, displayName, options }: ProfileImagePickerProps) {
  const [photoUrl, setPhotoUrl] = useState(currentUrl || '');
  const [previewUrl, setPreviewUrl] = useState(currentUrl || '');
  const [socialPlatform, setSocialPlatform] = useState('github');
  const [socialSource, setSocialSource] = useState('');
  const initial = useMemo(() => initialFor(displayName), [displayName]);

  function handleUrlChange(value: string) {
    setPhotoUrl(value);
    setPreviewUrl(value);
  }

  function handleUpload(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    setPhotoUrl('');
  }

  function useSocialImage() {
    const url = socialAvatarUrl(socialPlatform, socialSource);
    if (url) handleUrlChange(url);
  }

  return (
    <section className="profileImagePanel">
      <div className="profileImagePreview" aria-label="Profile image preview">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      <div className="profileImageControls">
        <div>
          <h2 style={{ margin: 0 }}>Profile image</h2>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            Upload a photo, paste an image URL, or pull a best-effort avatar from a saved social profile.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="profilePhotoFile">Upload image</label>
          <input
            className="input"
            id="profilePhotoFile"
            name="profilePhotoFile"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => handleUpload(event.target.files?.[0] || null)}
          />
          <p className="muted" style={{ margin: '6px 0 0', fontSize: '.82rem' }}>
            PNG, JPG, WebP, or GIF. Max 1.5MB.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="profilePhotoUrl">Image URL</label>
          <input
            className="input"
            id="profilePhotoUrl"
            name="profilePhotoUrl"
            value={photoUrl}
            onChange={(event) => handleUrlChange(event.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="socialAvatarBuilder">
          <div>
            <label className="label" htmlFor="socialAvatarPlatform">Pull from social profile</label>
            <select
              className="select"
              id="socialAvatarPlatform"
              value={socialPlatform}
              onChange={(event) => setSocialPlatform(event.target.value)}
            >
              <option value="github">GitHub</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X</option>
              <option value="instagram">Instagram</option>
              <option value="threads">Threads</option>
              <option value="bluesky">Bluesky</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="socialAvatarSource">Profile URL or handle</label>
            <input
              className="input"
              id="socialAvatarSource"
              value={socialSource}
              onChange={(event) => setSocialSource(event.target.value)}
              placeholder="https://github.com/username or @username"
            />
          </div>
          <button className="button buttonSecondary" type="button" onClick={useSocialImage}>
            Use social image
          </button>
        </div>

        {options.length ? (
          <div className="socialAvatarGrid">
            {options.map((option) => (
              <button
                className="socialAvatarOption"
                key={option.url}
                type="button"
                onClick={() => handleUrlChange(option.url)}
              >
                <span>{option.platform.slice(0, 2).toUpperCase()}</span>
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ margin: 0, fontSize: '.88rem' }}>
            Add and save social links below to enable social avatar options.
          </p>
        )}

        <button className="button buttonSecondary" type="button" onClick={() => handleUrlChange('')}>
          Remove image
        </button>
      </div>
    </section>
  );
}
