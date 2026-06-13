import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
