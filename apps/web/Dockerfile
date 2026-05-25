# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-slim AS builder

ENV NODE_OPTIONS="--max-old-space-size=512"

WORKDIR /usr/src/app

# NEXT_PUBLIC_* are inlined at build time — pass via docker compose build args
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=$NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

COPY . .

RUN --mount=type=cache,target=/usr/src/app/.next/cache \
    npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-slim AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/public ./apps/web/public
COPY --from=builder /usr/src/app/.next/static ./apps/web/.next/static

EXPOSE 3001

CMD ["node", "apps/web/server.js"]
