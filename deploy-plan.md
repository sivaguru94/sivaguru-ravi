# Deployment Plan (M9) — shinigami-rog.cc

**Requirements (author, 2026-07-26):** cost-effective/free · Docker · secure
build + deploy · nginx welcome · CI/CD.

> **✅ Decisions (author, 2026-07-26):** Host = **Oracle Always-Free ARM VPS**
> (fallback Hetzner if signup fights back; Cloudflare Pages as the zero-ops
> escape hatch). Runtime = **static export + unprivileged nginx, no Node in
> prod**. Images must be built **linux/arm64** (GitHub's free arm64 runners
> or buildx).

**Governing fact:** the site is fully static — every route (`/`, 26 deep
links, 404, robots, sitemap) prerenders at build time. There is no server
logic. So we can ship a **pure static bundle in an nginx container with no
Node.js in production at all** — the smallest possible attack surface, and
exactly the Docker+nginx shape requested.

---

## 1. Options compared

| Option | Cost | Docker/nginx | Security posture | Ops burden |
|---|---|---|---|---|
| **A. Vercel Hobby** | $0 | ✗ | Good (managed, headers via config) | none |
| **B. Cloudflare Pages** | $0, unlimited bandwidth | ✗ | Good (managed + free WAF/CDN) | none |
| **C. GitHub Pages** | $0 | ✗ | **Weak — cannot set security headers** | none |
| **D. VPS + Docker/nginx + Cloudflare free** | €3.8–6/mo (Hetzner/DO) or **$0 on Oracle Cloud Always-Free ARM** | ✓ full | Excellent (you control everything; CF hides origin) | low-moderate |
| **E. Home server + Docker/nginx + Cloudflare Tunnel** | $0 | ✓ full | Good (no open ports, origin hidden) | tied to home uptime |

- **C is eliminated** (no header control — fails our own security bar).
- **A/B** are the zero-ops safety nets but don't exercise Docker/nginx.
- **D** hits every requirement. Oracle's Always-Free ARM tier (4 cores/24GB)
  makes it $0 if the signup works for you; Hetzner CX22 (~€3.8/mo) is the
  reliable paid fallback.
- **E** is genuinely free and fully Dockerized, but a portfolio that
  recruiters hit at 2am shouldn't depend on a home machine/WSL staying up.

**Recommendation: D** — VPS + Docker (static-export nginx image) + Cloudflare
free tier in front, with **B (Cloudflare Pages) as a later fallback** if the
VPS ever feels like a chore (the same repo deploys there in 10 minutes).

---

## 2. Runtime architecture (option D)

```
visitor ──HTTPS──▶ Cloudflare (free)          ──HTTPS──▶ VPS
                   · CDN cache / global edge             · docker: nginx-unprivileged
                   · WAF, bot fight, DDoS                · serves /usr/share/nginx/html (the export)
                   · TLS to visitor                      · security headers, gzip, cache rules
                   · hides origin IP                     · firewall: 443 only from CF IP ranges + SSH
```

- **TLS:** Cloudflare "Full (strict)" with a free CF Origin Certificate on
  nginx (15-yr validity, no certbot renewals to babysit).
- **DNS:** `shinigami-rog.cc` nameservers → Cloudflare (free); apex + www
  proxied (orange cloud).

### Docker image (multi-stage, no Node in prod)

```dockerfile
# build stage — pinned digest, lockfile-only install
FROM node:20-alpine@sha256:<digest> AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN NEXT_OUTPUT=export npm run build          # emits ./out

# runtime — unprivileged nginx, ~10MB of surface
FROM nginxinc/nginx-unprivileged:1.27-alpine@sha256:<digest>
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
# runs as uid 101, port 8080, read-only rootfs via compose
```

Compose hardening: `read_only: true`, `cap_drop: [ALL]`, `no-new-privileges`,
tmpfs for nginx cache/pid, `restart: unless-stopped`, port published only to
localhost if CF Tunnel, or 443 via the host nginx-less setup (CF origin cert
mounted read-only).

### nginx config owns in production what `next.config headers()` owns in dev

- Security headers: `X-Content-Type-Options`, `Content-Security-Policy:
  frame-ancestors 'none'`, `Referrer-Policy`, `Permissions-Policy`, plus
  **HSTS** (safe now that TLS is guaranteed).
- `server_tokens off`, gzip on, sane cache: hashed `/_next/static/*`
  immutable 1y; HTML + resume PDF `no-cache` (revalidate).
- `try_files $uri $uri.html $uri/index.html =404` with `error_page 404
  /404.html` → our terminal 404 works for any path.
- Optional rate limit (`limit_req`) — mostly redundant behind CF.

---

## 3. Repo changes required

1. `next.config.ts`: `output: process.env.NEXT_OUTPUT === "export" ? "export" : undefined`
   — dev/tests keep `next start` (and the `headers()` there), Docker builds
   the export. A prod smoke test asserts nginx serves the same headers, so
   the two can't silently drift.
2. `deploy/`: `Dockerfile`, `nginx.conf`, `compose.yml`, `.dockerignore`.
3. CI additions (below).
4. CLAUDE.md: deploy runbook pointer.

## 4. CI/CD pipeline (GitHub Actions, all free for public repos)

```
PR → existing gate (lint · build · budget · 58 e2e specs)          [exists]
merge to master:
  1. gate re-runs
  2. docker build → Trivy scan (fail on HIGH/CRITICAL) → push GHCR
     (ghcr.io/sivaguru94/shinigami-rog, tags: sha + latest)
  3. deploy: SSH (key in GH secrets, dedicated deploy user) →
     docker compose pull && docker compose up -d
  4. prod smoke: curl -f https://shinigami-rog.cc + header assertions
     + resume PDF content-type (small Playwright @prod suite)
rollback = redeploy previous sha tag (one command, documented in runbook)
```

Workflow security (extends current posture): `permissions: contents: read,
packages: write` only on the publish job; actions stay major-pinned; deploy
key restricted to the compose directory via `command=` in authorized_keys.

## 5. Server baseline (one-time hardening, ~30 min)

ufw (443 from Cloudflare ranges + SSH), SSH keys-only + no root login,
unattended-upgrades, fail2ban, Docker rootless or at minimum the
unprivileged-image + cap-drop combo above, Watchtower **not** used (pull is
CI-driven — no auto-pulling latest from the network).

## 6. Costs

| Item | Cost |
|---|---|
| Domain `shinigami-rog.cc` | already owned (renewal only) |
| Cloudflare free tier | $0 |
| GHCR + Actions (public repo) | $0 |
| VPS | $0 (Oracle free ARM) or ~€3.8/mo (Hetzner CX22) |
| **Total** | **$0–~€4/mo** |

## 7. Sequencing

1. Merge PR #2 → `master`.
2. Repo changes (§3) + image builds green in CI.
3. Provision VPS + hardening (§5); Cloudflare DNS + origin cert.
4. First manual deploy; verify headers/OG/robots/resume on the real domain.
5. Wire the CD workflow (§4); test rollback once, on purpose.
6. Release gates from the original plan: Lighthouse ≥95 on prod, real
   iPhone/iPad pass, OG preview, Search Console (DNS TXT).
