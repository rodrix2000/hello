'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid email or password.');
        return;
      }

      router.push(searchParams.get('callbackUrl') || '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ width: 'min(100%, 440px)', padding: 22 }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontWeight: 900, fontSize: '1.5rem' }}>SparkMeet</div>
        <h1 style={{ margin: '20px 0 8px', fontSize: '2rem', lineHeight: 1.05 }}>Welcome back</h1>
        <p className="muted" style={{ margin: 0 }}>Sign in to manage contacts and follow-ups.</p>
      </div>

      <form onSubmit={handleSubmit} className="stack">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>
        {error ? <div style={{ color: 'var(--danger)', fontWeight: 700 }}>{error}</div> : null}
        <button className="button buttonPrimary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>

      <p className="muted" style={{ margin: '20px 0 0' }}>
        New to SparkMeet? <Link href="/signup" style={{ color: 'var(--spark-orange)', fontWeight: 800 }}>Create an account</Link>
      </p>
    </div>
  );
}
