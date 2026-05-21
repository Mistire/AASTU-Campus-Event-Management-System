# ─── Stage 1: Development / Build ────────────────────────────────────────────
FROM node:20-alpine AS development

# Give Node.js more heap so nest build doesn't OOM on small EC2 instances
# (t2.micro / t3.micro only have ~1GB RAM; TypeScript compilation is very hungry)
ENV NODE_OPTIONS="--max-old-space-size=512"

WORKDIR /usr/src/app

# Copy dependency manifests first for better layer caching
COPY package*.json ./

# Install all dependencies
RUN npm install --prefer-offline 2>/dev/null || npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS app with increased heap
RUN npm run build

# Default dev command (overridden by docker-compose)
CMD ["npm", "run", "start:dev"]

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
# Keep heap limit consistent in production runtime too
ENV NODE_OPTIONS="--max-old-space-size=512"

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies (skip devDeps to save memory + image size)
RUN npm install --omit=dev --prefer-offline 2>/dev/null || npm install --omit=dev

# Copy compiled output from build stage
COPY --from=development /usr/src/app/dist ./dist

# Copy generated Prisma client artefacts
COPY --from=development /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=development /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=development /usr/src/app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/main"]
