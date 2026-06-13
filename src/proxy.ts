import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const publicExactPaths = ['/', '/login', '/signup'];
  const publicPrefixes = [
    '/r/',
    '/api/signup',
    '/api/auth',
    '/api/profiles',
    '/manifest.json'
  ];

  const isPublic = publicExactPaths.includes(nextUrl.pathname)
    || publicPrefixes.some((path) => nextUrl.pathname.startsWith(path));

  if (isPublic) return NextResponse.next();

  if (!session) {
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', `${nextUrl.pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)']
};
