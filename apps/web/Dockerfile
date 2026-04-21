# ─── Stage 1: Dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --prefer-offline

# ─── Stage 2: Builder ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the Next.js app (output: standalone is set in next.config.ts)
RUN npm run build

# ─── Stage 3: Development (live-reload) ───────────────────────────
FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]

# ─── Stage 4: Production (minimal standalone) ─────────────────────
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

WORKDIR /usr/src/app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy only the standalone output (no node_modules needed at runtime)
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/public ./public

USER nextjs

EXPOSE 3001

CMD ["node", "server.js"]
