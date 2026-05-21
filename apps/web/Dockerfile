# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Compile Next.js production bundle inside Docker (outputs standalone build)
RUN npm run build

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
