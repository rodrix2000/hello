-- SparkMeet plain Postgres schema reference.
-- The app uses Prisma as the source of truth and runs `prisma db push` in Docker,
-- but this SQL documents the MVP table shape for manual inspection/setup.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  email_verified TIMESTAMP,
  image TEXT,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'OWNER',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  UNIQUE (identifier, token)
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  headline TEXT,
  bio_short TEXT,
  profile_photo_url TEXT,
  company TEXT,
  role TEXT,
  location TEXT,
  contact_preference TEXT,
  primary_cta_label TEXT,
  primary_cta_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile_links (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  location TEXT,
  notes_from_contact TEXT,
  private_notes TEXT,
  meeting_context TEXT,
  source_type TEXT NOT NULL DEFAULT 'manual',
  source_label TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  social_links_json JSONB NOT NULL DEFAULT '{}',
  follow_up_status TEXT NOT NULL DEFAULT 'not_started',
  follow_up_due_at TIMESTAMP,
  last_contacted_at TIMESTAMP,
  manual_follow_up_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile_events (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_owner_user_id ON profiles(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_links_profile_sort ON profile_links(profile_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_created ON contacts(owner_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_follow_up_status ON contacts(owner_user_id, follow_up_status);
CREATE INDEX IF NOT EXISTS idx_contacts_source_profile_id ON contacts(source_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_events_profile_type_created ON profile_events(profile_id, type, created_at);
