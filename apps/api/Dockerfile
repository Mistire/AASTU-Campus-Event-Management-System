# ─── Stage 1: Development / Build ────────────────────────────────────────────
FROM node:20-alpine AS builder

ENV NODE_OPTIONS="--max-old-space-size=512"

WORKDIR /usr/src/app

COPY package*.json ./
# Cache npm downloads to prevent fetching all packages from scratch
RUN --mount=type=cache,target=/root/.npm \
    npm install --prefer-offline 2>/dev/null || npm install

COPY . .

# Generate Prisma Client and build the app
RUN npx prisma generate
RUN npm run build

# Prune devDependencies (leaves only production packages in node_modules)
RUN npm prune --production

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NODE_OPTIONS="--max-old-space-size=512"

WORKDIR /usr/src/app

COPY package*.json ./

# Copy compiled app, pruned production node_modules, and Prisma schemas
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma
COPY prisma.config.js ./prisma.config.js

EXPOSE 4000

CMD ["node", "dist/src/main.js"]
