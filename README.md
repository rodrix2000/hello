# SparkMeet

SparkMeet is a mobile-first relationship memory app for real-world networking.

Core promise: **scan -> save -> remember -> follow up**.

The MVP lets one profile owner create a public profile, show a QR code, receive no-login scanner contact submissions, and manage private meeting context plus manual follow-up status.

## Stack

- Next.js App Router + TypeScript
- NextAuth/Auth.js credentials login
- Prisma + plain Postgres
- Docker + Docker Compose
- Coolify/Hetzner-ready standalone Next.js Docker build

No Supabase, AI, native app, feed, automated outreach, CRM integrations, or team accounts are included.

## Required Environment Variables

Copy `.env.example` to `.env.local`:

```env
DATABASE_URL=postgresql://sparkmeet:sparkmeet@localhost:55432/sparkmeet
AUTH_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
SPARKMEET_OWNER_EMAIL=owner@example.com
SPARKMEET_OWNER_PASSWORD=change-me-at-least-8-chars
SPARKMEET_OWNER_NAME=SparkMeet Owner
SPARKMEET_OWNER_RESET_PASSWORD=false
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Local Development

Start Postgres:

```bash
docker compose up -d db
```

Install dependencies and prepare the database:

```bash
npm install
npm run db:push
npm run db:seed
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` and sign in with the seeded owner email/password.

## Docker

Run the app and database together:

```bash
docker compose up --build
```

The app container runs:

```bash
prisma db push
node prisma/seed.js
```

on startup when `DATABASE_URL` is set.

## Plain Postgres Schema

Prisma is the source of truth in `prisma/schema.prisma`.

A plain SQL reference is included at `db/schema.sql`. Use Prisma commands for normal local and production setup:

```bash
npm run db:push
```

## Coolify / Hetzner Notes

1. Create a PostgreSQL resource in Coolify first.
2. Create the SparkMeet app from this repository.
3. Use build pack: Dockerfile.
4. Use port: `3000`.
5. Set `DATABASE_URL` to the internal Coolify Postgres connection string, not `localhost`.
6. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS domain.
7. Set stable `AUTH_SECRET` and owner seed variables.
8. Deploy and confirm logs show schema sync and owner seed.

## MVP Scope

Included:

- Public `/r/[slug]` profile
- Profile vCard download
- No-login scanner contact submission
- Profile owner dashboard
- Profile editor
- QR display, copy link, QR image download
- Contact list/detail
- Search by name, tag, source/event, or notes
- Tags, private notes, meeting context, source label
- Follow-up reminder date and status
- Manual follow-up note
- CSV export
- Individual contact vCard export
- Basic profile event metrics
- PWA manifest metadata

Not included:

- AI summaries or follow-up drafts
- AI enrichment
- Voice transcription
- Native mobile apps
- NFC
- Wallet passes
- Push notifications
- CRM integrations
- LinkedIn/X imports
- Automatic email or text sending
- Team accounts
- Event dashboards

## Verification Commands

```bash
npm run lint
npm run build
docker compose up --build
```
