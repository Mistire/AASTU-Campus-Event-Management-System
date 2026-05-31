FROM node:20-slim AS development

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies inside the build (Masterclass standard)
# This prevents host/container dependency drift
RUN npm install

# Copy source
COPY . .

# Default dev command (overridden by docker-compose)
CMD ["npm", "run", "dev"]

# ─── Stage 2: Production ──────────────────────────────────────────
FROM node:20-slim AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
# Copy only the built output from development stage
COPY --from=development /usr/src/app/next.config.ts ./
COPY --from=development /usr/src/app/public ./public
COPY --from=development /usr/src/app/.next ./.next
COPY --from=development /usr/src/app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
