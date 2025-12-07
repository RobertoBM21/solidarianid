#!/bin/bash

# Resolve the project root directory strictly
# (Works even if you call the script from a different folder)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_DIR="$PROJECT_ROOT/database"

echo "🚀 Starting Query Explorer..."
echo "📂 Mounting: $DB_DIR"

docker run -it --rm \
    --name pg-query-explorer \
    -v "$DB_DIR":/mnt/database \
    -e POSTGRES_PASSWORD=postgres \
    --entrypoint /bin/bash \
    postgres:18.1-alpine \
    /mnt/database/queries-explorer.sh
