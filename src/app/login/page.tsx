import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <Suspense fallback={<div className="card" style={{ padding: 24 }}>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
