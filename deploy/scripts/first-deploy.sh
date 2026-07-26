#!/usr/bin/env bash
# First (and manual-fallback) deploy: pull the GHCR image and start serving.
# Usage: sudo bash first-deploy.sh   [TAG=<sha> to pin a version]
set -euo pipefail
APP_DIR=/opt/shinigami-rog
cd "$APP_DIR"

for f in certs/origin-cert.pem certs/origin-key.pem; do
  [ -f "$f" ] || { echo "missing $f — create the Cloudflare origin cert first (runbook §3.5)"; exit 1; }
done
chmod 600 certs/origin-*.pem

docker compose pull
docker compose up -d

echo "waiting for healthz..."
for i in $(seq 1 20); do
  if curl -skf https://localhost/healthz >/dev/null 2>&1; then
    echo "OK — container healthy and serving TLS."
    docker compose ps
    echo
    echo "next: send Claude the public IP (or 'oci-shinigami' if on the"
    echo "tailnet) to flip on CI/CD."
    exit 0
  fi
  sleep 1
done
echo "healthz never came up — inspect with: docker compose logs"
exit 1
