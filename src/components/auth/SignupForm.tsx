'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to create account.');
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('Account created, but sign in failed. Try signing in manually.');
        return;
      }

      router.push('/dashboard/profile');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ width: 'min(100%, 460px)', padding: 22 }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontWeight: 900, fontSize: '1.5rem' }}>SparkMeet</div>
        <h1 style={{ margin: '20px 0 8px', fontSize: '2rem', lineHeight: 1.05 }}>Create your profile</h1>
        <p className="muted" style={{ margin: 0 }}>Start with a QR-ready profile and private contact memory board.</p>
      </div>

      <form onSubmit={handleSubmit} className="stack">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" className="input" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>
        {error ? <div style={{ color: 'var(--danger)', fontWeight: 700 }}>{error}</div> : null}
        <button className="button buttonPrimary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
      </form>

      <p className="muted" style={{ margin: '20px 0 0' }}>
        Already have an account? <Link href="/login" style={{ color: 'var(--spark-orange)', fontWeight: 800 }}>Sign in</Link>
      </p>
    </div>
  );
}
