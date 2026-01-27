FROM node:20-alpine AS base

WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
RUN yarn install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend ./backend
COPY package.json yarn.lock ./
WORKDIR /app/backend
RUN npx prisma generate
RUN yarn build

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/prisma ./prisma

USER nestjs

EXPOSE 9000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
