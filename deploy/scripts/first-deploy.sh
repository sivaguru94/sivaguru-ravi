#!/usr/bin/env bash
# First (and manual-fallback) deploy: pull the GHCR image and start serving.
# Usage: sudo bash first-deploy.sh   [TAG=<sha> to pin a version]
set -euo pipefail
APP_DIR=/opt/shinigami-rog
cd "$APP_DIR"

for f in certs/origin-cert.pem certs/origin-key.pem; do
  [ -f "$f" ] || { echo "missing $f — create the Cloudflare origin cert first (runbook §3.5)"; exit 1; }
done
# nginx runs as uid 101 in the container: it needs group read, and 600 would
# lock it out (nginx exits with BIO_new_file/Permission denied and crash-loops).
chgrp 101 certs certs/origin-*.pem
chmod 750 certs
chmod 640 certs/origin-*.pem

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
