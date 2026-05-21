# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Compile Next.js production bundle inside Docker (prevents missing .next errors)
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-slim AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies (keeps image lightweight and avoids ENOSPC)
RUN npm install --omit=dev --prefer-offline 2>/dev/null || npm install --omit=dev

# Copy compiled files and configuration
COPY --from=builder /usr/src/app/next.config.ts ./
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next

EXPOSE 3000

CMD ["npm", "run", "start"]
