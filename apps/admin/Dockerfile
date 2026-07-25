# syntax=docker/dockerfile:1
# Build context = GỐC REPO (pnpm workspace).
#   docker build -f apps/admin/Dockerfile -t inchem-admin .

# ── base ──────────────────────────────────────────────────
FROM node:20-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate
WORKDIR /app

# ── deps ──────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json        apps/api/
COPY apps/web/package.json        apps/web/
COPY apps/admin/package.json      apps/admin/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @inchem/admin...

# ── builder ───────────────────────────────────────────────
FROM deps AS builder
# Admin luôn `cache: 'no-store'` nên không prerender gọi API, nhưng src/lib/env.ts
# vẫn kiểm tra biến này lúc build → phải có giá trị, nếu không build fail.
ARG API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL \
    NODE_ENV=production
COPY apps/admin      apps/admin
COPY packages/shared packages/shared
# Admin chưa có asset tĩnh nào. Tạo sẵn thư mục để COPY ở stage runner luôn có
# đích tồn tại, kể cả khi apps/admin/public không nằm trong git.
RUN mkdir -p apps/admin/public
RUN pnpm --filter @inchem/admin build

# ── runner ────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME=0.0.0.0
# --chown: xem ghi chú ở apps/web/Dockerfile. Admin dùng cache: 'no-store' nên ít
# ghi hơn, nhưng Next vẫn cần .next/cache cho fetch cache và ảnh tối ưu.
COPY --from=builder --chown=node:node /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/admin/.next/static     ./apps/admin/.next/static
COPY --from=builder --chown=node:node /app/apps/admin/public           ./apps/admin/public
RUN mkdir -p apps/admin/.next/cache && chown -R node:node apps/admin/.next
USER node
EXPOSE 3001
CMD ["node", "apps/admin/server.js"]
