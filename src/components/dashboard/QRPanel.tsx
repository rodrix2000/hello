'use client';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

export function QRPanel({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 960,
      margin: 2,
      color: {
        dark: '#16181D',
        light: '#FFFFFF'
      }
    }).then(setDataUrl).catch(() => setDataUrl(''));
  }, [url]);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="card qrSharePanel">
      <div className="qrStage">
        <p style={{ margin: 0, color: 'rgba(255,255,255,.72)', fontWeight: 850 }}>Show QR</p>
        <div className="qrFrame">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt={`QR code for ${url}`} />
          ) : (
            <div style={{ aspectRatio: '1 / 1', display: 'grid', placeItems: 'center', color: 'var(--deep-ink)' }}>Generating QR...</div>
          )}
        </div>
        <p className="qrMeta">{url}</p>
      </div>
      <div className="qrActionPanel">
        <div>
          <h2>Ready for the next hello.</h2>
          <p className="muted" style={{ margin: '12px 0 0', lineHeight: 1.55 }}>
            Keep this page open at the event. Scanners can save your details and send their info back without creating an account.
          </p>
        </div>
        <ul className="qrActionList">
          <li>Show the QR across the table.</li>
          <li>Copy the profile link for messages or printed material.</li>
          <li>Download the QR image for signs, badges, and handouts.</li>
        </ul>
        <div className="qrActions">
          <button className="button buttonPrimary" type="button" onClick={copyLink}>{copied ? 'Copied' : 'Copy link'}</button>
          <a className="button buttonSecondary" href={url}>Open public profile</a>
        </div>
        {dataUrl ? <a className="button buttonSecondary" href={dataUrl} download="sparkmeet-qr.png">Download QR</a> : null}
      </div>
    </div>
  );
}
