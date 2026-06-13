#!/bin/sh
set -eu

echo "[entrypoint] Starting SparkMeet container"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "[entrypoint] Applying Prisma schema with db push"
  if [ "${PRISMA_ACCEPT_DATA_LOSS:-false}" = "true" ]; then
    ./node_modules/.bin/prisma db push --accept-data-loss
  else
    ./node_modules/.bin/prisma db push
  fi

  echo "[entrypoint] Seeding SparkMeet owner user"
  node prisma/seed.js
else
  echo "[entrypoint] DATABASE_URL is not set; skipping database setup" >&2
fi

exec "$@"
