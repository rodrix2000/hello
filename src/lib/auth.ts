import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
const useSecureCookies = authUrl.startsWith('https://');
const cookiePrefix = useSecureCookies ? '__Secure-' : '';
const hostCookiePrefix = useSecureCookies ? '__Host-' : '';
const authCookieNamespace = 'sparkmeet.v1';
const sharedCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: useSecureCookies
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}${authCookieNamespace}.session-token`,
      options: sharedCookieOptions
    },
    callbackUrl: {
      name: `${cookiePrefix}${authCookieNamespace}.callback-url`,
      options: sharedCookieOptions
    },
    csrfToken: {
      name: `${hostCookiePrefix}${authCookieNamespace}.csrf-token`,
      options: sharedCookieOptions
    }
  },
  pages: {
    signIn: '/login'
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() }
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = 'role' in user ? user.role : 'OWNER';
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  }
});
