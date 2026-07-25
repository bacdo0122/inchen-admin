# syntax=docker/dockerfile:1
# Build context = GỐC REPO (pnpm workspace), không phải apps/api.
#   docker build -f apps/api/Dockerfile -t inchem-api .

# ── base ──────────────────────────────────────────────────
FROM node:20-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
# openssl: Prisma cần; curl: healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate
WORKDIR /app

# ── deps: cache theo manifest, chỉ cài subtree của @inchem/api ──
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json        apps/api/
COPY apps/web/package.json        apps/web/
COPY apps/admin/package.json      apps/admin/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @inchem/api...

# ── builder ───────────────────────────────────────────────
FROM deps AS builder
COPY apps/api        apps/api
COPY packages/shared packages/shared
RUN pnpm --filter @inchem/api prisma:generate \
    && pnpm --filter @inchem/api build

# ── runner ────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
# Giữ nguyên đường dẫn /app để symlink của pnpm (node_modules/.pnpm) còn resolve được.
COPY --from=builder /app/node_modules            ./node_modules
COPY --from=builder /app/package.json            ./package.json
COPY --from=builder /app/pnpm-workspace.yaml     ./pnpm-workspace.yaml
COPY --from=builder /app/apps/api/node_modules   ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json   ./apps/api/package.json
COPY --from=builder /app/apps/api/tsconfig.json  ./apps/api/tsconfig.json
COPY --from=builder /app/apps/api/dist           ./apps/api/dist
COPY --from=builder /app/apps/api/prisma         ./apps/api/prisma
COPY apps/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /app/apps/api
USER node
EXPOSE 4000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
