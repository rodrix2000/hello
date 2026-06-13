'use client';

import { FormEvent, useState } from 'react';

export function PublicContactForm({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/profiles/${slug}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Could not send your info.');
        return;
      }

      setSuccess(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your info.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card" style={{ padding: 18, background: 'var(--deep-ink)', color: 'white' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.35rem' }}>Info sent</h2>
        <p style={{ margin: 0, color: 'rgba(255,255,255,.72)', lineHeight: 1.5 }}>
          You are in their SparkMeet contact memory now. No account needed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card stack" style={{ padding: 18 }}>
      <div>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.35rem' }}>Send me your info</h2>
        <p className="muted" style={{ margin: 0 }}>Share just enough for a thoughtful manual follow-up.</p>
      </div>
      <div>
        <label className="label" htmlFor="fullName">Name</label>
        <input className="input" id="fullName" name="fullName" required />
      </div>
      <div className="twoColumnMobile">
        <div>
          <label className="label" htmlFor="email">Email optional</label>
          <input className="input" id="email" name="email" type="email" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone optional</label>
          <input className="input" id="phone" name="phone" />
        </div>
      </div>
      <div className="twoColumnMobile">
        <div>
          <label className="label" htmlFor="company">Company</label>
          <input className="input" id="company" name="company" />
        </div>
        <div>
          <label className="label" htmlFor="role">Role</label>
          <input className="input" id="role" name="role" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="socialLink">Social link</label>
        <input className="input" id="socialLink" name="socialLink" placeholder="LinkedIn, X, website, or portfolio" />
      </div>
      <div>
        <label className="label" htmlFor="notesFromContact">Short note</label>
        <textarea className="textarea" id="notesFromContact" name="notesFromContact" placeholder="What should they remember?" />
      </div>
      {error ? <div style={{ color: 'var(--danger)', fontWeight: 700 }}>{error}</div> : null}
      <button className="button buttonPrimary" type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send me your info'}
      </button>
    </form>
  );
}
