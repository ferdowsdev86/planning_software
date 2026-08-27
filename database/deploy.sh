#!/bin/bash
# Deploy the MBM planning schema + seed data to MySQL
# Usage: DB_USER=... DB_PASS=... ./database/deploy.sh   (or fill .env first)
set -e
cd "$(dirname "$0")/.."

if [ -f .env ]; then
    export $(grep -E '^(DB_HOST|DB_USER|DB_PASS|DB_NAME)=' .env | xargs)
fi

DB_HOST="${DB_HOST:-172.16.101.70}"
DB_NAME="${DB_NAME:-fastreact}"
: "${DB_USER:?Set DB_USER (in .env or environment)}"

MYSQL_ARGS=(-h "$DB_HOST" -u "$DB_USER" --skip-ssl)
[ -n "$DB_PASS" ] && MYSQL_ARGS+=("-p$DB_PASS")

echo "Deploying schema to $DB_HOST ..."
mysql "${MYSQL_ARGS[@]}" < database/schema.sql
echo "Seeding demo data ..."
mysql "${MYSQL_ARGS[@]}" "$DB_NAME" < database/seed.sql
echo "Done. Tables:"
mysql "${MYSQL_ARGS[@]}" -e "USE $DB_NAME; SHOW TABLES; SELECT COUNT(*) AS events FROM planning_events;"
