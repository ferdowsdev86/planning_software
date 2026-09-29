#!/usr/bin/env bash
# Deploy MbmPlan to mbmerp-dev (172.16.101.5, CentOS 9, httpd + systemd).
# The host cannot reach the Bryntum npm registry, so the frontend is built
# HERE and the dist/ folder is rsynced; the API code comes from git.
#   ./deploy/deploy-mbmerp-dev.sh            # build + rsync dist + git pull + restart API
#   ./deploy/deploy-mbmerp-dev.sh --no-build # skip vite build (dist already fresh)
set -euo pipefail
HOST=root@172.16.101.5
DIR=/var/www/mbm-plan
cd "$(dirname "$0")/.."
[ "${1:-}" = "--no-build" ] || npx vite build
rsync -az --delete dist/ "$HOST:$DIR/dist/"
ssh "$HOST" "cd $DIR && git pull --ff-only origin main && cd server && npm install --omit=dev --no-audit --no-fund --silent && systemctl restart mbm-plan-api && sleep 2 && systemctl is-active mbm-plan-api && curl -s http://127.0.0.1:4000/api/v1/planning/health"
echo
echo "deployed → https://172.16.101.5:9444/"
