# Static-export + unprivileged nginx (deploy-plan.md §2): no Node.js in the
# final image. Base tags kept current by Dependabot (docker ecosystem).

FROM node:26-alpine AS build
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
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY deploy/security-headers.conf /etc/nginx/security-headers.conf
COPY deploy/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
