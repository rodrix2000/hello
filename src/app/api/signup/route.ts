import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signupSchema } from '@/lib/validation';
import { slugify } from '@/lib/urls';

async function uniqueSlug(base: string) {
  const root = slugify(base);
  let slug = root;
  let index = 2;

  while (await prisma.profile.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${root}-${index}`;
    index += 1;
  }

  return slug;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email and a password with at least 8 characters.' }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'An account already exists for this email.' }, { status: 409 });
  }

  const name = parsed.data.name?.trim() || email.split('@')[0];
  const password = await bcrypt.hash(parsed.data.password, 12);
  const slug = await uniqueSlug(name);

  await prisma.user.create({
    data: {
      email,
      name,
      password,
      role: 'OWNER',
      profile: {
        create: {
          slug,
          displayName: name,
          headline: 'Tell people what you do in one clear sentence.',
          bioShort: 'Use this space to help new contacts remember the conversation.',
          contactPreference: 'Send me your info and I will follow up manually.',
          isPublic: true
        }
      }
    }
  });

  return NextResponse.json({ ok: true });
}
