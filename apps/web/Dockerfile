# syntax=docker/dockerfile:1
# Build context = GỐC REPO (pnpm workspace).
#   docker build -f apps/web/Dockerfile -t inchem-web .

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
    pnpm install --frozen-lockfile --filter @inchem/web...

# ── builder ───────────────────────────────────────────────
FROM deps AS builder
# Các trang dùng ISR (revalidate = 30) nên Next PRERENDER lúc build → build sẽ
# gọi thật vào API. Vì vậy build-arg này phải là URL API CÔNG KHAI đang chạy,
# không phải hostname nội bộ http://api:4000 (runner GitHub không thấy được).
ARG API_BASE_URL
# NEXT_PUBLIC_* bị "nướng" vào bundle lúc build, đổi sau phải build lại image.
ARG NEXT_PUBLIC_SITE_URL
ENV API_BASE_URL=$API_BASE_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NODE_ENV=production
COPY apps/web        apps/web
COPY packages/shared packages/shared
RUN pnpm --filter @inchem/web build

# ── runner ────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# outputFileTracingRoot = gốc repo → cấu trúc standalone giữ nguyên apps/web/...
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder /app/apps/web/public           ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
