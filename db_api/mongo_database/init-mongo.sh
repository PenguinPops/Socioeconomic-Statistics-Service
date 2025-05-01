#!/bin/bash

# Wait for MongoDB to start
until mongosh --eval "print(\"waited for connection\")"
do
    sleep 1
done

# Restore the dump file
mongorestore --archive="/tmp/db.dump" --username="$MONGO_INITDB_ROOT_USERNAME" --password="$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase="admin"

echo "Database restore completed!"