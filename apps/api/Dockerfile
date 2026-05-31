# ─── Stage 1: Development ────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies inside the build (Masterclass standard)
RUN npm install

# Copy source
COPY . .

# Generate Prisma client (uses the already-present @prisma/client)
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# Default dev command (overridden by docker-compose command: field)
CMD ["npm", "run", "start:dev"]

# ─── Stage 2: Production ──────────────────────────────────────────
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
# Copy only the prod-relevant node_modules from the development stage
COPY --from=development /usr/src/app/node_modules ./node_modules

# Copy compiled output
COPY --from=development /usr/src/app/dist ./dist
# Copy generated Prisma client
COPY --from=development /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=development /usr/src/app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/main"]
