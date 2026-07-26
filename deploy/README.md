# Server runbook — shinigami-rog.cc on Oracle Always-Free ARM

One-time setup the author performs; CI/CD takes over afterwards
(deploy-plan.md has the architecture).

## 1. Oracle VM
- Create an **Ampere A1** instance (Ubuntu 24.04 arm64; even 1 OCPU/6GB is
  plenty). Assign a public IP. Add an ingress rule for TCP 443 (and 22).

## 2. Harden + Docker (as root, ~10 min)
```bash
adduser deploy && usermod -aG docker deploy   # after docker install
apt-get update && apt-get install -y ufw fail2ban unattended-upgrades
curl -fsSL https://get.docker.com | sh
ufw default deny incoming && ufw allow 22/tcp && ufw allow 443/tcp && ufw enable
# SSH: keys only — set PasswordAuthentication no, PermitRootLogin no in
# /etc/ssh/sshd_config.d/hardening.conf, then systemctl restart ssh
```
Tighten later: restrict 443 to Cloudflare IP ranges (https://www.cloudflare.com/ips/).

## 3. App directory
```bash
mkdir -p /opt/shinigami-rog/certs && cd /opt/shinigami-rog
# copy from the repo: deploy/compose.yml → compose.yml, deploy/tls.conf → tls.conf
```

## 4. Cloudflare
- Add site `shinigami-rog.cc` (free plan); switch nameservers at the registrar.
- DNS: A record `@` → VM IP (proxied/orange), CNAME `www` → `@` (proxied).
- SSL/TLS mode: **Full (strict)**. Create an **Origin Certificate** (15y),
  save as `certs/origin-cert.pem` + `certs/origin-key.pem` (chmod 600).
- Edge: enable "Always Use HTTPS" + HTTP/3.

## 5. First deploy + CI handover
```bash
cd /opt/shinigami-rog && docker compose pull && docker compose up -d
curl -k https://localhost/healthz   # → ok
```
- GitHub repo → Settings (already set 2026-07-26: `DEPLOY_SSH_KEY`,
  `DEPLOY_USER=deploy`; private key backup in gitignored `docs-private/`):
  - **Variables:** `DEPLOY_ENABLED=true` (set last, flips CD on)
  - **Secrets:** `DEPLOY_HOST` (VM public IP)
- The CI deploy public key for `/home/deploy/.ssh/authorized_keys`:
  ```
  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF6GF9oU02pmhnTOsdTqhNzeh4MMClPcK2/LpfekZe54 github-actions-deploy@shinigami-rog
  ```
- From then on: merge to `master` → build → Trivy scan → GHCR → SSH deploy →
  prod smoke.

## Rollback
```bash
TAG=<previous-sha> docker compose pull && TAG=<previous-sha> docker compose up -d
```
(previous tags listed under the repo's GHCR packages)
