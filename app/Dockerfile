# syntax=docker/dockerfile:1.7

# CommonGround production image.
# Two entry points are selected at `docker run` / compose time:
#   - `next start`           — the web app
#   - `node ./dist/worker.js` — the pg-boss job worker (same image)
# See app/docker-compose.yml for the orchestration.

ARG NODE_VERSION=22.15.1

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
# Copy workspace manifests first for better layer caching.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY app/package.json ./app/
COPY site/package.json ./site/
RUN pnpm install --frozen-lockfile --filter app

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/node_modules ./app/node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY app/ ./app/
WORKDIR /app/app
ENV NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p public && pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
WORKDIR /app/app
COPY --from=builder --chown=nextjs:nodejs /app/app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/app/package.json ./package.json
# pnpm symlinks in app/node_modules point into the root .pnpm store — copy both
COPY --from=builder --chown=nextjs:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/app/drizzle ./drizzle
# The pg-boss worker runs from TypeScript source via tsx. The full src/ tree
# is needed so worker.ts can resolve its relative imports.
COPY --from=builder --chown=nextjs:nodejs /app/app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/app/tsconfig.json ./tsconfig.json
USER nextjs
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
