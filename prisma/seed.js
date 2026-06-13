/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const ownerEmail = process.env.SPARKMEET_OWNER_EMAIL;
const ownerPassword = process.env.SPARKMEET_OWNER_PASSWORD;
const ownerName = process.env.SPARKMEET_OWNER_NAME || 'SparkMeet Owner';
const shouldResetPassword = process.env.SPARKMEET_OWNER_RESET_PASSWORD === 'true';

if (!ownerEmail || !ownerPassword) {
  console.warn('[seed] SPARKMEET_OWNER_EMAIL or SPARKMEET_OWNER_PASSWORD is not set; skipping owner seed');
  process.exit(0);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || 'owner';
}

async function main() {
  const password = await bcrypt.hash(ownerPassword, 12);
  const email = ownerEmail.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true }
  });

  const shouldUpdatePassword = !existingUser?.password || shouldResetPassword;
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: ownerName,
      ...(shouldUpdatePassword ? { password } : {})
    },
    create: {
      email,
      name: ownerName,
      password,
      role: 'OWNER'
    }
  });

  const slug = slugify(ownerName);
  await prisma.profile.upsert({
    where: { ownerUserId: user.id },
    update: {
      displayName: ownerName
    },
    create: {
      ownerUserId: user.id,
      slug,
      displayName: ownerName,
      headline: 'Founder, builder, and community connector',
      bioShort: 'I use SparkMeet to remember who I met and what to do next.',
      company: 'SparkMeet',
      role: 'Owner',
      contactPreference: 'Email is best for thoughtful follow-ups.',
      isPublic: true,
      links: {
        create: [
          { platform: 'website', label: 'Website', url: 'https://example.com', sortOrder: 0 },
          { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com', sortOrder: 1 }
        ]
      }
    }
  });

  console.log(`[seed] Owner user ready: ${email}`);
  if (existingUser && !shouldUpdatePassword) {
    console.log('[seed] Existing owner password preserved. Set SPARKMEET_OWNER_RESET_PASSWORD=true to rotate it from seed.');
  }
}

main()
  .catch((error) => {
    console.error('[seed] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
