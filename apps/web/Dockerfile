# Monorepo context required: next.config.ts uses turbopack.root "../../" for the repo root.
# Building with context ./apps/web alone breaks Next standalone output (missing server.js).

# ─── Stage 1: Dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/

RUN npm ci -w web

# ─── Stage 2: Builder ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web ./apps/web

COPY --from=deps /app/node_modules ./node_modules

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=$NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

ARG NODE_MEMORY_MB=4096
ENV NODE_OPTIONS="--max-old-space-size=${NODE_MEMORY_MB}"

WORKDIR /app/apps/web
RUN npm run build

# ─── Stage 3: Development (live-reload) ───────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web ./apps/web
RUN npm ci -w web

WORKDIR /app/apps/web
CMD ["npm", "run", "dev"]

# ─── Stage 4: Production (minimal standalone) ─────────────────────
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

WORKDIR /usr/src/app

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

RUN apk add --no-cache wget

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

RUN test -f apps/web/server.js \
  && test -d node_modules \
  || (echo "ERROR: Next standalone incomplete — ensure Docker build context is monorepo root (see Dockerfile header)" >&2; ls -la; ls -la apps/web 2>/dev/null; exit 1)

USER nextjs

EXPOSE 3001

CMD ["node", "apps/web/server.js"]
