#!/usr/bin/env bash
# One-time server setup for shinigami-rog.cc on OCI Ubuntu 24.04 (arm64).
# Idempotent — safe to re-run. Usage:
#   curl -fsSLO https://raw.githubusercontent.com/sivaguru94/sivaguru-ravi/master/deploy/scripts/setup-server.sh
#   sudo bash setup-server.sh
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "run with sudo"; exit 1; }

REPO_RAW="https://raw.githubusercontent.com/sivaguru94/sivaguru-ravi/master"
DEPLOY_PUBKEY='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF6GF9oU02pmhnTOsdTqhNzeh4MMClPcK2/LpfekZe54 github-actions-deploy@shinigami-rog'
APP_DIR=/opt/shinigami-rog
export DEBIAN_FRONTEND=noninteractive

echo "==> [1/6] base packages"
apt-get update -q
apt-get install -yq fail2ban unattended-upgrades netfilter-persistent curl

echo "==> [2/6] docker"
command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sh

echo "==> [3/6] firewall — open 443 in OCI's baked-in iptables"
# OCI Ubuntu images ship restrictive iptables ON TOP of the VCN security
# list; without this, 443 is refused even when the cloud rule is open.
iptables -C INPUT -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null ||
  iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
netfilter-persistent save

echo "==> [4/6] deploy user (CI ssh target)"
id deploy >/dev/null 2>&1 || adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
grep -qF "$DEPLOY_PUBKEY" /home/deploy/.ssh/authorized_keys ||
  echo "$DEPLOY_PUBKEY" >> /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

echo "==> [5/6] ssh hardening (keys only, no root)"
printf 'PasswordAuthentication no\nPermitRootLogin no\n' \
  > /etc/ssh/sshd_config.d/hardening.conf
systemctl restart ssh

echo "==> [6/6] app directory"
install -d -o deploy -g deploy "$APP_DIR"
install -d -m 700 -o deploy -g deploy "$APP_DIR/certs"
curl -fsSLo "$APP_DIR/compose.yml" "$REPO_RAW/deploy/compose.yml"
curl -fsSLo "$APP_DIR/tls.conf" "$REPO_RAW/deploy/tls.conf"
chown deploy:deploy "$APP_DIR/compose.yml" "$APP_DIR/tls.conf"

PUB_IP=$(curl -s --max-time 5 -H 'Authorization: Bearer Oracle' -L \
  http://169.254.169.254/opc/v2/vnics/ 2>/dev/null |
  grep -o '"publicIp"[^,]*' | head -1 | grep -o '[0-9.]\{7,\}' || true)
[ -n "${PUB_IP:-}" ] || PUB_IP=$(curl -s --max-time 5 https://api.ipify.org || echo "unknown")

cat <<DONE

server setup complete.
  public IP: $PUB_IP

next steps:
  1. sudo bash setup-tailscale.sh          # admin access over the tailnet
  2. Cloudflare origin cert/key -> $APP_DIR/certs/{origin-cert.pem,origin-key.pem}
  3. sudo bash first-deploy.sh
DONE
