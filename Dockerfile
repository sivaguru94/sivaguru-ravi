# Static-export + unprivileged nginx (deploy-plan.md §2): no Node.js in the
# final image. Base tags kept current by Dependabot (docker ecosystem).

FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
# lockfile-only, no lifecycle scripts (supply-chain hygiene; nothing we use
# needs install scripts — next/swc and sharp ship prebuilt binaries)
RUN npm ci --ignore-scripts
COPY . .
ENV NEXT_OUTPUT=export
RUN npm run build

# runtime: runs as uid 101, listens on 8080, ~no attack surface
FROM nginxinc/nginx-unprivileged:1.31-alpine
# base images lag Alpine security releases — pull in patched packages
# (first Trivy run caught 35 fixable HIGH/CRITICAL in the stale base)
USER root
RUN apk upgrade --no-cache
USER 101
COPY deploy/security-headers.conf /etc/nginx/security-headers.conf
COPY deploy/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
