# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-slim AS builder

ENV NODE_OPTIONS="--max-old-space-size=512"

WORKDIR /usr/src/app

COPY package*.json ./
# Cache the npm downloads to prevent downloading packages from scratch every build
RUN --mount=type=cache,target=/root/.npm \
    npm install

COPY . .

# Cache the Next.js compilation cache (speeds up successive builds from 11m to under 1m)
RUN --mount=type=cache,target=/usr/src/app/.next/cache \
    npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-slim AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy the standalone server and static assets from builder (no npm install required here!)
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/public ./apps/web/public
COPY --from=builder /usr/src/app/.next/static ./apps/web/.next/static

EXPOSE 3000

# Start Next.js using the standalone server script
CMD ["node", "apps/web/server.js"]
