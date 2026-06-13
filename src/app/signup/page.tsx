import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <main className="shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <SignupForm />
    </main>
  );
}
