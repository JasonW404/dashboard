#!/bin/sh
set -e

# This command applies any pending migrations to the database
# "migrate deploy" is safe for production (it doesn't prompt for confirmation)
echo "Running database migrations..."
prisma migrate deploy

# Start the application
echo "Starting Next.js..."
node server.js