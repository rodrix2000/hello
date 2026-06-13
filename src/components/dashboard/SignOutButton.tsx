'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: '/' })}>
      <span className="navGlyph">06</span>
      <span>Sign out</span>
    </button>
  );
}
