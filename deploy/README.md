# Server runbook — shinigami-rog.cc on Oracle Always-Free ARM

One-time setup the author performs; CI/CD takes over afterwards
(deploy-plan.md has the architecture).

## 0. Make the GHCR image public (one click, do this first)
github.com/sivaguru94 → **Packages** tab → `shinigami-rog` → **Package
settings** → Danger Zone → **Change visibility → Public**.
(New GHCR packages default to private; the VM pulls anonymously.)

## 1. OCI — create the Always-Free instance

The free shape is **`VM.Standard.A1.Flex`** (Ampere ARM, up to 4 OCPU /
24 GB total). NOT `VM.Standard.E2.1.Micro` — that's x86; our image is arm64.

1. Sign up at cloud.oracle.com/free. **Home region is permanent** — pick
   `ap-hyderabad-1` or `ap-mumbai-1` (closest to Bangalore; Cloudflare's
   CDN makes global latency a non-issue anyway).
2. Menu → **Compute → Instances → Create instance**
   - Name: `shinigami-rog`
   - Image: **Canonical Ubuntu 24.04** (select **aarch64** build)
   - Shape: **Ampere → VM.Standard.A1.Flex**, e.g. **2 OCPU / 12 GB**
     (half the free quota — leaves room for a second box later). Look for
     the "Always Free-eligible" badge.
   - Networking: create default VCN with a **public subnet**; **assign a
     public IPv4 address**.
   - SSH keys: paste YOUR personal public key (`cat ~/.ssh/id_ed25519.pub`
     on your Mac; `ssh-keygen -t ed25519` first if you don't have one).
   - Boot volume: default (47 GB) is fine.
3. **GOTCHA — "Out of capacity"**: A1 capacity fluctuates. Retry at
   different hours, try the other AD, or the other India region. Upgrading
   the account to Pay-As-You-Go (card on file, still $0 while within
   Always-Free limits) reliably unlocks capacity.
4. Open 443 in the cloud firewall: **VCN → your subnet → Security List →
   Add Ingress Rule**: Source `0.0.0.0/0`, protocol TCP, destination port
   **443**. (22 is already open by default.)
5. SSH in: `ssh ubuntu@<PUBLIC_IP>`

## 2. Harden + Docker (paste as one block, as ubuntu → sudo)

**GOTCHA — OCI Ubuntu images ship restrictive iptables rules** on top of the
security list; without the iptables lines below, 443 stays "connection
refused" even though the cloud rule is open.

```bash
sudo -s <<'EOF'
set -e
# packages + docker
apt-get update
apt-get install -y fail2ban unattended-upgrades netfilter-persistent
curl -fsSL https://get.docker.com | sh

# open 443 in the image's baked-in iptables (OCI gotcha)
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
netfilter-persistent save

# deploy user (CI ssh target)
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF6GF9oU02pmhnTOsdTqhNzeh4MMClPcK2/LpfekZe54 github-actions-deploy@shinigami-rog" > /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

# ssh hardening
printf 'PasswordAuthentication no\nPermitRootLogin no\n' > /etc/ssh/sshd_config.d/hardening.conf
systemctl restart ssh

# app directory
mkdir -p /opt/shinigami-rog/certs
cd /opt/shinigami-rog
curl -fsSLo compose.yml https://raw.githubusercontent.com/sivaguru94/sivaguru-ravi/master/deploy/compose.yml
curl -fsSLo tls.conf   https://raw.githubusercontent.com/sivaguru94/sivaguru-ravi/master/deploy/tls.conf
chown -R deploy:deploy /opt/shinigami-rog
EOF
```

## 3. Cloudflare (free plan)

1. dash.cloudflare.com → sign up → **Add a domain** → `shinigami-rog.cc`
   → Free plan.
2. **DNS records** (delete any scanned leftovers you don't recognize):
   - `A` | name `@` | content `<VM_PUBLIC_IP>` | **Proxied** (orange cloud)
   - `CNAME` | name `www` | content `shinigami-rog.cc` | **Proxied**
3. Cloudflare shows **two nameservers** → log in at your `.cc` registrar →
   replace the domain's nameservers with those two. (Takes minutes to a few
   hours; Cloudflare emails when active.)
4. **SSL/TLS → Overview** → set mode **Full (strict)**.
5. **SSL/TLS → Origin Server → Create Certificate** → accept defaults
   (RSA, 15 years, `shinigami-rog.cc` + `*.shinigami-rog.cc`):
   - copy the **Origin Certificate** → VM `/opt/shinigami-rog/certs/origin-cert.pem`
   - copy the **Private Key** → VM `/opt/shinigami-rog/certs/origin-key.pem`
   - `sudo chmod 600 /opt/shinigami-rog/certs/* && sudo chown -R deploy:deploy /opt/shinigami-rog/certs`
6. **SSL/TLS → Edge Certificates** → enable **Always Use HTTPS**.
   **Network** → enable **HTTP/3**. Optional: **Security → Bots → Bot
   Fight Mode** on.

## 4. First run + hand over to CI

```bash
cd /opt/shinigami-rog
sudo -u deploy docker compose pull
sudo -u deploy docker compose up -d
curl -sk https://localhost/healthz    # → ok
```
Then send Claude the VM public IP — remaining GitHub wiring
(`DEPLOY_HOST` secret, `DEPLOY_ENABLED=true` variable) is set from the
repo tooling, and every master push deploys itself from then on.
Already staged: `DEPLOY_SSH_KEY`, `DEPLOY_USER` secrets (private key backup
in gitignored `docs-private/`).

## Later hardening (optional, post-launch)
- Restrict 443 to Cloudflare IP ranges (https://www.cloudflare.com/ips/)
  in both the OCI security list and iptables.
- Install Tailscale on the VM and close public 22 entirely (SSH via tailnet;
  update `DEPLOY_HOST` to the tailnet name won't work from GitHub runners —
  keep 22 keys-only instead, or use tailscale with an auth key on runners).

## Rollback
```bash
TAG=<previous-sha> docker compose pull && TAG=<previous-sha> docker compose up -d
```
(previous tags listed under the repo's GHCR packages)
