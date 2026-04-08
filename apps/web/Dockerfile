FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx turbo run build --filter=@bling-orders/web

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web ./
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "dev"]
