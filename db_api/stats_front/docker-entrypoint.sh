#!/bin/sh

# First generate the auth secret (creates .env.local with AUTH_SECRET)
npx auth secret

# Then append database config to the existing .env.local
cat <<EOF >> .env.local
databaseconfig
DATABASE_HOST=userdb
DATABASE_NAME=userdb
DATABASE_USER=postgres
DATABASE_PASSWORD=secret
EOF

# Run the main command
exec "$@"